// Fetches today's Dubai gold rates (AED per gram) and writes them to a JSON file.
// Gulf News is tried first, Dubai City of Gold second. Runs in GitHub Actions on Node 20+, no dependencies.
// Usage: node scripts/fetch-rates.mjs <output.json>
import { writeFileSync } from 'node:fs';

const out = process.argv[2] || 'rates.json';
const plausible = v => v >= 50 && v <= 5000;
const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Gulf News: table with a "Date | 24 Carat | 22 Carat | ..." header, one row per day. Use the newest date.
function parseGulfNews(html) {
  for (const [table] of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const heads = [...table.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(m => strip(m[1]));
    const cols = {};
    heads.forEach((h, i) => { const m = h.match(/^(\d{2})\s*(?:Carat|Karat|K)/i); if (m) cols[m[1]] = i; });
    if (!Object.keys(cols).length) continue;
    let best = null;
    for (const [, row] of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => strip(m[1]));
      if (cells.length < heads.length) continue;
      const time = Date.parse(cells[0].replace(/(\d+)(st|nd|rd|th)/i, '$1'));
      if (!best || time > best.time) best = { date: cells[0], time, cells };
    }
    if (!best) continue;
    const rates = {};
    for (const k in cols) { const v = parseFloat(best.cells[cols[k]].replace(/,/g, '')); if (plausible(v)) rates[k] = v; }
    if (Object.keys(rates).length) return { rates, date: best.date };
  }
  return null;
}

// Dubai City of Gold: "24K Gold AED 485.00"-style text.
function parseDcog(html) {
  const text = strip(html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' '));
  const rates = {};
  for (const k of [24, 22, 21, 18, 14]) {
    const re = new RegExp('\\b' + k + '\\s*(?:Karat|Carat|KT|Ct|K)[^0-9]{0,60}?(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,3})?|\\d+(?:\\.\\d{1,3})?)', 'gi');
    for (const m of text.matchAll(re)) { const v = parseFloat(m[1].replace(/,/g, '')); if (plausible(v)) { rates[k] = v; break; } }
  }
  return Object.keys(rates).length ? { rates, date: null } : null;
}

const SOURCES = [
  { name: 'Gulf News', url: 'https://gulfnews.com/gold-forex/historical-gold-rates', parse: parseGulfNews },
  { name: 'Dubai City of Gold', url: 'https://dubaicityofgold.com/', parse: parseDcog },
];

for (const src of SOURCES) {
  try {
    const res = await fetch(src.url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) { console.warn(`${src.name}: HTTP ${res.status}`); continue; }
    const got = src.parse(await res.text());
    if (!got) { console.warn(`${src.name}: no rates found`); continue; }
    const data = { source: src.name, url: src.url, date: got.date, fetchedAt: new Date().toISOString(), rates: got.rates };
    writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
    console.log(JSON.stringify(data));
    process.exit(0);
  } catch (e) { console.warn(`${src.name}: ${e.message}`); }
}
// Leave no file behind so the page falls back to fetching live in the browser. Don't fail the deploy.
console.warn('No source returned rates; rates.json not written.');
