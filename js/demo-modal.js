(function () {
    let dialog = document.getElementById('demo-form');
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.className = 'demo-dialog';
        dialog.id = 'demo-form';
        dialog.setAttribute('aria-labelledby', 'demo-title');
        dialog.innerHTML = '<button class="demo-dialog__close" type="button" aria-label="Close form">×</button><span class="section-label">YOUR SOCIAL GROWTH STARTS HERE</span><h2 id="demo-title">Start your free demo</h2><p>Tell us a little about your team. We’ll show you how AILeadMS can bring your social workflow together.</p><form class="demo-form"><label>Full name<input name="name" autocomplete="name" required placeholder="Your name"></label><label>Work email<input name="email" type="email" autocomplete="email" required placeholder="you@company.com"></label><label>Company<input name="company" autocomplete="organization" required placeholder="Company name"></label><label>What do you want to improve?<select name="focus"><option>Social media management</option><option>Publishing and planning</option><option>Engagement and community</option><option>Analytics and reporting</option><option>Lead management</option></select></label><button class="btn btn--primary btn--large" type="submit">Request my free demo →</button><small>We’ll only use your details to arrange your demo.</small></form>';
        document.body.appendChild(dialog);
    }
    const close = dialog.querySelector('.demo-dialog__close');
    document.querySelectorAll('.demo-trigger, .nav-demo-trigger').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            dialog.showModal();
        });
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
    dialog.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const name = form.elements.name.value.trim();
        dialog.querySelector('#demo-title').textContent = `Thanks, ${name}!`;
        dialog.querySelector('.demo-dialog > p').textContent = 'Your request is ready. Our team will be in touch to arrange your free demo.';
        form.innerHTML = '<button class="btn btn--primary btn--large" type="button">Request received ✓</button><small>This demo form is a front-end preview. Connect it to your CRM to receive submissions.</small>';
    });
})();
