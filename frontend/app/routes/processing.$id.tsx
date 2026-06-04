import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Route } from "./+types/processing.$id";
import { useNavigate, useParams } from "react-router";
import { FileText, ScanText, Sparkles, CreditCard } from "lucide-react";
import { Navbar } from "~/components/navbar";
import { getPaperSection } from "~/services/paper-processing";
import {
  getPendingUpload,
  upsertActiveAnalysis,
} from "~/services/history-storage";
import styles from "./processing.$id.module.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Processing Paper - PaperMind" }];
}

const PROCESSING_STEPS = [
  { id: "summary", label: "Generating Summary", icon: FileText },
  { id: "concepts", label: "Extracting Concepts", icon: ScanText },
  { id: "formulas", label: "Extracting Formulas", icon: Sparkles },
  { id: "flashcards", label: "Creating Flashcards", icon: CreditCard },
  { id: "research", label: "Running Research Analysis", icon: Sparkles },
];

export default function Processing() {
  const navigate = useNavigate();
  const params = useParams();

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function processPaper() {
      if (!params.id) {
        setError("Missing PDF id. Please upload the PDF again.");
        return;
      }

      try {
        setError("");
        setCompletedSteps([]);

        const summary = await getPaperSection(params.id, "summary");

        if (!isActive) return;

        const pendingUpload = getPendingUpload(params.id);

        upsertActiveAnalysis(
          params.id,
          pendingUpload?.pdfName || "Uploaded Paper",
          summary
        );

        setCompletedSteps(["summary"]);

        if (isActive) {
          navigate(`/paper/${params.id}`);
        }
      } catch (err) {
        console.error("Error fetching backend paper data", err);

        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Processing failed. Please try again."
          );
        }
      }
    }

    processPaper();

    return () => {
      isActive = false;
    };
  }, [navigate, params.id]);

  const progress = Math.round(
    (completedSteps.length / PROCESSING_STEPS.length) * 100
  );

  const currentStep = Math.min(
    completedSteps.length,
    PROCESSING_STEPS.length - 1
  );

  return (
    <div className={styles.processing}>
      <Navbar />

      <div className={styles.container}>

        <h1 className={styles.title}>
          Processing Your Paper
        </h1>

        <p className={styles.subtitle}>
          Uploaded Paper
        </p>

        <p
          className={styles.subtitle}
          style={{
            marginTop: "var(--space-2)",
            fontSize: "var(--font-size-1)"
          }}
        >
          Summary will open as soon as it is ready. The rest will continue in the results page.
        </p>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${progress}%`
            }}
          />
        </div>

        <div className={styles.steps}>

          {PROCESSING_STEPS.map(
            (step, index) => {

              const Icon = step.icon;

              const isActive =
                !error && index === currentStep;

              const isCompleted =
                completedSteps.includes(step.id);

              return (
                <div
                  key={step.id}
                  className={`${styles.step} ${
                    isActive
                      ? styles.active
                      : ""
                  } ${
                    isCompleted
                      ? styles.completed
                      : ""
                  }`}
                >

                  {isCompleted ? (
                    <CheckCircle2
                      className={
                        styles.stepIcon
                      }
                    />
                  ) : (
                    <Icon
                      className={
                        styles.stepIcon
                      }
                    />
                  )}

                  <p className={styles.stepText}>
                    {step.label}
                  </p>

                </div>
              );

            }
          )}

        </div>

        {error && (
          <div className={styles.errorPanel}>
            <p className={styles.errorText}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
