import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { HeroChart, SizeChart, WaiverMap } from './charts';
import { CLIENT_JS } from './client-script';
import {
  ACTION_TARGETS,
  ARGUMENTS,
  BED_HEADLINE,
  BED_SERIES,
  BILL_COMMITTEE,
  BILLS,
  CONSEQUENCES,
  CONTACT_EMAIL,
  CONTACT_INTENTS,
  FEDERAL_LEVERS,
  FUNDING_ROUTES,
  HERO_CAVEAT,
  HOSPITAL_SIZE,
  INCARCERATION_NOTE,
  JAIL_SERIES,
  PREVALENCE,
  PRISON_SERIES,
  RECORD_FINDINGS,
  RECORD_NAMED,
  RECORD_UNKNOWNS,
  REPORT,
  RETRIEVED,
  ROLL_CALLS,
  SITE_QUESTIONS,
  SMI_APPROVED,
  SMI_PENDING,
  SOURCES,
  STATUTE,
  SUD_APPROVED,
  SUD_PENDING,
  SUGGESTED_QUESTIONS,
  SUPPORT_DRAFTS,
  systemPrompt,
  TIMELINE,
  WAIVER_AS_OF,
  WAIVER_SOURCE,
  WAIVER_SOURCE_NAME,
  WAIVER_TRACKER,
  WHY_SIXTEEN,
} from './data';
import { FRESHNESS_KEY, type FreshnessReport, runFreshnessCheck } from './freshness';
import { OG_HEIGHT, OG_WIDTH, ogPng } from './og-image';
import { CSS } from './styles';

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

type Bindings = {
  AI: Ai;
  SITE_ORIGIN: string;
  CHAT_LIMIT: RateLimiter;
  MEDIA_LIMIT: RateLimiter;
  /** Stores the weekly data-freshness report. Optional so a missing binding
   *  degrades to "not checked yet" rather than throwing on every request. */
  FRESHNESS?: KVNamespace;
};

/**
 * Per-IP gate on the metered AI routes. Returns a 429 Response when the caller
 * is over budget, or null to proceed.
 *
 * Fails OPEN by design: if the binding is unavailable the site keeps answering
 * questions rather than going dark. A limiter outage should degrade cost
 * control, not the public explainer. The failure is logged so it is visible.
 */
async function rateLimited(
  limiter: RateLimiter | undefined,
  request: Request,
  route: string,
): Promise<Response | null> {
  if (!limiter) return null;
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  try {
    const { success } = await limiter.limit({ key: `${route}:${ip}` });
    if (success) return null;
    console.log(JSON.stringify({ event: 'rate_limited', route }));
    return Response.json(
      { error: 'Too many requests. Wait a minute and try again.' },
      { status: 429, headers: { 'retry-after': '60' } },
    );
  } catch (err) {
    console.log(
      JSON.stringify({
        event: 'rate_limiter_unavailable',
        route,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return null;
  }
}

const app = new Hono<{ Bindings: Bindings }>();

/* ---------------- security headers ----------------
 * Strict CSP. The only external origin is Google Fonts. No inline script —
 * the client island is served from /app.js. 'unsafe-inline' is needed for
 * style only because the stylesheet itself is inlined in <head>.
 */
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    referrerPolicy: 'strict-origin-when-cross-origin',
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'DENY',
  }),
);

/* Fail-safe cache posture: nothing is user-specific here, but be explicit. */
app.use('*', async (c, next) => {
  await next();
  if (!c.res.headers.has('cache-control')) {
    c.res.headers.set('cache-control', 'public, max-age=300, s-maxage=600');
  }
});

/* ================================================================
 * ASSETS
 * ================================================================ */

