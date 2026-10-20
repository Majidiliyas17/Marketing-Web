// js/animations.js
(function() {
    // Keep the social/lead decorations consistent across every marketing page.
    const ambientTargets = document.querySelectorAll('.section.features, .section.problem, .section.ai-engine, .section.cta-final, footer.footer');
    const ambientMarkup = `<div class="ambient-icons" aria-hidden="true">
        <span class="ambient-icon ambient-icon--one"><svg class="ico"><use href="#ico-instagram"></use></svg><b>Social</b></span>
        <span class="ambient-icon ambient-icon--two"><svg class="ico"><use href="#ico-users"></use></svg><b>New lead</b></span>
        <span class="ambient-icon ambient-icon--three"><svg class="ico"><use href="#ico-trending-up"></use></svg></span>
        <span class="ambient-icon ambient-icon--four"><svg class="ico"><use href="#ico-facebook"></use></svg></span>
        <span class="ambient-icon ambient-icon--five"><svg class="ico"><use href="#ico-mail"></use></svg><b>Inbox</b></span>
        <span class="ambient-icon ambient-icon--six"><svg class="ico"><use href="#ico-linkedin"></use></svg></span>
        <i class="ambient-link ambient-link--one"></i><i class="ambient-link ambient-link--two"></i>
    </div>`;
    ambientTargets.forEach(section => {
        if (!section.querySelector(':scope > .ambient-icons')) section.insertAdjacentHTML('afterbegin', ambientMarkup);
    });

    // IntersectionObserver for scroll reveal
    const revealElements = document.querySelectorAll('.reveal');
    const staggerContainers = document.querySelectorAll('.stagger-children');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
        staggerContainers.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback
        revealElements.forEach(el => el.classList.add('visible'));
        staggerContainers.forEach(el => el.classList.add('visible'));
    }

    // Animated counters
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.counter, 10);
                    const duration = 1500;
                    const start = performance.now();

                    function update(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.round(target * eased).toLocaleString();
                        if (progress < 1) {
                            requestAnimationFrame(update);
                        }
                    }
                    requestAnimationFrame(update);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => counterObserver.observe(el));
    }

    // Parallax on floating cards (subtle)
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            document.querySelectorAll('.hero, .problem, .features, .ai-engine, .cta-final, .footer').forEach(section => {
                const icons = section.querySelectorAll('.ambient-icon');
                section.addEventListener('pointermove', event => {
                    const bounds = section.getBoundingClientRect();
                    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
                    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
                    icons.forEach((icon, index) => {
                        const depth = 8 + (index % 3) * 5;
                        icon.style.setProperty('--pointer-x', `${x * depth}px`);
                        icon.style.setProperty('--pointer-y', `${y * depth}px`);
                    });
                });
                section.addEventListener('pointerleave', () => {
                    icons.forEach(icon => {
                        icon.style.setProperty('--pointer-x', '0px');
                        icon.style.setProperty('--pointer-y', '0px');
                    });
                });
            });
        }

        const floatingCards = document.querySelectorAll('.floating-card');
        if (floatingCards.length && window.innerWidth > 1024) {
            document.querySelector('.hero__visual')?.addEventListener('mousemove', (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                floatingCards.forEach((card, i) => {
                    const depth = (i + 1) * 6;
                    card.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
                });
            });
        }
    }
})();
