import { badWords } from '../bad-words.js';

export const onRequestPost = async ({ request, env, waitUntil }) => {
  try {
    const { name, token } = await request.json();
    const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";

    // 1️⃣ Validate Input
    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
    }

    // 2️⃣ Filter Bad Words
    const lowerName = name.toLowerCase();
    const containsBadWord = badWords.some(word => lowerName.includes(word.toLowerCase()));
    
    if (containsBadWord) {
        return new Response(JSON.stringify({ error: "Please use appropriate language." }), { status: 400 });
    }

    // 3️⃣ Verify Turnstile (Captcha)
    // Only verify if the key is present in environment (allows local dev if not set)
    if (env.TURNSTILE_SECRET_KEY && token) {
      const formData = new FormData();
      formData.append('secret', env.TURNSTILE_SECRET_KEY);
      formData.append('response', token);
      formData.append('remoteip', ip);

      const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const result = await fetch(url, { body: formData, method: 'POST' });
      const outcome = await result.json();

      if (!outcome.success) {
        return new Response(JSON.stringify({ error: "Captcha validation failed." }), { status: 400 });
      }
    } else if (env.TURNSTILE_SECRET_KEY && !token) {
       return new Response(JSON.stringify({ error: "Captcha required." }), { status: 400 });
    }

    // 4️⃣ Rate Limiting (1 post per 5 minutes per IP)
    // Select the latest post from this IP
    const { results } = await env.DB.prepare(
        "SELECT created_at FROM names WHERE ip_address = ? ORDER BY created_at DESC LIMIT 1"
    ).bind(ip).run();

    if (results && results.length > 0) {
        const lastPostDate = new Date(results[0].created_at).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - lastPostDate < fiveMinutes) {
            return new Response(JSON.stringify({ error: "You are posting too fast. Please wait 5 minutes." }), { status: 429 });
        }
    }

    // 5️⃣ Save to Database
    const { success } = await env.DB.prepare(
      "INSERT INTO names (name, ip_address) VALUES (?, ?)"
    )
      .bind(name, ip)
      .run();

    if (success) {
      if (env.DISCORD_WEBHOOK_URL) {
        waitUntil(
          fetch(env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `📖 **New Guestbook Entry!**\n**Name:** ${name}\n**IP:** ||${ip}||`
            })
          })
        );
      }

      return new Response(JSON.stringify({ message: "Name saved successfully!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Failed to insert");
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
