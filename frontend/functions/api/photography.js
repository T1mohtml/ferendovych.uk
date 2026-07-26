import { requireAdminAuth } from './_admin-auth.js';

const ensurePhotographyTable = async (env) => {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS photography (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      caption TEXT,
      image_data TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
};

export const onRequestGet = async ({ env }) => {
  await ensurePhotographyTable(env);

  const { results } = await env.DB.prepare(
    'SELECT id, title, caption, image_data AS imageData, mime_type AS mimeType, created_at AS createdAt FROM photography ORDER BY created_at DESC'
  ).run();

  return Response.json(results || []);
};

export const onRequestPost = async ({ request, env }) => {
  const unauthorizedResponse = await requireAdminAuth(request, env);
  if (unauthorizedResponse) return unauthorizedResponse;

  await ensurePhotographyTable(env);

  const body = await request.json().catch(() => null);
  if (!body?.imageData) {
    return Response.json({ error: 'Image is required' }, { status: 400 });
  }

  const title = String(body.title || '').trim();
  const caption = String(body.caption || '').trim();
  const imageData = String(body.imageData);
  const mimeType = String(body.mimeType || 'image/jpeg').trim() || 'image/jpeg';

  if (!imageData.startsWith('data:image/')) {
    return Response.json({ error: 'Image must be a data URL' }, { status: 400 });
  }

  await env.DB.prepare(
    'INSERT INTO photography (title, caption, image_data, mime_type) VALUES (?, ?, ?, ?)'
  ).bind(title || 'Untitled photo', caption, imageData, mimeType).run();

  return Response.json({ ok: true });
};
