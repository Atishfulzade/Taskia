import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import PrioritySection from "../component/PrioritySection";
import { TbStack2 } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";
import { RiExpandUpDownLine } from "react-icons/ri";
import { IoFilter } from "react-icons/io5";
import { GoPeople, GoPerson } from "react-icons/go";

const ProjectList = ({}) => {
  const [tasks, setTasks] = useState([
    {
      _id: "1",
      name: "Set up project structure",
      status: "Pending",
      priority: "No",
      primaryColor: "bg-gray-300",
    },
    {
      _id: "2",
      name: "Design homepage UI",
      status: "In Progress",
      priority: "High",
      primaryColor: "bg-violet-300",
    },
    {
      _id: "3",
      name: "Implement authentication system",
      status: "Completed",
      priority: "Medium",
      primaryColor: "bg-yellow-300",
    },
    {
      _id: "4",
      name: "Create reusable components",
      status: "Todo",
      priority: "Medium",
      primaryColor: "bg-yellow-300",
    },
    {
      _id: "5",
      name: "Optimize images and assets",
      status: "In Progress",
      priority: "High",
      primaryColor: "bg-red-300",
    },
    {
      _id: "6",
      name: "Connect frontend with backend API",
      status: "Completed",
      priority: "Medium",
      primaryColor: "bg-yellow-300",
    },
    {
      _id: "7",
      name: "Set up database schema",
      status: "Pending",
      priority: "Low",
      primaryColor: "bg-green-300",
    },
    {
      _id: "8",
      name: "Implement role-based access control",
      status: "In Progress",
      priority: "Medium",
      primaryColor: "bg-yellow-300",
    },
    {
      _id: "9",
      name: "Write unit tests for components",
      status: "Todo",
      priority: "No",
      primaryColor: "bg-yellow-300",
    },
    {
      _id: "10",
      name: "Deploy project on cloud server",
      status: "Completed",
      priority: "Medium",
      primaryColor: "bg-yellow-300",
    },
    {
      _id: "11",
      name: "Improve website performance",
      status: "Completed",
      priority: "Low",
      primaryColor: "bg-green-300",
    },
  ]);

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

    if (!over) return; // Exit if dropped outside

    const taskId = active.id;
    const newPriority = over.data.current?.priority; // Get the new priority from drop target

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, priority: newPriority } : task
      )
    );
  };

  return (
    <div className="flex flex-col ">
      <div className="flex gap-2 w-full items-center mb-2 justify-between">
        <div className="flex text-slate-600 font-inter gap-1">
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <TbStack2 size={18} />
            Group: Status
          </div>
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <PiGitMergeDuotone size={18} />
            SubTask: Collapse all
          </div>
        </div>
        <div className="flex text-slate-600 font-inter gap-1 items-center">
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <RiExpandUpDownLine size={18} />
            Filter
          </div>
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <IoFilter size={18} />
            Sort
          </div>
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPerson size={18} />
            Me mode
          </div>
          <div className="flex border cursor-pointer dark:text-slate-200 border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPeople size={18} />
            Assignee
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
        <div className="w-full flex  flex-col gap-4 overflow-y-auto  h-[calc(100vh-150px)]">
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
    </div>
  );
};

export default ProjectList;
