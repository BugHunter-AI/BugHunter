# 🚀 QUICK START - Get Running in 5 Minutes!

## ✅ **What You Just Got**

I've built your complete MVP backend with:
- ✅ Express API server
- ✅ Playwright bug detection
- ✅ OpenAI AI analysis
- ✅ User authentication
- ✅ Scan history
- ✅ Statistics

## 🎯 **Get Started NOW**

### **Step 1: Install Dependencies** (3 minutes)

Open terminal in the backend folder and run:

```bash
npm install
```

This installs:
- express (web server)
- playwright (browser automation)
- openai (AI features)
- cors (cross-origin requests)
- dotenv (environment variables)

**Note:** Playwright will download browser binaries (~300MB). This is normal!

### **Step 2: Set Up Environment** (1 minute)

```bash
# Copy the example file
copy .env.example .env
```

Then edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
```

**Get your API key:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and paste into .env

### **Step 3: Test It!** (1 minute)

```bash
npm test
```

This will:
- Scan example.com
- Detect bugs
- Take a screenshot
- Show you the results

### **Step 4: Start the Server**

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║     🤖 BUGHUNTER AI - MVP BACKEND     ║
╚════════════════════════════════════════╝

🚀 Server running on: http://localhost:3000
✨ Ready to detect bugs!
```

---

## 🧪 **Test Your API**

### **1. Health Check**
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "BugHunter AI is running!",
  "version": "1.0.0"
}
```

### **2. Scan a Website**
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://example.com\"}"
```

This will:
- Scan the website
- Detect bugs
- Analyze with AI
- Return detailed results

### **3. Get Scan History**
```bash
curl http://localhost:3000/api/scans
```

### **4. Get Statistics**
```bash
curl http://localhost:3000/api/stats
```

---

## 📋 **Available Endpoints**

### **Scanning:**
- `POST /api/scan` - Scan a website
  ```json
  {
    "url": "https://example.com",
    "options": {
      "fullPageScreenshot": true,
      "checkAccessibility": true,
      "checkSEO": true,
      "checkPerformance": true
    }
  }
  ```

- `GET /api/scans` - Get all scans
- `GET /api/scans/:id` - Get specific scan

### **AI Features:**
- `POST /api/suggest-fix` - Get AI fix suggestion
  ```json
  {
    "bug": {
      "type": "console_error",
      "severity": "high",
      "message": "Uncaught TypeError..."
    }
  }
  ```

### **Authentication:**
- `POST /api/auth/register` - Create account
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "secure123"
  }
  ```

- `POST /api/auth/login` - Sign in

### **Stats:**
- `GET /api/stats` - Get platform statistics

---

## 🎨 **Connect to Frontend**

Update your frontend `app.js` to call the API:

```javascript
// Scan a website
async function scanWebsite(url) {
  const response = await fetch('http://localhost:3000/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  const data = await response.json();
  
  if (data.success) {
    displayResults(data.scan);
  }
}

// Display results
function displayResults(scan) {
  console.log('Bugs found:', scan.summary.totalBugs);
  console.log('Quality score:', scan.results.aiAnalysis?.qualityScore);
  
  // Show bugs in UI
  scan.results.bugs.forEach(bug => {
    console.log(`[${bug.severity}] ${bug.message}`);
  });
}
```

---

## 🐛 **What Gets Detected**

### **JavaScript Errors:**
- Console errors
- Page runtime errors
- Uncaught exceptions

### **Network Issues:**
- Failed requests
- Broken images
- HTTP errors (4xx, 5xx)

### **Accessibility:**
- Missing alt text
- Missing form labels
- Low contrast issues

### **SEO:**
- Missing title tag
- Missing meta description
- Missing H1 heading
- Title length issues

### **Performance:**
- Slow page load times
- Large resource sizes

---

## 💰 **Cost Breakdown**

### **Per Scan:**
- Playwright: Free
- OpenAI API: ~$0.01-0.05
- Total: ~$0.01-0.05 per scan

### **Monthly (100 scans):**
- OpenAI: ~$5-10
- Hosting: $20
- Database: Free
- **Total: ~$25-30/month**

### **Break-even:**
Just 1 customer at $99/month covers all costs!

---

## 🚨 **Troubleshooting**

### **"Cannot find module 'playwright'"**
```bash
npm install
```

### **"OPENAI_API_KEY is not defined"**
1. Create `.env` file
2. Add: `OPENAI_API_KEY=sk-your-key-here`

### **"Port 3000 already in use"**
Change port in `.env`:
```
PORT=3001
```

### **Playwright browser download fails**
```bash
npx playwright install chromium
```

### **AI analysis not working**
1. Check your OpenAI API key
2. Make sure you have credits: https://platform.openai.com/usage
3. Check the console for error messages

---

## 📊 **Example Response**

```json
{
  "success": true,
  "scan": {
    "id": "scan_1234567890_abc123",
    "url": "https://example.com",
    "timestamp": "2026-02-03T15:00:00.000Z",
    "status": "completed",
    "results": {
      "pageInfo": {
        "title": "Example Domain",
        "url": "https://example.com/",
        "imageCount": 0,
        "linkCount": 1
      },
      "bugs": [
        {
          "type": "seo_missing_description",
          "severity": "medium",
          "category": "SEO",
          "message": "Page is missing a meta description"
        }
      ],
      "screenshots": ["scan_1234567890.png"],
      "aiAnalysis": {
        "overallAssessment": "Good basic structure, minor SEO improvements needed",
        "qualityScore": 85,
        "prioritizedBugs": [...]
      }
    },
    "summary": {
      "totalBugs": 1,
      "critical": 0,
      "high": 0,
      "medium": 1,
      "low": 0
    }
  }
}
```

---

## 🎉 **You're Ready!**

Your MVP backend is complete and running!

**Next steps:**
1. ✅ Test all endpoints
2. ✅ Connect your frontend
3. ✅ Deploy to production
4. ✅ Get your first customer!

**Questions? Check the main README.md or ask for help!**

---

## 🚀 **Quick Commands Reference**

```bash
# Install
npm install

# Test
npm test

# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Check health
curl http://localhost:3000/api/health

# Scan a site
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Happy bug hunting! 🐛🔍**
