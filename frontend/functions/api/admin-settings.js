const ensureSettingsTable = async (env) => {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    `SELECT key, value FROM site_settings WHERE key IN (
      'guestbook_locked',
      'guestbook_lock_message',
      'cooldown_enabled',
      'cooldown_minutes',
      'subnet_protection_enabled',
      'auto_ban_enabled'
    )`
  ).run();

  const map = new Map((results || []).map((row) => [row.key, row.value]));

  const cooldownMinutesRaw = Number(map.get('cooldown_minutes'));
  const cooldownMinutes = Number.isFinite(cooldownMinutesRaw) && cooldownMinutesRaw > 0
    ? cooldownMinutesRaw
    : 5;

  return {
    guestbook_locked: map.get('guestbook_locked') === '1',
    guestbook_lock_message: map.get('guestbook_lock_message') || 'Guestbook is temporarily locked by admin.',
    cooldown_enabled: map.get('cooldown_enabled') !== '0',
    cooldown_minutes: cooldownMinutes,
    subnet_protection_enabled: map.get('subnet_protection_enabled') !== '0',
    auto_ban_enabled: map.get('auto_ban_enabled') !== '0',
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
    const cooldownEnabled = body?.cooldownEnabled !== false;
    const cooldownMinutesRaw = Number(body?.cooldownMinutes);
    const cooldownMinutes = Number.isFinite(cooldownMinutesRaw) && cooldownMinutesRaw > 0 ? cooldownMinutesRaw : 5;
    const subnetProtectionEnabled = body?.subnetProtectionEnabled !== false;
    const autoBanEnabled = body?.autoBanEnabled !== false;

    await upsertSetting(env, 'guestbook_locked', guestbookLocked ? '1' : '0');
    await upsertSetting(env, 'guestbook_lock_message', guestbookLockMessage);
    await upsertSetting(env, 'cooldown_enabled', cooldownEnabled ? '1' : '0');
    await upsertSetting(env, 'cooldown_minutes', String(cooldownMinutes));
    await upsertSetting(env, 'subnet_protection_enabled', subnetProtectionEnabled ? '1' : '0');
    await upsertSetting(env, 'auto_ban_enabled', autoBanEnabled ? '1' : '0');

    await env.DB.prepare(
      `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      'admin_save_settings',
      'admin',
      'panel',
      'site_settings',
      `locked=${guestbookLocked};cooldown=${cooldownEnabled}:${cooldownMinutes};subnet=${subnetProtectionEnabled};autoban=${autoBanEnabled}`,
      'ok'
    ).run();

    return new Response(JSON.stringify({
      message: 'Settings saved.',
      guestbook_locked: guestbookLocked,
      guestbook_lock_message: guestbookLockMessage,
      cooldown_enabled: cooldownEnabled,
      cooldown_minutes: cooldownMinutes,
      subnet_protection_enabled: subnetProtectionEnabled,
      auto_ban_enabled: autoBanEnabled,
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
