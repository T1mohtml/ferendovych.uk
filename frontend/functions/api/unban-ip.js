export const onRequestPost = async ({ request, env }) => {
  try {
    const adminKey = request.headers.get("Admin-Key");

    if (!env.ADMIN_PASSWORD || adminKey !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { ip } = await request.json();
    if (!ip) {
      return new Response(JSON.stringify({ error: "IP address is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { success } = await env.DB.prepare("DELETE FROM banned_ips WHERE ip_address = ?")
      .bind(String(ip).trim())
      .run();

    if (!success) {
      throw new Error("Failed to unban IP");
    }

    return new Response(JSON.stringify({ message: `IP ${ip} unbanned successfully` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
