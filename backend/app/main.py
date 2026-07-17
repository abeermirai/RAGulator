from __future__ import annotations

import asyncio
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.config import settings
from app.models import (
    AnalyzeResponse,
    AuditCycle,
    CreateCycleRequest,
    DocumentRecord,
    DocumentZone,
    PipelineResponse,
    ProcessingStage,
    QueryRequest,
    StageProgress,
)
from app.pipeline.processor import create_document_record, process_document
from app.pipeline.rag import rag_service
from app.storage import store

app = FastAPI(title="RAGulator Audit API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "engine": "LlamaIndex + Qdrant + FastEmbed + PyMuPDF"}


@app.post("/api/cycles", response_model=AuditCycle)
def create_cycle(body: CreateCycleRequest) -> AuditCycle:
    return store.create_cycle(body.name)


@app.get("/api/cycles/default", response_model=AuditCycle)
def get_default_cycle() -> AuditCycle:
    return store.get_or_create_default()


@app.get("/api/cycles/{cycle_id}", response_model=AuditCycle)
def get_cycle(cycle_id: str) -> AuditCycle:
    cycle = store.get_cycle(cycle_id)
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    return cycle


@app.get("/api/cycles/{cycle_id}/documents", response_model=list[DocumentRecord])
def list_documents(cycle_id: str) -> list[DocumentRecord]:
    if not store.get_cycle(cycle_id):
        raise HTTPException(status_code=404, detail="Cycle not found")
    return store.list_documents(cycle_id)


@app.post("/api/cycles/{cycle_id}/documents", response_model=DocumentRecord)
async def upload_document(
    cycle_id: str,
    background_tasks: BackgroundTasks,
    zone: DocumentZone = Form(default=DocumentZone.general),
    file: UploadFile = File(...),
) -> DocumentRecord:
    cycle = store.get_cycle(cycle_id)
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    suffix = Path(file.filename).suffix.lower()
    allowed = {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".txt", ".md", ".csv"}
    if suffix not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 50MB limit")

    doc = create_document_record(
        cycle_id=cycle_id,
        filename=file.filename,
        zone=zone,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
    )

    dest = settings.uploads_dir / cycle_id
    dest.mkdir(parents=True, exist_ok=True)
    file_path = dest / f"{doc.id}{suffix}"
    file_path.write_bytes(content)

    store.add_document(doc)
    background_tasks.add_task(process_document, doc.id, file_path)
    return doc


@app.delete("/api/cycles/{cycle_id}/documents/{doc_id}")
def delete_document(cycle_id: str, doc_id: str) -> dict[str, bool]:
    doc = store.get_document(doc_id)
    if not doc or doc.cycle_id != cycle_id:
        raise HTTPException(status_code=404, detail="Document not found")
    store.delete_document(doc_id)
    return {"deleted": True}


@app.get("/api/cycles/{cycle_id}/pipeline", response_model=PipelineResponse)
def get_pipeline(cycle_id: str) -> PipelineResponse:
    docs = store.list_documents(cycle_id)
    if not docs:
        stages = [
            StageProgress(stage=stage, state="pending", progress=0, timestamp=None)
            for stage in ProcessingStage
        ]
        return PipelineResponse(progress=0, stages=stages, ready=False)

    avg = sum(d.progress for d in docs) / len(docs)
    latest = max(docs, key=lambda d: d.progress)
    ready = all(d.status.value == "ready" for d in docs)
    return PipelineResponse(progress=int(avg), stages=latest.stages, ready=ready)


@app.post("/api/cycles/{cycle_id}/analyze", response_model=AnalyzeResponse)
def analyze_cycle(cycle_id: str) -> AnalyzeResponse:
    docs = store.list_documents(cycle_id)
    if not docs:
        raise HTTPException(status_code=400, detail="Upload at least one document first")
    if not all(d.status.value == "ready" for d in docs):
        raise HTTPException(status_code=409, detail="Documents still processing")

    findings = rag_service.build_findings(cycle_id)
    sample = rag_service.query(cycle_id, "هل يغطي رأس المال الحالي مخاطر التركز الائتماني؟")
    store.set_analysis_ready(cycle_id, True)
    return AnalyzeResponse(ready=True, findings=findings, sample_query=sample)


@app.post("/api/cycles/{cycle_id}/query")
def query_cycle(cycle_id: str, body: QueryRequest):
    docs = store.list_documents(cycle_id)
    if not docs:
        raise HTTPException(status_code=400, detail="No documents indexed")
    return rag_service.query(cycle_id, body.question)


@app.get("/api/cycles/{cycle_id}/findings")
def get_findings(cycle_id: str):
    return rag_service.build_findings(cycle_id)


@app.get("/api/cycles/{cycle_id}/report")
def get_report(cycle_id: str):
    findings = rag_service.build_findings(cycle_id)
    return rag_service.build_report(cycle_id, findings)


@app.post("/api/cycles/{cycle_id}/report/generate")
def generate_report(cycle_id: str):
    findings = rag_service.build_findings(cycle_id)
    return rag_service.build_report(cycle_id, findings)


@app.get("/api/cycles/{cycle_id}/documents/{doc_id}/download")
def download_document(cycle_id: str, doc_id: str):
    doc = store.get_document(doc_id)
    if not doc or doc.cycle_id != cycle_id:
        raise HTTPException(status_code=404, detail="Document not found")
    dest = settings.uploads_dir / cycle_id
    matches = list(dest.glob(f"{doc_id}.*"))
    if not matches:
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(matches[0], filename=doc.filename)
