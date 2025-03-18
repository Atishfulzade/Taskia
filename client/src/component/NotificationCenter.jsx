"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Bell, X, Check } from "lucide-react";
import socket from "../utils/socket";

const NotificationItem = ({ notification, onRead, onClose }) => {
  const { message, type, timestamp, read } = notification;

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
              onClick={() => onRead(notification.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onClose(notification.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!socket || !user?._id) return;

    // Listen for project notifications
    socket.on("projectInvitation", (data) => {
      addNotification({
        id: Date.now(),
        message: data.message,
        type: "project",
        timestamp: new Date(),
        read: false,
      });
    });

    // Listen for task notifications
    socket.on("taskAssigned", (data) => {
      addNotification({
        id: Date.now(),
        message: data.message,
        type: "task",
        timestamp: new Date(),
        read: false,
      });
    });

    // Listen for status notifications
    socket.on("statusUpdated", (data) => {
      addNotification({
        id: Date.now(),
        message: data.message,
        type: "status",
        timestamp: new Date(),
        read: false,
      });
    });

    return () => {
      socket.off("projectInvitation");
      socket.off("taskAssigned");
      socket.off("statusUpdated");
    };
  }, [user?._id]);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
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
            {notifications.length > 0 && (
              <button
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true }))
                  );
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  onClose={removeNotification}
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
