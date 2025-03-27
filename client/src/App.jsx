"use client";

import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, Suspense, lazy, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import socket from "./utils/socket";
import { initializeSocketHandlers } from "./utils/socketHandlers";
import { setCurrentProject, setProjects } from "./store/projectSlice.js";
import requestServer from "./utils/requestServer.js";
import Loader from "./component/Loader.jsx";
import { login, logout } from "./store/userSlice.js";
import { addAssignTask } from "./store/assignTaskSlice.js";
import NotFound from "./component/NotFound.jsx";
import Setting from "./component/Setting";

// Lazy-loaded components
const TaskDetail = lazy(() => import("./pages/TaskDetail.jsx"));
const Welcome = lazy(() => import("./pages/Welcome.jsx"));
const Authentication = lazy(() => import("./pages/Authentication"));
const Layout = lazy(() => import("./component/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Error = lazy(() => import("./pages/Error.jsx"));
const Profile = lazy(() => import("./component/Profile.jsx"));
const ProjectDetailsPage = lazy(() => import("./pages/ProjectDetailsPage"));

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);
  const projects = useSelector((state) => state.project.projects);
  const assignedTask = useSelector((state) => state.assignTask.tasks);
  const token = localStorage.getItem("token");
  const socketInitialized = useRef(false);
  const [isValidating, setIsValidating] = useState(!!token); // Only validate if token exists

  // Validate user and fetch initial data
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      return;
    }

    const validateUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            dispatch(login(parsedUser));
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError);
            localStorage.removeItem("user");
          }
        }

        const res = await requestServer("user/validate");
        if (res?.data?.data?.user) {
          dispatch(login(res.data.data.user));
          localStorage.setItem("user", JSON.stringify(res.data.data.user));

          // Initialize socket after successful validation
          if (!socket.connected) {
            socket.connect();
            initializeSocketHandlers(socket, dispatch);
            socketInitialized.current = true;
            socket.emit("joinProjectRooms", res.data.data.user._id);
          }

          // Fetch projects if not already in state
          if (!projects?.length) {
            const projectsRes = await requestServer("project/all");
            if (projectsRes?.data?.length) {
              dispatch(setProjects(projectsRes.data));
              dispatch(setCurrentProject(projectsRes.data[0]));
            }
          }

          // Fetch assigned tasks if not already in state
          if (!assignedTask.length) {
            const assignTaskRes = await requestServer("task/assign");
            if (assignTaskRes?.data?.length) {
              dispatch(addAssignTask(assignTaskRes.data));
            }
          }
        } else {
          throw new Error("Invalid authentication response");
        }
      } catch (error) {
        console.error("Authentication validation failed:", error);
        toast.error("Authentication failed. Please log in again.");
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsValidating(false);
      }
    };

    validateUser();
  }, [token]);

  if (isValidating) {
    return <Loader message="Validating session..." />;
  }

  // Get the current path for redirect after login
  const currentPath = location.pathname;
  const isSharedLink =
    currentPath.startsWith("/task/") || currentPath.startsWith("/project/");

  // Create the redirect URL for authentication
  const redirectUrl = isSharedLink
    ? `/authenticate?redirect=${encodeURIComponent(currentPath)}`
    : "/authenticate";

  return (
    <>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<Loader message="Loading application..." />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/authenticate" element={<Authentication />} />

          {/* Protected routes */}
          <Route
            element={
              isAuthenticated ? (
                <Layout />
              ) : isValidating ? (
                <Loader message="Validating session..." />
              ) : (
                <Navigate to={redirectUrl} replace />
              )
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/task/:customId" element={<TaskDetail />} />
            <Route
              path="/project/:projectId"
              element={<ProjectDetailsPage />}
            />
          </Route>

          {/* Fallback routes */}
          <Route path="/error" element={<Error />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
