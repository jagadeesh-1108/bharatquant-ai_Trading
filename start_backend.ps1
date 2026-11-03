Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting BharatQuant AI Backend Server (FastAPI)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
