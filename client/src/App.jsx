import { Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, Suspense, lazy, useRef } from "react";
import { io } from "socket.io-client";
import { toast, Toaster } from "sonner"; // Import sonner's toast

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
  const token = localStorage.getItem("token");

  const socketRef = useRef(null); // Prevents unnecessary re-renders

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
          localStorage.setItem("user", JSON.stringify(res.data));
        } else {
          throw new Error("Invalid authentication response");
        }

        if (!projects.length) {
          const projectsRes = await requestServer("project/all");
          if (projectsRes?.data?.length) {
            dispatch(setProjects(projectsRes.data));
            dispatch(setCurrentProject(projectsRes.data[0]));
          }
        }

        if (!assignedTask.length) {
          const assignTaskRes = await requestServer("task/assign");
          if (assignTaskRes?.data?.length) {
            dispatch(addAssignTask(assignTaskRes.data));
          }
        }
      } catch (error) {
        console.error("Authentication validation failed:", error);
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };

    validateUser();
  }, [dispatch]);

  // WebSocket Connection - Optimized
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    if (socketRef.current) return; // Prevent multiple WebSocket connections

    console.log("🔄 Establishing WebSocket connection...");

    const socket = io(import.meta.env.VITE_SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      withCredentials: true,
      extraHeaders: {
        Cookie: document.cookie,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () =>
      console.log("✅ WebSocket connected:", socket.id)
    );
    socket.on("connect_error", (error) =>
      console.error("❌ WebSocket error:", error)
    );

    socket.emit("joinUserRoom", user._id);

    socket.on("newTaskAssigned", async (data) => {
      if (!data?.task?.title || !data?.task?.assignedTo) return;
      const message = `A new task "${data.task.title}" has been assigned to you.`;
      toast.info(message); // Use sonner's toast
      dispatch(addAssignTask(data.task));
    });

    socket.on("projectUpdated", async (data) => {
      if (!data?.project?.title || !data?.project?._id) return;
      const message = `The project "${data.project.title}" has been updated.`;
      toast.info(message); // Use sonner's toast
      dispatch(
        updateProject((prevProjects) =>
          prevProjects.map((p) =>
            p._id === data.project._id ? data.project : p
          )
        )
      );
    });

    socket.on("projectDeleted", async (data) => {
      if (!data?.project?._id) return;
      const message = `The project "${data.project.title}" has been deleted.`;
      toast.info(message); // Use sonner's toast
      const updatedProjects = projects.filter(
        (p) => p._id !== data.project._id
      );
      dispatch(setDeleteProject(updatedProjects._id));
    });

    socket.on("taskUpdated", async (data) => {
      if (!data?.task?.title || !data?.task?._id) return;
      const message = `The task "${data.task.title}" has been updated.`;
      toast.info(message); // Use sonner's toast
      dispatch(addAssignTask(data.task));
    });

    socket.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
      toast.error("An error occurred with the WebSocket connection."); // Use sonner's toast
    });

    return () => {
      console.log("🔌 Disconnecting WebSocket...");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?._id]); // Optimized dependencies

  return (
    <>
      <Suspense fallback={<Loader message="Loading application..." />}>
        <Toaster />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="authenticate" element={<Authentication />} />
          {isAuthenticated ? (
            <Route path="dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/authenticate" replace />} />
          )}
          <Route path="error" element={<Error />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
