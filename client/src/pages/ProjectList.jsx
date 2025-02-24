import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MdArrowRight } from "react-icons/md";
import { TbFlag3 } from "react-icons/tb";
import { PiDotsThreeBold } from "react-icons/pi";
import { IoAdd } from "react-icons/io5";
import Task from "../component/Task"; // Ensure this component is correct

const PrioritySection = ({
  priority,
  tasks = [], // ✅ Ensure `tasks` is always an array
  toggleDropdown,
  openDropdowns,
}) => {
  const filteredTasks =
    tasks?.filter((task) => task.priority === priority) || [];
  console.log("filtered tasks: " + filteredTasks);

  return (
    <div
      className={`flex gap-2 w-full transition-all text-slate-600 items-start justify-start ${
        openDropdowns[priority] ? "h-fit" : "h-8"
      }`}
    >
      <MdArrowRight
        size={22}
        onClick={() => toggleDropdown(priority)}
        className={`cursor-pointer transition-all h-8 w-8 ${
          openDropdowns[priority] ? "rotate-90" : "rotate-0"
        }`}
      />
      <div className="flex flex-col w-full transition-all">
        <div className="flex justify-start items-center gap-2 text-lg bg-lime-400 p-2 rounded-md">
          <TbFlag3 className={priority === "High" ? "text-red-500" : ""} />
          <h5 className="font-inter font-medium">{priority} Priority</h5>
          <PiDotsThreeBold
            size={22}
            className="hover:bg-slate-200 cursor-pointer p-0.5 rounded"
          />
          <p className="flex gap-0.5 text-sm cursor-pointer hover:bg-slate-200 p-0.5 px-2 rounded items-center justify-center">
            <IoAdd size={18} />
            Add task
          </p>
        </div>

        {/* Drag-and-Drop List */}
        {openDropdowns[priority] && filteredTasks.length > 0 && (
          <div className="flex flex-col w-full p-2 bg-gray-100 rounded-lg">
            <div className="flex w-full font-semibold">
              <p className="w-1/3">Name</p>
              <p className="w-1/3">Status</p>
              <p className="w-1/3">Priority</p>
            </div>
            <SortableContext
              items={filteredTasks.map((task) => task?._id || "")} // ✅ Ensure valid IDs
              strategy={verticalListSortingStrategy}
            >
              {filteredTasks?.map((task) =>
                task?._id ? <Task key={task._id} task={task} /> : null
              )}
            </SortableContext>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectList = ({ tasks = [], setTasks }) => {
  const [openDropdowns, setOpenDropdowns] = useState({
    No: true,
    Low: true,
    Medium: true,
    High: true,
  });

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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    if (active.id !== over.id) {
      setTasks((prevTasks) => {
        const oldIndex = prevTasks.findIndex((task) => task._id === active.id);
        const newIndex = prevTasks.findIndex((task) => task._id === over.id);

        if (oldIndex === -1 || newIndex === -1) return prevTasks; // ✅ Prevents errors

        return arrayMove(prevTasks, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full flex flex-col gap-4">
        {["No", "Low", "Medium", "High"].map((priority) => (
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
  );
};

export default ProjectList;
