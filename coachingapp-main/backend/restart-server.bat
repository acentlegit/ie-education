@echo off
echo Stopping backend server...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *server.js*" 2>nul
timeout /t 2 /nobreak >nul
echo Starting backend server...
cd /d "%~dp0"
node server.js









