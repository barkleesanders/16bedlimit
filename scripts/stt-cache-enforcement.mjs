import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const source = readFileSync(join(root, 'src/index.tsx'), 'utf8');
const controls = [
  {
    name: 'malformed-transcript',
    before: "typeof cached?.text === 'string' && cached.text.trim()",
    after: 'cached?.text',
    failure: 'rejects a malformed cached transcript and runs inference',
  },
  {
    name: 'cache-bypass',
    before: "typeof cached?.text === 'string' && cached.text.trim()",
    after: "typeof cached?.text === 'string' && cached.text === 'never a transcript'",
    failure: 'reuses a successful transcript for matching audio without a second inference',
  },
  {
    name: 'cache-write-key',
    before: 'put(sttKey,',
    after: "put(sttKey + ':incorrect',",
    failure: 'reuses a successful transcript for matching audio without a second inference',
  },
  {
    name: 'transcript-http-cache',
    before: "c.res.headers.set('cache-control', 'private, no-store');",
    after: "c.res.headers.set('cache-control', 'public, max-age=300');",
    failure: 'keeps audio-derived responses private for cache hits and errors',
  },
];

for (const control of controls) {
  assert(source.includes(control.before), `Missing mutation target: ${control.name}`);
  const fixture = mkdtempSync(join(tmpdir(), '16bed-stt-negative-'));
  for (const file of [
    'src',
    'public',
    'package.json',
    'package-lock.json',
    'wrangler.jsonc',
    'biome.json',
    'tsconfig.json',
    'vitest.config.ts',
  ]) {
    cpSync(join(root, file), join(fixture, file), { recursive: true });
  }
  symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  writeFileSync(join(fixture, 'src/index.tsx'), source.replace(control.before, control.after));
  const format = spawnSync(
    process.execPath,
    [
      join(root, 'node_modules/@biomejs/biome/bin/biome'),
      'format',
      '--write',
      join(fixture, 'src/index.tsx'),
    ],
    { cwd: fixture, encoding: 'utf8', timeout: 10000 },
  );
  assert(!format.error && format.status === 0, `${control.name}: mutation format failed`);
  const result = spawnSync('npm', ['run', 'check'], {
    cwd: fixture,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' },
  });
  const output = (result.stdout || '') + (result.stderr || '');
  writeFileSync(join(fixture, 'check.log'), output);
  assert(!result.error, `${control.name}: ${result.error?.message}`);
  assert(result.status !== 0, `${control.name}: release accepted defective code`);
  assert(
    output.includes(`FAIL  src/stt-cache.test.ts`),
    `${control.name}: behavioral tests did not fail`,
  );
  assert(output.includes(control.failure), `${control.name}: expected behavioral failure absent`);
  console.log(`${control.name}=BLOCKED by actual Wrangler build gate; ${fixture}`);
}
