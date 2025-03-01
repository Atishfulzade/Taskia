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
  const handleClickOutside = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      setShowMore(false);
    }
  };
  const dispatch = useDispatch();
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowMore]);
  const handleDelete = async () => {
    window.alert(
      "Are you sure you want to delete this status and associated task?"
    );
    const res = await requestServer(`status/delete/${status._id}`);
    setShowMore(false);
    dispatch(deleteStatus(status._id));
    showToast(res.message, "success");
  };
  return (
    <div
      ref={popupRef}
      className="absolute p-2 bg-white border top-0 right-6 border-slate-100 rounded-md shadow"
    >
      {editStatus && <AddStatusPopup status={status} />}
      <div className="">
        <p
          onClick={() => setEditStatus(!editStatus)}
          className="hover:bg-violet-600 hover:text-slate-100 py-1 px-2 rounded flex items-center gap-2"
        >
          <GoPencil /> Edit
        </p>
        {/* <p className="hover:bg-violet-600 hover:text-slate-100 py-1 px-2 rounded flex items-center gap-2">
          <MdOutlineColorLens /> Change Color
        </p> */}
        <p
          onClick={handleDelete}
          className="hover:bg-violet-600 hover:text-slate-100 py-1 px-2 rounded flex items-center gap-2"
        >
          <MdDeleteOutline /> Delete
        </p>
      </div>
    </div>
  );
};

export default TaskMoreDropdown;
