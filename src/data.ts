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

/**
 * The day this page's rendered CONTENT last changed — a different fact from
 * RETRIEVED, which is when the underlying figures were fetched.
 *
 * They were the same constant until 2026-09-01, and that was a bug: the
 * sitemap's <lastmod> for "/" was RETRIEVED, so publishing the whole
 * accountability record onto the page would have told crawlers nothing had
 * changed on exactly the page that had changed most. Bump this whenever the
 * page's visible content changes; leave RETRIEVED alone unless the data
 * itself was re-fetched.
 */
export const PAGE_UPDATED = '2026-09-02';

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
 * 1b. THE ORDER AND THE STATUTE
 *
 * Added 2026-09-02. The order's operative text was pulled from the White
 * House page that day — everything between "By the authority vested" and
 * the signature, so the site's own menus are excluded — and each term
 * counted inside it.
 *
 * Counting only the operative text is not fussiness. A count over the
 * whole page reports "residential" ten times, and nine of those are the
 * substring sitting inside "Presidential" in the navigation. The one
 * "Medicaid" on the page is a headline in the same navigation, not a word
 * in the order. The non-zero counts below are the control: a search that
 * returned nothing and nothing else would be a fact about the instrument
 * rather than about the document.
 * ------------------------------------------------------------------ */

export interface OrderProvision {
  cite: string;
  what: string;
}

export interface TermCount {
  term: string;
  count: number;
}

