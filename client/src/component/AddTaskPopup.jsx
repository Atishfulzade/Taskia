import React, { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Paperclip, X, Loader2, Plus, ChevronDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addTask, updateTask } from "../store/taskSlice";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";

// Define the form schema with Zod
const taskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  priority: z.string(),
  assignedTo: z.string().min(1, { message: "Assignee is required" }),
  dueDate: z.string().optional(),
  status: z.string(),
  projectId: z.string(),
  assignedBy: z.string(),
  subTask: z.array(
    z.object({
      title: z.string().min(1, { message: "Subtask title is required" }),
      description: z.string().optional(),
    })
  ),
  attachedFile: z.array(
    z.object({
      fileName: z.string(),
      link: z.string(),
    })
  ),
});

export function AddTaskPopup({
  open,
  onOpenChange,
  currentStatus,
  taskData,
  isEdit,
}) {
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [members, setMembers] = useState([]);
  const [isFormDisabled, setIsFormDisabled] = useState(isEdit); // Disable form initially in edit mode
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const userId = useSelector((state) => state.user.user._id);
  const projectMembers = useSelector(
    (state) => state.project.currentProject?.member
  );
  console.log(taskData);

  // Get default values based on edit mode
  const getDefaultValues = () => {
    if (isEdit) {
      return {
        title: taskData?.title || "",
        description: taskData?.description || "",
        priority: taskData?.priority || "No",
        status: currentStatus?._id || taskData?.status || "",
        assignedTo: taskData?.assignedTo || "",
        assignedBy: taskData?.assignedBy || userId,
        projectId: projectId || "",
        dueDate: taskData?.dueDate || "",
        subTask: taskData?.subTask || [],
        attachedFile: taskData?.attachedFile || [],
      };
    }

    return {
      title: "",
      description: "",
      priority: "No",
      status: currentStatus?._id || "",
      assignedTo: "",
      assignedBy: userId,
      projectId: projectId || "",
      dueDate: "",
      subTask: [],
      attachedFile: [],
    };
  };

  // Initialize the form with default values
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: getDefaultValues(),
  });

  // Update required form values when dependencies change
  useEffect(() => {
    // Only update these if they changed and are not already set
    if (projectId && !form.getValues("projectId")) {
      form.setValue("projectId", projectId);
    }

    if (currentStatus?._id && !form.getValues("status")) {
      form.setValue("status", currentStatus._id);
    }

    if (userId && !form.getValues("assignedBy")) {
      form.setValue("assignedBy", userId);
    }
  }, [projectId, currentStatus, userId, form]);

  // Function to upload a file to Cloudinary
  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Taskia"); // Replace with your Cloudinary upload preset

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dqizv2ags/upload", // Replace with your Cloudinary cloud name
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.secure_url; // Return the uploaded file URL
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  // Handle multiple file uploads in parallel
  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileLoading(true);
      const fileUrls = [...form.getValues("attachedFile")];

      try {
        // Process files in parallel
        const uploadPromises = Array.from(files).map(async (file) => {
          const url = await uploadFileToCloudinary(file);
          if (url) {
            return { fileName: file.name, link: url };
          }
          return null;
        });

        const results = await Promise.all(uploadPromises);
        const validUploads = results.filter(Boolean);

        form.setValue("attachedFile", [...fileUrls, ...validUploads]);
      } catch (error) {
        console.error("Error uploading files:", error);
        showToast("Failed to upload files", "error");
      } finally {
        setFileLoading(false);
      }
    }
  };

  // Add a new subtask
  const addSubtask = () => {
    const currentSubtasks = form.getValues("subTask") || [];
    form.setValue("subTask", [
      ...currentSubtasks,
      { title: "", description: "" },
    ]);
  };

  // Remove a subtask
  const removeSubtask = (index) => {
    const currentSubtasks = form.getValues("subTask");
    form.setValue(
      "subTask",
      currentSubtasks.filter((_, i) => i !== index)
    );
  };

  // Remove an attached file
  const removeFile = (index) => {
    const currentFiles = form.getValues("attachedFile");
    form.setValue(
      "attachedFile",
      currentFiles.filter((_, i) => i !== index)
    );
  };

  // Form submission handler
  const onSubmit = async (values) => {
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await requestServer(`task/update/${taskData._id}`, values);
        dispatch(updateTask(res.data));
      } else {
        res = await requestServer("task/add", values);
        dispatch(addTask(res.data));
      }
      showToast(res.data.message || "Task saved successfully", "success");
      onOpenChange(false);
      form.reset(getDefaultValues()); // Reset with proper default values
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.data?.message === "Token not found") {
        showToast("Invalid token! Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("userState");
        navigate("/authenticate");
      } else {
        showToast(
          error.response?.data?.message || "Something went wrong",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch project members
  const fetchMembers = useCallback(async () => {
    if (!projectMembers || projectMembers.length === 0) return;

    setMembersLoading(true);
    try {
      const responses = await Promise.all(
        projectMembers.map((member) => requestServer(`user/u/${member}`))
      );

      const membersData = responses.map((res) => res.data);

      if (Array.isArray(membersData)) {
        setMembers(membersData);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      showToast("Failed to fetch project members", "error");
    } finally {
      setMembersLoading(false);
    }
  }, [projectMembers]);

  useEffect(() => {
    if (open && projectMembers && projectMembers.length > 0) {
      fetchMembers();
    }
  }, [open, projectMembers, fetchMembers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-hidden"
        aria-describedby="task-form-description"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription id="task-form-description">
            {isEdit
              ? "Update this task by modifying the form fields."
              : "Create a new task by filling out the form below."}
          </DialogDescription>
        </DialogHeader>

        {isEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFormDisabled(!isFormDisabled)}
            className="mb-4"
          >
            {isFormDisabled ? "Enable Editing" : "Disable Editing"}
          </Button>
        )}

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 m-0.5"
            >
              {/* Task Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter task title"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Task Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        className="resize-none"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority & Assignee */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isFormDisabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Assign To<span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isFormDisabled || membersLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {membersLoading ? (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Select a user" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          {members.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isFormDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Attachments */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Attachments</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileLoading || isFormDisabled}
                  >
                    {fileLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4 mr-2" />
                    )}
                    {fileLoading ? "Uploading..." : "Attach Files"}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                    disabled={isFormDisabled}
                  />
                </div>

                {form.watch("attachedFile").length > 0 && (
                  <div className="space-y-2">
                    {form.watch("attachedFile").map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <a
                          href={file.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm truncate max-w-[300px] hover:underline"
                        >
                          {file.fileName}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isFormDisabled}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubtasks(!showSubtasks)}
                  >
                    {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
                    <ChevronDown
                      className={`ml-2 h-4 w-4 transition-transform ${
                        showSubtasks ? "rotate-180" : ""
                      }`}
                    />
                  </Button>

                  {showSubtasks && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSubtask}
                      disabled={isFormDisabled}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subtask
                    </Button>
                  )}
                </div>

                {showSubtasks && form.watch("subTask").length > 0 && (
                  <div className="space-y-3 mt-3">
                    {form.watch("subTask").map((_, index) => (
                      <Card key={index}>
                        <CardContent className="p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">Subtask {index + 1}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSubtask(index)}
                              disabled={isFormDisabled}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Separator />
                          <FormField
                            control={form.control}
                            name={`subTask.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Title
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Subtask title"
                                    {...field}
                                    disabled={isFormDisabled}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`subTask.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Description
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Subtask description"
                                    className="resize-none"
                                    {...field}
                                    disabled={isFormDisabled}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-violet-600 text-white"
                disabled={loading || fileLoading || isFormDisabled}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Adding..."}
                  </>
                ) : fileLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : isEdit ? (
                  "Update Task"
                ) : (
                  "Add Task"
                )}
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
