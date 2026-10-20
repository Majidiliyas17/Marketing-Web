// js/components.js
(function() {
    // Dashboard mockup micro-interactions
    const leadItems = document.querySelectorAll('.mockup__lead-item');
    leadItems.forEach(item => {
        item.addEventListener('click', () => {
            leadItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // CTA particles
    const particleContainer = document.getElementById('ctaParticles');
    if (particleContainer && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.style.cssText = `
                position: absolute;
                width: ${2 + Math.random() * 4}px;
                height: ${2 + Math.random() * 4}px;
                border-radius: 50%;
                background: ${Math.random() > 0.5 ? 'var(--brand-cyan)' : 'var(--brand-purple)'};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${0.2 + Math.random() * 0.5};
                animation: particleFloat ${6 + Math.random() * 8}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particleContainer.appendChild(particle);
        }

        // Add keyframes dynamically
        if (!document.getElementById('particleKeyframes')) {
            const style = document.createElement('style');
            style.id = 'particleKeyframes';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% { transform: translate(0, 0); opacity: 0.2; }
                    25% { transform: translate(${10 + Math.random() * 30}px, ${-20 - Math.random() * 30}px); opacity: 0.6; }
                    50% { transform: translate(${-10 - Math.random() * 20}px, ${-40 - Math.random() * 20}px); opacity: 0.3; }
                    75% { transform: translate(${15 + Math.random() * 20}px, ${-15 - Math.random() * 25}px); opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // AI Engine node hover glow
    const aiNodes = document.querySelectorAll('.ai-node');
    aiNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            node.style.transform = 'scale(1.15)';
            node.style.zIndex = '20';
        });
        node.addEventListener('mouseleave', () => {
            node.style.transform = 'scale(1)';
            node.style.zIndex = '5';
        });
    });

    // Product tour tabs
    const tourTabs = document.querySelectorAll('.tour-tab');
    const tourShots = document.querySelectorAll('.browser-frame__shot');
    const tourUrl = document.getElementById('tourUrl');
    if (tourTabs.length && tourShots.length) {
        tourTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const key = tab.dataset.shot;
                tourTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                tourShots.forEach(s => s.classList.toggle('active', s.dataset.shot === key));
                if (tourUrl) tourUrl.textContent = key;
            });
        });
    }
})();