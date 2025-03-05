import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { setTasks, updateTask, addTask, deleteTask } from "../store/taskSlice";
import { setStatuses } from "../store/statusSlice";
import requestServer from "../utils/requestServer";
import bgColors from "../utils/constant";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Icons
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Users,
  User,
  ListFilter,
  MoreHorizontal,
  Merge,
} from "lucide-react";

const ProjectDetail = () => {
  // State Management
  const [taskOpen, setTaskOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [editTaskOpen, setEditTaskOpen] = useState({
    isOpen: false,
    task: null,
  });

  // Advanced Filtering States
  const [filterOptions, setFilterOptions] = useState({
    priority: null,
    assignee: null,
    dueDate: null,
  });

  // Refs and Redux
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user?._id);
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const statuses = useSelector((state) => state.status?.statuses);
  const tasks = useSelector((state) => state.task?.tasks);
  const projectName = useSelector(
    (state) => state.project.currentProject?.name
  );

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Memoized and Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesViewMode =
        viewMode === "all" || (viewMode === "me" && task.assignedTo === userId);

      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilters =
        (!filterOptions.priority || task.priority === filterOptions.priority) &&
        (!filterOptions.assignee ||
          task.assignedTo === filterOptions.assignee) &&
        (!filterOptions.dueDate || task.dueDate === filterOptions.dueDate);

      return matchesViewMode && matchesSearch && matchesFilters;
    });
  }, [tasks, viewMode, searchQuery, userId, filterOptions]);

  // Fetch and Update Functions (keep existing implementations)
  const fetchStatuses = async () => {
    /* Existing implementation */
  };
  const fetchTasks = async () => {
    /* Existing implementation */
  };
  const updateCurrentTask = async (task) => {
    /* Existing implementation */
  };

  // Advanced Drag and Drop Handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    const draggedTask = tasks.find((task) => task._id === active.id);
    setActiveTask(draggedTask);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const updatedTask = tasks.find((task) => task._id === taskId);
    if (updatedTask && updatedTask.status !== newStatus) {
      const taskWithNewStatus = { ...updatedTask, status: newStatus };
      dispatch(updateTask(taskWithNewStatus));
      updateCurrentTask(taskWithNewStatus);
    }
  };

  // Advanced Task Management
  const handleAddTask = async (taskData) => {
    try {
      const newTask = await requestServer("task/create", taskData);
      dispatch(addTask(newTask.data));
      setTaskOpen(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await requestServer(`task/delete/${taskId}`);
      dispatch(deleteTask(taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Task Counts and Analytics
  const getTaskCounts = () => {
    const total = tasks.length;
    const myTasks = tasks.filter((task) => task.assignedTo === userId).length;
    return { total, myTasks };
  };

  const { total, myTasks } = getTaskCounts();

  // Load data on component mount
  useEffect(() => {
    if (projectId) {
      fetchStatuses();
      fetchTasks();
    }
  }, [projectId]);

  return (
    <div className="h-full w-full bg-background">
      {/* Project Header */}
      <Card className="sticky top-0 z-10 rounded-none border-x-0 border-t-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{projectName || "Project Dashboard"}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">{total} Tasks</Badge>
                <Badge variant="outline">{myTasks} My Tasks</Badge>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setTaskOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new task in this project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
      </Card>

      {/* Toolbar */}
      <Card className="sticky top-[85px] z-10 rounded-none border-x-0 border-t-0">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* View Mode */}
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                  <TabsTrigger value="all">
                    <Users className="mr-2 h-4 w-4" />
                    All Tasks
                  </TabsTrigger>
                  <TabsTrigger value="me">
                    <User className="mr-2 h-4 w-4" />
                    My Tasks
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Advanced Filtering */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  {/* Filter options implementation */}
                </PopoverContent>
              </Popover>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board Implementation */}
      {/* (Keep existing DndContext implementation with shadcn components) */}
    </div>
  );
};

export default ProjectDetail;
