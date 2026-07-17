from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    data_dir: Path = Path(__file__).resolve().parent.parent / "data"
    uploads_dir: Path = Path(__file__).resolve().parent.parent / "data" / "uploads"
    qdrant_path: Path = Path(__file__).resolve().parent.parent / "data" / "qdrant"
    cycles_db: Path = Path(__file__).resolve().parent.parent / "data" / "cycles.json"
    embed_model: str = "BAAI/bge-small-en-v1.5"
    chunk_size: int = 512
    chunk_overlap: int = 64
    top_k: int = 5
    cors_origins: list[str] = ["http://localhost:8080", "http://127.0.0.1:8080"]


settings = Settings()
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.uploads_dir.mkdir(parents=True, exist_ok=True)
settings.qdrant_path.mkdir(parents=True, exist_ok=True)
