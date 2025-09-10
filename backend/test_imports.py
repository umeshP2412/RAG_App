import sys
import os

# Print Python version and executable path
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")

# Try to import required libraries
try:
    import fastapi
    print(f"FastAPI version: {fastapi.__version__}")
except ImportError:
    print("FastAPI is not installed")

try:
    import uvicorn
    print(f"Uvicorn version: {uvicorn.__version__}")
except ImportError:
    print("Uvicorn is not installed")

# Print environment variables
print("\nEnvironment variables:")
print(f"PYTHONPATH: {os.environ.get('PYTHONPATH', 'Not set')}")

# Check if core modules can be imported
print("\nChecking app modules:")
try:
    import app.core.config
    print("Successfully imported app.core.config")
except ImportError as e:
    print(f"Failed to import app.core.config: {str(e)}")

print("\nDirectories in the current path:")
for path in sys.path:
    print(f"- {path}")
