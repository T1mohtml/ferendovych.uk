// This Map lives in the Worker's memory (RAM)
const strikeTracker = new Map();
let requestEventsTableInitPromise = null;

const ensureRequestEventsTable = (env) => {
  if (!env?.DB) return Promise.resolve();

  if (!requestEventsTableInitPromise) {
    requestEventsTableInitPromise = (async () => {
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
    })().catch(() => {
      requestEventsTableInitPromise = null;
    });
  }

  return requestEventsTableInitPromise;
};

const shouldTrackRequest = (request) => {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  const method = request.method.toUpperCase();

  if (!['GET', 'POST'].includes(method)) return false;
  if (path.startsWith('/favicon') || path.startsWith('/robots.txt')) return false;

  // Skip static assets to keep analytics focused and lightweight.
  if (/\.(css|js|map|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|mp4|webm)$/i.test(path)) {
    return false;
  }

  return true;
};

const logRequestEvent = async (request, env) => {
  if (!env?.DB || !shouldTrackRequest(request)) return;

  await ensureRequestEventsTable(env);

  const url = new URL(request.url);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const country = request.headers.get('cf-ipcountry') || request.cf?.country || null;
  const city = request.cf?.city || null;
  const asn = String(request.cf?.asn || '');

  await env.DB.prepare(
    `INSERT INTO request_events (ip_address, path, method, user_agent, country, city, asn)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(ip, url.pathname, request.method.toUpperCase(), userAgent, country, city, asn).run();

  // Keep table bounded.
  await env.DB.prepare(
    "DELETE FROM request_events WHERE datetime(created_at) < datetime('now', '-24 hours')"
  ).run();
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const path = url.pathname.toLowerCase();

  // The "Sensitive" paths that normal users shouldn't be spamming
  const forbiddenPaths = ['.env', '.git', '/config', '/stripe', '/wp-admin', '/etc/'];
  const isForbidden = forbiddenPaths.some(p => path.includes(p));

  context.waitUntil(logRequestEvent(request, env));

  if (isForbidden) {
    const now = Date.now();
    const visitorData = strikeTracker.get(ip) || { count: 0, lastHit: 0 };

    // If their last hit was more than 10 seconds ago, reset their strikes
    if (now - visitorData.lastHit > 10000) {
      visitorData.count = 0;
    }

    visitorData.count += 1;
    visitorData.lastHit = now;
    strikeTracker.set(ip, visitorData);

    // STRIKE 3: The Trap Snaps
    if (visitorData.count >= 3) {
      // Send Discord Alert
      context.waitUntil(
        fetch(env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **SKID BANNED (3 STRIKES)** 🚨\n**IP:** \`${ip}\`\n**Last Path:** \`${path}\`\n**Action:** FBI Screen Deployed.`
          })
        })
      );

      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': 'visitor_type=skid; Path=/; Max-Age=86400; SameSite=Lax',
        },
      });
    }

    // Strike 1 or 2: Just a 404 (The "Warning Shots")
    return new Response("Not Found", { status: 404 });
  }

  return context.next();
}