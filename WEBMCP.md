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

**Not yet enrolled.** Neither `16bedlimit.com` nor `www.16bedlimit.com` carries a
WebMCP origin-trial token yet; enrollment happens in Google's Origin Trials portal
and is tracked as a fleet-level follow-up (the portal sign-in is the blocker, not
this repo). Until enrollment — or until WebMCP ships in Chrome stable — the tools
are live in WebMCP-native browsers (e.g. the ChatGPT desktop app's browser, which
enables the API internally) and are exercised by the harness below; stock Chrome
exposure starts at enrollment. When enrolling: apex and `www` are separate origins
and enroll separately, the token goes in a `<meta http-equiv="origin-trial">` in the
served head of each, and the expiry read off the portal gets recorded here.

## Verification record

- Pre-deploy: `node <ship>/tools/webmcp-check.mjs --source . --require 2`
  must print `verdict=ok`.
- Execution proof: `node tools/webmcp-harness.mjs` loads the tool files in a Node VM
  with a fake `document.modelContext`, registers the tools, and executes every Answer
  tool once with the sample inputs above against the live site
  (`--base https://16bedlimit.com`). For served-file proof, download the two scripts
  from the live site into a temp dir and pass `--dir <tmpdir>`.
- Post-deploy: `webmcp-check.mjs --live https://16bedlimit.com --require 2`,
  re-run the harness against the served files, then POST one synthetic register +
  execute pair to `/api/webmcp-beacon` and read the rows back with the query above.
