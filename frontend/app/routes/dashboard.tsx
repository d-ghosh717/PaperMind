import { useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type { Route } from "./+types/dashboard";
import { useNavigate } from "react-router";
import { Clock, Upload, FileText, X } from "lucide-react";
import { Navbar } from "~/components/navbar";
import { uploadPaper } from "~/services/paper-processing";
import { setPendingUpload } from "~/services/history-storage";
import styles from "./dashboard.module.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard - PaperMind" }];
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export default function Dashboard() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 25MB");
      return false;
    }

    setError("");
    return true;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError("");

      const pdfId = await uploadPaper(selectedFile);
      setPendingUpload(pdfId, selectedFile.name);

      navigate(`/processing/${pdfId}`);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload PDF. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
      " " +
      sizes[i]
    );
  };

  return (
    <div className={styles.dashboard}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Upload Your Research Paper
          </h1>

          <p className={styles.subtitle}>
            Supports scanned PDFs and mathematical content
          </p>
        </div>

        <button
          className={styles.historyButton}
          onClick={() => navigate("/history")}
        >
          <Clock size={18} />
          History
        </button>

        <div
          className={`${styles.uploadBox} ${
            dragActive ? styles.dragActive : ""
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() =>
            document.getElementById("fileInput")?.click()
          }
        >
          <Upload className={styles.uploadIcon} />

          <p className={styles.uploadText}>
            Drag & Drop your PDF
          </p>

          <p className={styles.uploadSubtext}>
            or Click to Browse
          </p>

          <p className={styles.uploadSubtext}>
            Max 25MB
          </p>

          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </div>

        {error && (
          <p
            style={{
              color: "var(--color-error-9)",
              marginTop: "var(--space-3)",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {selectedFile && (
          <>
            <div className={styles.filePreview}>
              <div className={styles.fileInfo}>
                <FileText className={styles.fileIcon} />

                <div>
                  <p className={styles.fileName}>
                    {selectedFile.name}
                  </p>

                  <p className={styles.fileSize}>
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              <button
                className={styles.removeButton}
                onClick={() => setSelectedFile(null)}
              >
                <X size={16} />
              </button>
            </div>

            <button
              className={styles.uploadButton}
              onClick={handleUpload}
              disabled={uploading}
            >
              <Upload size={20} />

              {uploading
                ? "Uploading..."
                : "Process Paper"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
