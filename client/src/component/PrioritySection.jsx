import { useState, useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import Task from "./Task";

// UI Components
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"; // Corrected import path

// Icons
import { PiDotsThreeBold } from "react-icons/pi";
import { IoAdd } from "react-icons/io5";
import { TbFlag3 } from "react-icons/tb";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";

// Priority color mapping
const priorityConfig = {
  High: {
    icon: <TbFlag3 className="text-red-500" size={16} />,
    badge:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    hover: "hover:bg-red-50 dark:hover:bg-red-900/30",
    empty: "bg-red-50 dark:bg-red-900/20",
  },
  Medium: {
    icon: <TbFlag3 className="text-amber-500" size={16} />,
    badge:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    hover: "hover:bg-amber-50 dark:hover:bg-amber-900/30",
    empty: "bg-amber-50 dark:bg-amber-900/20",
  },
  No: {
    icon: <TbFlag3 className="text-slate-400" size={16} />,
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/20 dark:text-slate-300 dark:border-slate-600",
    hover: "hover:bg-slate-50 dark:hover:bg-slate-700/30",
    empty: "bg-slate-50 dark:bg-slate-700/20",
  },
};

// PrioritySection.jsx
const PrioritySection = ({
  priority,
  tasks,
  toggleDropdown,
  openDropdowns,
  onAddTask = () => {},
  onTaskDelete = () => {},
}) => {
  // Local state
  const [hovered, setHovered] = useState(false);

  // Use the useDroppable hook to make the section droppable
  const { setNodeRef, isOver } = useDroppable({
    id: priority,
    data: { priority },
  });

  // Memoize the list of task IDs for SortableContext
  const sortableItems = useMemo(() => tasks.map((task) => task._id), [tasks]);

  // Get priority configuration
  const config = priorityConfig[priority] || priorityConfig.No;

  // Is section expanded
  const isExpanded = openDropdowns[priority];

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`mb-4 rounded-lg border ${
        isOver
          ? "border-violet-300 bg-violet-50 dark:bg-violet-900/20"
          : "border-slate-200 dark:border-slate-700"
      } transition-all duration-200 dark:bg-slate-800 overflow-hidden`}
    >
      {/* Priority Section Header */}
      <div
        onClick={() => toggleDropdown(priority)}
        className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
          isExpanded ? "border-b border-slate-200 dark:border-slate-700" : ""
        } ${config.hover} transition-colors`}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <MdKeyboardArrowDown
              size={20}
              className="text-slate-500 dark:text-slate-400"
            />
          ) : (
            <MdKeyboardArrowRight
              size={20}
              className="text-slate-500 dark:text-slate-400"
            />
          )}

          {/* Priority Title and Icon */}
          <div className="flex items-center gap-2">
            {config.icon}
            <h3 className="font-medium text-slate-800 dark:text-slate-200">
              {priority === "No" ? "No Priority" : `${priority} Priority`}
            </h3>
          </div>

          {/* Task Count Badge */}
          <Badge variant="outline" className={`${config.badge} text-xs`}>
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Action Buttons - Only show when hovered or expanded */}
        <AnimatePresence>
          {(hovered || isExpanded) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTask(priority);
                }}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300"
              >
                <IoAdd size={16} />
                <span className="hidden sm:inline">Add task</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <PiDotsThreeBold
                      size={18}
                      className="text-slate-500 dark:text-slate-400"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="dark:bg-slate-800 dark:text-slate-200 bg-white"
                >
                  <DropdownMenuItem className="dark:hover:bg-slate-700 hover:bg-slate-100">
                    Sort tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem className="dark:hover:bg-slate-700 hover:bg-slate-100">
                    Filter tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem className="dark:hover:bg-slate-700 hover:bg-slate-100">
                    Collapse all
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task List Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Table Headers */}
            <div className="grid grid-cols-16 gap-2 px-4 py-2 ms-14 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <div className="col-span-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                Task
              </div>
              <div className="col-span-2 text-xs ms-5 font-medium text-slate-500 dark:text-slate-400">
                Status
              </div>
              <div className="col-span-2 text-xs ms-7 font-medium text-slate-500 dark:text-slate-400">
                Created
              </div>
              <div className="col-span-2 text-xs ms-6 font-medium text-slate-500 dark:text-slate-400">
                Assigned to
              </div>
              <div className="col-span-2 text-xs ms-10 font-medium text-slate-500 dark:text-slate-400">
                Priority
              </div>
              <div className="col-span-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Due date
              </div>
              <div className="col-span-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Attachments
              </div>
            </div>

            {/* Task List */}
            <div className="px-2 py-2 bg-white dark:bg-slate-800">
              <SortableContext
                items={sortableItems}
                strategy={verticalListSortingStrategy}
              >
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <Task
                      key={task._id}
                      task={task}
                      priority={priority}
                      onTaskDelete={onTaskDelete}
                    />
                  ))
                ) : (
                  <div
                    className={`flex flex-col items-center justify-center py-8 ${config.empty} rounded-md text-slate-500 dark:text-slate-400`}
                  >
                    <LuClipboardList size={24} className="mb-2" />
                    <p className="text-sm font-medium">
                      No tasks with{" "}
                      {priority === "No" ? "no" : priority.toLowerCase()}{" "}
                      priority
                    </p>
                    <p className="text-xs mt-1">
                      Drag tasks here or add a new one
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTask(priority);
                      }}
                      className="mt-3 flex items-center gap-1 dark:bg-slate-700 dark:text-slate-200"
                    >
                      <IoAdd size={14} />
                      Add task
                    </Button>
                  </div>
                )}
              </SortableContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrioritySection;
