import { useDroppable } from "@dnd-kit/core";
import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import TaskItem from "./TaskItem";

// Icons
import { IoIosAdd } from "react-icons/io";
import { FaRegCircle } from "react-icons/fa6";
import { PiDotsThreeBold } from "react-icons/pi";
import { TbLayoutKanban } from "react-icons/tb";
import TaskMoreDropdown from "./TaskMoreDropdown";

const Column = React.memo(
  ({ status, tasks = [], isLoading = false, onEditTask, onAddTask }) => {
    const { setNodeRef } = useDroppable({
      id: status?._id || "default-status", // Fallback for undefined status
    });

    const [showMore, setShowMore] = useState(false);
    const dropdownRef = useRef(null);

    const currentProjectUserId = useSelector(
      (state) => state.project.currentProject?.userId
    );
    const userId = useSelector((state) => state.user.user._id);
    const isProjectOwner = userId === currentProjectUserId;

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setShowMore(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Call parent handler with status info
    const handleAddTask = () => {
      onAddTask(status);
    };

    // Render the "Add Task" button
    const renderAddTaskButton = () => (
      <button
        onClick={handleAddTask}
        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-600 dark:text-gray-800"
        title="Add a new task"
        aria-label="Add task"
      >
        <IoIosAdd size={18} />
      </button>
    );

    // Render the task list or loading skeleton
    const renderTaskList = () => {
      if (isLoading) {
        return Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-slate-100 dark:bg-gray-700 animate-pulse h-24 rounded-lg mb-2"
            />
          ));
      }

      if (tasks?.length > 0) {
        return tasks.map((task) => (
          <TaskItem
            key={task?._id || `task-${task.index}`}
            task={task}
            status={status}
            isDragging={false}
            onEditTask={onEditTask} // Ensure this is passed
          />
        ));
      }

      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-400 dark:text-gray-400">
          <TbLayoutKanban size={32} className="mb-2" />
          <p className="text-sm">No tasks yet</p>
          <p className="text-xs mt-1">Drop tasks here or add a new one</p>
        </div>
      );
    };

    return (
      <div
        className={`flex flex-col h-[calc(100vh-280px)] w-[280px] rounded-lg shadow-sm transition-all duration-200`}
        style={{
          backgroundColor: status?.color?.secondaryColor || "#f8fafc",
          borderLeft: `3px solid ${status?.color?.primaryColor || "#e2e8f0"}`,
        }}
      >
        {/* Column Header */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <div
                style={{
                  backgroundColor: status?.color?.primaryColor || "#e2e8f0",
                }}
                className="flex items-center rounded-md gap-1 p-1 px-2 shadow-sm dark:bg-slate-600"
              >
                <FaRegCircle className="text-violet-600" size={12} />
                <h3
                  title={status?.title}
                  className="text-[12px] font-medium font-inter w-fit line-clamp-1 text-slate-800 dark:text-gray-900"
                >
                  {status?.title?.toUpperCase()}
                </h3>
              </div>
              <span className="text-slate-500 dark:text-gray-300 text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-gray-700 rounded-full">
                {tasks?.length || 0}
              </span>
            </div>
            {isProjectOwner && (
              <div className="flex gap-1">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-900 dark:text-gray-800"
                    aria-label="More options"
                    aria-expanded={showMore}
                  >
                    <PiDotsThreeBold size={18} />
                  </button>
                  <AnimatePresence>
                    {showMore && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-8 z-10"
                      >
                        <TaskMoreDropdown
                          setShowMore={setShowMore}
                          status={status}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {renderAddTaskButton()}
              </div>
            )}
          </div>
        </div>

        {/* Task List */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
        >
          {renderTaskList()}
        </div>

        {/* Add Task Button */}
        {isProjectOwner && (
          <div className="p-2 border-t border-slate-200 dark:border-gray-700">
            <button
              onClick={handleAddTask}
              className="w-full py-2 px-3 rounded-md bg-white dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-600 transition-colors flex items-center justify-center gap-1 text-slate-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-500 group"
              aria-label="Add task"
            >
              <IoIosAdd
                size={18}
                className="text-violet-500 dark:text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-500 transition-colors"
              />
              <span className="text-sm font-medium">Add task</span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

export default Column;
