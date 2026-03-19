const ensureSettingsTable = async (env) => {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
};

export const onRequestGet = async ({ env }) => {
  try {
    await ensureSettingsTable(env);

    const { results } = await env.DB.prepare(
      `SELECT key, value FROM site_settings WHERE key IN ('guestbook_locked', 'guestbook_lock_message')`
    ).run();

    const map = new Map((results || []).map((row) => [row.key, row.value]));

    return new Response(JSON.stringify({
      guestbookLocked: map.get('guestbook_locked') === '1',
      guestbookLockMessage: map.get('guestbook_lock_message') || 'Guestbook is temporarily locked by admin.',
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
