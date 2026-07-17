# RAGulator Audit Backend

Python API for ICAAP document ingestion and RAG analysis.

## Stack

- **FastAPI** — REST API
- **PyMuPDF** — PDF text extraction
- **FastEmbed** — local embeddings
- **Qdrant** — vector store (local path mode)
- **LlamaIndex** — chunking, indexing, retrieval

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

API runs at `http://127.0.0.1:8000`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/cycles/default` | Get/create default audit cycle |
| POST | `/api/cycles/{id}/documents` | Upload document (multipart) |
| GET | `/api/cycles/{id}/pipeline` | Processing pipeline status |
| POST | `/api/cycles/{id}/analyze` | Run ICAAP analysis |
| POST | `/api/cycles/{id}/query` | RAG question answering |
| GET | `/api/cycles/{id}/report` | Generated ICAAP report |

## Supported uploads

PDF, DOCX, XLSX, TXT, CSV (max 50MB)
