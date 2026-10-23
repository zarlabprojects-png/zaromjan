// Cloudflare Pages Function — Owner লগইন যাচাই ও পাসওয়ার্ড বদল
//
// POST   /api/auth                  -> পাসওয়ার্ড (x-owner-password) ঠিক থাকলে { ok: true }
// PUT    /api/auth  {newPassword}   -> পাসওয়ার্ড বদল (পুরনোটা হেডারে দিতে হবে), KV-তে শুধু হ্যাশ থাকে
// DELETE /api/auth                  -> প্যানেলে সেট করা পাসওয়ার্ড মুছে OWNER_PASSWORD / ডিফল্টে ফেরা
const PASSWORD_HASH = '1792cfdcb47bc5e50cd8ebd8cdd5baf5100d4850ee7364d58c9f3b2cf66edca4';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function checkOwner(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  const fk = 'fail:' + ip;
  let fails = 0;
  if (env.VISITS) { try { fails = parseInt((await env.VISITS.get(fk)) || '0', 10) || 0; } catch (_) {} }
  if (fails >= 10) return 'blocked';
  const given = await sha256(request.headers.get('x-owner-password') || '');
  let expected = null;
  if (env.VISITS) { try { expected = await env.VISITS.get('pwhash'); } catch (_) {} }
  if (!expected) expected = env.OWNER_PASSWORD ? await sha256(env.OWNER_PASSWORD) : PASSWORD_HASH;
  if (given === expected) {
    if (env.VISITS && fails) { try { await env.VISITS.delete(fk); } catch (_) {} }
    return 'ok';
  }
  if (env.VISITS) { try { await env.VISITS.put(fk, String(fails + 1), { expirationTtl: 600 }); } catch (_) {} }
  return 'bad';
}

export async function onRequest({ request, env }) {
  const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
  if (!['POST', 'PUT', 'DELETE'].includes(request.method)) return json({ error: 'method not allowed' }, 405);

  const a = await checkOwner(request, env);
  if (a === 'blocked') return json({ error: 'too many attempts' }, 429);
  if (a !== 'ok') return json({ error: 'unauthorized' }, 401);

  if (request.method === 'POST') return json({ ok: true, kv: !!env.VISITS });

  if (!env.VISITS) return json({ error: 'KV binding "VISITS" not set' }, 500);

  if (request.method === 'DELETE') {
    await env.VISITS.delete('pwhash');
    return json({ ok: true });
  }

  let body;
  try { body = await request.json(); } catch (_) { return json({ error: 'bad json' }, 400); }
  const np = body && typeof body.newPassword === 'string' ? body.newPassword : '';
  if (np.length < 6 || np.length > 100) return json({ error: 'password must be 6-100 characters' }, 400);
  await env.VISITS.put('pwhash', await sha256(np));
  return json({ ok: true });
}
