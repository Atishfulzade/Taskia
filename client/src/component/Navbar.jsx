import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import {
  IoAddCircleOutline,
  IoApps,
  IoMoonOutline,
  IoSunnyOutline,
} from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../assets/logo-white.png";
import UserProfile from "./UserProfile";
import { useTheme } from "@/components/ui/ThemeProvider";
import NotificationCenter from "./NotificationCenter";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userInfo = useSelector((state) => state.user.user);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky z-[9999] top-0 flex bg-violet-800 dark:bg-violet-900 px-5 py-2 justify-between items-center shadow-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Logo" className="w-10 h-10" />
      </Link>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="relative flex w-full max-w-xl mx-4 backdrop-blur-lg ps-8 items-center bg-white/10 dark:bg-gray-800/50 h-10 border border-violet-500 dark:border-violet-600 rounded-lg"
      >
        <FiSearch
          size={20}
          className="absolute top-2.5 left-2 text-white dark:text-gray-300"
        />
        <input
          type="text"
          placeholder="Search across your workspace..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-full w-full outline-none text-slate-100 dark:text-gray-300 placeholder-slate-300 dark:placeholder-gray-400 placeholder:font-inter font-light text-md bg-transparent"
        />
      </form>

      {/* Navbar Actions */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-violet-700 dark:hover:bg-violet-800 text-white dark:text-gray-300 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {theme === "dark" ? (
            <IoSunnyOutline size={20} />
          ) : (
            <IoMoonOutline size={20} />
          )}
        </button>

        {/* Notifications */}
        {/* <NotificationsComponent ref={notificationsRef} /> */}
        <NotificationCenter />
        {/* New Button */}
        <button className="flex px-3 gap-2 py-2 hover:bg-violet-700 dark:hover:bg-violet-800 font-inter font-normal items-center rounded-lg text-white dark:text-gray-300">
          <IoAddCircleOutline size={20} />
          <span className="hidden md:block">New</span>
        </button>

        {/* Apps Button */}
        <button className="p-2 hover:bg-violet-700 dark:hover:bg-violet-800 rounded-lg text-white dark:text-gray-300">
          <IoApps size={20} />
        </button>

        {/* Profile Section */}
        <div
          ref={profileRef}
          onClick={() => setShowProfile(!showProfile)}
          className="flex select-none cursor-pointer px-2 py-1 gap-2 items-center bg-violet-500 dark:bg-violet-600 rounded-full hover:bg-violet-600 dark:hover:bg-violet-700 transition-colors"
        >
          <div className="h-8 w-8 flex bg-violet-700 dark:bg-violet-800 cursor-pointer border items-center justify-center border-violet-500 dark:border-violet-600 text-white text-sm rounded-full">
            {userInfo?.name?.trim()[0] || "?"}
          </div>
          <span className="hidden md:block text-white dark:text-gray-300 text-sm">
            {userInfo?.name || "User"}
          </span>
          <IoIosArrowDown className="text-white dark:text-gray-300" />
        </div>

        {/* Render UserProfile */}
        {showProfile && (
          <UserProfile
            setShowProfile={setShowProfile}
            userInfo={userInfo}
            ref={profileRef}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
