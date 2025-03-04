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
  const projects = useSelector((state) => state.project.projects.length);
  const token = localStorage.getItem("token");
  const assignedTask = useSelector((state) => state.assignTask.tasks);

  // Validate User & Restore Data
  useEffect(() => {
    const validateUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          dispatch(login(JSON.parse(storedUser)));
        }

        if (token) {
          const res = await requestServer("user/validate");

          if (res.message) {
            dispatch(login(res.data.user));
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          } else {
            throw new Error("Invalid token");
          }
        }

        if (projects === 0) {
          const projectsRes = await requestServer("project/all");
          dispatch(setProjects(projectsRes.data || []));
          if (projectsRes.data?.length) {
            dispatch(setCurrentProject(projectsRes.data[0]));
          }
        }

        if (!assignedTask.length) {
          const assignTaskRes = await requestServer("task/assign");
          dispatch(addAssignTask(assignTaskRes.data || []));
        }
      } catch (error) {
        console.error("Authentication failed, redirecting...");
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/authenticate");
      }
    };

    if ((isAuthenticated || token) && !user) {
      validateUser();
    }
  }, [isAuthenticated, token, projects.length, user]);

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

      socket.on("newTaskAssigned", (data) => {
        if (data?.task?.title) {
          showToast(data.task.title, "info");
          dispatch(addAssignTask(data.task));
        } else {
          console.error("Invalid task assignment:", data);
        }
      });

      return () => socket.disconnect();
    }
  }, [isAuthenticated, user?._id]);

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
              <Route path=":id" element={<Dashboard />} />
            </Route>
          ) : (
            <Route path="*" element={<Error />} />
          )}

          <Route path="*" element={<Error />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
