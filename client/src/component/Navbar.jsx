import React, { useState, useEffect } from "react";
import { FiSearch, FiBell } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { IoAddCircleOutline, IoApps } from "react-icons/io5";
import { MdOutlineLightMode, MdOutlineNightlight } from "react-icons/md";
import { Link } from "react-router-dom";
import logo from "../assets/logo-white.png";
import UserProfile from "./UserProfile";
import { useSelector } from "react-redux";

const Navbar = () => {
  // Load dark mode preference from localStorage
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [showProfile, setShowProfile] = useState(false);
  const userInfo = useSelector((state) => state.user.user);

  useEffect(() => {
    let html = document.querySelector("#root");
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <div className="flex bg-violet-800 px-5 py-1 justify-between dark:bg-violet-900 items-center">
      <Link to="/">
        <img src={logo} alt="Logo" className="w-8" />
      </Link>
      <div className="relative flex w-98 backdrop-blur-lg ps-8 items-center bg-white/10 h-8 border border-violet-500 rounded-lg">
        <FiSearch size={20} className="absolute top-1.5 left-2 text-white" />
        <input
          type="text"
          placeholder="Search..."
          className="h-full w-full outline-none text-slate-100 placeholder-slate-300 placeholder:font-inter font-light text-md"
        />
      </div>

      <div className="flex gap-1">
        {/* Dark Mode Toggle */}
        <div className="flex px-3 gap-1 py-1 cursor-pointer items-center justify-center text-white">
          <label className="flex cursor-pointer select-none items-center">
            <div className="relative">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
                className="sr-only"
              />
              <div
                className={`block h-6 w-12 rounded-full transition ${
                  isDarkMode ? "bg-violet-600" : "bg-violet-500"
                }`}
              ></div>
              <div
                className={`dot absolute top-1 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  isDarkMode ? "translate-x-6.5" : "translate-x-0.5"
                }`}
              ></div>
            </div>
          </label>
          {isDarkMode ? (
            <MdOutlineLightMode size={18} />
          ) : (
            <MdOutlineNightlight size={18} />
          )}
        </div>

        {/* Other Navbar Items */}
        <button className="flex px-3 gap-1 py-1 hover:bg-violet-700 font-inter font-normal rounded-lg items-center justify-center text-white">
          <FiBell size={20} />
          Notification
        </button>
        <button className="flex px-3 gap-1 py-1 hover:bg-violet-700 font-inter font-normal items-center rounded-lg justify-center text-white">
          <IoAddCircleOutline size={20} />
          New
        </button>
        <button className="flex px-3 gap-1 py-1 hover:bg-violet-700 font-inter font-normal items-center rounded-lg justify-center text-white">
          <IoApps size={20} />
        </button>

        {/* Profile */}
        <div
          onClick={() => setShowProfile(!showProfile)}
          className="flex select-none cursor-pointer px-1 gap-1 items-center bg-violet-500 rounded-full"
        >
          <div className="h-6 w-6 flex bg-violet-700 cursor-pointer border items-center justify-center border-violet-500 text-white text-xs rounded-full">
            {userInfo?.name?.trim()[0] || "?"}
          </div>
          <IoIosArrowDown className="text-violet-800" />
        </div>
        {showProfile && (
          <UserProfile setShowProfile={setShowProfile} userInfo={userInfo} />
        )}
      </div>
    </div>
  );
};

export default Navbar;
