import React, { useRef, useEffect } from "react";
import { Pencil, Star, Share, Trash2 } from "lucide-react";

const ContextMenu = ({ project, position, onAction, onClose }) => {
  const menuRef = useRef(null);

  // Adjust position to ensure menu stays within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200), // 200 is approximate menu width
    y: Math.min(position.y, window.innerHeight - 200), // 200 is approximate menu height
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Add event listeners
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    // Cleanup event listeners
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  // Handle menu actions
  const handleMenuAction = (e, action) => {
    e.stopPropagation(); // Stop event propagation
    onAction(project, action);
  };

  return (
    <>
      {/* Invisible overlay to catch clicks outside menu */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Actual menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 w-48"
        style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the menu from closing it
      >
        <button
          onClick={(e) => handleMenuAction(e, "rename")}
          className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Pencil className="h-4 w-4" />
          <span>Rename project</span>
        </button>
        <button
          onClick={(e) => handleMenuAction(e, "star")}
          className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Star className="h-4 w-4" />
          <span>
            {project?.isStarred ? "Remove from favorites" : "Add to favorites"}
          </span>
        </button>
        <button
          onClick={(e) => handleMenuAction(e, "share")}
          className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Share className="h-4 w-4" />
          <span>Share project</span>
        </button>
        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
        <button
          onClick={(e) => handleMenuAction(e, "delete")}
          className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete project</span>
        </button>
      </div>
    </>
  );
};

export default ContextMenu;
