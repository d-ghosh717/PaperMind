export interface PaperData {
  summary?: string;
  concepts?: string;
  formulas?: string;
  flashcards?: string;
  research?: {
    isResearchPaper: boolean;
    limitations?: string;
    gaps?: string;
    future_work?: string;
  };
}

export const API_URL = "http://localhost:5000";

export type PaperSection = "summary" | "concepts" | "formulas" | "flashcards" | "research";

const SECTION_ENDPOINTS: Record<PaperSection, string> = {
  summary: "summary",
  concepts: "concepts",
  formulas: "formulas",
  flashcards: "flashcards",
  research: "research",
};

const SECTION_LABELS: Record<PaperSection, string> = {
  summary: "Summary",
  concepts: "Concepts",
  formulas: "Formulas",
  flashcards: "Flashcards",
  research: "Research Analysis",
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function friendlyNetworkError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError(
    "ResearchLens could not reach the Flask backend at http://localhost:5000. Please start the backend and try again."
  );
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new ApiError("The backend returned an invalid response.", response.status);
  }

  if (!isRecord(data)) {
    throw new ApiError("The backend response was not in the expected format.", response.status);
  }

  if (!response.ok) {
    const message = typeof data.error === "string" && data.error.trim()
      ? data.error
      : "The backend could not complete the request.";
    throw new ApiError(message, response.status);
  }

  return data;
}

function requireText(data: Record<string, unknown>, key: Exclude<PaperSection, "research">): string {
  const value = data[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(`${SECTION_LABELS[key]} returned an empty AI response.`);
  }

  return value;
}

function parseResearch(data: Record<string, unknown>): PaperData["research"] {
  if (typeof data.isResearchPaper !== "boolean") {
    throw new ApiError("Research analysis returned an invalid response.");
  }

  if (!data.isResearchPaper) {
    return { isResearchPaper: false };
  }

  const limitations = typeof data.limitations === "string" ? data.limitations : "";
  const gaps = typeof data.gaps === "string" ? data.gaps : "";
  const future_work = typeof data.future_work === "string" ? data.future_work : "";

  if (!limitations.trim() || !gaps.trim() || !future_work.trim()) {
    throw new ApiError("Research analysis returned an empty AI response.");
  }

  return {
    isResearchPaper: true,
    limitations,
    gaps,
    future_work,
  };
}

export async function uploadPaper(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await readJson(response);

    if (typeof data.pdf_id !== "string" || !data.pdf_id.trim()) {
      throw new ApiError("Upload succeeded, but the backend did not return a PDF id.");
    }

    return data.pdf_id;
  } catch (error) {
    throw friendlyNetworkError(error);
  }
}

export async function getPaperSection(
  paperId: string,
  section: PaperSection
): Promise<Pick<PaperData, PaperSection>> {
  if (!paperId) {
    throw new ApiError("Missing PDF id.");
  }

  try {
    const response = await fetch(`${API_URL}/${SECTION_ENDPOINTS[section]}/${paperId}`);
    const sectionData = await readJson(response);

    if (section === "research") {
      return {
        research: parseResearch(sectionData),
      };
    }

    return {
      [section]: requireText(sectionData, section),
    };
  } catch (error) {
    throw friendlyNetworkError(error);
  }
}

export async function getPaperData(
  paperId: string,
  onSectionComplete?: (section: PaperSection) => void
): Promise<PaperData> {
  if (!paperId) {
    throw new ApiError("Missing PDF id.");
  }

  try {
    const data: PaperData = {};

    for (const section of Object.keys(SECTION_ENDPOINTS) as PaperSection[]) {
      Object.assign(data, await getPaperSection(paperId, section));

      onSectionComplete?.(section);
    }

    return data;
  } catch (error) {
    throw friendlyNetworkError(error);
  }
}
