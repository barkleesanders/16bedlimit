# WebMCP — The 16-Bed Limit

Tier: **2** (public content site) — /ship Phase 1.4w, rules in the ship skill's `shared/webmcp.md`.
Minimum for tier 2: ≥1 Answer on the homepage. This site declares 4 Answer + 1 Action.

The site is a single-page explainer whose every figure comes from `src/data.ts` and is
served as JSON under `/api`. Every tool calls one of those same published data paths —
no new backend was added:

- The rule section is backed by `GET /api/statute`.
- The bed chart is backed by `GET /api/beds`.
- The waiver map is backed by `GET /api/waivers`.
- The Sources section is backed by `GET /api/sources`.

## Tool inventory (homepage `/`, via the page shell in `src/index.tsx`)

Scripts load with `defer` at the end of `<body>`, immediately before the `/app.js`
module script, so the homepage registers the tools. Same-origin files only — the CSP
(`script-src 'self'`) needed no change. Browsers without `document.modelContext` are
untouched (the registrar no-ops and the page behaves exactly as before).

| Tool | Class | Inputs | Backed by | Sample input |
|---|---|---|---|---|
| `get_the_rule` | Answer | — | `GET /api/statute` (IMD definition + payment exclusion, U.S. Code citations and sources, citation caveat) | `{}` |
| `get_bed_numbers` | Answer | — | `GET /api/beds` (headline figures + measured series) | `{}` |
| `get_waiver_status` | Answer | `state` (optional, two-letter code) | `GET /api/waivers` (1115 IMD waivers: SUD + SMI, approved/pending per state) | `{"state":"NY"}` |
| `list_sources` | Answer | — | `GET /api/sources` (every source behind the site's figures) | `{}` |
| `navigate_to_section` | Action | `section` (required, allowlisted anchor id) | in-page anchor navigation (`location.hash` + `scrollIntoView`) | `{"section":"waivers"}` |

Allowed `navigate_to_section` anchors (the page's own section ids): `rule`, `order`,
`scale`, `waivers`, `history`, `record`, `instead`, `bills`, `medicare`, `reentry`,
`work`, `debate`, `levers`, `act`, `sources`, `veteran-resources`.

No Sensitive tools. **The question box is deliberately not a tool**: asking it spends a
metered Workers AI call (`POST /api/chat`, rate-limited for exactly that reason), and
this ship exposes read + navigation only. Definitions: `public/webmcp-tools.js`;
registrar: `public/webmcp.js` (canonical drop-in from the ship skill, byte-identical —
it is excluded from biome in `biome.json` for exactly that reason, on the
`src/og-image.ts` precedent).

## Usage beacon

`public/webmcp-tools.js` sets `window.WEBMCP_BEACON_URL = "/api/webmcp-beacon"`, opting
into the canonical beacon (shared/webmcp.md "Usage beacon"): the registrar posts one
`{event:"register", tools:[names], path}` per page and one
`{event:"execute", tool, argKeys:[key names only], path}` per tool call.
`POST /api/webmcp-beacon` (in `src/index.tsx`) whitelists fields, caps sizes, stores
server timestamp + payload + User-Agent in the D1 table `webmcp_beacon_events`
(migration `migrations/0001_webmcp_beacon.sql`), and **always returns 204** — bad
input is dropped silently and a beacon failure can never surface in the page. No
argument values, no cookies, no explicit IP storage.

**Store choice**: the Worker already binds a KV namespace (`FRESHNESS`), but
`wrangler.jsonc` documents it as holding the freshness report only, so beacon events
go in a dedicated D1 database (`sixteen-bed-limit-webmcp`, binding `WEBMCP_DB`) — the
fleet-standard beacon store, with the same read-back shape as the other sites.

Read-back (counts by event/tool):

```bash
npx wrangler d1 execute sixteen-bed-limit-webmcp --remote -c ./wrangler.jsonc \
  --command "SELECT event, tool, count(*) AS n, max(ts) AS latest FROM webmcp_beacon_events GROUP BY event, tool ORDER BY n DESC"
```

## Chrome origin trial

**Enrolled 2026-11-03** in Google's Origin Trials portal for the WebMCP trial.

| Field | Value |
|---|---|
| Origin | `https://16bedlimit.com` |
| Token expiry | **2027-03-29** (read off the portal at enrollment) |
| Chrome range | 149–162 |
| Registration ID | `-5472594826882973695` |

The token is embedded as `<meta http-equiv="origin-trial" content="…">` in the
served `<head>` of both page shells in `src/index.tsx` (the homepage shell and the
404 shell), immediately after the viewport meta, so every HTML page this Worker
serves carries it. The token is not a secret — it is served in public HTML and
stored nowhere else. Renewal before the 2027-03-29 expiry is a ship task; an
expired token silently removes the tools from stock Chrome while leaving
WebMCP-native browsers (e.g. the ChatGPT desktop app's browser, which enables the
API internally) unaffected.

Only the apex origin serves the site — `www.16bedlimit.com` redirects to
`16bedlimit.com` (measured 2026-11-03: `webmcp-check --live
https://www.16bedlimit.com` reports the off-host redirect), so the apex is the
only origin enrolled and no www token exists. If that redirect is ever removed,
the www origin must be enrolled separately.

## Discovery advertisement

Added 2026-11-03 (/ship Phase 1.4w, shared/webmcp.md "Discovery
advertisement") — the four surfaces that tell visiting agents the tools
exist and instruct them to prefer the tools over scraping:

| Surface | Where it lives |
|---|---|
| Tool catalogue `/.well-known/webmcp.json` | Explicit route in `src/index.tsx` (const `WEBMCP_MANIFEST`); tool entries copied from `public/webmcp-tools.js` |
| robots.txt comment block | The `/robots.txt` route in `src/index.tsx` (existing directives unchanged) |
| `## WebMCP tools` section in `/llms.txt` | The `/llms.txt` route in `src/index.tsx` — a minimal llms.txt (site name, the homepage's meta-description summary, the section); no page index fabricated |
| `<link rel="webmcp" href="/.well-known/webmcp.json">` | Both page shells in `src/index.tsx`, immediately after the origin-trial meta |

The manifest's tool names must stay a subset of the registered inventory
— update the manifest in the same change as any tool addition, removal,
or rename. Verify with `webmcp-check.mjs --live https://16bedlimit.com
--require 2 --require-adv` (must print `verdict=ok` and `adv=ok`).

## Verification record

- Pre-deploy: `node <ship>/tools/webmcp-check.mjs --source . --require 2`
  must print `verdict=ok`.
- Execution proof: `node tools/webmcp-harness.mjs` loads the tool files in a Node VM
  with a fake `document.modelContext`, registers the tools, and executes every Answer
  tool once with the sample inputs above against the live site
  (`--base https://16bedlimit.com`). For served-file proof, download the two scripts
  from the live site into a temp dir and pass `--dir <tmpdir>`.
- Post-deploy: `webmcp-check.mjs --live https://16bedlimit.com --require 2 --require-adv`,
  re-run the harness against the served files, then POST one synthetic register +
  execute pair to `/api/webmcp-beacon` and read the rows back with the query above.
