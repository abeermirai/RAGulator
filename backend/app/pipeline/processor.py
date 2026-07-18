from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.config import settings
from app.models import (
    DocumentRecord,
    DocumentStatus,
    DocumentZone,
    ProcessingStage,
    STAGE_ORDER,
    StageProgress,
)
from app.pipeline.extractor import extract_text
from app.pipeline.rag import rag_service
from app.storage import store


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M:%S")


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _stage_state(current: ProcessingStage, target: ProcessingStage) -> str:
    current_idx = STAGE_ORDER.index(current)
    target_idx = STAGE_ORDER.index(target)
    if target_idx < current_idx:
        return "done"
    if target_idx == current_idx:
        return "done" if current == ProcessingStage.ready else "running"
    return "pending"


def _build_stages(current: ProcessingStage) -> list[StageProgress]:
    stages: list[StageProgress] = []
    for stage in STAGE_ORDER:
        state = _stage_state(current, stage)
        progress = 100 if state == "done" else 62 if state == "running" else 0
        stages.append(
            StageProgress(
                stage=stage,
                state=state,
                progress=progress,
                timestamp=_now() if state != "pending" else None,
            )
        )
    return stages


async def process_document(doc_id: str, file_path: Path) -> None:
    doc = store.get_document(doc_id)
    if not doc:
        return

    try:
        doc.status = DocumentStatus.processing
        doc.progress = 5
        doc.stages = _build_stages(ProcessingStage.uploading)
        store.update_document(doc)
        await asyncio.sleep(0.2)

        doc.stages = _build_stages(ProcessingStage.extracting)
        doc.progress = 20
        store.update_document(doc)
        extracted = await asyncio.to_thread(extract_text, file_path)

        doc.stages = _build_stages(ProcessingStage.ocr)
        doc.progress = 35
        store.update_document(doc)
        await asyncio.sleep(0.1)

        doc.stages = _build_stages(ProcessingStage.chunking)
        doc.progress = 50
        store.update_document(doc)

        doc.stages = _build_stages(ProcessingStage.embedding)
        doc.progress = 65
        store.update_document(doc)

        chunk_count = await asyncio.to_thread(
            rag_service.index_document,
            doc.cycle_id,
            doc.id,
            doc.filename,
            doc.zone.value,
            extracted,
        )

        doc.stages = _build_stages(ProcessingStage.indexing)
        doc.progress = 85
        doc.chunk_count = chunk_count
        store.update_document(doc)
        await asyncio.sleep(0.1)

        doc.stages = _build_stages(ProcessingStage.kb_updated)
        doc.progress = 95
        store.update_document(doc)

        doc.stages = _build_stages(ProcessingStage.ready)
        doc.status = DocumentStatus.ready
        doc.progress = 100
        store.update_document(doc)
        store.set_analysis_ready(doc.cycle_id, True)
    except Exception as exc:  # noqa: BLE001
        doc.status = DocumentStatus.failed
        doc.error = str(exc)
        doc.progress = 0
        store.update_document(doc)


def create_document_record(
    cycle_id: str,
    filename: str,
    zone: DocumentZone,
    content_type: str,
    size_bytes: int,
) -> DocumentRecord:
    return DocumentRecord(
        id=str(uuid.uuid4()),
        cycle_id=cycle_id,
        filename=filename,
        zone=zone,
        content_type=content_type,
        size_bytes=size_bytes,
        status=DocumentStatus.queued,
        progress=0,
        stages=_build_stages(ProcessingStage.uploading),
        uploaded_at=_iso_now(),
    )
