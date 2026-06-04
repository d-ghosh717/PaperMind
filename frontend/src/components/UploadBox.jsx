import { useState } from "react";
import axios from "axios";

function UploadBox({ setResult, setLoading }) {
  const [file, setFile] = useState(null);

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/upload",
        formData
      );

      setResult(res.data);
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }

    setLoading(false);
  };

  return (
    <div className="upload-box">
      <h2>Upload Research Paper</h2>

      <input
        type="file"
        accept=".pdf"
        className="file-input"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />

      <button
        className="upload-btn"
        onClick={uploadFile}
      >
        Analyze Paper
      </button>
    </div>
  );
}

export default UploadBox;