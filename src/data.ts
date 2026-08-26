/**
 * VERIFIED DATA LAYER — 16bedlimit.com
 *
 * GROUND RULE: every number in this file carries `source` (a live URL) and
 * `retrieved` (ISO date it was fetched). Nothing is estimated, interpolated,
 * or remembered. If a figure has no primary/secondary source it does not
 * appear on the site.
 *
 * All entries below were fetched and cross-checked on 2026-08-26.
 */

export const RETRIEVED = '2026-08-26';

export interface Sourced<T> {
  value: T;
  label: string;
  source: string;
  sourceName: string;
  retrieved: string;
  note?: string;
}

/* ------------------------------------------------------------------ *
 * 1. THE STATUTE
 * ------------------------------------------------------------------ */

export const STATUTE = {
  definitionText:
    'a hospital, nursing facility, or other institution of more than 16 beds, that is primarily engaged in providing diagnosis, treatment, or care of persons with mental diseases, including medical attention, nursing care, and related services',
  definitionCite: '42 U.S.C. §1396d(i) — Social Security Act §1905(i)',
  definitionSource: 'https://www.ssa.gov/OP_Home/ssact/title19/1905.htm',

  exclusionText:
    'any such payments with respect to care or services for any individual who has not attained 65 years of age and who is a patient in an institution for mental diseases',
  // NOTE ON CITATION: the exclusion lives in the concluding ("flush") language
  // of SSA §1905(a), after the enumerated list of covered services. Because
  // Congress keeps appending services to that list, the paragraph number the
  // flush text follows has drifted over time — current law runs through
  // paragraph (32). CRS IF10222 (Feb 2025) still cites "§1905(a)(30)(B)".
  // We cite the stable US Code locator instead.
  exclusionCite: '42 U.S.C. §1396d(a), concluding paragraph, clause (B)',
  exclusionSource:
    'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section1396d&num=0&edition=prelim',
  citationCaveat:
    'The exclusion sits in the flush language after the §1905(a) service list. That list now runs to paragraph (32), so older citations such as §1905(a)(30)(B) reflect earlier numbering.',
  retrieved: RETRIEVED,
} as const;

/* ------------------------------------------------------------------ *
 * 2. TIMELINE — how the rule got here
 * ------------------------------------------------------------------ */

export interface TimelineEntry {
  year: number;
  law: string;
  title: string;
  what: string;
  source: string;
  sourceName: string;
}

export const TIMELINE: TimelineEntry[] = [
  {
    year: 1854,
    law: 'Presidential veto',
    title: 'Pierce vetoes the Bill for the Benefit of the Indigent Insane',
    what: 'President Franklin Pierce vetoes federal land-grant funding for public mental institutions, reaffirming that paying for psychiatric care is a state responsibility. That premise is the ancestor of the IMD exclusion.',
    source: 'https://manhattan.institute/article/medicaids-imd-exclusion-the-case-for-repeal',
    sourceName: 'Manhattan Institute',
  },
  {
    year: 1965,
    law: 'P.L. 89-97',
    title: 'Medicaid is created — with the exclusion built in',
    what: 'The Social Security Amendments of 1965 establish Medicaid and, from day one, bar federal matching funds for adults in institutions for mental diseases. The stated intent was to stop states shifting the cost of their asylums onto the federal government. An exception for people 65 and older is included from the start.',
    source: 'https://www.congress.gov/crs-product/IF10222',
    sourceName: 'CRS IF10222',
  },
  {
    year: 1972,
    law: 'P.L. 92-603',
    title: '"Psych under 21" carve-out',
    what: 'Congress creates an optional benefit letting states cover inpatient psychiatric services for people under 21. Because an EPSDT screen can find the care medically necessary, every state now covers it.',
    source: 'https://www.congress.gov/crs-product/IF10222',
    sourceName: 'CRS IF10222',
  },
  {
    year: 1988,
    law: 'P.L. 100-360',
    title: 'The number 16 enters the statute',
    what: 'The Medicare Catastrophic Coverage Act writes the IMD definition into law and adds the piece that had not been there before: facilities of 16 beds or fewer are exempt. Congress meant to favor small settings over large institutions. The number has not moved since.',
    source: 'https://www.congress.gov/crs-product/IF10222',
    sourceName: 'CRS IF10222',
  },
  {
    year: 2015,
    law: 'CMS guidance',
    title: 'Section 1115 waivers open for addiction treatment',
    what: 'CMS tells states it will approve §1115 demonstration waivers covering short-term IMD stays for substance use disorder treatment. Updated November 2017.',
    source: 'https://www.congress.gov/crs-product/IF10222',
    sourceName: 'CRS IF10222',
  },
  {
    year: 2016,
    law: '42 CFR managed care rule',
    title: 'The 15-day managed-care workaround',
    what: 'CMS regulation lets states pay managed care plans for enrollees aged 21-64 in an IMD as an "in lieu of" service, capped at 15 days in the payment month. The SUPPORT Act later writes this into statute.',
    source:
      'https://www.macpac.gov/subtopic/payment-for-services-in-institutions-for-mental-diseases-imds/',
    sourceName: 'MACPAC',
  },
  {
    year: 2018,
    law: 'SMD 18-011 (per P.L. 114-255 §12003)',
    title: 'Waivers extended to serious mental illness',
    what: 'Acting on a mandate in the 21st Century Cures Act, CMS issues guidance letting states seek §1115 waivers for short-term IMD stays for adults with serious mental illness and children with serious emotional disturbance.',
    source: 'https://www.medicaid.gov/federal-policy-guidance/downloads/smd19003.pdf',
    sourceName: 'CMS',
  },
  {
    year: 2018,
    law: 'P.L. 115-271 (SUPPORT Act)',
    title: 'A 30-day state plan option, and a fix for pregnant patients',
    what: '§5052 adds a state plan option under SSA §1915(l) covering adults 21-64 with a substance use disorder in an eligible IMD for up to 30 days in a 12-month period. §1012 stops states denying federal match for non-IMD services delivered to pregnant and postpartum patients receiving SUD care in an IMD. §1013 codifies the 15-day managed care rule.',
    source: 'https://www.congress.gov/crs-product/IF10222',
    sourceName: 'CRS IF10222',
  },
  {
    year: 2025,
    law: 'H.R. 5462 / H.R. 6727',
    title: 'Two live bills, two different answers',
    what: 'The Michelle Alyssa Go Act would raise the threshold from 16 beds to 36. The Repealing the IMD Exclusion Act would strike the exclusion outright. Both are in committee.',
    source: 'https://www.congress.gov/crs-product/IF10222',
    sourceName: 'CRS IF10222',
  },
];

/* ------------------------------------------------------------------ *
 * 2b. WHY SIXTEEN?
 *
 * This is the single most common question about the rule, so it gets a
 * first-class answer — including the part of the answer that is an absence.
 * Checked 2026-08-26 against CRS IF10222, MACPAC, the Manhattan Institute
 * (2021 and 2025), the Legal Action Center overview, the APA bed-crisis
 * report, NAMD, and Mental Health America. None of them gives a rationale
 * for the specific figure. That is a bounded claim about those sources, not
 * a claim that no rationale exists anywhere in the legislative record.
 * ------------------------------------------------------------------ */

