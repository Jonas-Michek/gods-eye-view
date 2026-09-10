@echo off
rem worldview — CLI launcher for God's Eye View on Windows
rem Focuses on Areál Matfyzu v Troji with 3D Google Photorealistic tiles and PID transit layer.
setlocal enabledelayedexpansion

set "PORT="
set "HOST=localhost"
set "OPEN_BROWSER=0"

:parse_args
if "%~1"=="" goto after_args
if /i "%~1"=="-p" set "PORT=%~2" & shift & shift & goto parse_args
if /i "%~1"=="--port" set "PORT=%~2" & shift & shift & goto parse_args
if /i "%~1"=="-H" set "HOST=%~2" & shift & shift & goto parse_args
if /i "%~1"=="--host" set "HOST=%~2" & shift & shift & goto parse_args
if /i "%~1"=="-o" set "OPEN_BROWSER=1" & shift & goto parse_args
if /i "%~1"=="--open" set "OPEN_BROWSER=1" & shift & goto parse_args
if /i "%~1"=="-h" goto show_help
if /i "%~1"=="--help" goto show_help
shift
goto parse_args

:show_help
echo Usage: worldview [OPTIONS]
echo.
echo Outputs the URL to the running God's Eye View server focused on
echo Matfyz Troja campus (Prague) with 3D Google Tiles and PID transit layer enabled.
echo.
echo Options:
echo   -p, --port ^<port^>    Specify server port (default: 4173)
echo   -H, --host ^<host^>    Specify server host (default: localhost)
echo   -o, --open           Open URL directly in default browser
echo   -h, --help           Show this help message
exit /b 0

:after_args
if "%PORT%"=="" set "PORT=4173"

set "URL=http://%HOST%:%PORT%/#v=2^&lat=50.1159^&lon=14.4498^&alt=500^&heading=0^&pitch=-35^&roll=0^&map=photoreal^&l=p"

if "%OPEN_BROWSER%"=="1" (
  start "" "%URL%"
)

echo %URL%
exit /b 0
