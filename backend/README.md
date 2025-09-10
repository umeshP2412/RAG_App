# RAG Backend

This is the backend for the RAG (Retrieval Augmented Generation) application. It's built with FastAPI, Langchain, and ChromaDB.

## Setup

1. Create a virtual environment and activate it:

```powershell
cd d:\Tech\Programs\AI_ML\RAG_UI_and_Backend\backend
python -m venv venv
.\venv\Scripts\activate
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run the server:

```powershell
uvicorn app.main:app --reload --port 8000
```

## Features

- File upload (PDF, CSV, Excel, TXT) and document processing
- Vector storage with ChromaDB (persistent)
- Session management for tracking uploaded files
- RAG chat with optional web search capability
