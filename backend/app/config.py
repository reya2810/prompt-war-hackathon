import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SkillPath AI"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skillpath.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "skillpath-hackathon-supersecret-jwt-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock") # mock | gemini | anthropic
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

settings = Settings()

