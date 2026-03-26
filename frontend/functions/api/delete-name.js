import { requireAdminAuth } from './_admin-auth.js';

export const onRequestDelete = async ({ request, env }) => {
  try {
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

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    const unauthorizedResponse = await requireAdminAuth(request, env);
    if (unauthorizedResponse) return unauthorizedResponse;

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
      await env.DB.prepare(
        `INSERT INTO operations_log (op_name, actor_type, actor, target, details, status)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind('admin_delete_name', 'admin', 'panel', String(id), 'delete_single_entry', 'ok').run();

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
