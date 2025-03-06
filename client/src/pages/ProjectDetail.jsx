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
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

import { Search, Filter, ChevronsUpDown, Plus } from "lucide-react";
import Column from "@/component/Column";
import TaskItem from "@/component/TaskItem"; // Import TaskItem component
import AddStatusPopup from "@/component/AddStatusPopup";

const ProjectDetail = () => {
  // State Management
  const [taskOpen, setTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false); // Add this for edit task popup
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showStatusPopup, setShowStatusPopup] = useState(false);

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

  // Find the status for the active task
  const activeTaskStatus = useMemo(() => {
    if (!activeTask) return null;
    return statuses.find((status) => status._id === activeTask.status);
  }, [activeTask, statuses]);

  // Fetch and Update Functions
  const fetchStatuses = async () => {
    try {
      const res = await requestServer(`status/all/${projectId}`);
      dispatch(setStatuses(res.data));
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await requestServer(`task/all/${projectId}`);
      dispatch(setTasks(res.data));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const updateCurrentTask = async (task) => {
    try {
      await requestServer(`task/update/${task._id}`, task);
    } catch (error) {
      console.error("Error updating task:", error);
    }
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
    return { total };
  };

  const { total } = getTaskCounts();

  // Load data on component mount
  useEffect(() => {
    if (projectId) {
      fetchStatuses();
      fetchTasks();
    }
  }, [projectId]);

  return (
    <div className="h-full w-full px-6 z-10">
      {/* Project Header */}
      <div className="flex justify-between items-center mb-2 p-2">
        <div>
          <CardTitle className="text-xl font-semibold flex gap-3.5 text-slate-800">
            {projectName || "Project Dashboard"} <Badge>{total} Tasks</Badge>
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {/* View Mode */}
          <Button
            onClick={() => setShowStatusPopup(true)}
            size="sm"
            className="bg-violet-600 cursor-pointer text-white"
          >
            <Plus className="h-4 w-4" /> Add status
          </Button>
          <AddStatusPopup
            open={showStatusPopup}
            setOpen={setShowStatusPopup}
            isEdit={false}
          />
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 text-slate-800 cursor-pointer"
          >
            <ChevronsUpDown className="mr-0 h-4 w-4" /> Sort
          </Button>

          {/* Advanced Filtering */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-800"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 z-50">
              {/* Filter options implementation */}
            </PopoverContent>
          </Popover>

          {/* Search */}
          <div className="relative z-[1]">
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

      {/* Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto">
          {statuses.map((status) => (
            <Column
              key={status._id}
              status={status}
              tasks={filteredTasks.filter((task) => task.status === status._id)}
              setTaskOpen={setTaskOpen}
              taskOpen={taskOpen}
              setEditTaskOpen={setEditTaskOpen}
              isLoading={loading}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskItem
              task={activeTask}
              status={activeTaskStatus}
              setTaskOpen={setTaskOpen}
              taskOpen={false}
              setEditTaskOpen={setEditTaskOpen}
              isDragging={true} // Important flag to handle special drag state
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default ProjectDetail;
