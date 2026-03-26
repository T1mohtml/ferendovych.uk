import { requireAdminAuth } from './_admin-auth.js';

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
      'auto_ban_enabled',
      'under_construction_enabled',
      'under_construction_title',
      'under_construction_message',
      'announcement_enabled',
      'announcement_message',
      'hide_navigation_enabled'
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
    under_construction_enabled: map.get('under_construction_enabled') === '1',
    under_construction_title: map.get('under_construction_title') || 'Under Construction',
    under_construction_message: map.get('under_construction_message') || 'This website is currently under construction. Please check back soon.',
    announcement_enabled: map.get('announcement_enabled') === '1',
    announcement_message: map.get('announcement_message') || '',
    hide_navigation_enabled: map.get('hide_navigation_enabled') === '1',
  };
};

export const onRequestGet = async ({ request, env }) => {
  try {
    const unauthorizedResponse = await requireAdminAuth(request, env);
    if (unauthorizedResponse) return unauthorizedResponse;

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
    const unauthorizedResponse = await requireAdminAuth(request, env);
    if (unauthorizedResponse) return unauthorizedResponse;

    await ensureSettingsTable(env);

    const body = await request.json();
    const guestbookLocked = Boolean(body?.guestbookLocked);
    const guestbookLockMessage = String(body?.guestbookLockMessage || 'Guestbook is temporarily locked by admin.').trim();
    const cooldownEnabled = body?.cooldownEnabled !== false;
    const cooldownMinutesRaw = Number(body?.cooldownMinutes);
    const cooldownMinutes = Number.isFinite(cooldownMinutesRaw) && cooldownMinutesRaw > 0 ? cooldownMinutesRaw : 5;
    const subnetProtectionEnabled = body?.subnetProtectionEnabled !== false;
    const autoBanEnabled = body?.autoBanEnabled !== false;
    const underConstructionEnabled = body?.underConstructionEnabled === true;
    const underConstructionTitle = String(body?.underConstructionTitle || 'Under Construction').trim() || 'Under Construction';
    const underConstructionMessage = String(body?.underConstructionMessage || 'This website is currently under construction. Please check back soon.').trim() || 'This website is currently under construction. Please check back soon.';
    const announcementEnabled = body?.announcementEnabled === true;
    const announcementMessage = String(body?.announcementMessage || '').trim();
    const hideNavigationEnabled = body?.hideNavigationEnabled === true;

    await upsertSetting(env, 'guestbook_locked', guestbookLocked ? '1' : '0');
    await upsertSetting(env, 'guestbook_lock_message', guestbookLockMessage);
    await upsertSetting(env, 'cooldown_enabled', cooldownEnabled ? '1' : '0');
    await upsertSetting(env, 'cooldown_minutes', String(cooldownMinutes));
    await upsertSetting(env, 'subnet_protection_enabled', subnetProtectionEnabled ? '1' : '0');
    await upsertSetting(env, 'auto_ban_enabled', autoBanEnabled ? '1' : '0');
    await upsertSetting(env, 'under_construction_enabled', underConstructionEnabled ? '1' : '0');
    await upsertSetting(env, 'under_construction_title', underConstructionTitle);
    await upsertSetting(env, 'under_construction_message', underConstructionMessage);
    await upsertSetting(env, 'announcement_enabled', announcementEnabled ? '1' : '0');
    await upsertSetting(env, 'announcement_message', announcementMessage);
    await upsertSetting(env, 'hide_navigation_enabled', hideNavigationEnabled ? '1' : '0');

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
      under_construction_enabled: underConstructionEnabled,
      under_construction_title: underConstructionTitle,
      under_construction_message: underConstructionMessage,
      announcement_enabled: announcementEnabled,
      announcement_message: announcementMessage,
      hide_navigation_enabled: hideNavigationEnabled,
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
