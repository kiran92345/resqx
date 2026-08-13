@echo off
echo Starting ResQ-X Backend...
cd backend

IF NOT EXIST "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing requirements...
pip install -r requirements.txt

IF NOT EXIST ".env" (
    echo Copying .env.example to .env...
    copy .env.example .env
)

echo Running database seeder (this may fail if MongoDB is not running)...
python seed.py

echo Starting FastAPI server...
uvicorn app.main:app --reload --port 8000
pause
