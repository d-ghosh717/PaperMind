import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/paper.$id";
import ReactMarkdown from "react-markdown";
import { useLocation, useParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "~/components/navbar";
import {
  getPaperSection,
  type PaperData,
  type PaperSection,
} from "~/services/paper-processing";
import {
  getActiveAnalysis,
  getHistoryRecord,
  getPendingUpload,
  isComplete,
  saveCompletedAnalysis,
  upsertActiveAnalysis,
} from "~/services/history-storage";
import styles from "./paper.$id.module.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Paper Results - PaperMind" }];
}

type TabType =
  | "summary"
  | "concepts"
  | "formulas"
  | "flashcards"
  | "research";

const SECTIONS: PaperSection[] = [
  "summary",
  "concepts",
  "formulas",
  "flashcards",
  "research",
];

const SECTION_LABELS: Record<PaperSection, string> = {
  summary: "Summary",
  concepts: "Concepts",
  formulas: "Formulas",
  flashcards: "Flashcards",
  research: "Research Analysis",
};

interface Flashcard {
  question: string;
  answer: string;
}

function parseFlashcards(markdown: string): Flashcard[] {
  const cards: Flashcard[] = [];
  const pattern = /Q:\s*([\s\S]*?)(?=\n\s*A:)\n\s*A:\s*([\s\S]*?)(?=\n\s*Q:|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(markdown)) !== null) {
    const question = match[1].replace(/^#+\s*Flashcards\s*/i, "").trim();
    const answer = match[2].trim();

    if (question && answer) {
      cards.push({ question, answer });
    }
  }

  return cards;
}

function LoadingSection({ label }: { label: string }) {
  return (
    <div className={styles.loadingSection}>
      <div className={styles.loadingDot} />
      <p>{label} is loading...</p>
    </div>
  );
}

