import React from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaBullseye, FaFileAlt } from 'react-icons/fa';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Skill<span className="text-blue-500">Nexus</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Your AI-powered career companion for skill analysis, resume optimization, and professional growth
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<FaRobot />}
            title="AI Analysis"
            description="Advanced AI algorithms analyze your resume and extract key skills"
          />
          <FeatureCard
            icon={<FaBullseye />}
            title="Skill Matching"
            description="Match your skills with job requirements instantly"
          />
          <FeatureCard
            icon={<FaFileAlt />}
            title="Resume Builder"
            description="Create professional resumes with AI-powered suggestions"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white"
    >
      <div className="text-4xl text-blue-500 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  );
}

export default LandingPage; 