from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid


class UserSession:
    def __init__(self, session_id: str = None):
        self.session_id = session_id or str(uuid.uuid4())
        self.created_at = datetime.now()
        self.last_active = datetime.now()
        self.uploaded_files: List[Dict[str, Any]] = []
        self.chat_history: List[Dict[str, Any]] = []
        self.collection_name: Optional[str] = None
    
    def add_file(self, filename: str, file_path: str, file_type: str, file_size: int) -> None:
        """Add a file to the session's uploaded files list"""
        file_info = {
            "name": filename,
            "path": file_path,
            "type": file_type,
            "size": file_size,
            "uploaded_at": datetime.now().isoformat()
        }
        self.uploaded_files.append(file_info)
        self.last_active = datetime.now()
    
    def get_files(self) -> List[Dict[str, Any]]:
        """Get all uploaded files in the session"""
        return self.uploaded_files
    
    def add_chat_message(self, role: str, content: str, metadata: Dict[str, Any] = None) -> None:
        """Add a chat message to the session history"""
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        self.chat_history.append(message)
        self.last_active = datetime.now()
    
    def get_chat_history(self) -> List[Dict[str, Any]]:
        """Get the chat history for the session"""
        return self.chat_history
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert session to dictionary for serialization"""
        return {
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat(),
            "last_active": self.last_active.isoformat(),
            "uploaded_files": self.uploaded_files,
            "chat_history": self.chat_history,
            "collection_name": self.collection_name
        }
