import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IoAdd } from "react-icons/io5";
import { RiDraggable } from "react-icons/ri";
import { RiCheckboxBlankCircleLine } from "react-icons/ri";
import { TbFlag3Filled } from "react-icons/tb";
import { LiaPenSolid } from "react-icons/lia";

const Task = ({ task, priority }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id, data: { priority } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const flagColor = (task) => {
    switch (task.priority) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="dark:bg-slate-800 border-b bg-white group border-slate-200 dark:border-slate-500 p-1.5 dark:hover:bg-slate-900 flex justify-start items-center gap-2 rounded hover:bg-slate-50 cursor-grab"
    >
      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <RiDraggable />
      </div>
      <p className="w-1/2 text-md font-inter text-slate-900 dark:text-slate-100 flex font-semibold gap-1 items-center">
        <RiCheckboxBlankCircleLine size={20} className="text-violet-600" />
        {task.name}
      </p>
      <div className="w-1/3  ">
        <p
          className={`w-fit py-0.5 rounded-md px-4  text-white ${task.primaryColor}`}
        >
          {task.status}
        </p>
      </div>
      <div className="flex opacity-0 group-hover:opacity-100 gap-2">
        <IoAdd className="h-6 w-6 border border-slate-200 rounded-md dark:text-slate-300 dark:border-slate-500 dark:hover:bg-slate-600 p-1 cursor-pointer text-slate-700 hover:bg-slate-200" />
        <LiaPenSolid className="h-6 w-6 border border-slate-200 rounded-md dark:text-slate-300 dark:border-slate-500 dark:hover:bg-slate-600 p-1 cursor-pointer text-slate-700 hover:bg-slate-200" />
      </div>
      <p className="w-1/3 text-sm  ml-20  dark:text-white text-slate-500">
        <TbFlag3Filled size={22} className={flagColor(task)} />
      </p>
    </div>
  );
};

export default Task;
