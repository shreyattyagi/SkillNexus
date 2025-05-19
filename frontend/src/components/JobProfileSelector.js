import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaStar, FaRegStar, FaInfoCircle, FaTimes, FaFilter, FaSort, FaSearch, FaChartBar, FaChartLine, FaChartPie } from 'react-icons/fa';

// 3D Card Component
const Card3D = ({ children, whileHover = {}, whileTap = {} }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02, ...whileHover }}
      whileTap={{ scale: 0.98, ...whileTap }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Floating Animation Component
const FloatingElement = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

const JobProfileSelector = ({ industry, onProfileSelect }) => {
  const [jobProfiles, setJobProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [skillFilters, setSkillFilters] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredProfile, setHoveredProfile] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (industry) {
      fetchJobProfiles(industry.name);
    }
  }, [industry]);

  useEffect(() => {
    // Reset animations when view mode changes
    setAnimationKey(prev => prev + 1);
  }, [viewMode]);

  const fetchJobProfiles = async (industryName) => {
    try {
      const response = await fetch(`/api/industries/${encodeURIComponent(industryName)}/job-profiles`);
      const data = await response.json();
      setJobProfiles(data.job_profiles);
      
      // Extract unique skills for filters
      const skills = new Set();
      data.job_profiles.forEach(profile => {
        profile.sub_categories.forEach(sub => {
          sub.required_skills.forEach(skill => skills.add(skill));
          sub.recommended_skills.forEach(skill => skills.add(skill));
        });
      });
      setSkillFilters(Array.from(skills));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job profiles:', error);
      setLoading(false);
    }
  };

  const handleProfileClick = (category, subCategory) => {
    const profile = {
      category: category,
      subCategory: subCategory
    };
    setSelectedProfile(profile);
    onProfileSelect(profile);
  };

  const toggleFavorite = (profileName) => {
    setFavorites(prev => 
      prev.includes(profileName)
        ? prev.filter(name => name !== profileName)
        : [...prev, profileName]
    );
  };

  const toggleSkillFilter = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const filteredProfiles = jobProfiles
    .map(profile => ({
      ...profile,
      sub_categories: profile.sub_categories.filter(sub =>
        (searchTerm === '' || 
         sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         sub.required_skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
         sub.recommended_skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (selectedSkills.length === 0 ||
         selectedSkills.every(skill =>
           sub.required_skills.includes(skill) || sub.recommended_skills.includes(skill)
         ))
      )
    }))
    .filter(profile => profile.sub_categories.length > 0);

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortBy === 'name') {
      return a.category.localeCompare(b.category);
    } else if (sortBy === 'skills') {
      const aSkills = a.sub_categories.reduce((acc, sub) => acc + sub.required_skills.length + sub.recommended_skills.length, 0);
      const bSkills = b.sub_categories.reduce((acc, sub) => acc + sub.required_skills.length + sub.recommended_skills.length, 0);
      return bSkills - aSkills;
    } else if (sortBy === 'required') {
      const aRequired = a.sub_categories.reduce((acc, sub) => acc + sub.required_skills.length, 0);
      const bRequired = b.sub_categories.reduce((acc, sub) => acc + sub.required_skills.length, 0);
      return bRequired - aRequired;
    }
    return 0;
  });

  const getProfileStats = () => {
    const stats = {
      totalProfiles: 0,
      totalRequiredSkills: 0,
      totalRecommendedSkills: 0,
      mostCommonSkills: new Map(),
      categories: new Map()
    };

    jobProfiles.forEach(profile => {
      stats.totalProfiles += profile.sub_categories.length;
      profile.sub_categories.forEach(sub => {
        stats.totalRequiredSkills += sub.required_skills.length;
        stats.totalRecommendedSkills += sub.recommended_skills.length;
        
        sub.required_skills.forEach(skill => {
          stats.mostCommonSkills.set(skill, (stats.mostCommonSkills.get(skill) || 0) + 1);
        });
        
        sub.recommended_skills.forEach(skill => {
          stats.mostCommonSkills.set(skill, (stats.mostCommonSkills.get(skill) || 0) + 1);
        });
      });
      
      stats.categories.set(profile.category, profile.sub_categories.length);
    });

    return stats;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = getProfileStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 perspective-1000"
    >
      <FloatingElement>
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-8"
        >
          Select Your Job Profile
        </motion.h2>
      </FloatingElement>

      {/* Search, Sort, and Filter Controls */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <Card3D>
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search profiles or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </Card3D>

          <div className="flex items-center space-x-4">
            <Card3D>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 shadow-lg"
              >
                <FaFilter />
                <span>Filters</span>
                {selectedSkills.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    {selectedSkills.length}
                  </motion.span>
                )}
              </button>
            </Card3D>

            <Card3D>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              >
                <option value="name">Sort by Name</option>
                <option value="skills">Sort by Total Skills</option>
                <option value="required">Sort by Required Skills</option>
              </select>
            </Card3D>

            <div className="flex items-center space-x-2">
              <Card3D>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg shadow-lg ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </Card3D>
              <Card3D>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg shadow-lg ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </Card3D>
            </div>

            <Card3D>
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 shadow-lg"
              >
                <FaChartBar />
                <span>Stats</span>
              </button>
            </Card3D>
          </div>
        </div>

        {/* Stats Panel with 3D effect */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0, rotateX: -90 }}
              animate={{ height: 'auto', opacity: 1, rotateX: 0 }}
              exit={{ height: 0, opacity: 0, rotateX: -90 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6 mt-4 transform-gpu"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Total Profiles', value: stats.totalProfiles, color: 'blue' },
                  { title: 'Required Skills', value: stats.totalRequiredSkills, color: 'green' },
                  { title: 'Recommended Skills', value: stats.totalRecommendedSkills, color: 'purple' }
                ].map((stat, index) => (
                  <Card3D key={stat.title} whileHover={{ scale: 1.05 }}>
                    <div className={`bg-${stat.color}-50 p-4 rounded-lg shadow-lg`}>
                      <h3 className={`text-lg font-semibold text-${stat.color}-800 mb-2`}>{stat.title}</h3>
                      <motion.p
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`text-3xl font-bold text-${stat.color}-600`}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                  </Card3D>
                ))}
              </div>

              {/* Most Common Skills with 3D effect */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <h3 className="text-lg font-semibold mb-4">Most Common Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(stats.mostCommonSkills.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([skill, count], index) => (
                      <motion.div
                        key={skill}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center shadow-md"
                      >
                        <span className="font-medium">{skill}</span>
                        <span className="ml-2 text-gray-500">({count})</span>
                      </motion.div>
                    ))}
                </div>
              </motion.div>

              {/* Categories Distribution with 3D effect */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <h3 className="text-lg font-semibold mb-4">Categories Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from(stats.categories.entries()).map(([category, count], index) => (
                    <Card3D key={category} whileHover={{ scale: 1.05 }}>
                      <div className="bg-gray-50 p-3 rounded-lg shadow-lg">
                        <h4 className="font-medium text-gray-800">{category}</h4>
                        <motion.p
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-sm text-gray-600"
                        >
                          {count} profiles
                        </motion.p>
                      </div>
                    </Card3D>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skill Filters with 3D effect */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, rotateX: -90 }}
              animate={{ height: 'auto', opacity: 1, rotateX: 0 }}
              exit={{ height: 0, opacity: 0, rotateX: -90 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-4 mt-4 transform-gpu"
              style={{ transformStyle: "preserve-3d" }}
            >
              <h3 className="text-lg font-semibold mb-4">Filter by Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skillFilters.map((skill, index) => (
                  <motion.button
                    key={skill}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 shadow-md ${
                      selectedSkills.includes(skill)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Job Profiles with 3D effect */}
      <div className="space-y-8">
        {sortedProfiles.map((profile, index) => (
          <motion.div
            key={profile.category}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform-gpu"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Card3D>
              <div
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => setExpandedCategory(expandedCategory === profile.category ? null : profile.category)}
              >
                <h3 className="text-2xl font-semibold">{profile.category}</h3>
                <motion.div
                  animate={{ rotate: expandedCategory === profile.category ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {expandedCategory === profile.category ? <FaChevronUp /> : <FaChevronDown />}
                </motion.div>
              </div>
            </Card3D>

            <AnimatePresence>
              {expandedCategory === profile.category && (
                <motion.div
                  initial={{ height: 0, opacity: 0, rotateX: -90 }}
                  animate={{ height: 'auto', opacity: 1, rotateX: 0 }}
                  exit={{ height: 0, opacity: 0, rotateX: -90 }}
                  transition={{ duration: 0.5 }}
                  className="px-6 pb-6"
                >
                  <div className={`grid ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  } gap-4`}>
                    {profile.sub_categories.map((subCategory, subIndex) => (
                      <Card3D
                        key={subCategory.name}
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: subIndex * 0.1 }}
                          className={`cursor-pointer rounded-lg p-4 border-2 transition-all duration-300 shadow-lg ${
                            selectedProfile?.subCategory.name === subCategory.name
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => handleProfileClick(profile.category, subCategory)}
                          onHoverStart={() => setHoveredProfile(subCategory.name)}
                          onHoverEnd={() => setHoveredProfile(null)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-medium">{subCategory.name}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(subCategory.name);
                              }}
                              className="text-yellow-500 hover:text-yellow-600"
                            >
                              {favorites.includes(subCategory.name) ? <FaStar /> : <FaRegStar />}
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="text-sm font-semibold text-gray-600">Required Skills</h5>
                                <span className="text-xs text-gray-500">
                                  {subCategory.required_skills.length} skills
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {subCategory.required_skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {subCategory.required_skills.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    +{subCategory.required_skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="text-sm font-semibold text-gray-600">Recommended Skills</h5>
                                <span className="text-xs text-gray-500">
                                  {subCategory.recommended_skills.length} skills
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {subCategory.recommended_skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {subCategory.recommended_skills.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    +{subCategory.recommended_skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                              <button
                                className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add your view details handler here
                                }}
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* Profile Tooltip */}
                          <AnimatePresence>
                            {hoveredProfile === subCategory.name && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200"
                              >
                                <div className="flex items-center space-x-2">
                                  <FaInfoCircle className="text-blue-500" />
                                  <span className="text-sm font-medium">Profile Details</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                  <p>Total Skills: {subCategory.required_skills.length + subCategory.recommended_skills.length}</p>
                                  <p>Required Skills: {subCategory.required_skills.length}</p>
                                  <p>Recommended Skills: {subCategory.recommended_skills.length}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </Card3D>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Favorites Section with 3D effect */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-lg shadow-lg p-6 transform-gpu"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Card3D>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaStar className="text-yellow-500 mr-2" />
              Favorite Profiles
            </h3>
            <div className="flex flex-wrap gap-2">
              {favorites.map((profile, index) => (
                <motion.div
                  key={profile}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm flex items-center shadow-md"
                >
                  {profile}
                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFavorite(profile)}
                    className="ml-2 text-yellow-500 hover:text-yellow-600"
                  >
                    <FaTimes className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </Card3D>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JobProfileSelector; 