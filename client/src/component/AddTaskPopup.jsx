import React, { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Paperclip, X, Loader2, Plus, ChevronDown } from "lucide-react";
import { useFileUpload } from "../hooks/useFileUpload ";
import { useProjectMembers } from "../hooks/useProjectMembers";
import { showToast } from "@/utils/showToast";
import requestServer from "@/utils/requestServer";
import { addTask, updateTask } from "@/store/taskSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Task schema with Zod validation
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

// Subtask component
const SubtaskItem = ({ index, form, isFormDisabled, removeSubtask }) => {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <Badge
            variant="outline"
            className="dark:bg-gray-700 dark:text-gray-100"
          >
            Subtask {index + 1}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeSubtask(index)}
            disabled={isFormDisabled}
            className="dark:text-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Separator className="dark:bg-gray-600" />
        <FormField
          control={form.control}
          name={`subTask.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs dark:text-gray-300">
                Title<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Subtask title"
                  {...field}
                  disabled={isFormDisabled}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
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
              <FormLabel className="text-xs dark:text-gray-300">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Subtask description"
                  className="resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
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
  );
};

// File attachment item component
const FileAttachmentItem = ({ file, index, onRemove, isDisabled }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-muted dark:bg-gray-700 rounded-md">
      <a
        href={file.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm truncate max-w-[300px] hover:underline dark:text-gray-100"
      >
        {file.fileName}
      </a>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        disabled={isDisabled}
        className="dark:text-gray-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Main component
const AddTaskPopup = React.memo(
  ({ open, onOpenChange, currentStatus, taskData, isEdit }) => {
    const [loading, setLoading] = useState(false);
    const [isFormDisabled, setIsFormDisabled] = useState(isEdit);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSubtasks, setShowSubtasks] = useState(true);

    const fileInputRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const projectId = useSelector((state) => state.project.currentProject?._id);
    const userId = useSelector((state) => state.user.user._id);
    const projectMembers = useSelector(
      (state) => state.project.currentProject?.member
    );

    const { uploadFiles, fileLoading } = useFileUpload();
    const { members, loading: membersLoading } = useProjectMembers(
      projectMembers,
      open
    );
    console.log(isEdit, taskData);

    // Get default values based on edit mode
    const getDefaultValues = useCallback(() => {
      if (isEdit && taskData) {
        return {
          title: taskData.title || "",
          description: taskData.description || "",
          priority: taskData.priority || "No",
          status: currentStatus?._id || taskData.status || "",
          assignedTo: taskData.assignedTo || "",
          assignedBy: taskData.assignedBy || userId,
          projectId: projectId || "",
          dueDate: taskData.dueDate || "",
          subTask: taskData.subTask || [],
          attachedFile: taskData.attachedFile || [],
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
    }, [taskData, currentStatus, userId, projectId, isEdit]);

    // Initialize form with default values
    const form = useForm({
      resolver: zodResolver(taskSchema),
      defaultValues: getDefaultValues(),
    });

    // Reset form when taskData or isEdit changes
    useEffect(() => {
      form.reset(getDefaultValues());
    }, [taskData, isEdit, form, getDefaultValues]);

    // Track form changes
    useEffect(() => {
      const subscription = form.watch(() => {
        setHasUnsavedChanges(true);
      });
      return () => subscription.unsubscribe();
    }, [form]);

    // Update required form values when dependencies change
    useEffect(() => {
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

    // Handle file input change
    const handleFileChange = async (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      try {
        const uploadedFiles = await uploadFiles(files);
        const currentFiles = form.getValues("attachedFile") || [];
        form.setValue("attachedFile", [...currentFiles, ...uploadedFiles]);
      } catch (error) {
        showToast("Failed to upload files", "error");
        console.error("File upload error:", error);
      }
    };

    // Add a new subtask
    const addSubtask = useCallback(() => {
      const currentSubtasks = form.getValues("subTask") || [];
      form.setValue("subTask", [
        ...currentSubtasks,
        { title: "", description: "" },
      ]);
    }, [form]);

    // Remove a subtask
    const removeSubtask = useCallback(
      (index) => {
        const currentSubtasks = form.getValues("subTask");
        form.setValue(
          "subTask",
          currentSubtasks.filter((_, i) => i !== index)
        );
      },
      [form]
    );

    // Remove an attached file
    const removeFile = useCallback(
      (index) => {
        const currentFiles = form.getValues("attachedFile");
        form.setValue(
          "attachedFile",
          currentFiles.filter((_, i) => i !== index)
        );
      },
      [form]
    );

    // Handle dialog close with confirmation if changes exist
    const handleDialogClose = useCallback(() => {
      console.log("Dialog close triggered"); // Debugging
      if (hasUnsavedChanges) {
        if (
          window.confirm(
            "You have unsaved changes. Are you sure you want to close?"
          )
        ) {
          onOpenChange(false);
          setHasUnsavedChanges(false);
        }
      } else {
        onOpenChange(false);
      }
    }, [hasUnsavedChanges, onOpenChange]);

    // Form submission handler
    const onSubmit = async (values) => {
      setLoading(true);
      try {
        let res;
        if (isEdit && taskData) {
          res = await requestServer(`task/update/${taskData._id}`, values);
          dispatch(updateTask(res.data));
          showToast("Task updated successfully", "success");
        } else {
          res = await requestServer("task/add", values);
          dispatch(addTask(res.data));
          showToast("Task added successfully", "success");
        }

        onOpenChange(false);
        setHasUnsavedChanges(false);
        form.reset(getDefaultValues());
      } catch (error) {
        console.error("Error:", error);
        if (error.response?.data?.message === "Token not found") {
          showToast("Session expired. Please login again.", "error");
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

    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent
          className="sm:max-w-[500px] bg-white dark:bg-gray-900 max-h-[90vh] overflow-hidden"
          aria-describedby="task-form-description"
        >
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">
              {isEdit ? "Edit Task" : "Add Task"}
            </DialogTitle>
            <DialogDescription
              id="task-form-description"
              className="text-gray-600 dark:text-gray-300"
            >
              {isEdit
                ? "Update this task by modifying the form fields."
                : "Create a new task by filling out the form below."}
            </DialogDescription>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)} // Close the dialog
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </DialogHeader>

          {isEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFormDisabled(!isFormDisabled)}
              className="mb-4 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
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
                      <FormLabel className="dark:text-gray-300">
                        Title<span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter task title"
                          {...field}
                          disabled={isFormDisabled}
                          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
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
                      <FormLabel className="dark:text-gray-300">
                        Description (optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter description"
                          className="resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          {...field}
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority & Assignee */}
                <div className="flex justify-between w-full gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="dark:text-gray-300">
                          Priority
                        </FormLabel>
                        <div className="flex items-center space-x-4">
                          {["No", "Medium", "High"].map((priority) => (
                            <div
                              key={priority}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                id={`priority-${priority}`}
                                checked={field.value === priority}
                                onChange={() => {
                                  field.onChange(priority);
                                }}
                                disabled={isFormDisabled}
                                className="h-4 w-4 text-violet-600 dark:text-violet-700 border-gray-300 dark:border-gray-600 rounded focus:ring-violet-500 dark:focus:ring-violet-600"
                              />
                              <label
                                htmlFor={`priority-${priority}`}
                                className="text-sm font-medium text-gray-900 dark:text-gray-100"
                              >
                                {priority}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="dark:text-gray-300">
                          Assign To<span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isFormDisabled || membersLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                              {membersLoading ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin dark:text-gray-100" />
                                  <span>Loading...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder="Select a user" />
                              )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 max-h-[200px]">
                            {members.map((user) => (
                              <SelectItem
                                key={user._id}
                                value={user._id}
                                className="dark:text-gray-100"
                              >
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
                      <FormLabel className="dark:text-gray-300">
                        Due Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isFormDisabled}
                          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Attachments */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel className="dark:text-gray-300">
                      Attachments
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={fileLoading || isFormDisabled}
                      className="dark:bg-gray-800 dark:text-gray-100 border-slate-300 dark:hover:bg-gray-700"
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
                        <FileAttachmentItem
                          key={index}
                          file={file}
                          index={index}
                          onRemove={removeFile}
                          isDisabled={isFormDisabled}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtasks */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel className="dark:text-gray-300">
                      Subtasks
                    </FormLabel>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        className="dark:bg-gray-800 dark:text-gray-100 border-slate-300 dark:hover:bg-gray-700"
                      >
                        {showSubtasks ? "Hide" : "Show"}
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
                          className="dark:bg-gray-800 dark:text-gray-100 border-slate-300 dark:hover:bg-gray-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>

                  {showSubtasks && form.watch("subTask").length > 0 && (
                    <div className="space-y-3 mt-3">
                      {form.watch("subTask").map((_, index) => (
                        <SubtaskItem
                          key={index}
                          index={index}
                          form={form}
                          isFormDisabled={isFormDisabled}
                          removeSubtask={removeSubtask}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-violet-600 dark:bg-violet-700 text-white hover:bg-violet-700 dark:hover:bg-violet-800"
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
);

export default AddTaskPopup;