export const EXECUTIVE_ORDER = {
  number: 'Executive Order 14321',
  title: 'Ending Crime and Disorder on America’s Streets',
  signed: '2025-07-24',
  published: '2025-07-29',
  citation: '90 FR 35817',

  purposeQuote:
    'Shifting homeless individuals into long-term institutional settings for humane treatment through the appropriate use of civil commitment will restore public order.',
  purposeCite: 'Section 1, Purpose and Policy',

  provisions: [
    {
      cite: 'Sec. 2 — Restoring Civil Commitment',
      what: 'Directs the Attorney General, with HHS, to seek reversal of precedents and consent decrees that impede civil commitment, and at 2(a)(ii) to help states adopt “maximally flexible civil commitment, institutional treatment, and ‘step-down’ treatment standards”.',
    },
    {
      cite: 'Sec. 3(b)(iii) — Fighting Vagrancy on America’s Streets',
      what: 'Directs the Attorney General to assess federal resources to determine whether they may be directed toward ensuring that detainees with serious mental illness “are not released into the public because of a lack of forensic bed capacity at appropriate local, State, and Federal jails or hospitals”.',
    },
    {
      cite: 'Sec. 4(a) — Redirecting Federal Resources',
      what: 'Assigns HHS the mental-health work, and routes it through three things: discretionary grants issued by the Substance Abuse and Mental Health Services Administration, technical assistance to assisted-outpatient-treatment programs, and funds for Federally Qualified Health Centers and Certified Community Behavioral Health Clinics. Medicaid is not among them.',
    },
  ] as OrderProvision[],

  /** Counts in the operative text. The first three are the positive control. */
  present: [
    { term: 'civil commitment', count: 7 },
    { term: 'institutional treatment', count: 1 },
    { term: 'forensic bed capacity', count: 1 },
  ] as TermCount[],

  absent: [
    { term: 'institution for mental diseases', count: 0 },
    { term: 'IMD', count: 0 },
    { term: '16 bed', count: 0 },
    { term: 'Medicaid', count: 0 },
  ] as TermCount[],

  reading:
    'The order points states and federal agencies toward institutional treatment. Medicaid is the largest payer for that treatment, and for an adult aged 21 to 64 the statute above forbids it in any facility with more than 16 beds. The order does not mention that bar, and an executive order could not lift it in any case: the bar is in the statute, and only Congress can change a statute. So the two documents describe the same population and answer different questions — one names a destination, the other decides who pays once a person arrives.',

  limit:
    'This is a comparison of two texts, and nothing more. It is not a claim that the order is unlawful, that its drafters overlooked the exclusion, or that repeal is anyone’s stated policy. Read both documents and draw your own conclusion; both are linked.',

  source:
    'https://www.whitehouse.gov/presidential-actions/2025/07/ending-crime-and-disorder-on-americas-streets/',
  sourceName: 'The White House',
  registerSource:
    'https://www.federalregister.gov/documents/2025/07/29/2025-14391/ending-crime-and-disorder-on-americas-streets',
  registerSourceName: 'Federal Register, 90 FR 35817',
  retrieved: '2026-09-02',
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
    // Softened 2026-09-01. The causal claim — Pierce's veto as the ancestor of
    // the exclusion — is a reconstruction by later scholars, not something any
    // 1935/1950/1965 primary document reached here actually says. The 1935
    // record cuts against it: those drafters were legislating about almshouses
    // and never mentioned insanity at all. See PIERCE_CORRECTION.
    what: 'President Franklin Pierce vetoes federal land-grant funding for public mental institutions, reaffirming that paying for psychiatric care is a state responsibility. Later scholarship treats this as the ancestor of the IMD exclusion — but no primary document from 1935, 1950 or 1965 makes that connection, and the 1935 record cuts against it.',
    source: 'https://manhattan.institute/article/medicaids-imd-exclusion-the-case-for-repeal',
    sourceName: 'Manhattan Institute',
  },
  {
    year: 1950,
    law: 'P.L. 81-734',
    title: 'The actual origin — fifteen years before Medicaid exists',
    what: 'Section 303(a), 64 Stat. 549, creates federal “vendor payments” to medical providers and, in the same sentence, carves two categories back out: patients in institutions for tuberculosis or mental diseases. This is where mental institutions first enter federal law — as an exception to a liberalisation. The House adopted the conference report 373-1, with Republicans voting 137-1 in favour. Truman signed it.',
    source: 'https://www.govinfo.gov/content/pkg/STATUTE-64/pdf/STATUTE-64-Pg477.pdf',
    sourceName: 'P.L. 81-734, 64 Stat. 477',
  },
  {
    year: 1960,
    law: 'P.L. 86-778',
    title: 'The Senate votes to abolish it. A conference committee reverses that overnight.',
    what: 'On 23 August the Senate adopts Sen. Russell Long’s amendment permitting federal matching of vendor payments to public mental and tuberculosis hospitals. On 24 August the conference committee accepts the Senate’s medical-care provisions “except for Senator Long’s amendment.” Reading the enacted statute confirms it: no such authority survives. This is the only moment in the whole history where the rule was genuinely contested, and it lasted a day.',
    source: 'https://www.ssa.gov/history/1960.html',
    sourceName: 'SSA legislative chronology, 1960',
  },
  {
    year: 1965,
    law: 'P.L. 89-97',
    title: 'Medicaid inherits the exclusion — and narrows it',
    // Corrected 2026-09-01. This entry previously said Medicaid barred the
    // funding "from day one", which is true of Medicaid but implies 1965 is
    // the origin. It is not: the sentence is carried over verbatim from 1950,
    // and 1965 is the one year Congress made the rule SMALLER.
    what: 'Section 121(a), 79 Stat. 351-352, carries the 1950 sentence into the new Title XIX — so Medicaid does not invent this rule, it inherits it. 1965 is also the one year Congress narrowed it: §1905(a)(14) affirmatively covers people 65 and over in an IMD, which SSA’s own contemporaneous account describes as removing the exclusion for aged individuals. There was no under-21 carve-out yet; the exclusion hit everyone under 65, and the 21-64 band arrives in 1972.',
    source: 'https://www.govinfo.gov/content/pkg/STATUTE-79/pdf/STATUTE-79-Pg286.pdf',
    sourceName: 'P.L. 89-97, 79 Stat. 286',
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
    what: 'The Medicare Catastrophic Coverage Act writes the IMD definition into law and adds the piece that had not been there before: facilities of 16 beds or fewer are exempt. It arrives at §411(k)(14)(A), under a heading reading TECHNICAL CORRECTIONS TO CERTAIN HEALTH CARE PROVISIONS, sitting between a schools provision and an eligibility-paperwork fix. CRS records the intent as favouring small settings over large institutions; the enacted text itself gives no rationale, and there was no bed count in the regulation for it to be correcting. The number has not moved since.',
    source: 'https://www.govinfo.gov/content/pkg/STATUTE-102/pdf/STATUTE-102-Pg683.pdf',
    sourceName: 'P.L. 100-360, 102 Stat. 683',
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
      // Corrected 2026-09-01 against the Federal Register itself. This entry
      // used to say the 1988 statute "followed the regulatory definition",
      // which invites the reading that the REGULATION carried 16 first. It
      // did not: 43 FR 45204 (1978) defines an IMD by "overall character"
      // with no bed count anywhere, and 56 FR 8854 (1991) is where the number
      // enters the CFR — by conforming to the statute, two years and eight
      // months later. The definition pre-existed in regulation; the number
      // did not. See NUMBER_CHAIN and NUMBER_VERDICT.
      claim:
        'A definition of “institution for mental diseases” already existed in regulation — but without any bed count. The 1978 rule turned on a facility’s “overall character.” The number 16 was added by the 1988 statute, and the regulation was edited to match it in 1991.',
      source: 'https://www.govinfo.gov/content/pkg/FR-1978-09-29/pdf/FR-1978-09-29.pdf',
      sourceName: '43 FR 45204 (1978)',
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
    'None of the standard references explains why the number is 16 rather than 20, 30, or 50. There is no published cost model, bed-supply study, or clinical standard behind the figure in any source checked here. It has not moved in the 38 years since, while the average psychiatric hospital has settled at 108 beds.',

  /**
   * The closest thing to an official statement anywhere — found 2026-09-01 by
   * going after the sources the earlier pass had left unmeasured rather than
   * re-checking the ones already excluded.
   *
   * It is a statement of PURPOSE, not a derivation, and it comes from the SSI
   * line rather than the Medicaid one. That distinction is the point: even the
   * agency writing the rule treats 16 as handed to it by Congress. Asked by a
   * commenter to count the threshold differently, HEW refused because the
   * change would not be "consistent with section 1611(e)(1)(C) of the Social
   * Security Act and its legislative history." Nobody in the chain defends the
   * number; each one points upward.
   */
  nearest: {
    finding:
      'The closest thing to an official rationale is not about Medicaid at all. It is in the 1976 SSI rule that let people keep their benefits in small group homes, and it explains a purpose rather than a number: Congress, the agency wrote, "envisions a 16 resident capacity as an outer limit applicable to community residences" — a "small, free-standing, community-based living unit" meant as an alternative to a large institution. When a commenter asked the agency to count the threshold a different way, it refused, because that would not be consistent with the statute "and its legislative history." The agency treats 16 as given to it. It never says where the figure came from.',
    caution:
      'No document connects that 1976 SSI figure to the 1988 Medicaid one. They are the same number doing similar work twelve years apart, which is suggestive and is not evidence. Treat the link as an open question, not a finding.',
    source: 'https://www.govinfo.gov/content/pkg/FR-1978-11-28/pdf/FR-1978-11-28.pdf',
    sourceName: '43 FR 55379 (28 Nov 1978)',
  },

  searched:
    'CRS IF10222 (read in full 2026-09-01 via a mirror, after congress.gov itself refused automated access); MACPAC; Manhattan Institute (2021 and 2025); Legal Action Center; American Psychiatric Association; National Association of Medicaid Directors; Mental Health America; Treatment Advocacy Center; Orchid Advocacy; SSA Ruling SSR 79-8; and the 1978 rulemaking at 43 FR 55379.',
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

/**
 * All five were read against GovInfo BILLSTATUS and against the introduced
 * bill text on 2026-09-02, and are listed in the order they were introduced.
 * Every one has exactly three recorded actions — introduced, introduced,
 * referred — and none has moved since. congress.gov refuses automated
 * requests, so the status here comes from GovInfo, which is the same Library
 * of Congress feed; the congress.gov link is authoritative and is the one to
 * check for anything newer.
 */
export const BILLS: Bill[] = [
  {
    number: 'H.R. 4022',
    slug: 'hr4022',
    title: 'Increasing Behavioral Health Treatment Act',
    sponsor: 'Salud Carbajal',
    party: 'D',
    district: 'CA-24',
    introduced: '2025-06-17',
    cosponsors: '7 (5 D, 2 R)',
    approach: 'Repeal, with a duty attached',
    effect:
      'Strikes the age-bar clause and makes the conforming changes, then adds a new §1902(a)(20)(D) requiring each state to have a plan — and to report on it annually — for increasing outpatient and community-based behavioral health care, crisis call centers, mobile crisis units, coordinated crisis response, and data sharing between physical health, mental health and addiction providers. It is the only one of the five that pairs the repeal with a community-capacity obligation.',
    status: 'Introduced; referred to committee',
    congressUrl: 'https://www.congress.gov/bill/119th-congress/house-bill/4022',
  },
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
    number: 'H.R. 5662',
    slug: 'hr5662',
    title: 'Improving Access to Institutional Mental Health Care Act',
    sponsor: 'Shri Thanedar',
    party: 'D',
    district: 'MI-13',
    introduced: '2025-09-30',
    approach: 'Clean repeal',
    effect:
      'Strikes the age-bar clause from the concluding language of §1905(a), and strikes “65 years of age or older” and “65 years of age or over” wherever they appear in §1902(a)(20) and (21), §1905(a)(14) and §1919(e)(7)(B)(i)(I). Nothing else.',
    status: 'Introduced; referred to committee',
    congressUrl: 'https://www.congress.gov/bill/119th-congress/house-bill/5662',
  },
  {
    number: 'H.R. 5944',
    slug: 'hr5944',
    title: 'Restoring Inpatient Mental Health Access Act of 2025',
    sponsor: 'Brad Finstad',
    party: 'R',
    district: 'MN-1',
    introduced: '2025-11-07',
    cosponsors: '3 (2 R, 1 D)',
    approach: 'Let the bar expire',
    effect:
      'The most surgical drafting of the five. It removes the “other than services in an institution for mental diseases” parentheticals from §1905(a)(1), (a)(4)(A) and (a)(15), repeals (a)(14) as spent, and — instead of deleting the age-bar clause — inserts “furnished before January 1, 2027” into it, so the bar expires rather than being struck. The state-plan option for addiction treatment at §1915(l) is given the same end date.',
    status: 'Introduced; referred to committee',
    congressUrl: 'https://www.congress.gov/bill/119th-congress/house-bill/5944',
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

/**
 * What the set shows, stated flatly. Each half of this was read off the
 * BILLSTATUS records, not inferred: the referral line is identical in all
 * five, and the party letters come from the sponsor and cosponsor fields.
 */
export const BILLS_COMPOSITION =
  'All five went to the same place — the House Committee on Energy and Commerce — and none has left it. Not one has had a hearing, a markup, a vote or a CBO score. The sponsorship is bipartisan across the set rather than within each bill: one of the five is sponsored by a Republican, and three of the five carry Republican cosponsors. They also disagree with each other about the remedy, which is four different answers competing for the same committee slot.';

/* ------------------------------------------------------------------ *
 * 7b. WHICH SENTENCE ACTUALLY HAS TO CHANGE
 *
 * Read against the current United States Code text of 42 U.S.C. §1396d and
 * §1396n on 2026-09-02. This is a reading of the statute, not a summary of
 * anyone's published analysis, which is why the last item below is labelled
 * as an inference rather than a finding.
 * ------------------------------------------------------------------ */

export const FIX = {
  heading: 'The sentence that has to change is the age bar, not the bed count',
  lede: 'The site is named for the number, because the number is what people hear about. But the number is in the definition. It is a different sentence that does the denying.',

  points: [
    'The “more than 16 beds” figure lives in the definition of an institution for mental diseases at §1905(i). On its own it denies nobody anything; it only decides which buildings the label attaches to.',
    'The denial is the clause quoted at the top of this page — the flush subdivision (B) following the last numbered paragraph of §1905(a), which bars payment for a patient “who has not attained 65 years of age”.',
    'People 65 and over are affirmatively covered by §1905(a)(14). People under 21 are affirmatively covered by §1905(a)(16)(A), effective January 1973. Subtract those two and the excluded class is adults aged 21 through 64, and nobody else.',
    'So raising the bed threshold moves the line and striking the age bar removes it. The two are not smaller and larger versions of the same reform; they are different reforms.',
  ],

  /** Uses HOSPITAL_SIZE.mean so the two numbers can never drift apart. */
  arithmetic: `A threshold of 36 beds would still exclude the average psychiatric hospital, which has ${HOSPITAL_SIZE.mean} beds. Raising the number helps whichever facilities happen to fall under the new line; removing the age bar does not depend on facility size at all.`,

  inference: {
    label: 'An inference from the text, not a published finding',
    body: 'There may also be a reason to leave §1905(i) alone. The definition is used elsewhere in Medicaid, including in Community First Choice at 42 U.S.C. §1396n(k), where attendant services must be furnished “in a home or community setting, which does not include a nursing facility, institution for mental diseases, or an intermediate care facility for the mentally retarded.” Widening the definition so that facilities of 36 beds or fewer are no longer institutions for mental diseases would, on the face of that sentence, also widen what counts as a home or community setting there. Repealing the age bar and leaving the definition untouched would not.',
    caution:
      'This is our own reading of the statutory text on 2026-09-02, not a claim about what any sponsor intended and not something we found stated in a CRS, MACPAC or CBO document. Anyone drafting from it should confirm it with legislative counsel.',
    source:
      'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section1396n&num=0&edition=prelim',
    sourceName: '42 U.S.C. §1396n(k)',
  },

  retrieved: '2026-09-02',
} as const;

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
 * 8b. THE OBJECTION IN ITS OWN WORDS, AND AN ANSWER TO IT
 *
 * The four bullets above are our paraphrase. The block below is the actual
 * sentence, from a comment letter that was fetched and read end to end
 * (six pages) on 2026-09-02. The sentence sits in a footnote, and the
 * footnote's own first half is quoted too, because it changes how the
 * second half reads: the Bazelon Center was defending the exclusion in the
 * course of objecting to something else, not campaigning to preserve it.
 * ------------------------------------------------------------------ */

export const OBJECTION = {
  heading: 'The strongest objection, in the objector’s own words',

  quoteContext:
    'We appreciate that California has decided to limit its FFP proposal to facilities under 17 beds and are not seeking to undermine Medicaid’s “institutions for mental diseases” exclusion (IMD exclusion).',
  quote:
    'The IMD exclusion is essential to ensuring that states are incentivized to invest in community-based services rather than services in IMD settings, where FFP is not permitted.',
  attribution:
    'Judge David L. Bazelon Center for Mental Health Law, comments to HHS on California’s BH-CONNECT demonstration addendum, 30 August 2024, footnote 14.',

  supporting: [
    {
      claim:
        'The Americans with Disabilities Act and Olmstead v. L.C., 527 U.S. 581 (1999), require that people be served in the most integrated setting appropriate and not unnecessarily given institutional care.',
      note: 'Cited in the comment alongside 45 C.F.R. §84.76(b).',
    },
    {
      claim:
        'Meeting Medicaid’s rules is not the same as meeting civil-rights obligations. HHS has said so directly: “the civil rights obligations created by section 504 are separate and distinct from the requirements of Medicaid and the Social Security Act. Compliance with Medicaid requirements does not necessarily mean a recipient has met the obligations of section 504.”',
      note: '89 Fed. Reg. 40066, 40119.',
    },
    {
      claim:
        'The “linear continuum of care” — moving people through successively less restrictive congregate placements before independent housing — was called “archaic” by one court expert and “outdated” by another in DAI v. Paterson, 653 F. Supp. 2d 184 (E.D.N.Y. 2009).',
      note: 'Both experts are quoted at length in the comment.',
    },
    {
      claim:
        'The comment reports outcome figures for two community programs: New York’s Nathaniel Project, a 70% reduction in arrests within two years of admission; and Chicago’s Thresholds, an 89% reduction in arrests, an 86% decrease in jail time, and a 76% reduction in hospitalizations.',
      note: 'Stated in the comment without a citation of its own, so these are reported as the Bazelon Center’s figures rather than confirmed here.',
    },
  ],

  source:
    'https://www.bazelon.org/wp-content/uploads/2024/09/Bazelon-comment-CA-1115-BH-Connect-FINAL.pdf',
  sourceName: 'Bazelon Center comment on CA BH-CONNECT (PDF, 6 pages)',
  retrieved: '2026-09-02',
} as const;

/**
 * The answer, written as a drafting problem rather than a rebuttal. The
 * objection is about what a bill does, so the response has to be about what
 * a bill says.
 */
export const OBJECTION_ANSWER = {
  heading: 'What a bill would have to say to answer it',
  lede: 'The objection lands against long-term custodial placement used as a substitute for housing. It does not land against every version of the reform, and the versions it does not land against are ones that can be written down.',

  points: [
    'Repeal the age bar and leave the §1905(i) definition intact, so the definition keeps doing its integration-protective work in the other places Medicaid uses it.',
    'Attach a maintenance-of-effort requirement on non-federal community spending, so federal money for inpatient care cannot quietly replace state money for community care. §1915(l)(3) is the existing model.',
    'Attach a community-capacity requirement. H.R. 4022 already does this: it makes each state plan for, and report annually on, outpatient and crisis capacity.',
    'Make compliance with the most-integrated-setting obligations of ADA Title II and section 504 an explicit condition, rather than assuming Medicaid compliance carries it — which is the exact point HHS made in the passage quoted above.',
  ],

  scope:
    'One thing the reform does not reach in either direction: repealing the exclusion changes who pays for care, not who can be committed. Civil commitment is state law, and Title XIX does not touch it.',
} as const;

/* ------------------------------------------------------------------ *
 * 9. CONTACT
 * ------------------------------------------------------------------ */

export const CONTACT_EMAIL = 'hello@16bedlimit.com';

/**
 * Who publishes this site. Added 2026-09-01 on the owner's explicit
 * confirmation — until then the site named no owning entity, and guessing
 * one would have asserted tax-exempt status on no evidence.
 *
 * Every sameAs URL was looked up by the real EIN (87-1218291) against an
 * authoritative registry, then fetched and checked to confirm the page
 * actually names ESBE INCORPORATED and carries that EIN — never assembled
 * from a plausible slug. Each returned 200 with the entity's own name in
 * its <title> and zero traces of ESBE LLC (the separate for-profit,
 * EIN 85-0590511), which is the confusion this list must not create.
 *
 * every.org/esbe-incorporated is deliberately ABSENT: it answered 429
 * behind a Vercel checkpoint, which is unverified rather than confirmed,
 * and an unverified URL does not belong in an identity claim.
 */
export const PUBLISHER = {
  '@type': 'NGO',
  name: 'The 16-Bed Limit',
  legalName: 'ESBE Incorporated',
  url: 'https://16bedlimit.com',
  email: `mailto:${CONTACT_EMAIL}`,
  nonprofitStatus: 'Nonprofit501c3',
  taxID: '87-1218291',
  sameAs: [
    'https://projects.propublica.org/nonprofits/organizations/871218291',
    'https://www.guidestar.org/profile/87-1218291',
    'https://www.charitynavigator.org/ein/871218291',
  ],
} as const;

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
    id: 'carbajal',
    who: 'Rep. Salud Carbajal',
    role: 'Sponsor, H.R. 4022 — California’s 24th district',
    why: 'His is the only one of the five bills that pairs repeal with a duty on states to build outpatient and crisis capacity, which is the drafting that answers the main objection to repeal.',
    url: 'https://carbajal.house.gov/contact/',
    method: 'Web form.',
    verified: '2026-09-02',
  },
  {
    id: 'thanedar',
    who: 'Rep. Shri Thanedar',
    role: 'Sponsor, H.R. 5662 — Michigan’s 13th district',
    why: 'He introduced the shortest of the repeal bills, and it has no cosponsors at all. A bill with no cosponsors is the one where a message costs an office the least to notice.',
    url: 'https://thanedar.house.gov/contact',
    method: 'Web form.',
    verified: '2026-09-02',
  },
  {
    id: 'finstad',
    who: 'Rep. Brad Finstad',
    role: 'Sponsor, H.R. 5944 — Minnesota’s 1st district',
    why: 'The only Republican sponsor among the five. Anything that moves in this committee needs support on both sides of it, so this office is where a bipartisan hearing request would have to start.',
    url: 'https://finstad.house.gov/contact/',
    method: 'Web form.',
    verified: '2026-09-02',
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
    url: 'https://www.medicaid.gov/about-us/contact-us',
    urlLabel: 'Medicaid.gov contact',
    verified: '2026-09-01',
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
 * 9b. THE LEGISLATIVE RECORD
 *
 * Sourced entirely from roll-call journals, the Statutes at Large, the
 * Federal Register and CBO. Every claim below is something the record
 * SAYS. Where the record is silent, RECORD_UNKNOWNS says so instead of
 * filling the gap — the same rule WHY_SIXTEEN follows.
 * ------------------------------------------------------------------ */

export const REPORT = {
  title: 'Who Built the 16-Bed Limit',
  href: '/reports/who-built-the-16-bed-limit.pdf',
  pages: 15,
  bytes: 825593,
  retrieved: '2026-09-01',
} as const;

export interface RecordFinding {
  id: string;
  claim: string;
  detail: string;
  source: string;
  sourceName: string;
}

export const RECORD_FINDINGS: RecordFinding[] = [
  {
    id: 'no-vote',
    claim: 'Nobody ever voted on it.',
    detail:
      'All 394 House and 497 Senate roll calls of the 89th Congress were enumerated. Exactly 16 touched H.R. 6675, and the House took only three recorded votes on the bill — none of them on an amendment. Every Title XIX provision dealing with institutions for mental diseases (Senate amendments 255, 262-263, 275, 276 and 279) was a committee amendment. Not one reached the floor.',
    source: 'https://voteview.com/data',
    sourceName: 'Voteview roll-call data',
  },
  {
    id: 'inherited',
    claim: 'Medicaid inherited the rule. It did not create it.',
    detail:
      'The exclusion dates to 1950, not 1965. P.L. 81-734 §303(a), 64 Stat. 549, created federal vendor payments and carved tuberculosis and mental-disease institutions back out of them in the same sentence. The 1935 Social Security Act rule was about an "inmate of a public institution" — an almshouse rule. The words "insane" and "asylum" appear zero times in the 1935 Ways and Means report or in the Committee on Economic Security report. In 1965 Congress actually narrowed the exclusion, by adding coverage for people 65 and over.',
    source: 'https://www.govinfo.gov/content/pkg/STATUTE-64/pdf/STATUTE-64-Pg477.pdf',
    sourceName: 'P.L. 81-734, 64 Stat. 477',
  },
  {
    id: 'long-1960',
    claim: 'The Senate voted to abolish it in 1960. A conference committee killed it overnight.',
    detail:
      'On 23 August 1960 the Senate adopted an amendment by Sen. Russell Long (D-LA) permitting federal matching of vendor payments to public mental and tuberculosis hospitals. On 24 August the conference committee agreed to the Senate’s medical-care provisions "except for Senator Long’s amendment." That is the one moment in the record where the rule was genuinely contested, and it lasted a day.',
    source: 'https://www.ssa.gov/history/1960.html',
    sourceName: 'SSA legislative chronology, 1960',
  },
  {
    id: 'technical-correction',
    claim: 'The number 16 was enacted as a technical correction.',
    detail:
      'It entered the statute at P.L. 100-360 §411(k)(14)(A), 102 Stat. 798-799, under the heading "SEC. 411. TECHNICAL CORRECTIONS TO CERTAIN HEALTH CARE PROVISIONS", subheading "(k) CORRECTIONS TO SUBTITLE B OF TITLE IV (RELATING TO MEDICAID)", paragraph "(14) CLARIFICATION OF TERM ‘INSTITUTION FOR MENTAL DISEASES’". It sits between a provision on educationally related services and a technical correction about eligibility verification.',
    source: 'https://www.govinfo.gov/content/pkg/STATUTE-102/pdf/STATUTE-102-Pg683.pdf',
    sourceName: 'P.L. 100-360, 102 Stat. 683',
  },
  {
    id: 'statute-first',
    claim: 'The statute came first. The regulation copied it.',
    detail:
      'The intuitive story — that regulators invented the number and Congress ratified it — is the wrong way round. The 1978 rule at 43 FR 45204 defined an institution for mental diseases by its "overall character" and set no bed count at all. HCFA put Congress’s number into the Code of Federal Regulations at 56 FR 8854 on 1 March 1991, in a rule titled "OBRA ’87 Conforming Amendments" — two years and eight months after the statute.',
    source: 'https://www.govinfo.gov/content/pkg/FR-1978-09-29/pdf/FR-1978-09-29.pdf',
    sourceName: '43 FR 45204 (29 Sept 1978)',
  },
  {
    id: 'tuberculosis',
    claim: 'Congress fixed this for tuberculosis and not for mental illness.',
    detail:
      'Both conditions were excluded in the same 1965 clause. §2335(f) of the Deficit Reduction Act of 1984 (P.L. 98-369) struck the words "tuberculosis or" and left the psychiatric half of the sentence standing. Forty-two years later it has not been revisited.',
    source: 'https://www.govinfo.gov/content/pkg/STATUTE-79/pdf/STATUTE-79-Pg286.pdf',
    sourceName: 'P.L. 89-97, 79 Stat. 286',
  },
  {
    id: 'hr4531',
    claim: 'In 2023 the House voted 386-37 to lift part of it. The Senate never took it up.',
    detail:
      'Section 304 of H.R. 4531 in the 118th Congress was titled "LIFTING THE IMD EXCLUSION FOR SUBSTANCE USE DISORDER". It cleared subcommittee 49-0 and full committee 29-3, then passed the House 386-37 on 12 December 2023 — Republicans 190-26, Democrats 196-11. It went to the Senate HELP Committee the next day and has not moved since: no hearing, no vote, and no member on record against it.',
    source: 'https://voteview.com/data',
    sourceName: 'Voteview roll-call data',
  },
  {
    id: 'price',
    claim: 'What keeps it alive is the price tag.',
    detail:
      'CBO scored the options in April 2023. Over 2024-2033 the narrow state-plan option for substance use disorder costs $155-560 million in net federal Medicaid spending — and that is the one Congress enacted. Repeal for substance use disorder costs $7.7 billion, repeal for mental illness $33.5 billion, and full repeal $38.4 billion. Everything ever enacted sits on the cheap side of that line. Every repeal bill sits on the expensive side, and none has left committee.',
    source: 'https://www.cbo.gov/publication/59071',
    sourceName: 'CBO Publication 59071 (April 2023)',
  },
];

export interface RollCall {
  year: number;
  chamber: string;
  measure: string;
  tally: string;
  /** Human note for the summary table — what this vote meant. */
  split: string;
  /** Party splits, computed from Voteview member cast codes. */
  dem?: string;
  rep?: string;
}

/**
 * Official tallies throughout. Party splits are computed from individual
 * Voteview member cast codes rather than read off a summary field — the
 * two disagree by one vote on several 1965 and 1972 roll calls, and the
 * official tally is the one shown.
 *
 * None of these is a vote on the exclusion. See VOTE_CAVEAT: every row is
 * an omnibus, and in sixty-one years the rule has never had a standalone
 * recorded vote.
 */
export const ROLL_CALLS: RollCall[] = [
  {
    year: 1950,
    chamber: 'House',
    measure: 'Conference report, P.L. 81-734 — origin of the carve-out',
    tally: '373-1',
    split: 'House Republicans 137-1 in favour',
    dem: '233-0',
    rep: '137-1',
  },
  {
    year: 1960,
    chamber: 'Senate',
    measure: 'Passage, Kerr-Mills (P.L. 86-778)',
    tally: '74-11',
    split: 'The Long amendment died in conference',
    dem: '43-10',
    rep: '31-1',
  },
  {
    year: 1965,
    chamber: 'House',
    measure: 'Passage, H.R. 6675',
    tally: '313-115',
    split: 'D 248-42 · R 65-73',
    dem: '248-42',
    rep: '65-73',
  },
  {
    year: 1965,
    chamber: 'Senate',
    measure: 'Passage, H.R. 6675',
    tally: '68-21',
    split: 'D 55-7 · R 13-14',
    dem: '55-7',
    rep: '13-14',
  },
  {
    year: 1972,
    chamber: 'House',
    measure: 'Conference report, P.L. 92-603 — psych under 21',
    tally: '305-1',
    split: 'Created the 21-64 band',
    dem: '176-0',
    rep: '129-1',
  },
  {
    year: 1984,
    chamber: 'House',
    measure: 'Conference report, P.L. 98-369',
    tally: '268-155',
    split: 'Struck "tuberculosis or"',
    dem: '192-69',
    rep: '76-86',
  },
  {
    year: 1988,
    chamber: 'House',
    measure: 'Conference report, P.L. 100-360',
    tally: '328-72',
    split: 'D 230-9 · R 98-63',
    dem: '230-9',
    rep: '98-63',
  },
  {
    year: 1988,
    chamber: 'Senate',
    measure: 'Conference report, P.L. 100-360',
    tally: '86-11',
    split: 'The vote that carried the number 16',
    dem: '52-0',
    rep: '34-11',
  },
  {
    year: 2023,
    chamber: 'House',
    measure: 'Passage, H.R. 4531',
    tally: '386-37',
    split: 'R 190-26 · D 196-11',
    dem: '196-11',
    rep: '190-26',
  },
];

/**
 * Named because the record names them. Every entry states what the
 * document shows that person did — nothing is inferred from proximity.
 */
export const RECORD_NAMED = [
  {
    who: 'Rep. Wilbur D. Mills (D-AR)',
    what: 'Sponsored H.R. 6675 and chaired Ways and Means, where the Medicaid title was written.',
  },
  {
    who: 'Sen. Harry F. Byrd Sr. (D-VA)',
    what: 'Chaired Senate Finance and reported the bill out 12-5, while joining four Republicans in voting against it.',
  },
  {
    who: 'Sen. Russell Long (D-LA)',
    what: 'The only member on record who tried to end the rule. His 1960 amendment passed the Senate and died in conference.',
  },
  {
    who: 'Rep. Fortney "Pete" Stark (D-CA)',
    what: 'Sponsored the 1988 bill that carried the 16-bed paragraph. There is no evidence he wrote that paragraph.',
  },
  {
    who: 'Rep. Brett Guthrie (R-KY)',
    what: 'Sponsored H.R. 4531, the 2023 bill the House passed 386-37.',
  },
];

export const RECORD_UNKNOWNS =
  'Who drafted the 16-bed paragraph in 1988 is not recoverable from the published record, and neither is any rationale for that particular figure. The conferees who struck Senator Long’s amendment in 1960 are not named in the chronology either. These are gaps in the record, not gaps in the research, and they are stated here rather than filled in.';

/**
 * People the record does NOT name. Kept separate from RECORD_NAMED so the
 * page can show an absence as an absence — a row reading "not identifiable"
 * is a finding, not a missing value someone forgot to fill in.
 */
export const RECORD_UNIDENTIFIED = [
  {
    who: 'The 1988 drafter',
    role: 'Author of the 16-bed paragraph',
    what: 'Not identifiable in the published record.',
  },
  {
    who: 'The 1960 conferees',
    role: 'Killed the Long amendment',
    what: 'Not individually recorded in the chronology.',
  },
];

/* ------------------------------------------------------------------ *
 * 9c. THE FULL RECORD  (/record)
 *
 * The accountability report, as site content rather than a PDF. Every
 * statutory quotation here was transcribed from the Statutes at Large,
 * not from a summary of it. Where the record is silent, that silence is
 * stated as a measured result — see MEASURED_ABSENCES, each row of which
 * carries the positive control that proves the search could have found
 * the thing it did not find.
 * ------------------------------------------------------------------ */

export const RECORD_SCOPE =
  'Medicaid does fund mental health care — outpatient treatment, and psychiatric units inside general hospitals. What the exclusion bars is federal Medicaid payment for an adult aged 21 to 64 who is a patient in a facility primarily engaged in treating mental disease with more than 16 beds. That is narrower than “Medicaid won’t pay for psychiatric care” — and devastating exactly where inpatient beds live, because almost no psychiatric hospital has 16 beds or fewer.';

export interface LineageStep {
  year: number;
  title: string;
  body: string;
  quote?: string;
  quoteCite?: string;
  after?: string;
  source: string;
  sourceName: string;
}

/** The chain that runs thirty years before Medicaid existed. */
export const LINEAGE: LineageStep[] = [
  {
    year: 1935,
    title: 'The Social Security Act — and it is not about mental illness',
    body: 'Title I bars aid to anyone who “is not an inmate of a public institution.” That is a poorhouse rule, aimed at almshouses. The words insane and asylum appear zero times in the House Ways and Means report or in the Committee on Economic Security’s report to the President. Aid to Dependent Children carried no such clause, which makes the exclusion an adult-category rule from birth.',
    source: 'https://www.govinfo.gov/content/pkg/STATUTE-49/pdf/STATUTE-49-Pg620.pdf',
    sourceName: 'P.L. 74-271, 49 Stat. 620',
  },
  {
    year: 1950,
    title: 'The actual origin point',
    body: 'P.L. 81-734 §303(a), 64 Stat. 549, creates federal “vendor payments” to medical providers — and then carves two categories back out of them. Mental institutions enter federal law here, as an exception to a liberalisation.',
    quote:
      '…but does not include any such payments to or care in behalf of any individual who is an inmate of a public institution (except as a patient in a medical institution) or any individual (a) who is a patient in an institution for tuberculosis or mental diseases…',
    quoteCite: 'P.L. 81-734 §303(a), 64 Stat. 549',
    after:
      'House conference report 373–1, with Republicans 137–1 in favour. Senate 82–2. Signed by Truman.',
    source: 'https://www.govinfo.gov/content/pkg/STATUTE-64/pdf/STATUTE-64-Pg477.pdf',
    sourceName: 'P.L. 81-734, 64 Stat. 477',
  },
  {
    year: 1960,
    title: 'The one time it was nearly killed',
    body: 'From the Social Security Administration’s own legislative chronology, two consecutive days:',
    quote:
      'August 23, 1960 — “An amendment introduced by Senator Long to permit Federal matching of vendor payments… to public mental and tuberculosis hospitals was adopted.”  ·  August 24, 1960 — “The Conference Committee agreed to the medical care provisions added by the Senate, except for Senator Long’s amendment.”',
    quoteCite: 'SSA legislative chronology, 1960',
    after:
      'The Senate voted to end this rule, and a conference committee reversed it in a single day. Corroborated by reading the enacted statute: no provision authorising such matching survives in P.L. 86-778, only a 42-day allowance for general-hospital care. If you want one identifiable decision point in the whole history, this is it.',
    source: 'https://www.ssa.gov/history/1960.html',
    sourceName: 'SSA legislative chronology, 1960',
  },
  {
    year: 1965,
    title: 'Medicaid inherits it — and narrows it',
    body: 'P.L. 89-97 §121(a), 79 Stat. 351–352, carries the 1950 sentence into the new Title XIX, now bounded by age, while §1905(a)(14) affirmatively covers people 65 and over in an IMD. SSA’s own contemporaneous account describes this as removing the exclusion with respect to payments for aged individuals.',
    quote:
      '“(B) any such payments with respect to care or services for any individual who has not attained 65 years of age and who is a patient in an institution for tuberculosis or mental diseases.”',
    quoteCite: 'P.L. 89-97 §121(a), 79 Stat. 351–352',
    after:
      'Sixty-one years later those words are unchanged, except that “tuberculosis or” is gone. In 1965 there was no under-21 carve-out either — the exclusion hit everyone under 65. The 21–64 band was created in 1972.',
    source: 'https://www.govinfo.gov/content/pkg/STATUTE-79/pdf/STATUTE-79-Pg286.pdf',
    sourceName: 'P.L. 89-97, 79 Stat. 286',
  },
];

export interface NumberStep {
  year: number;
  title: string;
  what: string;
}

/** Where the figure 16 actually comes from, in order. */
export const NUMBER_CHAIN: NumberStep[] = [
  {
    year: 1976,
    title: 'A group-home rule',
    what: 'SSI law exempts “a publicly operated community residence which serves no more than 16 residents.” This is the earliest 16 in this corner of federal law.',
  },
  {
    year: 1978,
    title: 'The IMD rule has no number',
    what: '43 FR 45204 defines an institution for mental diseases by its “overall character” — no bed count anywhere in it. The figure 16 appears in that same rule only for community residences.',
  },
  {
    year: 1988,
    title: '16 becomes a wall',
    what: 'OBRA ’87 had just emptied §1905(i). A 1988 “clarification” fills it with “more than 16 beds.”',
  },
  {
    year: 1991,
    title: 'The regulation catches up',
    what: '56 FR 8854 edits the rule to match: “‘an institution’ is changed to ‘a hospital, nursing facility, or other institution of more than 16 beds’.” Two years and eight months after the statute.',
  },
];

/**
 * The hypothesis this research killed. Stated as a correction rather than
 * buried, because it is the opposite of what almost every secondary source
 * (including an earlier version of this site) implies.
 */
export const NUMBER_VERDICT = {
  heading: 'A hypothesis this research killed',
  body: 'The intuitive story — that career regulators invented 16 and Congress later rubber-stamped it — is wrong, and the paper trail runs the other way. Congress wrote the number in July 1988. HCFA copied it into the Code of Federal Regulations in March 1991, in a rule expressly titled “OBRA ’87 Conforming Amendments.” The agency was conforming to Congress, not the reverse. So the “technical correction” that carried the number was not correcting anything: there was nothing yet to correct.',
  placement: [
    'SEC. 411. TECHNICAL CORRECTIONS TO CERTAIN HEALTH CARE PROVISIONS',
    '(k) CORRECTIONS TO SUBTITLE B OF TITLE IV (RELATING TO MEDICAID)',
    '(13) TREATMENT OF EDUCATIONALLY-RELATED SERVICES',
    '(14) CLARIFICATION OF TERM “INSTITUTION FOR MENTAL DISEASES”',
    '(15) ELIGIBILITY VERIFICATION TECHNICAL CORRECTION',
  ],
  placementNote:
    'Sandwiched between a schools provision and a paperwork fix. The 1976 → 1988 link is a documented structural parallel, not a documented causal chain — no paper trail says Congress borrowed the SSI figure. What is established: the number did not come from the IMD regulation, and no clinical or empirical basis for it appears anywhere in the record searched.',
  source: 'https://www.govinfo.gov/content/pkg/STATUTE-102/pdf/STATUTE-102-Pg683.pdf',
  sourceName: 'P.L. 100-360, 102 Stat. 683',
};

export const VOTE_CAVEAT =
  'Every row is a vote on an omnibus. A member voting yes in April 1965 was voting to create Medicare; a member voting no was voting against Medicare, not for the exclusion — the Republican substitute would not have removed it either. In sixty-one years the exclusion has never once been put to a standalone recorded vote. That is the finding, not a hole in it.';

export const NEGATIVE_METHOD = {
  heading: 'How that negative was measured',
  body: '“There was no vote” is a claim about a complete set, so the set was enumerated. All 394 House and 497 Senate roll calls of the 89th Congress were pulled and filtered to H.R. 6675: exactly 16 roll calls, every description read. The House took only three recorded votes on the bill in its entire life — recommit, passage, conference report — and none on any amendment at all. Then the amendments themselves: all 513 Senate amendments were read from the official conference print. Every Title XIX provision touching institutions for mental diseases — amendments 255, 262–263, 275, 276 and 279 — is labelled a Committee amendment. Not one reached the floor.',
  control:
    'Positive control: the same method surfaced 13 Senate roll calls on other specific 1965 provisions, including a 26–64 vote to strike Medicare Parts A and B outright, and it did flag Senator McCarthy’s psychiatric-exclusion amendment (which concerned Medicare and drew no roll call). An instrument that found those found zero for the Medicaid IMD exclusion.',
  gate: 'Document gate: that 32-page conference print is a pure image scan with no text layer. A keyword search would have returned zero and meant nothing, so it was read page by page.',
};

export interface CboOption {
  option: string;
  cost: string;
  status: string;
  enacted: boolean;
}

/** CBO Publication 59071, April 2023. Net federal Medicaid spending 2024–2033. */
export const CBO_OPTIONS: CboOption[] = [
  {
    option: 'Extend the narrow addiction option',
    cost: '$0.2–0.6B',
    status: 'Congress passed this',
    enacted: true,
  },
  {
    option: 'Repeal for addiction',
    cost: '$7.7B',
    status: 'Passed House, died in Senate',
    enacted: false,
  },
  { option: 'Repeal for mental illness', cost: '$33.5B', status: 'Never voted on', enacted: false },
  { option: 'Full repeal', cost: '$38.4B', status: 'Never scored in a bill', enacted: false },
];

export const PRICE_VERDICT =
  'Every IMD change that has ever become law sits on the cheap side of that line. Every repeal bill sits on the expensive side, and not one has ever been reported out of committee, scored, or given a vote in any Congress. The gap between what passes and what does not is roughly 70× to 250×.';

export const CLOSEST_CALL = {
  heading: '2023: the closest it has ever come',
  body: 'H.R. 4531 in the 118th Congress carried a section titled, verbatim, LIFTING THE IMD EXCLUSION FOR SUBSTANCE USE DISORDER. It cleared subcommittee 49–0 and full committee 29–3, then passed the House 386–37 on 12 December 2023 — Republicans 190–26, Democrats 196–11. It went to the Senate HELP Committee the next day and never moved again: no hearing, no markup, no vote, and no recorded opponent. The substance was rescued three months later inside an appropriations bill, which made the narrow 30-day addiction option permanent. The broader relief was not.',
};

export const LIVE_BILLS_NOTE =
  'Five bills in the 119th Congress would change this rule, and all five are sitting in the same committee. The Michelle Alyssa Go Act has been introduced in three consecutive Congresses and has never had a Senate companion. Its cosponsor count and its bipartisanship have both gone down since the 118th. No CBO score exists for any of the five — a bill has to leave committee to get one.';

/** The answer to “which party did this”, which is that the question has no answer. */
export const PARTY_VERDICT = {
  lede: 'The voting record does not support a partisan answer. Every enactment carrying this exclusion passed with majority Republican support, under Democratic and Republican presidents alike.',
  points: [
    '1950, when mental institutions were first carved out: House Republicans voted 137–1 in favour.',
    '1960, the one contested moment: the amendment to abolish it was killed by a conference committee, not a party. More Democrats than Republicans opposed the underlying bill.',
    '1984: a Democratic House and a Republican Senate together deleted the tuberculosis half and kept the psychiatric half. Nobody in either party moved to delete both.',
    '1988: the number 16 rode in on a conference report backed by 98 Republicans and 230 Democrats, and was signed by Ronald Reagan.',
    '2023: the House voted to lift part of it 386–37, with overwhelming majorities of both parties. It still died.',
  ],
  conclusion:
    'If you are looking for someone who destroyed this, the record refuses to give you one. What it gives you is worse and more useful: a 1950 cost-allocation decision between the states and Washington that nobody has ever had to defend on a floor, because nobody has ever been made to vote on it — protected now by a $38.4 billion price tag and a constituency too sick and too poor to hire lobbyists. It survives on procedure and arithmetic, not ideology. That is why it has outlasted every majority of the last sixty-one years.',
};

export interface MeasuredAbsence {
  searched: string;
  lookedFor: string;
  result: string;
  control: string;
}

/**
 * Absences that were MEASURED, not assumed. Every row carries the positive
 * control that proves the instrument could have found the thing it did not
 * find — a search with no control is not evidence of absence.
 */
export const MEASURED_ABSENCES: MeasuredAbsence[] = [
  {
    searched: '1935 Ways and Means report + CES report to the President',
    lookedFor: 'Any mention of insanity or asylums',
    result: 'Zero',
    control: 'All 10 “institution” hits found',
  },
  {
    searched: '1935, 1950 and 1965 statutes + contemporaneous SSA accounts',
    lookedFor: 'Any stated reason for the exclusion',
    result: 'None at any step',
    control: 'Rule itself located in each',
  },
  {
    searched: '43 FR 45204, first 400 pages',
    lookedFor: '“16 beds” in the 1978 IMD definition',
    result: 'Zero',
    control: 'Page 45204 confirmed present in the extract',
  },
  {
    searched: 'Every CFR amendment to the IMD definition, 1978–1996',
    lookedFor: 'When the regulation acquired the number',
    result: '1991 — after the statute',
    control: 'Amendment chain read in full',
  },
  {
    searched: 'Pre-1978 regulation (45 CFR 248.60)',
    lookedFor: 'Whether any earlier bed count existed',
    result: 'Not searched — no CFR before 1996 is online',
    control: '—',
  },
  {
    searched: 'All 394 House + 497 Senate roll calls, 89th Congress; all 513 Senate amendments',
    lookedFor: 'Any vote on the IMD exclusion',
    result: 'Zero',
    control: '13 other amendment roll calls found',
  },
  {
    searched: 'MACPAC Report to Congress on IMDs (128 pages)',
    lookedFor: 'Any rationale for the figure 16',
    result: '2 mentions, both descriptive',
    control: '“beds” → 15 hits',
  },
  {
    searched: '2025 SUPPORT Act reauthorisation, all six text versions',
    lookedFor: 'Any IMD or Medicaid provision',
    result: 'Zero',
    control: '“opioid” → 36 hits',
  },
  {
    searched: 'CRS report IF10222 · congress.gov',
    lookedFor: 'Congressional intent for the threshold',
    result: 'Unmeasured — bot wall, not bypassed',
    control: '—',
  },
];

/**
 * The Pierce correction. This one matters because the site itself used to
 * carry the causal version, and because it is the single most repeated
 * claim about the exclusion's origin.
 */
export const PIERCE_CORRECTION =
  'The familiar story — that Congress excluded asylums because President Pierce established in 1854 that they are a state responsibility — is a reconstruction by later scholars. Pierce’s veto is real and says what it is quoted as saying. But no 1935, 1950 or 1965 primary document reached here connects the two, and the 1935 record actively cuts against it: those drafters were legislating about almshouses and never mentioned insanity at all.';

export const RECORD_CAVEATS =
  'Stated so you can discount them yourself. Vote sourcing: GovTrack draws its pre-1990 roll calls from Voteview, so they are one lineage, not two. The 1965 totals and the two conference-report party splits are independently confirmed by SSA’s official tally page; the 1965 passage-vote party splits rest on the Voteview lineage alone. Voteview’s member-level file and its own summary field also disagree by one vote on several 1965 and 1972 roll calls — official tallies are shown throughout. Bill status: congress.gov is bot-walled, so this came from GovInfo BILLSTATUS, the same Library of Congress feed, with as-of dates between November 2025 and June 2026; very recent committee action would not appear. Not established: no document connects the 1976 SSI 16-resident figure to the 1988 Medicaid number — that remains a hypothesis. The pre-1978 regulation was never searched, because no CFR earlier than 1996 is online; nor were the 1966 Handbook of Public Assistance Administration, the 1975–76 field instructions, or the 1982 State Medicaid Manual, each of which MACPAC records as carrying an IMD definition. So “16 had no regulatory predecessor” is proven for 1978–1991 and unmeasured before that. Sponsorship of the 1950 and 1972 bills is single-sourced.';

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
  /* --- Added 2026-09-02. Each was fetched and read in full that day: the
     executive order's operative text was term-counted, the Bazelon comment
     was read across all six of its pages, and the §1396n text was read at
     the Community First Choice subsection. --- */
  {
    name: 'Executive Order 14321 — Ending Crime and Disorder on America’s Streets',
    org: 'The White House (signed 24 July 2025)',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/07/ending-crime-and-disorder-on-americas-streets/',
    kind: 'primary',
    used: 'The order’s operative text, source of the section 1 quotation and of every term count on this page.',
  },
  {
    name: 'Executive Order 14321, 90 FR 35817 (29 July 2025)',
    org: 'Office of the Federal Register',
    url: 'https://www.federalregister.gov/documents/2025/07/29/2025-14391/ending-crime-and-disorder-on-americas-streets',
    kind: 'primary',
    used: 'The published citation for the same order, and where its executive-order number is assigned.',
  },
  {
    name: 'Comments on the California BH-CONNECT demonstration addendum',
    org: 'Judge David L. Bazelon Center for Mental Health Law (30 August 2024)',
    url: 'https://www.bazelon.org/wp-content/uploads/2024/09/Bazelon-comment-CA-1115-BH-Connect-FINAL.pdf',
    kind: 'advocacy',
    used: 'The verbatim defence of the exclusion quoted in the debate section, and the Olmstead, section 504 and linear-continuum arguments behind it.',
  },
  {
    name: '42 U.S.C. §1396n — Community First Choice and section 1915 authorities',
    org: 'Office of the Law Revision Counsel, U.S. House of Representatives',
    url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section1396n&num=0&edition=prelim',
    kind: 'primary',
    used: 'Subsection (k), where an institution for mental diseases is excluded from what counts as a home or community setting — the reason the definition and the age bar are different sentences to amend.',
  },
  /* --- The legislative record. Added 2026-09-01 with the accountability
     report; each was fetched and read that day. Statutes at Large and the
     Federal Register are served as PDFs, which is why some are large. --- */
  {
    name: 'P.L. 89-97, 79 Stat. 286 — Social Security Amendments of 1965',
    org: 'U.S. Government Publishing Office (Statutes at Large)',
    url: 'https://www.govinfo.gov/content/pkg/STATUTE-79/pdf/STATUTE-79-Pg286.pdf',
    kind: 'primary',
    used: 'The enacted text creating Medicaid, and the clause excluding both tuberculosis and mental-disease institutions.',
  },
  {
    name: 'P.L. 81-734, 64 Stat. 477 — Social Security Act Amendments of 1950',
    org: 'U.S. Government Publishing Office (Statutes at Large)',
    url: 'https://www.govinfo.gov/content/pkg/STATUTE-64/pdf/STATUTE-64-Pg477.pdf',
    kind: 'primary',
    used: 'Section 303(a), 64 Stat. 549 — where the exclusion actually begins, fifteen years before Medicaid.',
  },
  {
    name: 'P.L. 74-271, 49 Stat. 620 — Social Security Act of 1935',
    org: 'U.S. Government Publishing Office (Statutes at Large)',
    url: 'https://www.govinfo.gov/content/pkg/STATUTE-49/pdf/STATUTE-49-Pg620.pdf',
    kind: 'primary',
    used: 'The original "inmate of a public institution" rule, which names no psychiatric facility.',
  },
  {
    name: 'P.L. 100-360, 102 Stat. 683 — Medicare Catastrophic Coverage Act of 1988',
    org: 'U.S. Government Publishing Office (Statutes at Large)',
    url: 'https://www.govinfo.gov/content/pkg/STATUTE-102/pdf/STATUTE-102-Pg683.pdf',
    kind: 'primary',
    used: 'Section 411(k)(14)(A), 102 Stat. 798-799 — the technical correction that put "16" in the statute.',
  },
  {
    name: '43 FR 45204 (29 September 1978) — the first IMD definition',
    org: 'Office of the Federal Register',
    url: 'https://www.govinfo.gov/content/pkg/FR-1978-09-29/pdf/FR-1978-09-29.pdf',
    kind: 'primary',
    used: 'The rule that defined an IMD by "overall character" and set no bed count. Warning: this is the whole day\'s Federal Register, about 126 MB — not a mobile download.',
  },
  {
    name: '43 FR 55379 (28 November 1978) — the SSI community-residence rule',
    org: 'Office of the Federal Register',
    url: 'https://www.govinfo.gov/content/pkg/FR-1978-11-28/pdf/FR-1978-11-28.pdf',
    kind: 'primary',
    used: 'The nearest thing to an official statement about the figure: Congress "envisions a 16 resident capacity as an outer limit". Published two months after the IMD rule that had no bed count at all — same agency, same year. Warning: the whole day\'s Federal Register, about 96 MB.',
  },
  {
    name: 'SSR 79-8 — publicly operated community residences serving no more than 16 residents',
    org: 'Social Security Administration',
    url: 'https://www.ssa.gov/OP_Home/rulings/ssi/01/SSR79-08-ssi-01.html',
    kind: 'primary',
    used: "SSA's own ruling on the 16-resident threshold. Gives the deinstitutionalization purpose behind small residences and never justifies the number. Rescinded 1986.",
  },
  {
    name: 'Legislative history, 1960',
    org: 'Social Security Administration',
    url: 'https://www.ssa.gov/history/1960.html',
    kind: 'primary',
    used: 'The Long amendment of 23 August 1960 and its removal in conference the next day.',
  },
  {
    name: 'Vote tallies for passage of Medicare in 1965',
    org: 'Social Security Administration',
    url: 'https://www.ssa.gov/history/tally65.html',
    kind: 'primary',
    used: 'Official House and Senate tallies on H.R. 6675.',
  },
  {
    name: '42 U.S.C. §1382 — SSI and public institutions',
    org: 'Legal Information Institute, Cornell Law School',
    url: 'https://www.law.cornell.edu/uscode/text/42/1382',
    kind: 'primary',
    used: 'The parallel benefit rule for a person residing in a public institution.',
  },
  {
    name: "Budgetary Effects of Policies to Modify or Eliminate Medicaid's IMD Exclusion",
    org: 'Congressional Budget Office (April 2023)',
    url: 'https://www.cbo.gov/publication/59071',
    kind: 'government',
    used: 'Ten-year federal cost of each repeal option, including the $38.4 billion full-repeal estimate.',
  },
  {
    name: 'Congressional roll-call database',
    org: 'Voteview (UCLA)',
    url: 'https://voteview.com/data',
    kind: 'research',
    used: 'Roll-call tallies and the party splits computed from member cast codes.',
  },
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

  lines.push('## Executive Order 14321 and the statute (added 2026-09-02)');
  lines.push(
    `${EXECUTIVE_ORDER.number}, "${EXECUTIVE_ORDER.title}", signed ${EXECUTIVE_ORDER.signed}, published ${EXECUTIVE_ORDER.published} at ${EXECUTIVE_ORDER.citation}.`,
  );
  lines.push(`${EXECUTIVE_ORDER.purposeCite}, verbatim: "${EXECUTIVE_ORDER.purposeQuote}"`);
  for (const pr of EXECUTIVE_ORDER.provisions) lines.push(`- ${pr.cite}: ${pr.what}`);
  lines.push(
    `Term counts in the order's OPERATIVE text, measured ${EXECUTIVE_ORDER.retrieved}. Present: ${EXECUTIVE_ORDER.present.map((t) => `"${t.term}" ${t.count}`).join(', ')}. Absent: ${EXECUTIVE_ORDER.absent.map((t) => `"${t.term}" ${t.count}`).join(', ')}. The present counts are the control that proves the search worked. The single "Medicaid" string anywhere on that web page is a headline in the site's own navigation menu, not a word in the order.`,
  );
  lines.push(EXECUTIVE_ORDER.reading);
  lines.push(`IMPORTANT LIMIT ON THIS COMPARISON: ${EXECUTIVE_ORDER.limit}`);
  lines.push('');

  lines.push('## Why the number is 16 (most asked question)');
  for (const d of WHY_SIXTEEN.documented) lines.push(`- ${d.claim} (${d.sourceName})`);
  lines.push(`- WHAT IS NOT DOCUMENTED: ${WHY_SIXTEEN.notDocumented}`);
  lines.push(
    `NEAREST THING TO A RATIONALE (and it is a purpose, not a derivation): ${WHY_SIXTEEN.nearest.finding} ${WHY_SIXTEEN.nearest.caution} Source: ${WHY_SIXTEEN.nearest.sourceName}.`,
  );
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
  lines.push(BILLS_COMPOSITION);
  lines.push('');

  lines.push('## Which sentence actually has to change');
  lines.push(FIX.lede);
  for (const pt of FIX.points) lines.push(`- ${pt}`);
  lines.push(FIX.arithmetic);
  lines.push(
    `${FIX.inference.label}: ${FIX.inference.body} ${FIX.inference.caution} Present this as an inference and never as an established finding.`,
  );
  lines.push('');

  lines.push('## The argument both ways');
  lines.push(`FOR CHANGE (${ARGUMENTS.repeal.sourceName}):`);
  for (const p of ARGUMENTS.repeal.points) lines.push(`- ${p}`);
  lines.push(`FOR KEEPING IT (${ARGUMENTS.keep.sourceName}):`);
  for (const p of ARGUMENTS.keep.points) lines.push(`- ${p}`);
  lines.push(
    `THE OBJECTION IN ITS OWN WORDS (${OBJECTION.attribution}). Context sentence: "${OBJECTION.quoteContext}" Then, verbatim: "${OBJECTION.quote}"`,
  );
  for (const sup of OBJECTION.supporting) lines.push(`- ${sup.claim} (${sup.note})`);
  lines.push(`${OBJECTION_ANSWER.heading}: ${OBJECTION_ANSWER.lede}`);
  for (const pt of OBJECTION_ANSWER.points) lines.push(`- ${pt}`);
  lines.push(OBJECTION_ANSWER.scope);
  lines.push('');

  // The accountability record. Without this block the assistant would be
  // blind to a whole section of the page it is supposed to answer from,
  // and would tell a reader the site does not cover something it does.
  lines.push('## The legislative record — who actually built the rule');
  lines.push(`SCOPE OF THE RULE: ${RECORD_SCOPE}`);
  for (const f of RECORD_FINDINGS) lines.push(`- ${f.claim} ${f.detail} (${f.sourceName})`);

  lines.push('Lineage, verified against the enacted statute at each step:');
  for (const s of LINEAGE) {
    lines.push(
      `${s.year} — ${s.title}. ${s.body}${s.after ? ` ${s.after}` : ''} (${s.sourceName})`,
    );
  }

  lines.push('Where the number 16 came from, in order:');
  for (const s of NUMBER_CHAIN) lines.push(`${s.year} — ${s.title}. ${s.what}`);
  lines.push(`${NUMBER_VERDICT.heading}: ${NUMBER_VERDICT.body} ${NUMBER_VERDICT.placementNote}`);

  lines.push('Recorded votes on the measures that carried this rule:');
  for (const r of ROLL_CALLS) {
    const split = r.dem && r.rep ? ` Democrats ${r.dem}, Republicans ${r.rep}.` : '';
    lines.push(`${r.year} ${r.chamber} — ${r.measure}: ${r.tally}.${split} ${r.split}.`);
  }
  lines.push(`IMPORTANT — none of those is a vote on the exclusion: ${VOTE_CAVEAT}`);
  lines.push(`${NEGATIVE_METHOD.heading}: ${NEGATIVE_METHOD.body} ${NEGATIVE_METHOD.control}`);

  for (const n of RECORD_NAMED) lines.push(`- ${n.who}: ${n.what}`);
  for (const n of RECORD_UNIDENTIFIED) lines.push(`- ${n.who} (${n.role}): ${n.what}`);
  lines.push(`WHAT THE RECORD DOES NOT SHOW: ${RECORD_UNKNOWNS}`);

  lines.push('Why it survives — CBO Publication 59071, April 2023, net federal cost 2024-2033:');
  for (const o of CBO_OPTIONS) lines.push(`- ${o.option}: ${o.cost}. ${o.status}.`);
  lines.push(PRICE_VERDICT);
  lines.push(`${CLOSEST_CALL.heading}: ${CLOSEST_CALL.body}`);
  lines.push(LIVE_BILLS_NOTE);

  lines.push(`WHICH PARTY DID THIS: ${PARTY_VERDICT.lede}`);
  for (const p of PARTY_VERDICT.points) lines.push(`- ${p}`);
  lines.push(PARTY_VERDICT.conclusion);

  lines.push('Measured absences — each searched with a control proving the method could find it:');
  for (const a of MEASURED_ABSENCES) {
    lines.push(`- ${a.searched} → looked for ${a.lookedFor} → ${a.result} (control: ${a.control})`);
  }
  lines.push(`PIERCE CORRECTION: ${PIERCE_CORRECTION}`);
  lines.push(`CAVEATS: ${RECORD_CAVEATS}`);

  lines.push(
    `All of the above is on the page itself, in section 04b. The same research is also published as a ${REPORT.pages}-page PDF at ${REPORT.href} for citing and printing — but the page is complete on its own, so never tell a reader they must download the PDF to get the answer. If someone asks who wrote the 16-bed paragraph, or why the number is 16, say plainly that the record does not name a drafter and gives no rationale. Do not guess at a person or a reason.`,
  );
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
