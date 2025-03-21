import { useState, useRef, useEffect } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { Progress } from "../components/ui/Progress";
import { useSelector } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import { formatDate } from "@/utils/formatDate";
import { formatDistanceToNow } from "date-fns"; // Added import
import requestServer from "@/utils/requestServer";
import AddTaskPopup from "../component/AddTaskPopup";

import { motion } from "framer-motion";
import {
  Check,
  Grip,
  Paperclip,
  Flag,
  Plus,
  Edit,
  MoreHorizontal,
  User,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const TaskProgressIndicator = ({ status, statusLength }) => {
  const percentage = status ? (statusLength || 1) * 10 : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <Progress value={percentage} className="h-1.5 w-full" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {percentage}%
      </span>
    </div>
  );
};

const PriorityFlag = ({ priority }) => {
  const colorMap = {
    High: "text-destructive",
    Medium: "text-amber-500",
    No: "text-slate-400 dark:text-slate-500",
  };

  return (
    <div className="flex items-center gap-1.5">
      <Flag
        className={`h-3.5 w-3.5 ${
          colorMap[priority] || "text-slate-400 dark:text-slate-500"
        }`}
      />
      <span className="text-xs font-medium">{priority || "None"}</span>
    </div>
  );
};

const Task = ({ task, priority, onTaskUpdate, onTaskDelete }) => {
  const [assignedUser, setAssignedUser] = useState("");
  const [statusDetails, setStatusDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(task?.completed || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || "");
  const [isTaskPopupOpen, setIsTaskPopupOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const statusLength = useSelector((state) => state.status?.statuses?.length);
  const statuses = useSelector((state) => state.status?.statuses);

  useEffect(() => {
    if (task?.status) {
      setIsLoading(true);
      requestServer(`status/get/${task.status}`)
        .then((response) => setStatusDetails(response.data))
        .catch((error) => console.error("Error fetching status:", error))
        .finally(() => setIsLoading(false));
    }
  }, [task?.status]);

  useEffect(() => {
    if (task?.assignedTo) {
      setIsLoading(true);
      requestServer(`user/u/${task.assignedTo}`)
        .then((user) => setAssignedUser(user?.data.name ?? "Unknown"))
        .catch((error) => console.error("Error fetching user:", error))
        .finally(() => setIsLoading(false));
    }
  }, [task?.assignedTo]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task?._id,
      data: { priority },
    });

  const style = {
    transform: CSS.Transform?.toString(transform),
    transition,
  };

  const handleComplete = () => {
    setIsCompleted(!isCompleted);
    if (onTaskUpdate) {
      onTaskUpdate(task._id, { completed: !isCompleted });
    }
  };

  const handleEditTitle = () => {
    setIsEditing(true);
  };

  const saveTitle = () => {
    setIsEditing(false);
    if (editedTitle.trim() !== task.title && onTaskUpdate) {
      onTaskUpdate(task._id, { title: editedTitle });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(task.title);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((part) => part[0])
      .join("");
  };

  const getRelativeDate = (date) => {
    if (!date) return "No date";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return formatDate(date);
    }
  };

  // Open the task popup when clicking on the title
  const handleTitleClick = (e) => {
    e.stopPropagation();
    setIsTaskPopupOpen(true);
  };

  // Handle task update from the popup
  const handleTaskUpdate = (updatedTask) => {
    if (onTaskUpdate) {
      onTaskUpdate(task._id, updatedTask);
    }
    setIsTaskPopupOpen(false);
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`group flex items-center w-full border-b border-slate-200 dark:border-slate-700 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
          isCompleted ? "bg-muted/50 dark:bg-slate-700/50" : ""
        }`}
        role="listitem"
      >
        {/* Drag Handle */}
        <div
          {...listeners}
          className="touch-none cursor-grab opacity-0 group-hover:opacity-100 transition-opacity px-2"
          aria-label="Drag handle"
        >
          <Grip className="h-3.5 w-3.5 text-muted-foreground dark:text-slate-400" />
        </div>

        {/* Checkbox */}
        <div className="px-2">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleComplete}
            className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          />
        </div>

        {/* Task Name */}
        <div className="w-[30%] px-2">
          <p
            className={`text-sm font-medium dark:text-slate-100 ${
              isCompleted ? "line-through text-muted-foreground" : ""
            } cursor-pointer hover:text-primary transition-colors`}
            onClick={handleTitleClick}
          >
            {task?.title}
          </p>
        </div>

        {/* Status */}
        <div className="w-[15%] px-2">
          {isLoading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <Badge
              variant="outline"
              style={{
                backgroundColor: statusDetails?.color?.secondaryColor,
                color: statusDetails?.color?.primaryColor,
                borderColor: statusDetails?.color?.primaryColor,
              }}
              className="px-2 py-0.5 text-xs font-medium dark:text-slate-800"
            >
              {statusDetails?.title || "No Status"}
            </Badge>
          )}
        </div>

        {/* Created At */}
        <div className="w-[15%] px-2">
          <div className="text-xs text-muted-foreground dark:text-slate-400">
            {getRelativeDate(task?.createdAt)}
          </div>
        </div>

        {/* Assigned User */}
        <div className="w-[15%] px-2">
          {isLoading ? (
            <Skeleton className="h-5 w-5 rounded-full" />
          ) : task?.assignedTo ? (
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-primary text-[10px] dark:text-slate-500 text-primary-foreground">
                {getInitials(assignedUser)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="h-5 w-5 rounded-full"
              aria-label="Assign user"
              onClick={handleTitleClick}
            >
              <User className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Priority */}
        <div className="w-[10%] px-2 dark:text-slate-500">
          <PriorityFlag priority={task?.priority} />
        </div>

        {/* Due Date */}
        <div className="w-[15%] px-2">
          <div className="text-xs text-muted-foreground dark:text-slate-400">
            {getRelativeDate(task?.dueDate)}
          </div>
        </div>

        {/* Attachments */}
        <div className="w-[10%] px-2">
          {task?.attachedFile?.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachedFile?.length ?? 0}</span>
            </Badge>
          )}
        </div>

        {/* Actions Dropdown */}
        <div className="px-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Task actions"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              ref={dropdownRef}
              align="end"
              className="dark:bg-slate-800 dark:text-slate-200 bg-white min-w-[180px] p-1"
              sideOffset={5}
            >
              <DropdownMenuItem
                onClick={handleTitleClick}
                className="dark:hover:bg-slate-700 cursor-pointer flex items-center px-2 py-1.5 text-sm rounded-sm"
              >
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleComplete}
                className="dark:hover:bg-slate-700 cursor-pointer flex items-center px-2 py-1.5 text-sm rounded-sm"
              >
                <Check className="h-3.5 w-3.5 mr-2" />
                Mark as {isCompleted ? "incomplete" : "complete"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="dark:hover:bg-slate-700 cursor-pointer flex items-center px-2 py-1.5 text-sm rounded-sm"
                onClick={handleTitleClick}
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Add subtask
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 dark:bg-slate-700" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive dark:hover:bg-slate-700 cursor-pointer flex items-center px-2 py-1.5 text-sm rounded-sm"
                onClick={() => onTaskDelete && onTaskDelete(task._id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Task Edit Popup */}
      {isTaskPopupOpen && (
        <AddTaskPopup
          open={isTaskPopupOpen}
          onOpenChange={setIsTaskPopupOpen}
          taskData={task}
          isEdit={true}
          showStatus={true}
          showPriority={true}
          status={statusDetails}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </>
  );
};

export default Task;
