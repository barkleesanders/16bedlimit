import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Controls mutate this repository's own published tool files. No substitute
// inventory, live requests, gate exemptions, or updated golden assertions.
const source = readFileSync('public/webmcp-tools.js', 'utf8');
const registrar = readFileSync('public/webmcp.js', 'utf8');
const checker = resolve('tools/webmcp-source-check.mjs');
const cases = [
  ['actual inventory', (s) => s, 0],
  ['no inventory', (s) => s.replace('window.WEBMCP_TOOLS = [', 'window.NOT_TOOLS = ['), 1],
  ['unreviewed registrar', (s) => s, 2, (s) => s + '\n// changed registrar bytes\n'],
  ['invalid name', (s) => s.replace("name: 'get_the_rule'", "name: 'bad name'"), 1],
  ['duplicate name', (s) => s.replace("name: 'get_bed_numbers'", "name: 'get_the_rule'"), 1],
  ['missing description', (s) => s.replace('description:', 'missingDescription:'), 1],
  [
    'invalid schema',
    (s) => s.replace("inputSchema: { type: 'object'", "inputSchema: { type: 'string'"),
    1,
  ],
  ['invalid schema properties', (s) => s.replace('properties: {}', 'properties: []'), 1],
  ['missing execute', (s) => s.replace('execute:', 'missingExecute:'), 1],
  [
    'sensitive without confirmation',
    (s) => s.replace("webmcpClass: 'answer'", "webmcpClass: 'sensitive'"),
    1,
  ],
  ['no answer tier2', (s) => s.replaceAll("webmcpClass: 'answer'", "webmcpClass: 'action'"), 1],
  [
    'dynamic inventory',
    (s) => s.replace('window.WEBMCP_TOOLS = [', 'window.WEBMCP_TOOLS = [...unknownTools,'),
    2,
  ],
];
for (const [name, mutate, expected, mutateRegistrar = (s) => s] of cases) {
  const root = mkdtempSync(join(tmpdir(), 'webmcp-source-control-'));
  try {
    const changed = mutate(source);
    const changedRegistrar = mutateRegistrar(registrar);
    if (expected !== 0)
      assert.ok(changed !== source || changedRegistrar !== registrar, `${name}: mutation absent`);
    writeFileSync(join(root, 'webmcp-tools.js'), changed);
    writeFileSync(join(root, 'webmcp.js'), changedRegistrar);
    const result = spawnSync(process.execPath, [checker, '--source', root, '--require', '2'], {
      encoding: 'utf8',
    });
    assert.equal(result.status, expected, `${name}: ${result.stdout}${result.stderr}`);
    if (expected === 0) {
      const report = JSON.parse(result.stdout);
      assert.equal(report.tools.length, 5);
      assert.equal(report.tools.filter((t) => t.cls === 'answer').length, 4);
    }
    console.log(`${name}: ${expected === 0 ? 'PASS' : 'BLOCKED'}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
