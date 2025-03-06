import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Ensure this is imported
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "../utils/showToast";
import requestServer from "../utils/requestServer";
import { addStatus, updateStatus } from "../store/statusSlice";
import { setCurrentProject, setProjects } from "../store/projectSlice";
import bgColors from "../utils/constant";

const AddStatusPopup = ({ open, setOpen, status, isEdit }) => {
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
        if (isEdit) {
          // Update status if in edit mode
          res = await requestServer(
            `status/update/${status._id}`,
            values,
            "PUT"
          );
          dispatch(updateStatus(res.data));
        } else {
          // Add new status if not in edit mode
          res = await requestServer("status/add", values, "POST");
          dispatch(addStatus(res.data));
        }
        showToast(res.data.message, "success");
        setOpen(false); // Close the popup after successful submission
        formik.resetForm();
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
      <DialogContent
        className="max-w-md bg-white"
        aria-describedby="status-form-description" // Add this
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Status" : "Add Status"}</DialogTitle>
          <DialogDescription id="status-form-description">
            {/* Add a description for screen readers */}
            Create a new status by filling out the form below.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          {/* Status Title Input */}
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

          {/* Color Selection */}
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            variant="default"
            className="bg-violet-600 text-white"
          >
            {loading
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
              ? "Update Status"
              : "Add Status"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStatusPopup;
