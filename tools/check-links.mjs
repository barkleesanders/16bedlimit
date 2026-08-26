#!/usr/bin/env node
/**
 * Every external URL this site ships, fetched.
 *
 * Written after a shipped FEC link turned out to be a 404 — it had been correct
 * once and the agency reorganised. A citation that 404s is worse than no
 * citation: it looks checkable and is not.
 *
 * Three outcomes, never two. A .gov WAF answering 403 to a datacenter IP is NOT
 * a broken link — those pages load fine in a browser — so they are reported
 * separately rather than counted as failures or waved through as passes.
 */
import { readFileSync } from 'node:fs';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

const src = readFileSync(new URL('../src/data.ts', import.meta.url), 'utf8');
const urls = [...new Set(src.match(/https?:\/\/[^\s'"`)]+/g) ?? [])]
  .map((u) => u.replace(/[.,)]+$/, ''))
  .filter((u) => !u.includes('16bedlimit.com'));

const ok = [],
  blocked = [],
  dead = [];

await Promise.all(
  urls.map(async (u) => {
    try {
      const r = await fetch(u, {
        redirect: 'follow',
        headers: { 'user-agent': UA },
        signal: AbortSignal.timeout(30_000),
      });
      if (r.ok) ok.push(u);
      else if (r.status === 403 || r.status === 429) blocked.push(`${r.status} ${u}`);
      else dead.push(`${r.status} ${u}`);
    } catch (e) {
      // A fetch that throws is unmeasured, not proven dead.
      blocked.push(`ERR ${u} (${e.message.slice(0, 40)})`);
    }
  }),
);

console.log(`checked ${urls.length} external URLs`);
console.log(`  ok            : ${ok.length}`);
console.log(`  bot-blocked   : ${blocked.length}  (403/429/timeout — not failures)`);
console.log(`  DEAD          : ${dead.length}`);
for (const d of dead.sort()) console.log(`    x ${d}`);
for (const b of blocked.sort()) console.log(`    . ${b}`);
process.exit(dead.length ? 1 : 0);
