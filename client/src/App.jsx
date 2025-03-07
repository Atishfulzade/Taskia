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

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (error) =>
      console.error("Socket connection error:", error)
    );

    socket.emit("joinUserRoom", user._id);

    // Listen for new task assigned
    socket.on("newTaskAssigned", async (data) => {
      if (data?.task?.title && data?.task?.assignedTo) {
        showToast(
          ` A new task "${data.task.title}" has been assigned to you.`,
          "info"
        );

        await requestServer("user/notification/add", {
          userId: data.task.assignedTo,
          title: data.task.title,
          type: "info",
          createdAt: new Date(),
        });

        dispatch(addAssignTask(data.task));
      }
    });

    // Listen for project updates
    socket.on("projectUpdated", (data) => {
      showToast(`Project "${data.project.title}" has been updated.`, "info");
      // Update the project in the Redux store or refetch the project list
      dispatch(setProjects([...projects, data.project]));
    });

    // Listen for project deletion
    socket.on("projectDeleted", (data) => {
      showToast(`Project "${data.project.title}" has been deleted.`, "info");
      // Remove the project from the Redux store or refetch the project list
      dispatch(setProjects(projects.filter((p) => p._id !== data.project._id)));
    });

    // Listen for being added to a project
    socket.on("addedToProject", (data) => {
      showToast(
        `You have been added to project: "${data.project.title}".`,
        "info"
      );
      // Add the project to the Redux store or refetch the project list
      dispatch(setProjects([...projects, data.project]));
    });

    // Listen for task updates
    socket.on("taskUpdated", (data) => {
      showToast(`Task "${data.task.title}" has been updated.`, "info");
      // Update the task in the Redux store or refetch the task list
      dispatch(addAssignTask(data.task));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
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
