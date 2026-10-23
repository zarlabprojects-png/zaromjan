// Cloudflare Pages Function — গ্যালারির ছবি সংরক্ষণ (একই KV binding: VISITS)
//
// GET    /api/photo?id=...  -> ছবি দেখানো (সবাই)
// POST   /api/photo         -> নতুন ছবি আপলোড (শুধু Owner পাসওয়ার্ডসহ), রেসপন্স: { id }
// DELETE /api/photo?id=...  -> ছবি মুছে ফেলা (শুধু Owner পাসওয়ার্ডসহ)
const PASSWORD_HASH = '1792cfdcb47bc5e50cd8ebd8cdd5baf5100d4850ee7364d58c9f3b2cf66edca4';
const ID_RE = /^[a-z0-9-]{8,40}$/;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest({ request, env }) {
  const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
  if (!env.VISITS) return json({ error: 'KV binding "VISITS" not set' }, 500);

  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';

  if (request.method === 'GET') {
    if (!ID_RE.test(id)) return json({ error: 'bad id' }, 400);
    const { value, metadata } = await env.VISITS.getWithMetadata('photo:' + id, 'arrayBuffer');
    if (!value) return json({ error: 'not found' }, 404);
    return new Response(value, {
      headers: {
        'content-type': (metadata && metadata.ct) || 'image/jpeg',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  }

  if (request.method === 'POST' || request.method === 'DELETE') {
    const given = await sha256(request.headers.get('x-owner-password') || '');
    let expected = null;
    try { expected = await env.VISITS.get('pwhash'); } catch (_) {}
    if (!expected) expected = env.OWNER_PASSWORD ? await sha256(env.OWNER_PASSWORD) : PASSWORD_HASH;
    if (given !== expected) return json({ error: 'unauthorized' }, 401);

    if (request.method === 'DELETE') {
      if (!ID_RE.test(id)) return json({ error: 'bad id' }, 400);
      await env.VISITS.delete('photo:' + id);
      return json({ ok: true });
    }

    const ct = (request.headers.get('content-type') || '').split(';')[0].trim();
    if (!TYPES.includes(ct)) return json({ error: 'unsupported type' }, 415);
    const buf = await request.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > 4 * 1024 * 1024) return json({ error: 'bad size' }, 413);
    const newId = crypto.randomUUID();
    await env.VISITS.put('photo:' + newId, buf, { metadata: { ct } });
    return json({ id: newId });
  }

  return json({ error: 'method not allowed' }, 405)
}
