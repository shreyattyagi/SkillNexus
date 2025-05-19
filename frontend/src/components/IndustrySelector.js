import React, { useState, useEffect } from 'react';
import { FaLaptopCode, FaChartLine, FaHeartbeat, FaBullhorn, FaGraduationCap, FaIndustry, FaShoppingCart, FaBolt, FaTruck, FaHardHat } from 'react-icons/fa';
import { motion } from 'framer-motion';

const industryIcons = {
  'Information Technology': FaLaptopCode,
  'Finance and Accounting': FaChartLine,
  'Healthcare': FaHeartbeat,
  'Marketing and Advertising': FaBullhorn,
  'Education': FaGraduationCap,
  'Manufacturing': FaIndustry,
  'Retail': FaShoppingCart,
  'Energy': FaBolt,
  'Transportation': FaTruck,
  'Construction': FaHardHat
};

const IndustrySelector = ({ onIndustrySelect }) => {
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/industries`);
      const data = await response.json();
      setIndustries(data.industries);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching industries:', error);
      setLoading(false);
    }
  };

  const handleIndustryClick = (industry) => {
    setSelectedIndustry(industry);
    onIndustrySelect(industry);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Select Your Industry</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((industry) => {
          const Icon = industryIcons[industry.name];
          return (
            <motion.div
              key={industry.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer rounded-lg p-6 shadow-lg transition-all duration-300 ${
                selectedIndustry?.name === industry.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-blue-50'
              }`}
              onClick={() => handleIndustryClick(industry)}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  selectedIndustry?.name === industry.name
                    ? 'bg-white text-blue-500'
                    : 'bg-blue-100 text-blue-500'
                }`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{industry.name}</h3>
                  <p className={`text-sm ${
                    selectedIndustry?.name === industry.name
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}>
                    {industry.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default IndustrySelector; 