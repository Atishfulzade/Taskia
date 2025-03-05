import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiBell, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import {
  IoAddCircleOutline,
  IoApps,
  IoMoonOutline,
  IoSunnyOutline,
} from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/userSlice"; // Assuming you have a logout action
import logo from "../assets/logo-white.png";
import UserProfile from "./UserProfile";
import NotificationsComponent from "./NotificationsComponent";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userInfo = useSelector((state) => state.user.user);
  const notifications = useSelector(
    (state) => state.notifications?.items || []
  );

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Dark mode effect
  useEffect(() => {
    const html = document.querySelector("html");
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

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
        setShowNotifications(false);
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

  // Profile dropdown menu actions
  const handleProfileAction = (action) => {
    setShowProfile(false);
    switch (action) {
      case "profile":
        navigate("/profile");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "logout":
        dispatch(logout());
        navigate("/login");
        break;
      default:
        break;
    }
  };

  return (
    <nav className="sticky top-0 flex bg-violet-800 px-5 py-2 justify-between dark:bg-violet-900 items-center shadow-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Logo" className="w-10 h-10" />
      </Link>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="relative flex w-full max-w-xl mx-4 backdrop-blur-lg ps-8 items-center bg-white/10 h-10 border border-violet-500 rounded-lg"
      >
        <FiSearch size={20} className="absolute top-2.5 left-2 text-white" />
        <input
          type="text"
          placeholder="Search across your workspace..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-full w-full outline-none text-slate-100 placeholder-slate-300 placeholder:font-inter font-light text-md bg-transparent"
        />
      </form>

      {/* Navbar Actions */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-violet-700 text-white transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <IoSunnyOutline size={20} />
          ) : (
            <IoMoonOutline size={20} />
          )}
        </button>

        {/* Notifications */}
        <NotificationsComponent />

        {/* New Button */}
        <button className="flex px-3 gap-2 py-2 hover:bg-violet-700 font-inter font-normal items-center rounded-lg text-white">
          <IoAddCircleOutline size={20} />
          <span className="hidden md:block">New</span>
        </button>

        {/* Apps Button */}
        <button className="p-2 hover:bg-violet-700 rounded-lg text-white">
          <IoApps size={20} />
        </button>

        {/* Profile Section */}
        <div ref={profileRef} className="relative">
          <div
            onClick={() => setShowProfile(!showProfile)}
            className="flex select-none cursor-pointer px-2 py-1 gap-2 items-center bg-violet-500 rounded-full hover:bg-violet-600 transition-colors"
          >
            <div className="h-8 w-8 flex bg-violet-700 cursor-pointer border items-center justify-center border-violet-500 text-white text-sm rounded-full">
              {userInfo?.name?.trim()[0] || "?"}
            </div>
            <span className="hidden md:block text-white text-sm">
              {userInfo?.name || "User"}
            </span>
            <IoIosArrowDown className="text-white" />
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-2">
              <UserProfile onAction={handleProfileAction} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
