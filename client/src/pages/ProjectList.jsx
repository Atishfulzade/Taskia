import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, setTasks } from '../store/taskSlice';
import requestServer from '../utils/requestServer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

// Icons
import {
  Search,
  Plus,
  AlertCircle,
  ArrowDownUp,
  FolderOpen,
  Layers,
} from 'lucide-react';

// Components
import PrioritySection from '../component/PrioritySection';
import Task from '../component/Task';
import AddTaskPopup from '../component/AddTaskPopup';
import { toast } from 'sonner';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState({
    High: true,
    Medium: true,
    No: true,
  });
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [availablePriorities, setAvailablePriorities] = useState([
    'High',
    'Medium',
    'No',
  ]);

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
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
      dispatch(setTasks([]));
    } finally {
      setLoading(false);
    }
  }, [projectId, dispatch]);

  // Load tasks when the component mounts or projectId changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Update task priority in the backend & Redux store
  const updateCurrentTask = useCallback(
    async (updatedTask) => {
      try {
        dispatch(updateTask(updatedTask)); // Optimistically update Redux store
        await requestServer(`task/update/${updatedTask._id}`, updatedTask);
      } catch (error) {
        console.error('Error updating task:', error);
        // If the update fails, refresh tasks to get the correct state
        fetchTasks();
      }
    },
    [dispatch, fetchTasks]
  );

  // Handle Drag Start
  const handleDragStart = useCallback(
    (event) => {
      const { active } = event;
      setActiveId(active.id);

      // Find the dragged task
      const draggedTask = storedTasks.find((task) => task._id === active.id);
      setActiveTask(draggedTask);
    },
    [storedTasks]
  );

  // Handle Drag End
  const handleDragEnd = useCallback(
    (event) => {
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
    },
    [storedTasks, updateCurrentTask]
  );

  // Toggle dropdowns for priority sections
  const toggleDropdown = useCallback(
    (priority) =>
      setOpenDropdowns((prev) => ({ ...prev, [priority]: !prev[priority] })),
    []
  );

  // Toggle all dropdowns
  const toggleAllDropdowns = useCallback(
    (value) => {
      setOpenDropdowns((prev) => {
        const newState = { ...prev };
        availablePriorities.forEach((priority) => {
          newState[priority] = value;
        });
        return newState;
      });
    },
    [availablePriorities]
  );

  // Add a new priority
  const handleAddPriority = useCallback(
    (priorityName, color) => {
      if (!availablePriorities.includes(priorityName)) {
        setAvailablePriorities((prev) => [...prev, priorityName]);
        setOpenDropdowns((prev) => ({ ...prev, [priorityName]: true }));
      }
    },
    [availablePriorities]
  );

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...storedTasks];

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
      case 'dueDate':
        filtered.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'created':
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // No additional sorting needed
        break;
    }

    return filtered;
  }, [storedTasks, searchQuery, sortBy, userId]);

  // Task counts by priority
  const taskCounts = useMemo(() => {
    const counts = {};
    availablePriorities.forEach((priority) => {
      counts[priority] = filteredTasks.filter(
        (task) => task.priority === priority
      ).length;
    });
    return counts;
  }, [filteredTasks, availablePriorities]);

  // Total task count
  const totalTasks = useMemo(() => {
    return filteredTasks.length;
  }, [filteredTasks]);

  // Handle adding a new task
  const handleAddTask = useCallback((priority) => {
    setSelectedPriority(priority);
    setIsAddTaskOpen(true);
  }, []);

  // Handle deleting a task
  const handleDeleteTask = useCallback(
    async (taskId) => {
      try {
        await requestServer(`task/delete/${taskId}`);
        // Remove task from Redux store
        dispatch(setTasks(storedTasks.filter((task) => task._id !== taskId)));
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    },
    [dispatch, storedTasks]
  );

  return (
    <div className="flex flex-col h-full w-full ">
      {/* Header with Project Name */}
      <div className="bg-white dark:bg-slate-800  border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {projectName || 'Project Tasks'}{' '}
            <Badge variant="secondary" className="ml-2 text-xs">
              {totalTasks} tasks
            </Badge>
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {availablePriorities.map((priority) => (
              <Badge
                key={priority}
                variant="outline"
                className={`
                  ${
                    priority === 'High'
                      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                      : priority === 'Medium'
                      ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                      : priority === 'No'
                      ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                      : 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                  }
                `}
              >
                {priority}: {taskCounts[priority] || 0}
              </Badge>
            ))}
          </div>
        </div>
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
                className="h-9 text-sm border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <FolderOpen className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Expand All</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllDropdowns(false)}
                className="h-9 text-sm border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Layers className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Collapse All</span>
              </Button>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm w-full sm:w-[220px] dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-9 text-sm border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200 dark:bg-slate-700">
                <ArrowDownUp className="h-4 w-4 mr-1.5" />
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
              onClick={() => handleAddTask('No')}
              className="h-9 text-sm text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-800"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>New Task</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="m-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border rounded-lg border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800"
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
              {totalTasks === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm max-w-md mx-auto">
                    <div className="h-16 w-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                      No tasks found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {searchQuery
                        ? 'No tasks match your search criteria. Try a different search term or clear the search.'
                        : 'Get started by creating your first task for this project.'}
                    </p>
                    <Button
                      onClick={() => handleAddTask('No')}
                      className="bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-700 dark:hover:bg-violet-800"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Create a task
                    </Button>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {/* Render sections for all available priorities */}
                  {availablePriorities.map((priority) => (
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
                        onTaskDelete={handleDeleteTask}
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

      {/* Add Task Popup */}
      <AddTaskPopup
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        initialPriority={selectedPriority}
        isEdit={false}
        showStatus={true}
        showPriority={false}
        availablePriorities={availablePriorities}
        onAddPriority={handleAddPriority}
      />
    </div>
  );
};

export default ProjectList;
