import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "../utils/showToast";
import requestServer from "../utils/requestServer";
import { addStatus, updateStatus } from "../store/statusSlice";
import { setCurrentProject, setProjects } from "../store/projectSlice";
import bgColors from "../utils/constant";

const AddStatusPopup = ({ open, setOpen, status }) => {
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
          res = await requestServer(`status/update/${status._id}`, values);
          dispatch(updateStatus(res.data));
        } else {
          res = await requestServer("status/add", values);
          dispatch(addStatus(res.data));
        }
        showToast(res.data.message, "success");
        setOpen(false);
      } catch (error) {
        console.error("Error:", error);
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
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (CurrentProjectId) {
      formik.setFieldValue("projectId", CurrentProjectId);
    }
  }, [CurrentProjectId]);

  useEffect(() => {
    formik.setFieldValue("color", selectedColor);
  }, [selectedColor]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Status</DialogTitle>
          <IoIosClose
            className="absolute top-4 right-4 cursor-pointer"
            size={22}
            onClick={() => setOpen(false)}
          />
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          <Input
            type="text"
            name="title"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
            placeholder="Enter Status (e.g. 'Todo', 'In Progress')"
          />
          {formik.touched.title && formik.errors.title && (
            <p className="text-red-500 text-sm">{formik.errors.title}</p>
          )}

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
                      : "border"
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white"
          >
            {loading
              ? status
                ? "Updating..."
                : "Adding..."
              : status
              ? "Update Status"
              : "Add Status"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStatusPopup;
