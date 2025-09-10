from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    text: str
    use_web_search: bool = False


class ChatResponse(BaseModel):
    reply: str
    sources: Optional[List[Dict[str, Any]]] = None


class FileListResponse(BaseModel):
    files: List[Dict[str, Any]]


class UploadResponse(BaseModel):
    message: str
    files: List[Dict[str, Any]]
