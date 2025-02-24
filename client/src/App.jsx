import { Route, BrowserRouter, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Layout from "./component/Layout";
import Authentication from "./pages/Authentication";
import { useSelector } from "react-redux";
import { Bounce, ToastContainer } from "react-toastify";
import Welcome from "./pages/Welcome.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProjectsShow from "./pages/ProjectsShow.jsx";
import Error from "./pages/Error.jsx";

function App() {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

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
      <Routes>
        {/* <Route path="/" element={<Welcome />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="authenticate" element={<Authentication />} />
          <Route path="project" element={<ProjectsShow />} />
          <Route path="project/:id" element={<ProjectDetail />} />
        </Route> */}
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
    </BrowserRouter>
  );
}

export default App;