export const WHY_SIXTEEN = {
  question: 'Why 16?',
  documented: [
    {
      claim:
        'The ≤16-bed exception was added by the Medicare Catastrophic Coverage Act of 1988 (P.L. 100-360), which wrote the IMD definition into statute.',
      source: 'https://www.congress.gov/crs-product/IF10222',
      sourceName: 'CRS IF10222',
    },
    {
      claim:
        'It was layered onto a definition that already existed in regulation. The 1988 statute followed the regulatory definition, adding the small-facility exception to it.',
      source: 'https://www.congress.gov/crs-product/IF10222',
      sourceName: 'CRS IF10222',
    },
    {
      claim:
        'The stated intent was to favor smaller settings over large institutions, which indicates Congress supported the use of smaller facilities.',
      source: 'https://www.congress.gov/crs-product/IF10222',
      sourceName: 'CRS IF10222',
    },
    {
      claim: 'The regulations governing the IMD exclusion have not been updated since 1988.',
      source: 'https://www.lac.org/assets/files/IMD_exclusion_fact_sheet.pdf',
      sourceName: 'Legal Action Center',
    },
  ],
  notDocumented:
    'None of the standard references explains why the number is 16 rather than 20, 30, or 50. There is no published cost model, bed-supply study, or clinical standard behind the figure in the sources checked here. It has not moved in the 38 years since, while the average psychiatric hospital has settled at 108 beds.',
  searched:
    'CRS IF10222; MACPAC; Manhattan Institute (2021 and 2025); Legal Action Center; American Psychiatric Association; National Association of Medicaid Directors; Mental Health America.',
  retrieved: RETRIEVED,
};

/* ------------------------------------------------------------------ *
 * 3. PSYCHIATRIC BED COLLAPSE
 * ------------------------------------------------------------------ */

export interface BedPoint {
  year: number;
  beds?: number;
  perCapita?: number;
  source: string;
  sourceName: string;
  note?: string;
}

/**
 * Only census/survey years that we could source directly. No interpolation
 * between points — the chart draws the measured points and says so.
 */
export const BED_SERIES: BedPoint[] = [
  {
    year: 1955,
    beds: 558922,
    perCapita: 340,
    source:
      'https://www.psychiatry.org/getmedia/81f685f1-036e-4311-8dfc-e13ac425380f/APA-Psychiatric-Bed-Crisis-Report-Full.pdf',
    sourceName: 'APA Psychiatric Bed Crisis Report (citing Bockoven 1972)',
    note: 'Peak residents in state mental hospitals. Per-capita figure from Treatment Advocacy Center, "No Room at the Inn" (2011).',
  },
  {
    year: 2005,
    perCapita: 17,
    source: 'https://issues.org/better-data-for-better-mental-health-services/',
    sourceName: 'Issues in Science and Technology, citing TAC "No Room at the Inn" (2011)',
    note: 'Public psychiatric beds per 100,000 population.',
  },
  {
    year: 2010,
    beds: 43318,
    source: 'https://www.tac.org/wp-content/uploads/2023/11/Going-Going-Gone.pdf',
    sourceName: 'Treatment Advocacy Center, "Going, Going, Gone" (2016)',
  },
  {
    year: 2016,
    beds: 37679,
    perCapita: 11.7,
    source:
      'https://www.tac.org/reports_publications/going-going-gone-trends-and-consequences-of-eliminating-state-psychiatric-beds/',
    sourceName: 'Treatment Advocacy Center, "Going, Going, Gone" (2016)',
    note: 'Staffed beds remaining in state hospitals, first half of 2016.',
  },
  {
    year: 2023,
    beds: 36150,
    perCapita: 10.8,
    source: 'https://www.tac.org/reports_publications/state-psychiatric-hospital-beds/',
    sourceName: 'Treatment Advocacy Center, "Prevention Over Punishment" (2024)',
    note: 'Historic low. A majority of these beds are occupied by forensic patients.',
  },
];

export const BED_HEADLINE = {
  peakYear: 1955,
  peakBeds: 558922,
  latestYear: 2023,
  latestBeds: 36150,
  // computed, not asserted — shown with its own arithmetic
  get pctDecline() {
    return (1 - this.latestBeds / this.peakBeds) * 100;
  },
  publicBedDeclineClaim: 'over 97% since its peak, accounting for population change',
  publicBedDeclineSource:
    'https://manhattan.institute/article/us-psychiatric-hospitals-under-medicaids-institutions-for-mental-diseases-exclusion',
  publicBedDeclineSourceName: 'Manhattan Institute (2025)',
  retrieved: RETRIEVED,
};

/* ------------------------------------------------------------------ *
 * 3b. INCARCERATION — the other line on the hero chart
 *
 * HONESTY NOTE, rendered on the page: the pre-1980 figures count
 * "sentenced prisoners in State and Federal institutions"; from 1990
 * onward BJS reports "prisoners under jurisdiction of State or Federal
 * correctional authorities". The definitions are not identical. Jail
 * counts are a separate series and are NOT added into the prison line.
 * ------------------------------------------------------------------ */

export interface PrisonPoint {
  year: number;
  prisoners: number;
  basis: 'sentenced' | 'jurisdiction';
  source: string;
  sourceName: string;
}

export const PRISON_SERIES: PrisonPoint[] = [
  {
    year: 1955,
    prisoners: 185780,
    basis: 'sentenced',
    source: 'https://bjs.ojp.gov/content/pub/pdf/p2581.pdf',
    sourceName: 'BJS, Prisoners 1925-81, Table 1',
  },
  {
    year: 1965,
    prisoners: 210895,
    basis: 'sentenced',
    source: 'https://bjs.ojp.gov/content/pub/pdf/p2581.pdf',
    sourceName: 'BJS, Prisoners 1925-81, Table 1',
  },
  {
    year: 1980,
    prisoners: 315974,
    basis: 'sentenced',
    source: 'https://bjs.ojp.gov/content/pub/pdf/p2581.pdf',
    sourceName: 'BJS, Prisoners 1925-81, Table 1',
  },
  {
    year: 1990,
    prisoners: 773919,
    basis: 'jurisdiction',
    source: 'https://bjs.ojp.gov/content/pub/ascii/p98.txt',
    sourceName: 'BJS, Prisoners in 1998, Table 1',
  },
  {
    year: 2000,
    prisoners: 1381892,
    basis: 'jurisdiction',
    source: 'https://bjs.ojp.gov/content/pub/ascii/p00.txt',
    sourceName: 'BJS, Prisoners in 2000',
  },
  {
    year: 2010,
    prisoners: 1612395,
    basis: 'jurisdiction',
    source: 'https://bjs.ojp.gov/library/publications/prisoners-2010-revised',
    sourceName: 'BJS, Prisoners in 2010 (Revised)',
  },
  {
    year: 2023,
    prisoners: 1254200,
    basis: 'jurisdiction',
    source:
      'https://bjs.ojp.gov/library/publications/prisons-report-series-preliminary-data-release-2023',
    sourceName: 'BJS, Prisons Report Series: Preliminary Data Release, 2023',
  },
];

export interface JailPoint {
  year: number;
  jail: number;
  source: string;
  sourceName: string;
}

