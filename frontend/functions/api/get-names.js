export const onRequestGet = async ({ request, env }) => {
  try {
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

    const { results: nameColumns } = await env.DB.prepare("PRAGMA table_info(names)").run();
    const existingColumns = new Set((nameColumns || []).map((col) => col.name));

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

    const adminKey = request.headers.get("Admin-Key");
    const isAdmin = adminKey && adminKey === env.ADMIN_PASSWORD;

    const query = isAdmin 
      ? "SELECT id, name, ip_address, country, city, user_agent, asn, created_at FROM names ORDER BY created_at DESC"
      : "SELECT id, name, created_at FROM names ORDER BY created_at DESC";

    const { results } = await env.DB.prepare(query).run();

    return new Response(JSON.stringify(results), {
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
