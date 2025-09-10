from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response
import logging

from app.models.api import ChatRequest, ChatResponse
from app.services.session_manager import session_manager
from app.services.rag_service import RagService

router = APIRouter()
logger = logging.getLogger(__name__)
rag_service = RagService()

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: Request,
    response: Response,
    chat_request: ChatRequest
):
    """
    Chat with the RAG system
    """
    # Get session
    session = session_manager.get_session(request)
    
    # Set session cookie
    session_manager.set_session_cookie(response, session)
    
    # Check if the session has files/collection
    if not session.collection_name or not session.uploaded_files:
        raise HTTPException(status_code=400, detail="No files have been uploaded yet. Please upload files first.")
    
    # Get chat history
    chat_history = session.get_chat_history()
    
    # Add user message to history
    session_manager.add_chat_message(session, "user", chat_request.text)
    
    # Query RAG system
    answer, sources = rag_service.query(
        query=chat_request.text,
        collection_name=session.collection_name,
        chat_history=chat_history,
        use_web_search=chat_request.use_web_search
    )
    
    # Add assistant message to history
    session_manager.add_chat_message(session, "assistant", answer)
    
    # Build response
    chat_response = ChatResponse(
        reply=answer,
        sources=sources
    )
    
    return chat_response
