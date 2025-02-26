import { Route, BrowserRouter, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bounce, ToastContainer } from "react-toastify";
import { useEffect, Suspense, lazy } from "react";
import { setCurrentProject, setProjects } from "./store/projectSlice.js";
import requestServer from "./utils/requestServer.js";
import Loader from "./component/Loader.jsx";
// Lazy load the pages
const Welcome = lazy(() => import("./pages/Welcome.jsx"));
const Authentication = lazy(() => import("./pages/Authentication"));
const Layout = lazy(() => import("./component/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Error = lazy(() => import("./pages/Error.jsx"));

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const loadProject = async () => {
    console.log(" started loading project");

    if (isAuthenticated) {
      const projects = await requestServer("project/all");
      console.log("projects loading", projects);

      if (projects && projects.data?.length > 0) {
        dispatch(setProjects(projects?.data));
        dispatch(setCurrentProject(projects?.data[0]));
        console.log("Projects loaded", projects);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProject();
    }
  }, [isAuthenticated]); // Dependency on isAuthenticated

  return (
    <BrowserRouter>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
