import React, { useState, useEffect, useRef } from "react";
import { IoIosAdd } from "react-icons/io";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddTaskPopup from "../component/AddTaskPopup";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { TbStack2 } from "react-icons/tb";
import Column from "../component/Column";
import { PiGitMergeDuotone } from "react-icons/pi";
import { IoFilter } from "react-icons/io5";
import { RiExpandUpDownLine } from "react-icons/ri";
import { GoPeople } from "react-icons/go";
import { GoPerson } from "react-icons/go";
import bgColors from "../utils/constant";
import requestServer from "../utils/requestServer";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../utils/showToast";
import { addTask, setTasks } from "../store/taskSlice";
import { setStatuses } from "../store/statusSlice";

const ProjectDetail = () => {
  const [taskOpen, setTaskOpen] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.project.currentProject?._id);

  const fetchStatuses = async () => {
    try {
      const res = await requestServer(`status/all/${projectId}`);
      dispatch(setStatuses(res.data));
      console.log(res.data);
    } catch (error) {
      // if (error.response?.data?.message === "Token not found") {
      //   showToast("Invalid token! Please login again.", "error");
      //   localStorage.removeItem("token");
      //   localStorage.removeItem("userState");
      //   dispatch(setCurrentProject(null));
      //   dispatch(setProjects([]));
      //   navigate("/authenticate");
      // } else {
      showToast(
        error.response?.data?.message || "Something went wrong",
        "error"
      );
      // }
    }
  };

  // Fetch Statuses
  const statuses = useSelector((state) => state.status?.statuses);

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      const res = await requestServer(`task/all/${projectId}`);

      dispatch(setTasks(res.data));
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };
  const tasks = useSelector((state) => state.task.tasks);
  // Add a New Task
  const addTaskComponent = async () => {
    if (!taskName.trim()) return;
    try {
      const response = await requestServer("task/add", {
        projectId,
        status: statuses[0]?._id,
        name: taskName,
      });
      dispatch(addTask((prev) => [...prev, response.data.data]));
      setTasks((prev) => [...prev, response.data.data]);
      setTaskOpen(false);
      setTaskName("");
    } catch (error) {
      console.error("Error adding task", error);
    }
  };

  // Update a New Task
  const updateTask = async (task) => {
    try {
      setLoader(true);
      await requestServer(`task/update/${task._id}`, { ...task });

      fetchTasks();
      setLoader(false);
      setTaskOpen(false);
      setTaskName("");
    } catch (error) {
      console.error("Error adding task", error);
    }
  };

  // Handle Drag End
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task._id === taskId) {
          let obj = {
            ...task,
            status: newStatus,
          };
          updateTask(obj);

          return { ...task, status: newStatus };
        } else {
          return task;
        }
      })
    );
  };
  useEffect(() => {
    fetchStatuses();
    fetchTasks();
  }, [projectId]);
  console.log(tasks);

  return (
    <div className="h-full dark:text-slate-50 dark:bg-slate-700 w-full  ">
      <div className="flex gap-2 w-full items-center mb-2 justify-between">
        <div className="flex text-slate-600 font-inter gap-1">
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1  justify-center items-center gap-1 text-sm">
            <TbStack2 size={18} />
            Group: Status
          </div>
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1  justify-center items-center gap-1 text-sm">
            <PiGitMergeDuotone size={18} />
            SubTask: Collapse all
          </div>
        </div>
        <div className="flex text-slate-600 font-inter gap-1 items-center">
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1  justify-center items-center gap-1 text-sm">
            <RiExpandUpDownLine size={18} />
            Filter
          </div>
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1  justify-center items-center gap-1 text-sm">
            <IoFilter size={18} />
            Sort
          </div>
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1  justify-center items-center gap-1 text-sm">
            <GoPerson size={18} />
            Me mode
          </div>
          <div className="flex border cursor-pointer border-slate-300 rounded-full px-3 py-1  justify-center items-center gap-1 text-sm">
            <GoPeople size={18} />
            Assignee
          </div>
          <span className="h-6 w-[1px] bg-slate-300 mx-2"></span>
          <input
            type="text"
            placeholder="Search..."
            className="border border-slate-300 focus:outline-1 outline-violet-300 w-48 px-2 text-sm py-[3px] rounded-md "
          />
        </div>
      </div>
      <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div
          ref={scrollContainerRef}
          className="px-10 py-10 overflow-x-auto h-[calc(100vh-120px)] w-[calc(100vw-280px)] overflow-y-auto flex gap-3.5"
        >
          {statuses?.map((status, i) => (
            <div key={status._id} className="flex gap-5 ">
              <Column
                key={status._id}
                bgColor={bgColors[i]}
                status={status}
                taskOpen={taskOpen}
                setTaskOpen={setTaskOpen}
                tasks={tasks?.filter((task) => task.status === status._id)}
              />
            </div>
          ))}
        </div>
      </DndContext>

      {/* Task Popup */}
      {taskOpen && <AddTaskPopup status={statuses} setTaskOpen={setTaskOpen} />}
    </div>
  );
};

export default ProjectDetail;
