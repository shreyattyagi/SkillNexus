import React from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { useTheme } from './ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg z-50"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          theme === 'light'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Light Mode"
      >
        <FaSun className="w-5 h-5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          theme === 'dark'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Dark Mode"
      >
        <FaMoon className="w-5 h-5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          theme === 'system'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="System Theme"
      >
        <FaDesktop className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

export default ThemeToggle; 