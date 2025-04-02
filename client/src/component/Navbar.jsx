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
import { useDispatch, useSelector } from "react-redux";
import logo from "../assets/logo-white.png";
import UserProfile from "./UserProfile";
import { useTheme } from "@/components/ui/ThemeProvider";
import NotificationCenter from "./NotificationCenter";
import { setCurrentProject } from "@/store/projectSlice";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    projects: [],
    tasks: [],
    statuses: [],
  });

  const userInfo = useSelector((state) => state.user.user);
  const projects = useSelector((state) => state.project.projects);
  const tasks = useSelector((state) => state.task.tasks);
  const statuses = useSelector((state) => state.status.statuses);
  const dispatch = useDispatch();
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

  // Update search results whenever searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ projects: [], tasks: [], statuses: [] });
      return;
    }

    const query = searchQuery.toLowerCase();

    // Search projects
    const matchedProjects = projects.filter((project) =>
      project.title?.toLowerCase().includes(query)
    );

    // Search tasks
    const matchedTasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
    );

    // Search statuses
    const matchedStatuses = statuses.filter((status) =>
      status.title.toLowerCase().includes(query)
    );

    setSearchResults({
      projects: matchedProjects,
      tasks: matchedTasks,
      statuses: matchedStatuses,
    });
  }, [searchQuery, projects, tasks, statuses]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      // Optionally clear the search results dropdown after navigation
      // setSearchResults({ projects: [], tasks: [], statuses: [] });
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

        {/* Search Results Dropdown */}
        {searchQuery.trim() !== "" && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg z-[9999]">
            {/* Projects Section */}
            {searchResults.projects.length > 0 && (
              <div className="p-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
                  Projects
                </h3>
                <div className="space-y-1">
                  {searchResults.projects.map((project) => (
                    <div
                      key={project._id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => {
                        dispatch(setCurrentProject(project));
                        setSearchQuery("");
                      }}
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {project.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Section */}
            {searchResults.tasks.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
                  Tasks
                </h3>
                <div className="space-y-1">
                  {searchResults.tasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => {
                        navigate(`/task/${task._id}`);
                        setSearchQuery("");
                      }}
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {task.description || "No description"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statuses Section */}
            {searchResults.statuses.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
                  Statuses
                </h3>
                <div className="space-y-1">
                  {searchResults.statuses.map((status) => (
                    <div
                      key={status._id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => {
                        // Navigate to status filtered view
                        navigate(`/task?status=${status._id}`);
                        setSearchQuery("");
                      }}
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {status.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchResults.projects.length === 0 &&
              searchResults.tasks.length === 0 &&
              searchResults.statuses.length === 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No results found for "{searchQuery}"
                </div>
              )}
          </div>
        )}
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
        <NotificationCenter ref={notificationsRef} />

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
          {userInfo.profilePic ? (
            <img
              src={userInfo.profilePic}
              alt="Profile"
              className="h-8 w-8 rounded-full border border-violet-700"
            />
          ) : (
            <div className="h-8 w-8 flex bg-violet-700 dark:bg-violet-800 cursor-pointer border items-center justify-center border-violet-500 dark:border-violet-600 text-white text-sm rounded-full">
              {userInfo?.name?.trim()[0] || "?"}
            </div>
          )}
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
