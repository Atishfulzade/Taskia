import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Copy,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import AddTaskPopup from "../component/AddTaskPopup";
import requestServer from "@/utils/requestServer";
import { deleteTask, updateTask } from "@/store/taskSlice";

const TaskDetail = () => {
  const { customId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  console.log(customId);

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [assignee, setAssignee] = useState(null);
  const [assigner, setAssigner] = useState(null);

  const statuses = useSelector((state) => state.status.statuses);
  const projectMembers = useSelector(
    (state) => state.project.currentProject?.member || []
  );
  const members = useSelector((state) => state.project.members || []);

  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await requestServer(`/task/t/${customId}`);
        setTask(res.data);
        setEditedTask(res.data);
      } catch (error) {
        console.error("Error fetching task:", error);
        toast.error("Failed to load task details");
        navigate("/tasks");
      } finally {
        setLoading(false);
      }
    };

    if (customId) {
      fetchTask();
    }
  }, [customId]);

  // Find assignee and assigner
  useEffect(() => {
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

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditing) {
      // Discard changes
      setEditedTask(task);
    }
    setIsEditing(!isEditing);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save changes
  const saveChanges = async () => {
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
  };

  // Delete task
  const deleteTaskHandler = async () => {
    try {
      setDeleteLoading(true);
      await requestServer(`task/delete/${task._id}`);
      dispatch(deleteTask(task._id));
      toast.success("Task deleted successfully");
      navigate("/tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setDeleteLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Copy custom ID
  const copyCustomId = () => {
    if (task?.customId) {
      navigator.clipboard.writeText(task.customId);
      toast.success("Custom ID copied to clipboard");
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30";
      case "No":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30";
      default:
        const hash = priority.split("").reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        const hue = Math.abs(hash % 360);
        return `bg-[hsl(${hue},85%,95%)] text-[hsl(${hue},75%,35%)] dark:bg-[hsl(${hue},70%,15%)] dark:text-[hsl(${hue},70%,70%)] border-[hsl(${hue},75%,85%)] dark:border-[hsl(${hue},70%,25%)]`;
    }
  };

  // Get status badge color
  const getStatusBadge = () => {
    if (!task?.status) return null;

    const status = statuses.find((s) => s._id === task.status);
    if (!status) return null;

    return <Badge className={status.primaryColor}>{status.title}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-violet-800 dark:text-violet-300 font-medium">
            Loading task details...
          </p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Task not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/tasks")}
          className="text-violet-700 hover:text-violet-800 hover:bg-violet-100 dark:text-violet-300 dark:hover:text-violet-200 dark:hover:bg-violet-900/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditPopupOpen(true)}
            className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800/30 dark:text-violet-300 dark:hover:bg-violet-900/20"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit in Popup
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
      </div>

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
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/30 cursor-pointer"
                      onClick={copyCustomId}
                    >
                      ID: {task.customId}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyCustomId}
                      className="h-6 w-6 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copy ID</span>
                    </Button>
                  </div>
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

            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEditMode}
                className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800/30 dark:text-violet-300 dark:hover:bg-violet-900/20"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
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
              </div>
            )}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Task Popup */}
      <AddTaskPopup
        open={isEditPopupOpen}
        onOpenChange={setIsEditPopupOpen}
        taskData={task}
        isEdit={true}
        showStatus={true}
        showPriority={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskDetail;
