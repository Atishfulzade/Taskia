import { Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bounce, ToastContainer } from "react-toastify";
import { useEffect, Suspense, lazy, useRef } from "react";
import { io } from "socket.io-client";

import { setCurrentProject, setProjects } from "./store/projectSlice.js";
import requestServer from "./utils/requestServer.js";
import Loader from "./component/Loader.jsx";
import { login, logout } from "./store/userSlice.js";
import { addAssignTask } from "./store/assignTaskSlice.js";
import { showToast } from "./utils/showToast.js";
import NotFound from "./component/NotFound.jsx";

// Lazy load pages
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

  const socketRef = useRef(null); // Prevents unnecessary re-renders due to WebSocket

  // Validate User & Restore Data
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
        showToast("Session expired. Please log in again.", "error");
      }
    };

    validateUser();
  }, [token, dispatch]);

  // Connect to WebSocket
  useEffect(() => {
    if (!isAuthenticated || !user?._id || socketRef.current) return;

    const socket = io(import.meta.env.VITE_SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () =>
      console.log("✅ WebSocket connected:", socket.id)
    );
    socket.on("connect_error", (error) =>
      console.error("❌ WebSocket connection error:", error)
    );

    socket.emit("joinUserRoom", user._id);

    // 🛠 Function to add notifications to the server
    const addNotification = async (userId, title, message, type = "info") => {
      try {
        await requestServer("user/notification/add", {
          userId,
          title,
          message,
          type,
        });
      } catch (error) {
        console.error("⚠️ Failed to add notification:", error);
      }
    };

    // 📌 Listen for New Task Assignment
    socket.on("newTaskAssigned", async (data) => {
      if (!data?.task?.title || !data?.task?.assignedTo) {
        console.error("❌ Invalid task data received:", data);
        return;
      }

      const message = `A new task "${data.task.title}" has been assigned to you.`;
      showToast(message, "info");

      await addNotification(
        data.task.assignedTo,
        "New Task Assigned",
        message,
        "info"
      );

      dispatch(addAssignTask(data.task));
    });

    // 📌 Listen for Project Updates
    socket.on("projectUpdated", async (data) => {
      if (!data?.project?.title || !data?.project?._id) {
        console.error("❌ Invalid project data received:", data);
        return;
      }

      const message = `The project "${data.project.title}" has been updated. Check the latest changes.`;
      showToast(message, "info");

      await addNotification(
        data.project.member[0],
        "Project Updated",
        message,
        "info"
      );

      // Update project in Redux store
      const updatedProjects = projects.map((p) =>
        p._id === data.project._id ? data.project : p
      );
      dispatch(setProjects(updatedProjects));
    });

    // 📌 Listen for Project Deletion
    socket.on("projectDeleted", async (data) => {
      if (!data?.project?._id) {
        console.error("❌ Invalid project data received:", data);
        return;
      }

      const message = `The project "${data.project.title}" has been deleted.`;
      showToast(message, "info");

      await addNotification(
        data.project.member[0],
        "Project Deleted",
        message,
        "warning"
      );

      // Remove project from Redux store
      const updatedProjects = projects.filter(
        (p) => p._id !== data.project._id
      );
      dispatch(setProjects(updatedProjects));
    });

    // 📌 Listen for Being Added to a Project
    socket.on("addedToProject", async (data) => {
      if (!data?.project?.title || !data?.project?._id) {
        console.error("❌ Invalid project data received:", data);
        return;
      }

      const message = `You have been added to the project "${data.project.title}".`;
      showToast(message, "success");

      await addNotification(
        data.project.member[0],
        "Added to Project",
        message,
        "success"
      );

      dispatch(setProjects([...projects, data.project]));
    });

    // 📌 Listen for Task Updates
    socket.on("taskUpdated", async (data) => {
      if (!data?.task?.title || !data?.task?._id) {
        console.error("❌ Invalid task data received:", data);
        return;
      }

      const message = `The task "${data.task.title}" has been updated. Check the latest modifications.`;
      showToast(message, "info");

      await addNotification(
        data.task.assignedTo,
        "Task Updated",
        message,
        "info"
      );

      dispatch(addAssignTask(data.task));
    });

    // 📌 Handle WebSocket Errors
    socket.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
      showToast("An error occurred with the WebSocket connection.", "error");
    });

    // 🔄 Cleanup WebSocket on Unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user?._id, dispatch, projects]);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        transition={Bounce}
        limit={3}
      />
      <Suspense fallback={<Loader message="Loading application..." />}>
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
