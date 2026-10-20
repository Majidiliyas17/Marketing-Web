// js/main.js
(function() {
    'use strict';

    // Log welcome message
    console.log('%cAILeadMS', 'font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #00D9FF, #087BFF, #6A32FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
    console.log('%cAI-Powered Social Lead Management', 'font-size: 12px; color: #94A3B8;');

    // Smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 72;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // Active nav link highlight
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar__link, .dropdown__link, .mobile-menu__link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Page visibility - pause heavy animations
    document.addEventListener('visibilitychange', () => {
        document.body.classList.toggle('page-hidden', document.hidden);
    });
})();