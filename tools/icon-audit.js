const fs = require('fs');
const raw = fs.readFileSync('index.html', 'utf8');
const re = /<span class="dropdown__icon">([\s\S]*?)<\/span>\s*<span>([\s\S]*?)<\/span>/g;
let m;
while ((m = re.exec(raw))) {
  const icon = m[1].trim();
  const label = (m[2].match(/<strong>(.*?)<\/strong>/) || [, ''])[1];
  const small = (m[2].match(/<small>(.*?)<\/small>/) || [, ''])[1];
  process.stdout.write(`${JSON.stringify(icon)} -> ${label} / ${small}\n`);
}