export const JAIL_SERIES: JailPoint[] = [
  {
    year: 1990,
    jail: 405320,
    source: 'https://bjs.ojp.gov/content/pub/ascii/p98.txt',
    sourceName: 'BJS, Prisoners in 1998, Table 1',
  },
  {
    year: 1998,
    jail: 592462,
    source: 'https://bjs.ojp.gov/content/pub/ascii/p98.txt',
    sourceName: 'BJS, Prisoners in 1998, Table 1',
  },
  {
    year: 2013,
    jail: 731200,
    source: 'https://bjs.ojp.gov/library/publications/jail-inmates-2023-statistical-tables',
    sourceName: 'BJS, Jail Inmates in 2023',
  },
  {
    year: 2023,
    jail: 664200,
    source: 'https://bjs.ojp.gov/library/publications/jail-inmates-2023-statistical-tables',
    sourceName: 'BJS, Jail Inmates in 2023',
  },
  {
    year: 2024,
    jail: 657500,
    source:
      'https://bjs.ojp.gov/library/publications/jails-report-series-2024-preliminary-data-release',
    sourceName: 'BJS, Jails Report Series: 2024 Preliminary Data Release (midyear 2024)',
  },
];

/**
 * The last year each series has a published national figure, checked against
 * each agency's own publication list on 2026-08-26 rather than assumed.
 *
 * The chart's x-axis runs to the present year so the reader can see how current
 * the evidence is. These three values are what stops that from implying data we
 * do not have: the lines stop where the data stops, and the chart says so.
 *
 * Re-checked 2026-08-26:
 *  - beds   : Treatment Advocacy Center's state-hospital census, 2023 edition.
 *             NRI's "Use of State Psychiatric Hospitals, 2025" is newer but
 *             reports shortage percentages, not a comparable national bed
 *             count, so it cannot extend this series.
 *  - prison : BJS "Prisons Preliminary Data Release" series list contains only
 *             2023. There is no 2024 national prison figure to plot.
 *  - jail   : BJS published a 2024 preliminary release; that point is above.
 */
export const DATA_THROUGH = {
  beds: 2023,
  prison: 2023,
  jail: 2024,
  checked: '2026-08-26',
} as const;

export const INCARCERATION_NOTE =
  'Two BJS measures are stitched here. Figures through 1980 count sentenced prisoners in state and federal institutions; from 1990 they count prisoners under the jurisdiction of state and federal authorities. Local jails are a separate line and are not added into the prison figure.';

/**
 * The causation guardrail. This sentence renders directly under the hero
 * chart. The site does not claim the exclusion caused mass incarceration.
 */
export const HERO_CAVEAT =
  'These two lines are not a causal claim. Incarceration in the United States rose for many reasons — sentencing law, drug policy, and policing changed enormously over the same period. What the chart shows is that the country reduced its psychiatric hospital capacity to almost nothing and expanded its correctional capacity enormously, and that a federal funding rule adopted in 1965 made the first of those two things cheaper for states to do.';

/* ------------------------------------------------------------------ *
 * 4. HOSPITAL SIZE vs THE 16-BED LINE
 *
 * We do NOT have the full bed-size distribution, so we do NOT draw a
 * histogram. We draw the measured landmarks on a number line. Anything
 * else would be invented.
 * ------------------------------------------------------------------ */

export const HOSPITAL_SIZE = {
  statutoryLimit: 16,
  mean: 108,
  p95: 305,
  shareAtOrUnderLimitPct: 8, // reported as "less than 8%"
  shareAtOrUnderLimitQualifier: 'less than',
  hospitalsUnlockedAt108: 332,
  bedsUnlockedAt108: 20000,
  bedsUnlockedQualifier: 'more than',
  source:
    'https://manhattan.institute/article/us-psychiatric-hospitals-under-medicaids-institutions-for-mental-diseases-exclusion',
  sourceName:
    'Manhattan Institute, "U.S. Psychiatric Hospitals Under Medicaid\'s IMD Exclusion" (Aug 2025)',
  retrieved: RETRIEVED,
  findings: [
    'The average U.S. psychiatric hospital has 108 beds — smaller than the average general hospital.',
    '95% of psychiatric hospitals have fewer than 305 beds.',
    'Less than 8% of psychiatric hospitals have 16 beds or fewer.',
    'Redefining an IMD as a facility with more than 108 beds would make as many as 332 existing hospitals, holding more than 20,000 beds, eligible for Medicaid reimbursement.',
  ],
};

/* ------------------------------------------------------------------ *
 * 5. STATE §1115 WAIVERS
 * Source: CRS IF10222 Table 1, which cites KFF's Medicaid Waiver Tracker
 * as of 2025-01-14.
 * ------------------------------------------------------------------ */

export const WAIVER_AS_OF = '2025-01-14';
export const WAIVER_SOURCE = 'https://www.congress.gov/crs-product/IF10222';
export const WAIVER_SOURCE_NAME =
  'CRS IF10222, Table 1 (source: KFF Medicaid Waiver Tracker, Jan 14 2025)';
export const WAIVER_TRACKER =
  'https://www.kff.org/medicaid/medicaid-waiver-tracker-approved-and-pending-section-1115-waivers-by-state/';

/** All 50 states plus DC. Used to emit an explicit per-state line in the
 *  assistant's corpus, because a comma-joined list of codes is something a
 *  language model reliably gets wrong on membership questions. */
export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

export const SUD_APPROVED = [
  'AK',
  'CA',
  'CO',
  'CT',
  'DC',
  'DE',
  'ID',
  'IL',
  'IN',
  'KS',
  'KY',
  'LA',
  'MA',
  'MD',
  'ME',
  'MI',
  'MN',
  'MO',
  'MT',
  'NC',
  'NE',
  'NH',
  'NJ',
  'NM',
  'NV',
  'NY',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'UT',
  'VA',
  'VT',
  'WA',
  'WI',
  'WV',
];
export const SUD_PENDING = ['AL', 'AZ', 'AR', 'MA', 'WA'];
export const SMI_APPROVED = [
  'AL',
  'CA',
  'CO',
  'DC',
  'ID',
  'IN',
  'KY',
  'MD',
  'MO',
  'NH',
  'NM',
  'OK',
  'UT',
  'VT',
  'WA',
];
export const SMI_PENDING = ['AR', 'MA', 'MT', 'NJ', 'NV', 'NY', 'OR', 'TN', 'WA', 'WI'];

export type WaiverStatus = 'both' | 'sud' | 'smi' | 'pending' | 'none';

export function waiverStatus(code: string): WaiverStatus {
  const sud = SUD_APPROVED.includes(code);
  const smi = SMI_APPROVED.includes(code);
  if (sud && smi) return 'both';
  if (sud) return 'sud';
  if (smi) return 'smi';
  if (SUD_PENDING.includes(code) || SMI_PENDING.includes(code)) return 'pending';
  return 'none';
}

export const WAIVER_LEGEND: Record<WaiverStatus, { label: string; desc: string }> = {
  both: {
    label: 'Both approved',
    desc: 'Approved waivers for BOTH substance use disorder and mental health treatment in IMDs.',
  },
  sud: {
    label: 'Addiction only',
    desc: 'Approved waiver covers substance use disorder treatment only.',
  },
  smi: {
    label: 'Mental health only',
    desc: 'Approved waiver covers mental health treatment only.',
  },
  pending: {
    label: 'Pending',
    desc: 'An application is pending with CMS; no approved IMD waiver yet.',
  },
  none: {
    label: 'No waiver',
    desc: 'No approved or pending §1115 IMD waiver as of the tracker date.',
  },
};

