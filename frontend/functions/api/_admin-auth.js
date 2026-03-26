const textEncoder = new TextEncoder();

const toBase64Url = (bytes) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64Url = (value) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const timingSafeEqual = (a, b) => {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
};

const getAuthSecret = (env) => String(env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || '');

const signPayload = async (payloadB64, secret) => {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(payloadB64));
  return toBase64Url(new Uint8Array(signature));
};

export const issueAdminToken = async (env, ttlSeconds = 2 * 60 * 60) => {
  const secret = getAuthSecret(env);
  if (!secret) throw new Error('Admin auth secret is not configured');

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    scope: 'admin',
    iat: now,
    exp: now + ttlSeconds,
  };

  const payloadB64 = toBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const signatureB64 = await signPayload(payloadB64, secret);
  return `${payloadB64}.${signatureB64}`;
};

const verifyAdminToken = async (token, env) => {
  const secret = getAuthSecret(env);
  if (!secret || !token || !token.includes('.')) return false;

  const [payloadB64, providedSig] = token.split('.');
  if (!payloadB64 || !providedSig) return false;

  const expectedSig = await signPayload(payloadB64, secret);
  if (!timingSafeEqual(expectedSig, providedSig)) return false;

  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadB64));
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);
    return payload?.scope === 'admin' && Number(payload?.exp) > now;
  } catch {
    return false;
  }
};

export const isAdminAuthorized = async (request, env) => {
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (await verifyAdminToken(token, env)) return true;
  }

  const adminKey = request.headers.get('Admin-Key');
  return Boolean(env.ADMIN_PASSWORD) && adminKey === env.ADMIN_PASSWORD;
};

export const requireAdminAuth = async (request, env) => {
  const ok = await isAdminAuthorized(request, env);
  if (ok) return null;

  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
};
