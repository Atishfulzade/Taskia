"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentProject, setProjects } from "../store/projectSlice";
import requestServer from "../utils/requestServer";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// UI Components
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/Dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { UserSearch } from "../component/UserSearch";

// Icons
import {
  Edit2,
  Trash2,
  Plus,
  Save,
  X,
  Users,
  CheckCircle,
  ArrowLeft,
  Clock,
  Loader2,
  Copy,
  FileText,
  Building,
} from "lucide-react";

const ProjectDetailsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const userId = useSelector((state) => state.user?.user?.data?._id);
  const currentProject = useSelector((state) => state.project.currentProject);

  const [isEditing, setIsEditing] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (currentProject._id) {
      fetchProjectDetails();
    }
  }, [currentProject._id]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const res = await requestServer(`project/get/${currentProject._id}`, {
        userId,
      });
      dispatch(setCurrentProject(res.data));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast.error("Failed to load project details");
      setIsLoading(false);
      navigate("/dashboard");
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: currentProject?.title || "",
      description: currentProject?.description || "",
      member: currentProject?.member || [],
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string(),
      member: Yup.array().min(1, "At least one member is required"),
    }),
    onSubmit: async (values) => {
      try {
        setSaveLoading(true);
        const res = await requestServer(`project/update/${projectId}`, {
          ...values,
          userId,
        });

        dispatch(setCurrentProject(res.data.updatedProject));
        dispatch(setProjects(res.data.allProjects));
        toast.success("Project updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating project:", error);
        if (error.response?.data?.message === "Token not found") {
          toast.error("Invalid token! Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error(
            error.response?.data?.message || "Failed to update project"
          );
        }
      } finally {
        setSaveLoading(false);
      }
    },
  });

  const handleDeleteProject = async () => {
    try {
      setDeleteLoading(true);
      const res = await requestServer(`project/delete/${projectId}`, {
        userId,
      });
      dispatch(setProjects(res.data.allProjects));
      toast.success("Project deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleteLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const updatedMembers = currentProject.member.filter(
        (m) => m._id !== memberId
      );

      const res = await requestServer(`project/update/${projectId}`, {
        title: currentProject.title,
        description: currentProject.description,
        member: updatedMembers.map((m) => m._id),
        userId,
      });

      dispatch(setCurrentProject(res.data.updatedProject));
      dispatch(setProjects(res.data.allProjects));
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleUserSelect = (selectedUserIds) => {
    formik.setFieldValue("member", selectedUserIds);
  };

  // Copy project ID
  const copyProjectId = () => {
    if (currentProject?._id) {
      navigator.clipboard.writeText(currentProject._id);
      toast.success("Project ID copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-violet-800 dark:text-violet-300 font-medium">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Project not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const createdDate = new Date(currentProject.createdAt).toLocaleDateString();
  const updatedDate = new Date(currentProject.updatedAt).toLocaleDateString();

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/projects")}
          className="text-violet-700 hover:text-violet-800 hover:bg-violet-100 dark:text-violet-300 dark:hover:text-violet-200 dark:hover:bg-violet-900/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        <Button
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Project
        </Button>
      </div>

      <Card className="border-violet-200 dark:border-violet-800/30 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/30">
                  Project
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30"
                >
                  Active
                </Badge>
                {currentProject._id && (
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/30 cursor-pointer"
                      onClick={copyProjectId}
                    >
                      ID: {currentProject.customId.substring(0, 8)}...
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyProjectId}
                      className="h-6 w-6 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copy ID</span>
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    id="title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="text-2xl font-bold bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 focus-visible:ring-violet-500/50"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.title}
                    </p>
                  )}
                </div>
              ) : (
                <CardTitle className="text-2xl font-bold text-violet-900 dark:text-violet-200">
                  {currentProject.title}
                </CardTitle>
              )}

              <CardDescription className="text-violet-700/70 dark:text-violet-300/70 flex items-center gap-2 mt-1">
                Created on {createdDate} •
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Last updated on {updatedDate}
                </span>
              </CardDescription>
            </div>

            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
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
                  onClick={() => setIsEditing(false)}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800/30 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={formik.handleSubmit}
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
                      <Save className="mr-2 h-4 w-4" />
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
                  <div className="space-y-2">
                    <Textarea
                      id="description"
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      rows={4}
                      className="min-h-[120px] bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 focus-visible:ring-violet-500/50"
                      placeholder="Enter project description"
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <p className="text-red-500 text-xs">
                          {formik.errors.description}
                        </p>
                      )}
                  </div>
                ) : (
                  <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30 min-h-[80px]">
                    {currentProject.description ? (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {currentProject.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No description provided
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Members */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    Project Members ({currentProject.member?.length || 0})
                  </h3>

                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddMemberOpen(true)}
                      className="h-8 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800/30 dark:text-violet-300 dark:hover:bg-violet-900/20"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add Members
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentProject.member?.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-3 bg-violet-50/80 dark:bg-violet-950/30 rounded-lg border border-violet-100 dark:border-violet-800/30 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9 border-2 border-violet-200 dark:border-violet-800">
                          <AvatarImage
                            src={member.profilePic}
                            alt={member.name}
                          />
                          <AvatarFallback className="bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300">
                            {member.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {member.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member._id)}
                          className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove member</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {currentProject.member?.length === 0 && (
                  <div className="text-center py-8 bg-violet-50/50 dark:bg-violet-950/20 rounded-lg border border-violet-100 dark:border-violet-800/30">
                    <Users className="h-12 w-12 mx-auto mb-3 text-violet-400 dark:text-violet-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No members added to this project yet
                    </p>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddMemberOpen(true)}
                        className="mt-3 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800/30 dark:text-violet-300 dark:hover:bg-violet-900/20"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add Members
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                  <Building className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Project Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created On
                    </p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      {createdDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last Updated
                    </p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      {updatedDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Member Count */}
              <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Team Size
                </h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-violet-200 dark:bg-violet-800 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-lg">
                    {currentProject.member?.length || 0}
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      {currentProject.member?.length || 0} Members
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentProject.member?.length === 0
                        ? "No members yet"
                        : currentProject.member?.length === 1
                        ? "1 person working on this project"
                        : `${currentProject.member?.length} people working on this project`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                <h3 className="text-sm font-medium text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="w-full justify-start border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800/30 dark:text-violet-300 dark:hover:bg-violet-900/20"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Project Details
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddMemberOpen(true)}
                      className="w-full justify-start border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800/30 dark:text-violet-300 dark:hover:bg-violet-900/20"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Team Members
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800/30 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-violet-200 dark:border-violet-800/30">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">
              Add Members
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Search and select members to add to this project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <UserSearch
              onSelectUser={handleUserSelect}
              defaultValue={formik.values.member}
            />

            {formik.touched.member && formik.errors.member && (
              <p className="text-red-500 text-xs">{formik.errors.member}</p>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddMemberOpen(false)}
                className="border-gray-200 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  formik.handleSubmit();
                  setIsAddMemberOpen(false);
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="border-red-200 dark:border-red-800/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 dark:border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleteLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetailsPage;
