@echo off
TITLE Agritech Farm - Agricultural Intelligence Hub
COLOR 0A
cls

echo =====================================================================
echo                AGRITECH FARM - ONE-CLICK LAUNCHER
echo =====================================================================
echo.
echo Starting Agritech Farm Local Application...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.9+ and try again.
    pause
    exit /b 1
)

echo [1/3] Launching FastAPI Backend Server on http://127.0.0.1:8001 ...
start "Agritech Backend Server" /min cmd /c "python -m uvicorn backend.api.server:app --host 127.0.0.1 --port 8001 --reload"

REM Wait 2 seconds for backend initialization
timeout /t 2 /nobreak >nul

echo [2/3] Starting Frontend Web Server on http://localhost:8000 ...
start "Agritech Frontend Server" /min cmd /c "python -m http.server 8000 --directory frontend"

echo [3/3] Opening Agritech Farm in your web browser...
timeout /t 1 /nobreak >nul
start http://localhost:8000/index.html

echo.
echo =====================================================================
echo  SUCCESS! Agritech Farm is running locally.
echo  - Frontend: http://localhost:8000
echo  - Backend API: http://127.0.0.1:8001
echo  - Data.gov.in key config: api_keys.txt
echo.
echo  Keep this window open while using the application.
echo  Press Ctrl+C or close this window to stop the servers.
echo =====================================================================
echo.
pause
