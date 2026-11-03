// webmcp-tools.js — WebMCP tool definitions for 16bedlimit.com (Tier 2, /ship Phase 1.4w).
// Loaded before /webmcp.js, which registers these with document.modelContext where available.
// Tools call the SAME JSON data paths the site itself publishes — no parallel backend:
//   get_the_rule       -> GET /api/statute       (the IMD exclusion itself, with citation)
//   get_bed_numbers    -> GET /api/beds          (psychiatric bed series + headline figures)
//   get_waiver_status  -> GET /api/waivers       (section 1115 IMD waiver status, per state)
//   list_sources       -> GET /api/sources       (every source behind the site's figures)
//   navigate_to_section -> in-page anchor navigation to one of the page's sections
// The site's question box (POST /api/chat) is deliberately NOT a tool: it spends a
// metered AI budget per call, and this ship exposes read + navigation only (see WEBMCP.md).
// Spec + rules: shared/webmcp.md in the ship skill. Inventory: WEBMCP.md in this repo.

// Opt in to the canonical usage beacon (shared/webmcp.md "Usage beacon"): the
// registrar in webmcp.js posts {event:"register"|"execute", tool names, arg KEYS
// only, path} here so real agent usage is countable in D1. Never argument values.
window.WEBMCP_BEACON_URL = '/api/webmcp-beacon';

const BED16_SECTIONS = [
  'rule',
  'order',
  'scale',
  'waivers',
  'history',
  'record',
  'instead',
  'bills',
  'medicare',
  'reentry',
  'work',
  'debate',
  'levers',
  'act',
  'sources',
  'veteran-resources',
];

async function bed16Json(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`http ${r.status}`);
  return r.json();
}

function bed16Text(obj) {
  return { content: [{ type: 'text', text: JSON.stringify(obj) }] };
}

window.WEBMCP_TOOLS = [
  {
    name: 'get_the_rule',
    description:
      "Get the rule this site explains: Medicaid's Institution for Mental Diseases (IMD) exclusion — the statutory definition of an IMD and the payment exclusion itself, each with its U.S. Code citation and source, plus the site's citation caveat and retrieval date.",
    webmcpClass: 'answer',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      try {
        const d = await bed16Json('/api/statute');
        return bed16Text({
          definition: d.definitionText,
          definition_citation: d.definitionCite,
          definition_source: d.definitionSource,
          exclusion: d.exclusionText,
          exclusion_citation: d.exclusionCite,
          exclusion_source: d.exclusionSource,
          citation_caveat: d.citationCaveat,
          retrieved: d.retrieved,
        });
      } catch {
        return { error: 'statute lookup failed' };
      }
    },
  },
  {
    name: 'get_bed_numbers',
    description:
      "Get the site's psychiatric bed numbers: the headline figures (peak year and beds, latest year and beds, percentage decline) and the full measured bed-count series. Measured census and survey years only — no interpolation.",
    webmcpClass: 'answer',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      try {
        const d = await bed16Json('/api/beds');
        return bed16Text({
          headline: d.headline,
          note: d.note,
          series: d.series,
          retrieved: d.retrieved,
        });
      } catch {
        return { error: 'bed numbers lookup failed' };
      }
    },
  },
  {
    name: 'get_waiver_status',
    description:
      "Get section 1115 IMD waiver status: which states hold approved or pending waivers for substance-use-disorder (SUD) and serious-mental-illness (SMI) treatment, as of the tracker's date. Pass a two-letter state code to get just that state's status.",
    webmcpClass: 'answer',
    inputSchema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          description: "Optional two-letter US state code, e.g. 'NY'. Omit for all states.",
        },
      },
    },
    execute: async ({ state } = {}) => {
      try {
        const d = await bed16Json('/api/waivers');
        const sud = d.substanceUseDisorder || { approved: [], pending: [] };
        const smi = d.mentalHealth || { approved: [], pending: [] };
        const status = (lists, code) =>
          lists.approved.includes(code)
            ? 'approved'
            : lists.pending.includes(code)
              ? 'pending'
              : 'none';
        const code = String(state || '')
          .trim()
          .toUpperCase();
        if (code) {
          if (!/^[A-Z]{2}$/.test(code)) return { error: 'state must be a two-letter code' };
          return bed16Text({
            state: code,
            substance_use_disorder_waiver: status(sud, code),
            serious_mental_illness_waiver: status(smi, code),
            as_of: d.asOf,
            source: d.source,
            source_name: d.sourceName,
            note: d.note,
            retrieved: d.retrieved,
          });
        }
        return bed16Text({
          as_of: d.asOf,
          substance_use_disorder: sud,
          serious_mental_illness: smi,
          source: d.source,
          source_name: d.sourceName,
          tracker: d.tracker,
          note: d.note,
          retrieved: d.retrieved,
        });
      } catch {
        return { error: 'waiver status lookup failed' };
      }
    },
  },
  {
    name: 'list_sources',
    description:
      "List every source behind this site's figures (Congressional Research Service, MACPAC, Treatment Advocacy Center, Bureau of Justice Statistics, KFF and others), with links — the same source list the site's Sources section publishes.",
    webmcpClass: 'answer',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      try {
        const d = await bed16Json('/api/sources');
        return bed16Text({ sources: d.sources, retrieved: d.retrieved });
      } catch {
        return { error: 'source list lookup failed' };
      }
    },
  },
  {
    name: 'navigate_to_section',
    description:
      "Navigate the visitor's browser to a section of this page by its anchor id. Allowed sections: rule, order, scale, waivers, history, record, instead, bills, medicare, reentry, work, debate, levers, act, sources, veteran-resources.",
    webmcpClass: 'action',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: "Section anchor id, e.g. 'waivers' or 'sources'",
        },
      },
      required: ['section'],
    },
    execute: async ({ section } = {}) => {
      const id = String(section || '')
        .trim()
        .toLowerCase();
      if (!BED16_SECTIONS.includes(id)) return { error: `unknown section: ${id}` };
      const el = document.getElementById(id);
      if (!el) return { error: 'section not on this page' };
      window.location.hash = id;
      if (typeof el.scrollIntoView === 'function') el.scrollIntoView();
      return bed16Text({ navigated: `#${id}` });
    },
  },
];
