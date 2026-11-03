#!/usr/bin/env node
// webmcp-harness.mjs — execution proof for this site's WebMCP tools without a WebMCP browser.
// Loads webmcp-tools.js + webmcp.js (from --dir, default: public/) in a Node VM with a fake
// document.modelContext that captures registerTool() calls, then executes every Answer tool
// once with the WEBMCP.md sample inputs. fetch() is bound to --base (default: the live site,
// https://16bedlimit.com per wrangler.jsonc routes) so tools exercise the real
// /api/statute, /api/beds, /api/waivers and /api/sources surfaces the site itself publishes.
// For post-deploy proof against the SERVED files: download /webmcp-tools.js and /webmcp.js
// from the live site into a temp dir and pass --dir <tmpdir>.
// Usage: node tools/webmcp-harness.mjs [--base https://16bedlimit.com] [--dir public]
// Exit 0 = ≥1 tool registered and every Answer tool returned content (not {error}).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const base = opt('--base', 'https://16bedlimit.com').replace(/\/$/, '');
const dir = opt('--dir', 'public');

const registered = [];
const sandbox = {
  console,
  fetch: (u, init) => fetch(new URL(u, `${base}/`).href, init),
  location: { hash: '' },
  addEventListener: () => {},
};
sandbox.window = sandbox;
sandbox.document = {
  modelContext: {
    registerTool: async (tool) => {
      registered.push(tool);
    },
  },
  getElementById: () => null,
};
sandbox.navigator = {};

vm.createContext(sandbox);
for (const f of ['webmcp-tools.js', 'webmcp.js']) {
  vm.runInContext(readFileSync(join(dir, f), 'utf8'), sandbox, { filename: f });
}

await new Promise((r) => setTimeout(r, 50)); // registrar registers inside Promise.resolve().then()

if (!registered.length) {
  console.log('harness: FAIL — 0 tools registered');
  process.exit(1);
}
console.log(
  `harness: ${registered.length} tools registered: ${registered.map((t) => t.name).join(', ')}`,
);

const samples = {
  get_the_rule: {},
  get_bed_numbers: {},
  get_waiver_status: { state: 'NY' },
  list_sources: {},
};

let fail = 0;
let executed = 0;
for (const t of registered) {
  if (t.webmcpClass !== 'answer') {
    console.log(`harness: skip ${t.name} (class=${t.webmcpClass || '?'})`);
    continue;
  }
  const out = await t.execute(samples[t.name] ?? {});
  const ok = out && Array.isArray(out.content) && out.content[0]?.text?.length > 0;
  executed++;
  console.log(
    `harness: ${t.name} -> ${ok ? 'ok' : 'FAIL'} ${
      ok
        ? `(${out.content[0].text.length} chars: ${out.content[0].text.slice(0, 110).replace(/\s+/g, ' ')}…)`
        : JSON.stringify(out)
    }`,
  );
  if (!ok) fail++;
}

console.log(
  fail
    ? `harness: FAIL (${fail} answer tools)`
    : `harness: PASS (${executed} answer tools executed)`,
);
process.exit(fail ? 1 : 0);
