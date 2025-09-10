from typing import Dict, Optional, List, Any
from itsdangerous import URLSafeSerializer
from fastapi import Cookie, Request, Response
import json
import logging

from app.models.session import UserSession
from app.core.config import settings

logger = logging.getLogger(__name__)

class SessionManager:
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.cookie_name = settings.SESSION_COOKIE_NAME
        self.serializer = URLSafeSerializer(self.secret_key)
        self.sessions: Dict[str, UserSession] = {}
    
    def get_session(self, request: Request) -> UserSession:
        """Get the current session or create a new one"""
        # Try to get session from cookie
        session_cookie = request.cookies.get(self.cookie_name)
        
        if session_cookie:
            try:
                session_id = self.serializer.loads(session_cookie)
                if session_id in self.sessions:
                    return self.sessions[session_id]
                logger.warning(f"Session ID {session_id} found in cookie but not in sessions")
            except Exception as e:
                logger.error(f"Error deserializing session cookie: {e}")
        
        # Create new session if no valid session found
        new_session = UserSession()
        self.sessions[new_session.session_id] = new_session
        return new_session
    
    def set_session_cookie(self, response: Response, session: UserSession) -> None:
        """Set the session cookie in the response"""
        session_cookie = self.serializer.dumps(session.session_id)
        response.set_cookie(
            key=self.cookie_name,
            value=session_cookie,
            httponly=True,
            max_age=86400 * 7,  # 7 days
            samesite="lax"
        )
    
    def get_session_files(self, session: UserSession) -> List[Dict[str, Any]]:
        """Get files associated with the session"""
        return session.get_files()
    
    def add_file_to_session(self, session: UserSession, filename: str, file_path: str, 
                           file_type: str, file_size: int) -> None:
        """Add a file to the session"""
        session.add_file(filename, file_path, file_type, file_size)
    
    def add_chat_message(self, session: UserSession, role: str, content: str, 
                         metadata: Optional[Dict[str, Any]] = None) -> None:
        """Add a chat message to the session history"""
        session.add_chat_message(role, content, metadata)

# Global session manager instance
session_manager = SessionManager()
