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

    const { success } = await env.DB.prepare('DELETE FROM names').run();
    if (!success) {
      throw new Error('Failed to delete all names');
    }

    await env.DB.prepare(
      `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind('admin_delete_all_names', 'admin', 'panel', 'names', 'truncate_names_table', 'ok').run();

    return new Response(JSON.stringify({ message: 'All guestbook names deleted.' }), {
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
