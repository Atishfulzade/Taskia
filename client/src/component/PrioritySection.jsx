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
  const { setNodeRef, isOver } = useDroppable({
    id: priority,
    data: { priority },
  });

  const filteredTasks = tasks.filter((task) => task.priority === priority);

  const sortableItems = useMemo(() => {
    return filteredTasks.length > 0
      ? filteredTasks.map((task) => task._id)
      : [];
  }, [filteredTasks]);

  return (
    <div
      ref={setNodeRef}
      className={`flex gap-2 w-full transition-all rounded dark:bg-slate-700 text-slate-600 items-start justify-start ${
        openDropdowns[priority] ? "h-fit" : "h-10"
      } ${isOver ? "bg-gray-200" : ""}`}
    >
      <MdArrowRight
        size={18}
        onClick={() => toggleDropdown(priority)}
        className={`cursor-pointer transition-all dark:bg-slate-700 p-1 dark:text-slate-300 text-slate-400 h-10 w-10 ${
          openDropdowns[priority] ? "rotate-90" : "rotate-0"
        }`}
      />
      <div className="flex flex-col w-full transition-all dark:bg-slate-700">
        <div className="flex justify-start items-center gap-2 text-lg p-2  rounded-md">
          <TbFlag3 className="dark:text-slate-100" />
          <h5 className="font-inter font-medium  dark:text-slate-100">
            {priority} Priority
          </h5>
          <PiDotsThreeBold
            size={22}
            className="hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-800 cursor-pointer p-0.5 rounded"
          />
          <p className="flex gap-0.5 dark:text-slate-100 text-sm cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 p-0.5 px-2 rounded items-center justify-center">
            <IoAdd size={18} />
            Add task
          </p>
        </div>

        {/* Drag-and-Drop List */}
        {openDropdowns[priority] && (
          <div className="flex flex-col w-full p-2 rounded-lg">
            <div className="flex w-full mb-1 ">
              <p className="w-1/3 text-sm font-inter ml-10 font-medium dark:text-slate-100 text-slate-400">
                Name
              </p>
              <p className="w-1/3 text-sm font-inter ml-32 font-medium dark:text-slate-100 text-slate-400">
                Status
              </p>
              <p className="w-1/3 text-sm font-inter ml-32 font-medium dark:text-slate-100 text-slate-400">
                Priority
              </p>
            </div>

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
