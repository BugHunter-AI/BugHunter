# 🔌 BugHunter AI - Developer Integrations

Unlock the full power of BugHunter AI by integrating it directly into your workflow.

---

## 🏗️ GitHub Action Integration

Automatically audit your site on every push or deployment.

### 1. Create a Workflow File
In your repository, create a file at `.github/workflows/bughunter.yml`.

### 2. Copy & Paste this Code:

```yaml
name: BugHunter AI Audit

on:
  deployment_status:
    types: [success] # Runs after your Vercel/Netlify deploy is live
  workflow_dispatch: # Allows manual triggering

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger BugHunter AI Scan
        run: |
          curl -X POST "https://your-bughunter-api.com/api/scan" \
          -H "Content-Type: application/json" \
          -d '{
            "url": "${{ github.event.deployment_status.target_url || "https://your-site.com" }}",
            "options": {
              "checkAccessibility": true,
              "checkSEO": true,
              "checkPerformance": true
            }
          }'
```

---

## ✅ "BugHunter Verified" Badge

Show your visitors that your site is audit-proven and accessible.

### Step 1: Get your Public ID
Find your scan in the dashboard and click "Share". Copy the **Public ID**.

### Step 2: Embed the Badge
Add this to your footer:

```html
<a href="https://bughunter-ai.com/report/YOUR_ID" target="_blank">
  <img src="https://bughunter-ai.com/api/badge/YOUR_ID" alt="Verified by BugHunter AI">
</a>
```

---

## 🔌 Chrome Extension (Beta)

Debug in real-time. [Download the Extension Manifest here](./extension/manifest.json)
(Coming soon to Chrome Web Store!)
