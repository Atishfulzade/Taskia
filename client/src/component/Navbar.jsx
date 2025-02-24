import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { IoAddCircleOutline, IoApps } from "react-icons/io5";
import logo from "../assets/logo-white.png";
import { Link } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import { MdOutlineLightMode } from "react-icons/md";
import { MdOutlineNightlight } from "react-icons/md";

const Navbar = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
  return (
    <div className="flex bg-violet-800 px-5 py-1 justify-between items-center">
      <Link to={"/"}>
        <img src={logo} alt="Logo" className="w-8" />
      </Link>
      <div className="relative flex w-98 backdrop-blur-lg  ps-8 items-center bg-white/10 h-8 border border-violet-500 rounded-lg">
        <FiSearch className="absolute top-1.5 left-2 text-white " />
        <input
          type="text"
          placeholder="Search..."
          className="h-full w-full font-inter  outline-none text-slate-100 placeholder-slate-100 placeholder:font-inter font-light text-sm"
        />
      </div>
      <div className="flex gap-1">
        <div className="flex px-3 gap-1 py-1  cursor-pointer  items-center justify-center  text-white font-inter text-sm rounded-full">
          <label className="flex cursor-pointer select-none items-center">
            <div className="relative">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="sr-only"
              />
              <div
                className={`block h-6 w-12 rounded-full transition ${
                  isChecked ? "bg-violet-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`dot absolute top-1 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  isChecked ? "translate-x-6.5" : "translate-x-0.5"
                }`}
              ></div>
            </div>
          </label>
          {isChecked ? <MdOutlineLightMode /> : <MdOutlineNightlight />}
        </div>

        <button className="flex px-3 gap-1 py-1 hover:bg-violet-700 cursor-pointer  items-center justify-center  text-white font-inter text-sm rounded-full">
          <FiBell size={18} />
          Notification
        </button>
        <button className="flex px-3 gap-1 py-1 hover:bg-violet-700 cursor-pointer  items-center justify-center  text-white font-inter text-sm rounded-full">
          <IoAddCircleOutline size={18} />
          New
        </button>
        <button className="flex px-3 gap-1 py-1 hover:bg-violet-700 cursor-pointer  items-center justify-center text-white font-inter text-sm rounded-full">
          <IoApps size={18} />
        </button>
        <div className="flex select-none cursor-pointer px-1 gap-1 items-center  justify-center bg-violet-200 rounded-full">
          <div className="h-6 w-6 flex  bg-violet-700 cursor-pointer border items-center justify-center border-violet-500 text-white font-inter text-xs rounded-full">
            M
          </div>
          <IoIosArrowDown className="text-violet-800" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
