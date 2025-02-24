import React, { useState } from "react";
import { CiLock, CiUnlock } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import logo from "../assets/logo-white.png";
import * as Yup from "yup";
import { useFormik } from "formik";
import { FcGoogle } from "react-icons/fc";
import { CiUser } from "react-icons/ci";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../store/userSlice";
import requestServer from "../utils/requestServer";
import { toast } from "react-toastify";
import { showToast } from "../utils/showToast";
import { useNavigate } from "react-router-dom";
const Authentication = () => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().when("isRegistration", {
        is: true,
        then: (schema) => schema.required("Enter name"),
        otherwise: (schema) => schema.notRequired(),
      }),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters long")
        .required("Password is required"),
    }),

    onSubmit: async (values) => {
      setLoadings(true);

      try {
        if (isRegistration) {
          const res = await requestServer("user/register", values);
          dispatch(login(res.data)); // Store user in Redux
          toast(res.message);
          navigate("/");
        } else {
          const res = await requestServer("user/login", {
            email: values.email,
            password: values.password,
          });

          dispatch(login(res)); // Store user in Redux
          showToast(res.message, "success");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error:", error);
        showToast(error.response.data.message, "error");
      } finally {
        formik.resetForm();
        setLoadings(false);
      }
    },
  });

  return (
    <div className="h-screen flex">
      {/* Left Section */}
      <div className="w-3/4 bg-gradient-to-r from-blue-600 to-blue-800 flex flex-col justify-center  text-white p-10">
        <img src={logo} alt="logo" className="h-14 absolute top-10 left-10" />
        <h1 className="text-4xl ml-10 font-bold font-poppins-bold">Taskia</h1>

        <p className="mt-4 ml-10 text-lg text-start font-poppins-regular">
          Effortlessly organize your tasks, stay productive, <br /> and achieve
          your goals—one step at a time!{" "}
        </p>
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white p-10">
        <h2 className="text-2xl font-semibold">Hello Again!</h2>
        <p className="text-gray-500 mt-2">Welcome Back</p>

        <form className="mt-6 w-80" onSubmit={formik.handleSubmit}>
          {isRegistration && (
            <>
              <div className="relative">
                <input
                  type="name"
                  name="name"
                  onBlur={formik.handleBlur}
                  placeholder="Full name "
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  className="w-full p-4 border pl-7 font-poppins-regular border-slate-300 rounded-full indent-5 mt-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <CiUser
                  className="absolute bottom-4 left-4 text-slate-400"
                  size={24}
                />
              </div>

              {formik.errors.name && formik.touched.name && (
                <p className="text-red-500 text-sm">{formik.errors.name}</p>
              )}
            </>
          )}

          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onBlur={formik.handleBlur}
              value={formik.values.email}
              onChange={formik.handleChange}
              className="w-full p-4 border pl-7 font-poppins-regular border-slate-300 rounded-full indent-5 mt-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <CiMail
              className="absolute bottom-4 left-4 text-slate-400"
              size={24}
            />
          </div>
          {formik.errors.email && formik.touched.email && (
            <p className="text-red-500 text-sm">{formik.errors.email}</p>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Password"
              className="w-full p-4 border pl-7 font-poppins-regular border-slate-300 rounded-full indent-5 mt-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {showPassword ? (
              <CiUnlock
                size={24}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute bottom-4 cursor-pointer left-4 text-slate-400"
              />
            ) : (
              <CiLock
                size={24}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute bottom-4 cursor-pointer left-4 text-slate-400"
              />
            )}
          </div>
          {formik.errors.password && formik.touched.password && (
            <p className="text-red-500 text-sm">{formik.errors.password}</p>
          )}
          <button
            type="submit"
            disabled={loadings}
            className={`w-full mt-5 cursor-pointer ${
              loadings ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-800"
            } text-white font-poppins-regular py-3 rounded-full`}
          >
            {isRegistration
              ? loadings
                ? "Registering..."
                : "Register"
              : loadings
              ? "Logging in..."
              : "Login"}
          </button>
          <div className="w-full py-3 cursor-pointer hover:bg-slate-100  flex border justify-center gap-2 items-center font-poppins-regular border-slate-300 rounded-full  mt-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <FcGoogle size={20} />
            Login with Google
          </div>
          <div className="flex flex-col items-start">
            {!isRegistration && (
              <p className="text-center  text-gray-500 mt-3 cursor-pointer hover:text-blue-500">
                Forgot Password
              </p>
            )}
            <p
              onClick={() => setIsRegistration(!isRegistration)}
              className="text-center text-gray-500 mt-3 cursor-pointer hover:text-blue-500"
            >
              {isRegistration
                ? "Already have account? Login here"
                : "New to taskia? Register here"}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Authentication;
