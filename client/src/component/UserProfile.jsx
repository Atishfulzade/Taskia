import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../store/userSlice";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";
import { useNavigate } from "react-router-dom";

const UserProfile = ({ setShowProfile, userInfo }) => {
  const boxRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close the profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowProfile]);

  // Handle user logout
  const logoutUser = async () => {
    try {
      const res = await requestServer("user/logout");
      showToast(res.message, "success");
      // Clear local storage and Redux state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logout());

      // Navigate to the home page and show a success toast
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      showToast("Failed to log out", "error");
    }
  };

  // Return null if userInfo is not available
  if (!userInfo) return null;

  return (
    <div
      ref={boxRef}
      className="h-fit flex-col z-10 w-fit px-3 py-1 absolute top-3 bg-white border-2 rounded-md border-slate-300 right-20 shadow"
    >
      {/* User Profile Section */}
      <div className="flex items-center cursor-default w-full">
        {/* User Avatar */}
        <div className="flex border-2 shadow font-inter border-slate-300 w-7 h-7 text-xl text-white justify-center items-center bg-violet-500 rounded-full">
          {userInfo?.name?.trim()[0] || "?"}
        </div>

        {/* User Details */}
        <div className="ml-4 flex justify-center flex-col">
          <h1 className="text-sm text-start mt-3 line-clamp-1 font-inter text-slate-600 font-medium">
            {userInfo?.name || "Guest"}
          </h1>
          <p className="text-gray-600 text-[12px] text-start">
            {userInfo?.email || "No email"}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <p
        className="text-sm font-inter text-slate-700 px-2 py-1 rounded cursor-pointer mt-2 hover:bg-slate-200"
        onClick={logoutUser}
      >
        Log out
      </p>
    </div>
  );
};

export default UserProfile;
