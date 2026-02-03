// BugHunter AI Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    // 0. Theme Handling
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    // Check saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    });

    // 1. Navigation handling
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const sectionTitle = document.getElementById('sectionTitle');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.getAttribute('data-section');

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show target section
            sections.forEach(sec => sec.classList.remove('active'));
            const targetEl = document.getElementById(`${targetSection}Section`);
            if (targetEl) targetEl.classList.add('active');

            // Update title
            sectionTitle.textContent = item.textContent.trim();
        });
    });

    // 2. User Data handling
    const userData = JSON.parse(localStorage.getItem('bugHunterUser') || '{}');
    document.getElementById('userNameDisplay').textContent = userData.name || 'John Doe';
    document.getElementById('userAvatar').textContent = (userData.name || 'JD').substring(0, 2).toUpperCase();

    // Populate Profile Fields
    if (document.getElementById('profileName')) {
        document.getElementById('profileName').value = userData.name || '';
        document.getElementById('profileEmail').value = userData.email || '';
    }

    // Update Profile Handler
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', () => {
            const newName = document.getElementById('profileName').value;
            userData.name = newName;
            localStorage.setItem('bugHunterUser', JSON.stringify(userData));
            document.getElementById('userNameDisplay').textContent = newName;
            document.getElementById('userAvatar').textContent = newName.substring(0, 2).toUpperCase();
            alert('Profile updated successfully!');
        });
    }

    // Team Invite Handler
    const sendInviteBtn = document.getElementById('sendInviteBtn');
    if (sendInviteBtn) {
        sendInviteBtn.addEventListener('click', async () => {
            const email = document.getElementById('inviteEmail').value;
            if (!email) return alert('Enter an email');

            const res = await fetch('http://localhost:3000/api/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role: 'developer' })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Invitation sent to ${email}!`);
                document.getElementById('inviteEmail').value = '';
            }
        });
    }

    // Fetch real stats from backend
    async function fetchStats() {
        try {
            const response = await fetch('http://localhost:3000/api/stats');
            const data = await response.json();
            if (data.success) {
                document.getElementById('totalScans').textContent = data.stats.totalScans;
                document.getElementById('totalBugs').textContent = data.stats.totalBugs;
                document.getElementById('avgScore').textContent = `${data.stats.avgBugsPerScan} bugs/scan`;
                document.getElementById('criticalBugs').textContent = data.stats.severityBreakdown.critical;
            }
        } catch (error) {
            console.log('Backend not reachable for stats yet.');
        }
    }
    fetchStats();

    // 3. Scan Handling
    const runScanBtn = document.getElementById('runScanBtn');
    const scanLoader = document.getElementById('scanLoader');
    const scanResults = document.getElementById('scanResults');
    const scanConfig = document.querySelector('.scan-config');
    const loaderStatus = document.getElementById('loaderStatus');
    const bugsContainer = document.getElementById('bugsContainer');

    runScanBtn.addEventListener('click', async () => {
        const url = document.getElementById('scanUrl').value;
        if (!url) return alert('Please enter a URL');

        // Show Loader, hide config
        scanConfig.classList.add('hidden');
        scanLoader.classList.remove('hidden');
        scanResults.classList.add('hidden');

        // Update steps manually to simulate progress
        updateLoaderSteps();

        try {
            // CALL THE REAL BACKEND
            const response = await fetch('http://localhost:3000/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: url,
                    options: {
                        checkAccessibility: document.getElementById('checkAccessibility').checked,
                        checkSEO: document.getElementById('checkSEO').checked,
                        checkPerformance: document.getElementById('checkPerformance').checked,
                        fullPageScreenshot: document.getElementById('fullScreenshot').checked
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                renderResults(data.scan);
            } else {
                throw new Error(data.message || 'Scan failed');
            }
        } catch (error) {
            console.error(error);
            alert(`Scan failed: ${error.message}. Make sure the backend server.js is running!`);
            scanConfig.classList.remove('hidden');
            scanLoader.classList.add('hidden');
        }
    });

    function updateLoaderSteps() {
        const steps = ['step1', 'step2', 'step3', 'step4'];
        const statuses = [
            'Connecting to host...',
            'Injecting analyzer scripts...',
            'Running accessibility checks...',
            'Consulting AI for fix suggestions...'
        ];

        let current = 0;
        const interval = setInterval(() => {
            if (current < steps.length) {
                document.getElementById(steps[current]).classList.add('active');
                loaderStatus.textContent = statuses[current];
                current++;
            } else {
                clearInterval(interval);
            }
        }, 3000);
    }

    function renderResults(scan) {
        scanLoader.classList.add('hidden');
        scanResults.classList.remove('hidden');

        // Update score/summary
        const score = scan.results.aiAnalysis?.qualityScore || 85;
        document.getElementById('resultScoreText').textContent = `${score}%`;
        document.getElementById('resultUrl').textContent = new URL(scan.url).hostname;
        document.getElementById('tagBugs').textContent = `${scan.summary.totalBugs} Bugs Found`;

        // Update circular chart
        const dashArray = `${score}, 100`;
        document.getElementById('resultCircle').setAttribute('stroke-dasharray', dashArray);

        // Show Screenshot
        if (scan.results.screenshots && scan.results.screenshots.length > 0) {
            const container = document.getElementById('screenshotContainer');
            const img = document.getElementById('scanScreenshot');
            img.src = `http://localhost:3000/screenshots/${scan.results.screenshots[0]}`;
            container.classList.remove('hidden');
        }

        // Render bug cards
        bugsContainer.innerHTML = '';
        scan.results.bugs.forEach((bug, index) => {
            const bugCard = document.createElement('div');
            bugCard.className = `bug-card card severity-${bug.severity}`;
            bugCard.innerHTML = `
                <div class="bug-main">
                    <div class="bug-badge">${bug.severity.toUpperCase()}</div>
                    <div class="bug-info">
                        <h3>${bug.type.replace(/_/g, ' ')}</h3>
                        <p>${bug.message}</p>
                        <code class="bug-loc">${bug.location || 'Website UI'}</code>
                    </div>
                </div>
                <div class="bug-actions">
                    <button class="btn-ai-fix" onclick="showFix(${index})">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" fill="currentColor"/></svg>
                        See AI Fix
                    </button>
                </div>
            `;
            bugsContainer.appendChild(bugCard);
        });

        // Attach Button Actions
        document.getElementById('downloadPdfBtn').onclick = () => {
            window.open(`http://localhost:3000/api/scans/${scan.id}/pdf`, '_blank');
        };

        document.getElementById('shareResultsBtn').onclick = async () => {
            const res = await fetch(`http://localhost:3000/api/scans/${scan.id}/share`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(`Public link generated! Anyone with this link can view the report:\n\n${data.shareUrl}`);
            }
        };

        // Store scan bugs globally for the modal
        window.currentScanBugs = scan.results.bugs;
    }

    // 4. Modal Fix Handling
    const fixModal = document.getElementById('fixModal');
    const closeFixModal = document.getElementById('closeFixModal');
    const closeModalBtn = document.querySelector('.close-modal');

    window.showFix = async (bugIndex) => {
        const bug = window.currentScanBugs[bugIndex];

        // Setup modal content
        document.getElementById('fixBugTitle').textContent = bug.type.replace(/_/g, ' ');
        fixModal.style.display = 'flex';

        try {
            // Fetch AI fix from backend
            const response = await fetch('http://localhost:3000/api/suggest-fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bug })
            });
            const data = await response.json();

            if (data.success) {
                const fix = data.fix.fix;
                document.getElementById('fixExplanation').textContent = fix.explanation;

                const stepsList = document.getElementById('fixStepsList');
                stepsList.innerHTML = '';
                fix.steps.forEach(step => {
                    const li = document.createElement('li');
                    li.textContent = step;
                    stepsList.appendChild(li);
                });

                document.getElementById('fixLanguage').textContent = (fix.language || 'JAVASCRIPT').toUpperCase();
                document.getElementById('fixCodeBlock').textContent = fix.codeExample || 'No code example needed for this fix.';
            }
        } catch (error) {
            document.getElementById('fixExplanation').textContent = 'Could not load AI fix at this time.';
        }
    };

    [closeFixModal, closeModalBtn].forEach(btn => {
        btn.addEventListener('click', () => fixModal.style.display = 'none');
    });

    // 5. Chart.js Implementation
    const ctx = document.getElementById('scanChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Bugs Found',
                data: [12, 19, 3, 5, 2, 3, 7],
                borderColor: '#ec4899',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(236, 72, 153, 0.1)'
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
