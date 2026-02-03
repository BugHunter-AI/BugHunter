# 📦 BugHunter AI - Deployment Guide

This guide will help you move your platform from your local machine to the real internet.

---

## 🏗️ Architecture Overview

- **Frontend**: [Vercel](https://vercel.com) (Fast, Free, and Global)
- **Backend/API**: [Railway](https://railway.app) (Handles Node.js & Playwright perfectly)
- **Database**: `db.json` (Managed by Railway volumes)

---

## 🚀 Step 1: Push to GitHub

1. Create a new private repository on GitHub named `bughunter-ai`.
2. Initialize and push your code:
   ```bash
   cd C:\Users\Tazo\.gemini\antigravity\scratch\bughunter-ai
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/yourusername/bughunter-ai.git
   git push -u origin main
   ```

---

## 📡 Step 2: Deploy Backend to Railway

Railway is the best for this because it supports **headless browsers** (Playwright) natively.

1. Go to [Railway.app](https://railway.app) and create an account.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your `bughunter-ai` repo.
4. Go to the **Variables** tab and add:
   - `OPENAI_API_KEY`: (Your key)
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://your-frontend-url.vercel.app`
5. Go to the **Settings** tab:
   - Root Directory: `backend`
   - Install Command: `npm install`
   - Start Command: `npx playwright install-deps && npm start`
6. Click **Generate Domain** to get your backend URL (e.g., `bughunter-api.up.railway.app`).

---

## 🎨 Step 3: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com).
2. Click **"Add New"** -> **"Project"**.
3. Import your GitHub repository.
4. Configuration:
   - Framework Preset: `Other`
   - Root Directory: `./` (The main folder)
5. Before deploying, update the URLs in your code:
   - Search for `http://localhost:3000` in `dashboard.js` and `app.js`.
   - Replace it with your **Railway Backend URL**.
6. Click **Deploy**.

---

## 🔐 Step 4: Final Check

1. Ensure your **Railway Domain** is added to the `.env` or variables on Vercel if needed.
2. Test the "Sign Up" flow on the live site.
3. Run a scan on the live site to ensure Playwright is working on Railway.

---

## 💰 Resource & Cost Management

- **Vercel**: Free (Hobby plan is plenty)
- **Railway**: ~$5/month (Trial credits available)
- **OpenAI**: Based on usage ($0.03 per scan avg)

**Congratulations! Your platform is live on the internet!** 🌍🚀
