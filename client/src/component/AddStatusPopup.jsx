import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Status</DialogTitle>
          <DialogClose asChild>
            <button className="absolute top-4 right-4 p-1">
              <X size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
          </DialogClose>
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

          <div>
            <p className="text-sm text-slate-600 mb-2">Select color</p>
            <div className="flex flex-wrap gap-2">
              {bgColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  style={{ backgroundColor: color.primaryColor }}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor.primaryColor === color.primaryColor
                      ? "border-violet-700"
                      : "border-transparent"
                  }`}
                  aria-label={`Select ${color.primaryColor}`}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} variant="default">
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
