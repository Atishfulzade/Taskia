import { Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bounce, ToastContainer } from "react-toastify";
import { useEffect, Suspense, lazy, useState } from "react";
import { io } from "socket.io-client";

import { setCurrentProject, setProjects } from "./store/projectSlice.js";
import requestServer from "./utils/requestServer.js";
import Loader from "./component/Loader.jsx";
import { login, logout } from "./store/userSlice.js";
import { addAssignTask } from "./store/assignTaskSlice.js";
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

  // Validate User on App Load
  useEffect(() => {
    const validateUser = async () => {
      try {
        const res = await requestServer("user/validate");
        dispatch(login(res.data));
        localStorage.setItem("user", JSON.stringify(res.data));
        const projects = await requestServer("project/all");
        const assignTask = await requestServer("task/assign");
        console.log("assignTask", assignTask);

        dispatch(addAssignTask(assignTask));
        dispatch(setProjects(projects.data));
        dispatch(setCurrentProject(projects.data[0]));
      } catch (error) {
        dispatch(logout());
        console.log("Token invalid, redirecting to login...");
        localStorage.removeItem("token");
        navigate("/authenticate");
      }
    };

    validateUser();
  }, [dispatch]);

  // Connect to the Socket.IO server
  useEffect(() => {
    if (isAuthenticated && userId) {
      const newSocket = io(import.meta.env.VITE_SERVER_URL, {
        transports: ["websocket"], // Ensures better performance
        reconnection: true, // Reconnect on disconnect
      });

      newSocket.emit("joinUserRoom", userId);
      console.log("Socket connected for user:", userId);

      newSocket.on("newTaskAssigned", (data) => {
        console.log("New task assigned:", data);
        // Show notification (You can dispatch Redux action or use toast)
      });

      setSocket(newSocket);

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

          {isAuthenticated && (
            <Route path="dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path=":id" element={<Dashboard />} />
            </Route>
          )}

          <Route path="*" element={<Error />} />
        </Routes>
      </Suspense>{" "}
    </>
  );
}

export default App;
