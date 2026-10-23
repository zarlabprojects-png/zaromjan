// Cloudflare Pages Function — ব্যাকগ্রাউন্ড গান (একই KV binding: VISITS)
//
// GET    /api/music?id=...  -> গান স্ট্রিম (Range সাপোর্ট আছে — iPhone/Safari-তে সিক করার জন্য জরুরি)
// POST   /api/music         -> নতুন গান আপলোড (শুধু Owner), রেসপন্স: { id }
//                              header: content-type = audio/*, x-file-name = গানের ফাইলের নাম (encodeURIComponent)
// DELETE /api/music?id=...  -> গান মুছে ফেলা (শুধু Owner)
const PASSWORD_HASH = '1792cfdcb47bc5e50cd8ebd8cdd5baf5100d4850ee7364d58c9f3b2cf66edca4';
const ID_RE = /^[a-z0-9-]{8,40}$/;
const TYPES = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/flac'];
const MAX_BYTES = 20 * 1024 * 1024; // KV এর সীমা 25MB

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function checkOwner(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  const fk = 'fail:' + ip;
  let fails = 0;
  try { fails = parseInt((await env.VISITS.get(fk)) || '0', 10) || 0; } catch (_) {}
  if (fails >= 10) return 'blocked';
  const given = await sha256(request.headers.get('x-owner-password') || '');
  let expected = null;
  try { expected = await env.VISITS.get('pwhash'); } catch (_) {}
  if (!expected) expected = env.OWNER_PASSWORD ? await sha256(env.OWNER_PASSWORD) : PASSWORD_HASH;
  if (given === expected) return 'ok';
  try { await env.VISITS.put(fk, String(fails + 1), { expirationTtl: 600 }); } catch (_) {}
  return 'bad';
}

export async function onRequest({ request, env }) {
  const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
  if (!env.VISITS) return json({ error: 'KV binding "VISITS" not set' }, 500);

  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';

  if (request.method === 'GET' || request.method === 'HEAD') {
    if (!ID_RE.test(id)) return json({ error: 'bad id' }, 400);
    const { value, metadata } = await env.VISITS.getWithMetadata('music:' + id, 'arrayBuffer');
    if (!value) return json({ error: 'not found' }, 404);
    const total = value.byteLength;
    const base = {
      'content-type': (metadata && metadata.ct) || 'audio/mpeg',
      'accept-ranges': 'bytes',
      'cache-control': 'public, max-age=31536000, immutable',
    };
    const range = request.headers.get('range');
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (m && (m[1] !== '' || m[2] !== '')) {
      let start, end;
      if (m[1] === '') { start = Math.max(0, total - parseInt(m[2], 10)); end = total - 1; }
      else { start = parseInt(m[1], 10); end = m[2] === '' ? total - 1 : Math.min(parseInt(m[2], 10), total - 1); }
      if (start > end || start >= total) {
        return new Response(null, { status: 416, headers: { ...base, 'content-range': 'bytes */' + total } });
      }
      return new Response(request.method === 'HEAD' ? null : value.slice(start, end + 1), {
        status: 206,
        headers: { ...base, 'content-range': 'bytes ' + start + '-' + end + '/' + total, 'content-length': String(end - start + 1) },
      });
    }
    return new Response(request.method === 'HEAD' ? null : value, { headers: { ...base, 'content-length': String(total) } });
  }

  if (request.method === 'POST' || request.method === 'DELETE') {
    const a = await checkOwner(request, env);
    if (a === 'blocked') return json({ error: 'too many attempts' }, 429);
    if (a !== 'ok') return json({ error: 'unauthorized' }, 401);

    if (request.method === 'DELETE') {
      if (!ID_RE.test(id)) return json({ error: 'bad id' }, 400);
      await env.VISITS.delete('music:' + id);
      return json({ ok: true });
    }

    const ct = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!TYPES.includes(ct)) return json({ error: 'unsupported type' }, 415);
    const buf = await request.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) return json({ error: 'bad size (max 20MB)' }, 413);
    const newId = crypto.randomUUID();
    await env.VISITS.put('music:' + newId, buf, { metadata: { ct } });
    return json({ id: newId, size: buf.byteLength });
  }

  return json({ error: 'method not allowed' }, 405);
}
