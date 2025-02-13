import React, { useState } from "react";
import "./App.css";

const App: React.FC = () => {
  const [theme, setTheme] = useState("dark");
  const [fileName, setFileName] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      setFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("https://sql-query-generator-backend-qac6.onrender.com/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log("File Upload Response:", data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!prompt) return;
    setLoading(true);

    try {
      const res = await fetch("https://sql-query-generator-backend-qac6.onrender.com/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.query);
    } catch (error) {
      console.error("Error generating query:", error);
    }

    setLoading(false);
    setPrompt("");
  };

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <h1>SQL Query Generator</h1>
        <button onClick={toggleTheme}>{theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}</button>
      </header>

      <div className="file-upload">
        <label htmlFor="file-input" className="upload-box">
          <input type="file" id="file-input" onChange={handleFileChange} hidden />
          {fileName ? <span>{fileName}</span> : <span>📁 Click to Upload SQL File</span>}
        </label>
      </div>

      <div className="chat">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your SQL query prompt..."
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Generating..." : "Generate SQL"}
        </button>
        {response && <div className="response">{response}</div>}
      </div>
    </div>
  );
};

export default App;
