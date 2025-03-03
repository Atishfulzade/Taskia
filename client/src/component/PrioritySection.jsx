import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import Task from "./Task";
import { PiDotsThreeBold } from "react-icons/pi";
import { IoAdd } from "react-icons/io5";
import { TbFlag3 } from "react-icons/tb";
import { MdArrowRight } from "react-icons/md";
import { useMemo } from "react";

const PrioritySection = ({
  priority,
  tasks,
  toggleDropdown,
  openDropdowns,
}) => {
  // Use the useDroppable hook to make the section droppable
  const { setNodeRef, isOver } = useDroppable({
    id: priority,
    data: { priority },
  });

  // Filter tasks based on priority
  const filteredTasks = tasks.filter((task) => task.priority === priority);

  // Memoize the list of task IDs for SortableContext
  const sortableItems = useMemo(() => {
    return filteredTasks.length > 0
      ? filteredTasks.map((task) => task._id)
      : [];
  }, [filteredTasks]);

  return (
    <div
      ref={setNodeRef}
      className={`flex w-full transition-all dark:bg-slate-700 text-slate-600 items-start justify-start ${
        openDropdowns[priority] ? "h-fit" : "h-10"
      } ${isOver ? "bg-gray-200" : ""}`}
    >
      {/* Toggle Arrow */}
      <MdArrowRight
        size={14}
        onClick={() => toggleDropdown(priority)}
        className={`cursor-pointer transition-all dark:bg-slate-700 p-1 dark:text-slate-300 text-slate-400 h-8 w-8 ${
          openDropdowns[priority] ? "rotate-90" : "rotate-0"
        }`}
      />

      {/* Priority Section Content */}
      <div className="flex flex-col w-full transition-all dark:bg-slate-700">
        {/* Priority Header */}
        <div className="flex justify-start items-center gap-2 p-1 rounded-md">
          <TbFlag3 className="dark:text-slate-100" size={16} />
          <h5 className="font-inter font-medium text-sm dark:text-slate-100">
            {priority} Priority
          </h5>
          <p className="text-xs font-inter text-slate-500">
            {filteredTasks.filter((item) => item.priority === priority).length}
          </p>
          <PiDotsThreeBold
            size={22}
            className="hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 cursor-pointer p-0.5 rounded"
          />
          <p className="flex gap-0.5 dark:text-slate-100 text-[13px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 px-2 rounded items-center justify-center">
            <IoAdd size={18} />
            Add task
          </p>
        </div>

        {/* Drag-and-Drop List */}
        {openDropdowns[priority] && (
          <div className="flex flex-col w-full p-1 rounded-lg">
            {/* Table Headers */}
            <div className="flex w-full">
              <p className="w-full text-[12px] font-inter ml-8 font-regular dark:text-slate-100 text-slate-400">
                Name
              </p>
              <p className="w-1/3 text-[12px] font-inter ml-0 font-regular dark:text-slate-100 text-slate-400">
                Status
              </p>
              <p className="w-1/3 text-[12px] font-inter ml-28 font-regular dark:text-slate-100 text-slate-400">
                Created at
              </p>
              <p className="w-1/4 text-[12px] font-inter font-regular dark:text-slate-100 text-slate-400">
                Assigned
              </p>
              <p className="w-[20%] text-[12px] font-inter font-regular dark:text-slate-100 text-slate-400">
                Priority
              </p>
              <p className="w-1/3 text-[12px] font-inter ml-6 font-regular dark:text-slate-100 text-slate-400">
                Due date
              </p>
            </div>

            {/* Sortable Task List */}
            <SortableContext
              items={sortableItems}
              strategy={verticalListSortingStrategy}
            >
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <Task key={task._id} task={task} priority={priority} />
                ))
              ) : (
                <div className="h-10 flex items-center justify-center bg-slate-200 text-gray-500 rounded-lg">
                  No task
                </div>
              )}
            </SortableContext>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrioritySection;
