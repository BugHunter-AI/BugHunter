@echo off
TITLE BugHunter AI - Production Launch System
echo 🔍 Initializing BugHunter AI (Full Version)...
echo ---------------------------------------

cd backend

:: 1. Install dependencies
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    cmd /c npm install
)

:: 2. Ensure Playwright Browsers are installed (Crucial for "Full Version")
if not exist "%USERPROFILE%\AppData\Local\ms-playwright\" (
    echo 🌐 Downloading Browser Engines (One-time setup, please wait)...
    cmd /c npx playwright install
)

:: 3. Check for .env file
if not exist ".env" (
    echo ⚠️  WARNING: .env file missing! Creating a template...
    echo OPENAI_API_KEY=YOUR_KEY_HERE > .env
    echo PORT=3000 >> .env
    echo 🛑 ACTION REQUIRED: Open "backend/.env" and add your OpenAI Key!
)

:: 4. Start the backend
echo 📡 Starting AI Analysis Engine...
start cmd /k "node server.js"

:: 5. Open the Site
echo 🎨 Opening Dashboard...
start ../index.html

echo ---------------------------------------
echo ✅ SYSTEM LIVE!
echo Keep the black window open while using the site.
echo ---------------------------------------
pause
