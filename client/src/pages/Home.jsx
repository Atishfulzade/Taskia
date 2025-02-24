import React, { useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import AddProjectPopup from "../component/AddProjectPopup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import banner from "../assets/management.jpg";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { BsFillPinFill } from "react-icons/bs";

const Home = () => {
  const [popUpClose, setPopUpClose] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [projects, setProjects] = React.useState([]);
  const navigate = useNavigate();
  async function getAllProjects() {
    try {
      // Find the project by ID
      const project = await axios.post(
        "http://localhost:3000/api/v1/project/all"
      );
      setProjects(project.data.data || []);
      console.log(project);
    } catch (error) {
      console.error("Error fetching project", error);
    }
  }
  async function addProject() {
    try {
      const project = await axios.post(
        "http://localhost:3000/api/v1/project/add",
        { title }
      );

      setTitle("");
      setPopUpClose(false);
      // navigate(`/project/${project.data.project._id}`);
      getAllProjects();
    } catch (error) {
      console.error("Error adding project", error);
    }
  }
  async function deleteProject(event, project) {
    event.stopPropagation();
    try {
      await axios.post(
        `http://localhost:3000/api/v1/project/delete/${project._id}`
      );

      setTitle("");
      setPopUpClose(false);
      // navigate(`/project/${project.data.project._id}`);
      getAllProjects();
    } catch (error) {
      console.error("Error deleting project", error);
    }
  }
  console.log(projects);

  useEffect(() => {
    getAllProjects();
  }, []);

  return (
    <div className=" flex flex-col overflow-hidden  gap-8 pt-10 h-[86.7vh] px-32 w-screen bg-gradient-to-l from-gray-200 via-fuchsia-200 to-stone-100">
      {/* <Navbar /> */}
      <div className="flex w-full h-72  justify-between bg-white rounded shadow ">
        <div className="flex w-1/2 p-8 flex-col">
          <h3 className="text-3xl font-semibold text-slate-800">
            Manage your task with ease
          </h3>
          <p className="mt-2 font-medium">
            Effortlessly organize your tasks,
            <br /> stay productive, and achieve your goals—one step at a time!
          </p>
          <button
            className="animated-background mt-18 bg-gradient-to-r from-blue-500 via-blue-500 to-indigo-500 w-fit flex justify-center items-center py-3 cursor-pointer px-8 text-white text-base rounded-full"
            onClick={() => setPopUpClose(!popUpClose)}
          >
            <IoMdAdd size={24} /> Add project
          </button>
        </div>
        <img
          src={banner}
          alt="banner"
          className="w-1/2 h-full object-contain scale"
        />
      </div>

      {popUpClose && (
        <AddProjectPopup
          title={title}
          setTitle={setTitle}
          popUpClose={popUpClose}
          setPopUpClose={setPopUpClose}
          addProject={addProject}
        />
      )}
      <div className="flex gap-5 flex-col">
        <h3 className="font-semibold text-lg text-slate-800 ">
          Recent Projects
        </h3>
        <div className="flex gap-4 flex-wrap overflow-y-auto max-h-[28vh]">
          {projects.map((project) => (
            <div
              onClick={() => navigate(`/project/${project._id}`)}
              key={project._id}
              className="p-3 justify-start items-center  w-[10rem] h-[10rem] shadow text-wrap bg-gradient-to-r from-violet-400 to-purple-300 flex bg-stone-50 border border-slate-100 text-xl overflow-hidden cursor-pointer rounded-lg transition-all relative group"
            >
              <div className="flex flex-col items-start justify-center">
                <h3 className="font-semibold text-lg text-slate-900 flex items-center justify-center gap-1">
                  <BsFillPinFill />
                  {project.title}
                </h3>
                <p className="text-xs mt-4 text-stone-700 font-bold flex items-center justify-center gap-1">
                  <i>Created on</i> : 02/05/24
                </p>
                <p className="text-xs text-stone-700 font-bold flex items-center justify-center gap-1">
                  <i>Updated on</i> : 02/05/24
                </p>
              </div>
              <MdOutlineDeleteOutline
                onClick={(e) => deleteProject(e, project)}
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 text-white p-1 h-8 w-8 animated-background mt-18 bg-gradient-to-r from-blue-500 via-blue-500 to-indigo-500 rounded-full transition-opacity duration-200"
                size={22}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
