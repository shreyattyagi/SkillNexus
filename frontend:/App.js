// src/App.js
import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setSkills(data.skills);
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Resume Skill Extractor</h1>
      <input type="file" onChange={handleFileChange} />
      <br /><br />
      <button onClick={handleUpload}>Upload Resume</button>

      <div style={{ marginTop: "2rem" }}>
        <h2>Extracted Skills:</h2>
        <div>
          {skills.map((skill, index) => (
            <span key={index} style={{ margin: "5px", padding: "5px", backgroundColor: "#d1fae5" }}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
