import { useDraggable } from "@dnd-kit/core";
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { formatDate } from "../utils/formatDate";
import requestServer from "../utils/requestServer";
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
import { Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteTask } from "@/store/taskSlice";
import { Button } from "@/components/ui/Button";

const priorityBadges = {
  High: {
    color:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    icon: "text-red-500 dark:text-red-400",
  },
  Medium: {
    color:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    icon: "text-yellow-500 dark:text-yellow-400",
  },
  Low: {
    color:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/20 dark:text-slate-300 dark:border-slate-600",
    icon: "text-slate-600 dark:text-slate-400",
  },
};

const TaskItem = React.memo(
  ({ task = {}, status, isDragging = false, onEditTask }) => {
    const {
      _id,
      title,
      priority,
      assignedTo,
      dueDate,
      subTask = [],
      attachedFile = [],
    } = task;
    const { attributes, listeners, setNodeRef, transform } = !isDragging
      ? useDraggable({ id: _id })
      : { attributes: {}, listeners: {}, setNodeRef: null, transform: null };

    const [showSubTask, setShowSubTask] = useState(false);
    const [assignedUser, setAssignedUser] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const completedSubtasks = useMemo(
      () => subTask.filter((subtask) => subtask.completed).length,
      [subTask]
    );

    const isOverdue = useMemo(() => {
      if (!dueDate) return false;
      return new Date(dueDate) < new Date();
    }, [dueDate]);

    const handleTaskClick = useCallback(
      (e) => {
        if (isDragging) return;
        e.stopPropagation();

        // Call parent handler to show edit popup
        if (onEditTask) {
          onEditTask(task, status);
        }
      },
      [isDragging, onEditTask, task, status]
    );

    const handleDeleteTask = async () => {
      try {
        await requestServer(`task/delete/${_id}`);
        dispatch(deleteTask(_id));
      } catch (error) {
        console.error("Error deleting task:", error);
        showToast("Failed to delete task. Please try again.", "error");
      }
    };

    const toggleSubTaskVisibility = useCallback(
      (e) => {
        if (isDragging) return;
        e.stopPropagation();
        setShowSubTask((prev) => !prev);
      },
      [isDragging]
    );

    useEffect(() => {
      if (assignedTo) {
        setIsLoading(true);
        requestServer(`user/u/${assignedTo}`)
          .then((user) => {
            setAssignedUser(user?.data?.name || "Unknown");
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
            setIsLoading(false);
          });
      }
    }, [assignedTo]);

    const getInitials = (name) =>
      name
        ?.split(" ")
        .map((n) => n[0]?.toUpperCase())
        .join("") || "?";

    const hasSubtasks = subTask.length > 0;

    return (
      <div
        ref={!isDragging ? setNodeRef : undefined}
        className={`border my-2 select-none h-fit dark:bg-slate-800 border-slate-200 dark:border-slate-700 bg-white rounded-lg shadow-sm ${
          isDragging ? "shadow-xl opacity-90 scale-105" : "hover:shadow-md"
        } transition-all duration-200`}
        style={{
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
          zIndex: isDragging ? 999 : 1,
        }}
      >
        <div className="p-3">
          {priority && priority !== "No" && (
            <div className="mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  priorityBadges[priority]?.color ||
                  "bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300"
                }`}
              >
                <TbFlag3
                  className={
                    priorityBadges[priority]?.icon ||
                    "text-slate-600 dark:text-slate-400"
                  }
                />
                {priority}
              </span>
            </div>
          )}

          <div onClick={handleTaskClick} className="cursor-pointer">
            <h4 className="text-slate-800 dark:text-slate-200 font-inter text-sm font-medium leading-5 line-clamp-2 hover:text-violet-700 dark:hover:text-violet-500 transition-colors">
              {title}
            </h4>
          </div>

          <div className="flex mt-3 gap-2 flex-wrap">
            <div
              className="flex items-center"
              title={assignedUser || "Unassigned"}
            >
              {isLoading ? (
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full w-6 h-6"></div>
              ) : assignedTo ? (
                <span className="border text-white flex items-center justify-center bg-violet-600 dark:bg-violet-700 rounded-full border-violet-300 dark:border-violet-600 w-6 h-6 text-[11px] shadow-sm">
                  {getInitials(assignedUser)}
                </span>
              ) : (
                <FaRegCircleUser className="text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 p-1 w-6 h-6 rounded-full" />
              )}
            </div>

            {dueDate && (
              <div className="flex border gap-1 justify-center border-slate-200 dark:border-slate-700 p-1 h-6 rounded-md items-center bg-slate-50 dark:bg-slate-700">
                <FaRegCalendar
                  size={12}
                  className={
                    isOverdue
                      ? "text-red-500"
                      : "text-slate-500 dark:text-slate-400"
                  }
                />
                <p
                  className={`${
                    isOverdue
                      ? "text-red-500 font-medium"
                      : "text-slate-600 dark:text-slate-300"
                  } text-[11px] font-inter`}
                >
                  {formatDate(dueDate)}
                </p>
              </div>
            )}

            {attachedFile.length > 0 && (
              <div
                title={`${attachedFile.length} attachment${
                  attachedFile.length > 1 ? "s" : ""
                }`}
                className="flex border gap-1 justify-center border-slate-200 dark:border-slate-700 p-1 h-6 rounded-md items-center bg-slate-50 dark:bg-slate-700"
              >
                <IoAttachSharp
                  size={12}
                  className="text-slate-500 dark:text-slate-400"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                  {attachedFile.length}
                </span>
              </div>
            )}

            <Button
              onClick={handleDeleteTask}
              aria-label="Delete task"
              className="h-4 w-4 cursor-pointer text-slate-800 dark:text-white"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          {hasSubtasks && (
            <div className="mt-3 border-t border-slate-100 dark:border-slate-700 pt-2">
              <div
                onClick={toggleSubTaskVisibility}
                className="flex cursor-pointer justify-between items-center group"
              >
                <div className="flex gap-1.5 items-center">
                  <PiGitMergeDuotone className="text-violet-500 dark:text-violet-400" />
                  <p className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                    Subtasks {subTask.length}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{
                        width: `${(completedSubtasks / subTask.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                  {showSubTask ? (
                    <FaChevronDown
                      size={12}
                      className="text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors"
                    />
                  ) : (
                    <FaChevronRight
                      size={12}
                      className="text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors"
                    />
                  )}
                </div>
              </div>

              {showSubTask && !isDragging && (
                <div className="mt-2 space-y-2 pl-2 pr-1 py-1 bg-slate-50 dark:bg-slate-700 rounded-md max-h-40 overflow-y-auto">
                  {subTask.map((subtask) => (
                    <div
                      key={subtask._id}
                      className="flex gap-2 items-start py-1 px-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors"
                    >
                      {subtask.completed ? (
                        <MdOutlineCheckCircle
                          className="text-green-500 min-w-[16px] mt-0.5"
                          size={16}
                        />
                      ) : (
                        <MdOutlineRadioButtonUnchecked
                          className="text-slate-400 dark:text-slate-500 min-w-[16px] mt-0.5"
                          size={16}
                        />
                      )}
                      <div>
                        <p
                          className={`text-xs font-medium ${
                            subtask.completed
                              ? "text-slate-500 dark:text-slate-400 line-through"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {subtask.title}
                        </p>
                        {subtask.description && (
                          <p className="text-[10px] line-clamp-2 text-slate-500 dark:text-slate-400 mt-0.5">
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

        {!isDragging && (
          <div
            {...listeners}
            {...attributes}
            className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-b-lg cursor-grab active:cursor-grabbing hover:bg-violet-100 dark:hover:bg-violet-700/50 transition-colors"
          />
        )}
      </div>
    );
  }
);

export default memo(TaskItem);
