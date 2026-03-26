import { requireAdminAuth } from './_admin-auth.js';

const ensureNamesTableSchema = async (env) => {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ip_address TEXT,
      country TEXT,
      city TEXT,
      user_agent TEXT,
      asn TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  const { results } = await env.DB.prepare('PRAGMA table_info(names)').run();
  const existingColumns = new Set((results || []).map((col) => col.name));
  if (!existingColumns.has('ip_address')) {
    await env.DB.prepare('ALTER TABLE names ADD COLUMN ip_address TEXT').run();
  }

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
};

export const onRequestPost = async ({ request, env }) => {
  try {
    const unauthorizedResponse = await requireAdminAuth(request, env);
    if (unauthorizedResponse) return unauthorizedResponse;

    await ensureNamesTableSchema(env);

    const { ip } = await request.json();
    const normalizedIp = String(ip || '').trim();
    if (!normalizedIp) {
      return new Response(JSON.stringify({ error: 'IP address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { success, meta } = await env.DB.prepare('DELETE FROM names WHERE ip_address = ?')
      .bind(normalizedIp)
      .run();

    if (!success) {
      throw new Error('Failed to delete names for this IP');
    }

    await env.DB.prepare(
      `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind('admin_delete_names_by_ip', 'admin', 'panel', normalizedIp, `deleted=${meta?.changes ?? 0}`, 'ok').run();

    return new Response(JSON.stringify({
      message: `Deleted entries for ${normalizedIp}`,
      deleted: meta?.changes ?? 0,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
