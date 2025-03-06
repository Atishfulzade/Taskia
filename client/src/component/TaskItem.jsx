import { useDraggable } from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { formatDate } from "../utils/formatDate";
import requestServer from "../utils/requestServer";
import React from "react";

import {
  FaRegCircleUser,
  FaRegCalendar,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa6";
import { TbFlag3 } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";
import { IoAttachSharp } from "react-icons/io5";
import {
  MdOutlineCheckCircle,
  MdOutlineRadioButtonUnchecked,
} from "react-icons/md";
import { TaskModal } from "./AddTaskPopup";

const TaskItem = ({
  task,
  status,
  setTaskOpen,
  taskOpen,
  setEditTaskOpen,
  isDragging = false,
}) => {
  // Only use useDraggable if not being used as a drag overlay
  const { attributes, listeners, setNodeRef, transform } = !isDragging
    ? useDraggable({ id: task?._id })
    : { attributes: {}, listeners: {}, setNodeRef: null, transform: null };

  // State for showing subtasks, assigned user, and loading states
  const [showSubTask, setShowSubTask] = useState(false);
  const [assignedUser, setAssignedUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completedSubtasks, setCompletedSubtasks] = useState(0);

  // Calculate completed subtasks
  useEffect(() => {
    if (Array.isArray(task?.subTask) && task.subTask.length > 0) {
      const completed = task.subTask.filter(
        (subtask) => subtask.completed
      ).length;
      setCompletedSubtasks(completed);
    }
  }, [task?.subTask]);

  // Fetch assigned user details (Only if task.assignedTo exists)
  useEffect(() => {
    if (task?.assignedTo) {
      setIsLoading(true);
      requestServer(`user/u/${task.assignedTo}`)
        .then((user) => {
          setAssignedUser(user?.data?.name ?? "Unknown");
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          setIsLoading(false);
        });
    }
  }, [task?.assignedTo]);

  // Get initials of the assigned user
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("") ?? "?";

  // Priority badges with colors and styles
  const priorityBadges = {
    High: {
      color: "bg-red-100 text-red-700 border-red-200",
      icon: "text-red-500",
    },
    Medium: {
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: "text-yellow-500",
    },
    Low: {
      color: "bg-slate-100 text-slate-700 border-slate-200",
      icon: "text-slate-600",
    },
  };

  // Check if due date is overdue
  const isOverdue = () => {
    if (!task?.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div
      ref={!isDragging ? setNodeRef : undefined}
      className={`border my-2 select-none h-fit border-slate-200 bg-white rounded-lg shadow-sm ${
        isDragging ? "shadow-xl opacity-90 scale-105" : "hover:shadow-md"
      } transition-all duration-200`}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        // Add additional styling for dragging state
        zIndex: isDragging ? 999 : 1,
      }}
    >
      {/* Task Card Content */}
      <div className="p-3">
        {/* Priority indicator (if exists) */}
        {task?.priority && task.priority !== "No" && (
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                priorityBadges[task.priority]?.color ||
                "bg-slate-100 text-slate-700"
              }`}
            >
              <TbFlag3
                className={
                  priorityBadges[task.priority]?.icon || "text-slate-600"
                }
              />
              {task.priority}
            </span>
          </div>
        )}

        {/* Task Title */}
        <div
          onClick={(e) => {
            if (isDragging) return; // Don't trigger clicks while dragging
            e.stopPropagation();
            setTaskOpen(true);
          }}
          className="cursor-pointer"
        >
          <h4 className="text-slate-800 font-inter text-sm font-medium leading-5 line-clamp-2 hover:text-violet-700 transition-colors">
            {task?.title}
          </h4>
        </div>

        {/* Task Details Row */}
        <div className="flex mt-3 gap-2 flex-wrap">
          {/* Assigned User */}
          <div
            className="flex items-center"
            title={assignedUser || "Unassigned"}
          >
            {isLoading ? (
              <div className="animate-pulse bg-slate-200 rounded-full w-6 h-6"></div>
            ) : task?.assignedTo ? (
              <span className="border text-white flex items-center justify-center bg-violet-600 rounded-full border-violet-300 w-6 h-6 text-[11px] shadow-sm">
                {getInitials(assignedUser)}
              </span>
            ) : (
              <FaRegCircleUser className="text-slate-400 border border-slate-200 p-1 w-6 h-6 rounded-full" />
            )}
          </div>

          {/* Due Date */}
          {task?.dueDate && (
            <div className="flex border gap-1 justify-center border-slate-200 p-1 h-6 rounded-md items-center bg-slate-50">
              <FaRegCalendar
                size={12}
                className={isOverdue() ? "text-red-500" : "text-slate-500"}
              />
              <p
                className={`${
                  isOverdue() ? "text-red-500 font-medium" : "text-slate-600"
                } text-[11px] font-inter`}
              >
                {formatDate(task.dueDate)}
              </p>
            </div>
          )}

          {/* Attachments */}
          {task.attachedFile && task.attachedFile.length > 0 && (
            <div
              title={`${task.attachedFile.length} attachment${
                task.attachedFile.length > 1 ? "s" : ""
              }`}
              className="flex border gap-1 justify-center border-slate-200 p-1 h-6 rounded-md items-center bg-slate-50"
            >
              <IoAttachSharp size={12} className="text-slate-500" />
              <span className="text-[11px] text-slate-600">
                {task.attachedFile.length}
              </span>
            </div>
          )}
        </div>

        {/* Subtasks Section */}
        {Array.isArray(task.subTask) && task.subTask.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-2">
            {/* Subtask Header */}
            <div
              onClick={(e) => {
                if (isDragging) return; // Don't trigger clicks while dragging
                e.stopPropagation();
                setShowSubTask((prev) => !prev);
              }}
              className="flex cursor-pointer justify-between items-center group"
            >
              <div className="flex gap-1.5 items-center">
                <PiGitMergeDuotone className="text-violet-500" />
                <p className="text-slate-700 text-xs font-medium">
                  Subtasks ({completedSubtasks}/{task.subTask.length})
                </p>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{
                      width: `${
                        (completedSubtasks / task.subTask.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                {showSubTask ? (
                  <FaChevronDown
                    size={12}
                    className="text-slate-400 group-hover:text-slate-700 transition-colors"
                  />
                ) : (
                  <FaChevronRight
                    size={12}
                    className="text-slate-400 group-hover:text-slate-700 transition-colors"
                  />
                )}
              </div>
            </div>

            {/* Subtask List */}
            {showSubTask && !isDragging && (
              <div className="mt-2 space-y-2 pl-2 pr-1 py-1 bg-slate-50 rounded-md max-h-40 overflow-y-auto">
                {task.subTask.map((subtask) => (
                  <div
                    key={subtask._id}
                    className="flex gap-2 items-start py-1 px-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    {subtask.completed ? (
                      <MdOutlineCheckCircle
                        className="text-green-500 min-w-[16px] mt-0.5"
                        size={16}
                      />
                    ) : (
                      <MdOutlineRadioButtonUnchecked
                        className="text-slate-400 min-w-[16px] mt-0.5"
                        size={16}
                      />
                    )}
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          subtask.completed
                            ? "text-slate-500 line-through"
                            : "text-slate-700"
                        }`}
                      >
                        {subtask.title}
                      </p>
                      {subtask.description && (
                        <p className="text-[10px] line-clamp-2 text-slate-500 mt-0.5">
                          {subtask.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Don't render modal when it's a drag overlay */}
      {!isDragging && (
        <TaskModal
          onOpenChange={setTaskOpen}
          currentStatus={status}
          isEdit={true}
          open={taskOpen}
          taskData={task}
        />
      )}

      {/* Drag Handle - Only render when not dragging */}
      {!isDragging && (
        <div
          {...listeners}
          {...attributes}
          className="h-1.5 bg-slate-100 rounded-b-lg cursor-grab active:cursor-grabbing hover:bg-violet-100 transition-colors"
        />
      )}
    </div>
  );
};

export default React.memo(TaskItem);
