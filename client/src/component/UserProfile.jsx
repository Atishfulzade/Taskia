import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../store/userSlice";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";
import { useNavigate } from "react-router-dom";

// Icons
import { LogOut, User, Settings, HelpCircle, Moon, Sun, X } from "lucide-react";

const UserProfile = ({ setShowProfile, userInfo }) => {
  const boxRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close the profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowProfile]);

  // Handle user logout
  const logoutUser = async () => {
    try {
      const res = await requestServer("user/logout");
      showToast(res.message, "success");
      // Clear local storage and Redux state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logout());

      // Navigate to the home page and show a success toast
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      showToast("Failed to log out", "error");
    }
  };

  // Profile menu items
  const profileMenuItems = [
    {
      icon: User,
      label: "Profile",
      action: () => navigate("/profile"),
    },
    {
      icon: Settings,
      label: "Settings",
      action: () => navigate("/settings"),
    },
    {
      icon: HelpCircle,
      label: "Help",
      action: () => navigate("/help"),
    },
  ];

  // Return null if userInfo is not available
  if (!userInfo) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={boxRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-14 right-4 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={() => setShowProfile(false)}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* User Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
          {/* Circular Avatar */}
          <div className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center text-2xl font-bold mr-4 shadow-md">
            {userInfo?.name?.trim()[0] || "?"}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {userInfo?.name || "Guest User"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {userInfo?.email || "No email"}
            </p>
          </div>
        </div>

        {/* Profile Menu */}
        <div className="py-2">
          {profileMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <item.icon
                className="mr-3 text-slate-500 dark:text-slate-400 group-hover:text-violet-600 transition-colors"
                size={20}
              />
              <span className="text-slate-700 dark:text-slate-300 group-hover:text-violet-600 transition-colors">
                {item.label}
              </span>
            </button>
          ))}

          {/* Theme Toggle (Placeholder) */}
          <button className="w-full flex items-center px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group border-t border-slate-200 dark:border-slate-700">
            <Moon
              className="mr-3 text-slate-500 dark:text-slate-400 group-hover:text-violet-600 transition-colors"
              size={20}
            />
            <span className="text-slate-700 dark:text-slate-300 group-hover:text-violet-600 transition-colors">
              Dark Mode
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logoutUser}
            className="w-full flex items-center px-6 py-3 hover:bg-red-50 transition-colors group border-t border-slate-200 dark:border-slate-700"
          >
            <LogOut
              className="mr-3 text-red-500 group-hover:text-red-600 transition-colors"
              size={20}
            />
            <span className="text-red-500 group-hover:text-red-600 transition-colors">
              Log Out
            </span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfile;
