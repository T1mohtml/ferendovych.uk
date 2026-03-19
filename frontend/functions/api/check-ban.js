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

    const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";

    await env.DB.prepare(
      "DELETE FROM banned_ips WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
    ).run();

    const { results } = await env.DB.prepare(
      `SELECT ip_address, reason, expires_at, created_at
       FROM banned_ips
       WHERE ip_address = ?
       AND (expires_at IS NULL OR datetime(expires_at) > datetime('now'))
       LIMIT 1`
    ).bind(ip).run();

    if (results && results.length > 0) {
      const ban = results[0];
      return new Response(JSON.stringify({
        banned: true,
        ip: ban.ip_address,
        reason: ban.reason || "You are banned.",
        expires_at: ban.expires_at,
        created_at: ban.created_at,
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ banned: false }), {
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
