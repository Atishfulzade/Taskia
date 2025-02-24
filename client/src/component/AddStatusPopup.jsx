import React from "react";
import { IoIosClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const AddStatusPopup = ({ title, setTitle, addStatus, setProjectPopUp }) => {
  return (
    <div className="absolute h-full z-50 w-full  left-0 top-0 flex justify-center items-center">
      <div className=" border-slate-500 border relative bg-white h-fit w-96 p-5 rounded-lg">
        <h4 className="mb-2">Enter Title</h4>
        <IoIosClose
          className="absolute top-3 right-3 cursor-pointer"
          size={22}
          onClick={() => setProjectPopUp(false)}
        />
        <div className="flex flex-col gap-4">
          <input
            className="border border-slate-300 py-2 rounded px-2 "
            type="text"
            value={title}
            placeholder="Enter Project Title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            className="bg-purple-600 py-2 cursor-pointer rounded text-white"
            onClick={addStatus}
          >
            Add Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStatusPopup;
