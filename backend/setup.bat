@echo off
echo Setting up Python virtual environment for RAG Backend...

rem Create virtual environment if it doesn't exist
if not exist venv (
    python -m venv venv
    echo Created virtual environment
) else (
    echo Virtual environment already exists
)

rem Activate virtual environment
call venv\Scripts\activate

rem Install requirements
echo Installing dependencies...
pip install -r requirements.txt

echo Setup complete! Run the app with: python -m uvicorn main:app --reload
