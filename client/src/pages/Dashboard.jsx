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

const dashboardTop1 = [
  { id: 1, icon: <RiAppsLine size={18} />, label: "Overview" },
  { id: 2, icon: <IoIosList size={18} />, label: "List" },
  { id: 3, icon: <HiOutlineViewBoards size={18} />, label: "Board" },
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
      case 1:
        return <ProjectOverview />;
      case 2:
        return <ProjectList />;
      default:
        return <ProjectDetail />;
    }
  };

  return (
    <div className="w-full h-full">
      {/* Top Bar */}
      <div className="flex h-10 border-b border-slate-300 px-2 justify-between items-center">
        {/* Left Side Navigation */}
        <div className="flex gap-3 text-slate-800 font-sans text-sm items-center">
          {dashboardTop1.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedSubBoard(item.id)}
              className={`flex items-center cursor-pointer justify-center gap-1 px-3 py-1 rounded transition-all ${
                item.id === selectedSubBoard
                  ? "bg-violet-800 text-white"
                  : "hover:text-slate-600"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 text-slate-800 font-sans text-sm">
          {dashboardTop2.map((item) => (
            <div
              key={item.id}
              className="flex items-center cursor-pointer gap-1 hover:text-slate-600"
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}

          {/* Divider */}
          <span className="bg-slate-200 h-5 w-0.5"></span>

          {/* Add Task Button */}
          <button className="text-white bg-violet-700 cursor-pointer text-sm px-3 py-1 rounded flex gap-2 items-center transition hover:bg-violet-600">
            Add task
            <span className="bg-violet-500 h-4 w-[1px]"></span>
            <IoIosArrowDown />
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-2">{renderComponent()}</div>
    </div>
  );
};

export default Dashboard;
