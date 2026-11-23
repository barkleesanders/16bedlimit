import { Hono } from 'hono';

/* Traks managed first-party mount.
 *
 * The page loads /__traks/t.js from its own origin; the tracker beacons to
 * /__traks/event on its own origin. Both are proxied to the Traks collector,
 * so the CSP stays `script-src 'self'` / `connect-src 'self'` and a blocker
 * that drops third-party analytics hosts cannot see the traffic.
 *
 * Why the script is rewritten rather than copied: the collector's t.js posts
 * to `new URL(script.src).origin + "/api/event"`, which for a first-party src
 * would be this Worker's /api/event — not a route here. The one literal is
 * swapped and the swap is asserted: if the collector build ever stops
 * containing it, /__traks/t.js answers 502 instead of serving a tracker that
 * beacons into a 404 (the founding silent failure of this stack).
 */

export const TRAKS_COLLECTOR = 'https://analytics-collect.aivaclaims.com';
export const TRAKS_SITE_KEY = 'pb_live_b3qth4jsc6aplqlrwh2gdmaj';
export const TRAKS_HOSTS: readonly string[] = ['16bedlimit.com', 'www.16bedlimit.com'];

const UPSTREAM_BEACON_PATH = '"/api/event"';
const FIRST_PARTY_BEACON_PATH = '"/__traks/event"';

/* Body ceiling. CEILING: t.js caps path (2048), referrer (2048) and event
 * props (1024) and sends fixed-width ids, so a worst-case ASCII event is ~6 KB;
 * 16 KiB leaves room for JSON escaping of non-ASCII. CORPUS: measured against
 * the collector's own caps above, not against traffic — this site's pageview
 * beacons are a few hundred bytes. Oversize answers 413 (loud), never truncates. */
const MAX_BEACON_BYTES = 16 * 1024;

const traks = new Hono<{ Bindings: { SITE_ORIGIN?: string } }>();

traks.get('/__traks/t.js', async (c) => {
  let upstream: Response;
  try {
    upstream = await fetch(`${TRAKS_COLLECTOR}/t.js`, {
      cf: { cacheTtl: 3600, cacheEverything: true },
    } as RequestInit);
  } catch {
    return c.text('tracker unavailable', 502);
  }
  if (!upstream.ok) return c.text('tracker unavailable', 502);
  const src = await upstream.text();
  if (!src.includes(UPSTREAM_BEACON_PATH) || src.length < 500) {
    return c.text('tracker build not recognised', 502);
  }
  return c.body(src.replace(UPSTREAM_BEACON_PATH, FIRST_PARTY_BEACON_PATH), 200, {
    'content-type': 'application/javascript; charset=utf-8',
    'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
  });
});

traks.post('/__traks/event', async (c) => {
  const origin = c.req.header('origin') ?? '';
  const allowed = TRAKS_HOSTS.some((h) => origin === `https://${h}`);
  if (!allowed) return c.body(null, 403);

  const declared = Number(c.req.header('content-length') ?? '0');
  if (declared > MAX_BEACON_BYTES) return c.body(null, 413);
  const raw = await c.req.text();
  if (raw.length > MAX_BEACON_BYTES) return c.body(null, 413);

  let event: { s?: unknown; h?: unknown };
  try {
    event = JSON.parse(raw);
  } catch {
    return c.body(null, 400);
  }
  if (event.s !== TRAKS_SITE_KEY) return c.body(null, 403);
  if (typeof event.h !== 'string' || !TRAKS_HOSTS.includes(event.h)) return c.body(null, 403);

  const headers: Record<string, string> = { 'content-type': 'text/plain' };
  const ua = c.req.header('user-agent');
  if (ua) headers['user-agent'] = ua;
  const ip = c.req.header('cf-connecting-ip');
  if (ip) headers['x-forwarded-for'] = ip;
  const referer = c.req.header('referer');
  if (referer) headers.referer = referer;
  const country = c.req.header('cf-ipcountry');
  if (country) headers['cf-ipcountry'] = country;

  try {
    const res = await fetch(`${TRAKS_COLLECTOR}/api/event`, {
      method: 'POST',
      headers,
      body: raw,
    });
    return c.body(null, res.status as 200);
  } catch {
    return c.body(null, 502);
  }
});

export default traks;
