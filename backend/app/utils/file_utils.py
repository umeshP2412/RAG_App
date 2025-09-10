import os
import uuid
import shutil
import logging
from typing import List, Dict, Any, Optional, Tuple
from fastapi import UploadFile

from app.core.config import settings

logger = logging.getLogger(__name__)

def save_upload_file(upload_file: UploadFile) -> Tuple[str, int]:
    """
    Save an uploaded file to the uploads directory
    
    Args:
        upload_file: The file to save
        
    Returns:
        Tuple of (file_path, file_size)
    """
    try:
        # Create a unique filename to avoid collisions
        filename = upload_file.filename
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            shutil.copyfileobj(upload_file.file, f)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        return file_path, file_size
    
    except Exception as e:
        logger.error(f"Error saving file {upload_file.filename}: {str(e)}")
        raise

def get_file_extension(filename: str) -> str:
    """
    Get the file extension from a filename
    
    Args:
        filename: The filename
        
    Returns:
        The file extension (lowercase)
    """
    return os.path.splitext(filename)[1].lower()
