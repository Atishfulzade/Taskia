import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import { IoIosAttach } from "react-icons/io";
import requestServer from "../utils/requestServer";
import { useDispatch, useSelector } from "react-redux";
import { addTask, updateTask } from "../store/taskSlice";
import SearchableSelect from "./SearchableSelect";
import { showToast } from "../utils/showToast";
import { useNavigate } from "react-router-dom";

const AddTaskPopup = ({ setTaskOpen, currentStatus, taskData, isEdit }) => {
  const boxRef = useRef(null);
  const [addSubTask, setAddSubTask] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false); // Loading state for file upload
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const [selectedUserId, setSelectedUserId] = useState(
    taskData?.assignedTo || ""
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.user._id);

  // Handle user selection from SearchableSelect
  const handleUserSelect = (user) => {
    setSelectedUserId(user ? user._id : null); // Set to null if no user is selected
  };

  // Close popup when clicking outside or pressing Escape
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
  }, [setTaskOpen]);

  // Form validation schema
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string(),
    priority: Yup.string(),
    assignedBy: Yup.string(),
    assignedTo: Yup.string().nullable(), // Allow null
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

  // Function to upload files to Cloudinary
  const uploadFileToCloudinary = async (file) => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Taskia"); // Replace with your Cloudinary upload preset

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dqizv2ags/upload", // Replace with your Cloudinary cloud name
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      return data.secure_url; // Return the uploaded file URL
    } catch (error) {
      console.error("Error uploading file:", error);
      showToast("Failed to upload file", "error");
      return null;
    } finally {
      setFileLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = async (event, setFieldValue) => {
    const files = event.target.files;
    if (files.length > 0) {
      const fileUrls = [];
      for (const file of files) {
        const url = await uploadFileToCloudinary(file);
        if (url) {
          fileUrls.push({ fileName: file.name, link: url });
        }
      }
      setFieldValue("attachedFile", fileUrls);
    }
  };

  return (
    <div className="absolute h-screen w-full bg-slate-800/50 left-0 top-0 flex justify-center items-center">
      <div
        ref={boxRef}
        className="border border-slate-500 bg-white w-[500px] p-5 rounded-lg"
      >
        <div className="flex justify-between">
          <h4 className="text-sm font-medium">
            {isEdit ? "Edit Task" : "Add Task"}
          </h4>
          <IoClose
            className="cursor-pointer hover:border rounded-full border-slate-600"
            onClick={() => setTaskOpen(false)}
          />
        </div>

        <Formik
          initialValues={{
            title: taskData?.title || "",
            description: taskData?.description || "",
            priority: taskData?.priority || "No",
            projectId: projectId || "",
            status: currentStatus?._id || taskData?.status || "",
            assignedTo: selectedUserId || taskData?.assignedTo || null, // Set to null if no user is selected
            dueDate: taskData?.dueDate || "",
            assignedBy: userId || "",
            subTask: taskData?.subTask || [],
            attachedFile: taskData?.attachedFile || [],
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setLoading(true);
            try {
              let res;
              if (isEdit) {
                // Update task
                res = await requestServer(
                  `task/update/${taskData._id}`,
                  values,
                  "PUT"
                );
                dispatch(updateTask(res.data));
              } else {
                // Add new task
                res = await requestServer("task/add", values);
                dispatch(addTask(res.data));
              }

              showToast(res.data.message, "success");
              setTaskOpen(false);
            } catch (error) {
              console.error("Error:", error);
              if (error.response?.data?.message === "Token not found") {
                showToast("Invalid token! Please login again.", "error");
                localStorage.removeItem("token");
                localStorage.removeItem("userState");
                navigate("/authenticate");
              } else {
                showToast(
                  error.response?.data?.message || "Something went wrong",
                  "error"
                );
              }
            } finally {
              setLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            // Update form values when projectId, currentStatus, or selectedUserId changes
            useEffect(() => {
              setFieldValue("projectId", projectId);
              setFieldValue("assignedTo", selectedUserId);
              setFieldValue("status", currentStatus?._id);
            }, [projectId, currentStatus, setFieldValue, selectedUserId]);

            return (
              <Form className="flex flex-col gap-3">
                {/* Task Title */}
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

                {/* Task Description */}
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
                    <SearchableSelect
                      onSelectUser={handleUserSelect}
                      defaultValue={taskData?.assignedTo}
                    />
                  </div>
                </div>

                {/* Attach File & Due Date */}
                <div className="flex justify-between">
                  <label className="flex gap-1 border text-slate-700 border-slate-300 rounded-md px-2 py-1 items-center text-sm font-medium cursor-pointer">
                    Attach file <IoIosAttach />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setFieldValue)}
                      multiple
                    />
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

                {/* Subtasks */}
                <button
                  type="button"
                  onClick={() => setAddSubTask(!addSubTask)}
                  className="text-slate-700 w-fit px-2 py-1 text-sm border rounded border-slate-300"
                >
                  {addSubTask ? "Remove" : "Add"} subtask
                </button>
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
                    loading || fileLoading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isSubmitting || loading || fileLoading}
                >
                  {loading
                    ? isEdit
                      ? "Updating..."
                      : "Adding..."
                    : fileLoading
                    ? "Uploading..."
                    : isEdit
                    ? "Update Task"
                    : "Add Task"}
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
