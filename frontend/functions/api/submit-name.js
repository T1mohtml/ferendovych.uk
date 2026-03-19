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

export const onRequestPost = async ({ request, env, waitUntil }) => {
  try {
    await ensureNamesTableSchema(env);
    await ensureSettingsTableSchema(env);

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

    await env.DB.prepare(
      "DELETE FROM banned_ips WHERE expires_at IS NOT NULL AND datetime(expires_at) <= datetime('now')"
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
      return new Response(JSON.stringify({
        error: "You are banned from this website.",
        reason: activeBan.reason || "No reason provided.",
        expires_at: activeBan.expires_at,
      }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const { results: settings } = await env.DB.prepare(
      "SELECT key, value FROM site_settings WHERE key IN ('guestbook_locked', 'guestbook_lock_message')"
    ).run();

    const settingsMap = new Map((settings || []).map((row) => [row.key, row.value]));
    const guestbookLocked = settingsMap.get('guestbook_locked') === '1';

    if (guestbookLocked) {
      return new Response(JSON.stringify({
        error: settingsMap.get('guestbook_lock_message') || 'Guestbook is temporarily locked by admin.',
        code: 'GUESTBOOK_LOCKED',
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1️⃣ Validate Input
    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
    }

    // 2️⃣ Filter Bad Words
    const lowerName = name.toLowerCase();
    const containsBadWord = badWords.some(word => lowerName.includes(word.toLowerCase()));
    
    if (containsBadWord) {
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
        return new Response(JSON.stringify({ error: "Captcha validation failed." }), { status: 400 });
      }
    } else if (env.TURNSTILE_SECRET_KEY && !token) {
       return new Response(JSON.stringify({ error: "Captcha required." }), { status: 400 });
    }

    // 4️⃣ Rate Limiting (1 post per 5 minutes per IP)
    // Select the latest post from this IP
    const { results } = await env.DB.prepare(
        "SELECT created_at FROM names WHERE ip_address = ? ORDER BY created_at DESC LIMIT 1"
    ).bind(ip).run();

    if (results && results.length > 0) {
        const lastPostDate = new Date(results[0].created_at).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - lastPostDate < fiveMinutes) {
            return new Response(JSON.stringify({ error: "You are posting too fast. Please wait 5 minutes." }), { status: 429 });
        }
    }

    // 5️⃣ Save to Database
    const { success } = await env.DB.prepare(
      "INSERT INTO names (name, ip_address, country, city, user_agent, asn) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(name, ip, country, city, userAgent, asn)
      .run();

    if (success) {
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
