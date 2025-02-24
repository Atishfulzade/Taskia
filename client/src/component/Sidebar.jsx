import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoAdd } from "react-icons/io5";
import { IoIosList } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { useLocation } from "react-router-dom";
import AddProjectPopup from "./AddProjectPopup";

const data = [
  {
    _id: "67b5f15e99b036084e37f8c0",
    title: "Project 1",
    __v: 0,
  },
  {
    _id: "67b5f43887171f04439781ad",
    title: "Project 2",
    __v: 0,
  },
  {
    _id: "67b65a66ab64aa9022250ad5",
    title: "Project 3",
    createdAt: "2025-02-19T22:25:42.627Z",
    updatedAt: "2025-02-19T22:25:42.627Z",
    __v: 0,
  },
  {
    _id: "67b65a9eab64aa9022250ae8",
    title: "Project 4",
    createdAt: "2025-02-19T22:26:38.186Z",
    updatedAt: "2025-02-19T22:26:38.186Z",
    __v: 0,
  },
  {
    _id: "67b66de2fbc652491304cb25",
    title: "uyg",
    createdAt: "2025-02-19T23:48:50.733Z",
    updatedAt: "2025-02-19T23:48:50.733Z",
    __v: 0,
  },
  {
    _id: "67b6b7a9fbc652491304cbb6",
    title: "project",
    createdAt: "2025-02-20T05:03:37.837Z",
    updatedAt: "2025-02-20T05:03:37.837Z",
    __v: 0,
  },
];
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addProject, setAddProject] = useState(false);

  return (
    <div className="w-72 h-screen bg-white border-l border dark:bg-slate-700 border-slate-200">
      {addProject && <AddProjectPopup close={setAddProject} />}
      <div className="flex h-10 justify-between w-full items-center dark:bg-slate-700 border-b px-2  border-slate-200">
        <h3 className="font-inter text-slate-700 dark:text-slate-200">
          Projects
        </h3>
        <div className="flex gap-2 h-8 justify-center items-center ">
          <HiOutlineDotsHorizontal
            size={22}
            className=" p-0.5 cursor-pointer  dark:text-slate-300 flex text-violet-700 justify-center items-center  rounded "
          />
          <FiSearch
            size={22}
            className=" p-0.5 cursor-pointer  flex justify-center dark:text-slate-300 text-violet-700 items-center  rounded "
          />
          <button
            onClick={() => setAddProject(!addProject)}
            className="w-6 cursor-pointer h-6 bg-violet-800 dark:text-slate-300 hover:bg-violet-600 flex justify-center items-center text-white rounded "
          >
            <IoAdd size={18} />
          </button>
        </div>
      </div>
      <div className="flex flex-col">
        {data.map((project) => {
          const isActive = location.pathname.includes(project._id);

          return (
            <div
              key={project._id}
              onClick={() => navigate(`/dashboard/${project._id}`)}
              className={`py-2 px-2 flex items-center justify-between cursor-pointer border-slate-200 
        ${
          isActive
            ? "bg-violet-700 text-white dark:bg-slate-900"
            : "bg-white text-slate-800 dark:text-slate-300"
        } 
        dark:bg-slate-700 hover:${
          isActive
            ? "bg-violet-600 dark:text-slate-200 dark:bg-slate-500"
            : "bg-slate-100 dark:text-slate-800 dark:bg-slate-500"
        }`}
            >
              <div className="flex gap-2 items-center">
                <IoIosList size={20} />
                <h4 className="font-inter text-sm">{project.title}</h4>
                <MdLockOutline />
              </div>
              <p
                className={`text-sm text-slate-600 dark:text-slate-50 ${
                  isActive ? "text-white" : ""
                }`}
              >
                8
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
