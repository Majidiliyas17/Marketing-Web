/* tools/upgrade-icons.js
 * Injects an inline SVG icon sprite and swaps emoji icons for Lucide-style SVGs.
 * Usage: node tools/upgrade-icons.js [--dry]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LUCIDE = path.join(__dirname, 'lucide');
const DRY = process.argv.includes('--dry');

const id = (n) => 'ico-' + n;

function lucideInner(name) {
  const file = path.join(LUCIDE, name + '.svg');
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  return m ? m[1].replace(/\s+class="[^"]*"/g, '').replace(/\n\s*/g, '').trim() : null;
}

/* Brand glyphs (custom, not from Lucide) */
const BRANDS = {
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/>',
  facebook: '<circle cx="12" cy="12" r="9"/><path fill="currentColor" stroke="none" d="M13.2 19.6v-6.7h2.2l.4-2.7h-2.6V8.55c0-.78.28-1.3 1.36-1.3h1.4V4.85c-.24-.03-1.07-.1-2.03-.1-2.01 0-3.39 1.23-3.39 3.48v2.07H8.2v2.7h2.34v6.7z"/>',
  youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path fill="currentColor" stroke="none" d="M10.1 9.1l5.5 2.9-5.5 2.9z"/>',
  x: '<path fill="currentColor" stroke="none" d="M4.4 4h4.3l4 5.5L17.3 4h2.3l-5.9 6.9L20.1 20h-4.3l-4.3-5.9L6.5 20H4.2l6.2-7.3z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.6V17"/><circle cx="8" cy="7.7" r="1.15" fill="currentColor" stroke="none"/><path d="M12 17v-3.7a2.4 2.4 0 0 1 4.8 0V17"/>',
  tiktok: '<path d="M14.6 3.2v10.4a3.8 3.8 0 1 1-3.8-3.8c.32 0 .63.04.92.12"/><path d="M14.6 6.4a5.7 5.7 0 0 0 5.5 2.9"/>',
  whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3A8.5 8.5 0 1 1 20.5 11.7z"/><path d="M9 9.4c.3 2.4 2.3 4.5 4.7 5 .6.1 1.2-.2 1.4-.8l.2-.6-1.9-1-.7.8a5.6 5.6 0 0 1-2.3-2.3l.8-.7-1-1.9-.6.2c-.6.2-.9.8-.6 1.3z"/>',
  slack: '<path d="M9 3.5a1.7 1.7 0 1 1 3.4 0V12a1.7 1.7 0 1 1-3.4 0z"/><path d="M15.7 9a1.7 1.7 0 1 1 0 3.4H7.3a1.7 1.7 0 1 1 0-3.4z" transform="translate(0 -2)"/><path d="M20.5 15a1.7 1.7 0 1 1-3.4 0V6.5a1.7 1.7 0 1 1 3.4 0z"/><path d="M3.5 18.5a1.7 1.7 0 1 1 0-3.4H12a1.7 1.7 0 1 1 0 3.4z"/>'
};

/* emoji -> icon id (generic) */
const GENERIC = {
  '📋': 'list-checks', '📊': 'chart-column', '📈': 'trending-up', '📉': 'trending-down',
  '🎯': 'target', '✅': 'circle-check', '✔️': 'circle-check', '👥': 'users', '💬': 'message-square',
  '💭': 'message-circle', '🧠': 'brain', '🤖': 'bot', '🔔': 'bell', '📧': 'mail', '✉️': 'mail',
  '📥': 'inbox', '⚡': 'zap', '🚀': 'rocket', '📝': 'pen-line', '📣': 'megaphone', '📄': 'file-text',
  '💰': 'dollar-sign', '🏆': 'award', '🔀': 'git-branch', '🔍': 'search', '🔎': 'search',
  '🔥': 'flame', '🤝': 'handshake', '🏢': 'building-2', '❓': 'circle-help', '⏱️': 'timer',
  '⏱': 'timer', '🎲': 'command', '🔥': 'flame', '🌟': 'sparkles', '✨': 'sparkles', '⭐': 'star',
  '📅': 'calendar', '🗓️': 'calendar-days', '🗓': 'calendar-days', '🗂️': 'square-kanban',
  '🗂': 'square-kanban', '📷': 'camera', '🎥': 'video', '🖼️': 'image', '🔎': 'search',
  '❄️': 'snowflake', '❄': 'snowflake', '🌤️': 'sun', '🌤': 'sun', '☀️': 'sun', '☀': 'sun',
  '🛡️': 'shield', '🛡': 'shield', '🔒': 'lock', '🔑': 'key', '🌍': 'globe', '🌐': 'globe',
  '📱': 'smartphone', '💻': 'monitor', '⚙️': 'settings', '⚙': 'settings', '🔧': 'settings',
  '🧪': 'puzzle', '🧩': 'puzzle', '📈': 'trending-up', '🧭': 'route', '🔀': 'git-branch',
  '⏱️': 'timer', '🚦': 'gauge', '🎯': 'target', '🏅': 'badge-check', '🎁': 'package',
  '💳': 'credit-card', '🧭': 'route', '📌': 'flag', '🚩': 'flag', '🔖': 'bookmark',
  '📂': 'folder', '📁': 'folder', '🧾': 'file-text', '✉': 'mail', '🤝': 'handshake',
  '🪄': 'wand-sparkles', '🪄': 'wand-sparkles', '🧠': 'brain', '🤖': 'bot', '📊': 'chart-column',
  '📋': 'list-checks', '🔍': 'search', '💡': 'lightbulb', '📣': 'megaphone', '🧪': 'puzzle',
  '⏱': 'timer', '↧': 'trending-down', '🔻': 'trending-down', '🔺': 'trending-up',
  '💬': 'message-square', '🗨️': 'message-square', '🗨': 'message-square',
  '📦': 'package', '🧮': 'calculator', '🧵': 'workflow', '🧬': 'network', '🗺️': 'map-pin',
  '🗺': 'map-pin', '🎨': 'palette', '🖌️': 'pen-line', '✂️': 'split', '📐': 'table',
  '🧮': 'table', '🗠': 'blocks', '🧰': 'blocks', '🛠️': 'puzzle', '🛠': 'puzzle',
  '📬': 'mail', '📪': 'mail', '📇': 'contact', '🗪': 'message-square', '🔔': 'bell',
  '🔕': 'bell-off', '✅': 'circle-check', '❗': 'circle-alert', '⚠️': 'circle-alert',
  '⚠': 'circle-alert', '🌐': 'globe', '🔗': 'link-2', '⛓️': 'link-2', '⛓': 'link-2',
  '🔁': 'refresh-cw', '🔃': 'refresh-cw', '🔄': 'refresh-cw', '⏩': 'fast-forward',
  '🔑': 'key', '🗝️': 'key', '🗝': 'key', '🗝': 'key', '⌚': 'clock', '⏰': 'alarm-clock',
  '🕰️': 'alarm-clock', '🕰': 'alarm-clock', '⌛': 'timer', '⏳': 'timer'
};

