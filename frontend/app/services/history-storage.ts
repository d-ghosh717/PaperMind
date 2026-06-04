import type { PaperData } from "./paper-processing";

const ACTIVE_PREFIX = "researchlens:active:";
const HISTORY_KEY = "researchlens:history";
const PENDING_UPLOAD_KEY = "researchlens:pending-upload";

export interface AnalysisRecord {
  pdfId: string;
  pdfName: string;
  date: string;
  data: PaperData;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function setPendingUpload(pdfId: string, pdfName: string) {
  writeJson(PENDING_UPLOAD_KEY, {
    pdfId,
    pdfName,
    date: new Date().toISOString(),
  });
}

export function getPendingUpload(pdfId: string): AnalysisRecord | null {
  const pending = readJson<AnalysisRecord | null>(PENDING_UPLOAD_KEY, null);
  return pending?.pdfId === pdfId ? pending : null;
}

export function getActiveAnalysis(pdfId: string): AnalysisRecord | null {
  return readJson<AnalysisRecord | null>(`${ACTIVE_PREFIX}${pdfId}`, null);
}

export function saveActiveAnalysis(record: AnalysisRecord) {
  writeJson(`${ACTIVE_PREFIX}${record.pdfId}`, record);
}

export function upsertActiveAnalysis(pdfId: string, pdfName: string, data: PaperData) {
  const existing = getActiveAnalysis(pdfId);

  saveActiveAnalysis({
    pdfId,
    pdfName: existing?.pdfName || pdfName,
    date: existing?.date || new Date().toISOString(),
    data: {
      ...existing?.data,
      ...data,
      research: data.research ?? existing?.data.research,
    },
  });
}

export function getHistory(): AnalysisRecord[] {
  return readJson<AnalysisRecord[]>(HISTORY_KEY, []);
}

export function getHistoryRecord(pdfId: string): AnalysisRecord | null {
  return getHistory().find((record) => record.pdfId === pdfId) || null;
}

export function saveCompletedAnalysis(record: AnalysisRecord) {
  const history = getHistory();
  const next = [
    record,
    ...history.filter((item) => item.pdfId !== record.pdfId),
  ];

  writeJson(HISTORY_KEY, next);
}

export function deleteHistoryRecord(pdfId: string) {
  writeJson(
    HISTORY_KEY,
    getHistory().filter((record) => record.pdfId !== pdfId)
  );
}

export function isComplete(data: PaperData | null | undefined) {
  return Boolean(
    data?.summary &&
      data.concepts &&
      data.formulas &&
      data.flashcards &&
      data.research
  );
}
