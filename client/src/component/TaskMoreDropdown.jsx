import React, { useEffect, useRef, useState } from "react";
import { GoPencil } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import AddStatusPopup from "../component/AddStatusPopup";
import requestServer from "../utils/requestServer";
import { useDispatch } from "react-redux";
import { deleteStatus } from "../store/statusSlice";
import { toast } from "sonner"; 

const TaskMoreDropdown = ({ setShowMore, status }) => {
  const popupRef = useRef(null);
  const [editStatus, setEditStatus] = useState(false);
  const dispatch = useDispatch();

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      // Don't close if the click is on the dialog
      const dialogElement = document.querySelector("[role='dialog']");
      if (dialogElement && dialogElement.contains(e.target)) {
        return;
      }
      setShowMore(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowMore]);

  // Handle status deletion
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this status and associated tasks?"
    );
    if (!confirmDelete) return;

    try {
      const res = await requestServer(`status/delete/${status._id}`);
      dispatch(deleteStatus(status._id)); // Update Redux store
      setShowMore(false); // Close dropdown
      toast.success(res.message); // Use sonner's toast
    } catch (error) {
      console.error("Error deleting status:", error);
      toast.error("Failed to delete status"); // Use sonner's toast
    }
  };

  // Handle edit click with stopPropagation
  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setEditStatus(true);
  };

  // Handle edit dialog close
  const handleEditClose = (val) => {
    setEditStatus(val);
    // Don't close the dropdown when dialog closes
    if (!val) {
      setShowMore(false);
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md shadow-lg z-50"
    >
      {/* Edit Status Popup */}
      {editStatus && (
        <AddStatusPopup
          open={editStatus}
          setOpen={handleEditClose}
          isEdit={true}
          status={status}
        />
      )}

      {/* Dropdown Options */}
      <div className="space-y-1">
        {/* Edit Option */}
        <div
          onClick={handleEditClick}
          className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <GoPencil className="text-slate-600 dark:text-slate-300" />
          <p className="text-sm text-slate-700 dark:text-slate-200">Edit</p>
        </div>

        {/* Delete Option */}
        <div
          onClick={handleDelete}
          className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <MdDeleteOutline className="text-red-500" />
          <p className="text-sm text-red-500">Delete</p>
        </div>
      </div>
    </div>
  );
};

export default TaskMoreDropdown;
