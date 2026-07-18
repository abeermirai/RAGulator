export type DocumentZone =
  | "previous_icaap"
  | "financial_statements"
  | "regulatory_policies"
  | "general";

export type DocumentStatus = "queued" | "processing" | "ready" | "failed";

export type ProcessingStage =
  | "uploading"
  | "extracting"
  | "ocr"
  | "chunking"
  | "embedding"
  | "indexing"
  | "kb_updated"
  | "ready";

export interface StageProgress {
  stage: ProcessingStage;
  state: "done" | "running" | "pending";
  progress: number;
  timestamp: string | null;
}

export interface DocumentRecord {
  id: string;
  cycle_id: string;
  filename: string;
  zone: DocumentZone;
  content_type: string;
  size_bytes: number;
  status: DocumentStatus;
  progress: number;
  stages: StageProgress[];
  chunk_count: number;
  uploaded_at: string;
  error?: string | null;
}

export interface AuditCycle {
  id: string;
  name: string;
  created_at: string;
  document_ids: string[];
  analysis_ready: boolean;
}

export interface Citation {
  document_id: string;
  filename: string;
  page: number;
  chunk_id: string;
  quote: string;
  score: number;
}

export interface QueryResponse {
  question: string;
  answer: string;
  confidence: number;
  citations: Citation[];
  highlights?: string[];
}

export interface Finding {
  category: string;
  title: string;
  body: string;
  severity?: string;
}

export interface FindingsResponse {
  findings: Finding[];
  compliance: Finding[];
  missing: Finding[];
  suggestions: Finding[];
  confidence: number;
}

export interface ReportSection {
  title: string;
  body: string;
}

export interface ReportResponse {
  title: string;
  meta: string;
  sections: ReportSection[];
  checklist: string[];
  confidence: number;
  compliant: boolean;
  compliant_title: string;
  compliant_body: string;
}

export interface PipelineResponse {
  progress: number;
  stages: StageProgress[];
  ready: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: QueryResponse;
}

export interface AnalyzeResponse {
  ready: boolean;
  findings: FindingsResponse;
  sample_query?: QueryResponse | null;
}
