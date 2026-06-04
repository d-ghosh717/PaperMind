import { useState } from "react";
import UploadBox from "./components/UploadBox";
import SummaryCard from "./components/SummaryCard";
import GapCard from "./components/GapCard";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  const [result, setResult] = useState({
    summary: "",
    gaps: "",
  });

  const resetPaper = () => {
    setUploaded(false);
    setFileName("");
    setResult({
      summary: "",
      gaps: "",
    });
  };

  return (
    <div className={darkMode ? "dark" : "light"}>
      <div className="container">

        <div className="header">
          <h1 className="title">ResearchLens</h1>

          <button
            className="mode-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Day" : "🌙 Night"}
          </button>
        </div>

        {!uploaded && (
          <UploadBox
            setResult={setResult}
            setLoading={setLoading}
            setUploaded={setUploaded}
            setFileName={setFileName}
          />
        )}

        {uploaded && (
          <div className="paper-info">
            <div>
              <h3>{fileName}</h3>
              <p>Research Paper Uploaded Successfully</p>
            </div>

            <button
              className="upload-btn"
              onClick={resetPaper}
            >
              Upload Another Paper
            </button>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="loading-box">
              <h2>Analyzing Research Paper...</h2>
              <p>This may take 1-3 minutes</p>
            </div>
          </div>
        )}

        {(result.summary || result.gaps) && (
          <div className="results">

            <SummaryCard
              summary={result.summary}
            />

            <GapCard
              gaps={result.gaps}
            />

          </div>
        )}

      </div>
    </div>
  );
}

export default App;