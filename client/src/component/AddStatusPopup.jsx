import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Import sonner's toast

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
          res = await requestServer(`status/update/${status._id}`, values);
          dispatch(updateStatus(res.data));
          toast.success(res.data.message);
        } else {
          res = await requestServer("status/add", values);
          dispatch(addStatus(res.data));
          toast.success(res.message);
        }

        // Delay closing to avoid any state update issues
        setTimeout(() => {
          setOpen(false);
          formik.resetForm();
        }, 100);
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.response?.data?.message || "Something went wrong");
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
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent
        className="max-w-md bg-white dark:bg-gray-800"
        aria-describedby="status-form-description"
        onPointerDown={(e) => e.stopPropagation()} // Prevent dialog close on click inside
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
                <div
                  key={index}
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
