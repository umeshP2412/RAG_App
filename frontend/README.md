RAG Frontend (Vite + React + Tailwind CSS)

This is a modern frontend for a RAG (Retrieval Augmented Generation) application, supporting uploading PDF/CSV/Excel/TXT files and a chat UI that posts to the backend endpoints:
- POST /api/upload  -- form-data; field name: files
- POST /api/chat    -- JSON { text }

## Features
- 📁 Upload documents (PDF, CSV, Excel, TXT)
- 💬 Chat interface to query your documents
- 🌙 Dark/light mode toggle
- 🎨 Modern UI with Tailwind CSS
- 🔌 Ready to connect to a FastAPI backend

## Quick start (Windows PowerShell)

1. cd into the frontend folder

```powershell
cd d:\Tech\Programs\AI_ML\RAG_UI_and_Backend\frontend
npm install
npm run dev
```

2. Open http://localhost:5173

## Development Notes

- The frontend expects a FastAPI backend at `/api/*`. The Vite development server is configured to proxy these requests to http://localhost:8000.
- To change the backend URL, edit the `vite.config.js` file.
- Dark mode preference is saved to localStorage and respects user's system preferences on first load.
