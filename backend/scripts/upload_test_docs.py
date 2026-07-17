#!/usr/bin/env python3
"""Upload all PDFs from a folder into the default audit cycle."""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import httpx

ZONE_MAP = {
    "audit_report": "previous_icaap",
    "documentation": "financial_statements",
    "modelling": "financial_statements",
    "pillar": "financial_statements",
    "disclosure": "financial_statements",
    "guidelines": "regulatory_policies",
    "eba": "regulatory_policies",
    "icaap": "regulatory_policies",
}


def guess_zone(filename: str) -> str:
    lower = filename.lower()
    for key, zone in ZONE_MAP.items():
        if key in lower:
            return zone
    return "general"


def main() -> int:
    parser = argparse.ArgumentParser(description="Bulk upload audit PDFs")
    parser.add_argument("folder", type=Path, help="Folder containing PDF files")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    args = parser.parse_args()

    folder: Path = args.folder
    if not folder.is_dir():
        print(f"Folder not found: {folder}", file=sys.stderr)
        return 1

    pdfs = sorted(folder.glob("*.pdf"))
    if not pdfs:
        print(f"No PDFs in {folder}", file=sys.stderr)
        return 1

    with httpx.Client(base_url=args.base_url, timeout=120.0) as client:
        cycle = client.get("/api/cycles/default").json()
        cycle_id = cycle["id"]
        print(f"Cycle: {cycle_id} ({cycle['name']})")

        for pdf in pdfs:
            zone = guess_zone(pdf.name)
            with pdf.open("rb") as fh:
                res = client.post(
                    f"/api/cycles/{cycle_id}/documents",
                    data={"zone": zone},
                    files={"file": (pdf.name, fh, "application/pdf")},
                )
            res.raise_for_status()
            doc = res.json()
            print(f"  uploaded {pdf.name} -> {doc['id']} ({zone})")

        print("Waiting for processing...")
        for _ in range(60):
            pipeline = client.get(f"/api/cycles/{cycle_id}/pipeline").json()
            progress = pipeline["progress"]
            ready = pipeline["ready"]
            print(f"  progress: {progress}% ready={ready}")
            if ready:
                break
            time.sleep(2)

        print("\n=== ANALYZE ===")
        analyze = client.post(f"/api/cycles/{cycle_id}/analyze").json()
        print("Findings:", analyze["findings"]["findings"][0]["body"][:200], "...")

        print("\n=== SAMPLE QUERY ===")
        q = client.post(
            f"/api/cycles/{cycle_id}/query",
            json={"question": "What is the Capital Adequacy Ratio and credit concentration in real estate?"},
        ).json()
        print("Q:", q["question"])
        print("A:", q["answer"][:400], "...")
        print("Confidence:", q["confidence"], "%")

        print("\n=== REPORT SECTIONS ===")
        report = client.get(f"/api/cycles/{cycle_id}/report").json()
        for sec in report["sections"]:
            print(f"- {sec['title']}: {sec['body'][:160]}...")

        export = client.get(f"/api/cycles/{cycle_id}/report/export")
        export.raise_for_status()
        out = folder / "ICAAP_Generated_Report.pdf"
        out.write_bytes(export.content)
        print(f"\nExported PDF -> {out} ({len(export.content)} bytes)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