/* ------------------------------------------------------------------ *
 * 6. WHERE PEOPLE GO INSTEAD
 * ------------------------------------------------------------------ */

export interface Consequence {
  stat: string;
  detail: string;
  source: string;
  sourceName: string;
  kind: 'incarceration' | 'homelessness' | 'emergency' | 'forensic';
}

export const CONSEQUENCES: Consequence[] = [
  {
    kind: 'forensic',
    stat: 'About half',
    detail:
      'Of the state hospital beds still in service in 2016, close to half — roughly 5.5 of the 11.7 beds per 100,000 people — were occupied by forensic patients, meaning people charged with or convicted of a crime. By 2023 a majority of state hospital beds were forensic.',
    source:
      'https://www.tac.org/reports_publications/going-going-gone-trends-and-consequences-of-eliminating-state-psychiatric-beds/',
    sourceName: 'Treatment Advocacy Center',
  },
  {
    kind: 'forensic',
    stat: '+76%',
    detail:
      'Forensic patients in state hospitals rose 76% between 1999 and 2014, from about 13,394 on a given day to more than 23,574 across 37 reporting states — while the total number of psychiatric beds kept falling.',
    source:
      'https://manhattan.institute/article/us-psychiatric-hospitals-under-medicaids-institutions-for-mental-diseases-exclusion',
    sourceName: 'Manhattan Institute (2025)',
  },
  {
    kind: 'incarceration',
    stat: '60 days',
    detail:
      'Across 26 states, people in jail wait a median of 60 days for a bed to restore their competency to stand trial. At least 12 states have been sued for failing to provide that care in time.',
    source:
      'https://manhattan.institute/article/us-psychiatric-hospitals-under-medicaids-institutions-for-mental-diseases-exclusion',
    sourceName: 'Manhattan Institute (2025), citing Treatment Advocacy Center',
  },
  {
    kind: 'incarceration',
    stat: '14% / 8%',
    detail:
      'About 14% of people in state prison and 8% in federal prison met the threshold for serious psychological distress in the past 30 days — several times the rate in the general adult population.',
    source:
      'https://bjs.ojp.gov/library/publications/indicators-mental-health-problems-reported-prisoners-survey-prison-inmates',
    sourceName: 'Bureau of Justice Statistics, Survey of Prison Inmates 2016',
  },
  {
    kind: 'incarceration',
    stat: '37% / 44%',
    detail:
      'Thirty-seven percent of people in prison and 44% of people in jail had previously been told by a mental health professional that they had a mental disorder.',
    source: 'https://bjs.ojp.gov/content/pub/pdf/imhprpji1112.pdf',
    sourceName: 'Bureau of Justice Statistics, National Inmate Survey 2011-12',
  },
  {
    kind: 'homelessness',
    stat: '770,000+',
    detail:
      'More than 770,000 people were experiencing homelessness on a single night in January 2024 — the highest count HUD has recorded. Serious mental illness is heavily overrepresented in this population.',
    source:
      'https://www.huduser.gov/portal/datasets/ahar/2024-ahar-part-1-pit-estimates-of-homelessness-in-the-us.html',
    sourceName: 'HUD 2024 Annual Homelessness Assessment Report (Point-in-Time count)',
  },
  {
    kind: 'emergency',
    stat: '3×',
    detail:
      'Patients in psychiatric crisis wait up to three times as long as other patients to move from an emergency department to an inpatient bed. In San Francisco, 87% of people with 18 or more ED visits a year had a mental illness or substance use disorder.',
    source:
      'https://manhattan.institute/article/us-psychiatric-hospitals-under-medicaids-institutions-for-mental-diseases-exclusion',
    sourceName: 'Manhattan Institute (2025)',
  },
];

export const PREVALENCE = [
  {
    stat: '14.6 million',
    detail: 'U.S. adults live with a serious mental illness.',
    source:
      'https://manhattan.institute/article/us-psychiatric-hospitals-under-medicaids-institutions-for-mental-diseases-exclusion',
    sourceName: 'Manhattan Institute (2025)',
  },
  {
    stat: '10%',
    detail: 'Of non-elderly adult Medicaid enrollees have a serious mental illness.',
    source:
      'https://manhattan.institute/article/us-psychiatric-hospitals-under-medicaids-institutions-for-mental-diseases-exclusion',
    sourceName: 'Manhattan Institute (2025)',
  },
  {
    stat: '90% more likely',
    detail:
      'Medicaid enrollees are 90% more likely to have a serious mental illness than privately insured Americans.',
    source:
      'https://manhattan.institute/article/us-psychiatric-hospitals-under-medicaids-institutions-for-mental-diseases-exclusion',
    sourceName: 'Manhattan Institute (2025)',
  },
];

/* ------------------------------------------------------------------ *
 * 7. BILLS IN THE 119th CONGRESS
 * ------------------------------------------------------------------ */

export interface Bill {
  number: string;
  slug: string;
  title: string;
  sponsor: string;
  party: string;
  district: string;
  introduced: string;
  cosponsors?: string;
  approach: string;
  effect: string;
  status: string;
  congressUrl: string;
  priorVersion?: string;
}

export const BILLS: Bill[] = [
  {
    number: 'H.R. 5462',
    slug: 'hr5462',
    title: 'Michelle Alyssa Go Act',
    sponsor: 'Dan Goldman',
    party: 'D',
    district: 'NY-10',
    introduced: '2025-09-18',
    cosponsors: '14 (10 D, 4 R)',
    approach: 'Raise the threshold',
    effect:
      'Redefines an institution for mental diseases to exclude facilities of 36 beds or fewer, if they meet certain standards. Facilities up to 36 beds could bill Medicaid.',
    status: 'Introduced; referred to committee',
    congressUrl: 'https://www.congress.gov/bill/119th-congress/house-bill/5462',
    priorVersion: 'H.R. 8575 (118th Congress)',
  },
  {
    number: 'H.R. 6727',
    slug: 'hr6727',
    title: 'Repealing the IMD Exclusion Act',
    sponsor: 'Ritchie Torres',
    party: 'D',
    district: 'NY-15',
    introduced: '2025-12-15',
    approach: 'Full repeal',
    effect:
      'Strikes the exclusion from Title XIX entirely, so Medicaid could cover services for eligible patients in an IMD regardless of age, where the facility meets required care and staffing standards.',
    status: 'Introduced; referred to committee',
    congressUrl: 'https://www.congress.gov/bill/119th-congress/house-bill/6727',
    priorVersion: 'H.R. 10266 (118th Congress)',
  },
];

/* ------------------------------------------------------------------ *
 * 8. THE ARGUMENT, BOTH WAYS
 * ------------------------------------------------------------------ */

