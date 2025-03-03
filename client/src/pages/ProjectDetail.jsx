import React, { useState, useEffect, useRef } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { TbStack2 } from "react-icons/tb";
import { PiGitMergeDuotone } from "react-icons/pi";
import { IoFilter } from "react-icons/io5";
import { RiExpandUpDownLine } from "react-icons/ri";
import { GoPeople, GoPerson } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../component/Loader";
import AddTaskPopup from "../component/AddTaskPopup";
import Column from "../component/Column";
import bgColors from "../utils/constant";
import requestServer from "../utils/requestServer";
import { setTasks, updateTask } from "../store/taskSlice";
import { setStatuses } from "../store/statusSlice";

const ProjectDetail = () => {
  const [taskOpen, setTaskOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const userId = useSelector((state) => state.user.user?._id);
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const statuses = useSelector((state) => state.status?.statuses);
  const tasks = useSelector((state) => state.task?.tasks);
  const [editTaskOpen, setEditTaskOpen] = useState({
    isOpen: false,
    task: null,
  });

  // Fetch Statuses
  const fetchStatuses = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await requestServer(`status/all/${projectId}`);
      dispatch(setStatuses(res.data));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    if (!projectId || !userId) return;
    try {
      const res = await requestServer(`task/all/${projectId}`);
      const allTasks = res.data;

      // Filter tasks for the current user
      const filteredTasks = allTasks.filter(
        (task) =>
          task.assignedBy === userId || // Task assigned by user
          task.assignedTo === userId || // Task assigned to user
          (task.assignedTo && task.projectId === projectId) // Unassigned task in the same project
      );

      dispatch(setTasks(filteredTasks));
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  // Update Task Status
  const updateCurrentTask = async (task) => {
    try {
      dispatch(updateTask(task._id));
      await requestServer(`task/update/${task._id}`, { ...task });

      // Refresh tasks to ensure correct visibility
      fetchTasks();
      setTaskOpen(false);
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  // Handle Drag End
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    // Find the dragged task
    const updatedTask = tasks.find((task) => task._id === taskId);
    if (updatedTask && updatedTask.status !== newStatus) {
      // Optimistically update state
      dispatch(updateTask({ ...updatedTask, status: newStatus }));

      // Send update request in the background
      updateCurrentTask({ ...updatedTask, status: newStatus });
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchStatuses();
      fetchTasks();
    }
  }, [projectId]);

  return (
    <div className="h-full dark:text-slate-50 dark:bg-slate-700 w-full">
      {/* Header Section */}
      <div className="flex gap-2 w-full items-center mb-2 justify-between">
        <div className="flex text-slate-600 font-inter gap-1">
          {/* Group by Status */}
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <TbStack2 size={18} />
            Group: Status
          </div>

          {/* Collapse Subtasks */}
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <PiGitMergeDuotone size={18} />
            SubTask: Collapse all
          </div>
        </div>

        {/* Filter, Sort, and Search Section */}
        <div className="flex text-slate-600 font-inter gap-1 items-center">
          {/* Filter */}
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <RiExpandUpDownLine size={18} />
            Filter
          </div>

          {/* Sort */}
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <IoFilter size={18} />
            Sort
          </div>

          {/* Me Mode */}
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPerson size={18} />
            Me mode
          </div>

          {/* Assignee */}
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPeople size={18} />
            Assignee
          </div>

          {/* Divider */}
          <span className="h-6 w-[1px] bg-slate-300 mx-2"></span>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search..."
            className="border border-slate-300 focus:outline-1 outline-violet-300 w-48 px-2 text-sm py-[3px] rounded-md"
          />
        </div>
      </div>

      {/* Drag & Drop Context */}
      <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div
          ref={scrollContainerRef}
          className="px-10 py-10 overflow-x-auto h-[calc(100vh-120px)] w-[calc(100vw-280px)] overflow-y-auto flex gap-3.5"
        >
          {loading ? (
            <Loader />
          ) : (
            statuses
              ?.filter((status) => status.projectId === projectId)
              .map((status, i) => (
                <Column
                  key={status._id}
                  bgColor={bgColors[i]}
                  status={status}
                  taskOpen={taskOpen}
                  setEditTaskOpen={setEditTaskOpen}
                  setTaskOpen={setTaskOpen}
                  tasks={tasks.filter(
                    (task) =>
                      task.status === status._id &&
                      (task.assignedBy === userId ||
                        task.assignedTo === userId ||
                        !task.assignedTo)
                  )}
                  selectedStatus={setCurrentStatus}
                />
              ))
          )}
        </div>
      </DndContext>
      {editTaskOpen.isOpen && (
        <AddTaskPopup
          setTaskOpen={() => setEditTaskOpen({ isOpen: false, task: {} })}
          currentStatus={currentStatus}
          taskData={editTaskOpen.task}
          isEdit={true}
        />
      )}
      {/* Task Popup */}
      {taskOpen && (
        <AddTaskPopup
          status={statuses}
          setTaskOpen={setTaskOpen}
          currentStatus={currentStatus}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
