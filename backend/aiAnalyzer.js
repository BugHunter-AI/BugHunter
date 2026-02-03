// ===================================
// AI ANALYZER - OpenAI-powered bug analysis
// Provides intelligent bug analysis and fix suggestions
// ===================================

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}) : null;

/**
 * Analyze bugs using AI
 * @param {Array} bugs - Array of detected bugs
 * @param {string} url - URL that was scanned
 * @returns {object} AI analysis with priorities and recommendations
 */
async function analyzeBugsWithAI(bugs, url) {
    if (!openai) {
        throw new Error('OpenAI API key not configured');
    }

    if (!bugs || bugs.length === 0) {
        return {
            summary: 'No bugs detected',
            recommendations: []
        };
    }

    console.log(`🤖 Analyzing ${bugs.length} bugs with AI...`);

    // Prepare bug summary for AI
    const bugSummary = bugs.map((bug, index) =>
        `${index + 1}. [${bug.severity.toUpperCase()}] ${bug.type}: ${bug.message}`
    ).join('\n');

    const prompt = `You are a senior QA engineer analyzing bugs found on ${url}.

Bugs detected:
${bugSummary}

Please provide:
1. Overall assessment of the website's quality
2. Priority order for fixing (most critical first)
3. Estimated impact on users for each bug
4. Quick recommendations for the top 3 most important fixes

Format your response as JSON with this structure:
{
  "overallAssessment": "brief assessment",
  "qualityScore": 0-100,
  "prioritizedBugs": [
    {
      "bugIndex": 1,
      "priority": "critical/high/medium/low",
      "userImpact": "description",
      "recommendation": "what to do"
    }
  ],
  "quickWins": ["easy fix 1", "easy fix 2"],
  "estimatedFixTime": "time estimate"
}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are an expert QA engineer who provides detailed, actionable bug analysis. Always respond with valid JSON."
            }, {
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 2000
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        console.log(`✅ AI analysis complete (Quality Score: ${analysis.qualityScore}/100)`);

        return {
            ...analysis,
            aiModel: 'gpt-4',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ AI analysis error:', error.message);

        // Fallback to basic analysis
        return {
            overallAssessment: 'AI analysis unavailable, showing basic analysis',
            qualityScore: calculateBasicQualityScore(bugs),
            prioritizedBugs: bugs.map((bug, index) => ({
                bugIndex: index + 1,
                priority: bug.severity,
                userImpact: getBasicImpact(bug),
                recommendation: getBasicRecommendation(bug)
            })),
            quickWins: [],
            estimatedFixTime: 'Unknown',
            error: error.message
        };
    }
}

/**
 * Get AI-powered fix suggestion for a specific bug
 * @param {object} bug - Bug object
 * @returns {object} Fix suggestion with code example
 */
async function suggestFix(bug) {
    if (!openai) {
        throw new Error('OpenAI API key not configured');
    }

    console.log(`🤖 Generating fix for: ${bug.type}`);

    const prompt = `You are a senior developer. A QA tool detected this bug:

Type: ${bug.type}
Severity: ${bug.severity}
Message: ${bug.message}
${bug.location ? `Location: ${bug.location}` : ''}

Please provide:
1. Explanation of why this is a problem
2. Step-by-step fix instructions
3. Code example (if applicable)
4. Prevention tips for the future

Format as JSON:
{
  "explanation": "why this is a problem",
  "steps": ["step 1", "step 2"],
  "codeExample": "code here (if applicable)",
  "language": "javascript/html/css",
  "prevention": "how to prevent this",
  "estimatedTime": "time to fix"
}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are an expert developer who provides clear, actionable fix suggestions with code examples. Always respond with valid JSON."
            }, {
                role: "user",
                content: prompt
            }],
            temperature: 0.5,
            max_tokens: 1500
        });

        const fix = JSON.parse(response.choices[0].message.content);

        console.log(`✅ Fix suggestion generated`);

        return {
            bug: {
                type: bug.type,
                severity: bug.severity,
                message: bug.message
            },
            fix,
            aiModel: 'gpt-4',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Fix suggestion error:', error.message);

        // Fallback to basic suggestion
        return {
            bug: {
                type: bug.type,
                severity: bug.severity,
                message: bug.message
            },
            fix: {
                explanation: 'AI fix suggestion unavailable',
                steps: [getBasicRecommendation(bug)],
                codeExample: null,
                language: null,
                prevention: 'Implement proper testing',
                estimatedTime: 'Unknown'
            },
            error: error.message
        };
    }
}

/**
 * Calculate basic quality score without AI
 */
function calculateBasicQualityScore(bugs) {
    if (bugs.length === 0) return 100;

    const severityWeights = {
        critical: 20,
        high: 10,
        medium: 5,
        low: 2
    };

    const totalDeduction = bugs.reduce((sum, bug) => {
        return sum + (severityWeights[bug.severity] || 5);
    }, 0);

    return Math.max(0, 100 - totalDeduction);
}

/**
 * Get basic impact description
 */
function getBasicImpact(bug) {
    const impacts = {
        console_error: 'May cause functionality issues for users',
        network_error: 'Users may see broken content or features',
        broken_images: 'Poor visual experience for users',
        accessibility_missing_alt: 'Screen reader users cannot understand images',
        seo_missing_title: 'Poor search engine visibility',
        performance_slow_load: 'Users may abandon slow-loading pages',
        http_error: 'Page or resources unavailable to users'
    };

    return impacts[bug.type] || 'May negatively impact user experience';
}

/**
 * Get basic recommendation
 */
function getBasicRecommendation(bug) {
    const recommendations = {
        console_error: 'Check browser console and fix JavaScript errors',
        network_error: 'Verify all resource URLs are correct and accessible',
        broken_images: 'Check image URLs and ensure files exist',
        accessibility_missing_alt: 'Add descriptive alt text to all images',
        accessibility_missing_labels: 'Add labels to all form inputs',
        seo_missing_title: 'Add a descriptive title tag (30-60 characters)',
        seo_missing_description: 'Add a meta description (120-160 characters)',
        seo_missing_h1: 'Add an H1 heading to the page',
        performance_slow_load: 'Optimize images, minify CSS/JS, enable caching',
        http_error: 'Fix server configuration or broken links'
    };

    return recommendations[bug.type] || 'Review and fix the reported issue';
}

module.exports = {
    analyzeBugsWithAI,
    suggestFix
};
