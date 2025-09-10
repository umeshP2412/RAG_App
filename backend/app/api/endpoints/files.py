import os
import shutil
from typing import List, Dict, Any, Optional
from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException, 
    UploadFile, 
    File, 
    Form,
    Request,
    Response
)
import logging
import uuid

from app.models.api import UploadResponse, FileListResponse
from app.services.session_manager import session_manager
from app.services.rag_service import RagService
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)
rag_service = RagService()

@router.post("/upload", response_model=UploadResponse)
async def upload_files(
    request: Request,
    response: Response,
    files: List[UploadFile] = File(...),
):
    """
    Upload files (PDF, CSV, Excel, TXT) for RAG processing
    """
    # Get session
    session = session_manager.get_session(request)
    
    # Create collection name for this session if it doesn't exist yet
    if not session.collection_name:
        session.collection_name = f"collection_{session.session_id}"
    
    # Process each file
    processed_files = []
    all_documents = []
    
    for file in files:
        try:
            # Check file type
            filename = file.filename
            file_extension = os.path.splitext(filename)[1].lower()
            
            if file_extension not in ['.pdf', '.csv', '.txt', '.xls', '.xlsx']:
                logger.warning(f"Unsupported file type: {file_extension}")
                continue
            
            # Create a unique filename to avoid collisions
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
            
            # Save file
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
            
            # Process file for RAG
            documents = rag_service.process_file(file_path, file_extension)
            all_documents.extend(documents)
            
            # Add file to session
            file_size = os.path.getsize(file_path)
            session_manager.add_file_to_session(
                session, 
                filename, 
                file_path, 
                file_extension, 
                file_size
            )
            
            # Add to processed files list for response
            processed_files.append({
                "name": filename,
                "type": file_extension,
                "size": file_size
            })
            
            logger.info(f"Processed file: {filename}")
            
        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    
    # Create or update vector store
    if all_documents:
        rag_service.create_or_update_vectorstore(all_documents, session.collection_name)
    
    # Set session cookie
    session_manager.set_session_cookie(response, session)
    
    return UploadResponse(
        message=f"Successfully processed {len(processed_files)} files",
        files=processed_files
    )

@router.get("/files", response_model=FileListResponse)
async def get_session_files(
    request: Request,
    response: Response
):
    """
    Get all files uploaded in the current session
    """
    # Get session
    session = session_manager.get_session(request)
    
    # Set session cookie
    session_manager.set_session_cookie(response, session)
    
    # Return files
    files = session_manager.get_session_files(session)
    return FileListResponse(files=files)
