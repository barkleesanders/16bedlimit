/**
 * Direction: INDUSTRIAL / INSTRUMENT PANEL.
 *
 * Scene: a committee staffer reading a printed system readout at a hearing
 * table under fluorescent light, needing to find one number fast. That forces
 * light, high contrast, precise rules — not a dark terminal, which is the
 * reflex for anything "technical".
 *
 * Type: JetBrains Mono for readouts and headings (deliberate), IBM Plex Sans
 * for prose. Color: OKLCH throughout, every neutral tinted, no raw #000/#fff.
 */

export const CSS = `
:root {
  --bg:        oklch(0.968 0.006 85);
  --panel:     oklch(0.995 0.003 85);
  --panel-2:   oklch(0.945 0.007 85);
  --ink:       oklch(0.235 0.014 260);
  --ink-2:     oklch(0.435 0.016 260);
  --ink-3:     oklch(0.560 0.014 260);
  --rule:      oklch(0.855 0.010 260);
  --rule-2:    oklch(0.915 0.007 260);

  --signal:    oklch(0.545 0.196 27);
  --signal-bg: oklch(0.945 0.040 27);
  --beds:      oklch(0.470 0.108 238);
  --prison:    oklch(0.545 0.155 48);
  --jail:      oklch(0.640 0.115 62);
  --ok:        oklch(0.520 0.115 156);
  --ok-bg:     oklch(0.950 0.036 156);
  --pend:      oklch(0.640 0.120 92);

  --mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  --sans: "IBM Plex Sans", system-ui, -apple-system, sans-serif;

  --gut: clamp(1rem, 4vw, 2.5rem);
  --maxw: 1180px;
}

*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 17px;
  line-height: 1.62;
  -webkit-font-smoothing: antialiased;
  background-image:
    linear-gradient(to right, oklch(0.90 0.008 260 / 0.30) 1px, transparent 1px),
    linear-gradient(to bottom, oklch(0.90 0.008 260 / 0.30) 1px, transparent 1px);
  background-size: 32px 32px;
}

.wrap { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--gut); }

a { color: var(--ink); text-underline-offset: 3px; text-decoration-thickness: 1px; }
a:hover { color: var(--signal); }
:focus-visible { outline: 2px solid var(--signal); outline-offset: 3px; }

/* ---------- masthead ---------- */
.mast {
  border-bottom: 1px solid var(--rule);
  background: var(--panel);
  position: sticky; top: 0; z-index: 40;
}
.mast__in {
  max-width: var(--maxw); margin: 0 auto; padding: 0 var(--gut);
  display: flex; align-items: center; gap: 1rem; min-height: 56px;
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em;
}
.mast__id { font-weight: 700; text-transform: uppercase; white-space: nowrap; }
.mast__id a { text-decoration: none; }
.mast__nav { margin-left: auto; display: flex; gap: 1.1rem; overflow-x: auto; scrollbar-width: none; }
.mast__nav::-webkit-scrollbar { display: none; }
.mast__nav a { color: var(--ink-2); text-decoration: none; white-space: nowrap; text-transform: uppercase; }
.mast__nav a:hover { color: var(--signal); }
@media (max-width: 720px) { .mast__nav { display: none; } }

/* ---------- hero ---------- */
.hero { padding: clamp(2rem, 6vw, 4rem) 0 1rem; }
.hero__kicker {
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-3); margin: 0 0 1.1rem;
}
.hero h1 {
  font-family: var(--mono);
  font-size: clamp(2.1rem, 7vw, 4rem);
  line-height: 1.02; letter-spacing: -0.03em; font-weight: 700;
  margin: 0 0 1.2rem; max-width: 20ch;
}
.hero h1 b { color: var(--signal); font-weight: 700; }
.hero__lede--turn{margin-top:.85rem;font-weight:500;color:var(--ink,oklch(0.235 0.014 260))}
.hero__lede--turn::before{content:"";display:block;width:34px;height:2px;background:oklch(0.545 0.196 27);margin:0 0 .8rem}
.hero__lede { font-size: clamp(1.05rem, 2.4vw, 1.28rem); max-width: 64ch; color: var(--ink-2); margin: 0 0 2rem; }

/* readout panel */
.readout {
  border: 1px solid var(--ink);
  background: var(--panel);
  margin: 0 0 2.4rem;
  box-shadow: 4px 4px 0 oklch(0.235 0.014 260 / 0.09);
}
.readout__hd {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.5rem 0.9rem; border-bottom: 1px solid var(--ink);
  background: var(--panel-2);
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
}
.readout__hd b { font-weight: 700; }
.readout__hd span { margin-left: auto; color: var(--ink-3); }
.readout__rows { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); }
.rrow { padding: 1rem 0.9rem; border-right: 1px solid var(--rule-2); border-bottom: 1px solid var(--rule-2); }
.rrow:last-child { border-right: 0; }
.rrow__k { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 0.35rem; }
.rrow__v { font-family: var(--mono); font-size: clamp(1.5rem, 4vw, 2.1rem); font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
.rrow__v--sig { color: var(--signal); }
.rrow__n { font-size: 13px; color: var(--ink-3); margin: 0.4rem 0 0; line-height: 1.45; }

/* ---------- sections ---------- */
section { padding: clamp(2.4rem, 6vw, 4.2rem) 0; border-top: 1px solid var(--rule); }
.sec__idx {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-3); display: block; margin-bottom: 0.7rem;
}
h2 {
  font-family: var(--mono); font-size: clamp(1.5rem, 4vw, 2.15rem);
  letter-spacing: -0.02em; line-height: 1.12; margin: 0 0 1rem; font-weight: 700;
}
h3 { font-family: var(--mono); font-size: 1.1rem; letter-spacing: -0.01em; margin: 0 0 0.5rem; font-weight: 700; }
p { max-width: 68ch; }
.lede { font-size: 1.1rem; color: var(--ink-2); }

/* statute block */
.statute {
  border-left: 3px solid var(--signal);
  background: var(--panel);
  padding: 1.2rem 1.3rem; margin: 1.6rem 0;
}
.statute q { font-family: var(--mono); font-size: 0.98rem; line-height: 1.6; display: block; quotes: none; }
.statute q::before { content: '"'; } .statute q::after { content: '"'; }
.statute cite {
  display: block; margin-top: 0.8rem; font-family: var(--mono);
  font-size: 11px; letter-spacing: 0.06em; color: var(--ink-3); font-style: normal;
}

.plain {
  background: var(--signal-bg); border: 1px solid oklch(0.545 0.196 27 / 0.28);
  padding: 1.1rem 1.2rem; margin: 1.5rem 0; max-width: 72ch;
}
.plain b { font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; display: block; margin-bottom: 0.5rem; color: var(--signal); }
.plain p { margin: 0; max-width: none; }

/* why-16 block */
.why { border: 1px solid var(--ink); background: var(--panel); margin: 2.2rem 0 0; padding: 1.4rem 1.3rem 1.5rem; }
.why h3 { font-size: clamp(1.3rem, 4vw, 1.7rem); margin-bottom: 0.4rem; }
.why > p { font-size: 15.5px; color: var(--ink-2); margin: 0 0 1rem; }
.why__list { padding-left: 1.1rem; margin: 0 0 1.4rem; }
.why__list li { font-size: 15.5px; color: var(--ink-2); margin-bottom: 0.7rem; }
.why__src { font-family: var(--mono); font-size: 11px; color: var(--ink-3); white-space: nowrap; }
.why__gap { border: 1px solid var(--signal); background: var(--signal-bg); padding: 1rem 1.1rem; }
.why__gap b { display: block; font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--signal); margin-bottom: 0.5rem; }
.why__gap p { margin: 0 0 0.7rem; font-size: 15.5px; max-width: none; }
.why__searched { font-family: var(--mono); font-size: 11.5px; color: var(--ink-2); margin: 0 !important; line-height: 1.6; }
.why__ask { font-size: 14.5px; color: var(--ink-2); margin: 1.1rem 0 0; }

/* term counts in the executive-order block. A zero is the point of the
   grid, so it gets the muted treatment and the non-zero counts carry the
   signal colour — the reverse of the usual "highlight the big number". */
.terms { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px; background: var(--rule); border: 1px solid var(--rule); margin: 0 0 1rem; }
.term { background: var(--panel); padding: 0.8rem 0.9rem; }
.term__n { display: block; font-family: var(--mono); font-size: 1.5rem; font-weight: 700; line-height: 1; color: var(--signal); }
.term__t { display: block; font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; color: var(--ink-2); margin-top: 0.4rem; }
.term--zero .term__n { color: var(--ink-3); }

.caveat {
  font-size: 14.5px; color: var(--ink-2); border-top: 1px solid var(--rule);
  padding-top: 0.9rem; margin-top: 1.4rem; max-width: 76ch;
}

/* ---------- charts ---------- */
.chart { margin: 2.2rem 0 0; }
.chart__cap { margin: 0 0 1.1rem; }
.chart__idx { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; color: var(--ink-3); display: block; margin-bottom: 0.4rem; }
.chart__cap p { font-size: 15.5px; color: var(--ink-2); margin: 0.4rem 0 0; }
.chart__scroll { overflow-x: auto; overflow-y: hidden; border: 1px solid var(--ink); background: var(--panel); }
.chart__svg { display: block; width: 100%; min-width: 640px; height: auto; }
.chart__svg--map { min-width: 560px; }
.chart__scalenote { font-size: 13.5px; color: var(--ink-3); margin: 0.8rem 0 0; max-width: 76ch; }

.grid { stroke: var(--rule-2); stroke-width: 1; }
.axis { stroke: var(--ink-2); stroke-width: 1; }
.tick { font-family: var(--mono); font-size: 12px; fill: var(--ink-3); }
.axlab { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; fill: var(--ink-3); text-transform: uppercase; }

.data-end{stroke:oklch(0.62 0.02 260);stroke-width:1;opacity:.55}
.data-end-label{fill:oklch(0.50 0.016 260);font-family:var(--mono);font-size:9.5px;letter-spacing:.04em}
.marker-line { stroke: var(--signal); stroke-width: 1.5; stroke-dasharray: 5 4; }
.marker-box { fill: var(--signal); }
.marker-text { font-family: var(--mono); font-size: 12px; font-weight: 700; fill: oklch(0.995 0.003 85); }

.ln { fill: none; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
.ln--beds { stroke: var(--beds); }
.ln--prison { stroke: var(--prison); }
.ln--jail { stroke: var(--jail); stroke-width: 2; stroke-dasharray: 6 4; }
.dot { stroke: var(--panel); stroke-width: 2; }
.dot--beds { fill: var(--beds); } .dot--prison { fill: var(--prison); } .dot--jail { fill: var(--jail); }
.pt { cursor: help; }
.pt:hover .dot, .pt:focus .dot { r: 8; }
.endlab { font-family: var(--mono); font-size: 13px; font-weight: 700; }
.endlab--beds { fill: var(--beds); } .endlab--prison { fill: var(--prison); } .endlab--jail { fill: var(--jail); }

.band-bad { fill: oklch(0.545 0.196 27 / 0.10); }
.band-ok { fill: oklch(0.520 0.115 156 / 0.14); }
.band-lab { font-family: var(--mono); font-size: 12px; }
.band-lab--bad { fill: var(--signal); } .band-lab--ok { fill: var(--ok); }
.limit-line { stroke: var(--signal); stroke-width: 2.5; }
.limit-lab { font-family: var(--mono); font-size: 14px; font-weight: 700; fill: var(--signal); }
.limit-sub { font-family: var(--mono); font-size: 11.5px; fill: var(--ink-2); }
.mark-line { stroke: var(--ink); stroke-width: 1.5; }
.mark-line--soft { stroke: var(--ink-3); stroke-dasharray: 4 3; }
.mark-dot { fill: var(--ink); }
.mark-lab { font-family: var(--mono); font-size: 15px; font-weight: 700; fill: var(--ink); }
.mark-lab--soft{fill:oklch(0.46 0.016 260);font-size:13px}
.mark-sub { font-family: var(--mono); font-size: 11px; fill: var(--ink-2); }

.legend { list-style: none; display: flex; flex-wrap: wrap; gap: 0.4rem 1.3rem; padding: 0.9rem 0 0; margin: 0; font-family: var(--mono); font-size: 12.5px; color: var(--ink-2); }
.legend li { display: flex; align-items: center; gap: 0.45rem; }
.legend b { color: var(--ink); }
.sw { width: 15px; height: 3px; display: inline-block; }
.sw--beds { background: var(--beds); } .sw--prison { background: var(--prison); } .sw--jail { background: var(--jail); }
.sw--st { width: 13px; height: 13px; border: 1px solid var(--ink-2); }
.sw--both { background: var(--ok); } .sw--sud { background: oklch(0.520 0.115 156 / 0.45); }
.sw--smi { background: var(--beds); } .sw--pending { background: var(--pend); } .sw--none { background: var(--panel-2); }

.st rect { fill: var(--panel-2); stroke: var(--rule); stroke-width: 1; }
.st__code { font-family: var(--mono); font-size: 19px; font-weight: 700; fill: var(--ink); }
.st--both rect { fill: var(--ok); } .st--both .st__code { fill: oklch(0.995 0.003 85); }
.st--sud rect { fill: oklch(0.520 0.115 156 / 0.42); }
.st--smi rect { fill: var(--beds); } .st--smi .st__code { fill: oklch(0.995 0.003 85); }
.st--pending rect { fill: var(--pend); }
.st { cursor: help; }
.st:hover rect, .st:focus rect { stroke: var(--signal); stroke-width: 3; }

/* ---------- timeline ---------- */
.tl { list-style: none; padding: 0; margin: 2rem 0 0; border-top: 1px solid var(--rule); }
.tl li { display: grid; grid-template-columns: 92px 1fr; gap: 1.2rem; padding: 1.2rem 0; border-bottom: 1px solid var(--rule-2); }
.tl__yr { font-family: var(--mono); font-size: 1.32rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
.tl__law { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.07em; color: var(--ink-3); display: block; margin-top: 0.2rem; }
.tl__b h3 { margin-bottom: 0.35rem; }
.tl__b p { margin: 0; font-size: 15.5px; color: var(--ink-2); }
.tl__src { font-family: var(--mono); font-size: 11px; color: var(--ink-3); margin-top: 0.45rem; display: inline-block; }
.tl li.is-key .tl__yr { color: var(--signal); }
.tl li.is-key { background: var(--signal-bg); margin: 0 calc(var(--gut) * -0.5); padding-left: calc(var(--gut) * 0.5); padding-right: calc(var(--gut) * 0.5); }
@media (max-width: 620px) { .tl li { grid-template-columns: 1fr; gap: 0.4rem; } }

/* ---------- consequence cards ---------- */
.cons { display: grid; grid-template-columns: repeat(auto-fit, minmax(268px, 1fr)); gap: 1px; background: var(--rule); border: 1px solid var(--rule); margin: 2rem 0 0; }
.cons > div { background: var(--panel); padding: 1.3rem 1.2rem; }
.cons__stat { font-family: var(--mono); font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1; color: var(--signal); }
.cons__kind { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); margin: 0.55rem 0 0.5rem; }
.cons p { font-size: 14.8px; margin: 0; color: var(--ink-2); max-width: none; }
.cons__src { font-family: var(--mono); font-size: 11px; color: var(--ink-3); margin-top: 0.7rem; display: inline-block; }

/* ---------- bills ---------- */
.bills { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.2rem; margin: 2rem 0 0; }
.bill { border: 1px solid var(--ink); background: var(--panel); }
.bill__hd { border-bottom: 1px solid var(--ink); background: var(--panel-2); padding: 0.65rem 1rem; display: flex; align-items: baseline; gap: 0.6rem; font-family: var(--mono); }
.bill__no { font-size: 15px; font-weight: 700; }
.bill__ap { margin-left: auto; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid var(--signal); color: var(--signal); padding: 0.15rem 0.45rem; }
.bill__bd { padding: 1.1rem 1rem 1.2rem; }
.bill__bd h3 { margin-bottom: 0.5rem; }
.bill__meta { font-family: var(--mono); font-size: 11.5px; color: var(--ink-2); margin: 0 0 0.8rem; line-height: 1.7; }
.bill__bd p { font-size: 15px; color: var(--ink-2); margin: 0 0 0.9rem; max-width: none; }
.bill__status { font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-3); display: block; margin-bottom: 0.9rem; }
.bill__links { display: flex; gap: 0.7rem; flex-wrap: wrap; font-family: var(--mono); font-size: 12px; }
.bill__links a { border: 1px solid var(--rule); padding: 0.3rem 0.6rem; text-decoration: none; }
.bill__links a:hover { border-color: var(--signal); }

/* ---------- two-column argument ---------- */
.args { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.4rem; margin: 2rem 0 0; }
.arg { border: 1px solid var(--rule); background: var(--panel); padding: 1.3rem 1.2rem; }
.arg ul { padding-left: 1.1rem; margin: 0.9rem 0 0; }
.arg li { font-size: 15px; color: var(--ink-2); margin-bottom: 0.75rem; }
.arg__src { font-family: var(--mono); font-size: 11px; color: var(--ink-3); margin-top: 1rem; display: block; }

/* ---------- contact ---------- */
.intents { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1.8rem 0 0; }
.intent { border: 1px solid var(--ink); background: var(--panel); padding: 1.1rem 1.1rem 1.2rem; display: flex; flex-direction: column; }
.intent h3 { font-size: 1rem; }
.intent p { font-size: 14.5px; color: var(--ink-2); margin: 0 0 1rem; flex: 1; max-width: none; }
.btn {
  display: inline-block; font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em;
  text-transform: uppercase; text-decoration: none; padding: 0.6rem 0.9rem;
  border: 1px solid var(--ink); background: var(--ink); color: var(--panel); text-align: center;
}
.btn:hover { background: var(--signal); border-color: var(--signal); color: oklch(0.995 0.003 85); }
.btn--ghost { background: transparent; color: var(--ink); }
.btn--ghost:hover { color: oklch(0.995 0.003 85); }

.fund { width: 100%; border-collapse: collapse; margin: 1.6rem 0 0; font-size: 14.5px; }
.fund th, .fund td { text-align: left; vertical-align: top; padding: 0.85rem 0.8rem; border-bottom: 1px solid var(--rule-2); }
.fund th { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); border-bottom-color: var(--ink-2); }
.fund td:first-child { font-family: var(--mono); font-weight: 700; font-size: 13.5px; white-space: nowrap; }
.fund__wrap { overflow-x: auto; }
.fund__wrap table { min-width: 640px; }

/* ---------- sources ---------- */
.srcs { list-style: none; padding: 0; margin: 1.8rem 0 0; border-top: 1px solid var(--rule); }
.srcs li { padding: 0.85rem 0; border-bottom: 1px solid var(--rule-2); display: grid; grid-template-columns: 96px 1fr; gap: 1rem; align-items: baseline; }
.srcs__kind { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.srcs__kind.is-primary { color: var(--signal); }
.srcs__n { font-size: 15px; }
.srcs__n em { display: block; font-style: normal; color: var(--ink-3); font-size: 13.5px; margin-top: 0.2rem; }
@media (max-width: 620px) { .srcs li { grid-template-columns: 1fr; gap: 0.25rem; } }

/* ---------- footer ---------- */
/* Bottom padding clears the fixed "Ask these sources" button so it can never
   sit on top of the last line of the footer. */
footer { border-top: 1px solid var(--ink); background: var(--panel); padding: 2.2rem 0 5.5rem; margin-top: 2rem; }
footer p { font-size: 14px; color: var(--ink-2); }
.foot__meta { font-family: var(--mono); font-size: 11px; color: var(--ink-3); letter-spacing: 0.05em; }

/* ---------- assistant ---------- */
.ask-fab {
  position: fixed; right: 18px; bottom: 18px; z-index: 60;
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
  border: 1px solid var(--ink); background: var(--ink); color: var(--panel);
  padding: 0.8rem 1.05rem; cursor: pointer;
  box-shadow: 3px 3px 0 oklch(0.235 0.014 260 / 0.22);
  display: inline-flex; align-items: center; gap: 0.5rem;
}
.ask-fab:hover { background: var(--signal); border-color: var(--signal); }
.ask-fab[hidden] { display: none; }

.ask {
  position: fixed; right: 0; bottom: 0; z-index: 61;
  width: min(430px, 100vw); height: min(640px, 100dvh);
  display: flex; flex-direction: column;
  background: var(--panel); border: 1px solid var(--ink);
  box-shadow: -3px -3px 0 oklch(0.235 0.014 260 / 0.14);
}
.ask[hidden] { display: none; }
@media (max-width: 520px) { .ask { width: 100vw; height: 100dvh; } }

.ask__hd { display: flex; align-items: center; gap: 0.55rem; padding: 0.7rem 0.85rem; border-bottom: 1px solid var(--ink); background: var(--panel-2); font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
.ask__hd b { font-weight: 700; }
.ask__x { margin-left: auto; background: none; border: 1px solid var(--rule); cursor: pointer; font-family: var(--mono); font-size: 14px; line-height: 1; padding: 0.25rem 0.5rem; color: var(--ink); }
.ask__x:hover { border-color: var(--signal); color: var(--signal); }

.ask__log { flex: 1; overflow-y: auto; padding: 0.9rem; display: flex; flex-direction: column; gap: 0.85rem; }
.msg { max-width: 92%; font-size: 14.8px; line-height: 1.55; }
.msg--u { align-self: flex-end; background: var(--ink); color: var(--panel); padding: 0.6rem 0.8rem; }
.msg--a { align-self: flex-start; border-left: 2px solid var(--signal); padding-left: 0.75rem; color: var(--ink); }
.msg--sys { align-self: center; font-family: var(--mono); font-size: 11.5px; color: var(--ink-3); text-align: center; max-width: 100%; }
.msg--a p { margin: 0 0 0.6rem; max-width: none; }
.msg--a p:last-child { margin-bottom: 0; }

.ask__chips { display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0 0.9rem 0.7rem; }
.chip { font-family: var(--mono); font-size: 11.5px; border: 1px solid var(--rule); background: var(--panel); color: var(--ink-2); padding: 0.35rem 0.55rem; cursor: pointer; text-align: left; }
.chip:hover { border-color: var(--signal); color: var(--signal); }

.ask__form { display: flex; gap: 0.5rem; padding: 0.7rem; border-top: 1px solid var(--rule); align-items: flex-end; }
.ask__in {
  flex: 1; font-family: var(--sans); font-size: 15px; padding: 0.55rem 0.6rem;
  border: 1px solid var(--rule); background: var(--bg); color: var(--ink);
  resize: none; max-height: 110px; min-height: 40px; line-height: 1.4;
}
.ask__in:focus { border-color: var(--ink); outline: none; }
.ask__btn { font-family: var(--mono); font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid var(--ink); background: var(--ink); color: var(--panel); padding: 0.6rem 0.7rem; cursor: pointer; }
.ask__btn:hover:not(:disabled) { background: var(--signal); border-color: var(--signal); }
.ask__btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ask__mic { background: var(--panel); color: var(--ink); }
.ask__mic.is-rec { background: var(--signal); border-color: var(--signal); color: oklch(0.995 0.003 85); animation: pulse 1.3s ease-in-out infinite; }
.ask__mic[hidden] { display: none; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }

.ask__foot { font-family: var(--mono); font-size: 10px; color: var(--ink-3); padding: 0 0.7rem 0.7rem; letter-spacing: 0.04em; line-height: 1.5; }
.ask__foot a { color: var(--ink-3); }

.dots span { display: inline-block; width: 5px; height: 5px; background: var(--ink-3); margin-right: 3px; animation: bob 1.1s ease-in-out infinite; }
.dots span:nth-child(2) { animation-delay: 0.15s; }
.dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes bob { 0%,60%,100% { transform: translateY(0); opacity: 0.35; } 30% { transform: translateY(-4px); opacity: 1; } }

.crisis { border: 1px solid var(--signal); background: var(--signal-bg); padding: 0.7rem 0.8rem; font-size: 13.5px; margin: 0 0.9rem 0.8rem; }
.crisis b { display: block; font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--signal); margin-bottom: 0.3rem; }

.skip { position: absolute; left: -9999px; }
.skip:focus { left: var(--gut); top: 0.5rem; position: fixed; z-index: 100; background: var(--ink); color: var(--panel); padding: 0.6rem 0.9rem; font-family: var(--mono); font-size: 12px; }

@media print {
  .ask, .ask-fab, .mast { display: none !important; }
  body { background: white; }
  .chart__scroll { break-inside: avoid; }
}

/* --- support-your-bill block --- */
.act{margin-top:2.6rem;border-top:1px solid var(--rule,oklch(0.88 0.008 260));padding-top:1.8rem}
.act h3{font-family:var(--mono);font-size:1.15rem;letter-spacing:-.01em;margin-bottom:.6rem}
.act__lede{max-width:62ch;margin-bottom:.7rem}
.act__note{max-width:62ch;font-size:.9rem;color:oklch(0.46 0.016 260);margin-bottom:1.4rem}
.act__sub{font-family:var(--mono);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;
  color:oklch(0.50 0.016 260);margin:2rem 0 .9rem}
.drafts{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(290px,1fr))}
.draft{border:1px solid var(--rule,oklch(0.88 0.008 260));background:oklch(0.995 0.003 85);padding:1rem}
.draft h4{font-family:var(--mono);font-size:.92rem;margin-bottom:.7rem;line-height:1.35}
.draft__subj{font-size:.82rem;margin-bottom:.6rem;line-height:1.45}
.draft__subj span{display:block;font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;
  text-transform:uppercase;color:oklch(0.55 0.014 260);margin-bottom:.15rem}
.draft__body{white-space:pre-wrap;font-family:var(--mono);font-size:.76rem;line-height:1.6;
  max-height:14rem;overflow-y:auto;background:oklch(0.972 0.005 85);padding:.7rem;
  border:1px solid oklch(0.91 0.007 260);margin-bottom:.8rem}
.btn--copy{font-family:var(--mono);font-size:.75rem;letter-spacing:.06em;padding:.5rem .8rem;
  border:1px solid oklch(0.30 0.014 260);background:oklch(0.235 0.014 260);color:oklch(0.98 0.004 85);
  cursor:pointer;width:100%}
.btn--copy:hover{background:oklch(0.32 0.016 260)}
.btn--copy.is-done{background:oklch(0.42 0.10 150);border-color:oklch(0.42 0.10 150)}
.targets{display:grid;gap:.9rem;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));list-style:none;padding:0}
.target{border:1px solid var(--rule,oklch(0.88 0.008 260));padding:.95rem;background:oklch(0.995 0.003 85)}
.target__who{font-family:var(--mono);font-size:.9rem;font-weight:700;margin-bottom:.15rem}
.target__role{font-size:.78rem;color:oklch(0.50 0.016 260);margin-bottom:.55rem}
.target__why{font-size:.85rem;line-height:1.5;margin-bottom:.55rem}
.target__how{font-size:.78rem;color:oklch(0.46 0.016 260);margin-bottom:.7rem;line-height:1.45}
.target__link{font-family:var(--mono);font-size:.78rem}
@media (max-width:640px){.draft__bodymax-height:11rem}

/* --- top-of-page call to action --- */
.cta{margin:2.2rem 0 0;padding:1.3rem 1.4rem;border:1px solid oklch(0.235 0.014 260);
  background:oklch(0.995 0.003 85)}
.cta__kicker{font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;
  color:oklch(0.50 0.016 260);margin-bottom:.85rem}
.cta__row{display:flex;flex-wrap:wrap;gap:.6rem;margin-bottom:1.2rem}
.cta__btn{font-family:var(--mono);font-size:.8rem;letter-spacing:.02em;padding:.6rem .9rem;
  border:1px solid oklch(0.235 0.014 260);text-decoration:none;color:oklch(0.235 0.014 260);
  background:transparent}
.cta__btn:hover{background:oklch(0.94 0.006 260)}
.cta__btn--primary{background:oklch(0.235 0.014 260);color:oklch(0.98 0.004 85)}
.cta__btn--primary:hover{background:oklch(0.32 0.016 260)}
.cta__ask{font-size:.86rem;color:oklch(0.44 0.016 260);margin-bottom:.6rem}
.cta__qs{display:flex;flex-wrap:wrap;gap:.45rem}
.cta__q{font-family:var(--mono);font-size:.75rem;padding:.42rem .7rem;cursor:pointer;
  border:1px dashed oklch(0.62 0.02 260);background:transparent;color:oklch(0.35 0.016 260)}
.cta__q:hover{border-style:solid;background:oklch(0.94 0.006 260)}

/* --- federal levers --- */
.levers{display:grid;gap:.9rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  list-style:none;padding:0;margin-top:1.4rem}
.lever{border:1px solid var(--rule,oklch(0.88 0.008 260));padding:1rem;background:oklch(0.995 0.003 85)}
.lever__body{font-family:var(--mono);font-size:.88rem;font-weight:700;line-height:1.35;margin-bottom:.5rem}
.lever__power{font-size:.85rem;line-height:1.5;margin-bottom:.6rem}
.lever__ask{font-size:.82rem;line-height:1.5;margin-bottom:.7rem;color:oklch(0.40 0.016 260)}
.lever__ask span{display:block;font-family:var(--mono);font-size:.66rem;letter-spacing:.1em;
  text-transform:uppercase;color:oklch(0.55 0.014 260);margin-bottom:.15rem}
.lever__link{font-family:var(--mono);font-size:.78rem}
@media (max-width:640px){.cta__row{flex-direction:column}.cta__btn{text-align:center}}
`;
