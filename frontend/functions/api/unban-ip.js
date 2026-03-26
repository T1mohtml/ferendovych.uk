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

    const unauthorizedResponse = await requireAdminAuth(request, env);
    if (unauthorizedResponse) return unauthorizedResponse;

    const { ip } = await request.json();
    if (!ip) {
      return new Response(JSON.stringify({ error: "IP address is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const normalizedIp = String(ip).trim();
    if (!isValidIpAddress(normalizedIp)) {
      return new Response(JSON.stringify({ error: "Invalid IP address format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { success } = await env.DB.prepare("DELETE FROM banned_ips WHERE ip_address = ?")
      .bind(normalizedIp)
      .run();

    if (!success) {
      throw new Error("Failed to unban IP");
    }

    await env.DB.prepare(
      `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind('admin_unban_ip', 'admin', 'panel', normalizedIp, 'manual_unban', 'ok').run();

    return new Response(JSON.stringify({ message: `IP ${ip} unbanned successfully` }), {
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
