import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTheme } from "../components/ui/ThemeProvider";

const Layout = () => {
  const { theme } = useTheme();
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex dark:bg-slate-800">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
