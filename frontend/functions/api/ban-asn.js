export const onRequestPost = async ({ request, env }) => {
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

    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS operations_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        op_name TEXT NOT NULL,
        actor_type TEXT,
        actor TEXT,
        target TEXT,
        details TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();

    const { results: cols } = await env.DB.prepare("PRAGMA table_info(banned_asns)").run();
    const colNames = new Set((cols || []).map((col) => col.name));
    if (!colNames.has("expires_at")) {
      await env.DB.prepare("ALTER TABLE banned_asns ADD COLUMN expires_at TIMESTAMP").run();
    }

    const adminKey = request.headers.get("Admin-Key");
    if (!env.ADMIN_PASSWORD || adminKey !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { asn, reason, durationValue, durationUnit } = await request.json();
    const normalizedAsn = String(asn || '').trim().toUpperCase();

    if (!normalizedAsn) {
      return new Response(JSON.stringify({ error: "ASN is required" }), { status: 400 });
    }

    const parsedDurationValue = Number(durationValue);
    const validUnits = ["minutes", "hours", "days", "weeks", "permanent"];
    const unit = validUnits.includes(durationUnit) ? durationUnit : "days";

    if (unit !== "permanent" && (!Number.isFinite(parsedDurationValue) || parsedDurationValue <= 0)) {
      return new Response(JSON.stringify({ error: "A valid duration is required" }), { status: 400 });
    }

    let expiresAt = null;
    if (unit !== "permanent") {
      const multipliers = {
        minutes: 60 * 1000,
        hours: 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000,
        weeks: 7 * 24 * 60 * 60 * 1000,
      };
      const expires = new Date(Date.now() + parsedDurationValue * multipliers[unit]);
      expiresAt = expires.toISOString().slice(0, 19).replace("T", " ");
    }

    const finalReason = String(reason || "Banned ASN from Admin panel").trim() || "Banned ASN from Admin panel";

    const { success } = await env.DB.prepare(
      `INSERT INTO banned_asns (asn, reason, expires_at)
       VALUES (?, ?, ?)
       ON CONFLICT(asn) DO UPDATE SET
         reason = excluded.reason,
         expires_at = excluded.expires_at,
         created_at = CURRENT_TIMESTAMP`
    ).bind(normalizedAsn, finalReason, expiresAt).run();

    if (!success) {
      throw new Error("Failed to ban ASN");
    }

    await env.DB.prepare(
      `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind('admin_ban_asn', 'admin', 'panel', normalizedAsn, finalReason, 'ok').run();

    return new Response(JSON.stringify({
      message: `ASN ${normalizedAsn} banned successfully`,
      ban: {
        asn: normalizedAsn,
        reason: finalReason,
        expires_at: expiresAt,
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
