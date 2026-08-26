# The 16-Bed Limit

A single-page explainer for Medicaid's **Institution for Mental Diseases (IMD) exclusion** — the federal rule that stops Medicaid paying for adults aged 21 to 64 in a psychiatric or addiction-treatment facility with more than 16 beds.

The average U.S. psychiatric hospital has 108 beds.

Live: <https://16bedlimit.com>

## Why this repo is public

The site's whole argument is that its numbers are checkable. That claim is worth
very little if you can't check the numbers. Everything the site renders comes
from [`src/data.ts`](src/data.ts), where every figure carries a source URL and
the date it was fetched. If a number here is wrong, you can find it, and the
same data is served as JSON at [`/api`](https://16bedlimit.com/api).

## Rules this codebase follows

**No number without a source.** `src/data.ts` is the single origin of every
figure on the page. Each entry has `source` (a live URL) and a retrieval date.
Nothing is estimated, interpolated between census years, or recalled from
memory. A test suite enforces this — see `src/data.test.ts`.

**Absence is reported as absence.** The site says plainly that no standard
reference explains *why* the number is 16, and lists which sources were checked
for a rationale. That is a bounded claim about those sources, not a claim that
no rationale exists anywhere.

**No causal claim the data doesn't support.** The lead chart shows psychiatric
beds falling and incarceration rising over the same period. It says directly,
under the chart, that this is not a causal claim — incarceration rose for many
reasons, and the chart shows two capacities moving in opposite directions, not
one causing the other.

**Charts draw only measured points.** Where the full distribution isn't public
(hospital bed sizes), the chart plots the measured landmarks rather than
inventing a histogram.

## Sources

Congressional Research Service (IF10222) · MACPAC · Manhattan Institute ·
Treatment Advocacy Center · American Psychiatric Association · Bureau of Justice
Statistics · HUD · KFF · Legal Action Center · the U.S. Code and the compiled
Social Security Act.

Full list with per-figure attribution: [`/api/sources`](https://16bedlimit.com/api/sources)
and the Sources section of the site.

## Stack

Hono SSR on Cloudflare Workers. Server-rendered SVG charts (no chart library,
no client-side data fetching — the page works with JavaScript disabled). The
question box runs on Workers AI, grounded strictly in the corpus above with no
web access.

```bash
npm install
npm run dev                                  # local
npx vitest run src/data.test.ts --config ./vitest.config.ts
npx wrangler deploy -c ./wrangler.jsonc      # deploy
```

Two notes for anyone running this:

- Use **Node 22**. Wrangler 4.126 fails on Node 26 with a misleading
  "corporate proxy or VPN" TLS warning; it's a Node compatibility issue, not a
  network one.
- Pass `-c ./wrangler.jsonc` explicitly if you have a `wrangler.jsonc` in a
  parent directory — wrangler walks up and will silently pick the wrong config.

## Corrections

If a figure is wrong, or you find a published rationale for the 16-bed
threshold, open an issue or email <hello@16bedlimit.com>. Corrections with a
citation get made.

## License

Code: MIT. The underlying figures belong to the organizations cited; attribution
appreciated.
