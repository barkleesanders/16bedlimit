import { afterEach, describe, expect, it, vi } from 'vitest';
import traks, { TRAKS_SITE_KEY } from './traks';

const FAKE_TRACKER = `"use strict";(()=>{let C=new URL(p.src).origin+"/api/event";${'x'.repeat(600)}})();`;
const ORIGIN = 'https://16bedlimit.com';
const goodBody = JSON.stringify({ t: 'pageview', s: TRAKS_SITE_KEY, p: '/', h: '16bedlimit.com' });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function beacon(body: string, headers: Record<string, string> = { origin: ORIGIN }) {
  return traks.request('/__traks/event', { method: 'POST', body, headers });
}

describe('/__traks/t.js', () => {
  it('serves the collector tracker retargeted at the first-party endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(FAKE_TRACKER)));
    const res = await traks.request('/__traks/t.js');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('javascript');
    const js = await res.text();
    expect(js).toContain('"/__traks/event"');
    expect(js).not.toContain('"/api/event"');
  });

  it('fails loudly (502) when the collector build no longer has the beacon literal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('y'.repeat(900))));
    expect((await traks.request('/__traks/t.js')).status).toBe(502);
  });

  it('502s when the collector is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect((await traks.request('/__traks/t.js')).status).toBe(502);
  });
});

describe('/__traks/event', () => {
  it('forwards a same-origin beacon to the collector and relays its status', async () => {
    const f = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', f);
    const res = await beacon(goodBody, { origin: ORIGIN, 'user-agent': 'Mozilla/5.0 test' });
    expect(res.status).toBe(200);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0]?.[0]).toBe('https://analytics-collect.aivaclaims.com/api/event');
    expect((f.mock.calls[0]?.[1] as RequestInit).body).toBe(goodBody);
  });

  it.each([
    ['missing Origin', {}, goodBody],
    ['foreign Origin', { origin: 'https://evil.example' }, goodBody],
    [
      'foreign site key',
      { origin: ORIGIN },
      JSON.stringify({ t: 'pageview', s: 'pb_live_other', h: '16bedlimit.com' }),
    ],
    [
      'foreign hostname',
      { origin: ORIGIN },
      JSON.stringify({ t: 'pageview', s: TRAKS_SITE_KEY, h: 'evil.example' }),
    ],
  ])('403s and never forwards: %s', async (_name, headers, body) => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    expect((await beacon(body, headers as Record<string, string>)).status).toBe(403);
    expect(f).not.toHaveBeenCalled();
  });

  it('400s on a non-JSON body and 413s on an oversize one', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    expect((await beacon('not json')).status).toBe(400);
    expect((await beacon('z'.repeat(17 * 1024))).status).toBe(413);
    expect(f).not.toHaveBeenCalled();
  });
});
