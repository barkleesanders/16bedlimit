import { describe, expect, it } from 'vitest';
import { HeroChart } from './charts';
import {
  ACTION_TARGETS,
  BED_SERIES,
  BILL_COMMITTEE,
  BILLS,
  buildKnowledgeBase,
  CONSEQUENCES,
  FUNDING_ROUTES,
  HOSPITAL_SIZE,
  JAIL_SERIES,
  PREVALENCE,
  PRISON_SERIES,
  SMI_APPROVED,
  SMI_PENDING,
  SOURCES,
  STATE_NAMES,
  SUD_APPROVED,
  SUD_PENDING,
  SUPPORT_DRAFTS,
  systemPrompt,
  TIMELINE,
  WHY_SIXTEEN,
} from './data';

/**
 * Throws with a useful message instead of asserting non-null. A missing value
 * here means the corpus lost a row, which should fail loudly and by name —
 * not surface later as "cannot read property of undefined".
 */
function must<T>(value: T | undefined | null, what: string): T {
  // null as well as undefined: String.prototype.match returns null on no-match.
  if (value === undefined || value === null) {
    throw new Error(`expected ${what} to exist, got ${value === null ? 'null' : 'undefined'}`);
  }
  return value;
}

/* ------------------------------------------------------------------ *
 * PROVENANCE — the core invariant of this site.
 * Every number a reader sees must carry a live source URL.
 * ------------------------------------------------------------------ */

