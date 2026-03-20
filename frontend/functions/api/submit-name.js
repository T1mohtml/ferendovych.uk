import { badWords } from '../bad-words.js';

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

  const { results } = await env.DB.prepare("PRAGMA table_info(names)").run();
  const existingColumns = new Set((results || []).map((col) => col.name));

  const missingColumns = [
    ["ip_address", "TEXT"],
    ["country", "TEXT"],
    ["city", "TEXT"],
    ["user_agent", "TEXT"],
    ["asn", "TEXT"],
  ].filter(([columnName]) => !existingColumns.has(columnName));

  for (const [columnName, columnType] of missingColumns) {
    await env.DB.prepare(`ALTER TABLE names ADD COLUMN ${columnName} ${columnType}`).run();
  }
};

const ensureSettingsTableSchema = async (env) => {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
};

const ensureSecurityTables = async (env) => {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS banned_asns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asn TEXT NOT NULL UNIQUE,
      reason TEXT,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  const { results: asnCols } = await env.DB.prepare("PRAGMA table_info(banned_asns)").run();
  const asnColumnNames = new Set((asnCols || []).map((col) => col.name));
  if (!asnColumnNames.has("expires_at")) {
    await env.DB.prepare("ALTER TABLE banned_asns ADD COLUMN expires_at TIMESTAMP").run();
  }

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

const logOperation = async (env, { opName, actorType, actor, target, details, status }) => {
  try {
    await env.DB.prepare(
      `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(opName, actorType || null, actor || null, target || null, details || null, status || 'ok').run();
  } catch {
    // ignore logging failures
  }
};

const getSubnetKey = (ip) => {
  if (!ip) return 'unknown';

  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
    }
  }

  if (ip.includes(':')) {
    const parts = ip.split(':').filter(Boolean).slice(0, 4);
    if (parts.length > 0) {
      return `${parts.join(':')}::/64`;
    }
  }

  return `raw:${ip}`;
};

const addOffenseScore = async (env, ip, delta, reason) => {
  const normalizedIp = String(ip || '').trim();
  if (!normalizedIp) return { score: 0, autoBanned: false };

  const { results } = await env.DB.prepare(
    "SELECT score, last_event FROM abuse_scores WHERE ip_address = ? LIMIT 1"
  ).bind(normalizedIp).run();

  const current = results?.[0];
  const currentScore = Number(current?.score || 0);
  const now = Date.now();
  const lastEventTs = current?.last_event ? new Date(current.last_event).getTime() : now;
  const decaySteps = Math.max(0, Math.floor((now - lastEventTs) / (6 * 60 * 60 * 1000)));
  const decayedScore = Math.max(0, currentScore - decaySteps);
  const newScore = decayedScore + Math.max(0, Number(delta) || 0);

  await env.DB.prepare(
    `INSERT INTO abuse_scores (ip_address, score, last_event)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(ip_address) DO UPDATE SET
       score = excluded.score,
       last_event = CURRENT_TIMESTAMP`
  ).bind(normalizedIp, newScore).run();

  if (newScore >= 8) {
    const expiresAt = new Date(now + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await env.DB.prepare(
      `INSERT INTO banned_ips (ip_address, reason, expires_at)
       VALUES (?, ?, ?)
       ON CONFLICT(ip_address) DO UPDATE SET
         reason = excluded.reason,
         expires_at = excluded.expires_at,
         created_at = CURRENT_TIMESTAMP`
    ).bind(normalizedIp, `Auto-ban: ${reason} (abuse score ${newScore})`, expiresAt).run();

    return { score: newScore, autoBanned: true, expiresAt };
  }

  return { score: newScore, autoBanned: false };
};

const parseDurationToken = (rawToken) => {
  const token = String(rawToken || '').trim().toLowerCase();
  if (!token) return { durationValue: 7, durationUnit: 'days' };
  if (token === 'permanent' || token === 'perm') return { durationValue: null, durationUnit: 'permanent' };

  const match = token.match(/^(\d+)(m|h|d|w)$/);
  if (!match) return null;

  const value = Number(match[1]);
  const unitMap = {
    m: 'minutes',
    h: 'hours',
    d: 'days',
    w: 'weeks',
  };

  return {
    durationValue: value,
    durationUnit: unitMap[match[2]],
  };
};

const computeExpiresAt = (durationValue, durationUnit) => {
  if (durationUnit === 'permanent') return null;

  const multipliers = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };

  const multiplier = multipliers[durationUnit];
  if (!multiplier || !Number.isFinite(durationValue) || durationValue <= 0) return null;

  return new Date(Date.now() + durationValue * multiplier).toISOString().slice(0, 19).replace('T', ' ');
};

const handleInlineBanCommand = async ({ env, ip, name, asn, logOperation }) => {
  const raw = String(name || '').trim();
  const lower = raw.toLowerCase();
  const isIpCommand = lower.startsWith('/ban-ip ');
  const isAsnCommand = lower.startsWith('/ban-asn ');

  if (!isIpCommand && !isAsnCommand) {
    return null;
  }

  const parts = raw.split(/\s+/);
  const adminPass = parts[1] || '';

  if (!env.ADMIN_PASSWORD || adminPass !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized command.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const target = String(parts[2] || '').trim();
  if (!target) {
    return new Response(JSON.stringify({ error: 'Target is required. Use /ban-ip <admin-pass> <ip> [7d|12h|30m|2w|permanent] [reason]' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let duration = parseDurationToken(parts[3]);
  let reasonStartIndex = 4;

  if (!duration && parts[3]) {
    duration = { durationValue: 7, durationUnit: 'days' };
    reasonStartIndex = 3;
  }

  if (!duration) {
    duration = { durationValue: 7, durationUnit: 'days' };
    reasonStartIndex = 3;
  }

  const reason = parts.slice(reasonStartIndex).join(' ').trim() || 'Banned via inline command';
  const expiresAt = computeExpiresAt(duration.durationValue, duration.durationUnit);

  if (isIpCommand) {
    await env.DB.prepare(
      `INSERT INTO banned_ips (ip_address, reason, expires_at)
       VALUES (?, ?, ?)
       ON CONFLICT(ip_address) DO UPDATE SET
         reason = excluded.reason,
         expires_at = excluded.expires_at,
         created_at = CURRENT_TIMESTAMP`
    ).bind(target, reason, expiresAt).run();

    await logOperation(env, {
      opName: 'inline_ban_ip',
      actorType: 'admin_inline',
      actor: ip,
      target,
      details: `${reason};expires_at=${expiresAt || 'permanent'}`,
      status: 'ok',
    });

    return new Response(JSON.stringify({
      message: `Inline command executed: IP ${target} banned (${expiresAt ? duration.durationValue + ' ' + duration.durationUnit : 'permanent'}).`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const normalizedAsn = target.toUpperCase();
  await env.DB.prepare(
    `INSERT INTO banned_asns (asn, reason, expires_at)
     VALUES (?, ?, ?)
     ON CONFLICT(asn) DO UPDATE SET
       reason = excluded.reason,
       expires_at = excluded.expires_at,
       created_at = CURRENT_TIMESTAMP`
  ).bind(normalizedAsn, reason, expiresAt).run();

  await logOperation(env, {
    opName: 'inline_ban_asn',
    actorType: 'admin_inline',
    actor: ip,
    target: normalizedAsn,
    details: `${reason};expires_at=${expiresAt || 'permanent'};request_asn=${String(asn || '')}`,
    status: 'ok',
  });

  return new Response(JSON.stringify({
    message: `Inline command executed: ASN ${normalizedAsn} banned (${expiresAt ? duration.durationValue + ' ' + duration.durationUnit : 'permanent'}).`,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestPost = async ({ request, env, waitUntil }) => {
  try {
    await ensureNamesTableSchema(env);
    await ensureSettingsTableSchema(env);
    await ensureSecurityTables(env);

    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS banned_ips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT NOT NULL UNIQUE,
        reason TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();

    const { results: bannedColumns } = await env.DB.prepare("PRAGMA table_info(banned_ips)").run();
    const bannedColumnNames = new Set((bannedColumns || []).map((col) => col.name));
    if (!bannedColumnNames.has("expires_at")) {
      await env.DB.prepare("ALTER TABLE banned_ips ADD COLUMN expires_at TIMESTAMP").run();
    }

    const { name, token } = await request.json();
    const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
    const country = request.headers.get("CF-IPCountry") || request.cf?.country || "Local";
    const city = request.cf?.city || "Unknown City";
    const asn = request.cf?.asn || "Unknown ASN";
    const userAgent = request.headers.get("User-Agent") || "Unknown Device";

    const inlineCommandResponse = await handleInlineBanCommand({ env, ip, name, asn, logOperation });
    if (inlineCommandResponse) {
      return inlineCommandResponse;
    }

    await env.DB.prepare(
      "DELETE FROM banned_ips WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
    ).run();
    await env.DB.prepare(
      "DELETE FROM banned_asns WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
    ).run();

    // 0️⃣ Check Banned IPs
    const { results: banned } = await env.DB.prepare(
      `SELECT ip_address, reason, expires_at
       FROM banned_ips
       WHERE ip_address = ?
       AND (expires_at IS NULL OR datetime(expires_at) > datetime('now'))
       LIMIT 1`
    ).bind(ip).run();

    if (banned && banned.length > 0) {
      const activeBan = banned[0];
      await logOperation(env, {
        opName: 'submit_name',
        actorType: 'visitor',
        actor: ip,
        target: name,
        details: 'blocked_by_ip_ban',
        status: 'blocked',
      });
      return new Response(JSON.stringify({
        error: "You are banned from this website.",
        reason: activeBan.reason || "No reason provided.",
        expires_at: activeBan.expires_at,
      }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const { results: bannedAsns } = await env.DB.prepare(
      `SELECT asn, reason, expires_at
       FROM banned_asns
       WHERE asn = ?
       AND (expires_at IS NULL OR datetime(expires_at) > datetime('now'))
       LIMIT 1`
    ).bind(String(asn).toUpperCase()).run();

    if (bannedAsns && bannedAsns.length > 0) {
      const activeBan = bannedAsns[0];
      await logOperation(env, {
        opName: 'submit_name',
        actorType: 'visitor',
        actor: ip,
        target: String(asn),
        details: 'blocked_by_asn_ban',
        status: 'blocked',
      });
      return new Response(JSON.stringify({
        error: "Your network provider is banned from this website.",
        reason: activeBan.reason || "No reason provided.",
        expires_at: activeBan.expires_at,
      }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const { results: settings } = await env.DB.prepare(
      `SELECT key, value FROM site_settings WHERE key IN (
        'guestbook_locked',
        'guestbook_lock_message',
        'cooldown_enabled',
        'cooldown_minutes',
        'subnet_protection_enabled',
        'auto_ban_enabled'
      )`
    ).run();

    const settingsMap = new Map((settings || []).map((row) => [row.key, row.value]));
    const guestbookLocked = settingsMap.get('guestbook_locked') === '1';
    const cooldownEnabled = settingsMap.get('cooldown_enabled') !== '0';
    const cooldownMinutesRaw = Number(settingsMap.get('cooldown_minutes'));
    const cooldownMinutes = Number.isFinite(cooldownMinutesRaw) && cooldownMinutesRaw > 0 ? cooldownMinutesRaw : 5;
    const subnetProtectionEnabled = settingsMap.get('subnet_protection_enabled') !== '0';
    const autoBanEnabled = settingsMap.get('auto_ban_enabled') !== '0';

    if (guestbookLocked) {
      await logOperation(env, {
        opName: 'submit_name',
        actorType: 'visitor',
        actor: ip,
        target: name,
        details: 'blocked_guestbook_locked',
        status: 'blocked',
      });
      return new Response(JSON.stringify({
        error: settingsMap.get('guestbook_lock_message') || 'Guestbook is temporarily locked by admin.',
        code: 'GUESTBOOK_LOCKED',
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (subnetProtectionEnabled) {
      const subnetKey = getSubnetKey(ip);
      const { results: subnetRows } = await env.DB.prepare(
        "SELECT hit_count, window_start FROM subnet_rate_limits WHERE subnet_key = ? LIMIT 1"
      ).bind(subnetKey).run();

      const subnetState = subnetRows?.[0];
      const nowMs = Date.now();
      const windowMs = 10 * 60 * 1000;
      let subnetHits = 1;

      if (subnetState?.window_start) {
        const windowStartMs = new Date(subnetState.window_start).getTime();
        if (nowMs - windowStartMs <= windowMs) {
          subnetHits = Number(subnetState.hit_count || 0) + 1;
        }
      }

      await env.DB.prepare(
        `INSERT INTO subnet_rate_limits (subnet_key, hit_count, window_start)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(subnet_key) DO UPDATE SET
           hit_count = excluded.hit_count,
           window_start = CASE
             WHEN datetime(subnet_rate_limits.window_start, '+10 minutes') <= datetime('now')
               THEN CURRENT_TIMESTAMP
             ELSE subnet_rate_limits.window_start
           END`
      ).bind(subnetKey, subnetHits).run();

      if (subnetHits > 12) {
        const scoreResult = autoBanEnabled
          ? await addOffenseScore(env, ip, 2, 'subnet flooding')
          : { autoBanned: false, score: 0 };

        if (scoreResult.autoBanned) {
          return new Response(JSON.stringify({
            error: 'You are banned from this website.',
            reason: `Auto-ban triggered due to repeated abuse (score ${scoreResult.score}).`,
            expires_at: scoreResult.expiresAt,
          }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ error: 'Too many submissions from your network. Please wait and try again.' }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 1️⃣ Validate Input
    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
    }

    // 2️⃣ Filter Bad Words
    const lowerName = name.toLowerCase();
    const containsBadWord = badWords.some(word => lowerName.includes(word.toLowerCase()));
    
    if (containsBadWord) {
      const scoreResult = autoBanEnabled
        ? await addOffenseScore(env, ip, 3, 'inappropriate language')
        : { autoBanned: false, score: 0 };
      if (scoreResult.autoBanned) {
        return new Response(JSON.stringify({
          error: 'You are banned from this website.',
          reason: `Auto-ban triggered due to repeated abuse (score ${scoreResult.score}).`,
          expires_at: scoreResult.expiresAt,
        }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ error: "Please use appropriate language." }), { status: 400 });
    }

    // 3️⃣ Verify Turnstile (Captcha)
    // Only verify if the key is present in environment (allows local dev if not set)
    if (env.TURNSTILE_SECRET_KEY && token) {
      const formData = new FormData();
      formData.append('secret', env.TURNSTILE_SECRET_KEY);
      formData.append('response', token);
      formData.append('remoteip', ip);

      const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const result = await fetch(url, { body: formData, method: 'POST' });
      const outcome = await result.json();

      if (!outcome.success) {
        if (autoBanEnabled) {
          await addOffenseScore(env, ip, 1, 'captcha validation failure');
        }
        return new Response(JSON.stringify({ error: "Captcha validation failed." }), { status: 400 });
      }
    } else if (env.TURNSTILE_SECRET_KEY && !token) {
       return new Response(JSON.stringify({ error: "Captcha required." }), { status: 400 });
    }

    // 4️⃣ Rate Limiting (configurable per IP cooldown)
    if (cooldownEnabled) {
      const { results } = await env.DB.prepare(
          "SELECT created_at FROM names WHERE ip_address = ? ORDER BY created_at DESC LIMIT 1"
      ).bind(ip).run();

      if (results && results.length > 0) {
          const lastPostDate = new Date(results[0].created_at).getTime();
          const now = Date.now();
          const cooldownMs = cooldownMinutes * 60 * 1000;

          if (now - lastPostDate < cooldownMs) {
            const scoreResult = autoBanEnabled
              ? await addOffenseScore(env, ip, 2, 'rapid posting')
              : { autoBanned: false, score: 0 };

            if (scoreResult.autoBanned) {
              return new Response(JSON.stringify({
                error: 'You are banned from this website.',
                reason: `Auto-ban triggered due to repeated abuse (score ${scoreResult.score}).`,
                expires_at: scoreResult.expiresAt,
              }), { status: 403, headers: { "Content-Type": "application/json" } });
            }

            return new Response(JSON.stringify({ error: `You are posting too fast. Please wait ${cooldownMinutes} minute(s).` }), { status: 429 });
          }
      }
    }

    // 5️⃣ Save to Database
    const { success } = await env.DB.prepare(
      "INSERT INTO names (name, ip_address, country, city, user_agent, asn) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(name, ip, country, city, userAgent, asn)
      .run();

    if (success) {
      await logOperation(env, {
        opName: 'submit_name',
        actorType: 'visitor',
        actor: ip,
        target: name,
        details: `asn=${asn};country=${country}`,
        status: 'ok',
      });

      if (env.DISCORD_WEBHOOK_URL) {
        waitUntil(
          fetch(env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `📖 **New Guestbook Entry!**\n**Name:** ${name}\n**IP:** ||${ip}||`
            })
          })
        );
      }

      return new Response(JSON.stringify({ message: "Name saved successfully!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Failed to insert");
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
