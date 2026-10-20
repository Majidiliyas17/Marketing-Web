// Minimal CDP helper. Requires Chrome started with:
//   chrome --headless=new --remote-debugging-port=9222 --user-data-dir=<tmp>
// Usage: node tools/cdp.mjs <mode> <args...>
//   shot  <url> <out.png> [width] [height] [full]
//   eval  <url> <js-expression>
import fs from 'node:fs';

const [mode, ...rest] = process.argv.slice(2);
const PORT = process.env.CDP_PORT || '9222';

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const events = [];
    ws.addEventListener('open', () => {
      const listeners = new Set();
      ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id && pending.has(msg.id)) {
          const { res: r, rej: j } = pending.get(msg.id);
          pending.delete(msg.id);
          msg.error ? j(new Error(msg.error.message)) : r(msg.result);
        } else if (msg.method) {
          listeners.forEach((fn) => fn(msg.method, msg.params));
        }
      });
      resolve({
        send(method, params = {}) {
          return new Promise((res, rej) => {
            const mid = ++id;
            pending.set(mid, { res, rej });
            ws.send(JSON.stringify({ id: mid, method, params }));
          });
        },
        once(method, timeout = 20000) {
          return new Promise((res, rej) => {
            const t = setTimeout(() => { listeners.delete(fn); rej(new Error('timeout ' + method)); }, timeout);
            const fn = (m) => {
              if (m === method) { clearTimeout(t); listeners.delete(fn); res(); }
            };
            listeners.add(fn);
          });
        },
        on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
        close() { ws.close(); },
      });
    });
    ws.addEventListener('error', reject);
  });
}

async function open(url) {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const t = await r.json();
  if (!t.webSocketDebuggerUrl) throw new Error('no ws url: ' + JSON.stringify(t));
  return t;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

if (mode === 'shot') {
  const [url, out, w = '1440', h = '900', full = '0', override = ''] = rest;
  const target = await open('about:blank');
  const c = await connect(target.webSocketDebuggerUrl);
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: false });
  await c.send('Page.navigate', { url });
  await sleep(2000);
  if (override) {
    const css = Buffer.from(override, 'base64').toString('utf8');
    const expr = `(() => {
      document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
      const css = ${JSON.stringify(css)};
      if (css.includes('THEME_LIGHT')) { localStorage.setItem('aileadms-theme', 'light'); document.documentElement.setAttribute('data-theme', 'light'); }
      if (css.includes('THEME_DARK')) { localStorage.setItem('aileadms-theme', 'dark'); document.documentElement.setAttribute('data-theme', 'dark'); }
      const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    })()`;
    await c.send('Runtime.evaluate', { expression: expr });
    await sleep(2500);
  }
  const params = { format: 'png' };
  if (full === '1') {
    await c.send('Runtime.evaluate', {
      expression: `(async () => {
        document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
        const step = Math.round(window.innerHeight * 0.8);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        for (let y = 0; y <= max; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
        window.scrollTo(0, max); await new Promise(r => setTimeout(r, 900));
        window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
      })()`,
      awaitPromise: true,
    });
    params.captureBeyondViewport = true;
  }
  const shot = await c.send('Page.captureScreenshot', params);
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('wrote ' + out + ' (' + shot.data.length + ' b64)');
  c.close();
} else if (mode === 'check') {
  const [url] = rest;
  const target = await open('about:blank');
  const c = await connect(target.webSocketDebuggerUrl);
  const errors = [];
  await c.send('Runtime.enable');
  await c.send('Log.enable');
  await c.send('Page.enable');
  const collector = [];
  const listener = (m, p) => {
    if (m === 'Runtime.exceptionThrown') collector.push('EXC: ' + (p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
    if (m === 'Runtime.consoleAPICalled' && (p.type === 'error')) collector.push('CONSOLE: ' + p.args.map(a => a.value || a.description).join(' '));
    if (m === 'Log.entryAdded' && p.entry?.level === 'error') collector.push('LOG: ' + p.entry.text);
  };
  c.on(listener);
  await c.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await c.send('Page.navigate', { url });
  await sleep(2500);
  const res = await c.send('Runtime.evaluate', {
    expression: `(async () => {
      document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager');
      await Promise.all([...document.images].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));
      const step = Math.round(window.innerHeight * 0.8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      for (let y = 0; y <= max; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
      window.scrollTo(0, max); await new Promise(r => setTimeout(r, 1000));
      window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
      const o = {};
      o.title = document.title;
      o.viewport = window.innerWidth + 'x' + window.innerHeight;
      o.scrollWidth = document.documentElement.scrollWidth;
      o.hOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
      o.imgs = { total: document.images.length, broken: [...document.images].filter(i=>i.naturalWidth===0).map(i=>i.getAttribute('src')) };
      o.sections = [...document.querySelectorAll('main > section, footer')].map(s => ({ c: (s.className||s.tagName).split(' ').slice(0,2).join('.'), h: Math.round(s.getBoundingClientRect().height) }));
      o.nav = !!document.querySelector('.navbar');
      o.footer = !!document.querySelector('.footer');
      o.scripts = document.querySelectorAll('script[src]').length;
      const cs = (sel, prop) => { const e = document.querySelector(sel); return e ? getComputedStyle(e)[prop] : 'MISSING:' + sel; };
      o.styles = {
        footerBg: cs('.footer','backgroundImage').slice(0,60),
        footerDisplay: cs('.footer__inner','display'),
        featureCardRadius: cs('.feature-card','borderRadius'),
        btnOutline: cs('.btn--outline','borderColor'),
        logoImg: (()=>{const i=document.querySelector('.navbar__logo img'); return i? (i.naturalWidth+'x'+i.naturalHeight) : 'NO-IMG';})()
      };
      o.emptySections = o.sections.filter(s=>s.h < 40).map(s=>s.c+' h='+s.h);
      o.hidden = {
        reveals: [...document.querySelectorAll('.reveal:not(.visible)')].map(e=>e.className.split(' ').slice(0,3).join('.')).slice(0,8),
        stagger: [...document.querySelectorAll('.stagger-children:not(.visible)')].map(e=>e.className.split(' ').slice(0,3).join('.')).slice(0,8),
        invisibleText: [...document.querySelectorAll('main *, footer *')].filter(e => {
          const cs = getComputedStyle(e);
          if (cs.opacity !== '0' || !e.offsetParent) return false;
          if (e.querySelector('main, section')) return false;
          return e.textContent.trim().length > 15;
        }).map(e=>e.tagName+'.'+e.className.split(' ')[0]).slice(0,8)
      };
      return o;
    })()`,
    returnByValue: true, awaitPromise: true,
  });
  console.log(JSON.stringify({ ...res.result.value, consoleErrors: collector }, null, 2));
  c.close();} else if (mode === 'eval') {
  const [url, expr] = rest;
  const target = await open('about:blank');
  const c = await connect(target.webSocketDebuggerUrl);
  await c.send('Runtime.enable');
  await c.send('Page.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await c.send('Page.navigate', { url });
  await sleep(2500);
  const r = await c.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify(r.result?.value ?? r.result, null, 2));
  c.close();
} else {
  console.error('unknown mode');
  process.exit(1);
}
