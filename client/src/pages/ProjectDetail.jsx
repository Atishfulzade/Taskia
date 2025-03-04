"use client";

import { useState, useEffect, useRef } from "react";
import { DndContext, closestCorners, DragOverlay } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { setTasks, updateTask } from "../store/taskSlice";
import { setStatuses } from "../store/statusSlice";
import requestServer from "../utils/requestServer";
import bgColors from "../utils/constant";

// Components
import Column from "../component/Column";
import AddTaskPopup from "../component/AddTaskPopup";
import TaskItem from "../component/TaskItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import { TbStack2 } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";
import { IoFilter, IoSearch } from "react-icons/io5";
import { RiExpandUpDownLine } from "react-icons/ri";
import { GoPeople, GoPerson } from "react-icons/go";
import { LuPlus } from "react-icons/lu";
import { MdOutlineViewKanban } from "react-icons/md";

const ProjectDetail = () => {
  // State
  const [taskOpen, setTaskOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // "all" or "me"
  const [searchQuery, setSearchQuery] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [editTaskOpen, setEditTaskOpen] = useState({
    isOpen: false,
    task: null,
  });

  // Refs
  const scrollContainerRef = useRef(null);

  // Redux
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user?._id);
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const statuses = useSelector((state) => state.status?.statuses);
  const tasks = useSelector((state) => state.task?.tasks);
  const projectName = useSelector(
    (state) => state.project.currentProject?.name
  );

  // Fetch Statuses
  const fetchStatuses = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await requestServer(`status/all/${projectId}`);
      dispatch(setStatuses(res.data));
    } catch (error) {
      console.error("Error fetching statuses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    if (!projectId || !userId) return;
    try {
      setLoading(true);
      const res = await requestServer(`task/all/${projectId}`);
      dispatch(setTasks(res.data));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update Task Status
  const updateCurrentTask = async (task) => {
    try {
      dispatch(updateTask(task));
      await requestServer(`task/update/${task._id}`, { ...task });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Filter tasks based on view mode and search query
  const getFilteredTasks = (statusId) => {
    return tasks.filter((task) => {
      // Filter by status
      if (task.status !== statusId) return false;

      // Filter by view mode
      if (viewMode === "me" && task.assignedTo !== userId) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
        );
      }

      return true;
    });
  };

  // Handle Drag Start
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Find the dragged task
    const draggedTask = tasks.find((task) => task._id === active.id);
    setActiveTask(draggedTask);
  };

  // Handle Drag End
  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    // Find the dragged task
    const updatedTask = tasks.find((task) => task._id === taskId);
    if (updatedTask && updatedTask.status !== newStatus) {
      // Update task with new status
      const taskWithNewStatus = { ...updatedTask, status: newStatus };

      // Optimistically update state
      dispatch(updateTask(taskWithNewStatus));

      // Send update request to server
      updateCurrentTask(taskWithNewStatus);
    }
  };

  // Add new task button handler
  const handleAddNewTask = () => {
    // Set default status to first column if none selected
    if (!currentStatus && statuses.length > 0) {
      setCurrentStatus(statuses[0]);
    }
    setTaskOpen(true);
  };

  // Load data on component mount
  useEffect(() => {
    if (projectId) {
      fetchStatuses();
      fetchTasks();
    }
  }, [projectId]); // Removed fetchStatuses and fetchTasks dependencies

  // Get task counts
  const getTaskCounts = () => {
    const total = tasks.length;
    const myTasks = tasks.filter((task) => task.assignedTo === userId).length;
    return { total, myTasks };
  };

  const { total, myTasks } = getTaskCounts();

  return (
    <div className="h-full w-full bg-slate-50 z-0 dark:bg-slate-900">
      {/* Project Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {projectName || "Project Dashboard"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <MdOutlineViewKanban className="text-violet-500" size={16} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Kanban Board
              </span>
              <Badge variant="outline" className="ml-2">
                {total} tasks
              </Badge>
            </div>
          </div>

          {/* <Button
            onClick={handleAddNewTask}
            className="flex items-center gap-1"
          >
            <LuPlus size={16} />
            New Task
          </Button> */}
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-[85px] z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <Tabs
              defaultValue="all"
              value={viewMode}
              onValueChange={setViewMode}
              className="mr-4"
            >
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <GoPeople size={14} />
                  <span>All Tasks</span>
                  <Badge variant="secondary" className="ml-1">
                    {total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="me" className="flex items-center gap-1">
                  <GoPerson size={14} />
                  <span>My Tasks</span>
                  <Badge variant="secondary" className="ml-1">
                    {myTasks}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubtasks(!showSubtasks)}
              className={`flex items-center gap-1 ${
                showSubtasks ? "bg-slate-100 dark:bg-slate-700" : ""
              }`}
            >
              <PiGitMergeDuotone size={16} />
              <span className="hidden sm:inline">Subtasks</span>
            </Button>

            {/* Group By */}

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <TbStack2 size={16} />
              <span className="hidden sm:inline">Group by Status</span>
            </Button>

            {/* Filter */}

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <IoFilter size={14} />
              <span className="hidden sm:inline">Filter</span>
            </Button>

            {/* Sort */}

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <RiExpandUpDownLine size={16} />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <IoSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={16}
            />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px] md:w-[250px]"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollContainerRef}
          className="p-6 overflow-x-auto h-[calc(100vh-170px)] w-full"
        >
          {loading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[280px] h-[calc(100vh-200px)] rounded-lg"
                >
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-24 w-full mb-2" />
                  <Skeleton className="h-24 w-full mb-2" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4">
              {statuses
                ?.filter((status) => status.projectId === projectId)
                .map((status, i) => (
                  <Column
                    key={status._id}
                    status={{
                      ...status,
                      color: bgColors[i % bgColors.length] || bgColors[0],
                    }}
                    setEditTaskOpen={setEditTaskOpen}
                    setTaskOpen={setTaskOpen}
                    tasks={getFilteredTasks(status._id)}
                    selectedStatus={setCurrentStatus}
                    showSubtasks={showSubtasks}
                    isLoading={loading}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeTask ? (
            <div className="opacity-80 transform scale-105 pointer-events-none">
              <TaskItem task={activeTask} setEditTaskOpen={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Popups */}
      <AnimatePresence>
        {editTaskOpen.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AddTaskPopup
              setTaskOpen={() => setEditTaskOpen({ isOpen: false, task: {} })}
              currentStatus={currentStatus}
              taskData={editTaskOpen.task}
              isEdit={true}
            />
          </motion.div>
        )}

        {taskOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AddTaskPopup
              status={statuses}
              setTaskOpen={setTaskOpen}
              currentStatus={currentStatus}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetail;
