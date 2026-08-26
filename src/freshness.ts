/**
 * Data freshness watcher.
 *
 * WHAT THIS DOES NOT DO: it does not update any figure on this site. That is
 * deliberate and it is the whole design. Every number here carries a source URL
 * and a retrieval date because a human opened that source and read it. A cron
 * that rewrote those numbers from a scraped page would quietly convert this
 * site from "checked" to "scraped", which is the one property it is selling.
 *
 * WHAT IT DOES: once a week it asks each upstream agency's own publication list
 * whether anything NEWER exists than the year we have plotted, and records the
 * answer. If a newer release appears, the site says so, the /api/freshness
 * endpoint reports it, and a person goes and reads the new document.
 *
 * So the failure mode is "the site tells you it is behind", never "the site
 * silently shows you a number nobody verified".
 */

import { DATA_THROUGH } from './data';

export interface SourceProbe {
  key: 'beds' | 'prison' | 'jail';
  label: string;
  /** The agency's own list/index page. Never a constructed deep link. */
  listUrl: string;
  /** Year we currently plot for this series. */
  plotted: number;
  /**
   * How this source can actually be checked.
   *
   * 'year-list'    — the page lists dated publication titles, so a newer data
   *                  year is directly readable.
   * 'change-watch' — the page carries no dated titles at all (verified against
   *                  the Treatment Advocacy Center on 2026-08-26: zero link
   *                  titles anywhere on their beds page or reports index carry
   *                  a year). Asking for a year there would return "unknown"
   *                  forever, which is indistinguishable from a broken probe.
   *                  So instead we notice when the page's text CHANGES, and ask
   *                  a person to look.
   */
  mode: 'year-list' | 'change-watch';
}

export interface ProbeResult {
  key: string;
  label: string;
  listUrl: string;
  plotted: number;
  /** Latest year seen on the upstream list, or null if we could not measure. */
  latestSeen: number | null;
  /**
   * Three outcomes, never two. "current" and "unknown" are different facts and
   * collapsing them is how a broken probe gets reported as a clean bill.
   */
  status: 'current' | 'newer-available' | 'unknown' | 'unchanged' | 'source-changed';
  /** change-watch only: fingerprint of the source page's visible text. */
  hash?: string;
  note: string;
}

export interface FreshnessReport {
  checkedAt: string;
  /** True only if at least one probe actually found a newer release. */
  anyNewer: boolean;
  /** True if any probe failed — surfaced so a dead probe is never read as "fine". */
  anyUnknown: boolean;
  probes: ProbeResult[];
}

export const PROBES: SourceProbe[] = [
  {
    key: 'prison',
    label: 'BJS national prison population',
    listUrl:
      'https://bjs.ojp.gov/library/publications/list?series_filter=Prisons%20Preliminary%20Data%20Release',
    plotted: DATA_THROUGH.prison,
    mode: 'year-list',
  },
  {
    key: 'jail',
    label: 'BJS local jail population',
    listUrl:
      'https://bjs.ojp.gov/library/publications/list?series_filter=Jails%20Preliminary%20Data%20Release',
    plotted: DATA_THROUGH.jail,
    mode: 'year-list',
  },
  {
    key: 'beds',
    label: 'Treatment Advocacy Center state hospital bed census',
    listUrl: 'https://www.tac.org/reports_publications/state-beds-data/',
    plotted: DATA_THROUGH.beds,
    mode: 'change-watch',
  },
];

/**
 * Pull publication years out of a listing page.
 *
 * Reads years ONLY from publication TITLES — the text of links pointing at
 * /library/publications/ or similar. This is structural, not stylistic.
 *
 * The first version of this scanned the whole page as flat text, and on
 * 2026-08-26 it reported a 2025 jail release that does not exist: the match ran
 * from the title "Jails Report Series: 2024 Preliminary Data Release" straight
 * into the adjacent metadata field "Date Published December 2025". A publishing
 * date is not a data year, and a probe that cries wolf is worth less than no
 * probe, because a standing false alarm trains everyone to ignore a real one.
 *
 * Anchoring to the title bounds the match inside one field, so it cannot reach
 * a neighbouring one. src/freshness.test.ts pins this against the real captured
 * page.
 */
