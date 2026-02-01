export const onRequestDelete = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    // Security Check: Verify the Admin-Key header
    const adminKey = request.headers.get("Admin-Key");
    const correctKey = env.ADMIN_PASSWORD;

    if (!correctKey) {
      return new Response(JSON.stringify({ error: "Server misconfiguration: ADMIN_PASSWORD not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (adminKey !== correctKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { success } = await env.DB.prepare(
      "DELETE FROM names WHERE id = ?"
    )
      .bind(id)
      .run();

    if (success) {
      return new Response(JSON.stringify({ message: "Name deleted successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Failed to delete");
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
