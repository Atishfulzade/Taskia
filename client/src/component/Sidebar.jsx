import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoAdd } from "react-icons/io5";
import { IoIosList } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentProject } from "../store/projectSlice";
import requestServer from "../utils/requestServer";
import AddProjectPopup from "./AddProjectPopup";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [assignProjects, setAssignProjects] = useState([]);
  const [addProject, setAddProject] = useState(false);

  // Redux states
  const projects = useSelector((state) => state.project.projects);
  const selectedProject = useSelector((state) => state.project.currentProject);
  const assignTask = useSelector((state) => state.assignTask?.tasks || []);

  // Set the first project as the current project on mount
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      dispatch(setCurrentProject(projects[0]));
    }
  }, [projects, selectedProject, dispatch]);

  // Function to fetch assigned projects
  const handleAssignTask = async () => {
    try {
      if (!assignTask.length) return; // Early return if no tasks

      // Extract unique project IDs
      const projectIds = [
        ...new Set(assignTask.flatMap((task) => task.projectId)),
      ];

      console.log("Extracted Project IDs:", projectIds); // Debugging

      if (!projectIds.length) return; // Avoid unnecessary API calls

      // Fetch all projects in parallel
      const responses = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const response = await requestServer(`project/get/${projectId}`);
            console.log("Fetched project:", response); // Debugging
            return response;
          } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            return null;
          }
        })
      );

      // Filter out failed requests (null values)
      setAssignProjects(responses.filter(Boolean));
    } catch (error) {
      console.error("Error fetching assigned projects:", error);
    }
  };

  // Fetch assigned projects whenever `assignTask` changes
  useEffect(() => {
    console.log("Assign Task:", assignTask); // Debugging
    handleAssignTask();
  }, [assignTask]);

  return (
    <div className="w-72 h-screen bg-white border-l border dark:bg-slate-700 border-slate-200">
      {/* Add Project Popup */}
      {addProject && <AddProjectPopup close={setAddProject} />}

      {/* Sidebar Header */}
      <div className="flex h-10 justify-between w-full items-center dark:bg-slate-700 border-b px-2 border-slate-200">
        <h3 className="font-inter text-slate-700 dark:text-slate-200">
          Projects
        </h3>
        <div className="flex gap-2 h-8 justify-center items-center">
          <HiOutlineDotsHorizontal
            size={22}
            className="cursor-pointer dark:text-slate-300 text-violet-700"
          />
          <FiSearch
            size={22}
            className="cursor-pointer dark:text-slate-300 text-violet-700"
          />
          <button
            onClick={() => setAddProject(!addProject)}
            className="w-6 h-6 bg-violet-800 dark:text-slate-300 hover:bg-violet-600 flex justify-center items-center text-white rounded"
          >
            <IoAdd size={18} />
          </button>
        </div>
      </div>

      {/* Project List */}
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
              className={`py-2 px-5 flex items-center justify-between cursor-pointer border-slate-200 
                ${
                  isActive
                    ? "bg-violet-700 text-white dark:bg-slate-900"
                    : "bg-white text-slate-900 dark:text-slate-300"
                } 
                hover:bg-slate-100 dark:hover:bg-slate-500`}
            >
              <div className="flex gap-2 items-center">
                <IoIosList
                  size={20}
                  className={isActive ? "text-slate-200" : "text-slate-500"}
                />
                <h4 className="font-inter text-[15px]">{project.title}</h4>
              </div>
              <PiDotsThreeVerticalBold
                className={isActive ? "text-slate-200" : "text-slate-500"}
              />
            </div>
          );
        })}
      </div>

      {/* Assigned Projects Section */}
      {assignProjects.length > 0 && (
        <div className="flex flex-col mt-10" key={Math.random()}>
          <h4 className="text-slate-700 dark:text-slate-200 px-5">Invites</h4>
          {assignProjects.map((project) => {
            const isActive = selectedProject?._id === project.data._id;

            return (
              <div
                key={project.data._id}
                onClick={() => {
                  dispatch(setCurrentProject(project.data));
                  navigate(`/dashboard/${project.data._id}`);
                }}
                className={`py-2 px-5 flex items-center justify-between cursor-pointer border-slate-200 
                  ${
                    isActive
                      ? "bg-violet-700 hover:bg-violet-800 text-white dark:bg-slate-900"
                      : "bg-white text-slate-900 dark:text-slate-300"
                  } 
                  `}
              >
                <div className="flex gap-2 items-center">
                  <IoIosList
                    size={20}
                    className={isActive ? "text-slate-200" : "text-slate-500"}
                  />
                  <h4 className="font-inter text-[15px]">
                    {project.data.title}
                  </h4>
                </div>
                <PiDotsThreeVerticalBold
                  className={isActive ? "text-slate-200" : "text-slate-500"}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
