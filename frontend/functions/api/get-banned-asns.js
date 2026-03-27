import { requireAdminAuth } from './_admin-auth.js';

export const onRequestGet = async ({ request, env }) => {
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS banned_asns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asn TEXT NOT NULL UNIQUE,
        reason TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();

    const { results: cols } = await env.DB.prepare("PRAGMA table_info(banned_asns)").run();
    const colNames = new Set((cols || []).map((col) => col.name));
    if (!colNames.has("expires_at")) {
      await env.DB.prepare("ALTER TABLE banned_asns ADD COLUMN expires_at TIMESTAMP").run();
    }
    if (!colNames.has("ban_type")) {
      await env.DB.prepare("ALTER TABLE banned_asns ADD COLUMN ban_type TEXT").run();
      await env.DB.prepare("UPDATE banned_asns SET ban_type = 'full' WHERE ban_type IS NULL OR trim(ban_type) = ''").run();
    }

    const unauthorizedResponse = await requireAdminAuth(request, env);
    if (unauthorizedResponse) return unauthorizedResponse;

    await env.DB.prepare(
      "DELETE FROM banned_asns WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
    ).run();

    const { results } = await env.DB.prepare(
      `SELECT id, asn, reason, expires_at, created_at, COALESCE(ban_type, 'full') AS ban_type
       FROM banned_asns
       WHERE expires_at IS NULL OR datetime(expires_at) > datetime('now')
       ORDER BY created_at DESC`
    ).run();

    return new Response(JSON.stringify(results || []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
