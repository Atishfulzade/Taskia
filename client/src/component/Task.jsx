import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IoAdd } from "react-icons/io5";
import { RiDraggable, RiCheckboxBlankCircleLine } from "react-icons/ri";
import { TbFlag3Filled } from "react-icons/tb";
import { LiaPenSolid } from "react-icons/lia";
import CircularProgress from "./CircularProgress";
import { FaRegCalendar, FaRegCircleUser } from "react-icons/fa6";
import { formatDate } from "../utils/formatDate";
import { useEffect, useState } from "react";
import requestServer from "../utils/requestServer";
import { IoAttachSharp } from "react-icons/io5";
import { useSelector } from "react-redux";

const Task = ({ task, priority }) => {
  const [assignedUser, setAssignedUser] = useState("");
  const [statusDetails, setStatusDetails] = useState(null);
  const statusLength = useSelector((state) => state.status?.statuses?.length);
  // Fetch status details
  useEffect(() => {
    if (task?.status) {
      requestServer(`status/get/${task.status}`)
        .then((response) => {
          setStatusDetails(response.data); // Set the status details
        })
        .catch((error) => {
          console.error("Error fetching status:", error);
        });
    }
  }, [task?.status]);

  // Fetch assigned user details
  useEffect(() => {
    if (task?.assignedTo) {
      requestServer(`user/u/${task.assignedTo}`)
        .then((user) => {
          setAssignedUser(user?.data.name ?? "Unknown");
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });
    }
  }, [task?.assignedTo]);

  // Drag-and-drop functionality
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task?._id, data: { priority } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Determine flag color based on task priority
  const flagColor = (task) => {
    switch (task?.priority) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => e.stopPropagation()} // Prevents event propagation
      {...attributes}
      {...listeners}
      className="dark:bg-slate-800 border-b bg-white group border-slate-200 dark:border-slate-500 p-1.5 dark:hover:bg-slate-900 flex justify-start items-center gap-2 rounded hover:bg-slate-50 cursor-grab"
    >
      {/* Draggable Icon */}
      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <RiDraggable />
      </div>

      {/* Task Name */}
      <p className="w-full text-sm font-inter text-slate-700 dark:text-slate-100 flex font-medium gap-1 items-center">
        <RiCheckboxBlankCircleLine size={16} className="text-violet-600" />
        {task?.title}
      </p>

      {/* Task Status & Progress */}
      <div className="w-1/3">
        <p
          style={{ backgroundColor: statusDetails?.color?.secondaryColor }}
          className={`w-fit py-1.5 rounded-sm text-xs  flex justify-center items-center gap-1 px-4 text-slate-600 font-inter font-medium`}
        >
          <CircularProgress
            percentage={statusLength * 10} // Distributes equally among all statuses
            size={20}
            strokeWidth={2}
            color={statusDetails?.color?.primaryColor} // Use status secondary color
          />
          {statusDetails?.title || "No Status"} {/* Display status title */}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex opacity-0 mx-5 group-hover:opacity-100 gap-2">
        <IoAdd className="h-7 w-7 border border-slate-200 rounded-md dark:text-slate-300 dark:border-slate-500 dark:hover:bg-slate-600 p-1 cursor-pointer text-slate-500 hover:bg-slate-200" />
        <LiaPenSolid className="h-7 w-7 border border-slate-200 rounded-md dark:text-slate-300 dark:border-slate-500 dark:hover:bg-slate-600 p-1 cursor-pointer text-slate-500 hover:bg-slate-200" />
        {/* <MdOutlineDeleteOutline className="h-7 w-7 border border-slate-200 rounded-md dark:text-slate-300 dark:border-slate-500 dark:hover:bg-slate-600 p-1 cursor-pointer text-slate-500 hover:bg-slate-200" /> */}
      </div>

      {/* Due Date */}
      <p className="w-1/3 text-xs text-slate-600 font-inter">
        {formatDate(task.createdAt)}
      </p>

      {/* User Avatar */}
      <div className="w-1/5 text-xs flex dark:text-white text-slate-500">
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

      {/* Priority Flag */}
      <p className="w-[20%] text-sm dark:text-white text-slate-500">
        <TbFlag3Filled size={16} className={flagColor(task)} />
      </p>

      {/* Task Deadline */}
      <div className="w-1/3 ml-5 text-xs flex gap-1 dark:text-white text-slate-500">
        <FaRegCalendar size={16} className="text-slate-500 " />
        {formatDate(task.dueDate)}
      </div>
      {/* attachment */}
      {task.attachedFile.length ? (
        <div
          title={task.attachedFile.url}
          className="w-1/3 ml-5 text-xs flex gap-1 dark:text-white text-slate-500"
        >
          <IoAttachSharp size={18} className="text-slate-500 " />
        </div>
      ) : (
        <div className="w-1/3 ml-5 text-xs flex gap-1 dark:text-white text-slate-500"></div>
      )}
    </div>
  );
};

export default Task;