export const ARGUMENTS = {
  repeal: {
    heading: 'The case for changing it',
    points: [
      'The exclusion discourages states from investing in inpatient care, so people who need a hospital end up boarded in emergency departments, on the street, or in jail.',
      'It singles out one category of illness for worse fiscal treatment than any other. In almost every other setting the federal government pays at least half the cost.',
      'The population of public psychiatric hospitals is already a small fraction of what it was before deinstitutionalization, so a return to mass institutionalization is not the realistic risk.',
      "Legal protections that did not exist in 1965 now exist, most importantly the integration mandate of the Supreme Court's Olmstead decision, which requires community placement where appropriate.",
    ],
    source: 'https://manhattan.institute/article/medicaids-imd-exclusion-the-case-for-repeal',
    sourceName: 'Manhattan Institute, "Medicaid\'s IMD Exclusion: The Case for Repeal" (2021)',
  },
  keep: {
    heading: 'The case for keeping it',
    points: [
      'The original purpose was to stop states shifting the cost of their asylums to the federal government. Remove it and the same incentive returns.',
      'The exclusion pushed money toward community-based care rather than large institutions. Critics of repeal argue that is a feature, not a bug.',
      'Congress has repeatedly chosen narrow exceptions — 1972, 1988, 2016, 2018 — rather than repeal, which reflects sustained concern about the cost and the institutional-care precedent.',
      'A full repeal has an unscored federal cost. Every workaround to date has been deliberately time-limited or capped.',
    ],
    source: 'https://www.congress.gov/crs-product/IF10222',
    sourceName: 'CRS IF10222 (legislative history and stated congressional intent)',
  },
};

/* ------------------------------------------------------------------ *
 * 9. CONTACT
 * ------------------------------------------------------------------ */

export const CONTACT_EMAIL = 'hello@16bedlimit.com';

/* ------------------------------------------------------------------ *
 * TELLING CONGRESS YOU SUPPORT THESE BILLS
 *
 * ⚠️ THERE ARE NO EMAIL ADDRESSES HERE, AND THAT IS NOT AN OVERSIGHT.
 *
 * Members of the House do not publish mailboxes. Checked directly on
 * 2026-08-26: goldman.house.gov/contact and ritchietorres.house.gov/contact
 * contain zero mailto: links and zero @house.gov addresses between them
 * (a grep proven to work against a known-good string first). Both route
 * through web forms, and Goldman's posts to /address_authentication, so it
 * asks for a district address before it will take the message.
 *
 * Inventing "rep.goldman@house.gov" would produce a link that looks helpful,
 * silently bounces, and leaves someone believing they were heard. So every
 * route below is the office's own contact page, fetched and confirmed to
 * return 200 on the date shown.
 * ------------------------------------------------------------------ */

export interface ActionTarget {
  id: string;
  who: string;
  role: string;
  /** Why this office, specifically, for these bills. */
  why: string;
  /** The office's own contact page. Verified live, never constructed. */
  url: string;
  /** What the person will actually meet when they click. */
  method: string;
  verified: string;
}

export const BILL_COMMITTEE = {
  name: 'House Energy and Commerce Committee',
  why: 'Both bills were referred here and neither has moved. A bill that is never scheduled never gets a vote, so this is the committee that decides whether either one is considered at all.',
  membersUrl: 'https://energycommerce.house.gov/representatives',
  verified: '2026-08-26',
} as const;

export const ACTION_TARGETS: ActionTarget[] = [
  {
    id: 'goldman',
    who: 'Rep. Dan Goldman',
    role: 'Sponsor, H.R. 5462 — New York’s 10th district',
    why: 'He introduced the bill that would raise the limit from 16 beds to 36. Messages of support to a sponsor are counted by their staff and cited when they ask leadership for a hearing.',
    url: 'https://goldman.house.gov/contact',
    method:
      'Web form. Asks for a district address first — if you live elsewhere, write to your own representative below instead.',
    verified: '2026-08-26',
  },
  {
    id: 'torres',
    who: 'Rep. Ritchie Torres',
    role: 'Sponsor, H.R. 6727 — New York’s 15th district',
    why: 'He introduced the bill that would repeal the exclusion outright rather than move the threshold.',
    url: 'https://ritchietorres.house.gov/contact',
    method: 'Web form.',
    verified: '2026-08-26',
  },
  {
    id: 'yours',
    who: 'Your own representative',
    role: 'Whoever holds your district',
    why: 'This is the message that carries the most weight, because offices weigh their own constituents. If your representative sits on Energy and Commerce, it counts for more still.',
    url: 'https://www.house.gov/representatives/find-your-representative',
    method: 'Enter your address, then use the contact form on your member’s own site.',
    verified: '2026-08-26',
  },
  {
    id: 'senators',
    who: 'Your two senators',
    role: 'Statewide',
    why: 'These particular bills are in the House, so a senator cannot vote on them yet. Writing anyway matters because any repeal or threshold change ultimately needs the Senate, and companion bills start with senators who already hear about it.',
    url: 'https://www.senate.gov/senators/senators-contact.htm',
    method: 'Pick your state, then use each senator’s own form.',
    verified: '2026-08-26',
  },
];

/**
 * Who can actually change this, at each federal level.
 *
 * The distinction matters and the site should not blur it: **only Congress can
 * change the statute.** CMS cannot repeal the exclusion — but CMS approves the
 * section 1115 waivers that let individual states work around it, which is the
 * fastest lever that exists today and the one a state official or provider can
 * actually move. HHS sets the policy direction CMS operates under.
 *
 * Writing to CMS asking them to "repeal the IMD exclusion" is a wasted letter.
 * Writing to CMS about a waiver is not. Each entry below says which is which.
 *
 * Every URL fetched and confirmed on 2026-08-26. medicaid.gov and hhs.gov
 * answer 403 to an automated fetch and 200 in a real browser — a WAF block, not
 * a dead page; both were opened in Chrome to confirm the titles.
 */
export interface FederalLever {
  id: string;
  body: string;
  /** What this office can and cannot do about the exclusion. */
  power: string;
  /** The realistic ask — writing the wrong ask to the right office is wasted. */
  ask: string;
  url: string;
  urlLabel: string;
  verified: string;
}

/**
 * The questions the top-of-page call to action offers.
 *
 * `label` is the short button; `ask` is the full sentence actually sent to the
 * assistant, because a three-word button makes a poor prompt. Each one is
 * answerable from this site's own corpus — they are not general-knowledge
 * questions, and the assistant has no web access to bluff with.
 */
export const SITE_QUESTIONS = [
  {
    label: 'What is the 16-bed rule?',
    ask: 'Explain the Medicaid IMD exclusion and the 16-bed limit in plain language.',
  },
  {
    label: 'Does my state have a waiver?',
    ask: 'Which states have an approved section 1115 waiver for mental health, and which only have one for addiction treatment?',
  },
  {
    label: 'Who is trying to change it?',
    ask: 'Which bills would change the IMD exclusion, who introduced them, and where are they stuck?',
  },
  {
    label: 'How do I show support?',
    ask: 'How can I tell Congress I support H.R. 5462 and H.R. 6727, and who should I write to?',
  },
] as const;