export function extractPublicationYears(html: string): number[] {
  const years = new Set<number>();
  const maxYear = new Date().getUTCFullYear() + 1;

  // Link text is the publication title on every list page we probe.
  const titles: string[] = [];
  for (const m of html.matchAll(/<a\b[^>]*href="[^"]*"[^>]*>([\s\S]{4,200}?)<\/a>/gi)) {
    const raw = m[1];
    if (raw === undefined) continue;
    titles.push(
      raw
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    );
  }

  const TOPIC =
    /Prisoners|Jail Inmates|Preliminary Data Release|Statistical Tables|State Hospital Systems|state[- ]beds/i;

  for (const title of titles) {
    if (!TOPIC.test(title)) continue;
    for (const ym of title.matchAll(/\b(20\d{2})\b/g)) {
      const raw = ym[1];
      if (raw === undefined) continue;
      const y = Number.parseInt(raw, 10);
      if (y >= 1990 && y <= maxYear) years.add(y);
    }
  }

  return [...years].sort((a, b) => a - b);
}

/**
 * Fingerprint of a page's visible text.
 *
 * Scripts, styles and long hex blobs are stripped first, because those carry
 * per-request nonces and cache-busting tokens. Measured against the real TAC
 * page on 2026-08-26: three consecutive fetches produced differing raw bytes
 * (237,612 then 237,740 twice) but an identical fingerprint, which is the
 * property this needs — otherwise the watch would fire every single week and
 * mean nothing.
 */
export function fingerprint(html: string): string {
  const text = html
    .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\b[0-9a-f]{16,}\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  // FNV-1a. Not cryptographic — this only needs to notice that text changed.
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${h.toString(16).padStart(8, '0')}-${text.length}`;
}

async function probeOne(p: SourceProbe, previous?: FreshnessReport): Promise<ProbeResult> {
  const base = { key: p.key, label: p.label, listUrl: p.listUrl, plotted: p.plotted };
  try {
    const res = await fetch(p.listUrl, {
      headers: { 'user-agent': '16bedlimit.com data-freshness check (+https://16bedlimit.com)' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      return {
        ...base,
        latestSeen: null,
        status: 'unknown',
        note: `Could not read the publication list (HTTP ${res.status}). This is a failed check, not a finding.`,
      };
    }
    const body = await res.text();

    if (p.mode === 'change-watch') {
      const hash = fingerprint(body);
      const before = previous?.probes.find((r) => r.key === p.key)?.hash;
      if (before === undefined) {
        return {
          ...base,
          latestSeen: null,
          hash,
          status: 'unchanged',
          note: 'First fingerprint recorded. Future runs report when this page\u2019s text changes.',
        };
      }
      if (before !== hash) {
        return {
          ...base,
          latestSeen: null,
          hash,
          status: 'source-changed',
          note: 'This page changed since the last check. It publishes no dated titles, so a person needs to read it and decide whether the bed count moved.',
        };
      }
      return {
        ...base,
        latestSeen: null,
        hash,
        status: 'unchanged',
        note: 'Page text is unchanged since the last check.',
      };
    }

    const years = extractPublicationYears(body);
    const latest = years.at(-1) ?? null;
    if (latest === null) {
      return {
        ...base,
        latestSeen: null,
        status: 'unknown',
        note: 'Fetched the page but recognised no publication year on it. Treating as unmeasured rather than current.',
      };
    }
    if (latest > p.plotted) {
      return {
        ...base,
        latestSeen: latest,
        status: 'newer-available',
        note: `Upstream lists a ${latest} release; this site plots ${p.plotted}. A person needs to read it and enter the figure.`,
      };
    }
    return {
      ...base,
      latestSeen: latest,
      status: 'current',
      note: `Upstream's newest listed release is ${latest}, which is what this site plots.`,
    };
  } catch (err) {
    return {
      ...base,
      latestSeen: null,
      status: 'unknown',
      note: `Check failed: ${err instanceof Error ? err.message : 'unknown error'}. Not a finding.`,
    };
  }
}

export async function runFreshnessCheck(previous?: FreshnessReport): Promise<FreshnessReport> {
  const probes = await Promise.all(PROBES.map((p) => probeOne(p, previous)));
  return {
    checkedAt: new Date().toISOString(),
    // "needs a look" covers both a newer dated release and a watched page that
    // moved. They mean different things to a reader, so the probe keeps them
    // distinct; only this roll-up merges them.
    anyNewer: probes.some((r) => r.status === 'newer-available' || r.status === 'source-changed'),
    anyUnknown: probes.some((r) => r.status === 'unknown'),
    probes,
  };
}

export const FRESHNESS_KEY = 'freshness:v1';
