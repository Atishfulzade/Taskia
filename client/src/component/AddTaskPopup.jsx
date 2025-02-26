import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { IoIosAttach } from "react-icons/io";

const AddTaskPopup = ({ setName, name, addTask, setTaskOpen }) => {
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const [addSubTask, setAddSubTask] = useState(false);
  useEffect(() => {
    // Close when clicking outside
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setTaskOpen(false);
      }
    };

    // Close on pressing Escape key
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setTaskOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    // Auto-focus on input when modal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="absolute h-screen w-full bg-slate-800/50 left-0 top-0 flex justify-center items-center">
      <div
        ref={boxRef}
        className="border-slate-500 border transition-all relative bg-white h-fit w-[500px] p-5 rounded-lg"
      >
        <div className="flex justify-between w-full">
          <h4 className="mb-2 text-sm font-medium font-inter">Task</h4>
          <IoClose className="cursor-pointer hover:border rounded-full border-slate-600" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <label
              htmlFor="task-title"
              className="text-sm font-medium text-slate-700 font-inter"
            >
              Title<sup className="text-red-500 text-xs">*</sup>
            </label>
            <input
              ref={inputRef}
              className="border border-slate-300 py-1.5 rounded-md px-2 outline-none text-sm focus:border-purple-500"
              type="text"
              value={name}
              placeholder="Enter task title"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="task-title"
              className="text-sm font-medium text-slate-700 font-inter"
            >
              Description{" "}
              <span className="text-xs text-slate-500">(optional)</span>
            </label>
            <input
              ref={inputRef}
              className="border border-slate-300 py-1.5 rounded-md px-2 outline-none text-sm focus:border-purple-500"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
              <label
                htmlFor="task-priority"
                className="text-sm font-medium text-slate-700 font-inter"
              >
                Priority
              </label>
              <select className="border p-1 rounded-md text-xs border-slate-300  font-inter focus:outline-violet-600">
                <option value="No">No</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <label
                htmlFor="task-priority"
                className="text-sm font-medium text-slate-700 font-inter"
              >
                Assign
              </label>
              <select className="border p-1 rounded-md border-slate-300 text-xs font-inter focus:outline-violet-600">
                <option value="No">No</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
              <button className="flex gap-1 border border-slate-300 rounded-md px-2 py-1 items-center text-sm font-medium text-slate-700 font-inter">
                Attach file <IoIosAttach />
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <label
                htmlFor="task-priority"
                className="text-sm font-medium text-slate-700 font-inter"
              >
                Due date
              </label>
              <input
                className="border text-xs px-2 py-1.5 border-slate-300 rounded-md"
                type="date"
                name=""
                id=""
              />
            </div>
          </div>
          <div className="flex flex-col">
            <button
              onClick={() => setAddSubTask(!addSubTask)}
              className="border mb-4 cursor-pointer border-slate-300 rounded-md text-xs w-fit px-2 py-2 hover:bg- text-slate-700 font-inter"
            >
              {addSubTask ? "Remove" : "Add"} subtask
            </button>
            {addSubTask && (
              <div className="">
                <div className="flex flex-col">
                  <label
                    htmlFor="task-title"
                    className="text-sm font-medium text-slate-700 font-inter"
                  >
                    Title<sup className="text-red-500 text-xs">*</sup>
                  </label>
                  <input
                    ref={inputRef}
                    className="border border-slate-300 py-1.5 rounded-md px-2 outline-none text-sm focus:border-purple-500"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="task-title"
                    className="text-sm font-medium text-slate-700 font-inter"
                  >
                    Description{" "}
                    <span className="text-xs text-slate-500">(optional)</span>
                  </label>
                  <input
                    ref={inputRef}
                    className="border border-slate-300 py-1.5 rounded-md px-2 outline-none text-sm focus:border-purple-500"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <button
            className="bg-violet-600 py-2 cursor-pointer rounded text-white hover:bg-purple-700 text-sm"
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
