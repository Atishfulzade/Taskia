import { Button } from "@/components/ui/Button";
import { DialogHeader } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import bgColors from "@/utils/constant";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { addStatus, updateStatus } from "../store/statusSlice";
import requestServer from "../utils/requestServer";
import { toast } from "sonner";

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

        // Always ensure the current project ID is used
        const submissionValues = {
          ...values,
          projectId: CurrentProjectId,
        };

        let res;
        if (isEdit) {
          res = await requestServer(
            `status/update/${status._id}`,
            submissionValues
          );
          dispatch(updateStatus(res.data));
          toast.success(res.message);
        } else {
          res = await requestServer("status/add", submissionValues);
          dispatch(addStatus(res.data));
          toast.success(res.message);
        }

        // Close the dialog without affecting other states
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

  // Update form values when dialog opens or when project ID changes
  useEffect(() => {
    if (open && CurrentProjectId) {
      formik.setFieldValue("projectId", CurrentProjectId);
    }
  }, [CurrentProjectId, open]);

  useEffect(() => {
    formik.setFieldValue("color", selectedColor);
  }, [selectedColor]);

  // Handle dialog close while preserving dropdown state
  const handleDialogChange = (val) => {
    // Prevent event propagation
    if (!val) {
      setOpen(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        aria-describedby="status-form-description"
        onPointerDown={(e) => e.stopPropagation()} // Prevent dialog close on click inside
        onClick={(e) => e.stopPropagation()} // Additional prevention for bubbling
        style={{
          zIndex: 50,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isEdit ? "Edit Status" : "Add Status"}
          </DialogTitle>
          <DialogDescription
            id="status-form-description"
            className="text-sm text-gray-600 dark:text-gray-300"
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
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 p-2 rounded"
            onClick={(e) => e.stopPropagation()} // Prevent event bubbling
          />
          {formik.touched.title && formik.errors.title && (
            <p className="text-red-500 text-sm">{formik.errors.title}</p>
          )}

          {/* Color Selection */}
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">
              Select color
            </p>
            <div className="flex flex-wrap gap-2">
              {bgColors.map((color, index) => (
                <div
                  key={index}
                  style={{ backgroundColor: color.primaryColor }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(color);
                  }}
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

          {/* Hidden Field for Project ID */}
          <input
            type="hidden"
            name="projectId"
            value={CurrentProjectId || ""}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !CurrentProjectId}
            variant="default"
            className="bg-violet-600 dark:bg-violet-700 hover:bg-violet-700 dark:hover:bg-violet-800 text-white py-2 px-4 rounded mt-2"
            onClick={(e) => e.stopPropagation()} // Prevent event bubbling
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
