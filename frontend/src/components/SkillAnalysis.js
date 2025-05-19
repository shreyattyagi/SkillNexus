import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';

const SkillAnalysis = ({ analysis }) => {
  if (!analysis) return null;

  const {
    overall_score,
    required_score,
    recommended_score,
    matching_skills,
    partial_matches,
    missing_skills,
    skill_categories,
    improvement_suggestions
  } = analysis;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6">Skill Match Analysis</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Match</h3>
              <div className="flex items-center">
                <div className={`text-4xl font-bold ${getScoreColor(overall_score)}`}>
                  {overall_score}%
                </div>
                <div className="ml-4">
                  <div className="w-48 h-4 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        overall_score >= 80
                          ? 'bg-green-500'
                          : overall_score >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${overall_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-600">Required Skills</h4>
                <div className={`text-2xl font-bold ${getScoreColor(required_score)}`}>
                  {required_score}%
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-600">Recommended Skills</h4>
                <div className={`text-2xl font-bold ${getScoreColor(recommended_score)}`}>
                  {recommended_score}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skill Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6">Your Skill Categories</h2>
          <div className="space-y-4">
            {Object.entries(skill_categories).map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-2">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Matching Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6">Matching Skills</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                Required Skills Match
              </h3>
              <div className="flex flex-wrap gap-2">
                {matching_skills.required.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FaExclamationTriangle className="text-yellow-500 mr-2" />
                Partial Matches
              </h3>
              <div className="flex flex-wrap gap-2">
                {partial_matches.required.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Missing Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6">Missing Skills</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FaTimes className="text-red-500 mr-2" />
                Required Skills to Acquire
              </h3>
              <div className="flex flex-wrap gap-2">
                {missing_skills.required.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FaLightbulb className="text-blue-500 mr-2" />
                Recommended Skills to Consider
              </h3>
              <div className="flex flex-wrap gap-2">
                {missing_skills.recommended.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Improvement Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2"
        >
          <h2 className="text-2xl font-bold mb-6">Improvement Suggestions</h2>
          <div className="space-y-4">
            {improvement_suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">{index + 1}</span>
                </div>
                <p className="text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkillAnalysis; 