export const FEDERAL_LEVERS: FederalLever[] = [
  {
    id: 'ec-health',
    body: 'House Energy and Commerce — Health Subcommittee',
    power:
      'Holds Medicaid jurisdiction in the House, and is where both H.R. 5462 and H.R. 6727 were referred. Nothing reaches a floor vote without moving through here first.',
    ask: 'Ask them to schedule a hearing or markup on the two bills by number.',
    url: 'https://energycommerce.house.gov/committees/subcommittee/health',
    urlLabel: 'Subcommittee members',
    verified: '2026-08-26',
  },
  {
    id: 'senate-finance',
    body: 'Senate Finance Committee',
    power:
      'Medicaid jurisdiction in the Senate. Any repeal or threshold change ultimately needs a Senate vehicle, and it starts here.',
    ask: 'Ask whether a Senate companion to H.R. 5462 or H.R. 6727 is being drafted.',
    url: 'https://www.finance.senate.gov/about/membership',
    urlLabel: 'Committee membership',
    verified: '2026-08-26',
  },
  {
    id: 'cms',
    body: 'CMS — Centers for Medicare and Medicaid Services',
    power:
      'Cannot repeal the exclusion; it is written into the statute. CMS does approve the section 1115 waivers that let a state get around it, which is why 37 states have an addiction-treatment waiver and only 15 have one for mental health.',
    ask: 'A waiver question, not a repeal question — whether your state has applied, where an application stands, or what a state would need to submit. Asking CMS to repeal the rule is asking the wrong agency.',
    url: 'https://www.medicaid.gov/about-us/contact-us/index.html',
    urlLabel: 'Medicaid.gov contact',
    verified: '2026-08-26',
  },
  {
    id: 'hhs',
    body: 'HHS — Office of Intergovernmental and External Affairs',
    power:
      'CMS sits inside HHS, and this is the office that handles outside stakeholders. It sets the direction CMS applies when it weighs waiver applications.',
    ask: 'Policy direction on behavioral-health waivers, rather than an individual case.',
    url: 'https://www.hhs.gov/about/agencies/iea/index.html',
    urlLabel: 'HHS IEA',
    verified: '2026-08-26',
  },
];

/**
 * Draft messages. Deliberately short, first-person, and free of anything the
 * reader cannot personally vouch for — a form letter that asserts facts the
 * sender has not checked is worth less than three honest sentences.
 */
export const SUPPORT_DRAFTS = [
  {
    id: 'hr5462',
    label: 'Support H.R. 5462 (raise the limit to 36 beds)',
    subject: 'Please support H.R. 5462, the Michelle Alyssa Go Act',
    body: `I am writing to ask you to support H.R. 5462, the Michelle Alyssa Go Act.

Medicaid will not pay for adults aged 21 to 64 who are treated in a psychiatric or addiction facility with more than 16 beds. The average psychiatric hospital in this country has 108 beds, so the rule reaches almost all of them. H.R. 5462 would raise that threshold to 36 beds for facilities that meet the standards in the bill.

The bill is sitting in the Energy and Commerce Committee and has not moved.

[If you have a personal reason for writing — a family member who could not get a bed, or work you do in this system — put it here in your own words. It is the part staff actually read.]

Thank you for your time.`,
  },
  {
    id: 'hr6727',
    label: 'Support H.R. 6727 (repeal the exclusion)',
    subject: 'Please support H.R. 6727, Repealing the IMD Exclusion Act',
    body: `I am writing to ask you to support H.R. 6727, the Repealing the IMD Exclusion Act.

Medicaid currently pays nothing toward care for adults aged 21 to 64 in a psychiatric or addiction facility with more than 16 beds. H.R. 6727 would strike that exclusion from Title XIX, so coverage would follow the patient rather than the size of the building.

The bill is sitting in the Energy and Commerce Committee and has not moved.

[If you have a personal reason for writing, put it here in your own words. It is the part staff actually read.]

Thank you for your time.`,
  },
  {
    id: 'both',
    label: 'Ask my own representative to back both',
    subject: 'The Medicaid 16-bed rule — H.R. 5462 and H.R. 6727',
    body: `I am a constituent, and I am writing about the Medicaid rule that stops federal payment for adults aged 21 to 64 in psychiatric facilities with more than 16 beds.

Two bills would change it. H.R. 5462 would raise the threshold to 36 beds. H.R. 6727 would repeal the exclusion entirely. Both are in the Energy and Commerce Committee and neither has moved.

I would like to know your position on each, and whether you will cosponsor either one.

[Add your own reason for caring about this — it matters more than anything else in this message.]

Thank you.`,
  },
];

export const CONTACT_INTENTS = [
  {
    id: 'records',
    label: 'Send records or documents',
    blurb:
      'Denial letters, state waiver correspondence, hospital transfer records, competency-restoration wait letters. Redact what you need to.',
    subject: 'Records for the 16-bed limit project',
    body: 'What the document is:\n\nWhat state or facility it concerns:\n\nApproximate date:\n\nMay we quote it publicly? (yes / anonymized / background only)\n\n',
  },
  {
    id: 'who',
    label: 'Ask who is working on this',
    blurb:
      'Which organizations, committees, and offices are actively moving on the IMD exclusion, and how to reach them.',
    subject: 'Who is working on the IMD exclusion?',
    body: 'What I am trying to find out:\n\nMy state or district:\n\n',
  },
  {
    id: 'story',
    label: 'Share what happened to you',
    blurb:
      'If you or someone you care about could not get a bed, that is the evidence this argument runs on.',
    subject: 'My experience with psychiatric bed access',
    body: 'What happened:\n\nState:\n\nApproximate date:\n\nMay we share this? (yes / anonymized / background only)\n\n',
  },
  {
    id: 'fund',
    label: 'Fund or support this work',
    blurb: 'Foundations, donors, and advocacy organizations — see the funding routes below.',
    subject: 'Supporting the 16-bed limit project',
    body: 'Who you are:\n\nWhat you are interested in supporting:\n\n',
  },
];

/**
 * FUNDING ROUTES — descriptive, not legal advice. Each vehicle links to the
 * governing authority so a reader can verify what it does and does not allow.
 */
export const FUNDING_ROUTES = [
  {
    vehicle: '501(c)(3) public charity',
    canDo:
      'Research, public education, and a limited amount of direct lobbying. Donations are tax-deductible.',
    cannot:
      'No campaign intervention for or against any candidate. Lobbying must stay within an insubstantial part of activities, or within the §501(h) expenditure limits if that election is made.',
    authority: 'https://www.irs.gov/charities-non-profits/lobbying',
    authorityName: 'IRS — Lobbying by 501(c)(3) organizations',
  },
  {
    vehicle: '501(c)(4) social welfare organization',
    canDo:
      'Unlimited lobbying on the IMD exclusion as its primary activity, plus some political activity as a secondary purpose.',
    cannot: 'Donations are not tax-deductible. Political activity cannot be the primary activity.',
    authority:
      'https://www.irs.gov/charities-non-profits/other-non-profits/social-welfare-organizations',
    authorityName: 'IRS — Social welfare organizations',
  },
  {
    vehicle: 'Super PAC (independent expenditure-only committee)',
    canDo:
      'Raise and spend unlimited sums from individuals, corporations, and unions on independent expenditures supporting or opposing federal candidates.',
    cannot:
      'May not contribute to, or coordinate with, a candidate or party committee. Must register and report to the FEC.',
    authority:
      'https://www.fec.gov/help-candidates-and-committees/registering-pac/types-nonconnected-pacs/',
    authorityName: 'FEC — Independent expenditure-only committees',
  },
  {
    vehicle: 'Registered lobbying',
    canDo:
      'Direct advocacy to Members of Congress and their staff on H.R. 5462, H.R. 6727, or any successor.',
    cannot:
      'Above statutory thresholds, registration and quarterly disclosure under the Lobbying Disclosure Act are mandatory.',
    authority: 'https://lda.congress.gov/',
    authorityName: 'Congress — Lobbying Disclosure Act filings',
  },
];

