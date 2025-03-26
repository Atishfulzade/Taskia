import { DialogDescription } from "@/components/ui/Dialog";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  Tag,
  CheckCircle2,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  useCustomId: z.boolean().optional(),
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
    <Card className="bg-background border border-border shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Badge
            variant="outline"
            className="bg-secondary/30 text-secondary-foreground font-medium"
          >
            Subtask {index + 1}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeSubtask(index)}
            disabled={isFormDisabled}
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove subtask</span>
          </Button>
        </div>
        <Separator className="my-2" />
        <FormField
          control={form.control}
          name={`subTask.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Title<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Subtask title"
                  {...field}
                  disabled={isFormDisabled}
                  className="bg-background focus-visible:ring-primary/50"
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
              <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Subtask description"
                  className="resize-none bg-background min-h-[80px] focus-visible:ring-primary/50"
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
    <div className="flex items-center justify-between p-2.5 bg-secondary/10 rounded-md group hover:bg-secondary/20 transition-all border border-transparent hover:border-secondary/30">
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
        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  );
};

const AddTaskPopup = React.memo(
  ({
    open,
    onOpenChange,
    status,
    showStatus,
    showPriority,
    taskData,
    isEdit,
    initialPriority,
    availablePriorities = ["High", "Medium", "No"],
    onAddPriority,
  }) => {
    const [loading, setLoading] = useState(false);
    const [isFormDisabled, setIsFormDisabled] = useState(isEdit);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const fileInputRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux state selectors
    const userId = useSelector((state) => state.user.user._id);
    const userName = useSelector((state) => state.user.user.name);
    const projectId = useSelector((state) => state.project.currentProject?._id);
    const project = useSelector((state) => state.project.currentProject);
    const statuses = useSelector((state) => state.status.statuses);
    const projectMembers = useSelector(
      (state) => state.project.currentProject?.member
    );
    const useCustomId = useSelector((state) => state.settings.useCustomId);

    const { uploadFiles, fileLoading } = useFileUpload();
    const { members, loading: membersLoading } = useProjectMembers(
      projectMembers,
      open
    );

    // Get default values based on edit mode and initialPriority
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
          useCustomId: taskData.useCustomId || useCustomId,
          dueDate: taskData.dueDate || "",
          subTask: taskData.subTask || [],
          attachedFile: taskData.attachedFile || [],
        };
      }

      return {
        title: "",
        description: "",
        priority: initialPriority || "No",
        status: status?._id || "",
        assignedTo: "",
        assignedBy: userId,
        projectId: projectId || "",
        useCustomId: useCustomId || false,
        dueDate: "",
        subTask: [],
        attachedFile: [],
      };
    }, [
      taskData,
      status,
      userId,
      projectId,
      isEdit,
      initialPriority,
      useCustomId,
    ]);

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

      // Set initial priority if provided
      if (initialPriority && form.getValues("priority") !== initialPriority) {
        form.setValue("priority", initialPriority);
      }
    }, [projectId, status, userId, form, initialPriority]);

    // Handle file input change
    const handleFileChange = async (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      try {
        const uploadedFiles = await uploadFiles(files);
        const currentFiles = form.getValues("attachedFile") || [];
        form.setValue("attachedFile", [...currentFiles, ...uploadedFiles]);
      } catch (error) {
        toast.error("Failed to upload files");
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
        setIsAlertOpen(true);
      } else {
        onOpenChange(false);
      }
    }, [hasUnsavedChanges, onOpenChange]);

    // Handle alert dialog confirmation
    const handleAlertConfirm = () => {
      onOpenChange(false);
      setHasUnsavedChanges(false);
      setIsAlertOpen(false);
    };

    // Handle alert dialog cancellation
    const handleAlertCancel = () => {
      setIsAlertOpen(false);
    };

    // Form submission handler
    const onSubmit = async (values) => {
      setLoading(true);
      try {
        // Prepare task data
        const taskData = {
          ...values,
          // Only include useCustomId
          useCustomId: values.useCustomId || undefined,
        };

        let res;
        if (isEdit && taskData) {
          res = await requestServer(`task/update/${taskData._id}`, taskData);
          dispatch(updateTask(res.data));
          toast.success("Task updated successfully");
        } else {
          res = await requestServer("task/add", taskData);
          dispatch(addTask(res.data));
          toast.success("Task added successfully");
        }

        onOpenChange(false);
        setHasUnsavedChanges(false);
        form.reset(getDefaultValues());
      } catch (error) {
        console.error("Error:", error);
        if (error.response?.data?.message === "Token not found") {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("userState");
          navigate("/authenticate");
        } else {
          toast.error(error.response?.data?.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
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

    return (
      <>
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden p-0 rounded-xl border-none shadow-xl">
            <DialogHeader className="px-6 pt-6 pb-2 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold text-violet-900 dark:text-violet-200 flex flex-wrap items-center gap-2">
                    {isEdit ? "Edit Task" : "Add Task"}
                    {initialPriority && !isEdit && (
                      <Badge
                        variant="outline"
                        className={`ml-1 ${getPriorityColor(initialPriority)}`}
                      >
                        {initialPriority} Priority
                      </Badge>
                    )}
                    {showStatus && status && !isEdit && (
                      <Badge className={`ml-1 ${status.primaryColor}`}>
                        {status.title}
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="mt-1.5 text-violet-700/70 dark:text-violet-300/70">
                    {isEdit
                      ? "Update this task by modifying the form fields."
                      : "Create a new task by filling out the form below."}
                  </DialogDescription>
                </div>

                {isEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFormDisabled(!isFormDisabled)}
                    className="h-9 w-9 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-violet-600 dark:text-violet-300 shadow-sm border border-violet-100 dark:border-violet-800/30"
                  >
                    {isFormDisabled ? (
                      <Edit className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {isFormDisabled ? "Enable Editing" : "Disable Editing"}
                    </span>
                  </Button>
                )}
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(80vh-120px)] px-6 bg-white dark:bg-slate-900">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5 py-5"
                >
                  {/* Task Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-violet-800 dark:text-violet-300">
                          <ListTodo className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                          Title<span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter task title"
                            {...field}
                            disabled={isFormDisabled}
                            className="bg-background focus-visible:ring-violet-500/50 border-violet-100 dark:border-violet-800/30"
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
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-violet-800 dark:text-violet-300">
                          <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter description"
                            className="resize-none bg-background min-h-[100px] focus-visible:ring-violet-500/50 border-violet-100 dark:border-violet-800/30"
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
                    {showPriority && (
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-violet-800 dark:text-violet-300">
                              <Flag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                              Priority
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isFormDisabled}
                                  className="flex flex-col space-y-1.5 max-h-[150px] overflow-y-auto pr-2"
                                >
                                  {availablePriorities.map((priority) => (
                                    <div
                                      key={priority}
                                      className="flex items-center space-x-2"
                                    >
                                      <RadioGroupItem
                                        value={priority}
                                        id={`priority-${priority}`}
                                        checked={field.value === priority}
                                        className="text-violet-600 border-violet-300 dark:border-violet-700"
                                      />
                                      <Label
                                        htmlFor={`priority-${priority}`}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <Badge
                                          variant="outline"
                                          className={`${getPriorityColor(
                                            priority
                                          )} font-medium`}
                                        >
                                          {priority}
                                        </Badge>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Assignee */}
                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-violet-800 dark:text-violet-300">
                            <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            Assign To<span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={isFormDisabled || membersLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-slate-900 border-violet-100 dark:border-violet-800/30 focus:ring-violet-500/50">
                                {membersLoading ? (
                                  <div className="flex items-center">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-violet-600" />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Due Date */}
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-violet-800 dark:text-violet-300">
                            <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            Due Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              disabled={isFormDisabled}
                              className="bg-white dark:bg-slate-900 border-violet-100 dark:border-violet-800/30 focus-visible:ring-violet-500/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    {showStatus && (
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-violet-800 dark:text-violet-300">
                              <Tag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                              Status
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || "Select Status"}
                              disabled={isFormDisabled}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-slate-900 border-violet-100 dark:border-violet-800/30 focus:ring-violet-500/50">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem
                                    key={status._id}
                                    value={status._id}
                                  >
                                    {status.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    {/* File Attachments */}
                    <AccordionItem value="attachments" className="border-b-0">
                      <AccordionTrigger className="py-3 px-4 bg-violet-100/50 dark:bg-violet-900/20 rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-800 dark:text-violet-300">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Paperclip className="h-4 w-4 text-violet-600 dark:text-violet-400" />
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
                            className="w-full bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                          >
                            {fileLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin text-violet-600" />
                            ) : (
                              <Paperclip className="h-4 w-4 mr-2 text-violet-600" />
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
                      <AccordionTrigger className="py-3 px-4 bg-violet-100/50 dark:bg-violet-900/20 rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-800 dark:text-violet-300">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <ListTodo className="h-4 w-4 text-violet-600 dark:text-violet-400" />
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
                            className="w-full bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                          >
                            <Plus className="h-4 w-4 mr-2 text-violet-600" />
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
                  <div className="sticky bottom-0 pt-2 pb-4 bg-white dark:bg-slate-900">
                    <Button
                      type="submit"
                      className="w-full bg-violet-600 text-white hover:bg-violet-700 shadow-md hover:shadow-lg transition-all"
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

        {/* Alert Dialog for Unsaved Changes */}
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent className="sm:max-w-[425px] bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to close?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleAlertCancel}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAlertConfirm}
                className="bg-red-600 text-white"
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

AddTaskPopup.displayName = "AddTaskPopup";

export default AddTaskPopup;
