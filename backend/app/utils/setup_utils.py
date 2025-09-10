import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def initialize_directories():
    """Initialize required directories for the application"""
    directories = [
        settings.UPLOAD_DIR,
        settings.VECTOR_DB_PATH
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.info(f"Created directory: {directory}")
        else:
            logger.info(f"Directory already exists: {directory}")

def clean_temp_files():
    """Clean up temporary files (can be used for maintenance)"""
    # Implement any cleanup logic here
    pass
