import React, { useEffect, useRef } from "react";

const UserProfile = ({ setShowProfile, userInfo }) => {
  const boxRef = useRef(null);

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
  if (!userInfo) return null;
  const logoutUser = () => {};
  return (
    <div
      ref={boxRef}
      className="h-fit flex-col z-10 w-72 p-3 absolute top-3 bg-white border-2 rounded-md border-slate-300 right-20 shadow"
    >
      <div className="flex justify-center items-center cursor-default w-full">
        <div className="flex border-2 shadow font-inter border-slate-300 w-12 h-12 text-2xl text-white justify-center items-center bg-violet-500 rounded-full">
          {userInfo?.name?.trim()[0] || "?"}
        </div>
        <div className="ml-4 flex justify-center flex-col">
          <h1 className="text-xl text-start mt-3 line-clamp-1 font-inter text-slate-600 font-medium">
            {userInfo?.name || "Guest"}
          </h1>
          <p className="text-gray-600 text-[12px] text-start">
            {userInfo?.email || "No email"}
          </p>
        </div>
      </div>
      <p
        className="text-sm font-inter text-slate-700 px-2 py-1 rounded cursor-pointer mt-2 hover:bg-slate-200"
        onClick={logoutUser} // Logout should also close the dropdown
      >
        Log out
      </p>
    </div>
  );
};

export default UserProfile;
