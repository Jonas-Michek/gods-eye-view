@echo off
title Gods Eye View - Local Dev Server
cd /d "%~dp0"

echo ===================================================
echo       God's Eye View - Local Development
echo ===================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [CHYBA] Node.js neni nainstalovan nebo neni v PATH!
    echo Prosim nainstalujte Node.js 24 z https://nodejs.org
    pause
    exit /b 1
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] Slozka node_modules nebyla nalezena.
    echo [INFO] Instaluji zavislosti (npm install)...
    echo.
    set PUPPETEER_SKIP_DOWNLOAD=true
    call npm install
    if %errorlevel% neq 0 (
        echo [CHYBA] Instalace zavislosti selhala!
        pause
        exit /b 1
    )
    echo [OK] Zavislosti uspesne nainstalovany.
    echo.
)

:: Wait 3 seconds in background and open browser
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:4173"

echo [START] Spoustim vyvojovy server (npm run dev)...
echo Server bude bezet na http://localhost:4173
echo (Pro ukonceni stisknete Ctrl+C)
echo.

npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [CHYBA] Server byl neocekavane ukoncen.
    pause
)
