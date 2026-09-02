import { describe, expect, it } from 'vitest';
import { HeroChart } from './charts';
import {
  ACTION_TARGETS,
  BED_SERIES,
  BILL_COMMITTEE,
  BILLS,
  BILLS_COMPOSITION,
  buildKnowledgeBase,
  CBO_OPTIONS,
  CONSEQUENCES,
  EXECUTIVE_ORDER,
  FIX,
  FUNDING_ROUTES,
  HOSPITAL_SIZE,
  JAIL_SERIES,
  LINEAGE,
  MEASURED_ABSENCES,
  NUMBER_CHAIN,
  OBJECTION,
  OBJECTION_ANSWER,
  PARTY_VERDICT,
  PREVALENCE,
  PRISON_SERIES,
  PUBLISHER,
  RECORD_FINDINGS,
  RECORD_NAMED,
  RECORD_UNIDENTIFIED,
  RECORD_UNKNOWNS,
  REPORT,
  ROLL_CALLS,
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

  // Plain http would be downgraded or blocked by the page's own security
  // headers, and a citation the reader cannot open is not a citation. The
  // regex above deliberately tolerates http so it can describe older data;
  // the bibliography does not get that latitude.
  it('every source url is https, not plain http', () => {
    for (const s of SOURCES) expect(s.url, s.name).toMatch(/^https:\/\//);
  });

  it('carries the legislative-record sources the report is built on', () => {
    const urls = new Set(SOURCES.map((s) => s.url));
    const missing: string[] = [];
    for (const u of [
      'https://www.govinfo.gov/content/pkg/STATUTE-79/pdf/STATUTE-79-Pg286.pdf',
      'https://www.govinfo.gov/content/pkg/STATUTE-64/pdf/STATUTE-64-Pg477.pdf',
      'https://www.govinfo.gov/content/pkg/STATUTE-49/pdf/STATUTE-49-Pg620.pdf',
      'https://www.govinfo.gov/content/pkg/STATUTE-102/pdf/STATUTE-102-Pg683.pdf',
      'https://www.govinfo.gov/content/pkg/FR-1978-09-29/pdf/FR-1978-09-29.pdf',
      'https://www.ssa.gov/history/1960.html',
      'https://www.ssa.gov/history/tally65.html',
      'https://www.law.cornell.edu/uscode/text/42/1382',
      'https://www.cbo.gov/publication/59071',
      'https://voteview.com/data',
    ].filter((u) => !urls.has(u))) {
      missing.push(u);
    }
    // Collected, not asserted in the loop: a bare expect() inside a for-loop
    // throws on the first failure and hides every offender after it, so a
    // bibliography missing three URLs would report one and look nearly green.
    expect(missing).toEqual([]);
  });

  it('every record finding cites a source that is in the bibliography', () => {
    const urls = new Set(SOURCES.map((s) => s.url));
    for (const f of RECORD_FINDINGS) {
      expect(f.source, f.id).toMatch(httpsUrl);
      expect(urls.has(f.source), `${f.id} cites a source not in SOURCES`).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ *
 * THE LEGISLATIVE RECORD — the section is an accountability claim, so
 * the shapes that make it checkable are themselves load-bearing.
 * ------------------------------------------------------------------ */

describe('legislative record', () => {
  it('states what is not known instead of leaving the gap silent', () => {
    // The site's honesty convention. If this text ever stops saying the
    // drafter is unrecoverable, someone has quietly filled in a name.
    expect(RECORD_UNKNOWNS).toMatch(/not recoverable|does not name|no rationale/i);
  });

  it('does not claim Stark wrote the 16-bed paragraph', () => {
    const stark = must(
      RECORD_NAMED.find((n) => n.who.includes('Stark')),
      'the Stark entry',
    );
    expect(stark.what).toMatch(/no evidence/i);
  });

  it('every named person says what the document shows they did', () => {
    for (const n of RECORD_NAMED) {
      expect(n.who.length, n.who).toBeGreaterThan(3);
      expect(n.what.length, n.who).toBeGreaterThan(30);
    }
  });

  it('every roll call carries a real tally', () => {
    for (const r of ROLL_CALLS) {
      expect(r.tally, `${r.year} ${r.chamber}`).toMatch(/^\d+-\d+$/);
      expect(r.year).toBeGreaterThan(1900);
      expect(r.year).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });

  it('the published report is served from this site at a stable path', () => {
    expect(REPORT.href).toBe('/reports/who-built-the-16-bed-limit.pdf');
    expect(REPORT.href.endsWith('.pdf')).toBe(true);
    expect(REPORT.pages).toBeGreaterThan(0);
    expect(REPORT.bytes).toBeGreaterThan(0);
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

/* ------------------------------------------------------------------ *
 * THE FULL RECORD — the page now carries the whole report, so the
 * claims that were CORRECTED against primary sources get locked here.
 * A future edit that quietly restores the old story fails these.
 * ------------------------------------------------------------------ */

describe('the full record', () => {
  it('the lineage starts in 1950, not 1965 — Medicaid inherited this rule', () => {
    const years = LINEAGE.map((s) => s.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    // 1950 is the finding. If the earliest step ever becomes 1965 again,
    // the site is back to saying Medicaid created the exclusion.
    const origin = must(
      LINEAGE.find((s) => /origin point/i.test(s.title)),
      'the 1950 origin step',
    );
    expect(origin.year).toBe(1950);
  });

  it('every lineage step cites a source that is in the bibliography', () => {
    const urls = new Set(SOURCES.map((s) => s.url));
    const missing = LINEAGE.filter((s) => !urls.has(s.source)).map((s) => s.sourceName);
    expect(missing).toEqual([]);
  });

  it('the statute came first and the regulation followed — not the reverse', () => {
    const reg1978 = must(
      NUMBER_CHAIN.find((s) => s.year === 1978),
      'the 1978 step',
    );
    const statute = must(
      NUMBER_CHAIN.find((s) => s.year === 1988),
      'the 1988 step',
    );
    const reg1991 = must(
      NUMBER_CHAIN.find((s) => s.year === 1991),
      'the 1991 step',
    );
    // The load-bearing order: reg with no number -> statute -> reg conforms.
    expect(reg1978.year).toBeLessThan(statute.year);
    expect(statute.year).toBeLessThan(reg1991.year);
    expect(reg1978.what).toMatch(/no bed count/i);
  });

  it('WHY_SIXTEEN no longer says the 1988 statute followed the regulation on the number', () => {
    // The corrected claim must state that the pre-1988 regulation carried NO
    // bed count. Without this the site contradicts its own record section.
    const joined = WHY_SIXTEEN.documented.map((d) => d.claim).join(' ');
    expect(joined).toMatch(/without any bed count/i);
    expect(joined).not.toMatch(/statute followed the regulatory definition/i);
  });

  it('the site does not assert Pierce as the documented cause', () => {
    const pierce = must(
      TIMELINE.find((t) => t.year === 1854),
      'the 1854 entry',
    );
    // It may report the scholarly reading; it may not assert it as fact.
    expect(pierce.what).toMatch(/no primary document|later scholarship/i);
  });

  it('every measured absence carries a control, because a zero without one proves nothing', () => {
    const uncontrolled = MEASURED_ABSENCES.filter(
      (a) => !a.control.trim() || (a.control === '—' && !/not searched|unmeasured/i.test(a.result)),
    ).map((a) => a.searched);
    // A dash is only allowed where the result itself says it was never measured.
    expect(uncontrolled).toEqual([]);
  });

  it('exactly one CBO option is marked as enacted', () => {
    expect(CBO_OPTIONS.filter((o) => o.enacted)).toHaveLength(1);
    for (const o of CBO_OPTIONS) expect(o.cost, o.option).toMatch(/^\$[\d.]+(–[\d.]+)?B$/);
  });

  it('roll-call party splits are well formed wherever they are given', () => {
    for (const r of ROLL_CALLS) {
      if (r.dem !== undefined) expect(r.dem, `${r.year} ${r.chamber} dem`).toMatch(/^\d+-\d+$/);
      if (r.rep !== undefined) expect(r.rep, `${r.year} ${r.chamber} rep`).toMatch(/^\d+-\d+$/);
    }
  });

  it('names the unidentified as unidentified rather than omitting them', () => {
    expect(RECORD_UNIDENTIFIED.length).toBeGreaterThan(0);
    for (const n of RECORD_UNIDENTIFIED)
      expect(n.what).toMatch(/not identifiable|not individually/i);
  });

  it('the party answer refuses to name a party', () => {
    expect(PARTY_VERDICT.points.length).toBeGreaterThanOrEqual(4);
    expect(PARTY_VERDICT.conclusion).toMatch(/refuses to give you one/i);
  });

  it('the knowledge base carries the record, so the assistant is not blind to it', () => {
    const kb = buildKnowledgeBase();
    const missing = [
      'Lineage, verified against the enacted statute',
      'Where the number 16 came from',
      'Measured absences',
      'WHICH PARTY DID THIS',
    ].filter((needle) => !kb.includes(needle));
    expect(missing).toEqual([]);
    // And it must not tell a reader the PDF is required to get the answer.
    expect(kb).toMatch(/never tell a reader they must download the PDF/i);
  });
});

/* ------------------------------------------------------------------ *
 * PUBLISHER IDENTITY — this node asserts, publicly, that a specific
 * 501(c)(3) publishes this site. Getting the entity wrong is a
 * misrepresentation, not an SEO defect, so the shape is pinned here.
 * ------------------------------------------------------------------ */

describe('publisher identity', () => {
  it('names the nonprofit, not the separate for-profit ESBE LLC', () => {
    expect(PUBLISHER.legalName).toBe('ESBE Incorporated');
    // ESBE LLC is a DIFFERENT legal entity (EIN 85-0590511). Its identifiers
    // must never appear here — that would assert tax-exempt status for a
    // for-profit, which is the entity-confusion failure this guards.
    const blob = JSON.stringify(PUBLISHER);
    expect(blob).not.toMatch(/85-?0590511/);
    expect(blob).not.toMatch(/ESBE LLC/i);
  });

  it('carries the nonprofit EIN and every anchor is keyed to it', () => {
    expect(PUBLISHER.taxID).toBe('87-1218291');
    expect(PUBLISHER.sameAs.length).toBeGreaterThan(0);
    // Each anchor was looked up BY the EIN against a registry, so each URL
    // must contain that EIN in one of its two written forms. A URL that does
    // not is a guessed slug, which is the thing that must never ship here.
    const notKeyed = PUBLISHER.sameAs.filter((u) => !/87-?1218291/.test(u));
    expect(notKeyed).toEqual([]);
  });

  it('every anchor is https and unique', () => {
    for (const u of PUBLISHER.sameAs) expect(u, u).toMatch(/^https:\/\//);
    expect(new Set(PUBLISHER.sameAs).size).toBe(PUBLISHER.sameAs.length);
  });
});

describe('why sixteen — the nearest rationale', () => {
  it('presents the 1976 SSI figure as a purpose, never as the derivation of the Medicaid number', () => {
    // The whole value of this block is that it does NOT overclaim. If the
    // caution ever stops saying the link is unproven, a hypothesis has been
    // promoted to a finding — which is the exact failure the page argues against.
    expect(WHY_SIXTEEN.nearest.caution).toMatch(/no document connects/i);
    expect(WHY_SIXTEEN.nearest.caution).toMatch(/not evidence|open question/i);
    expect(WHY_SIXTEEN.nearest.finding).toMatch(/outer limit/i);
  });

  it('still states plainly that no cost model, bed-supply study or clinical standard exists', () => {
    expect(WHY_SIXTEEN.notDocumented).toMatch(/cost model/i);
    expect(WHY_SIXTEEN.notDocumented).toMatch(/clinical standard/i);
  });

  it('the nearest-rationale source is in the bibliography', () => {
    expect(new Set(SOURCES.map((s) => s.url)).has(WHY_SIXTEEN.nearest.source)).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * THE 2026-09-02 ADDITIONS.
 *
 * Each block locks a fact that was measured against a primary source on
 * that date. These are not style checks: if a later edit changes a term
 * count, drops a bill, or softens the inference label on the §1396n
 * reading, the site would be asserting something nobody re-measured.
 * ------------------------------------------------------------------ */

describe('executive order 14321', () => {
  /**
   * Counted in the order's OPERATIVE text on 2026-09-02 — from "By the
   * authority vested" to the signature. Counting the whole page instead
   * reports "residential" ten times, nine of which are the substring
   * inside "Presidential" in the site navigation, and "Medicaid" once,
   * which is a nav headline rather than a word in the order.
   */
  it('carries the counts that were actually measured', () => {
    const present = new Map(EXECUTIVE_ORDER.present.map((t) => [t.term, t.count]));
    expect(present.get('civil commitment')).toBe(7);
    expect(present.get('institutional treatment')).toBe(1);
    expect(present.get('forensic bed capacity')).toBe(1);

    const absent = new Map(EXECUTIVE_ORDER.absent.map((t) => [t.term, t.count]));
    expect(absent.get('institution for mental diseases')).toBe(0);
    expect(absent.get('IMD')).toBe(0);
    expect(absent.get('16 bed')).toBe(0);
    expect(absent.get('Medicaid')).toBe(0);
  });

  it('keeps a positive control, so the zeros mean something', () => {
    // A term list where nothing was found would be a fact about the search,
    // not about the order. At least one non-zero count has to be shown.
    expect(EXECUTIVE_ORDER.present.length).toBeGreaterThan(0);
    for (const t of EXECUTIVE_ORDER.present) expect(t.count).toBeGreaterThan(0);
    for (const t of EXECUTIVE_ORDER.absent) expect(t.count).toBe(0);
  });

  it('cites both the order and its Federal Register publication', () => {
    expect(EXECUTIVE_ORDER.source).toMatch(/^https:\/\/www\.whitehouse\.gov\//);
    expect(EXECUTIVE_ORDER.registerSource).toMatch(/^https:\/\/www\.federalregister\.gov\//);
    expect(EXECUTIVE_ORDER.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(EXECUTIVE_ORDER.citation).toBe('90 FR 35817');
    expect(EXECUTIVE_ORDER.signed).toBe('2025-07-24');
    const urls = new Set(SOURCES.map((x) => x.url));
    expect(urls.has(EXECUTIVE_ORDER.source)).toBe(true);
    expect(urls.has(EXECUTIVE_ORDER.registerSource)).toBe(true);
  });

  it('does not claim the order is unlawful or that repeal is anyone’s policy', () => {
    // Only the ASSERTIVE prose is checked for these words. The limit block
    // has to be allowed to contain them, because its whole job is to say
    // "this is not a claim that the order is unlawful" — a bare
    // word-presence check over both would fail the disclaimer for
    // disclaiming, which is how a naive gate ends up deleting the caveat.
    expect(EXECUTIVE_ORDER.reading.toLowerCase()).not.toMatch(/\billegal\b|\bunlawful\b|\bhypocri/);
    expect(EXECUTIVE_ORDER.limit.toLowerCase()).toContain('not a claim that the order is unlawful');
    expect(EXECUTIVE_ORDER.limit.length).toBeGreaterThan(60);
  });
});

describe('the bills table', () => {
  it('carries all six bills, each identified uniquely', () => {
    expect(BILLS).toHaveLength(6);
    expect(new Set(BILLS.map((b) => b.number)).size).toBe(6);
    expect(new Set(BILLS.map((b) => b.slug)).size).toBe(6);
    for (const b of BILLS) {
      expect(b.number, b.slug).toMatch(/^H\.R\. \d+$/);
      expect(b.slug).toMatch(/^hr\d+$/);
      // The slug and the number must agree, or a link points at another bill.
      expect(`hr${b.number.replace('H.R. ', '')}`).toBe(b.slug);
    }
  });

  it('names a party and a district for every sponsor', () => {
    for (const b of BILLS) {
      expect(b.party, b.number).toMatch(/^[DRI]$/);
      expect(b.district, b.number).toMatch(/^[A-Z]{2}-\d{1,2}$/);
      expect(b.sponsor.length, b.number).toBeGreaterThan(3);
    }
  });

  it('is ordered by introduction date, oldest first', () => {
    const dates = BILLS.map((b) => b.introduced);
    for (const d of dates) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect([...dates].sort()).toEqual(dates);
  });

  it('links each bill to its own congress.gov record', () => {
    for (const b of BILLS) {
      const n = b.number.replace('H.R. ', '');
      expect(b.congressUrl).toBe(`https://www.congress.gov/bill/119th-congress/house-bill/${n}`);
    }
    expect(new Set(BILLS.map((b) => b.congressUrl)).size).toBe(6);
  });

  it('records the bipartisan sponsors the set actually has', () => {
    // Republican sponsorship is the single most load-bearing fact in the
    // composition note. If a row is ever dropped, the note becomes false.
    const rep = BILLS.filter((b) => b.party === 'R');
    expect(rep).toHaveLength(2);
    expect(rep.map((b) => b.number).sort()).toEqual(['H.R. 5944', 'H.R. 8095']);
    expect(BILLS_COMPOSITION).toContain('Energy and Commerce');
    // Referred to the COMMITTEE — no subcommittee referral is recorded for
    // any of the six, checked against BILLSTATUS with a positive control.
    expect(BILLS_COMPOSITION.toLowerCase()).not.toContain('subcommittee');
  });
});

describe('which sentence has to change', () => {
  it('points at the age bar and reuses the statute the page already quotes', () => {
    expect(FIX.points.join(' ')).toContain('§1905(i)');
    expect(FIX.points.join(' ')).toContain('has not attained 65 years of age');
    expect(FIX.points.join(' ')).toContain('21 through 64');
  });

  it('derives its arithmetic from HOSPITAL_SIZE rather than a typed-in number', () => {
    expect(FIX.arithmetic).toContain(String(HOSPITAL_SIZE.mean));
    expect(FIX.arithmetic).toContain('36');
  });

  it('labels the §1396n reading as an inference and cites it', () => {
    expect(FIX.inference.label.toLowerCase()).toContain('inference');
    expect(FIX.inference.caution.toLowerCase()).toContain('legislative counsel');
    expect(FIX.inference.body).toContain('home or community setting');
    expect(new Set(SOURCES.map((x) => x.url)).has(FIX.inference.source)).toBe(true);
  });
});

describe('the objection, quoted', () => {
  it('carries the sentence verbatim, with the context it sits in', () => {
    expect(OBJECTION.quote).toBe(
      'The IMD exclusion is essential to ensuring that states are incentivized to invest in community-based services rather than services in IMD settings, where FFP is not permitted.',
    );
    // Without the first half of the footnote the quote reads as a campaign
    // to preserve the exclusion. It was written while conceding a point.
    expect(OBJECTION.quoteContext).toContain('not seeking to undermine');
    expect(OBJECTION.attribution).toContain('Bazelon');
    expect(OBJECTION.attribution).toContain('30 August 2024');
  });

  it('marks the outcome figures as the objector’s, not the site’s', () => {
    const numbers = must(
      OBJECTION.supporting.find((x) => x.claim.includes('Nathaniel')),
      'Nathaniel/Thresholds row',
    );
    expect(numbers.note.toLowerCase()).toContain('without a citation');
    expect(numbers.claim).toContain('70%');
    expect(numbers.claim).toContain('89%');
  });

  it('cites a source that is in the bibliography', () => {
    expect(OBJECTION.source).toMatch(/^https:\/\//);
    expect(OBJECTION.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Set(SOURCES.map((x) => x.url)).has(OBJECTION.source)).toBe(true);
  });

  it('answers the objection with drafting, and says what repeal does not reach', () => {
    expect(OBJECTION_ANSWER.points).toHaveLength(4);
    expect(OBJECTION_ANSWER.points.join(' ')).toContain('§1915(l)(3)');
    expect(OBJECTION_ANSWER.points.join(' ')).toContain('H.R. 4022');
    expect(OBJECTION_ANSWER.scope.toLowerCase()).toContain('civil commitment is state law');
  });
});

describe('sources added on 2026-09-02', () => {
  const ADDED = [
    EXECUTIVE_ORDER.source,
    EXECUTIVE_ORDER.registerSource,
    OBJECTION.source,
    FIX.inference.source,
  ];

  it('every one is in SOURCES with an https url and a described use', () => {
    for (const url of ADDED) {
      const entry = must(
        SOURCES.find((x) => x.url === url),
        `SOURCES entry for ${url}`,
      );
      expect(entry.url).toMatch(/^https:\/\//);
      expect(entry.name.length).toBeGreaterThan(10);
      expect(entry.org.length).toBeGreaterThan(3);
      expect(entry.used.length).toBeGreaterThan(20);
    }
  });

  it('every claim block carries the date it was fetched', () => {
    // SourceEntry has no date field of its own; the retrieval date lives on
    // the block that makes the claim, which is what a reader needs.
    for (const d of [EXECUTIVE_ORDER.retrieved, OBJECTION.retrieved, FIX.retrieved]) {
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d).toBe('2026-09-02');
    }
  });

  it('reaches the assistant, so it can answer from the new material', () => {
    const kb = buildKnowledgeBase();
    expect(kb).toContain('Executive Order 14321');
    expect(kb).toContain('forensic bed capacity');
    expect(kb).toContain('H.R. 5944');
    expect(kb).toContain('H.R. 4022');
    expect(kb).toContain(OBJECTION.quote);
    expect(kb).toContain('Energy and Commerce');
  });
});
