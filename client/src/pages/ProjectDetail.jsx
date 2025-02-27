import React, { useState, useEffect, useRef } from "react";
import { IoIosAdd } from "react-icons/io";
import { useParams } from "react-router-dom";
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
import { showToast } from "../utils/showToast";
import { addTask, setTasks, updateTask } from "../store/taskSlice";
import { setStatuses } from "../store/statusSlice";

const ProjectDetail = () => {
  const [taskOpen, setTaskOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);

  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const statuses = useSelector((state) => state.status?.statuses);
  const tasks = useSelector((state) => state.task.tasks);

  // Fetch Statuses
  const fetchStatuses = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await requestServer(`status/all/${projectId}`);
      dispatch(setStatuses(res.data));
    } catch (error) {
      showToast(
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      const res = await requestServer(`task/all/${projectId}`);
      dispatch(setTasks(res.data));
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  // Update Task Status
  const updateCurrentTask = async (task) => {
    try {
      dispatch(updateTask(task._id));
      await requestServer(`task/update/${task._id}`, { ...task });
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
      <div className="flex gap-2 w-full items-center mb-2 justify-between">
        <div className="flex text-slate-600 font-inter gap-1">
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <TbStack2 size={18} />
            Group: Status
          </div>
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <PiGitMergeDuotone size={18} />
            SubTask: Collapse all
          </div>
        </div>
        <div className="flex text-slate-600 font-inter gap-1 items-center">
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <RiExpandUpDownLine size={18} />
            Filter
          </div>
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <IoFilter size={18} />
            Sort
          </div>
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPerson size={18} />
            Me mode
          </div>
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1 justify-center items-center gap-1 text-sm">
            <GoPeople size={18} />
            Assignee
          </div>
          <span className="h-6 w-[1px] bg-slate-300 mx-2"></span>
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
                  setTaskOpen={setTaskOpen}
                  tasks={tasks?.filter((task) => task.status === status._id)}
                  selectedStatus={setCurrentStatus}
                />
              ))
          )}
        </div>
      </DndContext>

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
