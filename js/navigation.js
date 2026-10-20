// js/navigation.js
(function() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    // Sticky navbar on scroll
    let lastScroll = window.scrollY;
    function handleScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        const scrollingDown = scrollY > lastScroll + 4;
        const scrollingUp = scrollY < lastScroll - 4;
        const menuOpen = mobileMenu?.classList.contains('open');
        if (scrollY < 80 || scrollingUp || menuOpen || navbar.contains(document.activeElement)) {
            navbar.classList.remove('navbar--hidden');
        } else if (scrollingDown) {
            navbar.classList.add('navbar--hidden');
        }
        lastScroll = scrollY;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile menu toggle
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen);
            mobileMenu.setAttribute('aria-hidden', !isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });
    }

    // Dropdown keyboard support
    document.querySelectorAll('.has-dropdown').forEach(item => {
        const button = item.querySelector('.navbar__link');
        const dropdown = item.querySelector('.navbar__dropdown');
        if (!button || !dropdown) return;

        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const expanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !expanded);
                if (!expanded) {
                    const firstLink = dropdown.querySelector('a');
                    if (firstLink) firstLink.focus();
                }
            }
            if (e.key === 'Escape') {
                button.setAttribute('aria-expanded', 'false');
                button.focus();
            }
        });

        // Close on focus out
        item.addEventListener('focusout', (e) => {
            if (!item.contains(e.relatedTarget)) {
                button.setAttribute('aria-expanded', 'false');
            }
        });
    });
})();
