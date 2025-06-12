import React, { useState } from 'react';
import './App.css'; // Import the CSS file for styling

// Main App component for the AI Resume Builder
function App() {
  // State to hold all resume data
  const [resumeData, setResumeData] = useState({
    personal: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
    },
    summary: '',
    skills: '',
    experience: [{ title: '', company: '', duration: '', description: '' }],
    education: [{ degree: '', institution: '', year: '' }],
    hobbies: '',
  });

  // State for AI generation loading
  const [isGenerating, setIsGenerating] = useState(false);
  // State for AI generation error message
  const [aiError, setAiError] = useState('');

  // Handler for all input changes
  const handleChange = (e, section, index = null, field = null) => {
    const { name, value } = e.target;
    if (index !== null && field !== null) { // For experience and education arrays
      const newArray = [...resumeData[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      setResumeData({ ...resumeData, [section]: newArray });
    } else if (section) { // For nested objects like 'personal'
      setResumeData({
        ...resumeData,
        [section]: {
          ...resumeData[section],
          [name]: value,
        },
      });
    } else { // For top-level fields like 'summary' or 'hobbies'
      setResumeData({ ...resumeData, [name]: value });
    }
  };

  // Add new experience entry
  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { title: '', company: '', duration: '', description: '' }],
    });
  };

  // Remove experience entry
  const removeExperience = (index) => {
    const newExperience = resumeData.experience.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, experience: newExperience });
  };

  // Add new education entry
  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { degree: '', institution: '', year: '' }],
    });
  };

  // Remove education entry
  const removeEducation = (index) => {
    const newEducation = resumeData.education.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, education: newEducation });
  };

  // Handle AI summary generation
  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setAiError('');
    try {
      const prompt = `Generate a professional summary for a web development fresher. Highlight basic skills in HTML, CSS, JavaScript, eagerness to learn, and a proactive attitude. Keep it concise, 2-5 lines.`;
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this in runtime.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text; // Corrected access: assuming 'text' is directly available in the first part
        setResumeData(prevData => ({ ...prevData, summary: text }));
      } else {
        setAiError('Failed to generate summary: Unexpected API response structure.');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setAiError(`Failed to generate summary: ${error.message || 'Unknown error'}.`);
    } finally {
      setIsGenerating(false);
    }
  };


  // Function to handle printing the resume
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      <h1 className="app-title">AI-Powered Resume Builder</h1>

      <div className="main-content-grid">
        {/* Input Form Section */}
        <div className="input-form">
          <h2 className="form-section-title">
            Build Your Resume
          </h2>

          {/* Personal Information */}
          <div className="input-group">
            <h3 className="section-heading">Personal Information</h3>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={resumeData.personal.name}
              onChange={(e) => handleChange(e, 'personal')}
              className="input-field"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={resumeData.personal.email}
              onChange={(e) => handleChange(e, 'personal')}
              className="input-field"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={resumeData.personal.phone}
              onChange={(e) => handleChange(e, 'personal')}
              className="input-field"
            />
            <input
              type="url"
              name="linkedin"
              placeholder="LinkedIn Profile URL"
              value={resumeData.personal.linkedin}
              onChange={(e) => handleChange(e, 'personal')}
              className="input-field"
            />
            <input
              type="url"
              name="github"
              placeholder="GitHub Profile URL"
              value={resumeData.personal.github}
              onChange={(e) => handleChange(e, 'personal')}
              className="input-field"
            />
          </div>

          {/* Professional Summary */}
          <div className="input-group">
            <h3 className="section-heading">Professional Summary</h3>
            <textarea
              name="summary"
              placeholder="A concise summary of your professional profile (2-5 lines)"
              value={resumeData.summary}
              onChange={(e) => handleChange(e, null)}
              rows="4"
              className="input-field textarea-field"
            ></textarea>
            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className={`action-button generate-button ${isGenerating ? 'generating' : ''}`}
            >
              {isGenerating ? 'Generating...' : 'Generate Summary with AI'}
            </button>
            {aiError && <p className="error-message">{aiError}</p>}
          </div>

          {/* Skills */}
          <div className="input-group">
            <h3 className="section-heading">Skills</h3>
            <textarea
              name="skills"
              placeholder="List your skills, separated by commas or bullet points (e.g., HTML, CSS, JavaScript, React, Git, Problem Solving)"
              value={resumeData.skills}
              onChange={(e) => handleChange(e, null)}
              rows="3"
              className="input-field textarea-field"
            ></textarea>
          </div>

          {/* Experience */}
          <div className="input-group">
            <h3 className="section-heading">Experience</h3>
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="nested-input-card">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={exp.title}
                  onChange={(e) => handleChange(e, 'experience', index, 'title')}
                  className="input-field nested-input"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => handleChange(e, 'experience', index, 'company')}
                  className="input-field nested-input"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., Jan 2023 - Present)"
                  value={exp.duration}
                  onChange={(e) => handleChange(e, 'experience', index, 'duration')}
                  className="input-field nested-input"
                />
                <textarea
                  placeholder="Responsibilities and achievements (bullet points recommended)"
                  value={exp.description}
                  onChange={(e) => handleChange(e, 'experience', index, 'description')}
                  rows="3"
                  className="input-field nested-input textarea-field"
                ></textarea>
                <button
                  onClick={() => removeExperience(index)}
                  className="remove-button"
                >
                  Remove Experience
                </button>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="action-button add-button"
            >
              Add Experience
            </button>
          </div>

          {/* Education */}
          <div className="input-group">
            <h3 className="section-heading">Education</h3>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="nested-input-card">
                <input
                  type="text"
                  placeholder="Degree/Qualification"
                  value={edu.degree}
                  onChange={(e) => handleChange(e, 'education', index, 'degree')}
                  className="input-field nested-input"
                />
                <input
                  type="text"
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => handleChange(e, 'education', index, 'institution')}
                  className="input-field nested-input"
                />
                <input
                  type="text"
                  placeholder="Graduation Year (e.g., 2024)"
                  value={edu.year}
                  onChange={(e) => handleChange(e, 'education', index, 'year')}
                  className="input-field nested-input"
                />
                <button
                  onClick={() => removeEducation(index)}
                  className="remove-button"
                >
                  Remove Education
                </button>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="action-button add-button"
            >
              Add Education
            </button>
          </div>

          {/* Hobbies (Optional) */}
          <div className="input-group">
            <h3 className="section-heading">Hobbies (Optional)</h3>
            <textarea
              name="hobbies"
              placeholder="Unique hobbies that highlight relevant soft skills (e.g., Contributing to open-source coding challenges, Digital art design for personal projects)"
              value={resumeData.hobbies}
              onChange={(e) => handleChange(e, null)}
              rows="2"
              className="input-field textarea-field"
            ></textarea>
          </div>

          {/* Print Button */}
          <div className="print-button-container">
            <button
              onClick={handlePrint}
              className="action-button print-button"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Resume Preview Section */}
        <div className="resume-preview-container printable-area">
          <div className="resume-header">
            <h2 className="resume-name">{resumeData.personal.name || 'Your Name'}</h2>
            <p className="resume-contact">
              {resumeData.personal.email} | {resumeData.personal.phone}
            </p>
            <p className="resume-links">
              {resumeData.personal.linkedin && (
                <a href={resumeData.personal.linkedin} target="_blank" rel="noopener noreferrer" className="resume-link">
                  LinkedIn
                </a>
              )}
              {resumeData.personal.github && (
                <a href={resumeData.personal.github} target="_blank" rel="noopener noreferrer" className="resume-link">
                  GitHub
                </a>
              )}
            </p>
          </div>

          {resumeData.summary && (
            <div className="resume-section">
              <h3 className="resume-section-title">Professional Summary</h3>
              <p className="resume-content pre-wrap-text">{resumeData.summary}</p>
            </div>
          )}

          {resumeData.skills && (
            <div className="resume-section">
              <h3 className="resume-section-title">Skills</h3>
              <p className="resume-content">{resumeData.skills}</p>
            </div>
          )}

          {resumeData.experience.length > 0 && resumeData.experience[0].title && (
            <div className="resume-section">
              <h3 className="resume-section-title">Experience</h3>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="resume-item">
                  <div className="resume-item-header">
                    <h4 className="resume-item-title">{exp.title}</h4>
                    <span className="resume-item-duration">{exp.duration}</span>
                  </div>
                  <p className="resume-item-company">{exp.company}</p>
                  <p className="resume-content pre-wrap-text">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {resumeData.education.length > 0 && resumeData.education[0].degree && (
            <div className="resume-section">
              <h3 className="resume-section-title">Education</h3>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="resume-item">
                  <div className="resume-item-header">
                    <h4 className="resume-item-title">{edu.degree}</h4>
                    <span className="resume-item-duration">{edu.year}</span>
                  </div>
                  <p className="resume-item-institution">{edu.institution}</p>
                </div>
              ))}
            </div>
          )}

          {resumeData.hobbies && (
            <div className="resume-section">
              <h3 className="resume-section-title">Hobbies</h3>
              <p className="resume-content">{resumeData.hobbies}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
