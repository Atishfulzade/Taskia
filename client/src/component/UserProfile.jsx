import React, { forwardRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { logout } from "../store/userSlice";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";
import { useNavigate } from "react-router-dom";

// Icons
import { LogOut, User, Settings, Moon, Sun, X, Bell } from "lucide-react";

// ShadCN components
import { Button } from "../components/ui/Button";
import { Switch } from "../components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { formatDate } from "@/utils/formatDate";

const UserProfile = forwardRef(({ setShowProfile, userInfo }, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Handle escape key to close profile
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Update document theme when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Handle closing with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowProfile(false);
      setIsClosing(false);
    }, 200);
  };

  // Handle theme toggle
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Handle user logout
  const logoutUser = async () => {
    try {
      const res = await requestServer("user/logout");
      showToast(res.message, "success");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logout());
      handleClose();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      showToast("Failed to log out. Please try again.", "error");
    }
  };

  // Return null if userInfo is not available
  if (!userInfo) return null;

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{
        opacity: isClosing ? 0 : 1,
        y: isClosing ? -10 : 0,
        scale: isClosing ? 0.98 : 1,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed top-16 right-6 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-lg 
                 border border-slate-200 dark:border-slate-800 overflow-hidden 
                 z-[9999]"
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 
                   dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 
                   dark:hover:bg-slate-800 transition-colors"
        aria-label="Close profile menu"
      >
        <X size={16} />
      </button>

      {/* User Header */}
      <div
        className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 
                    dark:from-slate-800 dark:to-slate-900 relative"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-slate-700">
            <AvatarImage
              src={userInfo?.avatar}
              alt={userInfo?.name || "User"}
            />
            <AvatarFallback className="bg-violet-600 text-white">
              {getInitials(userInfo?.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-slate-900 dark:text-white">
                {userInfo?.name || "Guest User"}
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userInfo?.email || "No email"}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Member since {formatDate(userInfo.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="p-2">
        {/* Profile */}
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/profile");
            handleClose();
          }}
          className="w-full justify-start px-3 py-2 my-0.5 text-slate-700 dark:text-slate-300 
                     hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <User size={18} className="mr-3 text-slate-500 dark:text-slate-400" />
          My Profile
        </Button>

        {/* Notifications */}
        {/* <Button
          variant="ghost"
          onClick={() => {
            navigate("/notifications");
            handleClose();
          }}
          className="w-full justify-between px-3 py-2 my-0.5 text-slate-700 dark:text-slate-300 
                     hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <div className="flex items-center">
            <Bell
              size={18}
              className="mr-3 text-slate-500 dark:text-slate-400"
            />
            Notifications
          </div>
          {notifications > 0 && (
            <Badge
              variant="destructive"
              className="ml-2 px-1.5 min-w-[1.5rem] text-center"
            >
              {notifications}
            </Badge>
          )}
        </Button> */}

        {/* Settings */}
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/settings");
            handleClose();
          }}
          className="w-full justify-start px-3 py-2 my-0.5 text-slate-700 dark:text-slate-300 
                     hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Settings
            size={18}
            className="mr-3 text-slate-500 dark:text-slate-400"
          />
          Settings
        </Button>

        {/* Theme Toggle */}
        <div className="px-3 py-2 my-1 flex items-center justify-between rounded-lg">
          <div className="flex items-center">
            {isDarkMode ? (
              <Moon
                className="mr-3 text-slate-500 dark:text-slate-400"
                size={18}
              />
            ) : (
              <Sun
                className="mr-3 text-slate-500 dark:text-slate-400"
                size={18}
              />
            )}
            <span className="text-slate-700 dark:text-slate-300 text-sm">
              {isDarkMode ? "Dark" : "Light"} Mode
            </span>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-violet-600"
          />
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-2 mt-1">
        <Button
          onClick={logoutUser}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-2
                   border-red-200 dark:border-red-800/30 hover:bg-red-50 
                   dark:hover:bg-red-900/20 text-red-600 dark:text-red-400
                   hover:text-red-700 dark:hover:text-red-300 transition-colors"
        >
          <LogOut size={16} strokeWidth={2} />
          <span>Log Out</span>
        </Button>
      </div>
    </motion.div>
  );
});

export default UserProfile;
