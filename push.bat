@echo off
title Gods Eye View - Git Push
cd /d "%~dp0"

echo ===================================================
echo       God's Eye View - Push zmen na GitHub
echo ===================================================
echo.

:: Kontrola gitu
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [CHYBA] Git neni nainstalovan nebo neni v PATH!
    pause
    exit /b 1
)

:: Zobrazeni zmen
echo [INFO] Aktualni stav souboru (git status):
echo -----------------------------------------
git status -s
echo -----------------------------------------
echo.

set /p COMMIT_MSG="Zadej zpravu pro commit (napr. 'nova featura'): "
if "%COMMIT_MSG%"=="" (
    echo [CHYBA] Zprava pro commit nesmi byt prazdna!
    pause
    exit /b 1
)

echo.
echo [1/3] Pridavam zmeny (git add .)...
git add .

echo [2/3] Vytvarim commit...
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo [INFO] Zadne nove zmeny k ulozeni nebo nastala chyba.
    pause
    exit /b 0
)

echo [3/3] Pushuji na GitHub (git push origin main)...
git push origin main
if %errorlevel% neq 0 (
    echo [CHYBA] Push na GitHub selhal! Zkontrolujte pripojeni nebo prava.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo [OK] Uspesne pushnuto na GitHub!
echo Nyni se staci pripojit na Linux server a spustit:
echo    ./update.sh
echo ===================================================
echo.
pause
