// Cloudflare Pages Function — Owner এডিট মোডের কনটেন্ট/সেটিংস সেভ-লোড
// KV binding: VISITS (বাকি সব ফাংশনের সাথে একই binding)
//
// GET  /api/content -> সেভ করা কনটেন্ট + সেটিংস (সবাই পড়তে পারবে)
// POST /api/content -> শুধু সঠিক Owner পাসওয়ার্ড (x-owner-password হেডার) থাকলে সেভ হবে
// DELETE /api/content -> সব কাস্টমাইজেশন মুছে ডিফল্টে ফেরা (শুধু Owner)
//
// পাসওয়ার্ড: ১) অ্যাডমিন প্যানেল থেকে বদলালে KV-তে হ্যাশ থাকে ("pwhash") — সেটাই আগে দেখা হয়
//             ২) না থাকলে Pages > Settings > Variables-এর OWNER_PASSWORD
//             ৩) তাও না থাকলে নিচের ডিফল্ট হ্যাশ
const PASSWORD_HASH = '1792cfdcb47bc5e50cd8ebd8cdd5baf5100d4850ee7364d58c9f3b2cf66edca4';
const MAX_BODY = 600000;

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ভুল পাসওয়ার্ড বারবার দিলে সাময়িক ব্লক (প্রতি IP: ১০ মিনিটে ১০ বার)
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
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
  const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers });

  if (!env.VISITS) return json({ error: 'KV binding "VISITS" not set' }, 500);

  if (request.method === 'GET') {
    const saved = await env.VISITS.get('content');
    return new Response(saved || 'null', { headers });
  }

  if (request.method === 'POST' || request.method === 'DELETE') {
    const a = await checkOwner(request, env);
    if (a === 'blocked') return json({ error: 'too many attempts' }, 429);
    if (a !== 'ok') return json({ error: 'unauthorized' }, 401);

    if (request.method === 'DELETE') {
      await env.VISITS.delete('content');
      return json({ ok: true });
    }

    const body = await request.text();
    if (body.length > MAX_BODY) return json({ error: 'too large' }, 413);
    let data;
    try { data = JSON.parse(body); } catch (_) { return json({ error: 'bad json' }, 400); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return json({ error: 'bad data' }, 400);

    await env.VISITS.put('content', JSON.stringify(data));
    return json({ ok: true });
  }

  return json({ error: 'method not allowed' }, 405);
}
