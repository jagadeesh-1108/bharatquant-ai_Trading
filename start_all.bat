@echo off
title BharatQuant AI - Launcher
echo ========================================================
echo   Launching BharatQuant AI (Backend + Frontend)
echo ========================================================
start "BharatQuant Backend (FastAPI)" cmd /k "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "BharatQuant Frontend (Next.js)" cmd /k "%~dp0start_frontend.bat"
echo.
echo Both servers have been launched in separate windows!
echo - Backend API:    http://127.0.0.1:8000/api/v1/docs
echo - Web Terminal:   http://localhost:3000
echo ========================================================
pause