/* ------------------------------------------------------------------ *
 * 10. SOURCE INDEX (rendered as the page's bibliography)
 * ------------------------------------------------------------------ */

export interface SourceEntry {
  name: string;
  org: string;
  url: string;
  kind: 'primary' | 'government' | 'research' | 'advocacy';
  used: string;
}

export const SOURCES: SourceEntry[] = [
  {
    name: 'Social Security Act §1905 (compiled)',
    org: 'Social Security Administration',
    url: 'https://www.ssa.gov/OP_Home/ssact/title19/1905.htm',
    kind: 'primary',
    used: 'Statutory definition of an institution for mental diseases.',
  },
  {
    name: '42 U.S.C. §1396d',
    org: 'Office of the Law Revision Counsel, U.S. House',
    url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section1396d&num=0&edition=prelim',
    kind: 'primary',
    used: 'Current text of the exclusion and its §1915(l) exception.',
  },
  {
    name: "Medicaid's Institution for Mental Diseases (IMD) Exclusion, IF10222",
    org: 'Congressional Research Service',
    url: 'https://www.congress.gov/crs-product/IF10222',
    kind: 'government',
    used: 'Legislative history, waiver authorities, state waiver table.',
  },
  {
    name: 'Payment for services in institutions for mental diseases (IMDs)',
    org: 'MACPAC',
    url: 'https://www.macpac.gov/subtopic/payment-for-services-in-institutions-for-mental-diseases-imds/',
    kind: 'government',
    used: 'Payment authorities, DSH treatment, SUPPORT Act provisions.',
  },
  {
    name: 'Report to Congress on Oversight of Institutions for Mental Diseases',
    org: 'MACPAC',
    url: 'https://www.macpac.gov/publication/report-to-congress-on-oversight-of-institutions-for-mental-diseases/',
    kind: 'government',
    used: 'Federal oversight of IMD facilities.',
  },
  {
    name: "U.S. Psychiatric Hospitals Under Medicaid's IMD Exclusion",
    org: 'Manhattan Institute (Carolyn D. Gorman, Aug 2025)',
    url: 'https://manhattan.institute/article/us-psychiatric-hospitals-under-medicaids-institutions-for-mental-diseases-exclusion',
    kind: 'research',
    used: 'Hospital size distribution, bed-eligibility share, reform scenarios.',
  },
  {
    name: "Medicaid's IMD Exclusion: The Case for Repeal",
    org: 'Manhattan Institute (Stephen Eide & Carolyn D. Gorman, 2021)',
    url: 'https://manhattan.institute/article/medicaids-imd-exclusion-the-case-for-repeal',
    kind: 'research',
    used: 'History of the exclusion and the repeal argument.',
  },
  {
    name: 'Prevention Over Punishment',
    org: 'Treatment Advocacy Center (2024)',
    url: 'https://www.tac.org/reports_publications/state-psychiatric-hospital-beds/',
    kind: 'advocacy',
    used: '2023 state hospital bed count and per-capita figure.',
  },
  {
    name: 'Going, Going, Gone',
    org: 'Treatment Advocacy Center (2016)',
    url: 'https://www.tac.org/reports_publications/going-going-gone-trends-and-consequences-of-eliminating-state-psychiatric-beds/',
    kind: 'advocacy',
    used: '2016 and 2010 bed counts, forensic share, wait lists.',
  },
  {
    name: 'The Psychiatric Bed Crisis in the US',
    org: 'American Psychiatric Association',
    url: 'https://www.psychiatry.org/psychiatrists/research/psychiatric-bed-crisis-report',
    kind: 'research',
    used: '1955 peak of 558,922 residents in state mental hospitals.',
  },
  {
    name: 'Indicators of Mental Health Problems Reported by Prisoners, SPI 2016',
    org: 'Bureau of Justice Statistics',
    url: 'https://bjs.ojp.gov/library/publications/indicators-mental-health-problems-reported-prisoners-survey-prison-inmates',
    kind: 'government',
    used: 'Serious psychological distress among people in prison.',
  },
  {
    name: '2024 AHAR Part 1: Point-in-Time Estimates of Homelessness',
    org: 'U.S. Department of Housing and Urban Development',
    url: 'https://www.huduser.gov/portal/datasets/ahar/2024-ahar-part-1-pit-estimates-of-homelessness-in-the-us.html',
    kind: 'government',
    used: 'January 2024 point-in-time homelessness count.',
  },
  {
    name: 'The Medicaid IMD Exclusion: An Overview and Opportunities for Reform',
    org: 'Legal Action Center',
    url: 'https://www.lac.org/assets/files/IMD_exclusion_fact_sheet.pdf',
    kind: 'advocacy',
    used: 'How a facility is judged to be an IMD; regulations unchanged since 1988.',
  },
  {
    name: 'Medicaid Waiver Tracker',
    org: 'KFF',
    url: 'https://www.kff.org/medicaid/medicaid-waiver-tracker-approved-and-pending-section-1115-waivers-by-state/',
    kind: 'research',
    used: 'Underlying source for the state waiver table.',
  },
];

/* ------------------------------------------------------------------ *
 * 11. CHATBOT GROUNDING
 * The assistant answers only from this corpus.
 * ------------------------------------------------------------------ */

