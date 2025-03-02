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

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({
    No: true,
    Medium: true,
    High: true,
  });

  useEffect(() => {
    if (storedTasks.length) {
      setTasks(storedTasks);
    }
  }, [storedTasks]);

  const toggleDropdown = (priority) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [priority]: !prev[priority],
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateCurrentTask = async (updatedTask) => {
    try {
      dispatch(updateTask(updatedTask)); // Update Redux store
      await requestServer(`task/update/${updatedTask._id}`, {
        method: "PUT",
        body: JSON.stringify(updatedTask),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return; // Exit if dropped outside

    const taskId = active.id;
    const newPriority = over.data.current?.priority; // Get new priority from drop target

    if (!newPriority) return;

    setTasks((prevTasks) => {
      return prevTasks.map((task) =>
        task._id === taskId ? { ...task, priority: newPriority } : task
      );
    });

    const draggedTask = tasks.find((task) => task._id === taskId);
    if (draggedTask) {
      updateCurrentTask({ ...draggedTask, priority: newPriority });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 w-full items-center mb-2 justify-between">
        <div className="flex text-slate-600 font-inter gap-1">
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <TbStack2 size={18} /> Group: Status
          </div>
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <PiGitMergeDuotone size={18} /> SubTask: Collapse all
          </div>
        </div>
        <div className="flex text-slate-600 font-inter gap-1 items-center">
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <RiExpandUpDownLine size={18} /> Filter
          </div>
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <IoFilter size={18} /> Sort
          </div>
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPerson size={18} /> Me mode
          </div>
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPeople size={18} /> Assignee
          </div>
          <span className="h-6 w-[1px] bg-slate-300 mx-2"></span>
          <input
            type="text"
            placeholder="Search..."
            className="border border-slate-300 dark:text-slate-200 dark:placeholder:text-slate-400 focus:outline-1 outline-violet-300 w-48 px-2 text-sm py-[3px] rounded "
          />
        </div>
      </div>

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
              tasks={tasks}
              toggleDropdown={toggleDropdown}
              openDropdowns={openDropdowns}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default ProjectList;
