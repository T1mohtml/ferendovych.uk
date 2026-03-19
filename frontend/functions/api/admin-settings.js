const ensureSettingsTable = async (env) => {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
};

const upsertSetting = async (env, key, value) => {
  await env.DB.prepare(
    `INSERT INTO site_settings (key, value, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(key, value).run();
};

const getSettings = async (env) => {
  const { results } = await env.DB.prepare(
    `SELECT key, value FROM site_settings WHERE key IN ('guestbook_locked', 'guestbook_lock_message')`
  ).run();

  const map = new Map((results || []).map((row) => [row.key, row.value]));
  return {
    guestbook_locked: map.get('guestbook_locked') === '1',
    guestbook_lock_message: map.get('guestbook_lock_message') || 'Guestbook is temporarily locked by admin.',
  };
};

const isAuthorized = (request, env) => {
  const adminKey = request.headers.get('Admin-Key');
  return Boolean(env.ADMIN_PASSWORD) && adminKey === env.ADMIN_PASSWORD;
};

export const onRequestGet = async ({ request, env }) => {
  try {
    if (!isAuthorized(request, env)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await ensureSettingsTable(env);
    const settings = await getSettings(env);

    return new Response(JSON.stringify(settings), {
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

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!isAuthorized(request, env)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await ensureSettingsTable(env);

    const body = await request.json();
    const guestbookLocked = Boolean(body?.guestbookLocked);
    const guestbookLockMessage = String(body?.guestbookLockMessage || 'Guestbook is temporarily locked by admin.').trim();

    await upsertSetting(env, 'guestbook_locked', guestbookLocked ? '1' : '0');
    await upsertSetting(env, 'guestbook_lock_message', guestbookLockMessage);

    return new Response(JSON.stringify({
      message: 'Settings saved.',
      guestbook_locked: guestbookLocked,
      guestbook_lock_message: guestbookLockMessage,
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
