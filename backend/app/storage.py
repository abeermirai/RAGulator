from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.config import settings
from app.models import AuditCycle, DocumentRecord


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M:%S")


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class CycleStore:
    def __init__(self) -> None:
        self._path = settings.cycles_db
        self._cycles: dict[str, AuditCycle] = {}
        self._documents: dict[str, DocumentRecord] = {}
        self._load()

    def _load(self) -> None:
        if not self._path.exists():
            return
        raw = json.loads(self._path.read_text(encoding="utf-8"))
        for item in raw.get("cycles", []):
            cycle = AuditCycle.model_validate(item)
            self._cycles[cycle.id] = cycle
        for item in raw.get("documents", []):
            doc = DocumentRecord.model_validate(item)
            self._documents[doc.id] = doc

    def _save(self) -> None:
        payload = {
            "cycles": [c.model_dump() for c in self._cycles.values()],
            "documents": [d.model_dump() for d in self._documents.values()],
        }
        self._path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def create_cycle(self, name: str) -> AuditCycle:
        cycle = AuditCycle(id=str(uuid.uuid4()), name=name, created_at=_iso_now())
        self._cycles[cycle.id] = cycle
        self._save()
        return cycle

    def get_cycle(self, cycle_id: str) -> AuditCycle | None:
        return self._cycles.get(cycle_id)

    def get_or_create_default(self) -> AuditCycle:
        if not self._cycles:
            return self.create_cycle("ICAAP 2026")
        # Use the cycle with the most recently uploaded document
        def latest_upload(cycle: AuditCycle) -> str:
            docs = self.list_documents(cycle.id)
            if not docs:
                return cycle.created_at
            return max(d.uploaded_at for d in docs)

        return max(self._cycles.values(), key=latest_upload)

    def add_document(self, doc: DocumentRecord) -> None:
        self._documents[doc.id] = doc
        cycle = self._cycles.get(doc.cycle_id)
        if cycle and doc.id not in cycle.document_ids:
            cycle.document_ids.append(doc.id)
        self._save()

    def update_document(self, doc: DocumentRecord) -> None:
        self._documents[doc.id] = doc
        self._save()

    def delete_document(self, doc_id: str) -> None:
        doc = self._documents.pop(doc_id, None)
        if not doc:
            return
        cycle = self._cycles.get(doc.cycle_id)
        if cycle and doc_id in cycle.document_ids:
            cycle.document_ids.remove(doc_id)
        self._save()

    def list_documents(self, cycle_id: str) -> list[DocumentRecord]:
        return [self._documents[did] for did in self._cycles.get(cycle_id, AuditCycle(id="", name="", created_at="")).document_ids if did in self._documents]

    def get_document(self, doc_id: str) -> DocumentRecord | None:
        return self._documents.get(doc_id)

    def set_analysis_ready(self, cycle_id: str, ready: bool) -> None:
        cycle = self._cycles.get(cycle_id)
        if cycle:
            cycle.analysis_ready = ready
            self._save()


store = CycleStore()
