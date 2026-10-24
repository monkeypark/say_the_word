// One-off helper: adds light-mode base classes while keeping existing dark styling under `dark:`.
import fs from 'node:fs';

const file = process.argv[2];
let src = fs.readFileSync(file, 'utf8');

const MAP = {
  'bg-slate-950': 'bg-white',
  'bg-slate-900': 'bg-slate-50',
  'bg-slate-800': 'bg-slate-100',
  'bg-slate-700': 'bg-slate-200',
  'border-slate-800': 'border-slate-300',
  'border-slate-700': 'border-slate-300',
  'border-slate-600': 'border-slate-400',
  'text-slate-100': 'text-slate-800',
  'text-slate-200': 'text-slate-800',
  'text-slate-300': 'text-slate-700',
  'text-slate-400': 'text-slate-600',
  'text-slate-500': 'text-slate-600',
  'hover:bg-slate-800': 'hover:bg-slate-200',
  'hover:bg-slate-700': 'hover:bg-slate-200',
  'hover:border-slate-700': 'hover:border-slate-400',
  'hover:text-white': 'hover:text-slate-900',
  'hover:text-slate-200': 'hover:text-slate-900',
  'hover:text-slate-300': 'hover:text-slate-900',
  'placeholder:text-slate-600': 'placeholder:text-slate-400',
  'placeholder:text-slate-500': 'placeholder:text-slate-400',
  'bg-[#0c101a]': 'bg-white',
  'bg-[#0f1422]': 'bg-white',
};
const PASTEL = /^(hover:)?text-(pink|rose|emerald|amber|purple|indigo|cyan|blue|orange|teal|violet|red|yellow|green|sky|fuchsia)-(200|300|400)$/;
const SOLID_BG = /\b(bg-gradient|bg-(pink|purple|emerald|rose|indigo|cyan|amber|blue|teal|violet|red|orange|green)-(500|600|700)\b|from-(pink|purple|emerald|indigo|cyan|blue|teal|violet)-(500|600))/;

const tokenRe = /(?<![\w:-])((?:hover:|focus:|placeholder:|group-hover:)?(?:bg|text|border|from|to|via)-(?:\[#[0-9a-fA-F]+\]|[a-z]+(?:-\d+)?|white|black)(?:\/\d+)?)(?![\w-])/g;

let count = 0;
src = src.replace(tokenRe, (m, tok, offset) => {
  // find enclosing quoted segment
  let s = offset, e = offset;
  const quotes = '"\'`';
  while (s > 0 && !quotes.includes(src[s - 1])) s--;
  while (e < src.length && !quotes.includes(src[e])) e++;
  const seg = src.slice(s, e);
  if (seg.includes('dark:' + tok)) return m;

  const base = tok.replace(/\/\d+$/, '');
  const hasSolid = SOLID_BG.test(seg);
  let light = null;

  if (base === 'text-white') {
    if (hasSolid) return m;
    light = 'text-slate-900';
  } else if (MAP[base]) {
    if (base.startsWith('text-') || base.startsWith('hover:text-')) { /* ok */ }
    light = MAP[base];
  } else if (PASTEL.test(base)) {
    if (hasSolid) return m;
    const [, hv, col, shade] = base.match(PASTEL);
    light = `${hv || ''}text-${col}-${shade === '200' ? '800' : shade === '300' ? '700' : '600'}`;
  }
  if (!light) return m;
  count++;
  return `${light} dark:${tok}`;
});

fs.writeFileSync(file, src);
console.log(`${file}: ${count} tokens converted`);
