import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaBullseye, FaFileAlt, FaCheckCircle, FaChartLine } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesConfig = {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: ["#3b82f6", "#60a5fa", "#93c5fd"]
      },
      shape: {
        type: ["circle", "triangle"]
      },
      opacity: {
        value: 0.6,
        random: true
      },
      size: {
        value: 4,
        random: true
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#60a5fa",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab"
        },
        onclick: {
          enable: true,
          mode: "push"
        },
        resize: true
      }
    },
    retina_detect: true
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesConfig}
        className="absolute inset-0"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Skill
            <span className="text-blue-500">Nexus</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Your AI-powered career companion for skill analysis, resume optimization, and professional growth
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * (index + 1) }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300"
            >
              <div className="text-blue-500 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLoginModalOpen(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Login
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSignupModalOpen(true)}
            className="px-8 py-3 bg-transparent border-2 border-blue-500 text-blue-500 rounded-full font-semibold text-lg hover:bg-blue-500 hover:text-white transition-colors duration-300"
          >
            Sign Up
          </motion.button>
        </motion.div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <Modal onClose={() => setIsLoginModalOpen(false)}>
            <LoginForm onClose={() => setIsLoginModalOpen(false)} />
          </Modal>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {isSignupModalOpen && (
          <Modal onClose={() => setIsSignupModalOpen(false)}>
            <SignupForm onClose={() => setIsSignupModalOpen(false)} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal Component
const Modal = ({ children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Features Data
const features = [
  {
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze your resume and extract key skills with precision.",
    icon: <FaRobot className="w-8 h-8" />
  },
  {
    title: "Skill Matching",
    description: "Compare your skills against job requirements and get personalized recommendations.",
    icon: <FaBullseye className="w-8 h-8" />
  },
  {
    title: "Resume Builder",
    description: "Create professional resumes with our intuitive builder and AI-powered suggestions.",
    icon: <FaFileAlt className="w-8 h-8" />
  },
  {
    title: "Career Assistant",
    description: "Get personalized career advice and insights from our AI chatbot.",
    icon: <FaRobot className="w-8 h-8" />
  },
  {
    title: "ATS Optimization",
    description: "Ensure your resume passes ATS systems with our optimization tools.",
    icon: <FaCheckCircle className="w-8 h-8" />
  },
  {
    title: "Skill Analytics",
    description: "Visualize your skill progress and identify areas for improvement.",
    icon: <FaChartLine className="w-8 h-8" />
  }
];

export default LandingPage; 