const normalizeAsn = (input) => {
  const cleaned = String(input || '').trim().toUpperCase().replace(/^AS/, '');
  if (!/^\d{1,10}$/.test(cleaned)) return null;
  return `AS${cleaned}`;
};

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

    const adminKey = request.headers.get("Admin-Key");
    if (!env.ADMIN_PASSWORD || adminKey !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { asn } = await request.json();
    const normalizedAsn = normalizeAsn(asn);
    if (!normalizedAsn) {
      return new Response(JSON.stringify({ error: "Valid ASN is required (example: AS13335)" }), {
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

    await env.DB.prepare(
      `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind('admin_unban_asn', 'admin', 'panel', normalizedAsn, 'manual_unban', 'ok').run();

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
