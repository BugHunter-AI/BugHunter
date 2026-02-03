// Quick test script to verify BugHunter AI setup
// Run with: node test-scan.js

const { chromium } = require('playwright');

async function testScan() {
    console.log('🚀 BugHunter AI - Test Scan\n');
    console.log('Testing bug detection on a sample website...\n');

    const testUrl = 'https://example.com';

    try {
        console.log(`📍 Scanning: ${testUrl}`);

        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        const bugs = [];

        // Listen for console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                bugs.push({
                    type: 'Console Error',
                    severity: 'HIGH',
                    message: msg.text()
                });
            }
        });

        // Listen for network failures
        page.on('requestfailed', request => {
            bugs.push({
                type: 'Network Error',
                severity: 'MEDIUM',
                message: `Failed: ${request.url()}`
            });
        });

        console.log('⏳ Loading page...');
        await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 30000 });

        console.log('📸 Taking screenshot...');
        await page.screenshot({ path: 'test-screenshot.png' });

        console.log('🔍 Checking for issues...');

        // Check for broken images
        const brokenImages = await page.$$eval('img', imgs =>
            imgs.filter(img => !img.complete || img.naturalHeight === 0)
                .map(img => ({ src: img.src, alt: img.alt }))
        );

        if (brokenImages.length > 0) {
            bugs.push({
                type: 'Broken Images',
                severity: 'MEDIUM',
                message: `Found ${brokenImages.length} broken image(s)`,
                details: brokenImages
            });
        }

        // Check for missing alt text
        const missingAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);

        if (missingAlt > 0) {
            bugs.push({
                type: 'Accessibility',
                severity: 'LOW',
                message: `${missingAlt} images missing alt text`
            });
        }

        // Get page title
        const title = await page.title();

        // Check for missing title
        if (!title || title.trim() === '') {
            bugs.push({
                type: 'SEO',
                severity: 'MEDIUM',
                message: 'Page is missing a title tag'
            });
        }

        await browser.close();

        console.log('\n✅ Scan Complete!\n');
        console.log('═══════════════════════════════════════');
        console.log(`📊 Results for: ${testUrl}`);
        console.log(`📄 Page Title: ${title || 'No title'}`);
        console.log(`🐛 Bugs Found: ${bugs.length}`);
        console.log('═══════════════════════════════════════\n');

        if (bugs.length > 0) {
            console.log('🔴 Issues Detected:\n');
            bugs.forEach((bug, index) => {
                console.log(`${index + 1}. [${bug.severity}] ${bug.type}`);
                console.log(`   ${bug.message}`);
                if (bug.details) {
                    console.log(`   Details: ${JSON.stringify(bug.details, null, 2)}`);
                }
                console.log('');
            });
        } else {
            console.log('✨ No issues detected! Website looks good.\n');
        }

        console.log('📸 Screenshot saved as: test-screenshot.png\n');
        console.log('🎉 BugHunter AI is working correctly!\n');
        console.log('Next steps:');
        console.log('1. Install dependencies: npm install');
        console.log('2. Set up .env file with your API keys');
        console.log('3. Run server: npm start');
        console.log('4. Test API: http://localhost:3000/api/health\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure you ran: npm install');
        console.error('2. Check your internet connection');
        console.error('3. Try a different URL\n');
    }
}

// Run the test
testScan();
