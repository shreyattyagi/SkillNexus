import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaGithub,
  FaGraduationCap,
  FaBriefcase,
  FaTools,
  FaSave,
  FaDownload,
  FaTimes
} from 'react-icons/fa';

const ResumeBuilder = ({ isOpen, onClose, selectedJob }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      summary: ''
    },
    education: [
      {
        degree: '',
        school: '',
        location: '',
        graduationDate: '',
        gpa: ''
      }
    ],
    experience: [
      {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        responsibilities: ['']
      }
    ],
    skills: {
      technical: [],
      soft: []
    },
    projects: [
      {
        name: '',
        description: '',
        technologies: '',
        link: ''
      }
    ]
  });

  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedJob) {
      // Fetch suggested skills for the selected job
      fetchJobRequirements();
    }
  }, [selectedJob]);

  const fetchJobRequirements = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/job-requirements/${selectedJob}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );
      const data = await response.json();
      setSuggestedSkills(data.required_skills || []);
    } catch (error) {
      console.error('Error fetching job requirements:', error);
    }
  };

  const handlePersonalInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value
      };
      return { ...prev, education: newEducation };
    });
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = {
        ...newExperience[index],
        [field]: value
      };
      return { ...prev, experience: newExperience };
    });
  };

  const handleResponsibilityChange = (expIndex, respIndex, value) => {
    setFormData(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].responsibilities[respIndex] = value;
      return { ...prev, experience: newExperience };
    });
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: '',
          school: '',
          location: '',
          graduationDate: '',
          gpa: ''
        }
      ]
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          responsibilities: ['']
        }
      ]
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: '',
          description: '',
          technologies: '',
          link: ''
        }
      ]
    }));
  };

  const handleSkillChange = (type, skill) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].includes(skill)
          ? prev.skills[type].filter(s => s !== skill)
          : [...prev.skills[type], skill]
      }
    }));
  };

  const handleProjectChange = (index, field, value) => {
    setFormData(prev => {
      const newProjects = [...prev.projects];
      newProjects[index] = {
        ...newProjects[index],
        [field]: value
      };
      return { ...prev, projects: newProjects };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          jobRole: selectedJob,
          resumeData: formData
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_resume.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to generate resume');
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Resume Builder - {selectedJob}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={formData.personalInfo.linkedin}
                  onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Professional Summary</label>
              <textarea
                value={formData.personalInfo.summary}
                onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700"
                rows={4}
              />
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Education</h3>
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Education
              </button>
            </div>
            {formData.education.map((edu, index) => (
              <div key={index} className="border p-4 rounded mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">School</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Graduation Date</label>
                    <input
                      type="month"
                      value={edu.graduationDate}
                      onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Experience */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Experience</h3>
              <button
                onClick={addExperience}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Experience
              </button>
            </div>
            {formData.experience.map((exp, index) => (
              <div key={index} className="border p-4 rounded mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      disabled={exp.current}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                    <div className="mt-2">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm">Current Position</label>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Responsibilities</label>
                  {exp.responsibilities.map((resp, respIndex) => (
                    <div key={respIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => handleResponsibilityChange(index, respIndex, e.target.value)}
                        className="flex-1 p-2 border rounded dark:bg-gray-700"
                        placeholder="Add a responsibility..."
                      />
                      <button
                        onClick={() => {
                          const newExp = [...formData.experience];
                          newExp[index].responsibilities.push('');
                          setFormData(prev => ({ ...prev, experience: newExp }));
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Skills */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Skills</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Suggested Skills for {selectedJob}</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => handleSkillChange('technical', skill)}
                      className={`px-3 py-1 rounded ${
                        formData.skills.technical.includes(skill)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Additional Technical Skills</label>
                <input
                  type="text"
                  placeholder="Type a skill and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleSkillChange('technical', e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Soft Skills</label>
                <input
                  type="text"
                  placeholder="Type a skill and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleSkillChange('soft', e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="w-full p-2 border rounded dark:bg-gray-700"
                />
              </div>
            </div>
          </section>

          {/* Projects */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Projects</h3>
              <button
                onClick={addProject}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Project
              </button>
            </div>
            {formData.projects.map((project, index) => (
              <div key={index} className="border p-4 rounded mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Name</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Technologies Used</label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Link</label>
                    <input
                      type="url"
                      value={project.link}
                      onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded flex items-center gap-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FaDownload />
                  Generate Resume
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder; 