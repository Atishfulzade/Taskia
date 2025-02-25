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
      className="border  my-1 select-none h-fit border-slate-50 bg-white rounded-lg cursor-grab hover:bg-slate-50"
      style={{
        padding: "10px",

        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
    >
      <h4 className="text-stone-600 font-inter text-sm font-medium text-wrap leading-5 line-clamp-2">
        {task}
      </h4>
      <div className="flex mt-3 gap-1.5">
        <div className="flex cursor-pointer">
          {/* <FaRegCircleUser size={14} className="border text-slate-700 border-slate-200 p-1 w-7 h-7 rounded" /> */}
          <span className="border text-white  flex items-center justify-center pt-[2px] bg-violet-600 rounded-full border-slate-300 w-6 h-6 text-[11px]">
            AF
          </span>
        </div>
        <div className="flex border cursor-pointer border-slate-200 gap-0.5 px-1 py-0.5 h-fit justify-center items-center  rounded">
          <FaRegCalendar size={12} className="text-slate-500" />
          <p className="text-red-600 text-[12px] font-inter">Jan 24</p>
        </div>
        <div className="flex border cursor-pointer border-slate-200 gap-0.5 px-1 py-0.5 h-fit justify-center items-center  rounded">
          <TbFlag3 size={14} className="text-slate-500" />
          <p className="text-red-600 text-[12px] font-inter">Urgent</p>
        </div>
      </div>
      <div className="flex cursor-pointer mt-3 gap-1.5 justify-start text-sm items-center">
        <PiGitMergeDuotone className="text-slate-500" />{" "}
        <p className="text-slate-600 text-[12px]">7 subtask</p>
      </div>
    </div>
  );
}
