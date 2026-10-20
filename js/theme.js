// AILeadMS uses one consistent light canvas with intentional dark sections.
(function() {
    document.documentElement.setAttribute('data-theme', 'light');
    const hideToggle = document.createElement('style');
    hideToggle.textContent = '.theme-toggle{display:none!important}';
    document.head.appendChild(hideToggle);
    try { localStorage.removeItem('aileadms-theme'); } catch (error) { /* Storage can be unavailable in private browsing. */ }
})();
