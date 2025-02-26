import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import bgColors from "../utils/constant";
import { useFormik } from "formik";
import { showToast } from "../utils/showToast";
import * as Yup from "yup";
import requestServer from "../utils/requestServer";
import { useSelector } from "react-redux";
const AddStatusPopup = ({ setOpenStatusPopup }) => {
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState({
    primaryColor: "bg-gray-200",
    secondaryColor: "bg-gray-50",
  });
  const CurrentProjectId = useSelector(
    (state) => state.project.currentProject._id
  );

  const formik = useFormik({
    initialValues: { title: "", projectId: "", color: selectedColor },
    validationSchema: Yup.object({
      title: Yup.string().required("Enter status title"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        let res = await requestServer("status/add", values);
        showToast(res.message, "success");
        setOpenStatusPopup(false);
        setLoading(false);
      } catch (error) {
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
  useEffect(() => {
    formik.setFieldValue("projectId", CurrentProjectId);
  }, []);
  // Sync selected color with Formik values
  useEffect(() => {
    formik.setFieldValue("color", selectedColor);
  }, [selectedColor]);

  return (
    <div className="absolute h-screen w-screen bg-slate-900/80 z-50 top-0 bottom-0 left-0 right-0 flex justify-center items-center">
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
          <input
            className="border border-slate-300 py-1.5 rounded-md px-2 text-sm"
            type="text"
            name="title"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
            placeholder="Enter Status like 'Todo', 'In Progress', etc."
          />
          {formik.errors.title && formik.touched.title && (
            <p className="text-red-500 text-sm">{formik.errors.title}</p>
          )}

          <div className="flex flex-col">
            <p className="text-sm text-slate-600 mb-2">Select color</p>
            <div className="flex w-full gap-1 flex-wrap">
              {bgColors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full cursor-pointer mx-1 ${
                    color.primaryColor
                  } ${
                    selectedColor.primaryColor === color.primaryColor
                      ? "border-2 border-violet-700"
                      : "border-0"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 py-2 cursor-pointer rounded text-white disabled:bg-gray-400"
          >
            Add Status
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStatusPopup;