describe('provenance', () => {
  const httpsUrl = /^https?:\/\/\S+$/;

  it('every bed data point cites a source', () => {
    for (const p of BED_SERIES) {
      expect(p.source, `${p.year}`).toMatch(httpsUrl);
      expect(p.sourceName.length, `${p.year}`).toBeGreaterThan(3);
    }
  });

  it('every incarceration data point cites a source', () => {
    for (const p of [...PRISON_SERIES, ...JAIL_SERIES]) {
      expect(p.source, `${p.year}`).toMatch(httpsUrl);
      expect(p.sourceName.length, `${p.year}`).toBeGreaterThan(3);
    }
  });

  it('every timeline entry, consequence, bill and funding route cites a source', () => {
    for (const t of TIMELINE) expect(t.source, t.title).toMatch(httpsUrl);
    for (const c of [...CONSEQUENCES, ...PREVALENCE]) expect(c.source, c.stat).toMatch(httpsUrl);
    for (const b of BILLS) {
      expect(b.congressUrl, b.number).toMatch(httpsUrl);
      expect(b.govtrackUrl, b.number).toMatch(httpsUrl);
    }
    for (const f of FUNDING_ROUTES) expect(f.authority, f.vehicle).toMatch(httpsUrl);
    for (const s of SOURCES) expect(s.url, s.name).toMatch(httpsUrl);
    for (const d of WHY_SIXTEEN.documented)
      expect(d.source, d.claim.slice(0, 40)).toMatch(httpsUrl);
  });

  it('no duplicate source entries', () => {
    const urls = SOURCES.map((s) => s.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

/* ------------------------------------------------------------------ *
 * WAIVER DATA — a state appearing in the wrong bucket is the single
 * most damaging factual error this site can make.
 * ------------------------------------------------------------------ */

describe('waiver data', () => {
  const CODES = Object.keys(STATE_NAMES);

  it('covers 50 states plus DC', () => {
    expect(CODES.length).toBe(51);
  });

  it('every listed code is a real jurisdiction', () => {
    for (const list of [SUD_APPROVED, SUD_PENDING, SMI_APPROVED, SMI_PENDING]) {
      for (const c of list) expect(CODES, `unknown code ${c}`).toContain(c);
    }
  });

  // NOT an error: CRS Table 1 lists MA and WA under both Approved and
  // Pending, which is a state holding a waiver while an amendment or renewal
  // sits with CMS. The invariant that matters is that the corpus never
  // downgrades such a state to "not approved".
  it('states that are both approved and pending are still reported as approved', () => {
    const kb = buildKnowledgeBase();
    const both = SUD_APPROVED.filter((c) => SUD_PENDING.includes(c));
    expect(both.length, 'expected at least one approved-and-pending state').toBeGreaterThan(0);
    for (const c of both) {
      const name = must(STATE_NAMES[c], `state name for ${c}`);
      const row = must(
        kb.split('\n').find((l) => l.startsWith(`${name} (${c}) |`)),
        `corpus row for ${name}`,
      );
      const sudField = must(row.split('|')[1], `SUD field for ${name}`);
      expect(sudField, `${name} SUD`).toContain('APPROVED');
      expect(sudField, `${name} SUD`).not.toContain('NOT APPROVED');
    }
  });

  it('matches the counts stated on the page', () => {
    expect(SUD_APPROVED.length).toBe(37);
    expect(SMI_APPROVED.length).toBe(15);
  });

  it('spot-checks states against CRS IF10222 Table 1', () => {
    // Texas is the regression: the assistant once claimed it had both.
    expect(SUD_APPROVED).not.toContain('TX');
    expect(SMI_APPROVED).not.toContain('TX');
    expect(SUD_PENDING).not.toContain('TX');
    expect(SMI_PENDING).not.toContain('TX');
    // New York is the second regression: SUD approved, mental health only pending.
    expect(SUD_APPROVED).toContain('NY');
    expect(SMI_APPROVED).not.toContain('NY');
    expect(SMI_PENDING).toContain('NY');
    // California has both.
    expect(SUD_APPROVED).toContain('CA');
    expect(SMI_APPROVED).toContain('CA');
  });
});

/* ------------------------------------------------------------------ *
 * ASSISTANT CORPUS — structural, so it fails on a FUTURE state too,
 * not just the two that already burned us.
 * ------------------------------------------------------------------ */

describe('assistant corpus', () => {
  const kb = buildKnowledgeBase();

  it('states every jurisdiction exactly once, with both fields', () => {
    for (const [code, name] of Object.entries(STATE_NAMES)) {
      const rows = kb.split('\n').filter((l) => l.startsWith(`${name} (${code}) |`));
      expect(rows.length, `${name} row count`).toBe(1);
      expect(rows[0], name).toContain('addiction-treatment waiver:');
      expect(rows[0], name).toContain('mental-health waiver:');
    }
  });

  it('never reports a pending application as an approved waiver', () => {
    for (const [code, name] of Object.entries(STATE_NAMES)) {
      const row = must(
        kb.split('\n').find((l) => l.startsWith(`${name} (${code}) |`)),
        `corpus row for ${name}`,
      );
      const [, sudField, smiField] = row.split('|').map((s) => s.trim());
      if (SUD_PENDING.includes(code) && !SUD_APPROVED.includes(code)) {
        expect(sudField, `${name} SUD`).toContain('NOT APPROVED');
      }
      if (SMI_PENDING.includes(code) && !SMI_APPROVED.includes(code)) {
        expect(smiField, `${name} SMI`).toContain('NOT APPROVED');
      }
    }
  });

  it('carries the load-bearing figures the site is built on', () => {
    for (const needle of [
      '558,922',
      '36,150',
      '108',
      'more than 16 beds',
      'H.R. 5462',
      'H.R. 6727',
    ]) {
      expect(kb, needle).toContain(needle);
    }
  });

  it('leaves no unreplaced template slot in the system prompt', () => {
    const p = systemPrompt();
    expect(p).not.toContain('{{KB}}');
    expect(p.length).toBeGreaterThan(5000);
  });
});

/* ------------------------------------------------------------------ *
 * CHART LABELS — structural guard against the clipping class.
 *
 * A flag label wider than its background box is silently truncated: the
 * page renders, nothing errors, and the sentence just ends mid-word. This
 * happened once to the 1965 marker. Rather than assert the one string, we
 * measure EVERY <text> that sits on a <rect> in the rendered SVG, so a
 * future label added by anyone is covered too.
 * ------------------------------------------------------------------ */

describe('chart labels fit their backgrounds', () => {
  // JetBrains Mono advance width is 0.6em. 12px glyphs ≈ 7.25px including
  // the tracking the browser applies; measured 273.6px for the 38-char
  // marker string, which is 7.20px/char.
  const MONO_ADVANCE_PX = 7.25;

  function renderHeroSvg(): string {
    // hono/jsx renders to a string synchronously for a component with no
    // async children.
    return String(HeroChart());
  }

  it('the 1965 marker label fits inside its flag', () => {
    const svg = renderHeroSvg();
    const rect =
      svg.match(/class="marker-box"[^>]*?width="(\d+)"/) ??
      svg.match(/width="(\d+)"[^>]*?class="marker-box"/);
    expect(rect, 'marker-box rect not found — did the class change?').toBeTruthy();

    const label = svg.match(/class="marker-text"[^>]*>([^<]+)</);
    expect(label, 'marker-text not found — did the class change?').toBeTruthy();

    const boxW = Number(must(rect, 'marker-box match')[1]);
    const text = must(must(label, 'marker-text match')[1], 'marker-text content').trim();
    const textW = text.length * MONO_ADVANCE_PX;

    expect(
      textW + 10,
      `label "${text}" needs ~${Math.ceil(textW + 10)}px but the box is ${boxW}px`,
    ).toBeLessThanOrEqual(boxW);
  });
});

/* ------------------------------------------------------------------ *
 * ARITHMETIC — claims the page computes rather than cites.
 * ------------------------------------------------------------------ */

describe('computed claims', () => {
  it('the bed decline percentage matches the two cited endpoints', () => {
    const peak = must(
      must(
        BED_SERIES.find((p) => p.year === 1955),
        '1955 bed row',
      ).beds,
      '1955 beds',
    );
    const latest = must(
      must(
        BED_SERIES.find((p) => p.year === 2023),
        '2023 bed row',
      ).beds,
      '2023 beds',
    );
    const pct = (1 - latest / peak) * 100;
    expect(pct).toBeGreaterThan(93);
    expect(pct).toBeLessThan(94);
  });

  it('the statutory limit and the average hospital size are the stated ones', () => {
    expect(HOSPITAL_SIZE.statutoryLimit).toBe(16);
    expect(HOSPITAL_SIZE.mean).toBe(108);
  });
});

describe('advocacy targets', () => {
  /**
   * The rule this file exists to enforce: no invented contact addresses.
   * Checked live on 2026-08-26 — neither sponsor's contact page contains a
   * single mailto: or @house.gov address. A fabricated one would look helpful,
   * bounce silently, and leave someone believing they had been heard.
   */
  it('never puts an email address on a congressional target', () => {
    for (const t of ACTION_TARGETS) {
      expect(t.url).not.toMatch(/^mailto:/i);
      expect(t.url).not.toMatch(/@/);
      expect(t.url).toMatch(/^https:\/\//);
    }
    expect(BILL_COMMITTEE.membersUrl).toMatch(/^https:\/\//);
    expect(BILL_COMMITTEE.membersUrl).not.toMatch(/@/);
  });

  it('points only at .gov hosts, so no third party sits in the middle', () => {
    for (const t of ACTION_TARGETS) {
      expect(new URL(t.url).hostname).toMatch(/\.gov$/);
    }
    expect(new URL(BILL_COMMITTEE.membersUrl).hostname).toMatch(/\.gov$/);
  });

  it('every target says what the reader will actually meet, and when it was checked', () => {
    for (const t of ACTION_TARGETS) {
      expect(t.method.length).toBeGreaterThan(8);
      expect(t.why.length).toBeGreaterThan(20);
      expect(t.verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("flags Goldman's form as address-gated, because it is", () => {
    const g = must(
      ACTION_TARGETS.find((t) => t.id === 'goldman'),
      'goldman target',
    );
    expect(g.method.toLowerCase()).toContain('address');
  });

  it('drafts name a real bill and leave room for the sender to speak', () => {
    const numbers = BILLS.map((b) => b.number);
    for (const d of SUPPORT_DRAFTS) {
      expect(d.body).toContain('[');
      expect(d.subject.length).toBeGreaterThan(10);
      const named = numbers.some((n) => d.body.includes(n));
      expect(named).toBe(true);
    }
  });

  it('covers the sponsors the site actually names', () => {
    for (const b of BILLS) {
      const last = must(b.sponsor.split(' ').at(-1), 'sponsor surname');
      const hit = ACTION_TARGETS.some((t) => t.who.includes(last));
      expect(hit).toBe(true);
    }
  });
});
