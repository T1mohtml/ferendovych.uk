export const onRequestPost = async ({ request, env }) => {
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS banned_asns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asn TEXT NOT NULL UNIQUE,
        reason TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();

    const adminKey = request.headers.get("Admin-Key");
    if (!env.ADMIN_PASSWORD || adminKey !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { asn } = await request.json();
    const normalizedAsn = String(asn || '').trim().toUpperCase();
    if (!normalizedAsn) {
      return new Response(JSON.stringify({ error: "ASN is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { success } = await env.DB.prepare("DELETE FROM banned_asns WHERE asn = ?")
      .bind(normalizedAsn)
      .run();

    if (!success) {
      throw new Error("Failed to unban ASN");
    }

    return new Response(JSON.stringify({ message: `ASN ${normalizedAsn} unbanned successfully` }), {
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
