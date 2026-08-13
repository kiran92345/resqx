@echo off
echo Starting ResQ-X Frontend...
cd frontend

IF NOT EXIST "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Starting Vite development server...
call npm run dev
pause
