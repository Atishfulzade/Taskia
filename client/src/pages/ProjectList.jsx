import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import requestServer from "../utils/requestServer";
import { updateTask, setTasks } from "../store/taskSlice";

// Components
import PrioritySection from "../component/PrioritySection";
import Task from "../component/Task";
import { Input } from "../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Button } from "../components/ui/Button";

import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Alert, AlertDescription } from "../components/ui/Alert";

// Icons
import { TbStack2 } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";
import { RiExpandUpDownLine } from "react-icons/ri";
import { IoSearch, IoAddCircleOutline } from "react-icons/io5";
import { GoPeople, GoPerson } from "react-icons/go";
import { LuRefreshCw } from "react-icons/lu";
import { BiErrorCircle } from "react-icons/bi";
import { Plus } from "lucide-react";

const ProjectList = () => {
  // Redux hooks
  const dispatch = useDispatch();
  const storedTasks = useSelector((state) => state.task.tasks);
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const projectName = useSelector(
    (state) => state.project.currentProject?.name
  );
  const userId = useSelector((state) => state.user.user?._id);

  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("all"); // "all" or "me"
  const [sortBy, setSortBy] = useState("default");
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState({
    High: true,
    Medium: true,
    No: true,
  });

  // Drag-and-Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance to start
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await requestServer(`task/all/${projectId}`);
      dispatch(setTasks(response.data || []));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again.");
      dispatch(setTasks([]));
    } finally {
      setLoading(false);
    }
  }, [projectId, dispatch]);

  // Load tasks when the component mounts or projectId changes
  useEffect(() => {
    fetchTasks();
  }, []);

  // Update task priority in the backend & Redux store
  const updateCurrentTask = async (updatedTask) => {
    try {
      dispatch(updateTask(updatedTask)); // Optimistically update Redux store
      await requestServer(`task/update/${updatedTask._id}`, updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      // If the update fails, refresh tasks to get the correct state
      fetchTasks();
    }
  };

  // Handle Drag Start
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Find the dragged task
    const draggedTask = storedTasks.find((task) => task._id === active.id);
    setActiveTask(draggedTask);
  };

  // Handle Drag End
  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newPriority = over.data.current?.priority;

    if (!newPriority) return;

    const draggedTask = storedTasks.find((task) => task._id === taskId);
    if (draggedTask && draggedTask.priority !== newPriority) {
      const updatedTask = { ...draggedTask, priority: newPriority };
      updateCurrentTask(updatedTask);
    }
  };

  // Toggle dropdowns for priority sections
  const toggleDropdown = (priority) =>
    setOpenDropdowns((prev) => ({ ...prev, [priority]: !prev[priority] }));

  // Toggle all dropdowns
  const toggleAllDropdowns = (value) => {
    setOpenDropdowns({
      High: value,
      Medium: value,
      No: value,
    });
  };

  // Filter and sort tasks
  const getFilteredTasks = () => {
    let filtered = [...storedTasks];

    // Apply view mode filter
    if (viewMode === "me") {
      filtered = filtered.filter(
        (task) => task.assignedTo === userId || task.assignedBy === userId
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "dueDate":
        filtered.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      case "created":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // No additional sorting needed
        break;
    }

    return filtered;
  };

  // Task counts
  const getTaskCounts = () => {
    const filtered = getFilteredTasks();
    const total = filtered.length;
    const highCount = filtered.filter(
      (task) => task.priority === "High"
    ).length;
    const mediumCount = filtered.filter(
      (task) => task.priority === "Medium"
    ).length;
    const noCount = filtered.filter((task) => task.priority === "No").length;

    return { total, highCount, mediumCount, noCount };
  };

  const { total, highCount, mediumCount, noCount } = getTaskCounts();
  const filteredTasks = getFilteredTasks();

  // Handle adding a new task
  const handleAddTask = (priority) => {
    // You would typically open a modal or navigate to create a task
    console.log(`Adding new task with ${priority} priority`);
    // Implement your add task logic here
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header with Project Name */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {projectName || "Project Tasks"}{" "}
          <Badge className="text-xs dark:bg-slate-700 dark:text-slate-200">
            {total} tasks
          </Badge>
        </h1>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllDropdowns(true)}
                className="h-8 text-xs sm:text-sm cursor-pointer border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                <PiGitMergeDuotone size={14} className="mr-1" />
                <span className="hidden sm:inline">Expand All</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllDropdowns(false)}
                className="h-8 text-xs sm:text-sm cursor-pointer border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                <TbStack2 size={14} className="mr-1" />
                <span className="hidden sm:inline">Collapse All</span>
              </Button>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <IoSearch
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={14}
              />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs sm:text-sm w-[140px] sm:w-[180px] dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-8 text-xs sm:text-sm border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200 dark:bg-slate-700">
                <RiExpandUpDownLine size={14} className="mr-1" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="text-slate-700 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>

            {/* Add Task Button */}
            <Button
              size="sm"
              variant="default"
              onClick={() => handleAddTask("No")}
              className="h-8 text-xs sm:text-sm text-slate-50 cursor-pointer bg-violet-600 dark:bg-violet-700"
            >
              <Plus size={16} className="" />
              <span>New Task</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <BiErrorCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border rounded-lg border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full dark:bg-slate-700" />
                    <Skeleton className="h-4 w-28 dark:bg-slate-700" />
                    <Skeleton className="h-6 w-16 rounded-full dark:bg-slate-700" />
                  </div>
                  <Skeleton className="h-8 w-20 dark:bg-slate-700" />
                </div>
                <Skeleton className="h-32 w-full dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-4">
              {total === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
                    <IoAddCircleOutline
                      size={48}
                      className="mx-auto mb-4 text-slate-400 dark:text-slate-500"
                    />
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                      No tasks found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      {searchQuery
                        ? "No tasks match your search criteria. Try a different search term or clear the search."
                        : "Get started by creating your first task."}
                    </p>
                    <Button
                      onClick={() => handleAddTask("No")}
                      className="text-slate-300 dark:bg-violet-700"
                    >
                      Create a task
                    </Button>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {/* Render sections for High, Medium, and No priority */}
                  {["High", "Medium", "No"].map((priority) => (
                    <motion.div
                      key={priority}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PrioritySection
                        priority={priority}
                        tasks={filteredTasks.filter(
                          (task) => task.priority === priority
                        )}
                        toggleDropdown={toggleDropdown}
                        openDropdowns={openDropdowns}
                        onAddTask={handleAddTask}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeId && activeTask ? (
                <div className="opacity-70 transform scale-105 pointer-events-none">
                  <Task task={activeTask} priority={activeTask.priority} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
