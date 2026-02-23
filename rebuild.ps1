Write-Host "--- Automated Rebuild Process ---" -ForegroundColor Cyan

# Backend Operations
Write-Host "`n1. Clearing Backend Cache & Config..." -ForegroundColor Yellow
Set-Location "backend"
php artisan optimize:clear
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend optimization failed!"
    exit 1
}
Set-Location ".."

# Frontend Operations
Write-Host "`n2. Building Frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed!"
    exit 1
}

Write-Host "`n--- Rebuild Complete Successfully! ---" -ForegroundColor Green
