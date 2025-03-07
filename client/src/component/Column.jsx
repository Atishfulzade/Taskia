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
import { AddTaskPopup } from "./AddTaskPopup";

const Column = React.memo(
  ({
    status,
    tasks = [],
    setEditTaskOpen,
    isLoading = false,
    isTaskOpen, // Changed from using local state to prop from parent
    setTaskOpen, // This will now toggle the specific column's popup
    onAddTask, // Optional callback when task is added
    projectId, // Project ID for new tasks
    onDeleteTask, // Optional callback when task is deleted
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: status?._id || "default-status",
    });

    const [showMore, setShowMore] = useState(false);
    const dropdownRef = useRef(null);

    const currentProjectUserId = useSelector(
      (state) => state.project.currentProject?.userId
    );
    const userId = useSelector((state) => state.user.user._id);
    const isProjectOwner = userId === currentProjectUserId;

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

    // Handle opening task popup for this specific column
    const handleOpenTaskPopup = () => {
      setTaskOpen(true); // This now calls the parent function which sets activeTaskStatusId
    };

    // Handle closing task popup
    const handleCloseTaskPopup = () => {
      setTaskOpen(false);
    };

    const renderAddTaskButton = () => (
      <button
        onClick={handleOpenTaskPopup}
        className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
        title="Add a new task"
        aria-label="Add task"
      >
        <IoIosAdd size={18} />
      </button>
    );

    return (
      <div
        className={`flex flex-col h-[calc(100vh-180px)] w-[280px] rounded-lg shadow-sm transition-all duration-200 ${
          isOver ? "ring-2 ring-violet-400 ring-opacity-70" : ""
        }`}
        style={{
          backgroundColor: status?.color?.secondaryColor || "#f8fafc",
          borderLeft: `3px solid ${status?.color?.primaryColor || "#e2e8f0"}`,
        }}
      >
        {/* Add Task Popup */}
        <AddTaskPopup
          open={isTaskOpen} // Use the prop passed from parent
          task={null}
          onOpenChange={handleCloseTaskPopup} // Close only this column's popup
          currentStatus={status}
          isEdit={false}
          isAdding={true}
          onSuccess={(taskData) => {
            if (onAddTask) {
              onAddTask({
                ...taskData,
                status: status._id,
                projectId: projectId,
              });
            }
            handleCloseTaskPopup();
          }}
        />

        {/* Column Header */}
        <div className="p-3 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <div
                style={{
                  backgroundColor: status?.color?.primaryColor || "#e2e8f0",
                }}
                className="flex items-center rounded-md gap-1 p-1 px-2 shadow-sm"
              >
                <FaRegCircle className="text-violet-600" size={12} />
                <h3
                  title={status?.title}
                  className="text-[12px] font-medium font-inter w-fit line-clamp-1 text-slate-800"
                >
                  {status?.title?.toUpperCase()}
                </h3>
              </div>
              <span className="text-slate-500 text-xs font-medium px-2 py-1 bg-slate-100 rounded-full">
                {tasks?.length || 0}
              </span>
            </div>
            {isProjectOwner && (
              <div className="flex gap-1">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
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
          className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
        >
          {isLoading ? (
            // Loading skeleton for tasks
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="bg-slate-100 animate-pulse h-24 rounded-lg mb-2"
                />
              ))
          ) : tasks?.length > 0 ? (
            // Render tasks if not loading
            tasks.map((task) => (
              <TaskItem
                key={task?._id || `task-${task.index}`}
                task={task}
                status={status}
                setEditTaskOpen={setEditTaskOpen}
                taskOpen={false} // Don't pass isTaskOpen here
                setTaskOpen={setTaskOpen} // Pass the parent function
              />
            ))
          ) : (
            // Empty state when no tasks are available
            <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-400">
              <TbLayoutKanban size={32} className="mb-2" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Drop tasks here or add a new one</p>
            </div>
          )}
        </div>

        {/* Add Task Button */}
        {isProjectOwner && (
          <div className="p-2 border-t border-slate-200">
            <button
              onClick={handleOpenTaskPopup}
              className="w-full py-2 px-3 rounded-md bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-200 transition-colors flex items-center justify-center gap-1 text-slate-600 hover:text-violet-600 group"
              aria-label="Add task"
            >
              <IoIosAdd
                size={18}
                className="text-violet-500 group-hover:text-violet-600 transition-colors"
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
