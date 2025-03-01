import { useDroppable } from "@dnd-kit/core";
import { IoIosAdd } from "react-icons/io";
import TaskItem from "./TaskItem";
import { FaRegCircle } from "react-icons/fa6";
import { PiDotsThreeBold } from "react-icons/pi";
import { useEffect, useState } from "react";
import TaskMoreDropdown from "./TaskMoreDropdown";

export default function Column({ status, tasks, setTaskOpen, selectedStatus }) {
  const { setNodeRef } = useDroppable({ id: status?._id });
  const [showMore, setShowMore] = useState(false);

  const handleTaskOpen = () => {
    selectedStatus(status); // Set the selected status
    setTaskOpen(true); // Open the task modal
  };

  return (
    <div
      ref={setNodeRef}
      className={`h-fit w-[17rem] ${status.color.secondaryColor} rounded-lg p-2 `}
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-2 justify-start items-center text-md text-slate-800 font-medium font-inter">
          <div
            className={`flex justify-start items-center rounded-md gap-1 p-0.5 px-2 ${status.color.primaryColor}`}
          >
            <FaRegCircle className="text-violet-600" size={14} />
            <h3
              title={status?.title}
              className="text-[12px] py-0.5 font-inter w-fit line-clamp-1 text-slate-800"
            >
              {status?.title.toUpperCase()}
            </h3>
          </div>
          {tasks.length > 0 && (
            <span className="text-slate-500 text-sm font-inter">
              {tasks?.length}
            </span>
          )}
        </div>

        <div className="flex gap-0.5 text-slate-600">
          <div className="flex rounded cursor-pointer  relative">
            <PiDotsThreeBold size={22} onClick={() => setShowMore(true)} />
            {showMore && (
              <TaskMoreDropdown setShowMore={setShowMore} status={status} />
            )}
          </div>
          <div
            onClick={handleTaskOpen}
            className="flex rounded cursor-pointer "
          >
            <IoIosAdd size={22} />
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[77%]">
        {tasks.map((task) => (
          <TaskItem key={task?._id} task={task} status={status} />
        ))}
      </div>

      <button
        onClick={handleTaskOpen}
        className="flex justify-center cursor-pointer items-center my-2 font-inter gap-0.5 text-slate-600 text-sm rounded"
      >
        <IoIosAdd size={22} />
        Add task
      </button>
    </div>
  );
}
