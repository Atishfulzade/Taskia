import React, { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Import sonner's toast
import {
  Paperclip,
  X,
  Loader2,
  Plus,
  Calendar,
  User,
  Flag,
  ListTodo,
  FileText,
  Edit,
  Save,
} from "lucide-react";
import { useFileUpload } from "../hooks/useFileUpload ";
import { useProjectMembers } from "../hooks/useProjectMembers";
import requestServer from "@/utils/requestServer";
import { addTask, updateTask } from "@/store/taskSlice";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/Label";

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
    <Card className="bg-background border border-border shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Badge
            variant="outline"
            className="bg-secondary/30 text-secondary-foreground"
          >
            Subtask {index + 1}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeSubtask(index)}
            disabled={isFormDisabled}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove subtask</span>
          </Button>
        </div>
        <Separator />
        <FormField
          control={form.control}
          name={`subTask.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">
                Title<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Subtask title"
                  {...field}
                  disabled={isFormDisabled}
                  className="bg-background"
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
              <FormLabel className="text-xs font-medium">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Subtask description"
                  className="resize-none bg-background min-h-[80px]"
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
    <div className="flex items-center justify-between p-2.5 bg-secondary/20 rounded-md group hover:bg-secondary/30 transition-colors">
      <a
        href={file.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm truncate max-w-[300px] hover:underline flex items-center gap-2 text-primary"
      >
        <FileText className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{file.fileName}</span>
      </a>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        disabled={isDisabled}
        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  );
};

// Main component
const AddTaskPopup = React.memo(
  ({ open, onOpenChange, status, taskData, isEdit }) => {
    const [loading, setLoading] = useState(false);
    const [isFormDisabled, setIsFormDisabled] = useState(isEdit);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

    // Get default values based on edit mode
    const getDefaultValues = useCallback(() => {
      if (isEdit && taskData) {
        return {
          title: taskData.title || "",
          description: taskData.description || "",
          priority: taskData.priority || "No",
          status: status?._id || taskData.status || "",
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
        status: status?._id || "",
        assignedTo: "",
        assignedBy: userId,
        projectId: projectId || "",
        dueDate: "",
        subTask: [],
        attachedFile: [],
      };
    }, [taskData, status, userId, projectId, isEdit]);

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

      if (status?._id && !form.getValues("status")) {
        form.setValue("status", status._id);
      }

      if (userId && !form.getValues("assignedBy")) {
        form.setValue("assignedBy", userId);
      }
    }, [projectId, status, userId, form]);

    // Handle file input change
    const handleFileChange = async (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      try {
        const uploadedFiles = await uploadFiles(files);
        const currentFiles = form.getValues("attachedFile") || [];
        form.setValue("attachedFile", [...currentFiles, ...uploadedFiles]);
      } catch (error) {
        toast.error("Failed to upload files"); // Use sonner's toast
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
          toast.success("Task updated successfully"); // Use sonner's toast
        } else {
          res = await requestServer("task/add", values);
          dispatch(addTask(res.data));
          toast.success("Task added successfully"); // Use sonner's toast
        }

        onOpenChange(false);
        setHasUnsavedChanges(false);
        form.reset(getDefaultValues());
      } catch (error) {
        console.error("Error:", error);
        if (error.response?.data?.message === "Token not found") {
          toast.error("Session expired. Please login again."); // Use sonner's toast
          localStorage.removeItem("token");
          localStorage.removeItem("userState");
          navigate("/authenticate");
        } else {
          toast.error(
            error.response?.data?.message || "Something went wrong" // Use sonner's toast
          );
        }
      } finally {
        setLoading(false);
      }
    };

    // Get priority badge color
    const getPriorityColor = (priority) => {
      switch (priority) {
        case "High":
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
        case "Medium":
          return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
        default:
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent
          className="sm:max-w-[550px] max-h-[90vh] overflow-hidden p-0"
          aria-describedby="task-form-description"
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {isEdit ? "Edit Task" : "Add Task"}
                </DialogTitle>
                <DialogDescription
                  id="task-form-description"
                  className="mt-1.5"
                >
                  {isEdit
                    ? "Update this task by modifying the form fields."
                    : "Create a new task by filling out the form below."}
                </DialogDescription>
              </div>

              {isEdit && (
                <div
                  onClick={() => setIsFormDisabled(!isFormDisabled)}
                  className="h-9 w-9 cursor-pointer "
                >
                  {isFormDisabled ? (
                    <Edit className="h-5 w-5" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {isFormDisabled ? "Enable Editing" : "Disable Editing"}
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 py-4"
              >
                {/* Task Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <ListTodo className="h-4 w-4" />
                        Title<span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter task title"
                          {...field}
                          disabled={isFormDisabled}
                          className="bg-background"
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
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter description"
                          className="resize-none bg-background min-h-[100px]"
                          {...field}
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Priority */}
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Flag className="h-4 w-4" />
                          Priority
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isFormDisabled}
                            className="flex flex-col space-y-1"
                          >
                            {["No", "Medium", "High"].map((priority) => (
                              <div
                                key={priority}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={priority}
                                  id={`priority-${priority}`}
                                  checked={field.value === priority}
                                />
                                <Label
                                  htmlFor={`priority-${priority}`}
                                  className="flex items-center gap-2"
                                >
                                  <Badge
                                    variant="outline"
                                    className={getPriorityColor(priority)}
                                  >
                                    {priority}
                                  </Badge>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Assignee */}
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <User className="h-4 w-4" />
                          Assign To<span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isFormDisabled || membersLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
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
                          <SelectContent className="max-h-[200px]">
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
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        Due Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isFormDisabled}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Accordion type="single" collapsible className="w-full">
                  {/* File Attachments */}
                  <AccordionItem value="attachments" className="border-b-0">
                    <AccordionTrigger className="py-3 px-4 bg-secondary/10 rounded-md hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Paperclip className="h-4 w-4" />
                        Attachments ({form.watch("attachedFile").length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2 px-1">
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={fileLoading || isFormDisabled}
                          className="w-full"
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

                        {form.watch("attachedFile").length > 0 && (
                          <div className="space-y-2 mt-2">
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Subtasks */}
                  <AccordionItem value="subtasks" className="border-b-0 mt-2">
                    <AccordionTrigger className="py-3 px-4 bg-secondary/10 rounded-md hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ListTodo className="h-4 w-4" />
                        Subtasks ({form.watch("subTask").length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2 px-1">
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSubtask}
                          disabled={isFormDisabled}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subtask
                        </Button>

                        {form.watch("subTask").length > 0 && (
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Submit Button */}
                <div
                  className="sticky bottom-0  pt-2 pb-4 bg-white
                "
                >
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
                </div>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }
);

export default AddTaskPopup;