app.get('/app.js', (c) =>
  c.body(CLIENT_JS, 200, {
    'content-type': 'text/javascript; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  }),
);

// Plain Response rather than c.body(): Hono's Data type does not include
// Uint8Array, and widening it with a cast would be the wrong direction.
app.get(
  '/og.png',
  () =>
    new Response(ogPng(), {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=86400, s-maxage=604800',
      },
    }),
);

app.get('/robots.txt', (c) =>
  c.text(`User-agent: *\nAllow: /\nSitemap: ${c.env.SITE_ORIGIN || ''}/sitemap.xml\n`),
);

app.get('/sitemap.xml', (c) => {
  const o = c.env.SITE_ORIGIN || new URL(c.req.url).origin;
  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${o}/</loc><lastmod>${RETRIEVED}</lastmod><priority>1.0</priority></url>\n<url><loc>${o}${REPORT.href}</loc><lastmod>${REPORT.retrieved}</lastmod><priority>0.8</priority></url>\n</urlset>\n`,
    200,
    { 'content-type': 'application/xml; charset=utf-8' },
  );
});

app.get('/.well-known/security.txt', (c) =>
  c.text(
    `Contact: mailto:${CONTACT_EMAIL}\nPreferred-Languages: en\nExpires: 2027-12-31T23:59:59.000Z\n`,
  ),
);

/* ================================================================
 * DATA API — the research layer, public and citable
 * ================================================================ */

const api = new Hono<{ Bindings: Bindings }>();

api.get('/', (c) =>
  c.json({
    name: '16bedlimit.com data API',
    description:
      "Verified figures behind the site's explanation of Medicaid's institution for mental diseases (IMD) exclusion. Every figure carries its source.",
    retrieved: RETRIEVED,
    license: 'Figures belong to their cited sources. Attribution appreciated.',
    endpoints: [
      '/api/statute',
      '/api/timeline',
      '/api/beds',
      '/api/incarceration',
      '/api/hospital-size',
      '/api/waivers',
      '/api/consequences',
      '/api/bills',
      '/api/arguments',
      '/api/funding',
      '/api/sources',
    ],
  }),
);

api.get('/statute', (c) => c.json({ ...STATUTE, retrieved: RETRIEVED }));
api.get('/timeline', (c) => c.json({ retrieved: RETRIEVED, timeline: TIMELINE }));

api.get('/beds', (c) =>
  c.json({
    retrieved: RETRIEVED,
    note: 'Measured census and survey years only. No interpolation.',
    headline: {
      peakYear: BED_HEADLINE.peakYear,
      peakBeds: BED_HEADLINE.peakBeds,
      latestYear: BED_HEADLINE.latestYear,
      latestBeds: BED_HEADLINE.latestBeds,
      absoluteDeclinePct: Number(BED_HEADLINE.pctDecline.toFixed(1)),
      publicBedDecline: BED_HEADLINE.publicBedDeclineClaim,
      publicBedDeclineSource: BED_HEADLINE.publicBedDeclineSource,
    },
    series: BED_SERIES,
  }),
);

api.get('/incarceration', (c) =>
  c.json({
    retrieved: RETRIEVED,
    definitionNote: INCARCERATION_NOTE,
    causationNote: HERO_CAVEAT,
    prison: PRISON_SERIES,
    jail: JAIL_SERIES,
  }),
);

api.get('/hospital-size', (c) => c.json({ ...HOSPITAL_SIZE, retrieved: RETRIEVED }));

api.get('/waivers', (c) =>
  c.json({
    retrieved: RETRIEVED,
    asOf: WAIVER_AS_OF,
    source: WAIVER_SOURCE,
    sourceName: WAIVER_SOURCE_NAME,
    tracker: WAIVER_TRACKER,
    note: 'A section 1115 waiver is a time-limited demonstration, not a change in the underlying law.',
    substanceUseDisorder: { approved: SUD_APPROVED, pending: SUD_PENDING },
    mentalHealth: { approved: SMI_APPROVED, pending: SMI_PENDING },
  }),
);

api.get('/consequences', (c) =>
  c.json({ retrieved: RETRIEVED, consequences: CONSEQUENCES, prevalence: PREVALENCE }),
);
api.get('/bills', (c) => c.json({ retrieved: RETRIEVED, congress: 119, bills: BILLS }));
api.get('/arguments', (c) => c.json({ retrieved: RETRIEVED, ...ARGUMENTS }));
api.get('/funding', (c) =>
  c.json({
    retrieved: RETRIEVED,
    disclaimer:
      'Descriptive summary of what each vehicle may and may not do, with a link to the governing authority. This is not legal advice.',
    routes: FUNDING_ROUTES,
  }),
);
api.get('/sources', (c) => c.json({ retrieved: RETRIEVED, sources: SOURCES }));

/**
 * The site's own staleness, exposed. If the weekly check found a newer upstream
 * release than what is plotted, this says so — including when the check itself
 * failed, which is reported as "unknown" and never as "current".
 */
api.get('/freshness', async (c) => {
  const kv = c.env.FRESHNESS;
  if (!kv) {
    return c.json({
      status: 'unconfigured',
      note: 'No freshness store is bound, so no automated check has run. The figures on this site are unaffected: each one carries its own source and retrieval date.',
    });
  }
  const raw = await kv.get(FRESHNESS_KEY);
  if (!raw) {
    return c.json({
      status: 'not-yet-checked',
      note: 'The weekly check has not run since this store was created.',
    });
  }
  return c.json(JSON.parse(raw) as FreshnessReport);
});

// NOTE: every api.* route must be registered ABOVE this line. Hono's
// app.route() copies the sub-app's routes at call time, so a route added after
// the mount is silently unreachable — it returns the site's 404 page with no
// error anywhere. /api/freshness shipped that way once.
app.route('/api', api);

/* ================================================================
 * ASSISTANT — Workers AI, grounded strictly in the corpus above
 * ================================================================ */

/**
 * Model order is measured, not assumed (checked against the live Workers AI
 * API on 2026-08-26 with the same question this site answers):
 *
 *  - llama-3.3-70b-instruct-fp8-fast  → correct, concise, streams plain text.
 *  - gpt-oss-120b                     → a REASONING model. It spent 791 tokens
 *    in a `reasoning` field before emitting any `content`, and at a normal
 *    token ceiling returned content:null (finish_reason "length"). Its
 *    ungrounded answer was also wrong on the two facts this site exists to get
 *    right: it said "more than 30 days" and "dual-eligible" instead of
 *    "more than 16 beds" and "ages 21 to 64".
 *
 * So the biggest model is not the best model for this job. Grounded, fast, and
 * speakable wins; gpt-oss stays as a fallback with a bigger token budget.
 */
const CHAT_MODELS = [
  { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', maxTokens: 800 },
  { id: '@cf/meta/llama-4-scout-17b-16e-instruct', maxTokens: 800 },
  { id: '@cf/openai/gpt-oss-120b', maxTokens: 2500 },
] as const;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Workers AI's generated model registry types every model id as a distinct
 * literal with its own params shape, so a runtime-selected id cannot be
 * checked against it statically. Rather than assert the RESULT type, we let
 * the value stay `unknown` and narrow it with a real `instanceof` check — a
 * model that does not stream is then a caught error that fails over to the
 * next model, instead of a lie the type system was told to believe.
 */
async function runChatStream(
  ai: Ai,
  modelId: string,
  maxTokens: number,
  messages: ChatMessage[],
): Promise<ReadableStream> {
  const params = { messages, stream: true, max_tokens: maxTokens, temperature: 0.2 };

  // The two casts below are confined to this one call and are about the model
  // ID being dynamic, not about the result. The result is proven below.
  const result: unknown = await ai.run(modelId as keyof AiModels, params as never);

  if (!(result instanceof ReadableStream)) {
    throw new Error(
      `${modelId} returned ${result === null ? 'null' : typeof result} rather than a stream`,
    );
  }
  return result;
}

app.post('/api/chat', async (c) => {
  const limited = await rateLimited(c.env.CHAT_LIMIT, c.req.raw, 'chat');
  if (limited) return limited;

  let body: { question?: unknown; history?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Body must be JSON.' }, 400);
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) return c.json({ error: 'Ask a question.' }, 400);
  if (question.length > 1200) return c.json({ error: 'That question is too long.' }, 400);

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (m): m is { role: 'user' | 'assistant'; content: string } =>
            !!m &&
            typeof m === 'object' &&
            'role' in m &&
            'content' in m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string',
        )
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2500) }))
    : [];

  const messages = [
    { role: 'system' as const, content: systemPrompt() },
    ...history,
    { role: 'user' as const, content: question },
  ];

  let lastErr = '';
  for (const model of CHAT_MODELS) {
    try {
      const stream = await runChatStream(c.env.AI, model.id, model.maxTokens, messages);

      return new Response(stream, {
        headers: {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-store',
          'x-model': model.id,
        },
      });
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
      console.log(
        JSON.stringify({
          event: 'chat_model_failed',
          model: model.id,
          error: lastErr,
          qLen: question.length,
        }),
      );
    }
  }

  console.log(JSON.stringify({ event: 'chat_all_models_failed', error: lastErr }));
  return c.json({ error: 'The assistant is unavailable right now.', detail: lastErr }, 503);
});

/* ---- speech to text ----
 * nova-3 documents `audio` as a required object; the page does not spell out
 * the object's fields, so we try the Deepgram {body, contentType} shape first
 * and fall back to whisper-large-v3-turbo, whose base64 shape IS documented.
 * Whichever answers is reported in x-stt-model.
 */
app.post('/api/stt', async (c) => {
  const limited = await rateLimited(c.env.MEDIA_LIMIT, c.req.raw, 'stt');
  if (limited) return limited;

  const buf = await c.req.arrayBuffer();
  if (!buf.byteLength) return c.json({ error: 'No audio received.' }, 400);
  if (buf.byteLength > 12_000_000) return c.json({ error: 'That clip is too long.' }, 413);

  const contentType = c.req.header('content-type') || 'audio/webm';

  try {
    const r = (await c.env.AI.run(
      '@cf/deepgram/nova-3' as keyof AiModels,
      {
        audio: { body: buf, contentType },
      } as never,
    )) as { text?: string; results?: unknown };
    const text = extractTranscript(r);
    if (text) return c.json({ text }, 200, { 'x-stt-model': 'nova-3' });
    console.log(JSON.stringify({ event: 'stt_nova3_empty', bytes: buf.byteLength, contentType }));
  } catch (err) {
    console.log(
      JSON.stringify({
        event: 'stt_nova3_failed',
        error: err instanceof Error ? err.message : String(err),
        bytes: buf.byteLength,
        contentType,
      }),
    );
  }

  try {
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 8192) {
      bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    const r = (await c.env.AI.run(
      '@cf/openai/whisper-large-v3-turbo' as keyof AiModels,
      {
        audio: btoa(bin),
      } as never,
    )) as { text?: string };
    if (r?.text) return c.json({ text: r.text }, 200, { 'x-stt-model': 'whisper-large-v3-turbo' });
    return c.json({ error: 'No speech detected in that clip.' }, 200);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ event: 'stt_whisper_failed', error: detail }));
    return c.json({ error: 'Transcription is unavailable right now.' }, 503);
  }
});

function extractTranscript(r: unknown): string {
  if (!r || typeof r !== 'object') return '';
  const rec = r as Record<string, unknown>;
  if (typeof rec.text === 'string' && rec.text.trim()) return rec.text.trim();
  const results = rec.results as Record<string, unknown> | undefined;
  const channels = results?.channels as Array<Record<string, unknown>> | undefined;
  const alt = channels?.[0]?.alternatives as Array<Record<string, unknown>> | undefined;
  const t = alt?.[0]?.transcript;
  return typeof t === 'string' ? t.trim() : '';
}

/* ---- text to speech ---- */
app.post('/api/tts', async (c) => {
  const limited = await rateLimited(c.env.MEDIA_LIMIT, c.req.raw, 'tts');
  if (limited) return limited;

  let body: { text?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Body must be JSON.' }, 400);
  }
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, 1800) : '';
  if (!text) return c.json({ error: 'Nothing to speak.' }, 400);

  try {
    const r = (await c.env.AI.run(
      '@cf/deepgram/aura-1' as keyof AiModels,
      {
        text,
        speaker: 'athena',
        encoding: 'mp3',
      } as never,
    )) as unknown;

    if (r instanceof ReadableStream) {
      return new Response(r, {
        headers: { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' },
      });
    }
    if (r instanceof ArrayBuffer) {
      return new Response(r, {
        headers: { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' },
      });
    }
    if (r && typeof r === 'object' && 'audio' in r) {
      const a = (r as { audio: unknown }).audio;
      if (typeof a === 'string') {
        const bin = atob(a);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return new Response(out, {
          headers: { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' },
        });
      }
    }
    console.log(JSON.stringify({ event: 'tts_unexpected_shape', shape: typeof r }));
    return c.json({ error: 'Speech synthesis returned an unexpected format.' }, 502);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ event: 'tts_failed', error: detail, len: text.length }));
    return c.json({ error: 'Speech is unavailable right now.' }, 503);
  }
});

/* ================================================================
 * PAGE
 * ================================================================ */

function mailto(intent: (typeof CONTACT_INTENTS)[number]): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(intent.subject)}&body=${encodeURIComponent(intent.body)}`;
}

const KEY_YEARS = new Set([1965, 1988]);

app.get('/', (c) => {
  // Self-referencing on purpose. Absolute social URLs must resolve at the
  // moment a scraper reads them, and SITE_ORIGIN can legitimately name a
  // domain that is not serving yet (freshly registered, DNS still moving).
  // Pointing og:image at a host that 404s produces a broken card that
  // Facebook and X then cache. Using the origin the request actually arrived
  // on is correct on workers.dev today and on the custom domain tomorrow,
  // with no redeploy in between.
  const origin = new URL(c.req.url).origin;
  const title = 'The 16-Bed Limit — how one Medicaid rule shaped American psychiatric care';
  const desc =
    'Medicaid will not pay for adults aged 21 to 64 in a psychiatric facility with more than 16 beds. The average psychiatric hospital has 108. Here is the rule, the data, and the bills that would change it.';

  return c.html(
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/`} />
        <meta property="og:site_name" content="The 16-Bed Limit" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content="Medicaid stops paying at 16 beds." />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${origin}/`} />
        <meta property="og:image" content={`${origin}/og.png`} />
        <meta property="og:image:secure_url" content={`${origin}/og.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content={String(OG_WIDTH)} />
        <meta property="og:image:height" content={String(OG_HEIGHT)} />
        <meta
          property="og:image:alt"
          content="Medicaid stops paying at 16 beds. Federal bed limit 16, average psychiatric hospital 108, fewer than 8 percent of hospitals eligible, 36,150 state psychiatric beds in 2023."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Medicaid stops paying at 16 beds." />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={`${origin}/og.png`} />
        <meta
          name="twitter:image:alt"
          content="Medicaid stops paying at 16 beds. The average psychiatric hospital has 108."
        />
        <meta name="theme-color" content="#f6f4ef" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23f6f4ef'/%3E%3Ctext x='16' y='23' font-family='monospace' font-size='19' font-weight='700' text-anchor='middle' fill='%23c0392b'%3E16%3C/text%3E%3C/svg%3E"
        />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: 'The 16-Bed Limit',
              description: desc,
              dateModified: RETRIEVED,
              isAccessibleForFree: true,
              citation: SOURCES.map((s) => ({ '@type': 'CreativeWork', name: s.name, url: s.url })),
            }),
          }}
        />
      </head>
      <body>
        <a class="skip" href="#main">
          Skip to content
        </a>

        <header class="mast">
          <div class="mast__in">
            <span class="mast__id">
              <a href="/">16 BED LIMIT</a>
            </span>
            <nav class="mast__nav" aria-label="Sections">
              <a href="#rule">The rule</a>
              <a href="#scale">Scale</a>
              <a href="#waivers">Waivers</a>
              <a href="#history">History</a>
              <a href="#record">The record</a>
              <a href="#instead">Consequences</a>
              <a href="#bills">Bills</a>
              <a href="#levers">Who decides</a>
              <a href="#act">Contact</a>
              <a href="#sources">Sources</a>
            </nav>
          </div>
        </header>

        <main id="main">
          {/* ---------------- HERO ---------------- */}
          <div class="wrap hero">
            <p class="hero__kicker">Medicaid · 42 U.S.C. §1396d · in force since 1965</p>
            <h1>
              Medicaid stops paying at <b>16 beds</b>.
            </h1>
            <p class="hero__lede">
              Medicaid has refused to pay for adults in psychiatric institutions since it was
              created in 1965, and since 1988 the statute has drawn that line at 16 beds. If an
              adult between 21 and 64 is treated in a psychiatric or addiction facility with more
              than 16 beds, federal Medicaid pays nothing toward their care.
            </p>
            <p class="hero__lede hero__lede--turn">
              The average psychiatric hospital in the United States has 108 beds. So the rule does
              not fund small hospitals. It defunds almost all of them.
            </p>

            <div class="readout">
              <div class="readout__hd">
                <b>System readout</b>
                <span>retrieved {RETRIEVED}</span>
              </div>
              <div class="readout__rows">
                <div class="rrow">
                  <p class="rrow__k">Federal bed limit</p>
                  <p class="rrow__v rrow__v--sig">16</p>
                  <p class="rrow__n">Unchanged since it entered the statute in 1988.</p>
                </div>
                <div class="rrow">
                  <p class="rrow__k">Average psychiatric hospital</p>
                  <p class="rrow__v">108</p>
                  <p class="rrow__n">Smaller than the average general hospital.</p>
                </div>
                <div class="rrow">
                  <p class="rrow__k">Hospitals under the limit</p>
                  <p class="rrow__v rrow__v--sig">&lt;8%</p>
                  <p class="rrow__n">The rest cannot bill Medicaid for adult care.</p>
                </div>
                <div class="rrow">
                  <p class="rrow__k">State psychiatric beds</p>
                  <p class="rrow__v">36,150</p>
                  <p class="rrow__n">Down from 558,922 in 1955. A record low, in 2023.</p>
                </div>
              </div>
            </div>

            <HeroChart />
            <p class="caveat">{HERO_CAVEAT}</p>
            <p class="caveat">{INCARCERATION_NOTE}</p>

            {/* Call to action at the top, where it is actually seen. The full
                contact section at the bottom stays — this is the entry point
                for the reader who will not scroll that far. */}
            <div class="cta" id="cta">
              <p class="cta__kicker">If you want to do something about this</p>
              <div class="cta__row">
                <a class="cta__btn cta__btn--primary" href="#say-so">
                  Tell Congress you support the bills
                </a>
                <a class="cta__btn" href="#act">
                  Send records or your story
                </a>
                <a class="cta__btn" href="#levers">
                  Who can actually change it
                </a>
              </div>
              <p class="cta__ask">
                Or ask a question — the assistant answers only from the sources on this page:
              </p>
              <div class="cta__qs">
                {SITE_QUESTIONS.map((q) => (
                  <button type="button" class="cta__q" data-ask={q.ask}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------- THE RULE ---------------- */}
          <section id="rule">
            <div class="wrap">
              <span class="sec__idx">01 — What the rule says</span>
              <h2>One sentence, written in 1965</h2>
              <p class="lede">
                Medicaid pays for almost every kind of medical care. There is one category of
                facility it will not pay for, and psychiatric hospitals are it.
              </p>

              <div class="statute">
                <q>{STATUTE.definitionText}</q>
                <cite>{STATUTE.definitionCite}</cite>
              </div>

              <p>
                That is the definition of an institution for mental diseases, or IMD. The exclusion
                itself is a second passage, which says Medicaid will not pay for
              </p>

              <div class="statute">
                <q>{STATUTE.exclusionText}</q>
                <cite>{STATUTE.exclusionCite}</cite>
              </div>

              <div class="plain">
                <b>In plain language</b>
                <p>
                  If you are between 21 and 64, and you are a patient in a psychiatric or addiction
                  treatment facility with more than 16 beds, Medicaid will not pay for your care.
                  Not the psychiatric care, and not the ordinary medical care either. The bar
                  follows you: it also covers treatment delivered outside the facility while you are
                  a patient there. If you are 65 or older, or under 21, separate exceptions apply.
                </p>
              </div>

              <p class="caveat">
                A note on citations. {STATUTE.citationCaveat} We link the current United States Code
                text so you can read it yourself:{' '}
                <a href={STATUTE.exclusionSource} rel="noopener">
                  42 U.S.C. §1396d
                </a>
                .
              </p>

              <div class="why" id="why-16">
                <h3>Why 16?</h3>
                <p>This is the question everyone asks. Here is everything that is documented.</p>
                <ul class="why__list">
                  {WHY_SIXTEEN.documented.map((d) => (
                    <li>
                      {d.claim}{' '}
                      <a class="why__src" href={d.source} rel="noopener">
                        {d.sourceName}
                      </a>
                    </li>
                  ))}
                </ul>
                <div class="why__gap">
                  <b>And here is what is not</b>
                  <p>{WHY_SIXTEEN.notDocumented}</p>
                  <p class="why__searched">
                    Sources checked for a rationale: {WHY_SIXTEEN.searched}
                  </p>
                </div>
                <p class="why__ask">
                  If you find a published rationale for the figure, we want it. Send it to{' '}
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Origin of the 16-bed figure')}`}
                  >
                    {CONTACT_EMAIL}
                  </a>{' '}
                  and this section will be corrected with the citation.
                </p>
              </div>
            </div>
          </section>

          {/* ---------------- SCALE ---------------- */}
          <section id="scale">
            <div class="wrap">
              <span class="sec__idx">02 — The scale problem</span>
              <h2>Sixteen is not a small hospital. It is almost no hospital.</h2>
              <p class="lede">
                The number was meant to favor small community settings over large institutions. The
                effect is that nearly every psychiatric hospital in the country falls on the wrong
                side of it.
              </p>
              <SizeChart />
              <ul class="legend" style="margin-top:1.2rem">
                {HOSPITAL_SIZE.findings.map((f) => (
                  <li style="display:list-item;font-family:var(--sans);font-size:15px;max-width:70ch;margin-bottom:.5rem">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ---------------- WAIVERS ---------------- */}
          <section id="waivers">
            <div class="wrap">
              <span class="sec__idx">03 — The workarounds</span>
              <h2>Most states have negotiated an exception</h2>
              <p class="lede">
                Because the rule is hard to live with, states ask the federal government for
                permission to ignore parts of it. That permission is a section 1115 demonstration
                waiver, and it is temporary, conditional, and narrower than it sounds.
              </p>
              <WaiverMap />
              <p class="caveat">
                Status as of {WAIVER_AS_OF}, from{' '}
                <a href={WAIVER_SOURCE} rel="noopener">
                  {WAIVER_SOURCE_NAME}
                </a>
                . Waiver status changes; check the{' '}
                <a href={WAIVER_TRACKER} rel="noopener">
                  KFF tracker
                </a>{' '}
                for the current picture. Separately, managed care plans may pay for stays of up to
                15 days in a month, and a state plan option allows up to 30 days a year for
                substance use disorder treatment.
              </p>
            </div>
          </section>

          {/* ---------------- HISTORY ---------------- */}
          <section id="history">
            <div class="wrap">
              <span class="sec__idx">04 — How it got here</span>
              <h2>Sixty years of narrow exceptions</h2>
              <p class="lede">
                Congress has amended around this rule repeatedly. It has never removed it.
              </p>
              <ol class="tl">
                {TIMELINE.map((t) => (
                  <li class={KEY_YEARS.has(t.year) ? 'is-key' : ''}>
                    <div>
                      <div class="tl__yr">{t.year}</div>
                      <span class="tl__law">{t.law}</span>
                    </div>
                    <div class="tl__b">
                      <h3>{t.title}</h3>
                      <p>{t.what}</p>
                      <a class="tl__src" href={t.source} rel="noopener">
                        {t.sourceName} →
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ---------------- THE RECORD ---------------- */}
          <section id="record">
            <div class="wrap">
              <span class="sec__idx">04b — What the record shows</span>
              <h2>Nobody ever voted on the 16-bed limit</h2>
              <p class="lede">
                Every roll call of the 89th Congress was read, along with the Statutes at Large, the
                Federal Register and CBO's cost estimates. The rule was never debated on a floor,
                never amended on a floor, and never voted on by itself. Here is what the record does
                say.
              </p>

              <div class="plain">
                <b>The full report</b>
                <p>
                  {REPORT.pages} pages, every claim carried back to the document it came from.{' '}
                  <a href={REPORT.href} type="application/pdf">
                    Download the PDF
                  </a>{' '}
                  ({Math.round(REPORT.bytes / 1024)} KB).
                </p>
              </div>

              <ol class="tl">
                {RECORD_FINDINGS.map((f, i) => (
                  <li>
                    <div>
                      <div class="tl__yr">{i + 1}</div>
                    </div>
                    <div class="tl__b">
                      <h3>{f.claim}</h3>
                      <p>{f.detail}</p>
                      <a class="tl__src" href={f.source} rel="noopener">
                        {f.sourceName} →
                      </a>
                    </div>
                  </li>
                ))}
              </ol>

              <h3 style="margin-top:2.4rem">The votes that did happen</h3>
              <div class="fund__wrap">
                <table class="fund">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Chamber</th>
                      <th>Measure</th>
                      <th>Tally</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROLL_CALLS.map((r) => (
                      <tr>
                        <td>{r.year}</td>
                        <td>{r.chamber}</td>
                        <td>{r.measure}</td>
                        <td>{r.tally}</td>
                        <td>{r.split}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div class="why" id="record-people">
                <h3>Who the record names</h3>
                <ul class="why__list">
                  {RECORD_NAMED.map((n) => (
                    <li>
                      <strong>{n.who}</strong> — {n.what}
                    </li>
                  ))}
                </ul>
                <div class="why__gap">
                  <b>And who it does not</b>
                  <p>{RECORD_UNKNOWNS}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- CONSEQUENCES ---------------- */}
          <section id="instead">
            <div class="wrap">
              <span class="sec__idx">05 — Where people go instead</span>
              <h2>The capacity did not disappear. It moved.</h2>
              <p class="lede">
                When a hospital bed is not available or not payable, the person in crisis still
                exists. They turn up somewhere, and the somewhere is usually an emergency
                department, a jail, or the street.
              </p>
              <div class="cons">
                {CONSEQUENCES.map((x) => (
                  <div>
                    <div class="cons__stat">{x.stat}</div>
                    <p class="cons__kind">{x.kind}</p>
                    <p>{x.detail}</p>
                    <a class="cons__src" href={x.source} rel="noopener">
                      {x.sourceName} →
                    </a>
                  </div>
                ))}
              </div>

              <h3 style="margin-top:2.4rem">Who this rule reaches</h3>
              <div class="cons">
                {PREVALENCE.map((x) => (
                  <div>
                    <div class="cons__stat">{x.stat}</div>
                    <p class="cons__kind">prevalence</p>
                    <p>{x.detail}</p>
                    <a class="cons__src" href={x.source} rel="noopener">
                      {x.sourceName} →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ---------------- BILLS ---------------- */}
          <section id="bills">
            <div class="wrap">
              <span class="sec__idx">06 — What is moving in Congress</span>
              <h2>Two bills, two different answers</h2>
              <p class="lede">
                Both are in the 119th Congress. Both are in committee. They disagree about whether
                to move the line or erase it.
              </p>
              <div class="bills">
                {BILLS.map((b) => (
                  <article class="bill">
                    <div class="bill__hd">
                      <span class="bill__no">{b.number}</span>
                      <span class="bill__ap">{b.approach}</span>
                    </div>
                    <div class="bill__bd">
                      <h3>{b.title}</h3>
                      <p class="bill__meta">
                        Sponsor: {b.sponsor} ({b.party}-{b.district})
                        <br />
                        Introduced: {b.introduced}
                        {b.cosponsors ? (
                          <>
                            <br />
                            Cosponsors: {b.cosponsors}
                          </>
                        ) : null}
                        {b.priorVersion ? (
                          <>
                            <br />
                            Earlier version: {b.priorVersion}
                          </>
                        ) : null}
                      </p>
                      <p>{b.effect}</p>
                      <span class="bill__status">Status: {b.status}</span>
                      <div class="bill__links">
                        <a href={b.congressUrl} rel="noopener">
                          Congress.gov
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <p class="caveat">
                Bill status is as retrieved on {RETRIEVED}. Follow the Congress.gov links for the
                current record, which is authoritative.
              </p>

              <div class="act" id="say-so">
                <h3>Say you support them</h3>
                <p class="act__lede">
                  Both bills are stuck in the {BILL_COMMITTEE.name}. {BILL_COMMITTEE.why}
                </p>
                <p class="act__note">
                  Members of the House do not publish email addresses. Every office below takes
                  messages through its own web form, so there is no address to click — pick a draft,
                  copy it, then open the form and paste it in. Change it before you send: identical
                  form letters get counted once.
                </p>

                <div class="drafts">
                  {SUPPORT_DRAFTS.map((d) => (
                    <article class="draft" id={`draft-${d.id}`}>
                      <h4>{d.label}</h4>
                      <p class="draft__subj">
                        <span>Subject</span>
                        {d.subject}
                      </p>
                      <pre class="draft__body" id={`draft-body-${d.id}`}>
                        {d.body}
                      </pre>
                      <button
                        type="button"
                        class="btn btn--copy"
                        data-copy={`draft-body-${d.id}`}
                        data-subject={d.subject}
                      >
                        Copy this message
                      </button>
                    </article>
                  ))}
                </div>

                <h4 class="act__sub">Where to send it</h4>
                <ul class="targets">
                  {ACTION_TARGETS.map((t) => (
                    <li class="target">
                      <p class="target__who">{t.who}</p>
                      <p class="target__role">{t.role}</p>
                      <p class="target__why">{t.why}</p>
                      <p class="target__how">{t.method}</p>
                      <a class="target__link" href={t.url} rel="noopener">
                        Open the contact form
                      </a>
                    </li>
                  ))}
                  <li class="target">
                    <p class="target__who">{BILL_COMMITTEE.name}</p>
                    <p class="target__role">Where both bills are waiting</p>
                    <p class="target__why">
                      If one of these members represents you, that is the single most useful message
                      on this page. Committee members decide what gets a hearing.
                    </p>
                    <p class="target__how">
                      Members list — find yours, then use that member's own contact form.
                    </p>
                    <a class="target__link" href={BILL_COMMITTEE.membersUrl} rel="noopener">
                      See the committee's members
                    </a>
                  </li>
                </ul>
                <p class="caveat">
                  Every link above was fetched and confirmed working on 2026-08-26. If one has since
                  moved, tell us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and it
                  gets fixed.
                </p>
              </div>
            </div>
          </section>

          {/* ---------------- ARGUMENT ---------------- */}
          <section id="debate">
            <div class="wrap">
              <span class="sec__idx">07 — The disagreement</span>
              <h2>This is genuinely contested</h2>
              <p class="lede">
                People who work on this in good faith disagree about whether the rule should go.
                Both cases are set out here as their proponents make them.
              </p>
              <div class="args">
                <div class="arg">
                  <h3>{ARGUMENTS.repeal.heading}</h3>
                  <ul>
                    {ARGUMENTS.repeal.points.map((p) => (
                      <li>{p}</li>
                    ))}
                  </ul>
                  <a class="arg__src" href={ARGUMENTS.repeal.source} rel="noopener">
                    {ARGUMENTS.repeal.sourceName} →
                  </a>
                </div>
                <div class="arg">
                  <h3>{ARGUMENTS.keep.heading}</h3>
                  <ul>
                    {ARGUMENTS.keep.points.map((p) => (
                      <li>{p}</li>
                    ))}
                  </ul>
                  <a class="arg__src" href={ARGUMENTS.keep.source} rel="noopener">
                    {ARGUMENTS.keep.sourceName} →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- ACT ---------------- */}
          <section id="levers">
            <div class="wrap">
              <span class="sec__idx">07b — Who can change it</span>
              <h2>Four offices, three different kinds of power</h2>
              <p class="lede">
                Only Congress can change the statute. CMS cannot repeal it — but CMS approves the
                waivers that let a state work around it, which is the faster lever and the one a
                state official or provider can actually move. Writing the wrong ask to the right
                office is a wasted letter, so each entry says what that office can and cannot do.
              </p>
              <ul class="levers">
                {FEDERAL_LEVERS.map((l) => (
                  <li class="lever">
                    <p class="lever__body">{l.body}</p>
                    <p class="lever__power">{l.power}</p>
                    <p class="lever__ask">
                      <span>The ask</span>
                      {l.ask}
                    </p>
                    <a class="lever__link" href={l.url} rel="noopener">
                      {l.urlLabel}
                    </a>
                  </li>
                ))}
              </ul>
              <p class="caveat">
                None of these offices publishes an email address; each link opens its own contact
                page or member list. All four were fetched and confirmed working on 2026-08-26.
              </p>
            </div>
          </section>

          <section id="act">
            <div class="wrap">
              <span class="sec__idx">08 — Get in touch</span>
              <h2>Send records, ask who is working on this, or help fund it</h2>
              <p class="lede">
                Every message goes to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Each
                button below opens your email app with the subject and prompts already filled in.
              </p>

              <div class="intents">
                {CONTACT_INTENTS.map((i) => (
                  <div class="intent">
                    <h3>{i.label}</h3>
                    <p>{i.blurb}</p>
                    <a class="btn" href={mailto(i)}>
                      Compose email
                    </a>
                  </div>
                ))}
              </div>

              <h3 style="margin-top:2.6rem">How work like this gets funded</h3>
              <p>
                People often ask which vehicle is the right one for pushing on a federal funding
                rule. The honest answer is that it depends what you want to do, because each one
                permits different activity. This is a description of the rules, not legal advice.
              </p>
              <div class="fund__wrap">
                <table class="fund">
                  <thead>
                    <tr>
                      <th scope="col">Vehicle</th>
                      <th scope="col">What it can do</th>
                      <th scope="col">What it cannot do</th>
                      <th scope="col">Authority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FUNDING_ROUTES.map((f) => (
                      <tr>
                        <td>{f.vehicle}</td>
                        <td>{f.canDo}</td>
                        <td>{f.cannot}</td>
                        <td>
                          <a href={f.authority} rel="noopener">
                            {f.authorityName}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ---------------- SOURCES ---------------- */}
          <section id="sources">
            <div class="wrap">
              <span class="sec__idx">09 — Where every number came from</span>
              <h2>Sources</h2>
              <p class="lede">
                Nothing on this page is estimated or recalled. Each figure was fetched from the
                source below on {RETRIEVED}, and the legislative-record sources on{' '}
                {REPORT.retrieved}. The same data is available as JSON at <a href="/api">/api</a>.
              </p>
              <div class="plain">
                <b>This list is also the assistant's entire memory</b>
                <p>
                  The <a href="#ask">question box</a> on this page runs on these {SOURCES.length}{' '}
                  sources and nothing else. It has no web access and is instructed not to answer
                  from general knowledge, so if you ask it something these sources do not cover, it
                  will tell you that instead of inventing an answer. Anything it tells you can be
                  checked against the original, one link away.
                </p>
              </div>
              <ul class="srcs">
                {SOURCES.map((s) => (
                  <li>
                    <span class={`srcs__kind ${s.kind === 'primary' ? 'is-primary' : ''}`}>
                      {s.kind}
                    </span>
                    <span class="srcs__n">
                      <a href={s.url} rel="noopener">
                        {s.name}
                      </a>
                      <em>
                        {s.org} — {s.used}
                      </em>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>

        <footer>
          <div class="wrap">
            <p>
              This site explains a federal Medicaid funding rule. It is not medical, legal, or
              benefits advice, and it cannot arrange treatment for anyone. If you are in crisis in
              the United States, call or text <strong>988</strong> to reach the Suicide and Crisis
              Lifeline.
            </p>
            <p class="foot__meta">
              Figures retrieved {RETRIEVED} · Data API at <a href="/api">/api</a> · Corrections to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </footer>

        {/* ---------------- ASSISTANT ---------------- */}
        <button class="ask-fab" id="ask-fab" type="button">
          Ask these sources
        </button>

        <aside class="ask" id="ask" hidden aria-label="Ask about the IMD exclusion">
          <div class="ask__hd">
            <b>Answers from this page only</b>
            <button
              class="ask__x"
              id="ask-speak"
              type="button"
              aria-pressed="false"
              title="Read answers aloud"
            >
              Voice off
            </button>
            <button class="ask__x" id="ask-x" type="button" aria-label="Close">
              ✕
            </button>
          </div>

          <div class="ask__log" id="ask-log" aria-live="polite">
            <div class="msg msg--a">
              <p>
                I answer from one thing only: the {SOURCES.length} sources listed at the bottom of
                this page. I am not searching the web and I am not drawing on general knowledge.
              </p>
              <p>
                That means I can be precise about the statute, the bed counts, your state's waiver
                status, and the two bills. It also means that when something falls outside those
                sources I will say so rather than guess. Ask away.
              </p>
            </div>
          </div>

          <div class="ask__chips" id="ask-chips">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button class="chip" type="button">
                {q}
              </button>
            ))}
          </div>

          <form class="ask__form" id="ask-form">
            <textarea
              class="ask__in"
              id="ask-in"
              rows={1}
              placeholder="Type a question, or use the microphone"
              aria-label="Your question"
            />
            <button
              class="ask__btn ask__mic"
              id="ask-mic"
              type="button"
              aria-label="Ask by voice"
              title="Ask by voice"
            >
              MIC
            </button>
            <button class="ask__btn" id="ask-send" type="submit">
              Send
            </button>
          </form>

          <p class="ask__foot">
            Answers come from an AI model reading only this page's sources. Verify anything that
            matters against the original, linked in <a href="#sources">Sources</a>. Not medical or
            legal advice. In crisis, call or text 988.
          </p>
        </aside>

        <script type="module" src="/app.js" />
      </body>
    </html>,
  );
});

app.notFound((c) =>
  c.html(
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Not found — The 16-Bed Limit</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <div class="wrap hero">
          <p class="hero__kicker">Error 404</p>
          <h1>No such page.</h1>
          <p class="hero__lede">
            The site is a single page. <a href="/">Start at the top</a>, or read the data directly
            at <a href="/api">/api</a>.
          </p>
        </div>
      </body>
    </html>,
    404,
  ),
);

/**
 * Weekly cron. Asks each upstream agency whether it has published anything
 * newer than what this site plots, and stores the answer.
 *
 * It writes a REPORT, never a figure. See src/freshness.ts for why: a scraper
 * that edited the numbers would remove the only property that makes them worth
 * reading. When this flags something, a person opens the document.
 */
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        // The previous report is an input, not just an archive: change-watch
        // probes need last week's fingerprint to have anything to compare.
        let previous: FreshnessReport | undefined;
        if (env.FRESHNESS) {
          const raw = await env.FRESHNESS.get(FRESHNESS_KEY);
          if (raw) {
            try {
              previous = JSON.parse(raw) as FreshnessReport;
            } catch {
              // A corrupt record must not stop the check. Losing one week of
              // fingerprint history costs a single extra "first recorded" run.
              previous = undefined;
            }
          }
        }
        const report = await runFreshnessCheck(previous);
        if (env.FRESHNESS) {
          await env.FRESHNESS.put(FRESHNESS_KEY, JSON.stringify(report));
        }
        // Logged either way so a run with no store still leaves a trace.
        console.log(
          JSON.stringify({
            event: 'freshness_check',
            anyNewer: report.anyNewer,
            anyUnknown: report.anyUnknown,
            probes: report.probes.map((r) => ({
              key: r.key,
              status: r.status,
              seen: r.latestSeen,
            })),
          }),
        );
      })(),
    );
  },
};
