import { Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { useEffect, Suspense, lazy, useState } from "react";
import { io } from "socket.io-client";

import { setCurrentProject, setProjects } from "./store/projectSlice.js";
import requestServer from "./utils/requestServer.js";
import Loader from "./component/Loader.jsx";
import { login, logout } from "./store/userSlice.js";
import { addAssignTask } from "./store/assignTaskSlice.js";
import { showToast } from "./utils/showToast.js";

// Lazy load the pages
const Welcome = lazy(() => import("./pages/Welcome.jsx"));
const Authentication = lazy(() => import("./pages/Authentication"));
const Layout = lazy(() => import("./component/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Error = lazy(() => import("./pages/Error.jsx"));

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const userId = useSelector((state) => state.user.user?._id); // Get userId from Redux
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Validate User on App Load
  useEffect(() => {
    const validateUser = async () => {
      try {
        // Validate user token
        const res = await requestServer("user/validate");
        console.log("validateUser", res);

        if (res.message) {
          // Update Redux store with user data
          dispatch(login(res.data.user));
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));

          // Fetch projects and assigned tasks
          const projects = await requestServer("project/all");
          const assignTask = await requestServer("task/assign");

          // Update Redux store with projects and assigned tasks
          dispatch(addAssignTask(assignTask.data));
          dispatch(setProjects(projects.data));
          navigate("/dashboard");
        }
        // Set the current project if projects exist
        if (projects.data.length > 0) {
          dispatch(setCurrentProject(projects.data[0]));
        } else {
          console.log(projects.message);
        }
      } catch (error) {
        // Handle token validation failure
        console.error("Token invalid, redirecting to login...");
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/authenticate");
      }
    };

    isAuthenticated || (token && validateUser());
  }, []);

  // Connect to the Socket.IO server
  useEffect(() => {
    if (isAuthenticated && userId) {
      const newSocket = io(import.meta.env.VITE_SERVER_URL, {
        transports: ["websocket"],
        reconnection: true,
      });

      // Join the user's room
      newSocket.emit("joinUserRoom", userId);
      console.log("Socket connected for user:", userId);

      // Handle new task assignment notification
      newSocket.on("newTaskAssigned", (data) => {
        console.log("New task assigned:", data);

        // Show toast notification
        showToast(data.title, "info");

        // Update Redux store with the new assigned task
        dispatch(addAssignTask(data));
      });

      setSocket(newSocket);

      // Cleanup function to disconnect the socket
      return () => {
        newSocket.disconnect();
        console.log("Socket disconnected");
      };
    }
  }, [isAuthenticated, userId]);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full bg-slate-100/90">
            <Loader />
          </div>
        }
      >
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
