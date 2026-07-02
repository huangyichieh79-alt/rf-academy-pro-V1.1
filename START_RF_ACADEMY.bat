@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE_EXE%" if "%NODE_EXE%" NEQ "node" (
  echo Node.js was not found. Install Node.js 18 or later, then run this file again.
  pause
  exit /b 1
)

set RF_OPEN_BROWSER=1
"%NODE_EXE%" scripts\serve.js
if errorlevel 1 pause
