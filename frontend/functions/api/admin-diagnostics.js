const ensureBaseTables = async (env) => {
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
    `CREATE TABLE IF NOT EXISTS banned_ips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL UNIQUE,
      reason TEXT,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS banned_asns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asn TEXT NOT NULL UNIQUE,
      reason TEXT,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS abuse_scores (
      ip_address TEXT PRIMARY KEY,
      score INTEGER NOT NULL DEFAULT 0,
      last_event TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS subnet_rate_limits (
      subnet_key TEXT PRIMARY KEY,
      hit_count INTEGER NOT NULL DEFAULT 0,
      window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS request_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT,
      path TEXT,
      method TEXT,
      user_agent TEXT,
      country TEXT,
      city TEXT,
      asn TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
};

const fetchSingleNumber = async (env, query) => {
  const { results } = await env.DB.prepare(query).run();
  const row = results?.[0] || {};
  const value = Object.values(row)[0];
  return Number(value || 0);
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

    await ensureBaseTables(env);

    const [
      namesCount,
      bannedIpsCount,
      bannedAsnsCount,
      highRiskCount,
      subnetRows,
      settingsRows,
      liveUniqueVisitors5m,
      liveUniqueVisitors15m,
      pageViews5m,
      apiRequests5m,
      topPathsRows,
      recentVisitorsRows,
      trafficByCountryRows,
    ] = await Promise.all([
      fetchSingleNumber(env, 'SELECT COUNT(*) AS c FROM names'),
      fetchSingleNumber(env, "SELECT COUNT(*) AS c FROM banned_ips WHERE expires_at IS NULL OR datetime(expires_at) > datetime('now')"),
      fetchSingleNumber(env, "SELECT COUNT(*) AS c FROM banned_asns WHERE expires_at IS NULL OR datetime(expires_at) > datetime('now')"),
      fetchSingleNumber(env, 'SELECT COUNT(*) AS c FROM abuse_scores WHERE score >= 5'),
      env.DB.prepare('SELECT subnet_key, hit_count, window_start FROM subnet_rate_limits ORDER BY hit_count DESC LIMIT 8').run(),
      env.DB.prepare("SELECT key, value FROM site_settings WHERE key IN ('guestbook_locked','guestbook_lock_message','cooldown_enabled','cooldown_minutes','subnet_protection_enabled','auto_ban_enabled','under_construction_enabled','under_construction_title','under_construction_message','announcement_enabled','announcement_message','hide_navigation_enabled')").run(),
      fetchSingleNumber(env, "SELECT COUNT(DISTINCT ip_address) AS c FROM request_events WHERE datetime(created_at) >= datetime('now', '-5 minutes') AND path NOT LIKE '/api/%'"),
      fetchSingleNumber(env, "SELECT COUNT(DISTINCT ip_address) AS c FROM request_events WHERE datetime(created_at) >= datetime('now', '-15 minutes') AND path NOT LIKE '/api/%'"),
      fetchSingleNumber(env, "SELECT COUNT(*) AS c FROM request_events WHERE datetime(created_at) >= datetime('now', '-5 minutes') AND path NOT LIKE '/api/%'"),
      fetchSingleNumber(env, "SELECT COUNT(*) AS c FROM request_events WHERE datetime(created_at) >= datetime('now', '-5 minutes') AND path LIKE '/api/%'"),
      env.DB.prepare(
        `SELECT path, COUNT(*) AS hits
         FROM request_events
         WHERE datetime(created_at) >= datetime('now', '-5 minutes')
         GROUP BY path
         ORDER BY hits DESC
         LIMIT 12`
      ).run(),
      env.DB.prepare(
        `SELECT ip_address, country, city, MAX(created_at) AS last_seen, COUNT(*) AS hits_15m
         FROM request_events
         WHERE datetime(created_at) >= datetime('now', '-15 minutes')
           AND path NOT LIKE '/api/%'
         GROUP BY ip_address, country, city
         ORDER BY last_seen DESC
         LIMIT 15`
      ).run(),
      env.DB.prepare(
        `SELECT COALESCE(country, 'Unknown') AS country, COUNT(*) AS hits
         FROM request_events
         WHERE datetime(created_at) >= datetime('now', '-15 minutes')
           AND path NOT LIKE '/api/%'
         GROUP BY country
         ORDER BY hits DESC
         LIMIT 10`
      ).run(),
    ]);

    const settingsMap = new Map((settingsRows.results || []).map((row) => [row.key, row.value]));

    const diagnostics = {
      serverTime: new Date().toISOString(),
      runtime: {
        platform: 'Cloudflare Workers / Pages Functions',
        hasD1: Boolean(env.DB),
      },
      requestContext: {
        ip: request.headers.get('CF-Connecting-IP') || null,
        country: request.headers.get('CF-IPCountry') || request.cf?.country || null,
        city: request.cf?.city || null,
        asn: request.cf?.asn || null,
        colo: request.cf?.colo || null,
        tlsVersion: request.cf?.tlsVersion || null,
        httpProtocol: request.cf?.httpProtocol || null,
      },
      securityStats: {
        namesCount,
        activeIpBans: bannedIpsCount,
        activeAsnBans: bannedAsnsCount,
        highRiskIps: highRiskCount,
        busiestSubnets: subnetRows.results || [],
      },
      traffic: {
        window: {
          liveUsers5m: liveUniqueVisitors5m,
          liveUsers15m: liveUniqueVisitors15m,
          pageViews5m,
          apiRequests5m,
        },
        topPaths5m: topPathsRows.results || [],
        recentVisitors15m: recentVisitorsRows.results || [],
        countries15m: trafficByCountryRows.results || [],
      },
      settings: {
        guestbookLocked: settingsMap.get('guestbook_locked') === '1',
        guestbookLockMessage: settingsMap.get('guestbook_lock_message') || 'Guestbook is temporarily locked by admin.',
        cooldownEnabled: settingsMap.get('cooldown_enabled') !== '0',
        cooldownMinutes: Number(settingsMap.get('cooldown_minutes') || 5),
        subnetProtectionEnabled: settingsMap.get('subnet_protection_enabled') !== '0',
        autoBanEnabled: settingsMap.get('auto_ban_enabled') !== '0',
        underConstructionEnabled: settingsMap.get('under_construction_enabled') === '1',
        underConstructionTitle: settingsMap.get('under_construction_title') || 'Under Construction',
        announcementEnabled: settingsMap.get('announcement_enabled') === '1',
        hideNavigationEnabled: settingsMap.get('hide_navigation_enabled') === '1',
      },
      environmentFlags: {
        hasAdminPassword: Boolean(env.ADMIN_PASSWORD),
        hasTurnstileSecret: Boolean(env.TURNSTILE_SECRET_KEY),
        hasDiscordWebhook: Boolean(env.DISCORD_WEBHOOK_URL),
      },
    };

    return new Response(JSON.stringify(diagnostics), {
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
