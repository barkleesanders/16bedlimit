/**
 * Server-rendered SVG instrumentation.
 *
 * Everything here draws only measured points from src/data.ts. No smoothing,
 * no interpolation between census years, no invented distributions. Where a
 * series has gaps, the chart says so rather than drawing through them.
 */

import {
  BED_SERIES,
  DATA_THROUGH,
  HOSPITAL_SIZE,
  JAIL_SERIES,
  PRISON_SERIES,
  type WaiverStatus,
  waiverStatus,
} from './data';

/* ---------------- shared scale helpers ---------------- */

const X0 = 1950;
const X1 = 2028;

function sx(year: number, w: number, padL: number, padR: number): number {
  return padL + ((year - X0) / (X1 - X0)) * (w - padL - padR);
}

/** Square-root scale: keeps a 559k → 36k collapse legible next to a 1.6M rise. */
function syBeds(v: number, h: number, padT: number, padB: number, max: number): number {
  const t = Math.sqrt(v) / Math.sqrt(max);
  return h - padB - t * (h - padT - padB);
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

/* ================================================================
 * HERO — the fork in 1965
 * ================================================================ */

export function HeroChart() {
  const W = 1000;
  const H = 460;
  const padL = 62;
  const padR = 62;
  const padT = 46;
  const padB = 64;

  const bedMax = 600000;
  const prisonMax = 1700000;

  const bedPts = BED_SERIES.filter((p) => p.beds !== undefined).map((p) => ({
    year: p.year,
    v: p.beds as number,
    x: sx(p.year, W, padL, padR),
    y: syBeds(p.beds as number, H, padT, padB, bedMax),
    src: p.sourceName,
  }));

  const prisonPts = PRISON_SERIES.map((p) => ({
    year: p.year,
    v: p.prisoners,
    basis: p.basis,
    x: sx(p.year, W, padL, padR),
    y: syBeds(p.prisoners, H, padT, padB, prisonMax),
    src: p.sourceName,
  }));

  const jailPts = JAIL_SERIES.map((p) => ({
    year: p.year,
    v: p.jail,
    x: sx(p.year, W, padL, padR),
    y: syBeds(p.jail, H, padT, padB, prisonMax),
    src: p.sourceName,
  }));

  const line = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // The axis runs to the present year so a reader can see how current the
  // evidence is. NOW_YEAR is computed at render time rather than hardcoded, so
  // the chart cannot quietly go stale on a January.
  const NOW_YEAR = new Date().getUTCFullYear();
  const gridYears = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, NOW_YEAR];
  const markerX = sx(1965, W, padL, padR);

  // Where the published data actually stops. Drawn as an explicit boundary so
  // that extending the axis to today never implies figures nobody has released.
  const lastDataYear = Math.max(DATA_THROUGH.beds, DATA_THROUGH.prison, DATA_THROUGH.jail);
  const dataEndX = sx(lastDataYear, W, padL, padR);

  // End labels are anchored to real endpoints. If a series were ever emptied
  // (a source retracted, a filter tightened), the label is simply not drawn —
  // better than asserting a point exists and rendering NaN coordinates.
  const firstBed = bedPts[0];
  const lastBed = bedPts.at(-1);
  const lastPrison = prisonPts.at(-1);
  const lastJail = jailPts.at(-1);

  return (
    <figure class="chart chart--hero" id="chart-hero">
      <figcaption class="chart__cap">
        <span class="chart__idx">FIG. 01</span>
        <h3>Two capacities, one country</h3>
        <p>
          State psychiatric hospital beds against the number of people held in state and federal
          prisons and in local jails, 1955 to the present. Points are census and survey years, and
          the line between them is a connector, not measured data. The series stop where the
          published figures stop: beds and prisons at {DATA_THROUGH.beds}, jails at{' '}
          {DATA_THROUGH.jail}. Everything to the right of that line is time we have no national
          count for yet, not a decline to zero.
        </p>
      </figcaption>

      <div class="chart__scroll">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          class="chart__svg"
          role="img"
          aria-labelledby="hero-t hero-d"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id="hero-t">
            Psychiatric hospital beds falling and prison population rising, 1955 to the present
          </title>
          <desc id="hero-d">
            State psychiatric hospital beds fall from 558,922 in 1955 to 36,150 in 2023. Over the
            same period the state and federal prison population rises from 185,780 in 1955 to a peak
            of 1,612,395 in 2010 and stands at 1,254,200 in 2023. Local jails held 657,500 people at
            midyear 2024. Medicaid was enacted with the institutions for mental diseases exclusion
            in 1965. The horizontal axis continues to the current year; no line is drawn past the
            last year each agency has published, which is {DATA_THROUGH.beds} for beds and prisons
            and {DATA_THROUGH.jail} for jails.
          </desc>

          {/* grid */}
          {gridYears.map((y) => (
            <g>
              <line
                x1={sx(y, W, padL, padR)}
                y1={padT}
                x2={sx(y, W, padL, padR)}
                y2={H - padB}
                class="grid"
              />
              <text x={sx(y, W, padL, padR)} y={H - padB + 22} class="tick" text-anchor="middle">
                {y}
              </text>
            </g>
          ))}
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} class="axis" />

          {/* Where published data stops. The axis continues to the present year,
              and this boundary is what keeps that from reading as a collapse to
              zero: to its right, nobody has released a national count yet. */}
          <line
            x1={dataEndX}
            y1={padT}
            x2={dataEndX}
            y2={H - padB}
            class="data-end"
            stroke-dasharray="3 4"
          />
          <text x={dataEndX - 8} y={padT - 14} class="data-end-label" text-anchor="end">
            published data ends {lastDataYear}
          </text>

          {/* 1965 marker — the fork */}
          <line x1={markerX} y1={padT - 12} x2={markerX} y2={H - padB} class="marker-line" />
          {/* Width is sized to the string at 12px JetBrains Mono (~7.25px/char)
              plus padding. A short box silently clips the label — it did. */}
          <g class="marker-flag">
            <rect x={markerX - 4} y={padT - 34} width={296} height={24} rx="2" class="marker-box" />
            <text x={markerX + 6} y={padT - 17} class="marker-text">
              1965 · Medicaid enacted, with the rule
            </text>
          </g>

          {/* prison */}
          <path d={line(prisonPts)} class="ln ln--prison" />
          {prisonPts.map((p) => (
            <g class="pt">
              <circle cx={p.x} cy={p.y} r="5.5" class="dot dot--prison" />
              <title>
                {p.year}: {fmt(p.v)} people in state and federal prison ({p.basis} basis) — {p.src}
              </title>
            </g>
          ))}

          {/* jail */}
          <path d={line(jailPts)} class="ln ln--jail" />
          {jailPts.map((p) => (
            <g class="pt">
              <circle cx={p.x} cy={p.y} r="4.5" class="dot dot--jail" />
              <title>
                {p.year}: {fmt(p.v)} people in local jails — {p.src}
              </title>
            </g>
          ))}

          {/* beds */}
          <path d={line(bedPts)} class="ln ln--beds" />
          {bedPts.map((p) => (
            <g class="pt">
              <circle cx={p.x} cy={p.y} r="5.5" class="dot dot--beds" />
              <title>
                {p.year}: {fmt(p.v)} state psychiatric hospital beds — {p.src}
              </title>
            </g>
          ))}

          {/* end labels */}
          {firstBed ? (
            <text x={firstBed.x + 10} y={firstBed.y - 12} class="endlab endlab--beds">
              {fmt(firstBed.v)} beds
            </text>
          ) : null}
          {lastBed ? (
            <text
              x={lastBed.x - 6}
              y={lastBed.y + 26}
              class="endlab endlab--beds"
              text-anchor="end"
            >
              {fmt(lastBed.v)}
            </text>
          ) : null}
          {lastPrison ? (
            <text
              x={lastPrison.x - 6}
              y={lastPrison.y + 26}
              class="endlab endlab--prison"
              text-anchor="end"
            >
              {fmt(lastPrison.v)} in prison
            </text>
          ) : null}
          {lastJail ? (
            <text
              x={lastJail.x - 4}
              y={lastJail.y + 22}
              class="endlab endlab--jail"
              text-anchor="end"
            >
              {fmt(lastJail.v)} in jail
            </text>
          ) : null}
        </svg>
      </div>

      <ul class="legend" aria-hidden="true">
        <li>
          <i class="sw sw--beds" />
          State psychiatric beds
        </li>
        <li>
          <i class="sw sw--prison" />
          State and federal prison
        </li>
        <li>
          <i class="sw sw--jail" />
          Local jails
        </li>
      </ul>

      <p class="chart__scalenote">
        Both axes use a square-root scale so a collapse from 559,000 and a rise past 1.6 million
        stay readable in one frame. Point values are shown on hover and tap.
      </p>
    </figure>
  );
}

