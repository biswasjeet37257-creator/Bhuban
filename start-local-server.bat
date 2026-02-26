@echo off
setlocal
cd /d "%~dp0"
set PORT=5000

echo.
echo =============================================
echo  Bhuban Local Server - http://localhost:%PORT%/
echo =============================================
echo.

where python >nul 2>&1
if %ERRORLEVEL%==0 (
  echo Starting Python HTTP server...
  python -m http.server %PORT%
  goto :eof
)

where py >nul 2>&1
if %ERRORLEVEL%==0 (
  echo Starting Python (py) HTTP server...
  py -m http.server %PORT%
  goto :eof
)

where node >nul 2>&1
if %ERRORLEVEL%==0 (
  echo Node found. Starting http-server via npx...
  npx --yes http-server . -p %PORT%
  goto :eof
)

echo.
echo Could not find Python or Node in PATH.
echo Please install Python 3 (recommended) or Node.js.
echo.
pause
endlocal
