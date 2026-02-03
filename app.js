// Modal handling
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginBtn = document.getElementById('loginBtn');
const startTrialBtn = document.getElementById('startTrialBtn');
const heroStartTrial = document.getElementById('heroStartTrial');
const ctaStartTrial = document.getElementById('ctaStartTrial');
const closeModal = document.getElementById('closeModal');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const watchDemo = document.getElementById('watchDemo');

// Open signup modal
[startTrialBtn, heroStartTrial, ctaStartTrial].forEach(btn => {
    btn.addEventListener('click', () => {
        authModal.classList.add('active');
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });
});

// Open login modal
loginBtn.addEventListener('click', () => {
    authModal.classList.add('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
});

// Close modal
closeModal.addEventListener('click', () => {
    authModal.classList.remove('active');
});

authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.remove('active');
    }
});

// Switch forms
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Watch demo
watchDemo.addEventListener('click', () => {
    document.querySelector('.demo-section').scrollIntoView({ behavior: 'smooth' });
});

// Form submissions (Simulated Auth for MVP)
loginForm.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const user = {
        email,
        name: email.split('@')[0],
        plan: 'Professional'
    };
    localStorage.setItem('bugHunterUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
});

signupForm.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const user = {
        email,
        name,
        plan: 'Professional',
        trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };
    localStorage.setItem('bugHunterUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    lastScroll = currentScroll;
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .pricing-card, .step').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

console.log('BugHunter AI initialized!');
