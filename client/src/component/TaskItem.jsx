import { useDraggable } from "@dnd-kit/core";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaRegCalendar } from "react-icons/fa";
import { TbFlag3 } from "react-icons/tb";
import { TbFlag3Filled } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";

export default function TaskItem({ task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="border shadow my-1 select-none h-fit border-slate-200 bg-white rounded-lg cursor-grab hover:bg-slate-100"
      style={{
        padding: "10px",

        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
    >
      <h4 className="text-slate-800 font-inter font-medium text-wrap leading-5 line-clamp-2">
        {task}
      </h4>
      <div className="flex mt-3 gap-1.5">
        <div className="flex cursor-pointer">
          {/* <FaRegCircleUser size={14} className="border text-slate-700 border-slate-200 p-1 w-7 h-7 rounded" /> */}
          <span className="border text-white text-center flex items-center bg-violet-600 rounded-full border-slate-300 p-1 w-7 h-7 text-xs">
            DN
          </span>
        </div>
        <div className="flex border cursor-pointer border-slate-200 gap-0.5 p-1 w-fit justify-center items-center h-7 rounded">
          <FaRegCalendar size={14} className="text-slate-700" />
          <p className="text-red-600 text-sm font-inter">Jan 24</p>
        </div>
        <div className="flex cursor-pointer border border-slate-200 p-1 w-fit gap-0.5 justify-center items-center  rounded">
          <TbFlag3Filled size={16} className="text-red-700" />
          <p className=" text-sm text-slate-600 font-inter ml-0.5">Urgent</p>
        </div>
      </div>
      <div className="flex cursor-pointer mt-3 gap-1.5 justify-start text-sm items-center">
        <PiGitMergeDuotone className="text-slate-500" />{" "}
        <p className="text-slate-600">7 subtask</p>
      </div>
    </div>
  );
}
