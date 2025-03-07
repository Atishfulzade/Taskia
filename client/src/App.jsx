import { Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { useEffect, Suspense, lazy } from "react";
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
  const navigate = useNavigate();

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);
  const projects = useSelector((state) => state.project.projects);
  const token = localStorage.getItem("token");
  const assignedTask = useSelector((state) => state.assignTask.tasks);

  // Validate User & Restore Data
  useEffect(() => {
    const validateUser = async () => {
      try {
        // Check if there's a stored user in localStorage
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

        // Validate token with server
        if (token) {
          const res = await requestServer("user/validate");

          if (res?.data) {
            // Update user and token in store and localStorage
            dispatch(login(res.data.data.user));
            localStorage.setItem("user", JSON.stringify(res.data));
          } else {
            throw new Error("Invalid authentication response");
          }
        }

        // Fetch projects if not already loaded
        if (!projects || (projects.length === 0 && token)) {
          const projectsRes = await requestServer("project/all");

          if (projectsRes?.data && Array.isArray(projectsRes.data)) {
            dispatch(setProjects(projectsRes.data));
            if (projectsRes.data.length > 0) {
              dispatch(setCurrentProject(projectsRes.data[0]));
            }
          }
        }

        // Fetch assigned tasks if not already loaded
        if (!assignedTask || (assignedTask.length === 0 && token)) {
          const assignTaskRes = await requestServer("task/assign");

          if (assignTaskRes?.data && Array.isArray(assignTaskRes.data)) {
            dispatch(addAssignTask(assignTaskRes.data));
          }
        }
      } catch (error) {
        console.error("Authentication validation failed:", error);

        // Clear authentication state
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Navigate to authentication page
        navigate("/authenticate");
      }
    };

    // Only run validation if user is not authenticated but has a token,
    // or if user is authenticated but no user object exists
    token && validateUser();
  }, []);

  // Connect to WebSocket
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const socket = io(import.meta.env.VITE_SERVER_URL, {
        transports: ["websocket"],
        reconnection: true,
      });

      socket.on("connect", () => console.log("Socket connected:", socket.id));
      socket.on("connect_error", (error) =>
        console.error("Socket connection error:", error)
      );

      socket.emit("joinUserRoom", user._id);

      // Handle new task assigned event
      socket.on("newTaskAssigned", async (data) => {
        if (data?.task?.title && data?.task?.assignedTo) {
          showToast(
            `A new task "${data.task.title}" has been assigned to you.`,
            "info"
          );

          await requestServer(`user/notification/add`, {
            userId: data.task.assignedTo, // Save the assigned user's ID
            title: data.task.title,
            type: "info",
            createdAt: new Date(),
          });

          dispatch(addAssignTask(data.task));
        } else {
          console.error("Invalid task assignment:", data);
        }
      });

      // Handle task updated event
      socket.on("taskUpdated", async (data) => {
        if (data?.task?.title && data?.task?.assignedTo) {
          showToast(`Task "${data.task.title}" has been updated.`, "info");

          await requestServer(`user/notification/add`, {
            userId: data.task.assignedTo,
            title: data.task.title,
            type: "info",
            createdAt: new Date(),
          });
        } else {
          console.error("Invalid task update:", data);
        }
      });

      // Handle added to project event
      socket.on("addedToProject", async (data) => {
        if (data?.project?.title && data?.project?.member) {
          showToast(
            `You have been added to project: "${data.project.title}".`,
            "info"
          );
          console.log("data notification", data);

          await requestServer(`user/notification/add`, {
            userId: user._id,
            title: data.project.title,
            type: "info",
          });
          console.log("notification senf", data);
        } else {
          console.error("Invalid project addition:", data);
        }
      });

      // Handle project updated event
      socket.on("projectUpdated", async (data) => {
        if (data?.project?.title && data?.project?.members) {
          showToast(
            `Project "${data.project.title}" has been updated.`,
            "info"
          );

          await requestServer(`user/notification/add`, {
            userId: user._id,
            title: data.project.title,
            type: "info",
            createdAt: new Date(),
          });
        } else {
          console.error("Invalid project update:", data);
        }
      });

      // Handle project deleted event
      socket.on("projectDeleted", async (data) => {
        if (data?.project?.title) {
          showToast(
            `Project "${data.project.title}" has been deleted.`,
            "info"
          );

          await requestServer(`user/notification/add`, {
            userId: user._id,
            title: data.project.title,
            type: "error",
            createdAt: new Date(),
          });
        } else {
          console.error("Invalid project deletion:", data);
        }
      });

      return () => socket.disconnect();
    }
  }, [isAuthenticated, user?._id, dispatch]);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        transition={Bounce}
      />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="authenticate" element={<Authentication />} />

          {isAuthenticated ? (
            <Route path="dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
            </Route>
          ) : (
            <Route path="*" element={<NotFound />} />
          )}

          <Route path="*" element={<Error />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
