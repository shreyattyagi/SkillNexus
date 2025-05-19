import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { 
  FaCode, 
  FaGlobe, 
  FaDatabase, 
  FaTools, 
  FaChartBar, 
  FaUserFriends,
  FaSun,
  FaMoon,
  FaDesktop,
  FaFileUpload,
  FaFileAlt
} from "react-icons/fa";
import './index.css';
import ATSAnalysis from './ATSAnalysis';
import Chatbot from './Chatbot';
import ResumeBuilder from './ResumeBuilder';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import ThemeToggle from './ThemeToggle';

const iconMap = {
  FaCode,
  FaGlobe,
  FaDatabase,
  FaTools,
  FaChartBar,
  FaUserFriends
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const handleSystemThemeChange = (e) => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Initial setup
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
    }

    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="flex items-center gap-2 fixed top-4 right-4">
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-100 dark:bg-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title="Light Mode"
      >
        <FaSun className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-100 dark:bg-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title="Dark Mode"
      >
        <FaMoon className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-lg ${theme === 'system' ? 'bg-blue-100 dark:bg-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title="System Theme"
      >
        <FaDesktop className="w-5 h-5" />
      </button>
    </div>
  );
};

function SkillCategory({ title, skills, icon: IconComponent, type }) {
  const getBackgroundColor = (skill) => {
    if (type === "required") {
      return skills.matching?.skills.includes(skill) 
        ? "bg-green-100 dark:bg-green-800" 
        : "bg-red-100 dark:bg-red-800";
    }
    return skills.matching?.skills.includes(skill) 
      ? "bg-green-100 dark:bg-green-800" 
      : "bg-gray-100 dark:bg-gray-800";
  };

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <IconComponent size={20} className="mr-2" />
        <h3 className="m-0 text-lg font-semibold">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.skills.map((skill, index) => (
          <span
            key={index}
            className={`px-3 py-2 rounded-lg text-sm ${getBackgroundColor(skill)}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

const MainApp = () => {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [comparison, setComparison] = useState(null);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await fetch("http://127.0.0.1:8000/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setSkills(data.skills);
        setAtsAnalysis(data.ats_analysis);
        setAnalysisId(data._id);
      } catch (error) {
        console.error("Error analyzing resume:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleJobChange = (e) => {
    setSelectedJob(e.target.value);
  };

  const handleCompare = async () => {
    if (!file || !selectedJob) {
      alert("Please select both a resume and a job title");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://127.0.0.1:8000/compare?job_title=${selectedJob}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setComparison(data);
      setSkills(data.extracted_skills);
      setAtsAnalysis(data.ats_analysis);
      setAnalysisId(data._id);
    } catch (error) {
      console.error("Error comparing resume:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Resume ATS Analyzer
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Upload Resume</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg tracking-wide border-2 border-dashed cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                  <FaFileUpload className="w-8 h-8" />
                  <span className="mt-2 text-base">Select a PDF file</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {file && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selected file: {file.name}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Compare with Job</h2>
            <div className="space-y-4">
              <select 
                value={selectedJob} 
                onChange={handleJobChange}
                className="w-full p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">Select a job title</option>
                {jobs.map((job) => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </select>
              <div className="flex gap-4">
                <button 
                  onClick={handleCompare}
                  disabled={!file || !selectedJob || isAnalyzing}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200
                    ${isAnalyzing || !file || !selectedJob
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Compare with Job'}
                </button>
                <button
                  onClick={() => setIsResumeBuilderOpen(true)}
                  disabled={!selectedJob}
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-200
                    ${!selectedJob
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  <FaFileAlt />
                  Build Resume
                </button>
              </div>
            </div>
          </div>
        </div>

        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing your resume...</p>
          </div>
        )}

        {atsAnalysis && !isAnalyzing && (
          <div className="mb-8">
            <ATSAnalysis
              analysis={atsAnalysis}
              jobTitle={selectedJob}
              analysisId={analysisId}
            />
          </div>
        )}

        {comparison && !isAnalyzing && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">Your Skills</h2>
                {Object.entries(comparison.categorized.extracted).map(([category, skills]) => (
                  <SkillCategory
                    key={category}
                    title={category}
                    skills={skills}
                    icon={iconMap[skills.icon]}
                    type="extracted"
                    matching={comparison.categorized.matching[category]}
                  />
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">Required Skills</h2>
                {Object.entries(comparison.categorized.required).map(([category, skills]) => (
                  <SkillCategory
                    key={category}
                    title={category}
                    skills={skills}
                    icon={iconMap[skills.icon]}
                    type="required"
                    matching={comparison.categorized.matching[category]}
                  />
                ))}
              </div>
            </div>

            {Object.keys(comparison.categorized.missing).length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">Skills to Develop</h2>
                {Object.entries(comparison.categorized.missing).map(([category, skills]) => (
                  <SkillCategory
                    key={category}
                    title={category}
                    skills={skills}
                    icon={iconMap[skills.icon]}
                    type="missing"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Chatbot />
      <ResumeBuilder
        isOpen={isResumeBuilderOpen}
        onClose={() => setIsResumeBuilderOpen(false)}
        selectedJob={selectedJob}
      />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    document.title = "SkillNexus - AI-Powered Career Development Platform";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "SkillNexus is your AI-powered career companion for skill analysis, resume optimization, and professional growth.");
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = "SkillNexus is your AI-powered career companion for skill analysis, resume optimization, and professional growth.";
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainApp />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 