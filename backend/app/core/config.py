import os
from typing import Dict, Any
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "RAG Backend API"
    
    # File upload settings
    UPLOAD_DIR: str = os.path.abspath("uploads")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Vector DB settings
    VECTOR_DB_PATH: str = os.path.abspath("data/chroma_db")
    
    # OpenAI settings (fill these in your .env file)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Session settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-sessions")
    SESSION_COOKIE_NAME: str = "rag_session"
    
    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:5173"]
    
    # Web search settings
    ENABLE_WEB_SEARCH: bool = True
    
    # Model settings
    MODEL_NAME: str = "gpt-3.5-turbo"
    EMBEDDING_MODEL_NAME: str = "text-embedding-ada-002"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Create upload and vector DB directories if they don't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)
