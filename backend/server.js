// ===================================
// BUGHUNTER AI - MAIN SERVER
// MVP Backend with AI-powered bug detection
// ===================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { scanWebsite } = require('./bugDetector');
const { analyzeBugsWithAI, suggestFix } = require('./aiAnalyzer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Serve screenshots
app.use('/screenshots', express.static(screenshotsDir));

// In-memory storage with file persistence for MVP
const DB_FILE = path.join(__dirname, 'db.json');
let data = { scans: [], users: [] };

// Load data from file on startup
if (fs.existsSync(DB_FILE)) {
    try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        data = JSON.parse(fileContent);
        console.log(`📡 Database loaded: ${data.scans.length} scans, ${data.users.length} users.`);
    } catch (e) {
        console.error('❌ Failed to load database file, starting fresh.');
    }
}

// Helper to save data
function saveData() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('❌ Failed to save database.');
    }
}

const scans = data.scans;
const users = data.users;

// ===================================
// HEALTH CHECK
// ===================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'BugHunter AI is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// ===================================
// SCAN ENDPOINTS
// ===================================

// Start a new scan
app.post('/api/scan', async (req, res) => {
    try {
        const { url, options = {} } = req.body;

        // Validate URL
        if (!url) {
            return res.status(400).json({
                error: 'URL is required',
                message: 'Please provide a valid URL to scan'
            });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({
                error: 'Invalid URL',
                message: 'Please provide a valid URL (e.g., https://example.com)'
            });
        }

        console.log(`\n🔍 Starting scan for: ${url}`);
        console.log(`⏰ Time: ${new Date().toLocaleString()}`);

        // Perform the scan
        const scanResults = await scanWebsite(url, options);

        console.log(`✅ Scan complete: ${scanResults.bugs.length} bugs found`);

        // Analyze bugs with AI if any were found
        let aiAnalysis = null;
        if (scanResults.bugs.length > 0 && process.env.OPENAI_API_KEY) {
            console.log('🤖 Analyzing bugs with AI...');
            try {
                aiAnalysis = await analyzeBugsWithAI(scanResults.bugs, url);
                console.log('✅ AI analysis complete');
            } catch (error) {
                console.error('⚠️  AI analysis failed:', error.message);
                aiAnalysis = {
                    error: 'AI analysis unavailable',
                    message: error.message
                };
            }
        }

        // Create scan record
        const scan = {
            id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            url,
            timestamp: new Date().toISOString(),
            status: 'completed',
            results: {
                ...scanResults,
                aiAnalysis
            },
            summary: {
                totalBugs: scanResults.bugs.length,
                critical: scanResults.bugs.filter(b => b.severity === 'critical').length,
                high: scanResults.bugs.filter(b => b.severity === 'high').length,
                medium: scanResults.bugs.filter(b => b.severity === 'medium').length,
                low: scanResults.bugs.filter(b => b.severity === 'low').length
            }
        };

        // Store scan (in-memory for MVP)
        scans.push(scan);
        saveData();

        // Return results
        res.json({
            success: true,
            scan
        });

    } catch (error) {
        console.error('❌ Scan error:', error);
        res.status(500).json({
            error: 'Scan failed',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get all scans
app.get('/api/scans', (req, res) => {
    const { limit = 10, offset = 0 } = req.query;

    const paginatedScans = scans
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(offset, offset + parseInt(limit));

    res.json({
        success: true,
        scans: paginatedScans,
        total: scans.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
    });
});

// Get specific scan
app.get('/api/scans/:id', (req, res) => {
    const { id } = req.params;
    const scan = scans.find(s => s.id === id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json({ success: true, scan });
});

// Generate PDF Report (Enterprise Feature)
app.get('/api/scans/:id/pdf', async (req, res) => {
    try {
        const { id } = req.params;
        const scan = scans.find(s => s.id === id);
        if (!scan) return res.status(404).json({ error: 'Scan not found' });

        const { chromium } = require('playwright');
        const browser = await chromium.launch();
        const page = await browser.newPage();

        // Simple HTML template for the PDF
        const htmlContent = `
            <html>
                <body style="font-family: Arial, sans-serif; padding: 40px;">
                    <h1 style="color: #ec4899;">BugHunter AI - Audit Report</h1>
                    <hr/>
                    <h2>Target: ${scan.url}</h2>
                    <p>Date: ${new Date(scan.timestamp).toLocaleString()}</p>
                    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
                        <h3>Quality Score: ${scan.results.aiAnalysis?.qualityScore || 'N/A'}%</h3>
                        <p>Total Bugs: ${scan.summary.totalBugs}</p>
                    </div>
                    <h3>Bug Breakdown:</h3>
                    <ul>
                        ${scan.results.bugs.map(b => `
                            <li><strong>[${b.severity.toUpperCase()}]</strong> ${b.type}: ${b.message}</li>
                        `).join('')}
                    </ul>
                </body>
            </html>
        `;

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        res.contentType('application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ error: 'PDF generation failed' });
    }
});

// Toggle Public Share (Marketing Feature)
app.post('/api/scans/:id/share', (req, res) => {
    const { id } = req.params;
    const scan = scans.find(s => s.id === id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    scan.isPublic = !scan.isPublic;
    scan.shareToken = scan.shareToken || Math.random().toString(36).substr(2, 15);
    saveData();

    res.json({
        success: true,
        isPublic: scan.isPublic,
        shareUrl: `http://localhost:5500/share.html?token=${scan.shareToken}`
    });
});

// ===================================
// AI FIX SUGGESTIONS
// ===================================

app.post('/api/suggest-fix', async (req, res) => {
    try {
        const { bug } = req.body;

        if (!bug) {
            return res.status(400).json({
                error: 'Bug data required',
                message: 'Please provide bug information'
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(503).json({
                error: 'AI service unavailable',
                message: 'OpenAI API key not configured'
            });
        }

        console.log(`🤖 Generating fix suggestion for: ${bug.type}`);

        const fix = await suggestFix(bug);

        res.json({
            success: true,
            fix
        });

    } catch (error) {
        console.error('❌ Fix suggestion error:', error);
        res.status(500).json({
            error: 'Failed to generate fix',
            message: error.message
        });
    }
});

// ===================================
// SIMPLE AUTHENTICATION (MVP)
// ===================================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Email, name, and password are required'
            });
        }

        // Check if user exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                message: 'An account with this email already exists'
            });
        }

        // Create user (in production, hash the password!)
        const user = {
            id: `user_${Date.now()}`,
            email,
            name,
            plan: 'trial',
            trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            createdAt: new Date().toISOString(),
            scansUsed: 0,
            scansLimit: 10 // Trial limit
        };

        users.push(user);
        saveData();

        console.log(`✅ New user registered: ${email}`);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                trialEnds: user.trialEnds
            },
            message: 'Account created successfully! Your 14-day trial has started.'
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: error.message
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // In production, verify password hash!

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                trialEnds: user.trialEnds
            },
            message: 'Login successful'
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: error.message
        });
    }
});

