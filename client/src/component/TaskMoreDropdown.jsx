import React, { useEffect, useRef, useState } from "react";
import { GoPencil } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineColorLens } from "react-icons/md";
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
      className="absolute p-2 bg-white border top-0 right-6 border-slate-100 rounded-md shadow"
    >
      {/* Edit Status Popup */}
      {editStatus && (
        <AddStatusPopup
          status={status}
          close={() => setEditStatus(false)} // Close edit popup
        />
      )}

      {/* Dropdown Options */}
      <div className="">
        {/* Edit Option */}
        <p
          onClick={() => setEditStatus(!editStatus)}
          className="hover:bg-violet-600 hover:text-slate-100 py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
        >
          <GoPencil /> Edit
        </p>

        {/* Delete Option */}
        <p
          onClick={handleDelete}
          className="hover:bg-violet-600 hover:text-slate-100 py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
        >
          <MdDeleteOutline /> Delete
        </p>
      </div>
    </div>
  );
};

export default TaskMoreDropdown;
