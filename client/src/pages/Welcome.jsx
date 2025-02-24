import React from "react";
import { Link, useNavigate } from "react-router-dom";
import headImage from "../assets/header.jpg";
import logo from "../assets/logo-black.png";
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-white shadow-md px-14 py-4 flex justify-between items-center">
      <img src={logo} alt="" className="w-8" />
      <div className="flex justify-center gap-10 items-center font-semibold font-inter ">
        <Link>Home</Link>
        <Link>About</Link>
        <Link>Service</Link>

        <button
          onClick={() => navigate("/authenticate")}
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-center px-6 md:px-20 py-16 bg-white">
      <div className="md:w-1/2 text-center  md:text-left">
        <h2 className="text-6xl font-bold font-inter text-gray-800 leading-18">
          Organize Your Tasks Effortlessly
        </h2>
        <p className="mt-4 text-gray-600">
          Boost your productivity with Taskia - the best task management tool.
        </p>
        <button className="bg-blue-600 mt-20 text-white px-6 py-3 rounded-full hover:bg-blue-700">
          Explore now
        </button>
      </div>
      <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
        <img
          src={headImage}
          alt="Task Management"
          className="w-full max-w-lg"
        />
      </div>
    </section>
  );
};

const Welcome = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Welcome;
