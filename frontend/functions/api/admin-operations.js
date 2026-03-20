const ensureOperationsTable = async (env) => {
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

export const onRequestGet = async ({ request, env }) => {
  try {
    const adminKey = request.headers.get('Admin-Key');
    if (!env.ADMIN_PASSWORD || adminKey !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await ensureOperationsTable(env);

    const { results: recent } = await env.DB.prepare(
      `SELECT id, op_name, actor_type, actor, target, details, status, created_at
       FROM operations_log
       ORDER BY id DESC
       LIMIT 120`
    ).run();

    const { results: activeWindow } = await env.DB.prepare(
      `SELECT op_name, COUNT(*) AS count
       FROM operations_log
       WHERE datetime(created_at) >= datetime('now', '-5 minutes')
       GROUP BY op_name
       ORDER BY count DESC
       LIMIT 12`
    ).run();

    return new Response(JSON.stringify({
      window: 'last_5_minutes',
      activeOperations: activeWindow || [],
      recentOperations: recent || [],
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
