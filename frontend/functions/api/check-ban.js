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

    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS banned_asns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asn TEXT NOT NULL UNIQUE,
        reason TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();

    const { results: asnCols } = await env.DB.prepare("PRAGMA table_info(banned_asns)").run();
    const asnColumnNames = new Set((asnCols || []).map((col) => col.name));
    if (!asnColumnNames.has("expires_at")) {
      await env.DB.prepare("ALTER TABLE banned_asns ADD COLUMN expires_at TIMESTAMP").run();
    }

    const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
    const asn = String(request.cf?.asn || "").toUpperCase();

    await env.DB.prepare(
      "DELETE FROM banned_ips WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
    ).run();
    await env.DB.prepare(
      "DELETE FROM banned_asns WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
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

    if (asn) {
      const { results: asnResults } = await env.DB.prepare(
        `SELECT asn, reason, expires_at, created_at
         FROM banned_asns
         WHERE asn = ?
         AND (expires_at IS NULL OR datetime(expires_at) > datetime('now'))
         LIMIT 1`
      ).bind(asn).run();

      if (asnResults && asnResults.length > 0) {
        const ban = asnResults[0];
        return new Response(JSON.stringify({
          banned: true,
          asn: ban.asn,
          reason: ban.reason || "Your network provider is banned.",
          expires_at: ban.expires_at,
          created_at: ban.created_at,
        }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
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
