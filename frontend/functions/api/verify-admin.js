export const onRequestPost = async ({ request, env }) => {
  try {
    const { password } = await request.json();
    
    if (!env.ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
    }

    if (password === env.ADMIN_PASSWORD) {
       return new Response(JSON.stringify({ authenticated: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Wrong password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
