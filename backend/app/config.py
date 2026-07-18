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

    # LLM — auto-detect OpenAI if key present, else Ollama, else extractive fallback
    llm_provider: str = "auto"  # auto | openai | ollama | extractive
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    ollama_enabled: bool = True
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.2"
    llm_temperature: float = 0.2
    llm_max_tokens: int = 800
    llm_timeout: float = 90.0
    reports_dir: Path = Path(__file__).resolve().parent.parent / "data" / "reports"


settings = Settings()
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.uploads_dir.mkdir(parents=True, exist_ok=True)
settings.qdrant_path.mkdir(parents=True, exist_ok=True)
settings.reports_dir.mkdir(parents=True, exist_ok=True)
