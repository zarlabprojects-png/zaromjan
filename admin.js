/* ===== Zar Portfolio — অ্যাডমিন সেটিংস প্যানেল (শুধু Owner লগইনের পর লোড হয়) ===== */
(function () {
  var Z = window.ZarSite, O = window.ZarOwner;
  var root = null, tab = 'general', body = null;

  var css = [
    '.zp-sheet{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(620px,100%);max-height:68vh;z-index:100008;background:var(--nm-bg);color:var(--text-main);border-radius:22px 22px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;font-family:inherit;font-size:.9rem}',
    '.zp-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 4px;font-weight:700;color:var(--gold-primary)}',
    '.zp-x{border:none;background:transparent;color:var(--text-main);font-size:1.3rem;cursor:pointer;padding:2px 8px}',
    '.zp-tabs{display:flex;gap:6px;overflow-x:auto;padding:6px 12px 8px;scrollbar-width:none}',
    '.zp-tabs button{flex:0 0 auto;border:1px solid var(--gold-primary);background:transparent;color:var(--gold-primary);border-radius:18px;padding:.3rem .8rem;font:inherit;font-weight:600;font-size:.8rem;cursor:pointer;white-space:nowrap}',
    '.zp-tabs button.on{background:var(--gold-primary);color:var(--nm-bg)}',
    '.zp-body{overflow:auto;padding:6px 14px 18px;-webkit-overflow-scrolling:touch}',
    '.zp-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:.5rem 0;border-bottom:1px solid rgba(128,128,128,.18)}',
    '.zp-row>label,.zp-lab{flex:1;min-width:0}',
    '.zp-col{display:flex;flex-direction:column;gap:4px;padding:.5rem 0;border-bottom:1px solid rgba(128,128,128,.18)}',
    '.zp-body input[type=text],.zp-body input[type=password],.zp-body input[type=date],.zp-body input[type=number],.zp-body select,.zp-body textarea{width:100%;padding:.55rem .7rem;border-radius:10px;border:1px solid rgba(128,128,128,.35);background:rgba(128,128,128,.08);color:var(--text-main);font:inherit;outline:none}',
    '.zp-body input[type=color]{width:44px;height:34px;border:none;background:none;padding:0;cursor:pointer}',
    '.zp-body input[type=range]{width:100%;accent-color:var(--gold-primary)}',
    '.zp-btn{border:none;border-radius:16px;padding:.5rem 1rem;font:inherit;font-weight:700;cursor:pointer;background:linear-gradient(135deg,var(--gold-primary),var(--pink-accent));color:#fff}',
    '.zp-btn.ghost{background:transparent;border:1px dashed var(--gold-primary);color:var(--gold-primary)}',
    '.zp-btn.red{background:#ef4444;color:#fff}',
    '.zp-btn.sm{padding:.25rem .6rem;font-size:.78rem;border-radius:10px}',
    '.zp-h{font-weight:700;color:var(--gold-primary);margin:12px 0 2px}',
    '.zp-note{font-size:.76rem;color:var(--text-muted);line-height:1.5;margin:4px 0}',
    '.zp-sw{position:relative;width:44px;height:24px;flex:0 0 auto}',
    '.zp-sw input{opacity:0;width:100%;height:100%;margin:0;position:absolute;cursor:pointer;z-index:2}',
    '.zp-sw i{position:absolute;inset:0;border-radius:14px;background:rgba(128,128,128,.4);transition:.2s}',
    '.zp-sw i:after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s}',
    '.zp-sw input:checked+i{background:var(--gold-primary)}',
    '.zp-sw input:checked+i:after{left:23px}',
    '.zp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}',
    '.zp-pal{border:1px solid rgba(128,128,128,.35);border-radius:12px;padding:8px;cursor:pointer;background:transparent;color:var(--text-main);font:inherit;text-align:left}',
    '.zp-dots{display:flex;gap:4px;margin-top:5px}.zp-dots b{width:18px;height:18px;border-radius:50%;display:block;border:1px solid rgba(0,0,0,.2)}',
    '.zp-colors{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px}',
    '.zp-colors div{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:.72rem;text-align:center}',
    '.zp-sec{display:flex;align-items:center;gap:6px;padding:.45rem 0;border-bottom:1px solid rgba(128,128,128,.18)}',
    '.zp-sec span.t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.zp-sec .tag{font-size:.68rem;color:var(--text-muted)}',
    '@media(max-width:600px){.zp-sheet{max-height:72vh}}'
  ].join('\n');

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k]; else if (k === 'class') e.className = attrs[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'value') e.value = attrs[k]; else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function live() { Z.applyDom(); }
  function toggle(checked, fn) {
    var i = h('input', { type: 'checkbox' }); i.checked = !!checked; i.addEventListener('change', function () { fn(i.checked); });
    return h('span', { class: 'zp-sw' }, [i, h('i')]);
  }
  function row(label, ctrl, note) {
    return h('div', { class: 'zp-row' }, [h('label', { class: 'zp-lab' }, [label, note ? h('div', { class: 'zp-note', text: note }) : null]), ctrl]);
  }
  function col(label, ctrl, note) {
    return h('div', { class: 'zp-col' }, [h('label', { text: label }), ctrl, note ? h('div', { class: 'zp-note', text: note }) : null]);
  }
  function textIn(val, fn, ph, type) {
    var i = h('input', { type: type || 'text', value: val || '', placeholder: ph || '' });
    i.addEventListener('input', function () { fn(i.value); }); return i;
  }
  function api(method, url, bodyObj) {
    var opt = { method: method, headers: { 'x-owner-password': O.pw() }, cache: 'no-store' };
    if (bodyObj) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(bodyObj); }
    return fetch(url, opt);
  }

  // ---------------- ট্যাব: সাধারণ ----------------
  function tGeneral(b) {
    var c = Z.cfg;
    b.appendChild(h('div', { class: 'zp-h', text: 'পেজের তথ্য' }));
    b.appendChild(col('ব্রাউজার ট্যাবের টাইটেল', textIn(c.title, function (v) { c.title = v; live(); }, document.title), 'খালি রাখলে আগের টাইটেলই থাকবে'));
    b.appendChild(col('সার্চ/শেয়ারের বিবরণ (description)', textIn(c.desc, function (v) { c.desc = v; live(); }, 'এক লাইনে নিজের পরিচয়')));
    b.appendChild(h('div', { class: 'zp-h', text: 'ব্যক্তিগত তথ্য (বয়স, vCard, ডিজিটাল কার্ড)' }));
    b.appendChild(col('জন্ম তারিখ (বয়সের হিসাবের জন্য)', (function () { var i = h('input', { type: 'date', value: c.id.birth }); i.addEventListener('change', function () { if (i.value) { c.id.birth = i.value; live(); } }); return i; })()));
    b.appendChild(row('বয়স দেখাবেন না', toggle(c.id.hideAge, function (v) { c.id.hideAge = v; live(); })));
    b.appendChild(col('ডিজিটাল কার্ডের ট্যাগলাইন', textIn(c.id.tagline, function (v) { c.id.tagline = v; })));
    b.appendChild(col('ডিজিটাল কার্ডের ঠিকানা/লোকেশন', textIn(c.id.location, function (v) { c.id.location = v; })));
    b.appendChild(col('vCard-এর নোট', textIn(c.id.note, function (v) { c.id.note = v; }), 'কেউ vCard নামালে কন্টাক্টের নোটে এটা যাবে। চাইলে ফাঁকা রাখুন।'));
    b.appendChild(h('div', { class: 'zp-note', text: 'নাম, পদবি, ফোন নম্বর, ব্যাংক — পেজের লেখায় ট্যাপ করে বদলালেই vCard/কার্ডে নিজে থেকে আপডেট হয়।' }));
    b.appendChild(h('div', { class: 'zp-h', text: 'চেহারা' }));
    var sel = h('select');
    [['', 'ডিফল্ট (Hind Siliguri)'], ['system', 'সিস্টেম ফন্ট'], ['serif', 'সেরিফ (Georgia)'], ['mono', 'মনোস্পেস']].forEach(function (o) { var op = h('option', { value: o[0], text: o[1] }); if (c.theme.font === o[0]) op.selected = true; sel.appendChild(op); });
    sel.addEventListener('change', function () { c.theme.font = sel.value; live(); });
    b.appendChild(col('ফন্ট', sel));
    var sc = h('input', { type: 'range', min: '80', max: '130', step: '5', value: String(c.theme.scale) }), scl = h('span', { text: c.theme.scale + '%' });
    sc.addEventListener('input', function () { c.theme.scale = +sc.value; scl.textContent = sc.value + '%'; live(); });
    b.appendChild(col('লেখার সাইজ', h('div', null, [sc, scl])));
    var rd = h('input', { type: 'range', min: '0', max: '40', step: '2', value: String(c.theme.radius) }), rdl = h('span', { text: c.theme.radius + 'px' });
    rd.addEventListener('input', function () { c.theme.radius = +rd.value; rdl.textContent = rd.value + 'px'; live(); });
    b.appendChild(col('কার্ডের কোণা গোল (radius)', h('div', null, [rd, rdl])));
    var dm = h('select');
    [['', 'হালকা (ডিফল্ট)'], ['dark', 'ডার্ক']].forEach(function (o) { var op = h('option', { value: o[0], text: o[1] }); if (c.theme.def === o[0]) op.selected = true; dm.appendChild(op); });
    dm.addEventListener('change', function () { c.theme.def = dm.value; live(); });
    b.appendChild(col('নতুন ভিজিটরের জন্য ডিফল্ট মোড', dm, 'যে ভিজিটর নিজে থিম বাটন চেপে বেছে নিয়েছে তার পছন্দই থাকবে।'));
  }

  // ---------------- ট্যাব: রং ----------------
  var PRESETS = [
    { n: 'আইভরি (ডিফল্ট)', l: Z.DEF_LIGHT, d: Z.DEF_DARK },
    { n: 'সাগর নীল', l: { bg: '#E3ECF3', text: '#12324A', muted: '#4F6B80', accent: '#1F6FA8', accent2: '#12324A', accent3: '#2A9D8F' }, d: { bg: '#101a24', text: '#e6f0f7', muted: '#8fa6b8', accent: '#4aa3df', accent2: '#8cc8f0', accent3: '#3cc2b0' } },
    { n: 'বন সবুজ', l: { bg: '#E4ECDF', text: '#1F3A25', muted: '#52684F', accent: '#2F7A3E', accent2: '#1F3A25', accent3: '#8A6D1F' }, d: { bg: '#141c15', text: '#e4efe2', muted: '#93a690', accent: '#5bbd6f', accent2: '#a4dcae', accent3: '#d4b24a' } },
    { n: 'গোলাপি', l: { bg: '#F3E4E6', text: '#4A1A2A', muted: '#7A5560', accent: '#B03A5B', accent2: '#4A1A2A', accent3: '#C9764A' }, d: { bg: '#1f161a', text: '#f5e6ea', muted: '#b39aa3', accent: '#e0597f', accent2: '#f2a3b8', accent3: '#e8985e' } },
    { n: 'রাজকীয় বেগুনি', l: { bg: '#E9E4F2', text: '#2E1F4A', muted: '#62577A', accent: '#6B3FA0', accent2: '#2E1F4A', accent3: '#B0457A' }, d: { bg: '#17131f', text: '#ece6f7', muted: '#a398b8', accent: '#a77be0', accent2: '#cdb4f2', accent3: '#e06aa0' } },
    { n: 'কালো-সোনালি', l: { bg: '#EFEDE8', text: '#1c1c1c', muted: '#5c5a55', accent: '#9A7414', accent2: '#1c1c1c', accent3: '#6b4e0f' }, d: { bg: '#0d0d0f', text: '#f1ece0', muted: '#9d978a', accent: '#e0b84f', accent2: '#f6d98a', accent3: '#cf8a5f' } }
  ];
  var CLAB = { bg: 'ব্যাকগ্রাউন্ড', text: 'লেখা', muted: 'হালকা লেখা', accent: 'অ্যাকসেন্ট (সোনালি)', accent2: 'হাইলাইট লেখা', accent3: 'গ্রেডিয়েন্ট' };
  function tColors(b) {
    var c = Z.cfg;
    b.appendChild(h('div', { class: 'zp-h', text: 'রেডিমেড কালার সেট' }));
    var g = h('div', { class: 'zp-grid' });
    PRESETS.forEach(function (p) {
      var dots = h('div', { class: 'zp-dots' });
      ['bg', 'accent', 'accent3', 'text'].forEach(function (k) { dots.appendChild(h('b', { style: 'background:' + p.l[k] })); });
      ['bg', 'accent'].forEach(function (k) { dots.appendChild(h('b', { style: 'background:' + p.d[k] })); });
      g.appendChild(h('button', { class: 'zp-pal', type: 'button', onclick: function () { c.theme.light = Object.assign({}, p.l); c.theme.dark = Object.assign({}, p.d); live(); draw(); } }, [h('div', { text: p.n }), dots]));
    });
    b.appendChild(g);
    [['light', '☀️ হালকা থিমের রং', Z.DEF_LIGHT], ['dark', '🌙 ডার্ক থিমের রং', Z.DEF_DARK]].forEach(function (grp) {
      b.appendChild(h('div', { class: 'zp-h', text: grp[1] }));
      var cs = h('div', { class: 'zp-colors' });
      Object.keys(grp[2]).forEach(function (k) {
        var i = h('input', { type: 'color', value: c.theme[grp[0]][k] });
        i.addEventListener('input', function () { c.theme[grp[0]][k] = i.value; live(); });
        cs.appendChild(h('div', null, [i, h('span', { text: CLAB[k] })]));
      });
      b.appendChild(cs);
      b.appendChild(h('div', { style: 'margin-top:8px' }, [h('button', { class: 'zp-btn ghost sm', type: 'button', text: 'এই থিমের রং ডিফল্টে ফেরান', onclick: function () { c.theme[grp[0]] = Object.assign({}, grp[2]); live(); draw(); } })]));
    });
    b.appendChild(h('div', { class: 'zp-note', text: 'থিম বাটনে হালকা/ডার্ক বদলে দুটোই পরীক্ষা করে দেখুন। নিউমরফিক ছায়া ব্যাকগ্রাউন্ড থেকে নিজে থেকে তৈরি হয়।' }));
  }

  // ---------------- ট্যাব: গান ----------------
  function tMusic(b) {
    var c = Z.cfg, m = c.music;
    var nameTxt = m.src === 'custom' ? (m.name || 'নিজের আপলোড করা গান') : 'ডিফল্ট গান (song.mp3)';
    if (Z.pending.music && Z.pending.music.name) nameTxt = Z.pending.music.name + ' (সেভ করলে চালু হবে)';
    b.appendChild(h('div', { class: 'zp-h', text: 'এখনকার গান' }));
    b.appendChild(h('div', { text: '🎵 ' + nameTxt }));
    var au = h('audio', { controls: 'controls', preload: 'none', style: 'width:100%;margin-top:8px' });
    au.src = Z.pending.music && Z.pending.music._url ? Z.pending.music._url : Z.musicUrl();
    b.appendChild(au);
    b.appendChild(h('div', { class: 'zp-h', text: 'নতুন গান দিন' }));
    var fi = h('input', { type: 'file', accept: 'audio/*,.mp3,.m4a,.aac,.ogg,.wav,.flac', style: 'display:none' });
    fi.addEventListener('change', function () {
      var f = fi.files && fi.files[0]; fi.value = ''; if (!f) return;
      if (f.size > 20 * 1024 * 1024) { O.toast('গানের ফাইল ২০MB এর বেশি — ছোট করুন (MP3 হলে ভালো)'); return; }
      if (f.type && !/^audio\//.test(f.type)) { O.toast('এটা অডিও ফাইল নয়'); return; }
      if (m.src === 'custom' && m.id && Z.pending.oldMusic.indexOf(m.id) < 0 && !Z.pending.music) Z.pending.oldMusic.push(m.id);
      if (Z.pending.music && Z.pending.music._url) URL.revokeObjectURL(Z.pending.music._url);
      f._url = URL.createObjectURL(f); Z.pending.music = f;
      m.name = f.name.replace(/\.[^.]+$/, '');
      O.toast('গান বাছাই হয়েছে — শুনে দেখুন, তারপর উপরের "সেভ করুন" চাপুন'); draw();
    });
    b.appendChild(h('div', null, [h('button', { class: 'zp-btn', type: 'button', text: '📁 গান আপলোড করুন', onclick: function () { fi.click(); } }), fi]));
    b.appendChild(h('div', { class: 'zp-note', text: 'MP3 / M4A / AAC / OGG / WAV — সর্বোচ্চ ২০MB। গান Cloudflare KV-তে জমা থাকে, তাই KV সেটআপ করা থাকতে হবে। সেভ করার সময় আপলোড হবে।' }));
    b.appendChild(col('গানের নাম (বাটনের টুলটিপে দেখাবে)', textIn(m.name, function (v) { m.name = v; live(); })));
    var vr = h('input', { type: 'range', min: '0', max: '100', step: '5', value: String(m.volume) }), vl = h('span', { text: m.volume + '%' });
    vr.addEventListener('input', function () { m.volume = +vr.value; vl.textContent = vr.value + '%'; Z.applyMusic(); });
    b.appendChild(col('ভলিউম', h('div', null, [vr, vl])));
    b.appendChild(row('প্রথম ট্যাপে নিজে থেকে গান শুরু', toggle(m.autoplay, function (v) { m.autoplay = v; }), 'বন্ধ করলে ভিজিটর গানের বাটন চাপলেই কেবল গান বাজবে।'));
    b.appendChild(row('গানের বাটন দেখান', toggle(c.show.music !== false, function (v) { if (v) delete c.show.music; else c.show.music = false; live(); })));
    b.appendChild(h('div', { style: 'margin-top:10px' }, [h('button', { class: 'zp-btn ghost', type: 'button', text: '↩ ডিফল্ট গানে ফিরুন', onclick: function () {
      if (m.src === 'custom' && m.id && Z.pending.oldMusic.indexOf(m.id) < 0) Z.pending.oldMusic.push(m.id);
      if (Z.pending.music && Z.pending.music._url) URL.revokeObjectURL(Z.pending.music._url);
      Z.pending.music = null; m.src = 'default'; m.id = ''; m.name = ''; Z.applyMusic(); O.toast('ডিফল্ট গান — "সেভ করুন" চাপুন'); draw();
    } })]));
  }

  // ---------------- ট্যাব: সেকশন ----------------
  function tSections(b) {
    b.appendChild(h('div', { class: 'zp-note', text: 'সেকশন উপরে/নিচে সরান, অন্য কলামে নিন, লুকান বা নতুন সেকশন বানান। সেকশনের লেখা, আইকন ও আইটেম পেজেই ট্যাপ করে বদলান।' }));
    var list = O.sections(), shown = {};
    ['left', 'right'].forEach(function (colName) {
      b.appendChild(h('div', { class: 'zp-h', text: colName === 'left' ? 'বাম কলাম (ছোট)' : 'ডান কলাম (বড়)' }));
      list.filter(function (x) { return x.col === colName; }).forEach(function (x) {
        var mk = function (t, title, fn) { return h('button', { class: 'zp-btn ghost sm', type: 'button', text: t, title: title, onclick: fn }); };
        var r = h('div', { class: 'zp-sec' }, [
          h('span', { class: 't', text: (x.hidden ? '🚫 ' : '') + x.title, style: x.hidden ? 'opacity:.5' : '' }),
          x.custom ? h('span', { class: 'tag', text: 'কাস্টম' }) : null,
          mk('▲', 'উপরে', function () { O.moveSec(x.id, -1); }), mk('▼', 'নিচে', function () { O.moveSec(x.id, 1); }),
          mk('⇄', 'অন্য কলামে', function () { O.moveCol(x.id); }), mk(x.hidden ? '👁' : '🚫', x.hidden ? 'দেখান' : 'লুকান', function () { O.toggleHide(x.id); })
        ]);
        if (x.custom) r.appendChild(h('button', { class: 'zp-btn red sm', type: 'button', text: '✕', onclick: function () { O.deleteSec(x.id); } }));
        b.appendChild(r);
      });
    });
    b.appendChild(h('div', { class: 'zp-h', text: 'নতুন সেকশন' }));
    var g = h('div', { class: 'zp-grid' });
    Object.keys(O.kinds).forEach(function (k) { g.appendChild(h('button', { class: 'zp-pal', type: 'button', text: '＋ ' + O.kinds[k].name, onclick: function () { O.addCustom(k); } })); });
    b.appendChild(g);
  }

  // ---------------- ট্যাব: লিংক ----------------
  function tLinks(b) {
    var c = Z.cfg;
    b.appendChild(h('div', { class: 'zp-h', text: 'হেডারের সোশ্যাল / যোগাযোগ বাটন' }));
    Object.keys(O.linkKeys).forEach(function (k) {
      var info = O.linkKeys[k];
      b.appendChild(h('div', { class: 'zp-sec' }, [
        h('span', { class: 't', text: info.name }),
        h('button', { class: 'zp-btn ghost sm', type: 'button', text: '🔗 লিংক বদলান', onclick: function () { O.editLink(k); } }),
        toggle(c.hiddenLinks.indexOf(k) < 0, function (v) { var i = c.hiddenLinks.indexOf(k); if (v && i >= 0) c.hiddenLinks.splice(i, 1); if (!v && i < 0) c.hiddenLinks.push(k); live(); })
      ]));
    });
    b.appendChild(h('div', { class: 'zp-h', text: 'অতিরিক্ত লিংক বাটন (ইউটিউব, টেলিগ্রাম, গিটহাব, ইমেইল…)' }));
    c.extraLinks.forEach(function (l, idx) {
      var iconBtn = h('button', { class: 'zp-btn ghost sm', type: 'button', onclick: function () {
        O.pickIcon(l.icon, function (v) { l.icon = v; live(); draw(); }, { allowText: true });
      } });
      if (/^fa-/.test(l.icon)) iconBtn.appendChild(O.ICON(l.icon)); else iconBtn.textContent = l.icon;
      b.appendChild(h('div', { class: 'zp-col' }, [
        h('div', { class: 'zp-sec', style: 'border:none;padding:0' }, [iconBtn, textIn(l.label, function (v) { l.label = v; live(); }, 'নাম (যেমন YouTube)'),
          h('button', { class: 'zp-btn red sm', type: 'button', text: '✕', onclick: function () { c.extraLinks.splice(idx, 1); live(); draw(); } })]),
        textIn(l.url, function (v) { l.url = v.trim(); live(); }, 'লিংক (https://… অথবা mailto:you@mail.com)')
      ]));
    });
    b.appendChild(h('div', { style: 'margin-top:10px' }, [h('button', { class: 'zp-btn', type: 'button', text: '＋ নতুন লিংক বাটন', onclick: function () {
      if (c.extraLinks.length >= 12) { O.toast('সর্বোচ্চ ১২টি'); return; }
      c.extraLinks.push({ icon: 'fa-link', url: '', label: '' }); draw();
    } })]));
    b.appendChild(h('div', { class: 'zp-note', text: 'লিংক ফাঁকা থাকলে বাটন দেখাবে না। ফোন/হোয়াটসঅ্যাপ নম্বর বদলাতে হেডারের ওই বাটনে ট্যাপ করুন।' }));
  }

  // ---------------- ট্যাব: ফিচার ----------------
  var FEAT = [['counter', 'ভিজিটর কাউন্টার'], ['clock', 'লাইভ ঘড়ি'], ['status', 'স্ট্যাটাস (অনলাইন)'], ['search', 'সার্চ বক্স'], ['quicknav', 'দ্রুত নেভিগেশন বার'], ['wa', 'ভাসমান WhatsApp বাটন'], ['music', 'গানের বাটন'], ['lang', 'ভাষা বদলের বাটন'], ['themeBtn', 'থিম বদলের বাটন'], ['pdf', 'PDF বাটন'], ['vcard', 'vCard বাটন'], ['share', 'শেয়ার বাটন'], ['fabCopy', 'সম্পূর্ণ তথ্য কপি বাটন'], ['fabQr', 'QR কোড বাটন'], ['fabRead', '"প্রোফাইল শুনুন" বাটন'], ['fabCard', 'ডিজিটাল কার্ড বাটন'], ['net', 'অনলাইন/অফলাইন ব্যাজ'], ['footer', 'ফুটার লেখা'], ['strip', '"সর্বশেষ পরিদর্শন" লাইন'], ['click', 'ক্লিক সাউন্ড']];
  function tFeatures(b) {
    var c = Z.cfg;
    b.appendChild(h('div', { class: 'zp-note', text: 'যা বন্ধ করবেন ভিজিটর সেটা দেখবে না। (Owner বাটন নিচে আলাদা)' }));
    FEAT.forEach(function (f) {
      b.appendChild(row(f[1], toggle(c.show[f[0]] !== false, function (v) { if (v) delete c.show[f[0]]; else c.show[f[0]] = false; live(); })));
    });
    b.appendChild(row('Owner বাটন (নিচের ডানের শিল্ড)', toggle(c.show.ownerBtn !== false, function (v) {
      if (!v && !confirm('Owner বাটন লুকালে আবার লগইন করতে সাইটের লিংকের শেষে #owner যোগ করে খুলতে হবে (যেমন yoursite.com/#owner)। লুকাবেন?')) { draw(); return; }
      if (v) delete c.show.ownerBtn; else c.show.ownerBtn = false; live();
    }), 'লুকালে লগইন: সাইটের লিংক + #owner'));
  }

  // ---------------- ট্যাব: নিরাপত্তা ও ডেটা ----------------
  function tData(b) {
    b.appendChild(h('div', { class: 'zp-h', text: '🔐 পাসওয়ার্ড বদল' }));
    var np = h('input', { type: 'password', placeholder: 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)', autocomplete: 'new-password' }), np2 = h('input', { type: 'password', placeholder: 'আবার লিখুন', autocomplete: 'new-password' });
    b.appendChild(col('নতুন পাসওয়ার্ড', h('div', { style: 'display:flex;flex-direction:column;gap:6px' }, [np, np2])));
    b.appendChild(h('button', { class: 'zp-btn', type: 'button', text: 'পাসওয়ার্ড বদলান', onclick: async function () {
      if (np.value.length < 6) { O.toast('কমপক্ষে ৬ অক্ষর দিন'); return; }
      if (np.value !== np2.value) { O.toast('দুটো পাসওয়ার্ড মেলেনি'); return; }
      try {
        var r = await api('PUT', '/api/auth', { newPassword: np.value });
        if (r.ok) { O.setPw(np.value); np.value = np2.value = ''; O.toast('পাসওয়ার্ড বদলেছে ✅ নতুনটা মনে রাখুন'); }
        else if (r.status === 401) O.toast('বর্তমান পাসওয়ার্ড মেলেনি');
        else O.toast('সার্ভারে সেভ হয়নি (KV সেটআপ আছে তো?)');
      } catch (_) { O.toast('সার্ভার পাওয়া যায়নি'); }
    } }));
    b.appendChild(h('div', { class: 'zp-note', text: 'নতুন পাসওয়ার্ডের হ্যাশ KV-তে থাকে। ভুলে গেলে Cloudflare Dashboard → KV → আপনার namespace থেকে "pwhash" কী-টা মুছে দিলে আবার OWNER_PASSWORD (বা ডিফল্ট) চালু হবে।' }));

    b.appendChild(h('div', { class: 'zp-h', text: '👁 ভিজিটর কাউন্টার' }));
    var cnt = h('input', { type: 'number', min: '0', placeholder: 'সংখ্যা' });
    api('GET', '/api/visit').then(function (r) { return r.json(); }).then(function (d) { if (d && typeof d.count === 'number') cnt.value = d.count; }).catch(function () {});
    b.appendChild(col('বর্তমান সংখ্যা (বদলে সেট করতে পারেন)', cnt));
    b.appendChild(h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, [
      h('button', { class: 'zp-btn', type: 'button', text: 'সেট করুন', onclick: async function () {
        try { var r = await api('PUT', '/api/visit', { count: Number(cnt.value) }); O.toast(r.ok ? 'কাউন্টার সেট হয়েছে ✅' : 'সেট হয়নি'); if (r.ok) { var el = document.getElementById('visitorCount'); if (el) el.textContent = cnt.value; } } catch (_) { O.toast('সার্ভার পাওয়া যায়নি'); }
      } }),
      h('button', { class: 'zp-btn ghost', type: 'button', text: '০ করুন', onclick: function () { cnt.value = 0; } })
    ]));

    b.appendChild(h('div', { class: 'zp-h', text: '💾 ব্যাকআপ ও রিস্টোর' }));
    b.appendChild(h('div', { class: 'zp-note', text: 'ব্যাকআপ ফাইলে সব লেখা, লিস্ট, সেটিংস ও লেআউট থাকে (ছবি/গান সার্ভারে থাকে, ফাইলে শুধু রেফারেন্স)।' }));
    var imp = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none' });
    imp.addEventListener('change', function () {
      var f = imp.files && imp.files[0]; imp.value = ''; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try { var m = JSON.parse(rd.result); if (!m || typeof m !== 'object' || Array.isArray(m)) throw 0; O.importData(m); O.toast('ব্যাকআপ লোড হয়েছে — ঠিক থাকলে "সেভ করুন" চাপুন'); draw(); }
        catch (_) { O.toast('ফাইলটা সঠিক ব্যাকআপ নয়'); }
      };
      rd.readAsText(f);
    });
    b.appendChild(h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, [
      h('button', { class: 'zp-btn', type: 'button', text: '⬇ ব্যাকআপ নামান', onclick: function () {
        var blob = new Blob([JSON.stringify(O.collect(), null, 1)], { type: 'application/json' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'portfolio-backup-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      } }),
      h('button', { class: 'zp-btn ghost', type: 'button', text: '⬆ ব্যাকআপ থেকে ফেরান', onclick: function () { imp.click(); } }), imp
    ]));

    b.appendChild(h('div', { class: 'zp-h', text: '⚠️ সবকিছু ডিফল্টে ফেরান' }));
    b.appendChild(h('div', { class: 'zp-note', text: 'সব এডিট, সেটিংস, লেআউট ও কাস্টম সেকশন মুছে সাইট প্রথম অবস্থায় ফিরবে। আগে ব্যাকআপ নামিয়ে নিন।' }));
    b.appendChild(h('button', { class: 'zp-btn red', type: 'button', text: 'সব রিসেট করুন', onclick: async function () {
      if (!confirm('সত্যিই সব কাস্টমাইজেশন মুছে ডিফল্টে ফিরবেন?')) return;
      if (!confirm('শেষবার নিশ্চিত করুন — এটা ফেরানো যাবে না (ব্যাকআপ না থাকলে)।')) return;
      try {
        var r = await api('DELETE', '/api/content');
        if (!r.ok) { O.toast(r.status === 401 ? 'পাসওয়ার্ড মেলেনি' : 'রিসেট হয়নি'); return; }
        try { localStorage.removeItem('zar_cache_v2'); localStorage.removeItem('zar_owner_content_v1'); } catch (_) {}
        location.reload();
      } catch (_) { O.toast('সার্ভার পাওয়া যায়নি'); }
    } }));
  }

  var TABS = [['general', '⚙️ সাধারণ', tGeneral], ['colors', '🎨 রং', tColors], ['music', '🎵 গান', tMusic], ['sections', '🧩 সেকশন', tSections], ['links', '🔗 লিংক', tLinks], ['features', '🎛 ফিচার', tFeatures], ['data', '🔐 নিরাপত্তা/ডেটা', tData]];

  function draw() {
    if (!root) return;
    var tabs = root.querySelector('.zp-tabs'); while (tabs.firstChild) tabs.removeChild(tabs.firstChild);
    TABS.forEach(function (t) { tabs.appendChild(h('button', { type: 'button', class: t[0] === tab ? 'on' : '', text: t[1], onclick: function () { tab = t[0]; draw(); } })); });
    var sc = body ? body.scrollTop : 0;
    while (body.firstChild) body.removeChild(body.firstChild);
    TABS.filter(function (t) { return t[0] === tab; })[0][2](body);
    body.scrollTop = sc;
  }

  function open() {
    if (!document.getElementById('zpStyle')) { var st = document.createElement('style'); st.id = 'zpStyle'; st.textContent = css; document.head.appendChild(st); }
    if (root && document.body.contains(root)) { root.style.display = 'flex'; draw(); return; }
    body = h('div', { class: 'zp-body' });
    root = h('div', { class: 'zp-sheet owner-ui' }, [
      h('div', { class: 'zp-head' }, [h('span', { text: '⚙️ সাইট সেটিংস' }), h('button', { class: 'zp-x', type: 'button', text: '✕', 'aria-label': 'বন্ধ', onclick: function () { root.style.display = 'none'; } })]),
      h('div', { class: 'zp-tabs' }), body,
      h('div', { class: 'zp-note', style: 'padding:0 14px 8px', text: 'পরিবর্তন সাথে সাথে পেজে দেখা যায়। স্থায়ী করতে উপরের "সেভ করুন" চাপুন।' })
    ]);
    document.body.appendChild(root); draw();
  }

  window.ZarAdmin = { open: open, close: function () { if (root) { root.remove(); root = null; } }, refresh: function () { if (root && tab === 'sections') draw(); } };
})();
