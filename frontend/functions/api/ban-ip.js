export const onRequestPost = async ({ request, env }) => {
  try {
    const adminKey = request.headers.get("Admin-Key");
    
    if (!env.ADMIN_PASSWORD || adminKey !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { ip, reason } = await request.json();

    if (!ip) {
      return new Response(JSON.stringify({ error: "IP address is required" }), { status: 400 });
    }

    const { success } = await env.DB.prepare(
      "INSERT OR IGNORE INTO banned_ips (ip_address, reason) VALUES (?, ?)"
    )
      .bind(ip, reason || "Banned from Admin panel")
      .run();

    if (success) {
      return new Response(JSON.stringify({ message: `IP ${ip} banned successfully` }), { status: 200 });
    } else {
      throw new Error("Failed to ban IP");
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
