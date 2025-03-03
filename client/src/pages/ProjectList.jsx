import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Loader from "../component/Loader";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useDispatch, useSelector } from "react-redux";
import PrioritySection from "../component/PrioritySection";
import { TbStack2 } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";
import { RiExpandUpDownLine } from "react-icons/ri";
import { IoFilter } from "react-icons/io5";
import { GoPeople, GoPerson } from "react-icons/go";
import requestServer from "../utils/requestServer";
import { updateTask } from "../store/taskSlice";

const ProjectList = () => {
  const dispatch = useDispatch();
  const storedTasks = useSelector((state) => state.task.tasks);
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const userId = useSelector((state) => state.user.userId); // Get current user ID from Redux store
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({
    No: true,
    Medium: true,
    High: true,
  });

  // Sync tasks with Redux store
  useEffect(() => {
    if (!projectId) return;

    // Fetch tasks when the projectId changes
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await requestServer(`task/all/${projectId}`);
        console.log("task", response.data);

        setTasks(response.data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]); // Reset tasks if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]); // Depend on projectId

  // Toggle dropdown for priority sections
  const toggleDropdown = (priority) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [priority]: !prev[priority],
    }));
  };

  // Sensors for drag-and-drop functionality
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update task priority in the backend and Redux store
  const updateCurrentTask = async (updatedTask) => {
    try {
      setLoading(true);
      dispatch(updateTask(updatedTask)); // Update Redux store
      const response = await requestServer(
        `task/update/${updatedTask._id}`,
        updatedTask
      );
      console.log("Update Task Response:", response); // Debugging
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle drag-and-drop events
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return; // Exit if dropped outside

    const taskId = active.id;
    const newPriority = over.data.current?.priority; // Get new priority from drop target

    if (!newPriority) return;

    // Update local state
    setTasks((prevTasks) => {
      return prevTasks.map((task) =>
        task._id === taskId ? { ...task, priority: newPriority } : task
      );
    });

    // Update backend and Redux store
    const draggedTask = tasks.find((task) => task._id === taskId);
    if (draggedTask) {
      updateCurrentTask({ ...draggedTask, priority: newPriority });
    }
  };

  // Filter tasks to show only assigned tasks
  const filterAssignedTasks = (tasks) => {
    return tasks.filter(
      (task) =>
        task.assignedTo === userId || // Tasks assigned to the current user
        task.assignedBy !== userId // Tasks assigned by the current user
    );
  };

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="flex gap-2 w-full items-center mb-2 justify-between">
        <div className="flex text-slate-600 font-inter gap-1">
          {/* Group by Status */}
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <TbStack2 size={18} /> Group: Status
          </div>

          {/* Collapse Subtasks */}
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <PiGitMergeDuotone size={18} /> SubTask: Collapse all
          </div>
        </div>

        {/* Filter, Sort, and Search Section */}
        <div className="flex text-slate-600 font-inter gap-1 items-center">
          {/* Filter */}
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <RiExpandUpDownLine size={18} /> Filter
          </div>

          {/* Sort */}
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <IoFilter size={18} /> Sort
          </div>

          {/* Me Mode */}
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPerson size={18} /> Me mode
          </div>

          {/* Assignee */}
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPeople size={18} /> Assignee
          </div>

          {/* Divider */}
          <span className="h-6 w-[1px] bg-slate-300 mx-2"></span>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search..."
            className="border border-slate-300 dark:text-slate-200 dark:placeholder:text-slate-400 focus:outline-1 outline-violet-300 w-48 px-2 text-sm py-[3px] rounded"
          />
        </div>
      </div>

      {/* Drag-and-Drop Context */}
      {loading ? (
        <Loader />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="w-full flex flex-col gap-4 overflow-y-auto h-[calc(100vh-150px)]">
            {["No", "Medium", "High"].map((priority) => (
              <PrioritySection
                key={priority}
                priority={priority}
                tasks={filterAssignedTasks(tasks).filter(
                  (task) => task.priority === priority
                )} // Filter tasks by priority and assigned status
                toggleDropdown={toggleDropdown}
                openDropdowns={openDropdowns}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
};

export default ProjectList;
