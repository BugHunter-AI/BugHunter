@echo off
TITLE BugHunter AI - Integrated Launch System
echo 🔍 Initializing BugHunter AI...
echo ---------------------------------------

cd backend

:: Check if node_modules exists, if not, install
if not exist "node_modules\" (
    echo 📦 Installing dependencies (First time setup)...
    cmd /c npm install
)

:: Start the backend in a new window
echo 📡 Starting AI Analysis Engine...
start cmd /k "node server.js"

:: Give the server a moment to breathe
timeout /t 3 /nobreak > nul

:: Open the Dashboard
echo 🎨 Opening Dashboard...
start ../index.html

echo ---------------------------------------
echo ✅ EVERYTHING IS LIVE! 
echo 1. The black window is your AI Engine (keep it open).
echo 2. The browser is your Command Center.
echo ---------------------------------------
pause
