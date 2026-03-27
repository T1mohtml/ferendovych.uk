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
    if (!bannedColumnNames.has("ban_type")) {
      await env.DB.prepare("ALTER TABLE banned_ips ADD COLUMN ban_type TEXT").run();
      await env.DB.prepare("UPDATE banned_ips SET ban_type = 'full' WHERE ban_type IS NULL OR trim(ban_type) = ''").run();
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
    if (!asnColumnNames.has("ban_type")) {
      await env.DB.prepare("ALTER TABLE banned_asns ADD COLUMN ban_type TEXT").run();
      await env.DB.prepare("UPDATE banned_asns SET ban_type = 'full' WHERE ban_type IS NULL OR trim(ban_type) = ''").run();
    }

    const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
    const rawAsn = String(request.cf?.asn || "").trim().toUpperCase().replace(/^AS/, '');
    const decimalMatch = rawAsn.match(/^(\d+)\.0+$/);
    const normalizedDigits = decimalMatch ? decimalMatch[1] : rawAsn;
    const asn = /^\d{1,10}$/.test(normalizedDigits) ? `AS${normalizedDigits}` : '';

    await env.DB.prepare(
      "DELETE FROM banned_ips WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
    ).run();
    await env.DB.prepare(
      "DELETE FROM banned_asns WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
    ).run();

    const { results } = await env.DB.prepare(
      `SELECT ip_address, reason, expires_at, created_at, COALESCE(ban_type, 'full') AS ban_type
       FROM banned_ips
       WHERE ip_address = ?
       AND COALESCE(ban_type, 'full') = 'full'
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
        ban_type: ban.ban_type || 'full',
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (asn) {
      const asnDigitsOnly = asn.slice(2);
      const { results: asnResults } = await env.DB.prepare(
        `SELECT asn, reason, expires_at, created_at, COALESCE(ban_type, 'full') AS ban_type
         FROM banned_asns
         WHERE asn IN (?, ?)
         AND COALESCE(ban_type, 'full') = 'full'
         AND (expires_at IS NULL OR datetime(expires_at) > datetime('now'))
         LIMIT 1`
      ).bind(asn, asnDigitsOnly).run();

      if (asnResults && asnResults.length > 0) {
        const ban = asnResults[0];
        return new Response(JSON.stringify({
          banned: true,
          asn: ban.asn,
          reason: ban.reason || "Your network provider is banned.",
          expires_at: ban.expires_at,
          created_at: ban.created_at,
          ban_type: ban.ban_type || 'full',
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
