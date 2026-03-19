export const onRequestGet = async ({ request, env }) => {
  try {
    const adminKey = request.headers.get("Admin-Key");
    const isAdmin = adminKey && adminKey === env.ADMIN_PASSWORD;

    const query = isAdmin 
      ? "SELECT id, name, ip_address, country, created_at FROM names ORDER BY created_at DESC"
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
