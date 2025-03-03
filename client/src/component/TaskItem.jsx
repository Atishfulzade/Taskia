import { useDraggable } from "@dnd-kit/core";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaRegCalendar } from "react-icons/fa";
import { TbFlag3 } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";
import { formatDate } from "../utils/formatDate";
import requestServer from "../utils/requestServer";
import { useEffect, useState } from "react";
import React from "react";

const TaskItem = ({ task, setEditTaskOpen }) => {
  // Drag-and-drop functionality
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task?._id,
  });

  // State for showing subtasks and assigned user
  const [showSubTask, setShowSubTask] = useState(false);
  const [assignedUser, setAssignedUser] = useState("");

  // Fetch assigned user details (Only if task.assignedTo exists)
  useEffect(() => {
    if (task?.assignedTo) {
      requestServer(`user/u/${task.assignedTo}`)
        .then((user) => setAssignedUser(user?.data?.name ?? "Unknown"))
        .catch((error) => console.error("Error fetching user:", error));
    }
  }, [task?.assignedTo]);

  // Get initials of the assigned user
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("") ?? "?";

  // Priority colors mapping
  const priorityColors = {
    Medium: "text-yellow-500",
    High: "text-red-500",
    Low: "text-slate-600",
  };
  const handlePriority = (priority) =>
    priorityColors[priority] || "text-slate-600";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseDown={(e) => e.stopPropagation()} // Stop drag interference
      onClick={(e) => {
        console.log(hi);
        e.stopPropagation();

        setEditTaskOpen((prev) => ({
          ...prev,
          isOpen: !prev.isOpen,
          task: task,
        }));
      }}
      className="border my-1 select-none h-fit border-slate-50 bg-white rounded-lg cursor-grab hover:bg-slate-50"
      style={{
        padding: "10px",
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
    >
      {/* Task Title */}
      <h4 className="text-stone-600 font-inter text-sm font-medium leading-5 line-clamp-2">
        {task?.title}
      </h4>

      {/* Task Details (Assigned User, Due Date, Priority) */}
      <div className="flex mt-3 gap-1.5">
        {/* Assigned User */}
        <div className="flex cursor-pointer">
          {task?.assignedTo ? (
            <span
              title={assignedUser}
              className="border text-white flex items-center justify-center pt-[2px] bg-violet-600 rounded-full border-slate-300 w-6 h-6 text-[11px]"
            >
              {getInitials(assignedUser)}
            </span>
          ) : (
            <FaRegCircleUser className="border text-slate-700 border-slate-200 p-1 w-6 h-6 rounded" />
          )}
        </div>

        {/* Due Date */}
        <div className="flex border gap-1 cursor-pointer justify-center border-slate-200 p-1 h-6 rounded items-center">
          <FaRegCalendar size={14} className="text-slate-500" />
          {task?.dueDate && (
            <p className="text-red-500 text-[12px] font-inter">
              {formatDate(task.dueDate)}
            </p>
          )}
        </div>

        {/* Priority */}
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

      {/* Subtasks */}
      {Array.isArray(task.subTask) && task.subTask.length > 0 && (
        <div
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag interference
          onClick={() => setShowSubTask((prev) => !prev)}
          className="flex cursor-pointer mt-3 gap-1.5 justify-start text-sm items-center"
        >
          <PiGitMergeDuotone className="text-slate-500" />
          <p className="text-slate-600 text-[12px]">
            {task.subTask.length} subtask{task.subTask.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Subtask Details */}
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
