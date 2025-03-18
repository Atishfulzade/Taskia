import { useRef, useEffect } from "react";
import { Pencil, Star, Share, Trash2 } from "lucide-react";

const ContextMenu = ({ project, position, onAction, onClose }) => {
  const menuRef = useRef(null);

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 200),
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

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 w-48"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction(project, "rename");
        }}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Pencil className="h-4 w-4" />
        <span>Rename project</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction(project, "star");
        }}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Star className="h-4 w-4" />
        <span>
          {project?.isStarred ? "Remove from favorites" : "Add to favorites"}
        </span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction(project, "share");
        }}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Share className="h-4 w-4" />
        <span>Share project</span>
      </button>
      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction(project, "delete");
        }}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete project</span>
      </button>
    </div>
  );
};

export default ContextMenu;
