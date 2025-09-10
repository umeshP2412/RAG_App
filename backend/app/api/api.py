from fastapi import APIRouter

from app.api.endpoints import files, chat

api_router = APIRouter()
api_router.include_router(files.router, tags=["files"])
api_router.include_router(chat.router, tags=["chat"])
