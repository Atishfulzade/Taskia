import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
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
  X,
  Clock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/Tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"; // Corrected import path
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { Progress } from "../components/ui/Progress";
import { formatDate } from "../utils/formatDate";
import requestServer from "../utils/requestServer";

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <Flag
              className={`h-3.5 w-3.5 ${
                colorMap[priority] || "text-slate-400 dark:text-slate-500"
              }`}
            />
            <span className="text-xs font-medium">{priority || "None"}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="dark:bg-slate-800 dark:text-slate-200">
          <p>Priority: {priority || "Not set"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Task = ({ task, priority, onTaskUpdate, onTaskDelete }) => {
  const [assignedUser, setAssignedUser] = useState("");
  const [statusDetails, setStatusDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || "");
  const inputRef = useRef(null);

  const statusLength = useSelector((state) => state.status?.statuses?.length);

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
    transform: CSS.Transform.toString(transform),
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

  return (
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
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="touch-none cursor-grab opacity-0 group-hover:opacity-100 transition-opacity px-2"
      >
        <Grip className="h-3.5 w-3.5 text-muted-foreground dark:text-slate-400" />
      </div>

      {/* Checkbox */}
      <div className="px-2">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleComplete}
          className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </div>

      {/* Task Name */}
      <div className="w-[30%] px-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-background  dark:bg-slate-800 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={saveTitle}
              className="h-6 w-6"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={cancelEdit}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <p
            className={`text-sm font-medium dark:text-slate-100 ${
              isCompleted ? "line-through text-muted-foreground" : ""
            }`}
            onClick={handleEditTitle}
          >
            {task?.title}
          </p>
        )}
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
            className="px-2 py-0.5 text-xs font-medium dark:text-slate-800 "
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
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="dark:bg-slate-800 dark:text-slate-200"
          >
            <DropdownMenuItem
              onClick={handleEditTitle}
              className="dark:hover:bg-slate-700"
            >
              <Edit className="h-3.5 w-3.5 mr-2" />
              Edit task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleComplete}
              className="dark:hover:bg-slate-700"
            >
              <Check className="h-3.5 w-3.5 mr-2" />
              Mark as {isCompleted ? "incomplete" : "complete"}
            </DropdownMenuItem>
            <DropdownMenuItem className="dark:hover:bg-slate-700">
              <Plus className="h-3.5 w-3.5 mr-2" />
              Add subtask
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive dark:hover:bg-slate-700"
              onClick={() => onTaskDelete && onTaskDelete(task._id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default Task;
