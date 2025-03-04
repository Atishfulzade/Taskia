"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Edit, Trash2, Share2 } from "lucide-react";

const ProjectContextMenu = ({ x, y, projectId, onAction, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const adjustedPosition = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = 180;
    const menuHeight = 160;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > windowWidth) {
      adjustedX = windowWidth - menuWidth - 10;
    }

    if (y + menuHeight > windowHeight) {
      adjustedY = windowHeight - menuHeight - 10;
    }

    return { x: adjustedX, y: adjustedY };
  };

  const { x: posX, y: posY } = adjustedPosition();

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.1 }}
      style={{
        position: "fixed",
        top: posY,
        left: posX,
        zIndex: 50,
      }}
      className="bg-white border border-slate-300 rounded-md shadow-md w-[180px] overflow-hidden"
    >
      <div className="py-1">
        <button
          className="flex w-full items-center px-3 py-2 text-sm hover:bg-slate-200"
          onClick={() => onAction(projectId, "rename")}
        >
          <Edit className="mr-2 h-4 w-4" />
          Rename project
        </button>
        <button
          className="flex w-full items-center px-3 py-2 text-sm hover:bg-slate-200"
          onClick={() => onAction(projectId, "star")}
        >
          <Star className="mr-2 h-4 w-4" />
          Add to favorites
        </button>
        <button
          className="flex w-full items-center px-3 py-2 text-sm hover:bg-slate-200"
          onClick={() => onAction(projectId, "share")}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share project
        </button>
        <div className="my-1 border-t border-slate-300" />
        <button
          className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          onClick={() => onAction(projectId, "delete")}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete project
        </button>
      </div>
    </motion.div>
  );
};

export default ProjectContextMenu;
