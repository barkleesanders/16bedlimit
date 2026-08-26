import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DATA_THROUGH } from './data';
import { extractPublicationYears, fingerprint, PROBES } from './freshness';

const fixture = (name: string): string =>
  readFileSync(join(__dirname, '__fixtures__', 'freshness', name), 'utf8');

describe('extractPublicationYears', () => {
  /**
   * The regression this file exists for. On 2026-08-26 a whole-page regex
   * reported a 2025 jail release, because it matched from the title
   * "Jails Report Series: 2024 Preliminary Data Release" across into the
   * neighbouring "Date Published December 2025" field. That page is captured
   * verbatim here, so the false positive can never come back silently.
   */
  it('does not mistake a December 2025 publish date for a 2025 data year', () => {
    const html = fixture('bjs-jails-list.html');
    expect(html).toContain('December 2025'); // the trap is really in the fixture
    expect(extractPublicationYears(html)).not.toContain(2025);
  });

  it('reads the real jail data years off BJS list titles', () => {
    const years = extractPublicationYears(fixture('bjs-jails-list.html'));
    expect(years).toContain(2024); // Jails Report Series: 2024 Preliminary Data Release
    expect(years).toContain(2023); // Jail Inmates in 2023 – Statistical Tables
    expect(Math.max(...years)).toBe(2024);
  });

  it('reads the real prison data years and finds nothing past 2023', () => {
    const years = extractPublicationYears(fixture('bjs-prisons-list.html'));
    expect(years.length).toBeGreaterThan(0);
    expect(Math.max(...years)).toBe(DATA_THROUGH.prison);
  });

  it('returns an empty list rather than guessing when a page has no titles', () => {
    expect(extractPublicationYears('<html><body>no links here, just 2026</body></html>')).toEqual(
      [],
    );
  });

  it('ignores years beyond next year, which are typos not releases', () => {
    const html = '<a href="/library/publications/x">Jail Inmates in 2099 – Statistical Tables</a>';
    expect(extractPublicationYears(html)).toEqual([]);
  });
});

describe('probe configuration', () => {
  it('each probe agrees with the year the site actually plots', () => {
    for (const p of PROBES) {
      expect(p.plotted).toBe(DATA_THROUGH[p.key]);
    }
  });

  it('probes point at agency list pages, never at constructed deep links', () => {
    for (const p of PROBES) {
      expect(p.listUrl).toMatch(/^https:\/\//);
      expect(p.listUrl).not.toMatch(/\d{4}-preliminary/); // a guessed year path
    }
  });

  it('covers every series the chart draws', () => {
    expect(new Set(PROBES.map((p) => p.key))).toEqual(new Set(['beds', 'prison', 'jail']));
  });
});

describe('fingerprint (change-watch)', () => {
  /**
   * The property the whole change-watch mode rests on. Measured against the
   * real TAC page: three fetches, differing raw bytes, identical fingerprint.
   * If this stops holding, the watch fires every week and means nothing.
   */
  it('ignores markup and volatile tokens', () => {
    const a =
      '<html><body><p>State beds 36,150</p><script>var n="deadbeefdeadbeef1234";</script></body></html>';
    const b =
      '<html><body>  <p>State   beds 36,150</p><script>var n="cafebabecafebabe9999";</script>  </body></html>';
    expect(fingerprint(a)).toBe(fingerprint(b));
  });

  it('changes when the visible text actually changes', () => {
    expect(fingerprint('<p>State beds 36,150</p>')).not.toBe(
      fingerprint('<p>State beds 35,000</p>'),
    );
  });

  it('is stable across repeated calls', () => {
    const html = '<p>Overview of State Hospital Systems</p>';
    expect(fingerprint(html)).toBe(fingerprint(html));
  });
});

describe('probe modes', () => {
  it('uses change-watch only where the source publishes no dated titles', () => {
    const beds = PROBES.find((p) => p.key === 'beds');
    expect(beds?.mode).toBe('change-watch');
    for (const p of PROBES.filter((x) => x.key !== 'beds')) {
      expect(p.mode).toBe('year-list');
    }
  });

  it("the beds source really does lack dated titles, which is why it's change-watch", () => {
    expect(extractPublicationYears(fixture('tac-state-beds.html'))).toEqual([]);
  });
});