/* ================================================================
 * FIG 02 — hospital size against the statutory line
 * ================================================================ */

export function SizeChart() {
  const W = 1000;
  // Taller than it needs to be for the number line alone. The height is here to
  // give every label its own horizontal row: an earlier version packed the
  // limit, mean and 95th-percentile labels into a 30px band and the long
  // "fewer than 8%" sentence ran straight through "eligible", "108" and
  // "average hospital". Rows, not cleverness, are what stop that.
  const H = 300;
  const padL = 54;
  const padR = 54;
  const baseY = 196;

  const max = 340;
  const px = (beds: number) => padL + (beds / max) * (W - padL - padR);

  const limitX = px(HOSPITAL_SIZE.statutoryLimit);
  const meanX = px(HOSPITAL_SIZE.mean);
  const p95X = px(HOSPITAL_SIZE.p95);

  // One row per label, top to bottom. Named so a future edit moves a row
  // instead of nudging a magic number into someone else's row.
  const ROW_NOTE = 30; // full-width sentence, above the plot entirely
  const ROW_LIMIT = 92; // "16 — the statutory limit", by the red line
  const ROW_ELIGIBLE = 120; // sits over the green band on the far left
  const ROW_VALUE = 132; // "108" and the p95 tick value
  const ROW_VALUE_SUB = 150; // "average hospital", "95th percentile"

  return (
    <figure class="chart" id="chart-size">
      <figcaption class="chart__cap">
        <span class="chart__idx">FIG. 02</span>
        <h3>Where the line falls</h3>
        <p>
          Every psychiatric hospital larger than 16 beds is an institution for mental diseases, and
          Medicaid will not pay for adult care inside it. These are the measured landmarks of the
          national bed-size distribution.
        </p>
      </figcaption>

      <div class="chart__scroll">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          class="chart__svg"
          role="img"
          aria-labelledby="size-t size-d"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id="size-t">Psychiatric hospital size against the 16-bed Medicaid limit</title>
          <desc id="size-d">
            The federal limit is 16 beds. The average United States psychiatric hospital has 108
            beds. Ninety-five percent of psychiatric hospitals have fewer than 305 beds. Fewer than
            8 percent have 16 beds or fewer.
          </desc>

          {/* The long sentence gets its own full-width row above the plot, where
              nothing can collide with it. */}
          <text x={padL} y={ROW_NOTE} class="limit-sub">
            Fewer than 8% of psychiatric hospitals are at or below the 16-bed line.
          </text>

          {/* bands */}
          <rect x={limitX} y={baseY - 44} width={W - padR - limitX} height={88} class="band-bad" />
          <rect x={padL} y={baseY - 44} width={limitX - padL} height={88} class="band-ok" />

          <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} class="axis" />

          {[0, 16, 50, 108, 150, 200, 250, 305].map((b) => (
            <g>
              <line x1={px(b)} y1={baseY} x2={px(b)} y2={baseY + 7} class="axis" />
              <text x={px(b)} y={baseY + 26} class="tick" text-anchor="middle">
                {b}
              </text>
            </g>
          ))}
          <text x={(padL + W - padR) / 2} y={baseY + 50} class="axlab" text-anchor="middle">
            beds in the facility
          </text>

          {/* the limit */}
          <line x1={limitX} y1={ROW_LIMIT + 6} x2={limitX} y2={baseY + 8} class="limit-line" />
          <text x={limitX + 8} y={ROW_LIMIT} class="limit-lab">
            16 — the statutory limit
          </text>

          {/* "eligible" labels the green band it sits above. Left-anchored at the
              chart edge, far from the mean cluster in the middle. */}
          <text x={limitX - 8} y={ROW_ELIGIBLE} class="band-lab band-lab--ok" text-anchor="end">
            eligible
          </text>

          {/* mean */}
          <g>
            <line x1={meanX} y1={ROW_VALUE_SUB + 8} x2={meanX} y2={baseY + 8} class="mark-line" />
            <circle cx={meanX} cy={baseY} r="7" class="mark-dot" />
            <text x={meanX} y={ROW_VALUE} class="mark-lab" text-anchor="middle">
              108
            </text>
            <text x={meanX} y={ROW_VALUE_SUB} class="mark-sub" text-anchor="middle">
              average hospital
            </text>
          </g>

          {/* p95 */}
          <g>
            <line
              x1={p95X}
              y1={ROW_VALUE_SUB + 6}
              x2={p95X}
              y2={baseY + 8}
              class="mark-line mark-line--soft"
            />
            <text x={p95X} y={ROW_VALUE} class="mark-lab mark-lab--soft" text-anchor="middle">
              305
            </text>
            <text x={p95X} y={ROW_VALUE_SUB} class="mark-sub" text-anchor="middle">
              95th percentile
            </text>
          </g>

          <text x={limitX + 10} y={baseY + 74} class="band-lab band-lab--bad">
            Medicaid will not pay for adults 21 to 64 in this range
          </text>
        </svg>
      </div>

      <p class="chart__scalenote">
        Landmarks only. We do not have the full facility-by-facility distribution, so this is not
        drawn as a histogram. Source: {HOSPITAL_SIZE.sourceName}.
      </p>
    </figure>
  );
}

