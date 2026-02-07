export async function onRequest(context) { // god i love messing with SKIDs
  const { request, env } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || 'Unknown';
  const ip = request.headers.get('CF-Connecting-IP') || 'Unknown';

  // --- 1. FILTERS ---
  const isStatic = url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|txt|json)$/);
  const isInternalAPI = url.pathname.startsWith('/api/');
  const isCrawler = /bot|spider|crawl|slurp|index|lighthouse/i.test(userAgent) || request.cf?.botManagement?.verifiedBot;
  
  // Detect FFuF / Go-client / Probes
  const isSkidTool = /Go-http-client|python-requests|curl|wget|headless/i.test(userAgent);
  const isSkidProbe = [
    '.env', '.git', '.php', '.sql', 'stripe', 'config', 'database', 'admin'
  ].some(p => url.pathname.toLowerCase().includes(p));

  const isActuallySkid = isSkidTool || isSkidProbe;

  // --- 2. DISCORD LOGGING ---
  // We only log if it's NOT a static file and NOT a verified crawler (Google)
  if (env.DISCORD_WEBHOOK_URL && !isStatic && !isCrawler && !isInternalAPI) {
    const country = request.cf?.country || 'Unknown';
    const city = request.cf?.city || 'Unknown';

    const payload = {
      username: isActuallySkid ? "🚨 SKID DETECTOR" : "👤 Visitor Log",
      embeds: [{
        title: isActuallySkid ? "‼️ ATTACK ATTEMPT" : "✅ Human Visit",
        description: isActuallySkid ? `Skid detected probing for: \`${url.pathname}\`` : `Normal visit to \`${url.pathname}\``,
        color: isActuallySkid ? 0xff0000 : 0x3498db,
        fields: [
          { name: "Location", value: `${city}, ${country}`, inline: true },
          { name: "IP", value: `||${ip}||`, inline: true },
          { name: "User-Agent", value: userAgent.slice(0, 100), inline: false }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    context.waitUntil(
      fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  }

  // --- 3. THE HONEYTRAP (Embarrassment Logic) ---
  // If they are skidding, we proceed but set a "shame" cookie
  let response = await context.next();

  if (isActuallySkid) {
    // Set a cookie that lasts 24 hours to tag this person as a skid
    response.headers.append('Set-Cookie', 'visitor_type=skid; Path=/; Max-Age=86400');
  }

  return response;
}