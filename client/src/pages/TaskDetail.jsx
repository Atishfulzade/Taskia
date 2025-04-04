import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Clock,
  Edit2,
  FileText,
  Flag,
  Paperclip,
  Tag,
  Trash2,
  User,
  CheckSquare,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Loader2,
  Eye,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import requestServer from "@/utils/requestServer";
import { deleteTask, updateTask } from "@/store/taskSlice";
import useProjectMembers from "@/hooks/useProjectMembers";
import { setCurrentProject } from "@/store/projectSlice";
import ShareDialog from "../component/SharePopup";
import AnimatedLogoLoader from "@/component/AnimatedLogoLoader";

const TaskDetail = () => {
  const { customId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get current project from Redux state
  const currentProject = useSelector((state) => state.project.currentProject);
  const statuses = useSelector((state) => state.status.statuses);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Share dialog state and access level
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [accessLevel, setAccessLevel] = useState("view"); // Default to view for safety

  // Use project members hook with correct parameters
  const { members, loading: membersLoading } = useProjectMembers(
    currentProject?._id
  );

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [assignee, setAssignee] = useState(null);
  const [assigner, setAssigner] = useState(null);
  const [error, setError] = useState(null);

  // Memoized function to find assignee and assigner
  const updateAssigneeAndAssigner = useCallback(() => {
    if (task && members.length > 0) {
      const foundAssignee = members.find(
        (member) => member._id === task.assignedTo
      );
      const foundAssigner = members.find(
        (member) => member._id === task.assignedBy
      );
      setAssignee(foundAssignee);
      setAssigner(foundAssigner);
    }
  }, [task, members]);

  // Fetch task details - modified to handle shared links
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get permission from URL hash (#view or #edit)
        const hash = location.hash.substring(1);
        const permission = hash === "view" || hash === "edit" ? hash : "view";
        setAccessLevel(permission);

        let response;

        if (isAuthenticated) {
          // Authenticated user - try to get task directly
          try {
            response = await requestServer(`task/t/${customId}`);
            setAccessLevel("edit"); // Authenticated users with direct access get edit by default
          } catch (authError) {
            // If direct access fails, try shared link
            if (authError.response?.status === 403) {
              response = await requestServer(
                `task/shared/${customId}?permission=${permission}`
              );
            } else {
              throw authError;
            }
          }
        } else {
          // Unauthenticated user - must use shared link
          response = await requestServer(
            `task/shared/${customId}?permission=${permission}`
          );
        }

        if (!response.data) throw new Error("Task not found");

        setTask(response.data);
        setEditedTask(response.data);

        // If task has a project, fetch project details
        if (
          response.data.projectId &&
          (!currentProject || currentProject._id !== response.data.projectId)
        ) {
          try {
            const projectRes = await requestServer(
              `project/get/${response.data.projectId}`
            );
            if (projectRes.data) {
              dispatch(setCurrentProject(projectRes.data));
            }
          } catch (projectError) {
            console.error("Error fetching task's project:", projectError);
          }
        }
      } catch (error) {
        console.error("Error fetching task:", error);

        if (error.response?.status === 401) {
          setError("Authentication required");
          toast.error("Please log in to view this task");
        } else if (
          error.response?.status === 403 ||
          error.response?.data?.message ===
            "You are not authorized to perform this action!"
        ) {
          setError("Unauthorized");
          toast.error("You don't have permission to view this task");
        } else {
          setError("Task not found");
          toast.error("Failed to load task details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (customId) {
      fetchTask();
    }
  }, [customId, currentProject, dispatch, isAuthenticated, location.hash]);

  // Update assignee and assigner when task or members change
  useEffect(() => {
    updateAssigneeAndAssigner();
  }, [updateAssigneeAndAssigner]);

  // Handle edit mode toggle
  const toggleEditMode = useCallback(() => {
    if (accessLevel !== "edit") {
      toast.error("You only have view access to this task");
      return;
    }

    if (isEditing) {
      setEditedTask(task);
    }
    setIsEditing(!isEditing);
  }, [isEditing, task, accessLevel]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle select changes
  const handleSelectChange = useCallback((name, value) => {
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Save changes
  const saveChanges = useCallback(async () => {
    if (accessLevel !== "edit") {
      toast.error("You don't have permission to edit this task");
      return;
    }

    try {
      setSaveLoading(true);
      const res = await requestServer(`task/update/${task._id}`, editedTask);
      dispatch(updateTask(res.data));
      setTask(res.data);
      setIsEditing(false);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setSaveLoading(false);
    }
  }, [editedTask, task, dispatch, accessLevel]);

  // Delete task
  const deleteTaskHandler = useCallback(async () => {
    if (accessLevel !== "edit") {
      toast.error("You don't have permission to delete this task");
      return;
    }

    try {
      setDeleteLoading(true);
      await requestServer(`task/delete/${task._id}`);
      dispatch(deleteTask(task._id));
      toast.success("Task deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setDeleteLoading(false);
      setIsDeleteDialogOpen(false);
    }
  }, [dispatch, navigate, task, accessLevel]);

  // Get priority badge color
  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30";
      case "No":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30";
      default:
        const hash =
          priority?.split("").reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
          }, 0) || 0;
        const hue = Math.abs(hash % 360);
        return `bg-[hsl(${hue},85%,95%)] text-[hsl(${hue},75%,35%)] dark:bg-[hsl(${hue},70%,15%)] dark:text-[hsl(${hue},70%,70%)] border-[hsl(${hue},75%,85%)] dark:border-[hsl(${hue},70%,25%)]`;
    }
  }, []);

  // Get status badge
  const getStatusBadge = useCallback(() => {
    if (!task?.status) return null;

    const status = statuses.find((s) => s._id === task.status);
    if (!status) return null;

    return (
      <Badge className={status.primaryColor || "bg-gray-100 text-gray-800"}>
        {status.title}
      </Badge>
    );
  }, [task, statuses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <AnimatedLogoLoader />
      </div>
    );
  }

  if (error === "Authentication required") {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to view this task.
          </p>
        </div>
      </div>
    );
  }

  if (error === "Unauthorized") {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have permission to view this task.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 darkk:text-gray-200 mb-2">
            Task not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 h-[95vh] overflow-y-scroll">
      {/* Share Dialog - only show for users with edit access */}
      {accessLevel === "edit" && (
        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          resource={task}
          resourceType="task"
        />
      )}

      {/* Access level indicator */}
      <div className="mb-4 flex items-center justify-end">
        <Badge variant="outline" className="flex items-center gap-1">
          {accessLevel === "edit" ? (
            <>
              <Edit2 className="h-3 w-3" />
              <span>Edit Access</span>
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              <span>View Only</span>
            </>
          )}
        </Badge>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="text-violet-700 hover:text-violet-800 hover:bg-violet-100 dark:text-violet-300 dark:hover:text-violet-200 dark:hover:bg-violet-900/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isAuthenticated ? "Back to Tasks" : "Back to Home"}
        </Button>

        {accessLevel === "edit" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(true)}
              className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800/30 dark:text-violet-300 dark:hover:bg-violet-900/20"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Task
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Add warning for view-only access when trying to edit */}
      {isEditing && accessLevel !== "edit" && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
          <p className="text-yellow-800 dark:text-yellow-200">
            You only have view access to this task. Contact the owner for edit
            permissions.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleEditMode}
            className="mt-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 dark:border-yellow-800/30 dark:text-yellow-300 dark:hover:bg-yellow-900/20"
          >
            Cancel Edit
          </Button>
        </div>
      )}

      <Card className="border-violet-200 dark:border-violet-800/30 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge()}
                <Badge
                  variant="outline"
                  className={`${getPriorityColor(task.priority)}`}
                >
                  {task.priority} Priority
                </Badge>
                {task.customId && (
                  <Badge
                    variant="outline"
                    className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/30"
                  >
                    ID: {task.customId}
                  </Badge>
                )}
              </div>
              {isEditing ? (
                <Input
                  name="title"
                  value={editedTask.title || ""}
                  onChange={handleInputChange}
                  className="text-xl font-bold mb-2 bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 focus-visible:ring-violet-500/50"
                />
              ) : (
                <CardTitle className="text-2xl font-bold text-violet-900 dark:text-violet-200">
                  {task.title}
                </CardTitle>
              )}

              <CardDescription className="text-violet-700/70 dark:text-violet-300/70 flex items-center gap-2">
                Created by {assigner?.name || "Unknown"} •
                {task.createdAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                accessLevel === "edit" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleEditMode}
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800/30 dark:text-red-300 dark:hover:bg-red-900/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={saveChanges}
                      disabled={saveLoading}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                ) : null
              ) : (
                accessLevel === "edit" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleEditMode}
                    className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800/30 dark:text-violet-300 dark:hover:bg-violet-900/20"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Description
                </h3>
                {isEditing ? (
                  <Textarea
                    name="description"
                    value={editedTask.description || ""}
                    onChange={handleInputChange}
                    placeholder="Add a description..."
                    className="min-h-[120px] bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 focus-visible:ring-violet-500/50"
                  />
                ) : (
                  <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30 min-h-[80px]">
                    {task.description ? (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {task.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No description provided
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Subtasks */}
              {task.subTask && task.subTask.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                    <CheckSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    Subtasks ({task.subTask.length})
                  </h3>
                  <div className="space-y-3">
                    {task.subTask.map((subtask, index) => (
                      <Card
                        key={index}
                        className="bg-violet-50/50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-800/30 shadow-sm"
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium text-violet-800 dark:text-violet-300 mb-1">
                            {subtask.title}
                          </h4>
                          {subtask.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {subtask.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {task.attachedFile && task.attachedFile.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                    <Paperclip className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    Attachments ({task.attachedFile.length})
                  </h3>
                  <div className="space-y-2">
                    {task.attachedFile.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 bg-violet-50/80 dark:bg-violet-950/30 rounded-md group hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all border border-violet-100 dark:border-violet-800/30"
                      >
                        <a
                          href={file.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm truncate max-w-[300px] hover:underline flex items-center gap-2 text-violet-700 dark:text-violet-300"
                        >
                          <FileText className="h-4 w-4 flex-shrink-0 text-violet-600 dark:text-violet-400" />
                          <span className="truncate">{file.fileName}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assignee */}
              <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Assignee
                </h3>

                {isEditing ? (
                  <Select
                    value={editedTask.assignedTo || ""}
                    onValueChange={(value) =>
                      handleSelectChange("assignedTo", value)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 focus-visible:ring-violet-500/50">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-violet-200 dark:bg-violet-800 flex items-center justify-center text-violet-700 dark:text-violet-300 font-medium">
                      {assignee?.name?.charAt(0) || "?"}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {assignee?.name || "Unassigned"}
                    </span>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Due Date
                </h3>

                {isEditing ? (
                  <Input
                    type="date"
                    name="dueDate"
                    value={editedTask.dueDate || ""}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 focus-visible:ring-violet-500/50"
                  />
                ) : (
                  <div className="text-gray-800 dark:text-gray-200">
                    {task.dueDate ? (
                      new Date(task.dueDate).toLocaleDateString()
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 italic">
                        No due date set
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                  <Flag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Priority
                </h3>

                {isEditing ? (
                  <Select
                    value={editedTask.priority || "No"}
                    onValueChange={(value) =>
                      handleSelectChange("priority", value)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 focus-visible:ring-violet-500/50">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant="outline"
                    className={`${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </Badge>
                )}
              </div>

              {/* Status */}
              <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Status
                </h3>

                {isEditing ? (
                  <Select
                    value={editedTask.status || ""}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 focus-visible:ring-violet-500/50">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status._id} value={status._id}>
                          {status.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  getStatusBadge()
                )}
              </div>

              {/* Collaborators - Show if there are any */}
              {task.collaborators && task.collaborators.length > 0 && (
                <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                  <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    Collaborators
                  </h3>
                  <div className="space-y-2">
                    {task.collaborators.map((collab, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-800 flex items-center justify-center text-violet-700 dark:text-violet-300 text-xs font-medium">
                            {collab.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm truncate max-w-[150px]">
                            {collab.email}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {collab.permission}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-800/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 dark:border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTaskHandler}
              disabled={deleteLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Task"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskDetail;
