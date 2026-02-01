export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, created_at FROM names ORDER BY created_at DESC"
    ).run();

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