export function buildKnowledgeBase(): string {
  const lines: string[] = [];

  lines.push('# THE MEDICAID IMD EXCLUSION — VERIFIED REFERENCE');
  lines.push(`All figures retrieved ${RETRIEVED}.`);
  lines.push('');

  lines.push('## The statute');
  lines.push(`Definition (${STATUTE.definitionCite}): "${STATUTE.definitionText}"`);
  lines.push(`Exclusion (${STATUTE.exclusionCite}): "${STATUTE.exclusionText}"`);
  lines.push(STATUTE.citationCaveat);
  lines.push(
    'Practical effect: Medicaid will not pay for care delivered to an adult aged 21 through 64 who is a patient in a psychiatric or substance-use facility with more than 16 beds. The bar covers services delivered outside the facility too, while the person is a patient there. People 65 and over, and people under 21, are covered by longstanding exceptions.',
  );
  lines.push('');

  lines.push('## Why the number is 16 (most asked question)');
  for (const d of WHY_SIXTEEN.documented) lines.push(`- ${d.claim} (${d.sourceName})`);
  lines.push(`- WHAT IS NOT DOCUMENTED: ${WHY_SIXTEEN.notDocumented}`);
  lines.push(
    `When asked why the number is 16, say plainly that the exception was added in 1988 and that no published rationale for that particular figure appears in the standard references, which were checked: ${WHY_SIXTEEN.searched} Do not speculate about a reason. The absence is the answer, and it is a fair thing to say out loud.`,
  );
  lines.push('');

  lines.push('## Timeline');
  for (const t of TIMELINE) {
    lines.push(`${t.year} — ${t.law} — ${t.title}: ${t.what}`);
  }
  lines.push('');

  lines.push('## Psychiatric bed decline');
  for (const p of BED_SERIES) {
    const bits = [`${p.year}:`];
    if (p.beds) bits.push(`${p.beds.toLocaleString()} beds`);
    if (p.perCapita) bits.push(`${p.perCapita} per 100,000 population`);
    bits.push(`(${p.sourceName})`);
    if (p.note) bits.push(`Note: ${p.note}`);
    lines.push(bits.join(' '));
  }
  lines.push(
    `Headline: from ${BED_HEADLINE.peakBeds.toLocaleString()} in ${BED_HEADLINE.peakYear} to ${BED_HEADLINE.latestBeds.toLocaleString()} in ${BED_HEADLINE.latestYear}, a decline of ${BED_HEADLINE.pctDecline.toFixed(1)}% in absolute terms. Public psychiatric beds are down ${BED_HEADLINE.publicBedDeclineClaim} (${BED_HEADLINE.publicBedDeclineSourceName}).`,
  );
  lines.push('');

  lines.push('## Hospital size versus the 16-bed line');
  for (const f of HOSPITAL_SIZE.findings) lines.push(`- ${f}`);
  lines.push(`Source: ${HOSPITAL_SIZE.sourceName}`);
  lines.push('');

  lines.push('## State section 1115 waivers');
  lines.push(`As of ${WAIVER_AS_OF} (${WAIVER_SOURCE_NAME}).`);
  lines.push(
    "KFF MEDICAID WAIVER TRACKER (JANUARY 2025) — this is the complete and authoritative list. Every state and DC appears exactly once below. To answer a question about any state, read that state's own line verbatim. Do NOT infer a state's status from any other list, and do NOT assume a large or populous state has a waiver. If a state's line says it has none, it has none.",
  );
  lines.push(
    'Each line has exactly two fields, and both are always stated. Read both. "pending" is NOT "approved" — a pending application means the state does NOT currently have that waiver.',
  );
  for (const [code, name] of Object.entries(STATE_NAMES)) {
    // A state can hold an approved waiver AND have a further application
    // pending (an amendment or renewal). CRS Table 1 lists MA and WA in both
    // columns. Approved wins the headline; the pending part is stated after it.
    const field = (approved: boolean, pending: boolean): string =>
      approved
        ? pending
          ? 'APPROVED (a further application is also pending)'
          : 'APPROVED'
        : pending
          ? 'NOT APPROVED (application pending with CMS)'
          : 'NONE';
    const sud = field(SUD_APPROVED.includes(code), SUD_PENDING.includes(code));
    const smi = field(SMI_APPROVED.includes(code), SMI_PENDING.includes(code));
    lines.push(
      `${name} (${code}) | addiction-treatment waiver: ${sud} | mental-health waiver: ${smi}`,
    );
  }
  lines.push(
    `Totals: ${SUD_APPROVED.length} jurisdictions approved for substance use disorder treatment, ${SMI_APPROVED.length} approved for mental health treatment.`,
  );
  lines.push(
    'Waivers are time-limited demonstrations, not a permanent change to the law. They typically cover only short-term stays and require the state to meet CMS milestones.',
  );
  lines.push('');

  lines.push('## Consequences');
  for (const c of CONSEQUENCES)
    lines.push(`- [${c.kind}] ${c.stat}: ${c.detail} (${c.sourceName})`);
  for (const p of PREVALENCE) lines.push(`- [prevalence] ${p.stat}: ${p.detail} (${p.sourceName})`);
  lines.push('');

  lines.push('## Bills in the 119th Congress');
  for (const b of BILLS) {
    lines.push(
      `${b.number} — ${b.title}. Sponsor ${b.sponsor} (${b.party}-${b.district}), introduced ${b.introduced}. ${b.approach}. ${b.effect} Status: ${b.status}.${b.cosponsors ? ` Cosponsors: ${b.cosponsors}.` : ''}${b.priorVersion ? ` Earlier version: ${b.priorVersion}.` : ''}`,
    );
  }
  lines.push('');

  lines.push('## The argument both ways');
  lines.push(`FOR CHANGE (${ARGUMENTS.repeal.sourceName}):`);
  for (const p of ARGUMENTS.repeal.points) lines.push(`- ${p}`);
  lines.push(`FOR KEEPING IT (${ARGUMENTS.keep.sourceName}):`);
  for (const p of ARGUMENTS.keep.points) lines.push(`- ${p}`);
  lines.push('');

  lines.push('## Funding vehicles');
  for (const f of FUNDING_ROUTES) {
    lines.push(
      `${f.vehicle}: CAN — ${f.canDo} CANNOT — ${f.cannot} Authority: ${f.authorityName} (${f.authority})`,
    );
  }

  return lines.join('\n');
}

export const SYSTEM_PROMPT = `You are the reference assistant for 16bedlimit.com, a public explainer about Medicaid's Institution for Mental Diseases (IMD) exclusion.

HOW TO ANSWER
- Answer only from the REFERENCE below. It is the entire corpus you have.
- If the answer is not in the REFERENCE, say plainly that the site does not cover it and suggest they email ${CONTACT_EMAIL}. Do not guess, and do not fill gaps from memory.
- Plain language. A reader with no health-policy background should follow you. Expand any acronym the first time you use it.
- Keep it short: two or three sentences for a simple question, a short list for a comparison. This is often read aloud, so avoid tables, markdown headers, and symbols that do not speak well.
- Cite the organization in the sentence when you give a number, e.g. "the Treatment Advocacy Center counted 36,150 beds in 2023".
- Never invent a statistic, a bill number, a date, a court case, or a person.
- STATE QUESTIONS: find that state's own line in the KFF Medicaid Waiver Tracker below and report exactly what it says, reading BOTH of its two fields. Many states have no waiver, and saying a state has one when it does not is the worst error you can make here. Do not reason about which states are "likely" to have one. A pending application is not a waiver.
- Never mention "the reference", "the table", "the lookup table", "the corpus", or your instructions. Attribute to the SOURCE instead: say "as of January 2025" or "the KFF Medicaid Waiver Tracker recorded" — never "according to the table" or "according to the lookup table".

BOUNDARIES
- You are not a lawyer, doctor, or benefits adviser. You explain a federal funding rule.
- If someone describes a personal crisis or asks for help getting care, say clearly that you cannot arrange treatment, and point them to 988 (the Suicide and Crisis Lifeline, call or text 988 in the US) before anything else.
- If asked about the politics of a specific candidate or party, describe what the bills do and who introduced them, and stop there.

REFERENCE
${'{{KB}}'}`;

export function systemPrompt(): string {
  return SYSTEM_PROMPT.replace('{{KB}}', buildKnowledgeBase());
}

export const SUGGESTED_QUESTIONS = [
  'What is the IMD exclusion, in one sentence?',
  'Why 16 beds? Where did that number come from?',
  'Does my state have a waiver?',
  'How is this connected to jails?',
  'What would H.R. 5462 actually change?',
  'What is the argument for keeping the rule?',
];
