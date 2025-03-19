"use client";

import { useRef, useEffect } from "react";
import { Pencil, Star, Share, Trash2 } from "lucide-react";

const ContextMenu = ({ project, position, onAction, onClose }) => {
  const menuRef = useRef(null);

  // Adjust position to ensure menu stays within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 200),
  };

  // Handle clicks outside the menu
  useEffect(() => {
    // Function to handle clicks outside the menu
    function handleOutsideClick(event) {
      // If the menu exists and the click is outside the menu
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Prevent default behavior
        event.preventDefault();
        // Close the menu
        onClose();
      }
    }

    // Add the event listener with capture phase to ensure it runs before other handlers
    document.addEventListener("click", handleOutsideClick, true);

    // Cleanup function
    return () => {
      document.removeEventListener("click", handleOutsideClick, true);
    };
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  // Handle menu item clicks
  const handleMenuItemClick = (action) => (event) => {
    // Stop the event from propagating to parent elements
    event.stopPropagation();
    // Prevent the default action
    event.preventDefault();
    // Call the action handler
    onAction(project, action);
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 w-48"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
    >
      <button
        onMouseDown={handleMenuItemClick("rename")}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Pencil className="h-4 w-4" />
        <span>Rename project</span>
      </button>
      <button
        onMouseDown={handleMenuItemClick("star")}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Star className="h-4 w-4" />
        <span>
          {project?.isStarred ? "Remove from favorites" : "Add to favorites"}
        </span>
      </button>
      <button
        onMouseDown={handleMenuItemClick("share")}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Share className="h-4 w-4" />
        <span>Share project</span>
      </button>
      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
      <button
        onMouseDown={handleMenuItemClick("delete")}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete project</span>
      </button>
    </div>
  );
};

export default ContextMenu;