function Flashcards({ markdown }: { markdown: string }) {
  const cards = useMemo(() => parseFlashcards(markdown), [markdown]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards.length) {
    return (
      <div className={styles.section}>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    );
  }

  const card = cards[index];

  const goToCard = (nextIndex: number) => {
    setFlipped(false);
    setIndex(nextIndex);
  };

  return (
    <div className={styles.flashcardContainer}>
      <p className={styles.flashcardCounter}>
        Card {index + 1} / {cards.length}
      </p>

      <button
        type="button"
        className={styles.flashcard}
        onClick={() => setFlipped((value) => !value)}
        aria-label="Flip flashcard"
      >
        <div
          className={`${styles.flashcardInner} ${
            flipped ? styles.flipped : ""
          }`}
        >
          <div className={styles.flashcardFace}>
            <p>{card.question}</p>
          </div>
          <div className={`${styles.flashcardFace} ${styles.flashcardBack}`}>
            <p>{card.answer}</p>
          </div>
        </div>
      </button>

      <div className={styles.flashcardControls}>
        <button
          type="button"
          className={styles.flashcardButton}
          onClick={() => goToCard(Math.max(index - 1, 0))}
          disabled={index === 0}
        >
          <ChevronLeft size={18} />
          Previous
        </button>
        <button
          type="button"
          className={styles.flashcardButton}
          onClick={() => goToCard(Math.min(index + 1, cards.length - 1))}
          disabled={index === cards.length - 1}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function Paper() {
  const params = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] =
    useState<TabType>("summary");
  const [paperName, setPaperName] = useState("Uploaded Paper");
  const [data, setData] = useState<PaperData | null>(null);
  const [loadingSections, setLoadingSections] = useState<PaperSection[]>([]);
  const [error, setError] = useState("");

  const fromHistory = new URLSearchParams(location.search).get("source") === "history";

  useEffect(() => {
    let isActive = true;

    async function loadPaper() {
      if (!params.id) {
        setError("Missing PDF id. Please upload the PDF again.");
        return;
      }

      const historyRecord = getHistoryRecord(params.id);

      if (fromHistory && historyRecord) {
        setPaperName(historyRecord.pdfName);
        setData(historyRecord.data);
        return;
      }

      const activeRecord = getActiveAnalysis(params.id);
      const pendingUpload = getPendingUpload(params.id);
      const initialData = activeRecord?.data || historyRecord?.data || null;
      const pdfName =
        activeRecord?.pdfName ||
        historyRecord?.pdfName ||
        pendingUpload?.pdfName ||
        "Uploaded Paper";

      setPaperName(pdfName);
      setData(initialData);

      if (historyRecord && isComplete(historyRecord.data)) {
        return;
      }

      try {
        setError("");

        for (const section of SECTIONS) {
          const currentData = getActiveAnalysis(params.id)?.data || initialData;

          if (currentData?.[section]) {
            continue;
          }

          if (!isActive) return;

          setLoadingSections((previous) => [...previous, section]);
          const sectionData = await getPaperSection(params.id, section);

          if (!isActive) return;

          upsertActiveAnalysis(params.id, pdfName, sectionData);
          const nextRecord = getActiveAnalysis(params.id);
          const nextData = nextRecord?.data || sectionData;

          setData(nextData);
          setLoadingSections((previous) =>
            previous.filter((item) => item !== section)
          );

          if (isComplete(nextData)) {
            saveCompletedAnalysis({
              pdfId: params.id,
              pdfName,
              date: nextRecord?.date || new Date().toISOString(),
              data: nextData,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load paper results", err);

        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load the paper analysis."
          );
        }
      } finally {
        if (isActive) {
          setLoadingSections([]);
        }
      }
    }

    loadPaper();

    return () => {
      isActive = false;
    };
  }, [fromHistory, location.search, params.id]);

  const isLoading = (section: PaperSection) =>
    loadingSections.includes(section);

  if (!data && error) {
    return (
      <div className={styles.paper}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <h1 className={styles.title}>Analysis unavailable</h1>
            <p className={styles.emptyText}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.paper}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Analysis Results</h1>
          <p className={styles.paperName}>{paperName}</p>
        </div>

        {error && (
          <div className={styles.inlineError}>{error}</div>
        )}

        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            {SECTIONS.map((section) => (
              <button
                key={section}
                className={`${styles.tab} ${
                  activeTab === section ? styles.active : ""
                }`}
                onClick={() => setActiveTab(section)}
              >
                {SECTION_LABELS[section]}
                {isLoading(section) && (
                  <span className={styles.tabStatus}>Loading</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === "summary" && (
              <div className={styles.section}>
                {data?.summary ? (
                  <ReactMarkdown>{data.summary}</ReactMarkdown>
                ) : (
                  <LoadingSection label="Summary" />
                )}
              </div>
            )}

            {activeTab === "concepts" && (
              <div className={styles.section}>
                {data?.concepts ? (
                  <ReactMarkdown>{data.concepts}</ReactMarkdown>
                ) : (
                  <LoadingSection label="Concepts" />
                )}
              </div>
            )}

            {activeTab === "formulas" && (
              <div className={styles.section}>
                {data?.formulas ? (
                  <ReactMarkdown>{data.formulas}</ReactMarkdown>
                ) : (
                  <LoadingSection label="Formulas" />
                )}
              </div>
            )}

            {activeTab === "flashcards" && (
              <div className={styles.section}>
                {data?.flashcards ? (
                  <Flashcards markdown={data.flashcards} />
                ) : (
                  <LoadingSection label="Flashcards" />
                )}
              </div>
            )}

            {activeTab === "research" && (
              <>
                {data?.research?.isResearchPaper ? (
                  <>
                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}>Limitations</h2>
                      <ReactMarkdown>
                        {data.research.limitations}
                      </ReactMarkdown>
                    </div>

                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}>Research Gaps</h2>
                      <ReactMarkdown>{data.research.gaps}</ReactMarkdown>
                    </div>

                    <div className={styles.section}>
                      <h2 className={styles.sectionTitle}>Future Work</h2>
                      <ReactMarkdown>
                        {data.research.future_work}
                      </ReactMarkdown>
                    </div>
                  </>
                ) : data?.research ? (
                  <div className={styles.section}>
                    <p className={styles.emptyText}>
                      This document was not classified as a research paper.
                    </p>
                  </div>
                ) : (
                  <LoadingSection label="Research Analysis" />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
