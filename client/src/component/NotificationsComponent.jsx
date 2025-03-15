import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  MessageCircle,
} from "lucide-react";
import { FiBell } from "react-icons/fi";
import requestServer from "@/utils/requestServer";
import { useSelector } from "react-redux";

const NotificationIcon = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  message: MessageCircle,
};

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const assignTask = useSelector((state) => state.assignTask.task);
  const userId = useSelector((state) => state.user.user?._id);

  const handleNotifications = async () => {
    if (userId) {
      const res = await requestServer(`user/notification/get/${userId}`);
      setNotifications(res.notifications);
    }
  };

  useEffect(() => {
    handleNotifications();
  }, [assignTask]);

  const removeNotification = async (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification._id !== id)
    );
    await requestServer(`user/notification/delete`, {
      notificationId: id,
      userId: userId,
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours} hr ago`;
    if (minutes > 0) return `${minutes} min ago`;
    return `${seconds} sec ago`;
  };

  return (
    <div className="relative z-1000">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-violet-700 dark:hover:bg-slate-700 transition-colors"
      >
        <FiBell size={20} className="text-white dark:text-gray-300" />
        {notifications?.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {notifications?.length}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 z-10 w-80 max-h-[500px] overflow-y-auto bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded"
                >
                  <X size={18} className="dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            {notifications?.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                No notifications
              </div>
            ) : (
              <ul>
                {notifications?.map((notification) => {
                  const NotificationTypeIcon =
                    NotificationIcon[notification.type] || Info;
                  return (
                    <motion.li
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-start p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      {/* Notification Icon */}
                      <div
                        className={`mr-3 mt-1 
                        ${
                          notification.type === "success"
                            ? "text-green-500"
                            : notification.type === "error"
                            ? "text-red-500"
                            : notification.type === "info"
                            ? "text-blue-500"
                            : "text-slate-500"
                        }`}
                      >
                        <NotificationTypeIcon size={20} />
                      </div>

                      {/* Notification Content */}
                      <div className="flex-grow">
                        <p className="text-sm text-slate-800 dark:text-slate-200">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeNotification(notification._id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-2"
                      >
                        <X size={16} className="dark:text-gray-300" />
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsComponent;
