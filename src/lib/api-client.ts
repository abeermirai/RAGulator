import type {
  AnalyzeResponse,
  AuditCycle,
  DocumentRecord,
  DocumentZone,
  FindingsResponse,
  PipelineResponse,
  QueryResponse,
  ReportResponse,
} from "@/lib/types/audit";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const CYCLE_KEY = "ragulator.activeCycleId";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function download(path: string, filename: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Download failed: ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getStoredCycleId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CYCLE_KEY);
}

export function storeCycleId(id: string) {
  sessionStorage.setItem(CYCLE_KEY, id);
}

export const auditApi = {
  health: () =>
    request<{
      status: string;
      engine: string;
      llm_provider: string;
      llm_model: string;
      llm_available: boolean;
    }>("/api/health"),

  getDefaultCycle: () => request<AuditCycle>("/api/cycles/default"),

  startNewCycle: (name = "ICAAP 2026") =>
    request<AuditCycle>("/api/cycles/default/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }),

  getCycle: (cycleId: string) => request<AuditCycle>(`/api/cycles/${cycleId}`),

  createCycle: (name = "ICAAP 2026") =>
    request<AuditCycle>("/api/cycles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }),

  listDocuments: (cycleId: string) => request<DocumentRecord[]>(`/api/cycles/${cycleId}/documents`),

  uploadDocument: (cycleId: string, file: File, zone: DocumentZone) => {
    const form = new FormData();
    form.append("file", file);
    form.append("zone", zone);
    return request<DocumentRecord>(`/api/cycles/${cycleId}/documents`, {
      method: "POST",
      body: form,
    });
  },

  deleteDocument: (cycleId: string, docId: string) =>
    request<{ deleted: boolean }>(`/api/cycles/${cycleId}/documents/${docId}`, { method: "DELETE" }),

  getPipeline: (cycleId: string) => request<PipelineResponse>(`/api/cycles/${cycleId}/pipeline`),

  analyze: (cycleId: string) =>
    request<AnalyzeResponse>(`/api/cycles/${cycleId}/analyze`, { method: "POST" }),

  query: (cycleId: string, question: string) =>
    request<QueryResponse>(`/api/cycles/${cycleId}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    }),

  getFindings: (cycleId: string) => request<FindingsResponse>(`/api/cycles/${cycleId}/findings`),

  getReport: (cycleId: string) => request<ReportResponse>(`/api/cycles/${cycleId}/report`),

  generateReport: (cycleId: string) =>
    request<ReportResponse>(`/api/cycles/${cycleId}/report/generate`, { method: "POST" }),

  exportReportPdf: (cycleId: string) =>
    download(`/api/cycles/${cycleId}/report/export`, "ICAAP_Report_2026.pdf"),
};
