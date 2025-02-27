import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { IoIosClose } from "react-icons/io";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentProject, setProjects } from "../store/projectSlice";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const AddProjectPopup = ({ close }) => {
  const dialogRef = useRef(null);
  const dispatch = useDispatch();
  // const [isChecked, setIsChecked] = useState(false);
  const userId = useSelector((state) => state.user?.user?.data?._id);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      // isPrivate: true,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string(), // Optional field
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await requestServer("project/add", { ...values, userId });
        dispatch(setCurrentProject(res.newProject));
        dispatch(setProjects(res.projects));
        showToast(res.message, "success");
        resetForm();
        close(false);
      } catch (error) {
        console.error("error", error);

        if (error.response?.data?.message === "Token not found") {
          showToast("Invalid token! Please login again.", "error");
          localStorage.removeItem("token");
          localStorage.removeItem("userState");
          dispatch(setCurrentProject(null));
          dispatch(setProjects([]));
          navigate("/authenticate");
        } else {
          showToast(
            error.response?.data?.message || "Something went wrong",
            "error"
          );
        }
      }
    },
  });

  // useEffect(() => {
  //   formik.setFieldValue("isPrivate", isChecked);
  // }, [isChecked]);

  const handleClickOutside = (event) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target)) {
      close(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="absolute h-screen w-screen bg-slate-900/80 z-50 top-0 bottom-0 left-0 right-0 flex justify-center items-center">
      <div
        ref={dialogRef}
        className="border-slate-500 border relative bg-white h-fit w-[500px] p-5 rounded-lg"
      >
        <h4 className="mb-2 text-md font-semibold text-slate-800">
          Create project
        </h4>
        <IoIosClose
          className="absolute top-3 right-3 h-6 w-6 hover:bg-slate-50 cursor-pointer rounded-full"
          size={22}
          onClick={() => close(false)}
          tabIndex={0}
        />
        <p className="text-slate-500 text-sm">
          A project refers to a planned effort to achieve a specific goal within
          a set timeline.
        </p>

        <form
          className="flex flex-col gap-4 mt-5"
          onSubmit={formik.handleSubmit}
        >
          {/* Project Title */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-600 text-sm font-semibold">
              Project Title<sup className="text-red-500">*</sup>
            </label>
            <input
              className="border border-slate-300 py-2 text-sm rounded-lg px-2 focus:outline-violet-600 focus:outline-2"
              type="text"
              name="title"
              value={formik.values.title}
              placeholder="Enter Project Title"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-500 text-xs">{formik.errors.title}</p>
            )}
          </div>

          {/* Project Description */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-600 text-sm font-semibold">
              Description <span className="text-xs">(Optional)</span>
            </label>
            <input
              className="border border-slate-300 py-2 text-sm rounded-lg px-2 focus:outline-violet-600 focus:outline-2"
              type="text"
              name="description"
              value={formik.values.description}
              placeholder="Enter Project Description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-xs">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Private Project Toggle
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold">Make Private</h4>
              <p className="text-xs text-slate-500">
                Only you and invited people have access
              </p>
            </div>
            <label className="flex cursor-pointer select-none items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  className="sr-only"
                />
                <div
                  className={`block h-6 w-10 rounded-full transition ${
                    isChecked ? "bg-violet-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`dot absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    isChecked ? "translate-x-4" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </label>
          </div> */}

          {/* Add Project Button */}
          <button
            className="bg-violet-700 py-2 cursor-pointer text-sm rounded-lg text-white hover:bg-violet-800 transition"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Adding..." : "Add Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProjectPopup;