/* per-context maps */
const DROPDOWN = {
  '📋': 'list-checks', '🤖': 'bot', '⚡': 'zap', '📊': 'chart-column', '💼': 'briefcase',
  '📣': 'megaphone', '🏢': 'building-2', '🚀': 'rocket', '📝': 'pen-line', '📘': 'book-open',
  '❓': 'circle-help', '📄': 'file-text'
};
const FLOW = { '💬': 'message-square', '🧠': 'brain', '🎯': 'target', '📊': 'chart-column', '✅': 'circle-check', '👥': 'users' };
const TABS = { '📊': 'chart-column', '👥': 'users', '🗂️': 'square-kanban', '🗂': 'square-kanban', '📈': 'trending-up', '✨': 'sparkles', '🗓️': 'calendar-days', '🗓': 'calendar-days' };
const WORKFLOW = { '💬': 'message-square', '🧠': 'brain', '❓': 'circle-help', '👥': 'users', '📧': 'mail', '🔔': 'bell' };
const SCATTER = { 'insta': 'instagram', 'fb': 'facebook', 'yt': 'youtube', 'x': 'x', 'msg': 'message-square', 'mail': 'mail', 'linkedin': 'linkedin' };
const PLATFORM = { 'insta-logo': 'instagram', 'fb-logo': 'facebook', 'yt-logo': 'youtube', 'x-logo': 'x', 'li-logo': 'linkedin', 'tt-logo': 'tiktok' };
const PLATFORM_EMOJI = { '📷': 'instagram', '📘': 'facebook', '▶️': 'youtube', '▶': 'youtube', '🐦': 'x', '𝕏': 'x', '💼': 'linkedin', '🎵': 'tiktok' };
const AINODE_LABEL = {
  'Instagram': 'instagram', 'Facebook': 'facebook', 'YouTube': 'youtube', 'Messages': 'message-square',
  'Intent': 'target', 'Sentiment': 'message-circle', 'Lead Quality': 'star', 'Qualification': 'circle-check',
  'Priority': 'bell', 'Lead Score': 'chart-column', 'Qualified Lead': 'circle-check',
  'Recommended Action': 'list-checks', 'Sales Assignment': 'users'
};
const FOOTER_SOCIAL = { 'twitter': 'x', 'linkedin': 'linkedin', 'youtube': 'youtube', 'instagram': 'instagram', 'facebook': 'facebook' };

const EMOJI_RE = /\p{Extended_Pictographic}(?:\uFE0F| \u20E3)?/gu;

function svgFor(icon, cls) {
  return `<svg class="${cls || 'ico'}" aria-hidden="true"><use href="#${id(icon)}"></use></svg>`;
}

function replaceEmoji(str, map, extra) {
  return str.replace(EMOJI_RE, (e) => {
    const icon = (extra && extra[e]) || map[e] || GENERIC[e] || null;
    return icon ? svgFor(icon) : e;
  });
}

function replaceFirstEmoji(str, icon) {
  let done = false;
  return str.replace(EMOJI_RE, (e) => {
    if (done) return e;
    done = true;
    return icon ? svgFor(icon) : e;
  });
}

function firstEmoji(str) {
  const m = str.match(EMOJI_RE);
  return m ? m[0] : '';
}

