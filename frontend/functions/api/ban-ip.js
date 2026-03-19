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

    const adminKey = request.headers.get("Admin-Key");
    
    if (!env.ADMIN_PASSWORD || adminKey !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { ip, reason, durationValue, durationUnit } = await request.json();

    if (!ip) {
      return new Response(JSON.stringify({ error: "IP address is required" }), { status: 400 });
    }

    const normalizedIp = String(ip).trim();
    if (!normalizedIp) {
      return new Response(JSON.stringify({ error: "IP address is required" }), { status: 400 });
    }

    const parsedDurationValue = Number(durationValue);
    const validUnits = ["minutes", "hours", "days", "weeks", "permanent"];
    const unit = validUnits.includes(durationUnit) ? durationUnit : "days";

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

    const finalReason = String(reason || "Banned from Admin panel").trim() || "Banned from Admin panel";

    const { success } = await env.DB.prepare(
      `INSERT INTO banned_ips (ip_address, reason, expires_at)
       VALUES (?, ?, ?)
       ON CONFLICT(ip_address) DO UPDATE SET
         reason = excluded.reason,
         expires_at = excluded.expires_at,
         created_at = CURRENT_TIMESTAMP`
    )
      .bind(normalizedIp, finalReason, expiresAt)
      .run();

    if (success) {
      return new Response(JSON.stringify({
        message: `IP ${normalizedIp} banned successfully`,
        ban: {
          ip: normalizedIp,
          reason: finalReason,
          expires_at: expiresAt,
        },
      }), { status: 200 });
    } else {
      throw new Error("Failed to ban IP");
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
