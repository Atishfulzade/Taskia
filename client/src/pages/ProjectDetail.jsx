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
const ProjectDetail = () => {
  const { id: projectId } = useParams();
  // const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [projectPopUp, setProjectPopUp] = useState(false);
  const [title, setTitle] = useState("");
  const [loader, setLoader] = useState(false);
  const scrollContainerRef = useRef(null);

  // Save project ID in local storage
  useEffect(() => {
    localStorage.setItem("projectId", projectId);
  }, [projectId]);

  // Fetch Statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await axios.post(
          `http://localhost:3000/api/v1/status/all/${projectId}`
        );
        // setStatuses(res.data.data);
      } catch (error) {
        console.error("Error fetching statuses", error);
      }
    };

    fetchStatuses();
  }, [projectId]);
  const fetchTasks = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/task/all/${projectId}`
      );
      setTasks(res.data.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };
  // Fetch Tasks
  // useEffect(() => {
  //   fetchTasks();
  // }, [statuses]);
  //Add new status
  const addStatus = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/status/add`,
        {
          projectId,
          title,
        }
      );
      setStatuses((prev) => [...prev, response.data.data]);
      setEditStatus(false);
      setTitle("");

      // Wait for state update before scrolling & focusing
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft =
            scrollContainerRef.current.scrollWidth;
        }

        // Auto-focus on the newly added column's input field
        const newColumnInput = document.getElementById("new-status-input");
        if (newColumnInput) {
          newColumnInput.focus();
        }
      }, 300);
    } catch (error) {
      console.error("Error adding status", error);
    }
  };

  // Add a New Task
  const addTask = async () => {
    if (!taskName.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/task/add`,
        {
          projectId,
          status: statuses[0]?._id, // Assign first status as default
          name: taskName,
        }
      );

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
      const response = await axios.post(
        `http://localhost:3000/api/v1/task/update/${task._id}`,
        { ...task }
      );

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

  const statuses = [
    {
      projectId: "67b5f43887171f04439781ad",
      title: "Todo",
      __v: 0,
      _id: "67b5f43887171f04439781af",
    },
    {
      projectId: "67b5f43887171f04439781ad",
      title: "done",
      __v: 0,
      _id: "67b5f4a687171f04439781bd",
    },
    {
      projectId: "67b5f43887171f04439781ad",
      title: "Done by dev",
      __v: 0,
      _id: "67b629ad87171f044397825f",
    },
    {
      projectId: "67b5f43887171f04439781ad",
      title: "In review",
      __v: 0,
      _id: "67b629ec87171f0443978263",
    },
    {
      projectId: "67b5f43887171f04439781ad",
      title: "In review",
      __v: 0,
      _id: "67b629ec87171f0443978263",
    },
    {
      projectId: "67b5f43887171f04439781ad",
      title: "In review",
      __v: 0,
      _id: "67b629ec87171f0443978263",
    },
  ];

  return (
    <div className="h-full dark:text-slate-50 dark:bg-slate-700 w-full relative ">
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
          {statuses.map((status, i) => (
            <div key={status._id} className="flex gap-5 ">
              <Column
                key={status._id}
                bgColor={bgColors[i]}
                status={status}
                taskOpen={taskOpen}
                setTaskOpen={setTaskOpen}
                tasks={tasks.filter((task) => task.status === status._id)}
              />
            </div>
          ))}
        </div>
      </DndContext>

      {/* Task Popup */}
      {taskOpen && (
        <AddTaskPopup
          status={statuses}
          name={taskName}
          setName={setTaskName}
          setTaskOpen={setTaskOpen}
          addTask={addTask}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
