import React, { useEffect, useRef, useState } from "react";
import { GoPencil } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import AddStatusPopup from "../component/AddStatusPopup";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";
import { useDispatch } from "react-redux";
import { deleteStatus } from "../store/statusSlice";

const TaskMoreDropdown = ({ setShowMore, status }) => {
  const popupRef = useRef(null);
  const [editStatus, setEditStatus] = useState(false);
  const dispatch = useDispatch();

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
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
      showToast(res.message, "success"); // Show success toast
    } catch (error) {
      console.error("Error deleting status:", error);
      showToast("Failed to delete status", "error"); // Show error toast
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
          setOpen={setEditStatus}
          isEdit={true}
          status={status}
        />
      )}

      {/* Dropdown Options */}
      <div className="space-y-1">
        {/* Edit Option */}
        <div
          onClick={() => setEditStatus(!editStatus)}
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
