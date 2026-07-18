from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class DocumentZone(str, Enum):
    previous_icaap = "previous_icaap"
    financial_statements = "financial_statements"
    regulatory_policies = "regulatory_policies"
    general = "general"


class ProcessingStage(str, Enum):
    uploading = "uploading"
    extracting = "extracting"
    ocr = "ocr"
    chunking = "chunking"
    embedding = "embedding"
    indexing = "indexing"
    kb_updated = "kb_updated"
    ready = "ready"


class DocumentStatus(str, Enum):
    queued = "queued"
    processing = "processing"
    ready = "ready"
    failed = "failed"


STAGE_ORDER: list[ProcessingStage] = [
    ProcessingStage.uploading,
    ProcessingStage.extracting,
    ProcessingStage.ocr,
    ProcessingStage.chunking,
    ProcessingStage.embedding,
    ProcessingStage.indexing,
    ProcessingStage.kb_updated,
    ProcessingStage.ready,
]


class StageProgress(BaseModel):
    stage: ProcessingStage
    state: str
    progress: int = 0
    timestamp: str | None = None


class DocumentRecord(BaseModel):
    id: str
    cycle_id: str
    filename: str
    zone: DocumentZone
    content_type: str
    size_bytes: int
    status: DocumentStatus = DocumentStatus.queued
    progress: int = 0
    stages: list[StageProgress] = Field(default_factory=list)
    chunk_count: int = 0
    uploaded_at: str
    error: str | None = None


class AuditCycle(BaseModel):
    id: str
    name: str
    created_at: str
    document_ids: list[str] = Field(default_factory=list)
    analysis_ready: bool = False


class Citation(BaseModel):
    document_id: str
    filename: str
    page: int
    chunk_id: str
    quote: str
    score: float


class QueryResponse(BaseModel):
    question: str
    answer: str
    confidence: int
    citations: list[Citation]
    highlights: list[str] = Field(default_factory=list)


class Finding(BaseModel):
    category: str
    title: str
    body: str
    severity: str = "info"


class FindingsResponse(BaseModel):
    findings: list[Finding]
    compliance: list[Finding]
    missing: list[Finding]
    suggestions: list[Finding]
    confidence: int


class ReportSection(BaseModel):
    title: str
    body: str


class ReportResponse(BaseModel):
    title: str
    meta: str
    sections: list[ReportSection]
    checklist: list[str]
    confidence: int
    compliant: bool
    compliant_title: str
    compliant_body: str


class PipelineResponse(BaseModel):
    progress: int
    stages: list[StageProgress]
    ready: bool


class CreateCycleRequest(BaseModel):
    name: str = "ICAAP 2026"


class QueryRequest(BaseModel):
    question: str


class AnalyzeResponse(BaseModel):
    ready: bool
    findings: FindingsResponse
    sample_query: QueryResponse | None = None
