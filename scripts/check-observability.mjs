// Observability lint rule (native observability rollout, 2026-11-03).
//
// This Worker must never ship without the platform observability that
// feeds Workers Logs, Workers Traces, and Cloudflare Issues — and the
// wide-event middleware must stay wired into the app entry. Run via
// `npm run lint:observability`; it runs first in the `check` script so a
// regression fails the normal gate.
import { readFileSync } from 'node:fs';

const failures = [];

// wrangler.jsonc is JSONC: strip // and /* */ comments and trailing commas
// outside of strings, then parse it for real instead of regex-guessing.
function parseJsonc(text) {
  let out = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i++;
      continue;
    }
    out += ch;
  }
  return JSON.parse(out.replace(/,\s*([}\]])/g, '$1'));
}

const config = parseJsonc(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
const obs = config.observability ?? {};
if (obs.logs?.enabled !== true) {
  failures.push('wrangler.jsonc: observability.logs must exist with "enabled": true');
}
if (obs.traces?.enabled !== true) {
  failures.push('wrangler.jsonc: observability.traces must exist with "enabled": true');
}

const entry = readFileSync(new URL('../src/index.tsx', import.meta.url), 'utf8');
if (!entry.includes("from './wide-event'") || !entry.includes('wideEvent')) {
  failures.push('src/index.tsx: wideEvent middleware is not wired into the app');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('observability check passed: logs + traces enabled, wideEvent wired');
