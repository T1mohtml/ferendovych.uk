export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Skip static assets to avoid spamming the webhook
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    return context.next();
  }

  const webhookUrl = env.DISCORD_WEBHOOK_URL;
  
  if (webhookUrl) {
    const ip = request.headers.get('CF-Connecting-IP') || 'Unknown';
    const country = request.cf?.country || 'Unknown';
    const city = request.cf?.city || 'Unknown';

    const payload = {
      embeds: [{
        title: "🌐 New Visitor",
        description: `Someone from **${city}, ${country}** is viewing \`${url.pathname}\``,
        color: 0x3498db,
        fields: [
          { name: "IP", value: ip, inline: true },
          { name: "User-Agent", value: request.headers.get('User-Agent')?.slice(0, 100) || 'Unknown', inline: false }
        ]
      }]
    };

    // We use a regular await here to ensure it sends before the function closes
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Discord Webhook Failed:", err);
    }
  }

  return context.next();
}