Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting BharatQuant AI Frontend (Next.js 15)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
npm run dev
