import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { FaChartLine, FaChartPie, FaChartBar, FaChartArea, FaInfoCircle, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

const SkillVisualization = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [chartAnimation, setChartAnimation] = useState(true);

  useEffect(() => {
    // Reset animations when tab changes
    setChartAnimation(false);
    setTimeout(() => setChartAnimation(true), 100);
  }, [activeTab]);

  if (!analysis) return null;

  const {
    matching_skills,
    partial_matches,
    missing_skills,
    skill_categories
  } = analysis;

  // Prepare data for radar chart
  const radarData = Object.entries(skill_categories)
    .filter(([category]) => selectedCategories.length === 0 || selectedCategories.includes(category))
    .map(([category, skills]) => ({
      category,
      value: skills.length,
      fullMark: 10
    }));

  // Prepare data for bar chart
  const barData = [
    {
      name: 'Required Skills',
      matched: matching_skills.required.length,
      partial: partial_matches.required.length,
      missing: missing_skills.required.length
    },
    {
      name: 'Recommended Skills',
      matched: matching_skills.recommended.length,
      partial: partial_matches.recommended.length,
      missing: missing_skills.recommended.length
    }
  ];

  // Prepare data for pie chart
  const pieData = [
    { name: 'Matched', value: matching_skills.required.length + matching_skills.recommended.length },
    { name: 'Partial', value: partial_matches.required.length + partial_matches.recommended.length },
    { name: 'Missing', value: missing_skills.required.length + missing_skills.recommended.length }
  ];

  // Prepare data for line chart (skill progression)
  const lineData = Object.entries(skill_categories)
    .filter(([category]) => selectedCategories.length === 0 || selectedCategories.includes(category))
    .map(([category, skills]) => ({
      category,
      current: skills.filter(s => matching_skills.required.includes(s) || matching_skills.recommended.includes(s)).length,
      target: skills.length
    }));

  // Prepare data for area chart (skill distribution over time)
  const areaData = [
    { month: 'Jan', required: 65, recommended: 45 },
    { month: 'Feb', required: 70, recommended: 50 },
    { month: 'Mar', required: 75, recommended: 55 },
    { month: 'Apr', required: 80, recommended: 60 },
    { month: 'May', required: 85, recommended: 65 },
    { month: 'Jun', required: 90, recommended: 70 }
  ];

  // Prepare data for scatter chart (skill complexity vs demand)
  const scatterData = Object.entries(skill_categories)
    .flatMap(([category, skills]) =>
      skills.map(skill => ({
        name: skill,
        complexity: Math.random() * 10,
        demand: Math.random() * 10,
        category
      }))
    );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skill Distribution Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Skill Category Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar
                      name="Skills"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#93C5FD"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Skill Match Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Skill Match Analysis</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="matched" name="Matched" stackId="a" fill="#10B981" />
                    <Bar dataKey="partial" name="Partial" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="missing" name="Missing" stackId="a" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        );

      case 'detailed':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart for Overall Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Overall Skill Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Line Chart for Skill Progression */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Skill Progression by Category</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="current" stroke="#3B82F6" name="Current Skills" />
                    <Line type="monotone" dataKey="target" stroke="#10B981" name="Target Skills" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Area Chart for Skill Distribution Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Skill Distribution Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="required" stackId="1" stroke="#3B82F6" fill="#93C5FD" />
                    <Area type="monotone" dataKey="recommended" stackId="1" stroke="#10B981" fill="#A7F3D0" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Scatter Chart for Skill Complexity vs Demand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Skill Complexity vs Demand</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="complexity" name="Complexity" />
                    <YAxis type="number" dataKey="demand" name="Demand" />
                    <ZAxis type="number" range={[50, 400]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Skills" data={scatterData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaChartBar />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
              activeTab === 'detailed'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaChartPie />
            <span>Detailed Analysis</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-lg border border-gray-200 flex items-center space-x-2 hover:bg-gray-50"
        >
          <FaFilter />
          <span>Filters</span>
          {selectedCategories.length > 0 && (
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {selectedCategories.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white rounded-lg shadow-lg p-4 mb-8"
          >
            <h3 className="text-lg font-semibold mb-4">Filter Categories</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(skill_categories).map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategories(prev =>
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Interactive Skill Tree */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-lg p-6 mt-8"
      >
        <h2 className="text-2xl font-bold mb-6">Skill Development Path</h2>
        <div className="space-y-6">
          {Object.entries(skill_categories)
            .filter(([category]) => selectedCategories.length === 0 || selectedCategories.includes(category))
            .map(([category, skills]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                <div
                  className="flex items-center mb-4 cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <div className="ml-4 flex-1 h-2 bg-gray-200 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(skills.length / 10) * 100}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{skills.length} skills</span>
                  {selectedCategory === category ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                </div>

                <AnimatePresence>
                  {selectedCategory === category && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {skills.map((skill, index) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group"
                            onHoverStart={() => setHoveredSkill(skill)}
                            onHoverEnd={() => setHoveredSkill(null)}
                          >
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 transition-all duration-300">
                              <h4 className="font-medium text-gray-800">{skill}</h4>
                              <div className="mt-2 flex items-center">
                                <div className="flex-1 h-1 bg-gray-200 rounded-full">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    className="h-full bg-blue-500 rounded-full"
                                  />
                                </div>
                              </div>
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-300" />
                            </div>

                            {/* Skill Tooltip */}
                            <AnimatePresence>
                              {hoveredSkill === skill && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200"
                                >
                                  <div className="flex items-center space-x-2">
                                    <FaInfoCircle className="text-blue-500" />
                                    <span className="text-sm font-medium">Skill Details</span>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-600">
                                    {matching_skills.required.includes(skill) && (
                                      <span className="text-green-600">✓ Required skill matched</span>
                                    )}
                                    {matching_skills.recommended.includes(skill) && (
                                      <span className="text-blue-600">✓ Recommended skill matched</span>
                                    )}
                                    {missing_skills.required.includes(skill) && (
                                      <span className="text-red-600">⚠ Required skill missing</span>
                                    )}
                                    {missing_skills.recommended.includes(skill) && (
                                      <span className="text-yellow-600">⚠ Recommended skill missing</span>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Skill Gap Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-lg p-6 mt-8"
      >
        <h2 className="text-2xl font-bold mb-6">Skill Gap Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Required Skills Gap</h3>
            <div className="space-y-4">
              {missing_skills.required.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-800">{skill}</h4>
                    <p className="text-sm text-red-600">Priority skill to acquire</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Recommended Skills Gap</h3>
            <div className="space-y-4">
              {missing_skills.recommended.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">{skill}</h4>
                    <p className="text-sm text-blue-600">Consider acquiring this skill</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SkillVisualization; 