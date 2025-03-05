import React, { forwardRef } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../store/userSlice";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";
import { useNavigate } from "react-router-dom";

// Icons
import {
  LogOut,
  User,
  Settings,
  HelpCircle,
  Moon,
  X,
  ChevronRight,
} from "lucide-react";

// ShadCN components
import { Button } from "../components/ui/Button";

const UserProfile = forwardRef(({ setShowProfile, userInfo }, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle user logout
  const logoutUser = async () => {
    try {
      const res = await requestServer("user/logout");
      showToast(res.message, "success");

      // Clear local storage and Redux state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logout());

      // Navigate to the home page
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      showToast("Failed to log out. Please try again.", "error");
    }
  };

  // Profile menu items
  const profileMenuItems = [
    {
      icon: User,
      label: "Profile",
      action: () => {
        navigate("/profile");
        setShowProfile(false);
      },
    },
    {
      icon: Settings,
      label: "Settings",
      action: () => {
        navigate("/settings");
        setShowProfile(false);
      },
    },
    {
      icon: HelpCircle,
      label: "Help",
      action: () => {
        navigate("/help");
        setShowProfile(false);
      },
    },
  ];

  // Return null if userInfo is not available
  if (!userInfo) return null;
  console.log(userInfo);

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed top-16 right-6 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden 
        ring-4 ring-slate-100 dark:ring-slate-800 
        backdrop-blur-md bg-opacity-90 dark:bg-opacity-80"
      >
        {/* Close Button */}
        <Button
          onClick={() => setShowProfile(false)}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 
          hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2"
          aria-label="Close profile menu"
        >
          <X size={20} strokeWidth={2.5} />
        </Button>

        {/* User Header */}
        <div
          className="px-6 py-6 border-b  border-slate-200 dark:border-slate-700 flex items-center 
        bg-gradient-to-br from-violet-50 to-violet-100 dark:from-slate-800 dark:to-slate-900"
        >
          {/* Circular Avatar with more vibrant gradient */}
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 
          text-white flex items-center justify-center text-3xl font-bold mr-5 
          shadow-lg shadow-violet-200 dark:shadow-violet-900 ring-2 ring-white dark:ring-slate-700"
          >
            {userInfo?.name?.trim()[0]?.toUpperCase() || "?"}
          </div>

          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {userInfo?.name || "Guest User"}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {userInfo?.email || "No email"}
            </p>
          </div>
        </div>

        {/* Profile Menu */}
        <div className="py-2">
          {profileMenuItems.map((item, index) => (
            <Button
              key={index}
              onClick={item.action}
              variant="ghost"
              className="w-full flex items-center justify-between px-6 py-3.5 
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              aria-label={item.label}
            >
              <div className="flex items-center">
                <item.icon
                  className="mr-4 text-slate-500 dark:text-slate-400 
                  group-hover:text-violet-600 transition-colors"
                  size={22}
                  strokeWidth={2}
                />
                <p
                  className="text-slate-700 dark:text-slate-300 
                group-hover:text-violet-600 transition-colors text-base"
                >
                  {item.label}
                </p>
              </div>
              <ChevronRight
                className="text-slate-400 dark:text-slate-600 
                group-hover:text-violet-600 group-hover:translate-x-1 transition-all"
                size={20}
                strokeWidth={2}
              />
            </Button>
          ))}

          {/* Theme Toggle (Placeholder) */}
          <Button
            className="w-full flex items-center justify-between px-6 py-3.5 
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group 
            border-t border-slate-200 dark:border-slate-700"
            aria-label="Toggle dark mode"
          >
            <div className="flex items-center">
              <Moon
                className="mr-4 text-slate-500 dark:text-slate-400 
                group-hover:text-violet-600 transition-colors"
                size={22}
                strokeWidth={2}
              />
              <p
                className="text-slate-700 dark:text-slate-300 
              group-hover:text-violet-600 transition-colors text-base"
              >
                Dark Mode
              </p>
            </div>
            <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative">
              <div
                className="absolute top-1 left-1 w-4 h-4 bg-white dark:bg-slate-500 rounded-full 
              transition-transform dark:translate-x-6 shadow-sm"
              ></div>
            </div>
          </Button>

          {/* Logout Button */}
          <Button
            onClick={logoutUser}
            variant="destructive"
            className="w-full flex items-center justify-between px-6 py-3.5 
            hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group 
            border-t border-slate-200 dark:border-slate-700"
            aria-label="Log out"
          >
            <div className="flex items-center">
              <LogOut
                className="mr-4 text-red-500 group-hover:text-red-600 transition-colors"
                size={22}
                strokeWidth={2}
              />
              <p className="text-red-500 group-hover:text-red-600 transition-colors text-base">
                Log Out
              </p>
            </div>
            <ChevronRight
              className="text-red-400 group-hover:text-red-600 
              group-hover:translate-x-1 transition-all"
              size={20}
              strokeWidth={2}
            />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default UserProfile;
