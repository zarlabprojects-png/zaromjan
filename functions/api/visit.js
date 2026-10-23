// Cloudflare Pages Function — আসল ভিজিটর কাউন্টার
// সেটআপ: Pages প্রজেক্ট > Settings > Functions > KV namespace bindings
//         Variable name: VISITS  (একটি KV namespace সিলেক্ট করুন)
//
// GET  /api/visit -> বর্তমান সংখ্যা
// POST /api/visit -> ১ বাড়িয়ে নতুন সংখ্যা
// PUT  /api/visit -> { count: N } দিয়ে সংখ্যা সেট/রিসেট (শুধু Owner পাসওয়ার্ডসহ)
const PASSWORD_HASH = '1792cfdcb47bc5e50cd8ebd8cdd5baf5100d4850ee7364d58c9f3b2cf66edca4';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest({ request, env }) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  };

  if (!env.VISITS) {
    return new Response(JSON.stringify({ error: 'KV binding "VISITS" not set' }), { status: 500, headers });
  }

  if (request.method === 'PUT') {
    const ip = request.headers.get('cf-connecting-ip') || 'local';
    const fk = 'fail:' + ip;
    let fails = 0;
    try { fails = parseInt((await env.VISITS.get(fk)) || '0', 10) || 0; } catch (_) {}
    if (fails >= 10) return new Response(JSON.stringify({ error: 'too many attempts' }), { status: 429, headers });
    const given = await sha256(request.headers.get('x-owner-password') || '');
    let expected = null;
    try { expected = await env.VISITS.get('pwhash'); } catch (_) {}
    if (!expected) expected = env.OWNER_PASSWORD ? await sha256(env.OWNER_PASSWORD) : PASSWORD_HASH;
    if (given !== expected) {
      try { await env.VISITS.put(fk, String(fails + 1), { expirationTtl: 600 }); } catch (_) {}
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers });
    }
    let body;
    try { body = await request.json(); } catch (_) { body = null; }
    const n = body && Number.isFinite(Number(body.count)) ? Math.floor(Number(body.count)) : NaN;
    if (!(n >= 0 && n <= 1e12)) return new Response(JSON.stringify({ error: 'bad count' }), { status: 400, headers });
    await env.VISITS.put('count', String(n));
    return new Response(JSON.stringify({ count: n }), { headers });
  }

  let count = parseInt((await env.VISITS.get('count')) || '0', 10) || 0;

  if (request.method === 'POST') {
    count += 1;
    await env.VISITS.put('count', String(count));
  }

  return new Response(JSON.stringify({ count }), { headers });
}
