import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import { IoIosAttach } from "react-icons/io";
import requestServer from "../utils/requestServer";
import { useDispatch, useSelector } from "react-redux";
import { addTask } from "../store/taskSlice";
import SearchableSelect from "./SearchableSelect";

const AddTaskPopup = ({ setTaskOpen, currentStatus }) => {
  const boxRef = useRef(null);
  const [addSubTask, setAddSubTask] = useState(false);
  const [loading, setLoading] = useState(false);
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const [selectedUserId, setSelectedUserId] = useState();
  const dispatch = useDispatch();
  const handleUserSelect = (user) => {
    setSelectedUserId(user._id);
  };
  const userId = useSelector((state) => state.user.user._id);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setTaskOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setTaskOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string(),
    priority: Yup.string(),
    assignedBy: Yup.string(),
    assignedTo: Yup.string(),
    dueDate: Yup.date(),
    status: Yup.string().required("Status is required"),
    subTask: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required("Subtask title is required"),
        description: Yup.string(),
      })
    ),
    attachedFile: Yup.array().of(
      Yup.object().shape({
        fileName: Yup.string(),
        link: Yup.string(),
      })
    ),
  });

  return (
    <div className="absolute h-screen w-full bg-slate-800/50 left-0 top-0 flex justify-center items-center">
      <div
        ref={boxRef}
        className="border border-slate-500 bg-white w-[500px] p-5 rounded-lg"
      >
        <div className="flex justify-between">
          <h4 className="text-sm font-medium">Task</h4>
          <IoClose
            className="cursor-pointer hover:border rounded-full border-slate-600"
            onClick={() => setTaskOpen(false)}
          />
        </div>

        <Formik
          initialValues={{
            title: "",
            description: "",
            priority: "No",
            projectId: projectId || "",
            status: currentStatus?._id || "",
            assignedTo: selectedUserId || "",
            dueDate: "",
            assignedBy: userId || "",
            subTask: [],
            attachedFile: [],
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setLoading(true);
            try {
              const res = await requestServer("task/add", values);
              dispatch(addTask(res.data));
              setTaskOpen(false);
            } catch (error) {
              console.error("Error adding task:", error);
            } finally {
              setLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            useEffect(() => {
              setFieldValue("projectId", projectId);
              setFieldValue("assignedTo", selectedUserId);
              setFieldValue("status", currentStatus?._id);
            }, [projectId, currentStatus, setFieldValue, selectedUserId]);

            return (
              <Form className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700">
                    Title<sup className="text-red-500">*</sup>
                  </label>
                  <Field
                    className="border border-slate-300 py-1.5 rounded-md px-2 outline-none text-sm focus:border-purple-500"
                    name="title"
                    placeholder="Enter task title"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>
                {/* Description */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700">
                    Description (optional)
                  </label>
                  <Field
                    className="border border-slate-300 py-1.5 rounded-md px-2 outline-none text-sm focus:border-purple-500"
                    name="description"
                    placeholder="Enter description"
                  />
                </div>

                {/* Priority & Assignee */}
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <label className="text-sm font-medium text-slate-700">
                      Priority
                    </label>
                    <Field
                      as="select"
                      className="border p-1 rounded-md text-xs border-slate-300 focus:outline-violet-600"
                      name="priority"
                    >
                      <option value="No">No</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Field>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="text-sm font-medium text-slate-700">
                      Assign
                    </label>
                    <SearchableSelect onSelectUser={handleUserSelect} />
                  </div>
                </div>

                {/* Attach file & Due date */}
                <div className="flex justify-between">
                  <label className="flex gap-1 border text-slate-700 border-slate-300 rounded-md px-2 py-1 items-center text-sm font-medium cursor-pointer">
                    Attach file <IoIosAttach />
                    <input type="file" className="hidden" />
                  </label>
                  <div className="flex gap-2 items-center">
                    <label className="text-sm font-medium text-slate-700">
                      Due date
                    </label>
                    <Field
                      className="border text-xs px-2 py-1.5 border-slate-300 rounded-md"
                      type="date"
                      name="dueDate"
                    />
                    <ErrorMessage
                      name="dueDate"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddSubTask(!addSubTask)}
                  className="text-slate-700 w-fit px-2 py-1 text-sm border rounded border-slate-300"
                >
                  {addSubTask ? "Remove" : "Add"} subtask
                </button>
                {/* Subtasks */}
                {addSubTask && (
                  <div className="flex flex-col gap-3">
                    {values.subTask.map((_, index) => (
                      <div
                        key={index}
                        className="border p-2 flex flex-col gap-2 border-slate-300 rounded-md"
                      >
                        <div className="w-full ">
                          <Field
                            className="border border-slate-300 w-full py-1.5 rounded-md px-2 text-sm focus:border-purple-500"
                            name={`subTask[${index}].title`}
                            placeholder="Subtask title"
                          />
                          <ErrorMessage
                            name={`subTask[${index}].title`}
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                        <div className="w-full">
                          <Field
                            className="border border-slate-300 py-1.5 w-full rounded-md px-2 text-sm focus:border-purple-500"
                            name={`subTask[${index}].description`}
                            placeholder="Subtask Description"
                          />
                          <ErrorMessage
                            name={`subTask[${index}].description`}
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setFieldValue("subTask", [
                          ...values.subTask,
                          { title: "", description: "" },
                        ])
                      }
                      className="text-xs text-blue-500 cursor-pointer"
                    >
                      + Add Subtask
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`bg-violet-600 py-2 rounded font-inter text-white hover:bg-purple-700 text-sm flex justify-center items-center ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmitting || loading}
                >
                  {loading ? "Adding..." : "Add Task"}
                </button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default AddTaskPopup;
