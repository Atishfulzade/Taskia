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
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox"; // Import a Checkbox component
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
      isLast: status?.isLast || false, // Add isLast to initial values
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
          res = await requestServer("status/add", values);
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
        className="max-w-md bg-white dark:bg-gray-800"
        aria-describedby="status-form-description"
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {isEdit ? "Edit Status" : "Add Status"}
          </DialogTitle>
          <DialogDescription
            id="status-form-description"
            className="text-gray-600 dark:text-gray-300"
          >
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
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          />
          {formik.touched.title && formik.errors.title && (
            <p className="text-red-500 text-sm">{formik.errors.title}</p>
          )}

          {/* Color Selection */}
          <div>
            <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">
              Select color
            </p>
            <div className="flex flex-wrap gap-2">
              {bgColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  style={{ backgroundColor: color.primaryColor }}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor.primaryColor === color.primaryColor
                      ? "border-violet-700 dark:border-violet-500"
                      : "border-transparent"
                  }`}
                  aria-label={`Select ${color.primaryColor}`}
                />
              ))}
            </div>
          </div>

          {/* isLast Checkbox */}
          {/* isLast Checkbox */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isLast"
                name="isLast"
                checked={formik.values.isLast}
                onCheckedChange={(checked) =>
                  formik.setFieldValue("isLast", checked)
                }
                className="border-gray-300 dark:border-gray-600"
              />
              <label
                htmlFor="isLast"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                This is the last status
              </label>
            </div>
            {/* Info Text */}
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
              Tasks in the last status can be deleted. Use this option to mark a
              status as the final stage in your workflow.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            variant="default"
            className="bg-violet-600 dark:bg-violet-700 hover:bg-violet-700 dark:hover:bg-violet-800 text-white"
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
