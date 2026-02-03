# 🚀 BugHunter AI Backend - Quick Start

## ⚡ **Get Started in 5 Minutes**

### **Step 1: Install Dependencies**
```bash
cd backend
npm install
```

This will install:
- Express (web server)
- Playwright (browser automation)
- OpenAI (AI features)
- And more...

### **Step 2: Set Up Environment Variables**
```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your API keys
# At minimum, you need:
# - OPENAI_API_KEY (from openai.com)
```

### **Step 3: Test Bug Detection**
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

Server will run on: http://localhost:3000

---

## 📋 **What's Included**

### **Files:**
- `package.json` - Dependencies
- `.env.example` - Configuration template
- `test-scan.js` - Test script
- `server.js` - API server (you'll create this)
- `bugDetector.js` - Bug detection logic (you'll create this)
- `aiAnalyzer.js` - AI analysis (you'll create this)

### **Features to Build:**
1. ✅ URL scanning
2. ✅ Bug detection (console errors, broken links, etc.)
3. ✅ Screenshot capture
4. ✅ AI-powered analysis
5. ✅ Bug reports
6. ✅ User authentication
7. ✅ Payment processing

---

## 🎯 **Your Development Timeline**

### **Week 1: Core Features**
- Day 1-2: Set up environment
- Day 3-4: Build bug detector
- Day 5-6: Add AI analysis
- Day 7: Testing

### **Week 2: Integration**
- Day 8-9: Connect frontend
- Day 10-11: Add authentication
- Day 12-13: Add payments
- Day 14: Deploy

---

## 💰 **API Costs**

### **Per Scan:**
- Playwright: Free
- OpenAI API: ~$0.01-0.05 per scan
- Storage: Minimal

### **Monthly (100 scans):**
- OpenAI: ~$5-10
- Hosting: $20
- Database: Free (MongoDB Atlas)
- **Total: ~$25-30/month**

### **Break-even:**
Just 1 customer at $99/month!

---

## 🔧 **API Endpoints to Build**

### **Authentication:**
```
POST /api/auth/register - Create account
POST /api/auth/login - Sign in
GET /api/auth/me - Get current user
```

### **Scanning:**
```
POST /api/scan - Scan a website
GET /api/scans - Get scan history
GET /api/scans/:id - Get specific scan
```

### **Payments:**
```
POST /api/create-checkout - Create Stripe session
POST /api/webhook - Handle Stripe webhooks
GET /api/subscription - Get subscription status
```

---

## 📊 **Testing Your API**

### **Test Health Check:**
```bash
curl http://localhost:3000/api/health
```

### **Test Scan:**
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## 🚨 **Common Issues**

### **"Cannot find module 'playwright'"**
```bash
npm install
```

### **"OPENAI_API_KEY is not defined"**
```bash
# Create .env file and add your API key
echo OPENAI_API_KEY=sk-your-key-here > .env
```

### **"Port 3000 is already in use"**
```bash
# Change PORT in .env
echo PORT=3001 >> .env
```

---

## 📚 **Resources**

### **Documentation:**
- Playwright: https://playwright.dev
- OpenAI: https://platform.openai.com/docs
- Express: https://expressjs.com
- Stripe: https://stripe.com/docs

### **Tutorials:**
- Playwright automation
- OpenAI API usage
- Express REST API
- Stripe subscriptions

---

## 🎉 **You're Ready!**

**Next steps:**
1. Run `npm install`
2. Set up `.env` file
3. Run `npm test` to verify
4. Start building!

**Questions? Check NEXT_STEPS.md in the parent folder!**
