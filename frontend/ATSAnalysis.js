import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaDownload } from 'react-icons/fa';
import { useAuth } from './AuthContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const ATSAnalysis = ({ atsAnalysis, jobTitle, analysisId }) => {
  const { user } = useAuth();

  const pieData = {
    labels: ['ATS Score', 'Room for Improvement'],
    datasets: [
      {
        data: [atsAnalysis.overall_ats_score, 100 - atsAnalysis.overall_ats_score],
        backgroundColor: [
          'rgba(52, 211, 153, 0.8)',
          'rgba(239, 68, 68, 0.2)',
        ],
        borderColor: [
          'rgba(52, 211, 153, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Format Score', 'Skills Score', jobTitle ? 'Job Match Score' : 'Overall Skills'],
    datasets: [
      {
        label: 'Score',
        data: [
          atsAnalysis.format_score,
          atsAnalysis.skills_score,
          jobTitle ? atsAnalysis.job_match_score : atsAnalysis.skills_score,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(52, 211, 153, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Detailed Scores',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/download-report/${analysisId}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_analysis_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">ATS Analysis Results</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaDownload />
          Download Report
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">ATS Score Analysis</h2>
        <div className="flex justify-center items-center space-x-2">
          <div className="w-32 h-32">
            <Pie data={pieData} />
          </div>
          <div className="text-left ml-4">
            <p className="text-4xl font-bold text-green-500">
              {atsAnalysis.overall_ats_score}%
            </p>
            <p className="text-gray-600 dark:text-gray-400">Overall ATS Score</p>
          </div>
        </div>
      </div>

      <div className="h-64">
        <Bar data={barData} options={barOptions} />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Resume Format Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(atsAnalysis.format_analysis).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              {value ? (
                <FaCheckCircle className="text-green-500 text-xl" />
              ) : (
                <FaTimesCircle className="text-red-500 text-xl" />
              )}
              <span className="capitalize">
                {key.replace('has_', '').replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">
          Improvement Suggestions
        </h3>
        <div className="space-y-2">
          {atsAnalysis.improvement_suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900"
            >
              <FaInfoCircle className="text-blue-500 text-xl flex-shrink-0 mt-1" />
              <p className="text-sm">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ATSAnalysis; 