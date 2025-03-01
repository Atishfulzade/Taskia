import { useDraggable } from "@dnd-kit/core";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaRegCalendar } from "react-icons/fa";
import { TbFlag3 } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";
import { formatDate } from "../utils/formatDate";
import requestServer from "../utils/requestServer";
import { useEffect, useState } from "react";
import React from "react";

const TaskItem = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task?._id,
  });
  const [showSubTask, setShowSubTask] = useState(false);
  const [assignedUser, setAssignedUser] = useState("");

  useEffect(() => {
    if (task?.assignedTo) {
      requestServer(`user/u/${task.assignedTo}`)
        .then((user) => {
          setAssignedUser(user?.name ?? "Unknown");
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });
    }
  }, [task?.assignedTo]);

  const handlePriority = (priority) => {
    switch (priority) {
      case "Medium":
        return "text-yellow-500";
      case "High":
        return "text-red-500";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="border my-1 select-none h-fit border-slate-50 bg-white rounded-lg cursor-grab hover:bg-slate-50"
      style={{
        padding: "10px",
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
    >
      <h4 className="text-stone-600 font-inter text-sm font-medium leading-5 line-clamp-2">
        {task?.title}
      </h4>
      <div className="flex mt-3 gap-1.5">
        <div className="flex cursor-pointer">
          {task?.assignedTo ? (
            <span
              title={assignedUser}
              className="border text-white flex items-center justify-center pt-[2px] bg-violet-600 rounded-full border-slate-300 w-6 h-6 text-[11px]"
            >
              {assignedUser
                ?.split(" ")
                .map((name) => name[0])
                .join("")}
            </span>
          ) : (
            <FaRegCircleUser className="border text-slate-700 border-slate-200 p-1 w-6 h-6 rounded" />
          )}
        </div>
        <div className="flex border gap-1 cursor-pointer justify-center border-slate-200 p-1 h-6 rounded items-center">
          <FaRegCalendar size={14} className="text-slate-500" />
          {task?.dueDate && (
            <p className="text-red-500 text-[12px] font-inter">
              {formatDate(task.dueDate)}
            </p>
          )}
        </div>
        <div className="flex border cursor-pointer border-slate-200 p-1 h-6 rounded items-center">
          <TbFlag3 size={14} className="text-slate-500" />
          {task?.priority !== "No" && (
            <p
              className={`${handlePriority(
                task.priority
              )} text-[12px] font-inter`}
            >
              {task.priority}
            </p>
          )}
        </div>
      </div>
      {task.subTask.length > 0 && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            setShowSubTask((prev) => !prev);
          }}
          className="flex cursor-pointer mt-3 gap-1.5 justify-start text-sm items-center"
        >
          <PiGitMergeDuotone className="text-slate-500" />
          <p className="text-slate-600 text-[12px]">
            {task.subTask.length} subtask
          </p>
        </div>
      )}
      {showSubTask &&
        task.subTask.map((subtask, i) => (
          <div className="mt-3 ml-5 line-clamp-1" key={subtask._id}>
            <p className="text-[12px] font-inter text-slate-600">
              {i + 1}. {subtask.title}
            </p>
            {subtask.description && (
              <p className="text-[10px] line-clamp-2 text-slate-500 font-inter">
                {subtask.description}
              </p>
            )}
          </div>
        ))}
    </div>
  );
};

export default React.memo(TaskItem);
