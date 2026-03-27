import { requireAdminAuth } from './_admin-auth.js';

const isValidIPv4 = (ip) => {
  const parts = String(ip || '').trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
};

const isValidIPv6 = (ip) => {
  const value = String(ip || '').trim();
  if (!value.includes(':')) return false;
  if (!/^[0-9a-fA-F:]+$/.test(value)) return false;
  const pieces = value.split(':');
  if (pieces.length < 3 || pieces.length > 8) return false;
  return true;
};

const isValidIpAddress = (ip) => isValidIPv4(ip) || isValidIPv6(ip);

export const onRequestPost = async ({ request, env }) => {
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

    const { results: bannedColumns } = await env.DB.prepare("PRAGMA table_info(banned_ips)").run();
    const bannedColumnNames = new Set((bannedColumns || []).map((col) => col.name));
    if (!bannedColumnNames.has("expires_at")) {
      await env.DB.prepare("ALTER TABLE banned_ips ADD COLUMN expires_at TIMESTAMP").run();
    }
    if (!bannedColumnNames.has("ban_type")) {
      await env.DB.prepare("ALTER TABLE banned_ips ADD COLUMN ban_type TEXT").run();
      await env.DB.prepare("UPDATE banned_ips SET ban_type = 'full' WHERE ban_type IS NULL OR trim(ban_type) = ''").run();
    }

    const unauthorizedResponse = await requireAdminAuth(request, env);
    if (unauthorizedResponse) return unauthorizedResponse;

    const payload = await request.json();
    const { ip, reason, durationValue, durationUnit, banType } = payload || {};

    if (!ip) {
      return new Response(JSON.stringify({ error: "IP address is required" }), { status: 400 });
    }

    const normalizedIp = String(ip).trim();
    if (!normalizedIp) {
      return new Response(JSON.stringify({ error: "IP address is required" }), { status: 400 });
    }

    if (!isValidIpAddress(normalizedIp)) {
      return new Response(JSON.stringify({ error: "Invalid IP address format" }), { status: 400 });
    }

    const parsedDurationValue = Number(durationValue);
    const validUnits = ["minutes", "hours", "days", "weeks", "permanent"];
    const unit = validUnits.includes(durationUnit) ? durationUnit : "days";
    const finalBanType = banType === 'shadow' ? 'shadow' : 'full';

    if (unit !== "permanent" && (!Number.isFinite(parsedDurationValue) || parsedDurationValue <= 0)) {
      return new Response(JSON.stringify({ error: "A valid duration is required" }), { status: 400 });
    }

    const now = new Date();
    let expiresAt = null;

    if (unit !== "permanent") {
      const multipliers = {
        minutes: 60 * 1000,
        hours: 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000,
        weeks: 7 * 24 * 60 * 60 * 1000,
      };

      const expires = new Date(now.getTime() + parsedDurationValue * multipliers[unit]);
      expiresAt = expires.toISOString().slice(0, 19).replace("T", " ");
    }

    const finalReason = (String(reason || "Banned from Admin panel").trim() || "Banned from Admin panel").slice(0, 220);

    const { success } = await env.DB.prepare(
      `INSERT INTO banned_ips (ip_address, reason, expires_at, ban_type)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(ip_address) DO UPDATE SET
         reason = excluded.reason,
         expires_at = excluded.expires_at,
         ban_type = excluded.ban_type,
         created_at = CURRENT_TIMESTAMP`
    )
      .bind(normalizedIp, finalReason, expiresAt, finalBanType)
      .run();

    if (success) {
      await env.DB.prepare(
        `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind('admin_ban_ip', 'admin', 'panel', normalizedIp, `${finalReason};type=${finalBanType}`, 'ok').run();

      return new Response(JSON.stringify({
        message: `IP ${normalizedIp} ${finalBanType === 'shadow' ? 'shadow banned' : 'fully banned'} successfully`,
        ban: {
          ip: normalizedIp,
          reason: finalReason,
          expires_at: expiresAt,
          ban_type: finalBanType,
        },
      }), { status: 200 });
    } else {
      throw new Error("Failed to ban IP");
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
