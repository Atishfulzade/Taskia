import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import { IoIosAttach } from "react-icons/io";
import requestServer from "../utils/requestServer";

const AddTaskPopup = ({ addTask, setTaskOpen }) => {
  const boxRef = useRef(null);
  const [addSubTask, setAddSubTask] = useState(false);

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
    assignee: Yup.string(),
    dueDate: Yup.date(),
    status: Yup.string().required("Status is required"),
    subtask: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required("Subtask title is required"),
        description: Yup.string(),
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
            projectId: "",
            status: "",
            assignee: "",
            dueDate: "",
            status: "",
            subtask: [],
          }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            console.log(values);
            const res = await requestServer("task/add", { values });
            console.log(res);

            setTaskOpen(false);
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="flex flex-col gap-3">
              {/* Title */}
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
                  Description{" "}
                  <span className="text-xs text-slate-500">(optional)</span>
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
                  <Field
                    as="select"
                    className="border p-1 rounded-md border-slate-300 text-xs focus:outline-violet-600"
                    name="assignee"
                  >
                    <option value="Atish Fulzade">Atish Fulzade</option>
                    <option value="Vilas Rao">Vilas Rao</option>
                    <option value="Deepak Varma">Deepak Varma</option>
                  </Field>
                </div>
              </div>

              {/* Attach file & Due date */}
              <div className="flex justify-between">
                <button
                  type="button"
                  className="flex gap-1 border text-slate-700 border-slate-300 rounded-md px-2 py-1 items-center text-sm font-medium"
                >
                  Attach file <IoIosAttach />
                </button>
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

              {/* Subtask toggle & Status */}
              <div className="flex justify-between">
                <button
                  type="button"
                  className="border border-slate-300 text-slate-700 rounded-md text-sm px-2 py-1 cursor-pointer"
                  onClick={() => setAddSubTask(!addSubTask)}
                >
                  {addSubTask ? "Remove" : "Add"} subtask
                </button>
                <div className="flex gap-2 items-center">
                  <label className="text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <Field
                    as="select"
                    className="border p-1 rounded-md border-slate-300 text-xs focus:outline-violet-600"
                    name="status"
                  >
                    <option value="Todo">Todo</option>
                    <option value="in progress">In progress</option>
                    <option value="done">Done</option>
                  </Field>
                </div>
              </div>

              {/* Subtasks */}
              {addSubTask && (
                <div className="flex flex-col gap-3">
                  {values.subtask.map((_, index) => (
                    <div
                      key={index}
                      className="border p-2 border-slate-300 rounded-md"
                    >
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-slate-700">
                          Subtask Title<sup className="text-red-500">*</sup>
                        </label>
                        <Field
                          className="border border-slate-300 py-1.5 rounded-md px-2 text-sm focus:border-purple-500"
                          name={`subtask[${index}].title`}
                        />
                        <ErrorMessage
                          name={`subtask[${index}].title`}
                          component="div"
                          className="text-red-500 text-xs"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-slate-700">
                          Subtask Description (optional)
                        </label>
                        <Field
                          className="border border-slate-300 py-1.5 rounded-md px-2 text-sm focus:border-purple-500"
                          name={`subtask[${index}].description`}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setFieldValue("subtask", [
                        ...values.subtask,
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
                className="bg-violet-600 py-2 rounded font-inter text-white hover:bg-purple-700 text-sm"
              >
                Add Task
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddTaskPopup;
