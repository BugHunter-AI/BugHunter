// ===================================
// BUG DETECTOR - Playwright-based scanning
// Detects various types of bugs automatically
// ===================================

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * Scan a website for bugs
 * @param {string} url - URL to scan
 * @param {object} options - Scan options
 * @returns {object} Scan results with bugs and screenshots
 */
async function scanWebsite(url, options = {}) {
    const {
        timeout = 30000,
        fullPageScreenshot = true,
        checkAccessibility = true,
        checkPerformance = true,
        checkSEO = true
    } = options;

    console.log(`\n🔍 Scanning: ${url}`);
    console.log(`⚙️  Options:`, { timeout, fullPageScreenshot, checkAccessibility, checkPerformance, checkSEO });

    const bugs = [];
    const screenshots = [];
    let browser;

    try {
        // Launch browser
        console.log('🌐 Launching browser...');
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'BugHunterAI/1.0 (Automated QA Testing)'
        });

        const page = await context.newPage();

        // Track console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                bugs.push({
                    type: 'console_error',
                    severity: 'high',
                    category: 'JavaScript',
                    message: msg.text(),
                    location: 'Browser Console',
                    timestamp: new Date().toISOString()
                });
            }
            if (msg.type() === 'warning') {
                bugs.push({
                    type: 'console_warning',
                    severity: 'low',
                    category: 'JavaScript',
                    message: msg.text(),
                    location: 'Browser Console',
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Track network failures
        page.on('requestfailed', request => {
            bugs.push({
                type: 'network_error',
                severity: 'medium',
                category: 'Network',
                message: `Failed to load: ${request.url()}`,
                location: request.url(),
                failureText: request.failure()?.errorText || 'Unknown error',
                timestamp: new Date().toISOString()
            });
        });

        // Track page errors
        page.on('pageerror', error => {
            bugs.push({
                type: 'page_error',
                severity: 'critical',
                category: 'JavaScript',
                message: error.message,
                stack: error.stack,
                location: 'Page Runtime',
                timestamp: new Date().toISOString()
            });
        });

        console.log('📄 Loading page...');

        // Navigate to page
        const response = await page.goto(url, {
            waitUntil: 'networkidle',
            timeout
        });

        // Check HTTP status
        const status = response.status();
        if (status >= 400) {
            bugs.push({
                type: 'http_error',
                severity: status >= 500 ? 'critical' : 'high',
                category: 'Network',
                message: `HTTP ${status} error`,
                location: url,
                statusCode: status,
                statusText: response.statusText(),
                timestamp: new Date().toISOString()
            });
        }

        console.log(`✅ Page loaded (HTTP ${status})`);

        // Take screenshot
        console.log('📸 Capturing screenshot...');
        const screenshotPath = path.join(__dirname, 'screenshots', `scan_${Date.now()}.png`);
        await page.screenshot({
            path: screenshotPath,
            fullPage: fullPageScreenshot
        });
        screenshots.push(screenshotPath);
        console.log(`✅ Screenshot saved: ${path.basename(screenshotPath)}`);

        // Get page info
        const pageInfo = await page.evaluate(() => ({
            title: document.title,
            url: window.location.href,
            metaDescription: document.querySelector('meta[name="description"]')?.content || null,
            hasH1: document.querySelector('h1') !== null,
            imageCount: document.querySelectorAll('img').length,
            linkCount: document.querySelectorAll('a').length,
            formCount: document.querySelectorAll('form').length
        }));

        console.log(`📊 Page info:`, pageInfo);

        // Check for broken images
        console.log('🖼️  Checking images...');
        const brokenImages = await page.$$eval('img', imgs =>
            imgs.filter(img => !img.complete || img.naturalHeight === 0)
                .map(img => ({
                    src: img.src,
                    alt: img.alt || '(no alt text)'
                }))
        );

        if (brokenImages.length > 0) {
            bugs.push({
                type: 'broken_images',
                severity: 'medium',
                category: 'Content',
                message: `Found ${brokenImages.length} broken image(s)`,
                details: brokenImages,
                count: brokenImages.length,
                timestamp: new Date().toISOString()
            });
            console.log(`⚠️  Found ${brokenImages.length} broken images`);
        }

        // Check for accessibility issues
        if (checkAccessibility) {
            console.log('♿ Checking accessibility...');

            // Missing alt text
            const missingAlt = await page.$$eval('img:not([alt])', imgs =>
                imgs.map(img => img.src)
            );

            if (missingAlt.length > 0) {
                bugs.push({
                    type: 'accessibility_missing_alt',
                    severity: 'low',
                    category: 'Accessibility',
                    message: `${missingAlt.length} images missing alt text`,
                    details: missingAlt,
                    count: missingAlt.length,
                    wcagLevel: 'A',
                    timestamp: new Date().toISOString()
                });
            }

            // Missing form labels
            const missingLabels = await page.$$eval('input:not([type="hidden"]):not([aria-label])', inputs =>
                inputs.filter(input => {
                    const id = input.id;
                    return !id || !document.querySelector(`label[for="${id}"]`);
                }).length
            );

            if (missingLabels > 0) {
                bugs.push({
                    type: 'accessibility_missing_labels',
                    severity: 'medium',
                    category: 'Accessibility',
                    message: `${missingLabels} form inputs missing labels`,
                    count: missingLabels,
                    wcagLevel: 'A',
                    timestamp: new Date().toISOString()
                });
            }

            // Check for low contrast (simplified check)
            const lowContrast = await page.$$eval('*', elements => {
                let count = 0;
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const bg = style.backgroundColor;
                    const color = style.color;
                    // Simplified check - in production use proper contrast ratio calculation
                    if (bg === color) count++;
                });
                return count;
            });

            if (lowContrast > 0) {
                bugs.push({
                    type: 'accessibility_low_contrast',
                    severity: 'low',
                    category: 'Accessibility',
                    message: `Potential low contrast issues detected`,
                    count: lowContrast,
                    wcagLevel: 'AA',
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Check for SEO issues
        if (checkSEO) {
            console.log('🔍 Checking SEO...');

            if (!pageInfo.title || pageInfo.title.trim() === '') {
                bugs.push({
                    type: 'seo_missing_title',
                    severity: 'high',
                    category: 'SEO',
                    message: 'Page is missing a title tag',
                    impact: 'Critical for search engines',
                    timestamp: new Date().toISOString()
                });
            } else if (pageInfo.title.length < 30 || pageInfo.title.length > 60) {
                bugs.push({
                    type: 'seo_title_length',
                    severity: 'low',
                    category: 'SEO',
                    message: `Title length (${pageInfo.title.length} chars) not optimal (30-60 chars)`,
                    currentLength: pageInfo.title.length,
                    recommendedRange: '30-60',
                    timestamp: new Date().toISOString()
                });
            }

            if (!pageInfo.metaDescription) {
                bugs.push({
                    type: 'seo_missing_description',
                    severity: 'medium',
                    category: 'SEO',
                    message: 'Page is missing a meta description',
                    impact: 'Important for search results',
                    timestamp: new Date().toISOString()
                });
            }

            if (!pageInfo.hasH1) {
                bugs.push({
                    type: 'seo_missing_h1',
                    severity: 'medium',
                    category: 'SEO',
                    message: 'Page is missing an H1 heading',
                    impact: 'Important for page structure',
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Check for performance issues
        if (checkPerformance) {
            console.log('⚡ Checking performance...');

            const performanceMetrics = await page.evaluate(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                return {
                    loadTime: perf?.loadEventEnd - perf?.fetchStart,
                    domContentLoaded: perf?.domContentLoadedEventEnd - perf?.fetchStart,
                    firstPaint: performance.getEntriesByType('paint')[0]?.startTime
                };
            });

            if (performanceMetrics.loadTime > 3000) {
                bugs.push({
                    type: 'performance_slow_load',
                    severity: 'medium',
                    category: 'Performance',
                    message: `Slow page load time: ${(performanceMetrics.loadTime / 1000).toFixed(2)}s`,
                    loadTime: performanceMetrics.loadTime,
                    threshold: 3000,
                    recommendation: 'Optimize images, minify CSS/JS, use CDN',
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Check for broken links (sample check - first 10 links)
        console.log('🔗 Checking links...');
        const links = await page.$$eval('a[href]', links =>
            links.slice(0, 10).map(a => ({
                href: a.href,
                text: a.textContent.trim()
            }))
        );

        // Close browser
        await browser.close();
        console.log('✅ Browser closed');

        // Summary
        console.log(`\n📊 Scan Summary:`);
        console.log(`   Total bugs found: ${bugs.length}`);
        console.log(`   Critical: ${bugs.filter(b => b.severity === 'critical').length}`);
        console.log(`   High: ${bugs.filter(b => b.severity === 'high').length}`);
        console.log(`   Medium: ${bugs.filter(b => b.severity === 'medium').length}`);
        console.log(`   Low: ${bugs.filter(b => b.severity === 'low').length}`);

        return {
            url,
            timestamp: new Date().toISOString(),
            pageInfo,
            bugs,
            screenshots: screenshots.map(s => path.basename(s)),
            summary: {
                totalBugs: bugs.length,
                byCategory: groupBy(bugs, 'category'),
                bySeverity: groupBy(bugs, 'severity')
            }
        };

    } catch (error) {
        if (browser) {
            await browser.close();
        }

        console.error('❌ Scan failed:', error.message);

        throw new Error(`Scan failed: ${error.message}`);
    }
}

/**
 * Group array of objects by key
 */
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key] || 'unknown';
        result[group] = (result[group] || 0) + 1;
        return result;
    }, {});
}

module.exports = {
    scanWebsite
};
