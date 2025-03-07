import React, { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { setTasks, updateTask, addTask, deleteTask } from "../store/taskSlice";
import { setStatuses } from "../store/statusSlice";
import requestServer from "../utils/requestServer";

// Shadcn UI Components
import { CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

import { Search, Filter, ChevronsUpDown, Plus } from "lucide-react";
import Column from "../component/Column";
import TaskItem from "../component/TaskItem";
import AddStatusPopup from "../component/AddStatusPopup";

const ProjectDetail = () => {
  // State Management
  const [activeTaskStatusId, setActiveTaskStatusId] = useState(null); // Track which column has an open task popup
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusPopup, setShowStatusPopup] = useState(false);

  // Advanced Filtering States
  const [filterOptions, setFilterOptions] = useState({
    priority: null,
    assignee: null,
    dueDate: null,
  });

  // Redux
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user?._id);
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const projectName = useSelector(
    (state) => state.project.currentProject?.name
  );
  const tasks = useSelector((state) => state.task.tasks);
  const statuses = useSelector((state) => state.status.statuses);

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
      if (!projectId) {
        console.log("No project ID available");
        return;
      }

      console.log("Fetching statuses for project:", projectId);
      const res = await requestServer(`status/all/${projectId}`);
      console.log("Fetched statuses:", res.data);

      // Update Redux store with fresh data
      dispatch(setStatuses(res.data));
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      if (!projectId) {
        console.log("No project ID available");
        return;
      }

      console.log("Fetching tasks for project:", projectId);
      const res = await requestServer(`task/all/${projectId}`);
      console.log("Fetched tasks:", res.data);

      // Dispatch tasks to Redux store
      dispatch(setTasks(res.data));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const updateCurrentTask = async (task) => {
    try {
      await requestServer(`task/update/${task._id}`, task);
      // State update is handled in the drag handlers
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Drag and Drop Handlers
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

      // Update Redux store
      dispatch(updateTask(taskWithNewStatus));

      updateCurrentTask(taskWithNewStatus);
    }
  };

  // Task Management
  const handleAddTask = async (taskData) => {
    try {
      const newTask = await requestServer("task/create", taskData);

      // Update Redux store
      dispatch(addTask(newTask.data));

      // Close the task popup for the specific status
      setActiveTaskStatusId(null);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await requestServer(`task/delete/${taskId}`);

      // Update Redux store
      dispatch(deleteTask(taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Task Counts
  const getTaskCounts = () => {
    const total = tasks.length;
    return { total };
  };

  const { total } = getTaskCounts();

  // Load data on component mount and when projectId changes
  useEffect(() => {
    const loadData = async () => {
      if (projectId) {
        setLoading(true);
        // Clear existing data first
        dispatch(setStatuses([]));
        dispatch(setTasks([]));

        // Then fetch fresh data
        await Promise.all([fetchStatuses(), fetchTasks()]);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, dispatch]);

  // Refresh data when AddStatusPopup closes
  useEffect(() => {
    if (!showStatusPopup && projectId) {
      fetchStatuses();
    }
  }, [showStatusPopup, projectId]);

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
          {/* Add Status Button */}
          {projectId && (
            <Button
              onClick={() => setShowStatusPopup(true)}
              size="sm"
              className="bg-violet-600 text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Add status
            </Button>
          )}
          <AddStatusPopup
            open={showStatusPopup}
            setOpen={setShowStatusPopup}
            isEdit={false}
            onSuccess={fetchStatuses}
            projectId={projectId}
          />

          {/* Sort Button */}
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 text-slate-800"
          >
            <ChevronsUpDown className="mr-1 h-4 w-4" /> Sort
          </Button>

          {/* Filter Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-800"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 z-50">
              {/* Filter options implementation */}
              <div className="space-y-2 p-2">
                <h3 className="font-medium">Filter Options</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    Filter implementation would go here
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search */}
          <div className="relative z-10">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading...</span>
        </div>
      )}

      {/* Columns */}
      {!loading && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {statuses.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>No statuses found. Add a status to get started.</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {statuses.map((status) => (
                <Column
                  key={status._id}
                  status={status}
                  tasks={filteredTasks.filter(
                    (task) => task.status === status._id
                  )}
                  isTaskOpen={activeTaskStatusId === status._id}
                  setTaskOpen={(isOpen) => {
                    setActiveTaskStatusId(isOpen ? status._id : null);
                  }}
                  setEditTaskOpen={setEditTaskOpen}
                  isLoading={loading}
                  projectId={projectId}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTask}
                />
              ))}
            </div>
          )}

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <TaskItem
                task={activeTask}
                status={activeTaskStatus}
                setTaskOpen={() => {}}
                taskOpen={false}
                setEditTaskOpen={setEditTaskOpen}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default ProjectDetail;
