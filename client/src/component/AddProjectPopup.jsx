import { useFormik } from "formik";
import React from "react";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentProject, setProjects } from "../store/projectSlice";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button"; // ShadCN Button
import { Input } from "../components/ui/Input"; // ShadCN Input
import { Label } from "../components/ui/Label"; // ShadCN Label
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/Dialog"; // ShadCN Dialog
import { UserSearch } from "./UserSearch";

const AddProjectPopup = ({ close }) => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user?.user?.data?._id);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      member: [], // Array to store user IDs
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string(), // Optional field
      member: Yup.array().min(1, "At least one member is required"), // Ensure at least one member is selected
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await requestServer("project/add", { ...values, userId });
        dispatch(setCurrentProject(res.data.newProject));
        dispatch(setProjects(res.data.projects));
        showToast(res.message, "success");

        resetForm();
        close(false);
      } catch (error) {
        console.error("error", error);
        if (error.response?.data?.message === "Token not found") {
          showToast("Invalid token! Please login again.", "error");
          localStorage.removeItem("token");
          dispatch(setCurrentProject(null));
          dispatch(setProjects([]));
        } else {
          showToast(
            error.response?.data?.message || "Something went wrong",
            "error"
          );
        }
      }
    },
  });

  return (
    <Dialog open={true} onOpenChange={() => close(false)}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            A project refers to a planned effort to achieve a specific goal
            within a set timeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Project Title<sup className="text-red-500">*</sup>
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Enter Project Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-500 text-xs">{formik.errors.title}</p>
            )}
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-xs">(Optional)</span>
            </Label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Enter Project Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-xs">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Add Member */}
          <div className="space-y-2">
            <Label htmlFor="member">
              Add Member<sup className="text-red-500">*</sup>
            </Label>
            <UserSearch
              onSelectUser={(selectedUserIds) => {
                formik.setFieldValue("member", selectedUserIds);
              }}
              defaultValue={formik.values.member}
            />
            {formik.touched.member && formik.errors.member && (
              <p className="text-red-500 text-xs">{formik.errors.member}</p>
            )}
          </div>

          {/* Add Project Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Adding..." : "Add Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectPopup;
