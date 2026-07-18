from __future__ import annotations

import json
import logging
from typing import Literal

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

Provider = Literal["openai", "ollama", "extractive"]


class LlmService:
    def __init__(self) -> None:
        self.provider = self._resolve_provider()

    def _resolve_provider(self) -> Provider:
        forced = settings.llm_provider.lower()
        if forced == "extractive":
            return "extractive"
        if forced == "openai" or (forced == "auto" and settings.openai_api_key):
            if settings.openai_api_key:
                return "openai"
        if forced in {"ollama", "auto"} and settings.ollama_enabled:
            return "ollama"
        return "extractive"

    @property
    def info(self) -> dict[str, str | bool]:
        reachable = self.is_reachable()
        return {
            "provider": self.provider if reachable else "extractive",
            "model": settings.openai_model if self.provider == "openai" else settings.ollama_model,
            "available": reachable,
        }

    def is_reachable(self) -> bool:
        if self.provider == "extractive":
            return False
        if self.provider == "openai":
            return bool(settings.openai_api_key)
        if self.provider == "ollama":
            try:
                with httpx.Client(timeout=2.0) as client:
                    res = client.get(f"{settings.ollama_base_url.rstrip('/')}/api/tags")
                    return res.status_code == 200
            except Exception:
                return False
        return False

    def complete(self, system: str, user: str, *, max_tokens: int | None = None) -> str | None:
        max_tokens = max_tokens or settings.llm_max_tokens
        try:
            if self.provider == "openai":
                return self._openai_complete(system, user, max_tokens)
            if self.provider == "ollama":
                return self._ollama_complete(system, user, max_tokens)
        except Exception as exc:  # noqa: BLE001
            logger.warning("LLM call failed (%s): %s", self.provider, exc)
        return None

    def _openai_complete(self, system: str, user: str, max_tokens: int) -> str:
        headers = {
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.openai_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": settings.llm_temperature,
            "max_tokens": max_tokens,
        }
        with httpx.Client(timeout=settings.llm_timeout) as client:
            res = client.post(f"{settings.openai_base_url.rstrip('/')}/chat/completions", headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            return str(data["choices"][0]["message"]["content"]).strip()

    def _ollama_complete(self, system: str, user: str, max_tokens: int) -> str:
        payload = {
            "model": settings.ollama_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "stream": False,
            "options": {"temperature": settings.llm_temperature, "num_predict": max_tokens},
        }
        with httpx.Client(timeout=settings.llm_timeout) as client:
            res = client.post(f"{settings.ollama_base_url.rstrip('/')}/api/chat", json=payload)
            res.raise_for_status()
            data = res.json()
            return str(data["message"]["content"]).strip()

    def synthesize_answer(self, question: str, contexts: list[str], fallback: str) -> str:
        if self.provider == "extractive":
            return fallback
        context_block = "\n\n".join(f"- {c}" for c in contexts[:5])
        system = (
            "You are AIdit, an ICAAP audit assistant for Alinma Bank. "
            "Answer ONLY from the provided evidence. Respond in the same language as the question "
            "(Arabic or English). Be precise, cite figures, and mention source pages when available."
        )
        user = f"Question:\n{question}\n\nEvidence:\n{context_block}\n\nProvide a concise auditor-ready answer."
        answer = self.complete(system, user, max_tokens=500)
        return answer or fallback

    def synthesize_finding(self, topic: str, contexts: list[str], fallback: str) -> str:
        if self.provider == "extractive":
            return fallback
        context_block = "\n\n".join(f"- {c[:500]}" for c in contexts[:4])
        system = (
            "You are an ICAAP auditor. Summarize one audit finding from evidence only. "
            "Use Arabic unless evidence is English-only. Max 2 sentences."
        )
        user = f"Topic: {topic}\n\nEvidence:\n{context_block}"
        answer = self.complete(system, user, max_tokens=220)
        return answer or fallback

    def synthesize_report_section(self, title: str, contexts: list[str], fallback: str) -> str:
        if self.provider == "extractive":
            return fallback
        context_block = "\n\n".join(f"- {c[:600]}" for c in contexts[:6])
        system = (
            "You write ICAAP final report sections for SAMA submission. "
            "Use formal Arabic. Base content strictly on evidence. 1-2 paragraphs."
        )
        user = f"Section: {title}\n\nEvidence:\n{context_block}"
        answer = self.complete(system, user, max_tokens=700)
        return answer or fallback


llm_service = LlmService()
