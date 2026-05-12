# Usage: .\ngrok-start.ps1
# Starts an ngrok tunnel to the local Herd site.
# After it starts, copy the https://....ngrok-free.dev URL into
# Frontend-Vercel/src/main.js and push to trigger a Vercel redeploy.

$ngrok = "C:\Users\tudor\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"

# Kill any existing ngrok process first
Get-Process | Where-Object { $_.Name -like "*ngrok*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "Starting ngrok tunnel for MPP-BarberApp.test ..." -ForegroundColor Cyan
& $ngrok http --host-header="MPP-BarberApp.test" "http://127.0.0.1:80"
