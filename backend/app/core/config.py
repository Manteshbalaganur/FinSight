"""Settings loaded from backend/.env (never from the frontend)."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

PLACEHOLDER_KEYS = {"", "your_openai_api_key", "sk-your-key-here"}


class Settings:
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "").strip()
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000").strip()

    @property
    def openai_configured(self) -> bool:
        return self.openai_api_key not in PLACEHOLDER_KEYS


settings = Settings()
