import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Rocket, Zap, Users, ArrowRight } from "lucide-react";

// Images (ensure these are imported correctly)
import headImage from "../assets/header.jpg";
import logo from "../assets/logo-black.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="Taskia Logo" className="w-10 h-10 mr-2" />
          <span className="text-2xl font-bold text-slate-800">Taskia</span>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-800 focus:outline-none"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`
          fixed inset-0 bg-white/90 backdrop-blur-md 
          md:static md:bg-transparent md:backdrop-blur-none
          flex flex-col md:flex-row items-center justify-center 
          ${isMenuOpen ? "block" : "hidden"} md:block
        `}
        >
          <div className="flex flex-col md:flex-row gap-6 items-center font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-slate-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/authenticate")}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-md"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white pt-20">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Manage Tasks <br />
            <span className="text-blue-600">Effortlessly</span>
          </h1>

          <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto md:mx-0">
            Boost your productivity with Taskia - the ultimate task management
            platform designed to streamline your workflow.
          </p>

          {/* Feature Highlights */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {[
              { icon: CheckCircle2, text: "Organize Tasks" },
              { icon: Zap, text: "Boost Productivity" },
              { icon: Users, text: "Collaborate" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-slate-700"
              >
                <feature.icon className="text-blue-500" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/authenticate")}
              className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-full hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              Learn More <Rocket size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex justify-center items-center"
        >
          <img
            src={headImage}
            alt="Task Management Dashboard"
            className="max-w-full h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
          />
        </motion.div>
      </div>
    </div>
  );
};

const Welcome = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Welcome;
