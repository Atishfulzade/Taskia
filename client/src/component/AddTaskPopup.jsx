import React, { useState } from "react";
import axios from "axios";

const AddTaskPopup = ({ setName, name, addTask }) => {
  return (
    <div className="absolute h-screen w-full bg-slate-50/45 backdrop-blur left-0 top-0 flex justify-center items-center">
      <div className="border-slate-500 border relative bg-white h-fit w-96 p-5 rounded-lg">
        <h4 className="mb-2">Add Task</h4>
        <div className="flex flex-col gap-4">
          <input
            className="border border-slate-300 py-2 rounded px-2"
            type="text"
            value={name}
            placeholder="Enter Point Title"
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="bg-purple-600 py-2 cursor-pointer rounded text-white"
            onClick={addTask}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskPopup;
