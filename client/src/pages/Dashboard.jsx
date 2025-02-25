import React, { useState } from "react";
import { RiAppsLine } from "react-icons/ri";
import { HiOutlineViewBoards } from "react-icons/hi";
import { IoIosList } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { RiEqualizerLine } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import ProjectDetail from "./ProjectDetail";
import ProjectList from "./ProjectList";
import ProjectOverview from "./ProjectOverview";
import { TbLayoutDashboard } from "react-icons/tb";

const dashboardTop1 = [
  // { id: 1, icon: <RiAppsLine size={18} />, label: "Overview" },
  { id: 1, icon: <IoIosList size={18} />, label: "List" },
  { id: 2, icon: <TbLayoutDashboard size={18} />, label: "Board" },
];

const dashboardTop2 = [
  { id: 1, icon: <FiSearch size={18} />, label: "Search" },
  { id: 2, icon: <RiEqualizerLine size={18} />, label: "Hide" },
  { id: 3, icon: <IoSettingsOutline size={18} />, label: "Setting" },
];

const Dashboard = () => {
  const [selectedSubBoard, setSelectedSubBoard] = useState(1);

  const renderComponent = () => {
    switch (selectedSubBoard) {
      // case 1:
      //   return <ProjectOverview />;
      case 1:
        return <ProjectList />;
      default:
        return <ProjectDetail />;
    }
  };

  return (
    <div className="w-full h-full dark:bg-slate-700">
      {/* Top Bar */}
      <div className="flex h-10 border-b border-slate-300 px-2 justify-between items-center">
        {/* Left Side Navigation */}
        <div className="flex gap-3 text-slate-800 font-sans text-sm items-center">
          {dashboardTop1.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedSubBoard(item.id)}
              className={`flex items-center text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer justify-center gap-1 px-3 py-1.5 rounded transition-all ${
                item.id === selectedSubBoard
                  ? "bg-violet-800 text-white"
                  : "hover:text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.icon}
              <span className="text-sm font-inter">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 text-slate-800 font-sans text-sm">
          {dashboardTop2.map((item) => (
            <div
              key={item.id}
              className="flex text-slate-700 items-center hover:bg-slate-100 px-2 rounded-md py-1.5 cursor-pointer dark:hover:text-slate-400 dark:hover:bg-slate-700 gap-1 dark:text-slate-200 "
            >
              {item.icon}
              <span className="font-inter text-sm">{item.label}</span>
            </div>
          ))}

          {/* Divider */}
          <span className="bg-slate-200 h-5 w-0.5"></span>

          {/* Add Task Button */}
          <button className="text-white bg-violet-700 cursor-pointer text-sm px-3 py-1.5 rounded flex gap-2 items-center justify-center transition hover:bg-violet-600">
            Add task
            <span className="bg-violet-500 h-4 w-[1px]"></span>
            <IoIosArrowDown size={10} />
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-2">{renderComponent()}</div>
    </div>
  );
};

export default Dashboard;