// ===================================
// BILLING & SUBSCRIPTIONS (Stripe)
// ===================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
app.post('/api/create-checkout', async (req, res) => {
    try {
        const { planId, email } = req.body;

        const priceIds = {
            starter: process.env.STRIPE_PRICE_STARTER,
            pro: process.env.STRIPE_PRICE_PRO,
            business: process.env.STRIPE_PRICE_BUSINESS
        };

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{
                price: priceIds[planId],
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/dashboard.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard.html?status=cancelled`,
        });

        res.json({ success: true, sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('❌ Stripe checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Stripe Webhook (To update user status after payment)
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Update user's plan in your db.json
        const user = users.find(u => u.email === session.customer_email);
        if (user) {
            user.plan = 'active';
            saveData();
        }
    }

    res.json({ received: true });
});

// ===================================
// STATISTICS
// ===================================

app.get('/api/stats', (req, res) => {
    const totalScans = scans.length;
    const totalBugs = scans.reduce((sum, scan) => sum + scan.summary.totalBugs, 0);
    const avgBugsPerScan = totalScans > 0 ? (totalBugs / totalScans).toFixed(2) : 0;

    const severityBreakdown = {
        critical: scans.reduce((sum, scan) => sum + scan.summary.critical, 0),
        high: scans.reduce((sum, scan) => sum + scan.summary.high, 0),
        medium: scans.reduce((sum, scan) => sum + scan.summary.medium, 0),
        low: scans.reduce((sum, scan) => sum + scan.summary.low, 0)
    };

    res.json({
        success: true,
        stats: {
            totalScans,
            totalBugs,
            avgBugsPerScan,
            severityBreakdown,
            totalUsers: users.length,
            lastScan: scans.length > 0 ? scans[scans.length - 1].timestamp : null
        }
    });
});

// ===================================
// ERROR HANDLING
// ===================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Endpoint ${req.method} ${req.path} not found`,
        availableEndpoints: [
            'GET /api/health',
            'POST /api/scan',
            'GET /api/scans',
            'GET /api/scans/:id',
            'POST /api/suggest-fix',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/stats'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

// ===================================
// START SERVER
// ===================================

app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     🤖 BUGHUNTER AI - MVP BACKEND     ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log('\n📋 Available Endpoints:');
    console.log('   GET  /api/health          - Health check');
    console.log('   POST /api/scan            - Scan a website');
    console.log('   GET  /api/scans           - Get all scans');
    console.log('   GET  /api/scans/:id       - Get specific scan');
    console.log('   POST /api/suggest-fix     - Get AI fix suggestion');
    console.log('   POST /api/auth/register   - Register user');
    console.log('   POST /api/auth/login      - Login user');
    console.log('   GET  /api/stats           - Get statistics');
    console.log('\n💡 Quick Test:');
    console.log(`   curl http://localhost:${PORT}/api/health`);
    console.log('\n✨ Ready to detect bugs!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});
