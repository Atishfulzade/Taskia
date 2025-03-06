import React, { forwardRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Sun,
  X,
  ChevronRight,
  Bell,
  Shield,
  ExternalLink,
  Award,
} from "lucide-react";

// ShadCN components
import { Button } from "../components/ui/Button";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { formatDate } from "@/utils/formatDate";

const UserProfile = forwardRef(({ setShowProfile, userInfo }, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const notifications =
    useSelector((state) => state.notifications?.unread) || 0;
  const memberSince = userInfo?.createdAt
    ? new Date(userInfo.createdAt).toLocaleDateString()
    : "N/A";
  const isPremium = userInfo?.subscription?.isPremium || false;

  // Custom theme implementation
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for theme in localStorage or use system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Use system preference as fallback
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

      // Clear local storage and Redux state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logout());

      // Close profile and navigate to home
      handleClose();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      showToast("Failed to log out. Please try again.", "error");
    }
  };

  // Profile menu sections
  const accountMenuItems = [
    {
      icon: User,
      label: "My Profile",
      action: () => {
        navigate("/profile");
        handleClose();
      },
      highlight: false,
    },
    {
      icon: Bell,
      label: "Notifications",
      action: () => {
        navigate("/notifications");
        handleClose();
      },
      highlight: notifications > 0,
      badge: notifications > 0 ? notifications : null,
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      action: () => {
        navigate("/privacy");
        handleClose();
      },
      highlight: false,
    },
  ];

  const preferencesMenuItems = [
    {
      icon: Settings,
      label: "Settings",
      action: () => {
        navigate("/settings");
        handleClose();
      },
      highlight: false,
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      action: () => {
        navigate("/help");
        handleClose();
      },
      highlight: false,
      external: true,
    },
  ];

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
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{
          opacity: isClosing ? 0 : 1,
          y: isClosing ? -10 : 0,
          scale: isClosing ? 0.98 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed top-16 right-6 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden 
        ring-2 ring-slate-100 dark:ring-slate-800 backdrop-blur-sm
        bg-opacity-95 dark:bg-opacity-95 z-[9999]"
      >
        {/* Close Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 
                hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 z-10"
                aria-label="Close profile menu"
              >
                <X size={18} strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close (Esc)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Header */}
        <div
          className="p-6 border-b border-slate-200 dark:border-slate-700 
        bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-slate-800 dark:to-indigo-950/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/20 opacity-20"></div>

          <div className="flex items-start">
            {/* Avatar with image support */}
            <Avatar className="w-16 h-16 rounded-full border-2 border-white dark:border-slate-700 shadow-lg mr-4">
              <AvatarImage
                src={userInfo?.avatar}
                alt={userInfo?.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xl font-bold">
                {getInitials(userInfo?.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {userInfo?.name || "Guest User"}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {userInfo?.email || "No email"}
                  </p>

                  {/* Member since information */}
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Member since {formatDate(userInfo.createdAt)}
                  </p>
                </div>

                {/* Premium badge if applicable */}
                {isPremium && (
                  <Badge
                    variant="premium"
                    className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0 shadow-sm"
                  >
                    <Award size={12} className="mr-1" /> Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Menu */}
        <div className="py-1 max-h-[calc(100vh-16rem)] overflow-y-auto scrollbar-thin">
          {/* Account Section */}
          <div className="px-3 py-2">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-1">
              Account
            </h4>

            {accountMenuItems.map((item, index) => (
              <Button
                key={index}
                onClick={item.action}
                variant="ghost"
                className={`w-full justify-between px-3 py-2.5 my-0.5 rounded-lg
                ${
                  item.highlight
                    ? "bg-slate-100 dark:bg-slate-800/80"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }
                text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white group`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 ${
                      item.highlight
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-slate-500 dark:text-slate-400"
                    } 
                    group-hover:text-violet-600 dark:group-hover:text-violet-400`}
                    size={20}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center">
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="mr-2 px-1.5 min-w-[1.5rem] text-center"
                    >
                      {item.badge}
                    </Badge>
                  )}

                  {item.external ? (
                    <ExternalLink size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight
                      className="text-slate-400 dark:text-slate-500 
                      group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all"
                      size={18}
                    />
                  )}
                </div>
              </Button>
            ))}
          </div>

          <Separator className="my-1 bg-slate-200 dark:bg-slate-700/50" />

          {/* Preferences Section */}
          <div className="px-3 py-2">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-1">
              Preferences
            </h4>

            {preferencesMenuItems.map((item, index) => (
              <Button
                key={index}
                onClick={item.action}
                variant="ghost"
                className="w-full justify-between px-3 py-2.5 my-0.5 rounded-lg
                hover:bg-slate-100 dark:hover:bg-slate-800/60
                text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white group"
              >
                <div className="flex items-center">
                  <item.icon
                    className="mr-3 text-slate-500 dark:text-slate-400 
                    group-hover:text-violet-600 dark:group-hover:text-violet-400"
                    size={20}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center">
                  {item.external ? (
                    <ExternalLink size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight
                      className="text-slate-400 dark:text-slate-500 
                      group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all"
                      size={18}
                    />
                  )}
                </div>
              </Button>
            ))}

            {/* Theme Toggle */}
            <div className="px-3 py-2.5 my-0.5 flex items-center justify-between">
              <div className="flex items-center">
                {isDarkMode ? (
                  <Moon
                    className="mr-3 text-slate-500 dark:text-slate-400"
                    size={20}
                  />
                ) : (
                  <Sun
                    className="mr-3 text-slate-500 dark:text-slate-400"
                    size={20}
                  />
                )}
                <span className="text-slate-700 dark:text-slate-300">
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

          <Separator className="my-1 bg-slate-200 dark:bg-slate-700/50" />
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/50">
          <Button
            onClick={logoutUser}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-2 border-red-200 dark:border-red-900/30
            hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400
            hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <LogOut size={18} strokeWidth={2} />
            <span>Log Out</span>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default UserProfile;
