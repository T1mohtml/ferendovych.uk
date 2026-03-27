import { requireAdminAuth } from './_admin-auth.js';

const normalizeAsn = (input) => {
  const cleaned = String(input || '').trim().toUpperCase().replace(/^AS/, '');
  if (!cleaned) return null;

  const decimalMatch = cleaned.match(/^(\d+)\.0+$/);
  const normalizedDigits = decimalMatch ? decimalMatch[1] : cleaned;

  if (!/^\d{1,10}$/.test(normalizedDigits)) return null;
  return `AS${normalizedDigits}`;
};

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
    if (!colNames.has("ban_type")) {
      await env.DB.prepare("ALTER TABLE banned_asns ADD COLUMN ban_type TEXT").run();
      await env.DB.prepare("UPDATE banned_asns SET ban_type = 'full' WHERE ban_type IS NULL OR trim(ban_type) = ''").run();
    }

    const unauthorizedResponse = await requireAdminAuth(request, env);
    if (unauthorizedResponse) return unauthorizedResponse;

    const payload = await request.json();
    const { asn, reason, durationValue, durationUnit, banType } = payload || {};
    const normalizedAsn = normalizeAsn(asn);
    const finalBanType = banType === 'shadow' ? 'shadow' : 'full';

    if (!normalizedAsn) {
      return new Response(JSON.stringify({ error: "Valid ASN is required (example: AS13335)" }), { status: 400 });
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

    const finalReason = (String(reason || "Banned ASN from Admin panel").trim() || "Banned ASN from Admin panel").slice(0, 220);

    const { success } = await env.DB.prepare(
      `INSERT INTO banned_asns (asn, reason, expires_at, ban_type)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(asn) DO UPDATE SET
         reason = excluded.reason,
         expires_at = excluded.expires_at,
         ban_type = excluded.ban_type,
         created_at = CURRENT_TIMESTAMP`
    ).bind(normalizedAsn, finalReason, expiresAt, finalBanType).run();

    if (!success) {
      throw new Error("Failed to ban ASN");
    }

    await env.DB.prepare(
      `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind('admin_ban_asn', 'admin', 'panel', normalizedAsn, `${finalReason};type=${finalBanType}`, 'ok').run();

    return new Response(JSON.stringify({
      message: `ASN ${normalizedAsn} ${finalBanType === 'shadow' ? 'shadow banned' : 'fully banned'} successfully`,
      ban: {
        asn: normalizedAsn,
        reason: finalReason,
        expires_at: expiresAt,
        ban_type: finalBanType,
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
