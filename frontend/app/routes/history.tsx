import { useEffect, useState } from "react";
import type { Route } from "./+types/history";
import { Link } from "react-router";
import { FileText, Trash2 } from "lucide-react";
import { Navbar } from "~/components/navbar";
import {
  deleteHistoryRecord,
  getHistory,
  type AnalysisRecord,
} from "~/services/history-storage";
import styles from "./history.module.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Research History - PaperMind" }];
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function History() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  const handleDelete = (pdfId: string) => {
    deleteHistoryRecord(pdfId);
    setRecords(getHistory());
  };

  return (
    <div className={styles.history}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Research History</h1>
        </div>

        {records.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText className={styles.emptyIcon} />
            <p className={styles.emptyText}>No analysis history found.</p>
          </div>
        ) : (
          <div className={styles.paperList}>
            {records.map((record) => (
              <article key={record.pdfId} className={styles.paperCard}>
                <div className={styles.paperInfo}>
                  <h2 className={styles.paperTitle}>{record.pdfName}</h2>
                  <p className={styles.paperDate}>{formatDate(record.date)}</p>
                </div>

                <div className={styles.paperActions}>
                  <Link
                    className={styles.viewButton}
                    to={`/paper/${record.pdfId}?source=history`}
                  >
                    Open Results
                  </Link>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(record.pdfId)}
                    aria-label={`Delete ${record.pdfName}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
