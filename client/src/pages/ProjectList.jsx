import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useDispatch, useSelector } from "react-redux";
import requestServer from "../utils/requestServer";
import { updateTask } from "../store/taskSlice";
import { setTasks } from "../store/taskSlice"; // Ensure tasks are set in Redux

import Loader from "../component/Loader";
import PrioritySection from "../component/PrioritySection";
import { TbStack2 } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";
import { RiExpandUpDownLine } from "react-icons/ri";
import { IoFilter } from "react-icons/io5";
import { GoPeople, GoPerson } from "react-icons/go";

const ProjectList = () => {
  const dispatch = useDispatch();

  const storedTasks = useSelector((state) => state.task.tasks);
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const userId = useSelector((state) => state.user.user?._id);

  const [loading, setLoading] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({
    No: true,
    Medium: true,
    High: true,
  });

  // Load tasks when the projectId changes
  useEffect(() => {
    if (!projectId || storedTasks.length) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await requestServer(`task/all/${projectId}`);
        dispatch(setTasks(response.data || []));
      } catch (error) {
        console.error("Error fetching tasks:", error);
        dispatch(setTasks([]));
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, storedTasks.length]);

  // Drag-and-Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update task priority in the backend & Redux store
  const updateCurrentTask = async (updatedTask) => {
    try {
      dispatch(updateTask(updatedTask)); // Update Redux store
      await requestServer(`task/update/${updatedTask._id}`, updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Handle Drag-and-Drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newPriority = over.data.current?.priority;

    if (!newPriority) return;

    const draggedTask = storedTasks.find((task) => task._id === taskId);
    if (draggedTask && draggedTask.priority !== newPriority) {
      const updatedTask = { ...draggedTask, priority: newPriority };
      dispatch(updateTask(updatedTask));
      updateCurrentTask(updatedTask);
    }
  };

  // Toggle dropdowns for priority sections
  const toggleDropdown = (priority) =>
    setOpenDropdowns((prev) => ({ ...prev, [priority]: !prev[priority] }));

  // Filter assigned tasks
  const filterAssignedTasks = (tasks) =>
    tasks.filter(
      (task) =>
        task.assignedTo === userId || // Tasks assigned to the current user
        task.assignedBy == userId // Tasks assigned by the current user
    );

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="flex gap-2 w-full items-center mb-2 justify-between">
        <div className="flex text-slate-600 font-inter gap-1">
          <button className="flex border dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 gap-1 text-sm">
            <TbStack2 size={18} /> Group: Status
          </button>
          <button className="flex border dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 gap-1 text-sm">
            <PiGitMergeDuotone size={18} /> SubTask: Collapse all
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex text-slate-600 font-inter gap-1 items-center">
          <button className="flex border dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 gap-1 text-sm">
            <RiExpandUpDownLine size={18} /> Filter
          </button>
          <button className="flex border dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 gap-1 text-sm">
            <IoFilter size={18} /> Sort
          </button>
          <button className="flex border dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 gap-1 text-sm">
            <GoPerson size={18} /> Me mode
          </button>
          <button className="flex border dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 gap-1 text-sm">
            <GoPeople size={18} /> Assignee
          </button>
          <span className="h-6 w-[1px] bg-slate-300 mx-2"></span>
          <input
            type="text"
            placeholder="Search..."
            className="border border-slate-300 dark:text-slate-200 dark:placeholder:text-slate-400 focus:outline-1 outline-violet-300 w-48 px-2 text-sm py-[3px] rounded"
          />
        </div>
      </div>

      {/* Task Sections */}
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
                tasks={filterAssignedTasks(storedTasks).filter(
                  (task) => task.priority === priority
                )}
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
