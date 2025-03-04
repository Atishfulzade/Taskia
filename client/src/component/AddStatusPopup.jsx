import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import bgColors from "../utils/constant";
import { useFormik } from "formik";
import { showToast } from "../utils/showToast";
import * as Yup from "yup";
import requestServer from "../utils/requestServer";
import { useDispatch, useSelector } from "react-redux";
import { addStatus, updateStatus } from "../store/statusSlice";
import { setCurrentProject, setProjects } from "../store/projectSlice";
import { useNavigate } from "react-router-dom";

const AddStatusPopup = ({ setOpenStatusPopup, status }) => {
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    status?.color || {
      primaryColor: "#E5E7EB",
      secondaryColor: "#F9FAFB",
    }
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const CurrentProjectId = useSelector(
    (state) => state.project.currentProject?._id
  );

  // Formik setup for form handling and validation
  const formik = useFormik({
    initialValues: {
      title: status?.title || "",
      projectId: CurrentProjectId || "",
      color: selectedColor,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Enter status title"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        let res;
        if (status) {
          // Update existing status
          res = await requestServer(`status/update/${status._id}`, values);
          dispatch(updateStatus(res.data));
        } else {
          // Add new status
          res = await requestServer("status/add", values);
          dispatch(addStatus(res.data));
        }

        // Show success toast notification
        showToast(res.data.message, "success");

        // Close the popup
        setOpenStatusPopup(false);
      } catch (error) {
        console.error("Error:", error);

        // Handle token expiration or invalidation
        if (error.response?.data?.message === "Token not found") {
          showToast("Invalid token! Please login again.", "error");
          localStorage.removeItem("token");
          localStorage.removeItem("userState");
          dispatch(setCurrentProject(null));
          dispatch(setProjects([]));
          navigate("/authenticate");
        } else {
          // Show error toast notification
          showToast(
            error.response?.data?.message || "Something went wrong",
            "error"
          );
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // Set projectId in form values when CurrentProjectId changes
  useEffect(() => {
    if (CurrentProjectId) {
      formik.setFieldValue("projectId", CurrentProjectId);
    }
  }, [CurrentProjectId]);

  // Set selected color in form values when it changes
  useEffect(() => {
    formik.setFieldValue("color", selectedColor);
  }, [selectedColor]);

  return (
    <div
      className={`absolute ${
        status
          ? "h-fit w-fit bg-neutral-50"
          : "h-screen w-screen bg-slate-900/80"
      } right-0  z-50 top-0 left-0 flex justify-center items-center`}
    >
      <div className="border-slate-500 border relative bg-white h-fit w-96 p-5 rounded-lg">
        <h4 className="mb-2 text-sm font-inter font-medium text-slate-600">
          Status
        </h4>
        <IoIosClose
          className="absolute top-3 right-3 cursor-pointer"
          size={22}
          onClick={() => setOpenStatusPopup(false)}
        />
        <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          {/* Status Title Input */}
          <input
            className="border border-slate-300 py-1.5 rounded-md px-2 text-sm"
            type="text"
            name="title"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
            placeholder="Enter Status like 'Todo', 'In Progress', etc."
          />
          {formik.touched.title && formik.errors.title && (
            <p className="text-red-500 text-sm">{formik.errors.title}</p>
          )}

          {/* Color Selection */}
          <div className="flex flex-col">
            <p className="text-sm text-slate-600 mb-2">Select color</p>
            <div className="flex w-full gap-1 flex-wrap">
              {bgColors.map((color, index) => (
                <div
                  key={index}
                  style={{ backgroundColor: color.primaryColor }}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full cursor-pointer mx-1 ${
                    selectedColor.primaryColor === color.primaryColor
                      ? "border-2 border-violet-700"
                      : "border-0"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 py-2 cursor-pointer rounded text-white disabled:bg-gray-400"
          >
            {loading
              ? status
                ? "Updating..."
                : "Adding..."
              : status
              ? "Update Status"
              : "Add Status"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStatusPopup;
