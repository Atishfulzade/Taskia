import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Bell, X, Check } from "lucide-react";
import socket from "../utils/socket";
import requestServer from "../utils/requestServer";

const NotificationItem = ({ notification, onRead, onClose }) => {
  const { _id, message, type, timestamp, read } = notification;

  const getTypeIcon = () => {
    switch (type) {
      case "project":
        return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
      case "task":
        return <div className="w-2 h-2 rounded-full bg-green-500"></div>;
      case "status":
        return <div className="w-2 h-2 rounded-full bg-purple-500"></div>;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500"></div>;
    }
  };

  return (
    <div
      className={`p-3 border-b border-gray-200 dark:border-gray-700 ${
        read ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-1">{getTypeIcon()}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex gap-1">
          {!read && (
            <button
              onClick={() => onRead(_id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onClose(_id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Delete notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    // Fetch notifications when the component mounts
    getNotifications();

    // Listen for socket notifications
    const handleNotification = (data, type) => {
      addNotification({ ...data, type, read: false });
    };

    socket.on("projectInvitation", (data) =>
      handleNotification(data, "project")
    );
    socket.on("taskAssigned", (data) => handleNotification(data, "task"));
    socket.on("statusUpdated", (data) => handleNotification(data, "status"));

    return () => {
      socket.off("projectInvitation");
      socket.off("taskAssigned");
      socket.off("statusUpdated");
    };
  }, [user?._id]);

  const getNotifications = async () => {
    try {
      if (!user?._id) return;

      const res = await requestServer(`user/notification/get/${user._id}`);
      if (res?.data) setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await requestServer("user/notification/delete", {
        userId: user._id,
        notificationId,
      });

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await requestServer("user/notification/markRead", {
        userId: user._id,
        notificationId: id,
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await requestServer("user/notification/markAllRead", {
        userId: user._id,
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [
      {
        ...notification,
        _id: notification._id || Date.now().toString(),
        timestamp: notification.timestamp || new Date(),
      },
      ...prev,
    ]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-white  dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-violet-700 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Notifications
            </h3>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onRead={markAsRead}
                  onClose={deleteNotification}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
