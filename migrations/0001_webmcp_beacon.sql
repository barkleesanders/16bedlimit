-- WebMCP usage beacon (/ship Phase 1.4w — see WEBMCP.md and the ship skill's
-- shared/webmcp.md "Usage beacon"). POST /api/webmcp-beacon inserts one row per
-- anonymous ping from the page's WebMCP registrar: {event: register|execute,
-- tool names, argument KEY names only, path} + the request's User-Agent.
-- Tool execution happens in the visitor's browser, so this table is the only
-- count of real agent usage. NEVER argument values, no cookies, no IPs.
-- Read-back:
--   wrangler d1 execute sixteen-bed-limit-webmcp --remote -c ./wrangler.jsonc \
--     --command "SELECT event, tool, count(*) AS n FROM webmcp_beacon_events GROUP BY event, tool"

CREATE TABLE IF NOT EXISTS webmcp_beacon_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ts         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  event      TEXT NOT NULL,             -- 'register' | 'execute'
  tool       TEXT,                      -- execute only: the tool name
  tools      TEXT,                      -- register only: JSON array of tool names
  arg_keys   TEXT,                      -- execute only: JSON array of argument key names
  path       TEXT,                      -- page path the ping came from
  user_agent TEXT                       -- which agent/browser called — the point of the beacon
);

CREATE INDEX IF NOT EXISTS webmcp_beacon_events_ts_idx ON webmcp_beacon_events (ts);