/* ================================================================
 * FIG 03 — state waiver grid
 * A cartogram grid, not a geographic map: every state gets equal
 * visual weight, and it stays readable on a phone.
 * ================================================================ */

const GRID: (string | null)[][] = [
  ['AK', null, null, null, null, null, null, null, null, null, 'ME'],
  [null, null, null, null, null, null, null, null, null, 'VT', 'NH'],
  [null, null, null, null, 'WI', null, 'MI', null, 'NY', 'MA', 'RI'],
  [null, 'ID', 'MT', 'ND', 'MN', 'IL', 'IN', 'OH', 'PA', 'NJ', 'CT'],
  [null, 'WA', 'WY', 'SD', 'IA', 'MO', 'KY', 'WV', 'VA', 'MD', 'DE'],
  [null, 'OR', 'NV', 'CO', 'NE', 'AR', 'TN', 'NC', 'SC', 'DC', null],
  [null, 'CA', 'UT', 'NM', 'KS', 'LA', 'MS', 'AL', 'GA', null, null],
  ['HI', null, 'AZ', null, 'OK', 'TX', null, null, null, 'FL', null],
];

const ORDER: WaiverStatus[] = ['both', 'sud', 'smi', 'pending', 'none'];

export function WaiverMap() {
  const cell = 74;
  const gap = 7;
  const cols = 11;
  const rows = GRID.length;
  const W = cols * (cell + gap) + gap;
  const H = rows * (cell + gap) + gap;

  const counts: Record<WaiverStatus, number> = {
    both: 0,
    sud: 0,
    smi: 0,
    pending: 0,
    none: 0,
  };
  for (const row of GRID) {
    for (const c of row) {
      if (c) counts[waiverStatus(c)]++;
    }
  }

  return (
    <figure class="chart" id="chart-waivers">
      <figcaption class="chart__cap">
        <span class="chart__idx">FIG. 03</span>
        <h3>Who got a waiver</h3>
        <p>
          States can ask CMS for a section 1115 demonstration waiver to bill Medicaid for short IMD
          stays anyway. Most have one for addiction treatment. Far fewer have one for mental health.
          Every square is one state, sized equally.
        </p>
      </figcaption>

      <div class="chart__scroll">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          class="chart__svg chart__svg--map"
          role="img"
          aria-labelledby="wv-t wv-d"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id="wv-t">Section 1115 IMD waiver status by state</title>
          {/* The counts are stated here, not just drawn, so a screen-reader
              user gets the finding rather than 51 unlabelled squares. */}
          <desc id="wv-d">
            A grid of all fifty states and the District of Columbia. {counts.both} have approved
            section 1115 waivers for both substance use disorder and mental health treatment,{' '}
            {counts.sud} for addiction treatment only, {counts.smi} for mental health only,{' '}
            {counts.pending} have an application pending with CMS, and {counts.none} have neither an
            approved waiver nor a pending application.
          </desc>
          {GRID.map((row, r) =>
            row.map((code, c) => {
              if (!code) return null;
              const st = waiverStatus(code);
              return (
                // No tabindex/role here on purpose. The parent <svg> carries
                // role="img" with a <desc> that states the counts, so 51
                // focusable groups would add 51 tab stops that announce
                // nothing useful. The <title> still gives a pointer tooltip.
                <g class={`st st--${st}`}>
                  <rect
                    x={gap + c * (cell + gap)}
                    y={gap + r * (cell + gap)}
                    width={cell}
                    height={cell}
                    rx="3"
                  />
                  <text
                    x={gap + c * (cell + gap) + cell / 2}
                    y={gap + r * (cell + gap) + cell / 2 + 7}
                    text-anchor="middle"
                    class="st__code"
                  >
                    {code}
                  </text>
                  <title>
                    {code}:{' '}
                    {st === 'both'
                      ? 'approved waivers for both substance use disorder and mental health treatment'
                      : st === 'sud'
                        ? 'approved waiver for substance use disorder treatment only'
                        : st === 'smi'
                          ? 'approved waiver for mental health treatment only'
                          : st === 'pending'
                            ? 'application pending with CMS'
                            : 'no approved or pending IMD waiver'}
                  </title>
                </g>
              );
            }),
          )}
        </svg>
      </div>

      <ul class="legend legend--map">
        {ORDER.map((k) => (
          <li>
            <i class={`sw sw--st sw--${k}`} />
            {k === 'both'
              ? 'Both'
              : k === 'sud'
                ? 'Addiction only'
                : k === 'smi'
                  ? 'Mental health only'
                  : k === 'pending'
                    ? 'Pending'
                    : 'None'}
            <b>{counts[k]}</b>
          </li>
        ))}
      </ul>

      <p class="chart__scalenote">
        A waiver is a time-limited demonstration, not a change in the law. It usually covers only
        short stays and comes with CMS milestones the state has to hit.
      </p>
    </figure>
  );
}
