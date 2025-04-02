import { useState, useCallback, useMemo, useEffect } from "react";
import { CiMail, CiUser } from "react-icons/ci";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { login } from "../store/userSlice";
import { setCurrentProject, setProjects } from "../store/projectSlice";
import { setAssignTasks } from "../store/assignTaskSlice";
import { fetchSettings, updateSettingState } from "../store/settingSlice";
import requestServer from "../utils/requestServer";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo-white.png";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

const Authentication = () => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get redirect path from URL if available
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  // Toggle between Login and Registration
  const toggleAuthMode = useCallback(() => {
    setIsRegistration((prev) => !prev);
    formik.resetForm();
  }, []);

  // Form Validation Schema
  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: isRegistration
          ? Yup.string().required("Name is required")
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

  // Handle User Settings
  const handleUserSettings = async (userId) => {
    try {
      if (isRegistration) {
        // For new users, create default settings
        const res = await requestServer("setting/get");
        await dispatch(updateSettingState(userId)).unwrap();
        toast.success("Default settings created");
      } else {
        // For existing users, fetch their settings
        await dispatch(fetchSettings()).unwrap();
      }
      return true;
    } catch (error) {
      console.error("Error handling user settings:", error);
      return false;
    }
  };

  // Handle OAuth Success
  const handleOAuthSuccess = async (response, provider) => {
    setLoading(true);
    try {
      // Send token to backend for verification and login/registration
      const endpoint = "user/oauth";

      // For Google OAuth we send the credential token directly
      const payload = {
        token: provider === "google" ? response.credential : response,
        provider,
      };

      const res = await requestServer(endpoint, payload);
      toast.success(res.message || `${provider} authentication successful`);

      // Store auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      dispatch(login(res.data.user));

      // Handle user settings
      await handleUserSettings(res.data.user._id);

      // Fetch projects and assigned tasks
      const [projects, assignTask] = await Promise.all([
        requestServer("project/all"),
        requestServer("task/assign"),
      ]);

      if (projects.data) {
        dispatch(setProjects(projects.data));
        if (projects.data.length > 0) {
          dispatch(setCurrentProject(projects.data[0]));
        }
      }

      if (assignTask?.data) {
        dispatch(setAssignTasks(assignTask.data));
      }

      // Redirect to the original path or dashboard
      navigate(redirectPath);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || `${provider} authentication failed`
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Formik form handling
  const formik = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const endpoint = isRegistration ? "user/register" : "user/login";
        const payload = isRegistration
          ? values
          : { email: values.email, password: values.password };

        // 1. Authenticate user
        const res = await requestServer(endpoint, payload);
        toast.success(res.message);

        // 2. Store auth data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        dispatch(login(res.data.user));

        // 3. Handle user settings
        await handleUserSettings(res.data.user._id);

        // 4. Fetch projects and assigned tasks for existing users
        if (!isRegistration) {
          const [projects, assignTask] = await Promise.all([
            requestServer("project/all"),
            requestServer("task/assign"),
          ]);

          if (projects.data) {
            dispatch(setProjects(projects.data));
            if (projects.data.length > 0) {
              dispatch(setCurrentProject(projects.data[0]));
            }
          }

          if (assignTask?.data) {
            dispatch(setAssignTasks(assignTask.data));
          }
        }

        // 5. Redirect to the original path or dashboard
        navigate(redirectPath);
        resetForm();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Authentication failed");
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Display a message if the user was redirected from a shared link
  useEffect(() => {
    if (redirectPath && redirectPath !== "/dashboard") {
      toast.info("Please log in to view the shared content", {
        duration: 5000,
      });
    }
  }, [redirectPath]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Section - Branding */}
      <div className="w-full md:w-1/2 lg:w-3/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col justify-between p-8 md:p-12">
        <div>
          <img
            src={logo || "/placeholder.svg"}
            alt="Taskia Logo"
            className="h-12 md:h-14"
          />
        </div>

        <div className="py-12 md:py-0">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Organize your tasks with Taskia
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-xl">
            Effortlessly organize your tasks, stay productive, and achieve your
            goals—one step at a time!
          </p>

          <div className="mt-12 space-y-6 hidden md:block">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-white text-lg">Intuitive task management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-white text-lg">Team collaboration tools</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-white text-lg">
                Progress tracking & analytics
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:block text-blue-100 text-sm">
          © {new Date().getFullYear()} Taskia. All rights reserved.
        </div>
      </div>

      {/* Right Section - Auth Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {isRegistration ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isRegistration
                ? "Join Taskia to start organizing your tasks"
                : "Sign in to continue with Taskia"}
            </p>
            {redirectPath && redirectPath !== "/dashboard" && (
              <div className="mt-2 text-blue-600 font-medium">
                Sign in to view shared content
              </div>
            )}
          </div>

          <form className="space-y-4" onSubmit={formik.handleSubmit}>
            {isRegistration && (
              <div>
                <div className="relative">
                  <CiUser
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    {...formik.getFieldProps("name")}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      formik.touched.name && formik.errors.name
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    } focus:border-blue-500 focus:ring-4 focus:outline-none transition-all`}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>
            )}
            <div>
              <div className="relative">
                <CiMail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  {...formik.getFieldProps("email")}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  } focus:border-blue-500 focus:ring-4 focus:outline-none transition-all`}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  {...formik.getFieldProps("password")}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  } focus:border-blue-500 focus:ring-4 focus:outline-none transition-all`}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>
            {!isRegistration && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isRegistration ? "Creating account..." : "Signing in..."}
                </div>
              ) : (
                <>{isRegistration ? "Create account" : "Sign in"}</>
              )}
            </button>
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-gray-300 w-full"></div>
              <div className="absolute bg-white px-3 text-sm text-gray-500">
                or continue with
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex justify-center">
              {/* Google Login Button */}
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  handleOAuthSuccess(credentialResponse, "google");
                }}
                onError={() => {
                  toast.error("Google login failed");
                }}
                useOneTap
                theme="filled_blue"
                shape="circle"
                text="signin_with"
                locale="en"
                width="full"
                context="signin"
              />

              {/* GitHub Login Button */}
              {/* <button
                type="button"
                onClick={() => {
                  // Implement GitHub OAuth here
                  // This is just a placeholder - you'll need to add actual GitHub OAuth
                  toast.info("GitHub integration coming soon");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FaGithub size={20} />
                <span>GitHub</span>
              </button> */}
            </div>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
              >
                {isRegistration
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
