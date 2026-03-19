export const onRequestGet = async ({ request, env }) => {
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS banned_ips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT NOT NULL UNIQUE,
        reason TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();

    const { results: bannedColumns } = await env.DB.prepare("PRAGMA table_info(banned_ips)").run();
    const bannedColumnNames = new Set((bannedColumns || []).map((col) => col.name));
    if (!bannedColumnNames.has("expires_at")) {
      await env.DB.prepare("ALTER TABLE banned_ips ADD COLUMN expires_at TIMESTAMP").run();
    }

    const adminKey = request.headers.get("Admin-Key");

    if (!env.ADMIN_PASSWORD || adminKey !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await env.DB.prepare(
      "DELETE FROM banned_ips WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
    ).run();

    const { results } = await env.DB.prepare(
      `SELECT id, ip_address, reason, expires_at, created_at
       FROM banned_ips
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
