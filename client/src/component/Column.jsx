import { useDroppable } from "@dnd-kit/core";
import { useEffect } from "react";
import { IoIosAdd } from "react-icons/io";
import TaskItem from "./TaskItem";
import { FaRegCircle } from "react-icons/fa6";
import { PiDotsThreeBold } from "react-icons/pi";

export default function Column({
  status,
  tasks,
  loader,
  bgColor,
  taskOpen,
  setTaskOpen,
}) {
  const { setNodeRef } = useDroppable({ id: status?._id });

  return (
    <div
      ref={setNodeRef}
      className={`h-fit w-[17rem]  ${bgColor.secondaryColor}  rounded-lg p-2  `}
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-2 justify-start items-center text-md text-slate-800 font-medium font-inter">
          <div
            className={`flex justify-start items-center rounded-md gap-1 p-0.5 px-2 ${bgColor.primaryColor}`}
          >
            <FaRegCircle className=" text-violet-600" size={14} />
            <h3
              title={status?.title}
              className={` text-[12px] py-0.5 font-inter w-fit line-clamp-1 ${bgColor.tertiaryColor} `}
            >
              {status?.title.toUpperCase()}
            </h3>
          </div>
          <span className="text-slate-500 text-sm font-inter ">5</span>
        </div>

        <div className="flex gap-0.5 text-slate-600">
          <div className=" flex rounded cursor-pointer hover:bg-slate-200  ">
            <PiDotsThreeBold size={22} />
          </div>
          <div
            onClick={() => setTaskOpen(!taskOpen)}
            className=" flex rounded cursor-pointer hover:bg-slate-200  "
          >
            <IoIosAdd size={22} />
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[77%]">
        {Array(5)
          .fill("")
          ?.map((task) => (
            <TaskItem
              key={task?._id}
              task="This is my task understand lorsuiiebdibwscbeifh jiifucherif iuirvie"
            />
          ))}
      </div>
      <button className="flex justify-center cursor-pointer items-center my-2 font-inter gap-0.5 text-slate-600 text-sm  rounded ">
        <IoIosAdd size={22} />
        Add task
      </button>
    </div>
  );
}
