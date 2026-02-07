// This Map lives in the Worker's memory (RAM)
const strikeTracker = new Map();

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const path = url.pathname.toLowerCase();

  // The "Sensitive" paths that normal users shouldn't be spamming
  const forbiddenPaths = ['.env', '.git', '/config', '/stripe', '/wp-admin', '/etc/'];
  const isForbidden = forbiddenPaths.some(p => path.includes(p));

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