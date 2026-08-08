import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock")  # options: mock, openai, gemini, groq, ollama
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./knowledge_base.db")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    VECTOR_STORE_DIR: str = os.getenv("VECTOR_STORE_DIR", "./vector_store")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure storage directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_STORE_DIR, exist_ok=True)
