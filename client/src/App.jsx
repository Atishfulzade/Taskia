import { Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, Suspense, lazy, useRef } from "react";
import { toast, Toaster } from "sonner";
import socket from "./utils/socket"; // Import the socket instance
import { initializeSocketHandlers } from "./utils/socketHandlers"; // Import socket handlers
import {
  setCurrentProject,
  setDeleteProject,
  setProjects,
  updateProject,
} from "./store/projectSlice.js";
import requestServer from "./utils/requestServer.js";
import Loader from "./component/Loader.jsx";
import { login, logout } from "./store/userSlice.js";
import { addAssignTask } from "./store/assignTaskSlice.js";
import NotFound from "./component/NotFound.jsx";

const Welcome = lazy(() => import("./pages/Welcome.jsx"));
const Authentication = lazy(() => import("./pages/Authentication"));
const Layout = lazy(() => import("./component/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Error = lazy(() => import("./pages/Error.jsx"));

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);
  const projects = useSelector((state) => state.project.projects);
  const assignedTask = useSelector((state) => state.assignTask.tasks);
  const currentProject = useSelector((state) => state.project.currentProject);
  const token = localStorage.getItem("token");
  const socketInitialized = useRef(false);

  // Validate user and fetch initial data
  useEffect(() => {
    if (!token) return;

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
        if (res?.data) {
          dispatch(login(res.data.data.user));
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
          toast.success("User validated successfully!");
        } else {
          throw new Error("Invalid authentication response");
        }

        // Initialize socket after user validation
        if (res?.data?.data?.user?._id && !socket.connected) {
          console.log("Connecting socket after user validation...");
          socket.connect();
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
      } catch (error) {
        console.error("Authentication validation failed:", error);
        toast.error("Authentication failed. Please log in again.");
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };

    validateUser();
  }, [dispatch, token]);

  // Initialize WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id && !socketInitialized.current) {
      console.log("Initializing WebSocket for user:", user._id);

      // Connect socket if not already connected
      if (!socket.connected) {
        socket.connect();
      }

      // Initialize socket handlers only once
      initializeSocketHandlers(socket, dispatch);
      socketInitialized.current = true;

      // Join user's personal room for notifications
      console.log("Emitting joinProjectRooms for user:", user._id);
      socket.emit("joinProjectRooms", user._id);
    }

    // Cleanup function when user logs out or component unmounts
    return () => {
      if (!isAuthenticated && socket.connected) {
        console.log("Disconnecting WebSocket due to logout");
        socket.disconnect();
        socketInitialized.current = false;
      }
    };
  }, [isAuthenticated, user?._id, dispatch]);

  return (
    <>
      <Suspense fallback={<Loader message="Loading application..." />}>
        <Toaster />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/authenticate" element={<Authentication />} />
          {isAuthenticated ? (
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/authenticate" replace />} />
          )}
          <Route path="/error" element={<Error />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