function classList(attr) {
  const m = attr.match(/class="([^"]*)"/);
  return m ? m[1].split(/\s+/) : [];
}

function upgradeHtml(raw) {
  const out = [];
  let stats = { replaced: 0, sprite: false };

  /* ---- 1. sprite ---- */
  const used = new Set();
  const collect = (name) => { if (name && !used.has(name)) used.add(name); };
  Object.values(GENERIC).forEach(collect);
  [DROPDOWN, FLOW, TABS, WORKFLOW, SCATTER, PLATFORM, PLATFORM_EMOJI, AINODE_LABEL, FOOTER_SOCIAL].forEach(m => Object.values(m).forEach(collect));
  Object.keys(BRANDS).forEach(collect);

  /* ---- 2. element pass ---- */
  let html = raw;
  const tagRe = /<(span|div|i|button|a)\b([^>]*class="[^"]+"[^>]*)>/g;
  let m;
  const parts = [];
  let last = 0;
  const replacements = [];
  while ((m = tagRe.exec(html))) {
    const tag = m[1];
    const attrs = m[2];
    const openEnd = tagRe.lastIndex;
    const closeIdx = html.indexOf('</' + tag + '>', openEnd);
    if (closeIdx === -1) continue;
    const inner = html.slice(openEnd, closeIdx);
    const cls = classList(attrs);
    if (!cls.length) continue;
    let newInner = null;

    const has = (c) => cls.includes(c);

    if (has('dropdown__icon')) newInner = replaceEmoji(inner, DROPDOWN);
    else if (has('flow-icon')) newInner = replaceEmoji(inner, FLOW);
    else if (has('tour-tab')) newInner = replaceEmoji(inner, TABS);
    else if (has('workflow__node')) newInner = replaceEmoji(inner, WORKFLOW);
    else if (has('feature-card__icon')) newInner = replaceEmoji(inner, {});
    else if (has('nav-icon')) newInner = replaceEmoji(inner, {});
    else if (has('ai-icon')) newInner = replaceEmoji(inner, {});
    else if (has('core-icon')) newInner = replaceEmoji(inner, {});
    else if (has('scatter-item')) {
      const emoji = firstEmoji(inner);
      const mod = cls.find(c => SCATTER[c]);
      const icon = mod || SCATTER[emoji] || GENERIC[emoji];
      if (icon) newInner = replaceFirstEmoji(inner, icon);
    } else if (has('platform-logo')) {
      const emoji = firstEmoji(inner);
      const mod = cls.find(c => PLATFORM[c]);
      const icon = mod || PLATFORM_EMOJI[emoji] || GENERIC[emoji];
      if (icon) newInner = replaceFirstEmoji(inner, icon);
    } else if (has('ai-node')) {
      const emoji = firstEmoji(inner);
      const label = (attrs.match(/data-label="([^"]*)"/) || [])[1];
      const icon = (label && AINODE_LABEL[label]) || GENERIC[emoji];
      if (icon) newInner = replaceFirstEmoji(inner, icon);
    } else if (has('target-box') || has('ai-core__inner')) {
      newInner = replaceEmoji(inner, {});
    } else if (has('footer__social')) {
      newInner = inner.replace(/<a([^>]*)>([\s\S]*?)<\/a>/g, (all, aAttrs, aInner) => {
        const label = ((aAttrs.match(/aria-label="([^"]*)"/) || [])[1] || '').toLowerCase();
        const icon = FOOTER_SOCIAL[label];
        return icon ? `<a${aAttrs}>${svgFor(icon, 'ico ico--brand')}</a>` : all;
      });
    }

    if (newInner && newInner !== inner) {
      replacements.push([openEnd, closeIdx, newInner]);
      stats.replaced++;
    }
  }

  let res = html;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const [s, e, v] = replacements[i];
    res = res.slice(0, s) + v + res.slice(e);
  }

  /* ---- 3. sprite injection ---- */
  if (!res.includes('class="svg-sprite"')) {
    const symbols = [];
    for (const name of [...used].sort()) {
      const inner = BRANDS[name] || lucideInner(name);
      if (!inner) { console.warn('  ! missing icon: ' + name); continue; }
      const isBrand = !!BRANDS[name];
      const common = isBrand
        ? 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"'
        : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      symbols.push(`<symbol id="${id(name)}" viewBox="0 0 24 24" ${common}>${inner}</symbol>`);
    }
    const sprite = `\n    <!-- icon-sprite -->\n    <svg class="svg-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`;
    res = res.replace(/<body[^>]*>/, (b) => b + sprite);
    stats.sprite = true;
  }

  return { html: res, stats };
}

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let total = 0;
for (const f of files) {
  const p = path.join(ROOT, f);
  const raw = fs.readFileSync(p, 'utf8');
  const { html, stats } = upgradeHtml(raw);
  total += stats.replaced;
  if (!DRY) fs.writeFileSync(p, html);
  console.log(`${f.padEnd(24)} elements=${String(stats.replaced).padStart(4)} sprite=${stats.sprite ? 'yes' : 'no'}`);
}
console.log('total elements upgraded: ' + total);
