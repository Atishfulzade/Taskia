import React, { useState, useCallback, useMemo } from "react";
import { CiLock, CiUnlock, CiMail, CiUser } from "react-icons/ci";
import { FcGoogle } from "react-icons/fc";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { login } from "../store/userSlice";
import { setCurrentProject, setProjects } from "../store/projectSlice";
import { addStatus } from "../store/statusSlice";
import { addTask } from "../store/taskSlice";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-white.png";
import addAssignTask, { setAssignTasks } from "../store/assignTaskSlice";

const Authentication = () => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Toggle between Login and Registration
  const toggleAuthMode = useCallback(() => {
    setIsRegistration((prev) => !prev);
  }, []);

  // Form Validation Schema
  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: isRegistration
          ? Yup.string().required("Enter your name")
          : Yup.string().notRequired(),
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
        password: Yup.string()
          .min(8, "Password must be at least 8 characters")
          .required("Password is required"),
      }),
    [isRegistration]
  );

  // Formik form handling
  const formik = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        let res;
        const endpoint = isRegistration ? "user/register" : "user/login";
        const payload = isRegistration
          ? values
          : { email: values.email, password: values.password };

        // Send request to the backend
        res = await requestServer(endpoint, payload);

        // Show success message
        showToast(res.data.message, "success");

        // Store token and user data in localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Update Redux store with user login state
        dispatch(login(res.data.user));

        // Redirect to dashboard after successful login/registration
        navigate("/dashboard");

        // Fetch and store additional data only on successful login
        if (!isRegistration) {
          const projects = await requestServer("project/all");
          const assignTask = await requestServer("task/assign");

          dispatch(setProjects(projects.data));
          console.log(projects.message);

          dispatch(setAssignTasks(assignTask?.data));
          dispatch(setCurrentProject(projects.data[0]));
        }

        // Reset form after successful submission
        resetForm();
      } catch (error) {
        // Show error message
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-3/4 bg-gradient-to-r from-blue-600 to-blue-800 flex flex-col justify-center text-white p-10">
        <img src={logo} alt="logo" className="h-14 absolute top-10 left-10" />
        <h1 className="text-4xl ml-10 font-bold">Taskia</h1>
        <p className="mt-4 ml-10 text-lg text-start">
          Effortlessly organize your tasks, stay productive, <br /> and achieve
          your goals—one step at a time!
        </p>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-10">
        <h2 className="text-2xl font-semibold">
          {isRegistration ? "Join Taskia!" : "Hello Again!"}
        </h2>
        <p className="text-gray-500 mt-2">
          {isRegistration ? "Create an account" : "Welcome back!"}
        </p>

        <form className="mt-6 w-full max-w-sm" onSubmit={formik.handleSubmit}>
          {isRegistration && (
            <div className="relative">
              <input
                type="text"
                name="name"
                placeholder="Full name"
                {...formik.getFieldProps("name")}
                className="w-full p-3 border pl-10 border-slate-300 rounded-lg mt-3 focus:ring-2 focus:ring-blue-400"
              />
              <CiUser
                className="absolute bottom-3 left-3 text-slate-400"
                size={24}
              />
            </div>
          )}
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              {...formik.getFieldProps("email")}
              className="w-full p-3 border pl-10 border-slate-300 rounded-lg mt-3 focus:ring-2 focus:ring-blue-400"
            />
            <CiMail
              className="absolute bottom-3 left-3 text-slate-400"
              size={24}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm">{formik.errors.email}</p>
          )}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              {...formik.getFieldProps("password")}
              className="w-full p-3 border pl-10 border-slate-300 rounded-lg mt-3 focus:ring-2 focus:ring-blue-400"
            />
            {showPassword ? (
              <CiUnlock
                size={24}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute bottom-3 cursor-pointer left-3 text-slate-400"
              />
            ) : (
              <CiLock
                size={24}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute bottom-3 cursor-pointer left-3 text-slate-400"
              />
            )}
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm">{formik.errors.password}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-5 py-3 rounded-lg text-white ${
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-800"
            }`}
          >
            {loading
              ? isRegistration
                ? "Registering..."
                : "Logging in..."
              : isRegistration
              ? "Register"
              : "Login"}
          </button>

          <div className="w-full py-3 flex border justify-center gap-2 items-center cursor-pointer hover:bg-slate-100 border-slate-300 rounded-lg mt-3">
            <FcGoogle size={20} /> Login with Google
          </div>

          <div className="flex flex-col items-start">
            {!isRegistration && (
              <p className="text-gray-500 mt-3 cursor-pointer hover:text-blue-500">
                Forgot Password?
              </p>
            )}
            <p
              onClick={toggleAuthMode}
              className="text-gray-500 mt-3 cursor-pointer hover:text-blue-500"
            >
              {isRegistration
                ? "Already have an account? Login here"
                : "New to Taskia? Register here"}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Authentication;
