import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoAdd } from "react-icons/io5";
import { IoIosList } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { useLocation } from "react-router-dom";
import AddProjectPopup from "./AddProjectPopup";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setCurrentProject } from "../store/projectSlice";
import { MdLockOpen } from "react-icons/md";
import { PiDotsThreeVerticalBold } from "react-icons/pi";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [addProject, setAddProject] = useState(false);
  const projects = useSelector((state) => state.project.projects);
  const selectedProject = useSelector((state) => state.project.currentProject);
  const statuses = useSelector((state) => state.status?.statuses);
  console.log(statuses);

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
        {projects?.map((project) => {
          const isActive = selectedProject?._id === project._id;

          return (
            <div
              key={project._id}
              onClick={() => {
                dispatch(setCurrentProject(project));
                navigate(`/dashboard/${project._id}`);
              }}
              className={`py-2 relative px-5 flex items-center justify-between cursor-pointer border-slate-200 
        ${
          isActive
            ? "bg-violet-700 text-white dark:bg-slate-900"
            : "bg-white text-slate-900 dark:text-slate-300"
        } 
        dark:bg-slate-700 hover:${
          isActive
            ? "bg-violet-600 dark:text-slate-200 dark:bg-slate-500"
            : "bg-slate-100 dark:text-slate-800 dark:bg-slate-500"
        }`}
            >
              <div className="flex gap-2 items-center relative">
                <IoIosList
                  size={20}
                  className={`${
                    isActive ? "text-slate-200" : "text-slate-500 "
                  }`}
                />
                <h4 className="font-inter text-[15px]">{project.title}</h4>
              </div>

              <PiDotsThreeVerticalBold
                className={`${isActive ? "text-slate-200" : "text-slate-500 "}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
