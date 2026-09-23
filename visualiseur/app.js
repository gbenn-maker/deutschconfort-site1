/* ============================================================================
   Visualiseur Deutschconfort — app.js
   Parcours : accueil/consentement → projet → photos → zone → produit →
   aperçu → rendu HD → contact → final. API Insta Pro, mode démo hors ligne.
   ES2020, aucune dépendance.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- config */
  const qsp = new URLSearchParams(location.search);
  const API_DEFAULT = 'https://insta-pro-deutschconfort-production-a767.up.railway.app';
  const API_BASE = (qsp.get('api') || API_DEFAULT).replace(/\/+$/, '');
  const API = API_BASE + '/api/public/visualiser';
  const WA_NUMBER = '212614474221';
  const STORE_KEY = 'dc_visualiseur_v1';
  const CONSENT_VERSION = '2026-09-23';
  const MAX_PHOTOS = 5;
  const PACKSHOT_BASE = 'https://deutsch-confort.com/images/panels/';
  const ANGLES = [
    { key: 'coin_gauche', label: 'Coin gauche', hint: 'Mur + angle gauche', ico: 'gauche' },
    { key: 'face', label: 'Face', hint: 'Le mur entier, bien droit', ico: 'face' },
    { key: 'coin_droit', label: 'Coin droit', hint: 'Mur + angle droit', ico: 'droit' },
    { key: 'sol', label: 'Sol', hint: 'Le sol vers le fond', ico: 'sol' },
    { key: 'autre', label: 'Autre', hint: 'Détail, second mur…', ico: 'face' }
  ];
  const PATTERN_LABEL = { droit: 'Droit', chevron: 'Chevron 60°', point_hongrie: 'Point de Hongrie 45°', baton_rompu: 'Bâton rompu', horizontal: 'Horizontal', vertical: 'Vertical' };

  /* --------------------------------------------------- catalogue démo */
  const DEMO_WALLS = [
    ['big-rock', 'Big Rock', 'Pierre bouchardée'], ['beton-brut', 'Béton Brut', 'Béton architectural'], ['bois-cubo', 'Bois Cubo', 'Relief bois'],
    ['brick', 'Brick', 'Brique contemporaine'], ['cemento', 'Cemento', 'Béton banché'], ['cubo', 'Cubo', 'Relief 3D'],
    ['mattoni', 'Mattoni', 'Brique fine'], ['moon', 'Moon', 'Relief lunaire']
  ].map(([slug, name, sub], i) => ({
    id: 'demo-' + slug, slug, category: 'wall', name, brand: 'Le Celestone™', range_name: sub,
    unit_w_cm: 240, unit_h_cm: 60, patterns: ['horizontal'], colorable: 1, packshot_url: PACKSHOT_BASE + slug + '-product.png', sort: i,
    textures: slug === 'big-rock' ? [{ kind: 'albedo', url: 'textures/celestone-big-rock.jpg', px_per_cm: 8.833, seamless: false }] : []
  }));
  const DEMO_FLOORS = [
    { id: 'demo-cadenza', slug: 'cadenza', name: 'Parquet chêne Cadenza', brand: 'Parquet contrecollé', range_name: 'Lame 14,5 cm', unit_w_cm: 120, unit_h_cm: 14.5, patterns: ['droit', 'chevron', 'point_hongrie', 'baton_rompu'], textures: [{ kind: 'albedo', url: 'textures/sol-cadenza-cd3860.jpg', px_per_cm: 67.5, seamless: false }] },
    { id: 'demo-chene-gris', slug: 'chene-gris', name: 'Stratifié chêne gris', brand: 'Stratifié', range_name: 'Lame 128 × 19 cm', unit_w_cm: 128, unit_h_cm: 19, patterns: ['droit', 'baton_rompu'], textures: [{ kind: 'albedo', url: 'textures/sol-chene-gris.jpg', px_per_cm: 39.6, seamless: false }] },
    { id: 'demo-chene-blanchi', slug: 'chene-blanchi', name: 'Stratifié chêne blanchi', brand: 'Stratifié', range_name: 'Lame 128 × 19 cm', unit_w_cm: 128, unit_h_cm: 19, patterns: ['droit', 'baton_rompu'], textures: [{ kind: 'albedo', url: 'textures/sol-chene-blanchi.jpg', px_per_cm: 29.6, seamless: false }] },
    { id: 'demo-chene-fume', slug: 'chene-fume', name: 'Parquet chêne fumé', brand: 'Parquet contrecollé', range_name: 'Lame 90 × 15 cm', unit_w_cm: 90, unit_h_cm: 15, patterns: ['droit', 'chevron', 'point_hongrie', 'baton_rompu'] },
    { id: 'demo-spc-greige', slug: 'spc-greige', name: 'SPC greige', brand: 'Vinyle rigide SPC', range_name: 'Lame 122 × 18 cm', unit_w_cm: 122, unit_h_cm: 18, patterns: ['droit'] }
  ].map(f => Object.assign({ category: 'floor', colorable: 0, packshot_url: null, textures: [] }, f));
  const DEMO_COLORS = [
    ['1001', 'Egg White', '#efede3', 'blanc'], ['9918', 'Classic White', '#f0efea', 'blanc'], ['7236', 'Jazz White', '#f3f4ee', 'blanc'], ['1624', 'Skylight', '#f2f1e8', 'blanc'],
    ['1622', 'Reflection', '#ebe9e2', 'blanc cassé'], ['1376', 'Mist', '#e5e0d4', 'blanc cassé'], ['1024', 'Timeless', '#e0ddd3', 'beige'], ['10678', 'Space', '#d6cfbf', 'beige'],
    ['1140', 'Sand', '#cfc5b4', 'beige'], ['10679', 'Washed Linen', '#c9c3b6', 'beige'], ['12076', 'Modern Beige', '#bfb3a4', 'beige'], ['2024', 'Senses', '#bfa795', 'beige'],
    ['12078', 'Comfort Grey', '#beb9af', 'gris'], ['0394', 'Soft Grey', '#afa99c', 'gris'], ['1462', 'Evening Sky', '#84817a', 'gris'], ['4056', 'Dark Chimney', '#5b5c5c', 'gris'],
    ['9938', 'Blackened Black', '#494948', 'noir'], ['4116', 'Corvus Black', '#3e3e3d', 'noir'], ['10981', 'Norwegian Wood', '#7f5c47', 'brun'], ['10965', 'Hipster Brown', '#857c6e', 'brun'],
    ['8469', 'Green Leaf', '#8a8774', 'accent'], ['2846', 'Winery', '#755252', 'accent'], ['5454', 'Dark Teal', '#506364', 'accent'], ['2111', 'Burned Terracotta', '#9e6e63', 'accent']
  ].map(([code, name, hex, family]) => ({ code, name, hex, family, range: 'Fenomastic My Home Rich Matt' }));

  /* -------------------------------------------------------------- état */
  const state = {
    demo: false, token: null, step: 0, consent: false,
    project: { room_type: '', city: '', surface_m2: null, wall_height_cm: null, project_type: '', timeframe: '' },
    photos: [], current: -1,
    catalog: { products: [], colors: [] },
    cat: 'wall', product: null, pattern: 'droit', orient: 0, color: null,
    renders: [], contact: { first: '', last: '', phone: '', email: '', city: '', profession: '', message: '' },
    dossier: null, lastRender: null, tool: 'wall'
  };
  const renderer = window.DCRender.createRenderer({ forceCanvas: qsp.get('nogl') === '1' });
  const textureCache = new Map();
  let uid = 1;

  /* ------------------------------------------------------------- utils */
  const el = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  function toast(msg, ms) { const t = el('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms || 2600); }
  function track(name, data) { try { if (window.fbq) { if (name === 'Lead') window.fbq('track', 'Lead', data || {}); else window.fbq('trackCustom', name, data || {}); } } catch (e) { /* ignore */ } }
  function utm() { const out = {}; ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach(k => { if (qsp.get(k)) out[k] = qsp.get(k); }); out.landing = location.origin + location.pathname; if (document.referrer) out.referrer = document.referrer; return out; }
  function device() { return { ua: navigator.userAgent.slice(0, 160), w: screen.width, h: screen.height, dpr: devicePixelRatio || 1, touch: 'ontouchstart' in window, render: renderer.mode, lang: navigator.language }; }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ token: state.token, step: state.step, project: state.project, cat: state.cat, product_id: state.product && state.product.id, pattern: state.pattern, orient: state.orient, color: state.color && state.color.code, demo: state.demo, dossier: state.dossier }));
    } catch (e) { /* stockage indisponible */ }
  }
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; } }
  function num(v) { const n = Number(v); return isFinite(n) && n > 0 ? n : null; }
  function slugOf(p) { return (p.slug || String(p.name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }
  function withTimeout(promise, ms) { return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]); }

  /* --------------------------------------------------------------- API */
  async function api(path, opts) {
    const o = Object.assign({ headers: {} }, opts || {});
    if (o.json) { o.body = JSON.stringify(o.json); o.headers['Content-Type'] = 'application/json'; delete o.json; }
    const res = await withTimeout(fetch(API + path, o), o.timeout || 25000);
    if (!res.ok) { let b = {}; try { b = await res.json(); } catch (e) { /* vide */ } const err = new Error(b.error || ('HTTP ' + res.status)); err.status = res.status; throw err; }
    return res.json();
  }
  function setDemo(on, reason) {
    state.demo = on;
    el('demoBanner').classList.toggle('hidden', !on);
    if (on && reason) console.warn('[visualiseur] mode démo :', reason);
  }
  async function loadCatalog() {
    try {
      const c = await api('/catalog', { timeout: 7000 });
      const products = (c.products || []).map(p => Object.assign({ slug: slugOf(p), textures: [] }, p, { patterns: Array.isArray(p.patterns) ? p.patterns : (typeof p.patterns === 'string' ? JSON.parse(p.patterns) : [p.category === 'wall' ? 'horizontal' : 'droit']) }));
      const colors = (c.colors || []).map(k => ({ code: k.code, name: k.name, hex: k.hex, family: k.family, range: k.range }));
      state.catalog = { products: products.length ? products : DEMO_WALLS.concat(DEMO_FLOORS), colors: colors.length ? colors : DEMO_COLORS, consent_text: c.consent_text, consent_version: c.consent_version || CONSENT_VERSION };
      setDemo(false);
    } catch (e) {
      state.catalog = { products: DEMO_WALLS.concat(DEMO_FLOORS), colors: DEMO_COLORS, consent_version: CONSENT_VERSION };
      setDemo(true, e.message);
    }
  }
  async function startSession() {
    if (state.demo) { state.token = null; return; }
    try {
      const r = await api('/start', { method: 'POST', json: { consent: true, consent_version: state.catalog.consent_version || CONSENT_VERSION, utm: utm(), device: device() } });
      state.token = r.token || (r.session && r.session.public_token) || null;
      if (!state.token) throw new Error('token absent');
    } catch (e) { setDemo(true, 'start: ' + e.message); state.token = null; }
    save();
  }
  async function patchSession() {
    if (!state.token) return;
    try { await api('/' + state.token, { method: 'PATCH', json: state.project }); } catch (e) { console.warn('patch', e.message); }
  }

  /* --------------------------------------------------------- navigation */
  const TOTAL = 9;
  const NEXT_LABEL = ['Commencer', 'Continuer', 'Délimiter la zone', 'Choisir le produit', 'Voir l\'aperçu', 'Rendu HD & contact', 'Continuer', 'Envoyer mon projet', ''];
  function go(step) {
    state.step = step;
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', Number(s.dataset.screen) === step));
    el('progressLabel').textContent = step === 0 ? 'Visualiseur' : `Étape ${step} sur ${TOTAL - 1}`;
    el('progressBar').style.width = (step / (TOTAL - 1) * 100) + '%';
    el('backBtn').style.visibility = step === 0 || step === 8 ? 'hidden' : 'visible';
    el('nextBtn').textContent = NEXT_LABEL[step] || 'Continuer';
    el('nav').classList.toggle('hidden', step === 8 || step === 6);
    if (step === 2) renderShots();
    if (step === 3) { ensureCurrent(); renderZoneThumbs(); editor.mount(); }
    if (step === 4) renderCatalog();
    if (step === 5) runPreview();
    if (step === 7) { el('contactCity').value = state.contact.city || state.project.city || ''; el('professionField').classList.toggle('hidden', state.project.project_type !== 'professionnel'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    save();
  }
  function showError(step, on) { const b = document.querySelector(`[data-error="${step}"]`); if (b) b.classList.toggle('show', !!on); }
  function validate(step) {
    let ok = true;
    if (step === 0) ok = el('consent').checked;
    if (step === 1) ok = !!state.project.room_type && !!state.project.city.trim() && !!state.project.wall_height_cm;
    if (step === 2) ok = state.photos.length > 0;
    if (step === 3) { const g = currentPhoto() && currentPhoto().geometry; ok = !!g && ((g.wall_on && g.wall_height_cm) || (g.floor_on && g.floor_width_cm)); }
    if (step === 4) ok = !!state.product && (state.product.category !== 'wall' || !state.product.colorable || !!state.color);
    if (step === 7) {
      state.contact.first = el('firstName').value.trim(); state.contact.last = el('lastName').value.trim();
      state.contact.phone = el('phone').value.trim(); state.contact.email = el('email').value.trim(); state.contact.city = el('contactCity').value.trim();
      state.contact.profession = el('profession').value.trim(); state.contact.message = el('message').value.trim();
      ok = !!state.contact.first && !!state.contact.last && state.contact.phone.replace(/\D/g, '').length >= 9;
    }
    showError(step, !ok);
    return ok;
  }
  async function next() {
    const s = state.step;
    if (!validate(s)) return;
    if (s === 0) {
      state.consent = true;
      el('nextBtn').disabled = true;
      await startSession();
      el('nextBtn').disabled = false;
      track('VisualiserStart', { demo: state.demo });
      go(1); return;
    }
    if (s === 1) { patchSession(); go(2); return; }
    if (s === 2) { go(3); return; }
    if (s === 3) { saveGeometry(); go(4); return; }
    if (s === 4) { go(5); return; }
    if (s === 5) { go(6); requestHD(); return; }
    if (s === 6) { go(7); return; }
    if (s === 7) { await submitContact(); return; }
  }
  function back() { if (state.step > 0 && state.step !== 8) go(state.step === 6 ? 5 : state.step - 1); }

  /* ------------------------------------------------------ 1 · projet */
  function bindProject() {
    document.querySelectorAll('[data-field][data-value]').forEach(b => b.addEventListener('click', () => {
      state.project[b.dataset.field] = b.dataset.value;
      document.querySelectorAll(`[data-field="${b.dataset.field}"]`).forEach(x => x.classList.toggle('selected', x === b));
      save();
    }));
    el('city').addEventListener('input', e => { state.project.city = e.target.value; });
    el('surface').addEventListener('input', e => { state.project.surface_m2 = num(e.target.value); });
    el('ceiling').addEventListener('input', e => { state.project.wall_height_cm = num(e.target.value); });
  }

  /* ------------------------------------------------------ 2 · photos */
  function currentPhoto() { return state.photos[state.current] || null; }
  function ensureCurrent() { if (!currentPhoto() && state.photos.length) state.current = 0; }
  function renderShots() {
    const root = el('shots');
    root.querySelectorAll('.shot').forEach(n => n.remove());
    ANGLES.forEach(a => {
      const ph = state.photos.find(p => p.angle === a.key);
      const d = document.createElement('div');
      d.className = 'shot' + (ph ? ' has' : '');
      if (ph) {
        const q = ph.quality || {};
        const warn = q.sharp === false || q.exposure !== 'ok';
        d.innerHTML = `<img src="${ph.thumb}" alt="${esc(a.label)}"><span class="badge${warn ? ' warn' : ''}">${warn ? (q.sharp === false ? 'Floue' : (q.exposure === 'dark' ? 'Sombre' : 'Surexposée')) : 'Nette'}</span><button class="redo" type="button">Reprendre</button>`;
        d.querySelector('.redo').addEventListener('click', () => pick(a.key));
      } else {
        d.innerHTML = `<div class="ico ${a.ico}"></div><b>${esc(a.label)}</b><span>${esc(a.hint)}</span><input type="file" accept="image/*" capture="environment" aria-label="Photo ${esc(a.label)}">`;
        d.querySelector('input').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (f) addPhoto(f, a.key); });
      }
      root.appendChild(d);
    });
  }
  function pick(angle) {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture', 'environment');
    inp.addEventListener('change', () => { const f = inp.files && inp.files[0]; if (f) addPhoto(f, angle); });
    inp.click();
  }
  async function fileToCanvas(file, max) {
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) {
      bmp = await new Promise((res, rej) => { const im = new Image(); const u = URL.createObjectURL(file); im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = () => rej(new Error('image illisible')); im.src = u; });
    }
    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight;
    const sc = Math.min(1, max / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bmp, 0, 0, c.width, c.height);
    if (bmp.close) bmp.close();
    return c;
  }
  // Netteté (variance du Laplacien) + exposition (histogramme) sur 480 px.
  function analyse(canvas) {
    const W = 480, sc = W / Math.max(canvas.width, canvas.height);
    const w = Math.max(8, Math.round(canvas.width * sc)), h = Math.max(8, Math.round(canvas.height * sc));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(canvas, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data, g = new Float32Array(w * h), hist = new Uint32Array(256);
    for (let i = 0, p = 0; i < g.length; i++, p += 4) { const v = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]; g[i] = v; hist[v | 0]++; }
    let sum = 0, sum2 = 0, n = 0;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, l = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w];
      sum += l; sum2 += l * l; n++;
    }
    const mean = sum / n, variance = sum2 / n - mean * mean;
    let dark = 0, bright = 0, tot = w * h, lum = 0;
    for (let i = 0; i < 256; i++) { lum += i * hist[i]; if (i < 24) dark += hist[i]; if (i > 236) bright += hist[i]; }
    lum /= tot;
    const exposure = (dark / tot > 0.35 || lum < 48) ? 'dark' : ((bright / tot > 0.30 || lum > 215) ? 'bright' : 'ok');
    return { sharpness: Math.round(variance), sharp: variance > 45, exposure, mean_lum: Math.round(lum), level_deg: level.last };
  }
  async function addPhoto(file, angle) {
    const msg = el('shotMsg'); msg.classList.remove('show');
    if (state.photos.length >= MAX_PHOTOS && !state.photos.find(p => p.angle === angle)) { toast('Cinq photos maximum.'); return; }
    let canvas;
    try { canvas = await fileToCanvas(file, 2048); } catch (e) { msg.textContent = 'Cette image ne peut pas être lue. Réessayez avec une photo JPEG prise depuis l\'appareil photo.'; msg.classList.add('show'); return; }
    const quality = analyse(canvas);
    const thumbC = document.createElement('canvas'); const ts = 240 / Math.max(canvas.width, canvas.height);
    thumbC.width = Math.round(canvas.width * ts); thumbC.height = Math.round(canvas.height * ts); thumbC.getContext('2d').drawImage(canvas, 0, 0, thumbC.width, thumbC.height);
    const photo = { lid: uid++, id: null, canvas, thumb: thumbC.toDataURL('image/jpeg', 0.7), angle, quality, geometry: defaultGeometry(canvas, angle), mask: null, maskHistory: [], beforeUrl: null };
    const idx = state.photos.findIndex(p => p.angle === angle);
    if (idx >= 0) state.photos[idx] = photo; else state.photos.push(photo);
    if (state.current < 0) state.current = 0;
    if (!quality.sharp) { msg.textContent = 'Photo floue : stabilisez le téléphone, faites la mise au point sur le mur et reprenez la photo. Vous pouvez tout de même continuer.'; msg.classList.add('show'); }
    else if (quality.exposure === 'dark') { msg.textContent = 'Photo sombre : allumez la lumière ou ouvrez les rideaux, puis reprenez. Le rendu suit la lumière de la photo.'; msg.classList.add('show'); }
    else if (quality.exposure === 'bright') { msg.textContent = 'Photo surexposée : évitez le contre-jour (fenêtre derrière le mur) et reprenez.'; msg.classList.add('show'); }
    renderShots(); showError(2, false);
    if (state.photos.length === 1) track('VisualiserCapture', { angle });
    uploadPhoto(photo);
  }
  async function uploadPhoto(photo) {
    if (!state.token || photo.id) return;
    try {
      const blob = await new Promise(res => photo.canvas.toBlob(res, 'image/jpeg', 0.88));
      const r = await api('/' + state.token + '/photos', { method: 'POST', body: blob, headers: { 'Content-Type': 'application/octet-stream', 'X-Angle': photo.angle, 'X-Quality': JSON.stringify(photo.quality) }, timeout: 60000 });
      const p = r.photo || r;
      photo.id = p.id || null;
    } catch (e) { console.warn('upload', e.message); toast('Photo conservée sur l\'appareil (envoi impossible).'); }
  }
  function defaultGeometry(canvas, angle) {
    const w = canvas.width, h = canvas.height;
    const floor = angle === 'sol';
    return {
      wall_on: !floor, floor_on: floor,
      wall_quad: [[w * 0.18, h * 0.12], [w * 0.82, h * 0.12], [w * 0.82, h * 0.62], [w * 0.18, h * 0.62]],
      floor_quad: [[w * 0.22, h * 0.62], [w * 0.78, h * 0.62], [w * 0.98, h * 0.96], [w * 0.02, h * 0.96]],
      wall_height_cm: state.project.wall_height_cm || null, floor_width_cm: null
    };
  }

  /* ---------------------------------------------------------- niveau */
  const level = { on: false, last: null };
  function levelHandler(e) {
    if (e.beta == null) return;
    const tilt = e.gamma || 0, pitch = (e.beta || 0) - 90;
    level.last = Math.round(tilt * 10) / 10;
    const dot = el('levelDot'); const pct = 50 + Math.max(-45, Math.min(45, tilt)) * 1.0;
    dot.style.left = pct + '%';
    const ok = Math.abs(tilt) < 3 && Math.abs(pitch) < 8;
    dot.classList.toggle('ok', ok);
    el('levelText').textContent = ok ? 'Téléphone droit, vous pouvez photographier' : (Math.abs(pitch) >= 8 ? (pitch > 0 ? 'Redressez : trop penché vers le sol' : 'Redressez : trop penché vers le plafond') : 'Inclinez légèrement pour horizontaliser');
  }
  async function enableLevel() {
    if (!('DeviceOrientationEvent' in window)) { el('levelText').textContent = 'Niveau non disponible sur cet appareil'; el('levelBtn').classList.add('hidden'); return; }
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') { el('levelText').textContent = 'Autorisation refusée'; return; } }
      window.addEventListener('deviceorientation', levelHandler);
      level.on = true; el('levelBtn').classList.add('hidden');
    } catch (e) { el('levelText').textContent = 'Niveau indisponible'; }
  }

  /* --------------------------------------------------------- 3 · zone */
  const editor = (() => {
    const cv = el('editor'); const ctx = cv.getContext('2d');
    let scale = 1, drag = null, stroke = null, dpr = 1;
    const HANDLE = 22;
    function photo() { return currentPhoto(); }
    function mount() {
      const p = photo(); if (!p) return;
      const wrap = el('editorWrap'); const cw = wrap.clientWidth || 343;
      dpr = Math.min(2, devicePixelRatio || 1);
      scale = cw / p.canvas.width;
      cv.width = Math.round(cw * dpr); cv.height = Math.round(p.canvas.height * scale * dpr);
      cv.style.width = cw + 'px'; cv.style.height = Math.round(p.canvas.height * scale) + 'px';
      const g = p.geometry;
      el('wallHeight').value = g.wall_height_cm || state.project.wall_height_cm || '';
      el('floorWidth').value = g.floor_width_cm || '';
      el('toggleWall').textContent = 'Mur : ' + (g.wall_on ? 'actif' : 'inactif'); el('toggleWall').classList.toggle('on', g.wall_on);
      el('toggleFloor').textContent = 'Sol : ' + (g.floor_on ? 'actif' : 'inactif'); el('toggleFloor').classList.toggle('on', g.floor_on);
      if (!g.wall_on && g.floor_on && state.tool === 'wall') setTool('floor');
      draw();
    }
    function draw() {
      const p = photo(); if (!p) return;
      const g = p.geometry;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.drawImage(p.canvas, 0, 0);
      if (p.mask) { ctx.save(); ctx.globalAlpha = 0.55; ctx.drawImage(p.mask, 0, 0); ctx.restore(); }
      const lw = 2 / (dpr * scale) * dpr;
      [['floor', g.floor_quad, g.floor_on, '#C9BBA6'], ['wall', g.wall_quad, g.wall_on, '#F5F2EC']].forEach(([kind, q, on, col]) => {
        if (!on) return;
        const active = state.tool === kind;
        ctx.beginPath(); q.forEach((pt, i) => i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])); ctx.closePath();
        ctx.fillStyle = active ? 'rgba(245,242,236,.14)' : 'rgba(245,242,236,.05)'; ctx.fill();
        ctx.lineWidth = lw * (active ? 1.6 : 1); ctx.strokeStyle = col; ctx.setLineDash(active ? [] : [8 / scale, 6 / scale]); ctx.stroke(); ctx.setLineDash([]);
        if (active) q.forEach(pt => {
          ctx.beginPath(); ctx.arc(pt[0], pt[1], HANDLE / 2 / scale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(20,20,15,.55)'; ctx.fill(); ctx.lineWidth = lw * 1.5; ctx.strokeStyle = col; ctx.stroke();
          ctx.beginPath(); ctx.arc(pt[0], pt[1], 3 / scale, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
        });
        ctx.font = `${12 / scale}px Jost, sans-serif`; ctx.fillStyle = col;
        const c = q[0]; ctx.fillText(kind === 'wall' ? 'MUR' : 'SOL', c[0] + 14 / scale, c[1] + 22 / scale);
      });
      if (state.tool === 'erase') { ctx.font = `${12 / scale}px Jost, sans-serif`; ctx.fillStyle = '#F5F2EC'; ctx.fillText('GOMME : glissez sur les meubles à protéger', 12 / scale, p.canvas.height - 14 / scale); }
    }
    function pos(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; }
    function ensureMask(p) {
      if (!p.mask) { p.mask = document.createElement('canvas'); p.mask.width = p.canvas.width; p.mask.height = p.canvas.height; }
      return p.mask.getContext('2d');
    }
    function onDown(e) {
      const p = photo(); if (!p) return;
      cv.setPointerCapture(e.pointerId); e.preventDefault();
      const [x, y] = pos(e);
      if (state.tool === 'erase') {
        const snap = document.createElement('canvas'); snap.width = p.canvas.width; snap.height = p.canvas.height;
        if (p.mask) snap.getContext('2d').drawImage(p.mask, 0, 0);
        p.maskHistory.push(snap); if (p.maskHistory.length > 10) p.maskHistory.shift();
        const mctx = ensureMask(p);
        mctx.fillStyle = '#9C4A2F'; mctx.strokeStyle = '#9C4A2F'; mctx.lineCap = 'round'; mctx.lineJoin = 'round';
        mctx.lineWidth = Math.max(24, p.canvas.width * 0.05);
        stroke = { x, y }; mctx.beginPath(); mctx.arc(x, y, mctx.lineWidth / 2, 0, Math.PI * 2); mctx.fill();
        draw(); return;
      }
      const q = state.tool === 'wall' ? p.geometry.wall_quad : p.geometry.floor_quad;
      let best = -1, bd = (HANDLE * 1.4) / scale;
      q.forEach((pt, i) => { const d = Math.hypot(pt[0] - x, pt[1] - y); if (d < bd) { bd = d; best = i; } });
      if (best >= 0) drag = { q, i: best };
      else if (window.DCRender.pointInQuad(q, x, y)) drag = { q, i: -1, x, y };
    }
    function onMove(e) {
      const p = photo(); if (!p) return;
      const [x, y] = pos(e);
      if (stroke) { const mctx = ensureMask(p); mctx.beginPath(); mctx.moveTo(stroke.x, stroke.y); mctx.lineTo(x, y); mctx.stroke(); stroke = { x, y }; draw(); return; }
      if (!drag) return;
      const W = p.canvas.width, H = p.canvas.height;
      if (drag.i >= 0) drag.q[drag.i] = [Math.max(0, Math.min(W, x)), Math.max(0, Math.min(H, y))];
      else { const dx = x - drag.x, dy = y - drag.y; drag.q.forEach(pt => { pt[0] = Math.max(0, Math.min(W, pt[0] + dx)); pt[1] = Math.max(0, Math.min(H, pt[1] + dy)); }); drag.x = x; drag.y = y; }
      draw();
    }
    function onUp() { drag = null; stroke = null; }
    function undo() { const p = photo(); if (!p || !p.maskHistory.length) return; p.mask = p.maskHistory.pop(); draw(); }
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
    window.addEventListener('resize', () => { if (state.step === 3) mount(); });
    return { mount, draw, undo };
  })();
  function setTool(t) { state.tool = t; document.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t)); editor.draw(); }
  function renderZoneThumbs() {
    const root = el('zoneThumbs'); root.innerHTML = '';
    state.photos.forEach((p, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = i === state.current ? 'on' : ''; b.setAttribute('aria-label', 'Photo ' + (i + 1));
      b.innerHTML = `<img src="${p.thumb}" alt="">`;
      b.addEventListener('click', () => { saveGeometry(); state.current = i; renderZoneThumbs(); editor.mount(); });
      root.appendChild(b);
    });
  }
  function readGeometryInputs() {
    const p = currentPhoto(); if (!p) return;
    p.geometry.wall_height_cm = num(el('wallHeight').value);
    p.geometry.floor_width_cm = num(el('floorWidth').value);
  }
  async function saveGeometry() {
    readGeometryInputs();
    const p = currentPhoto(); if (!p || !state.token || !p.id) return;
    const g = p.geometry;
    const body = { geometry: { wall_quad: g.wall_on ? g.wall_quad.map(pt => pt.map(Math.round)) : null, floor_quad: g.floor_on ? g.floor_quad.map(pt => pt.map(Math.round)) : null, wall_height_cm: g.wall_height_cm, floor_width_cm: g.floor_width_cm } };
    if (p.mask) { try { body.geometry.mask_png_base64 = p.mask.toDataURL('image/png').split(',')[1]; } catch (e) { /* ignore */ } }
    try { await api('/' + state.token + '/photos/' + p.id, { method: 'PATCH', json: body }); } catch (e) { console.warn('geometry', e.message); }
  }

  /* ------------------------------------------------------ 4 · produit */
  function products(cat) { return state.catalog.products.filter(p => p.category === cat).sort((a, b) => (a.sort_order || a.sort || 0) - (b.sort_order || b.sort || 0)); }
  function renderCatalog() {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.cat === state.cat));
    const root = el('cards'); root.innerHTML = '';
    products(state.cat).forEach(p => {
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'card' + (state.product && state.product.id === p.id ? ' selected' : '');
      const isFloor = p.category === 'floor';
      const dims = p.unit_w_cm && p.unit_h_cm ? `${p.unit_w_cm} × ${p.unit_h_cm} cm` : '';
      b.innerHTML = `<div class="ph${isFloor ? ' floor' : ''}">${p.packshot_url ? `<img src="${esc(texUrl(p.packshot_url))}" alt="${esc(p.name)}" loading="lazy">` : ''}</div><div class="txt">${isFloor ? '' : '<span class="tm">Le Celestone™</span>'}<b>${esc(p.name)}</b><span>${esc(p.range_name || p.brand || '')}${dims ? ' · ' + dims : ''}</span></div>`;
      const tilePreview = () => { const t = getTexture(p); if (t && t.canvas) { const c = document.createElement('canvas'); c.width = 320; c.height = 240; drawTilePreview(c, t, p); const ph = b.querySelector('.ph'); ph.innerHTML = ''; ph.appendChild(c); } };
      if (!p.packshot_url) tilePreview();
      else b.querySelector('img').addEventListener('error', tilePreview, { once: true });
      b.addEventListener('click', () => selectProduct(p));
      root.appendChild(b);
    });
    renderOptions();
  }
  function drawTilePreview(c, t, p) {
    const ctx = c.getContext('2d'); const ppc = t.pxPerCm; const tile = t.canvas;
    const pat = ctx.createPattern(tile, 'repeat');
    ctx.save(); const s = (c.width / 160) / ppc; ctx.scale(s, s); ctx.fillStyle = pat; ctx.fillRect(0, 0, c.width / s, c.height / s); ctx.restore();
    if (p.category === 'floor') { ctx.strokeStyle = 'rgba(20,20,15,.35)'; ctx.lineWidth = 1; const hh = p.unit_h_cm * (c.width / 160); for (let y = 0; y < c.height; y += hh) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(c.width, y + 0.5); ctx.stroke(); } }
  }
  function selectProduct(p) {
    state.product = p;
    if (!p.patterns.includes(state.pattern)) state.pattern = p.patterns[0] || (p.category === 'wall' ? 'horizontal' : 'droit');
    if (p.category === 'floor') state.color = null;
    else if (p.colorable && !state.color) state.color = state.catalog.colors[0] || null;
    if (p.category === 'floor' && state.pattern === 'baton_rompu' && !state.orient) state.orient = 45;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    [...document.querySelectorAll('.card')].forEach(c => { if (c.querySelector('b') && c.querySelector('b').textContent === p.name) c.classList.add('selected'); });
    renderOptions(); showError(4, false); save();
    getTexture(p);
    if (state.token) api('/' + state.token + '/demand', { method: 'POST', json: { product_id: isFinite(Number(p.id)) ? Number(p.id) : null, category: p.category, pattern: state.pattern, color_family: state.color && state.color.family, served: 1, room_type: state.project.room_type, city: state.project.city, surface_m2: state.project.surface_m2 } }).catch(() => { });
  }
  function renderOptions() {
    const p = state.product;
    el('floorOptions').classList.toggle('hidden', !p || p.category !== 'floor');
    el('wallOptions').classList.toggle('hidden', !p || p.category !== 'wall' || !p.colorable);
    if (!p) return;
    if (p.category === 'floor') {
      const chips = el('patternChips'); chips.innerHTML = '';
      p.patterns.forEach(pt => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (pt === state.pattern ? ' on' : ''); b.textContent = PATTERN_LABEL[pt] || pt; b.addEventListener('click', () => { state.pattern = pt; if (pt === 'baton_rompu') state.orient = 45; renderOptions(); }); chips.appendChild(b); });
      document.querySelectorAll('[data-orient]').forEach(b => b.classList.toggle('on', Number(b.dataset.orient) === state.orient));
    } else {
      const sw = el('swatches'); sw.innerHTML = '';
      state.catalog.colors.forEach(k => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'swatch' + (state.color && state.color.code === k.code ? ' on' : '');
        b.innerHTML = `<i style="background:${esc(k.hex)}"></i><b>${esc(k.name)}</b><span>Jotun ${esc(k.code)}</span>`;
        b.addEventListener('click', () => { state.color = k; renderOptions(); showError(4, false); save(); });
        sw.appendChild(b);
      });
    }
  }
  async function sendDemand() {
    const txt = el('demandText').value.trim(); if (!txt) return;
    const payload = { category: state.cat, free_text: txt, served: 0, pattern: state.pattern, room_type: state.project.room_type, city: state.project.city, surface_m2: state.project.surface_m2 };
    if (state.token) { try { await api('/' + state.token + '/demand', { method: 'POST', json: payload }); } catch (e) { /* ignore */ } }
    el('demandText').value = ''; toast('Merci, c\'est noté. Nous en tenons compte.');
  }

  /* ---------------------------------------------------- textures */
  function texUrl(u) { return /^https?:/.test(u) ? u : (u.startsWith('/') ? API_BASE + u : u); }
  function getTexture(p) {
    if (textureCache.has(p.id)) return textureCache.get(p.id);
    const alb = (p.textures || []).find(t => t.kind === 'albedo');
    const t = alb ? { image: null, pxPerCm: alb.px_per_cm || 8, seamless: !!alb.seamless, loading: true } : window.DCRender.proceduralTexture(p.slug || slugOf(p), p.category, p.unit_w_cm, p.unit_h_cm);
    if (alb) {
      const url = texUrl(alb.url);
      fetch(url).then(r => r.blob()).then(b => createImageBitmap(b)).then(bmp => {
        const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height; c.getContext('2d').drawImage(bmp, 0, 0);
        t.canvas = c; t.wCm = c.width / t.pxPerCm; t.hCm = c.height / t.pxPerCm; t.loading = false;
        const nm = (p.textures || []).find(x => x.kind === 'normal');
        if (nm) fetch(texUrl(nm.url)).then(r => r.blob()).then(b => createImageBitmap(b)).then(n => { const nc = document.createElement('canvas'); nc.width = n.width; nc.height = n.height; nc.getContext('2d').drawImage(n, 0, 0); t.normal = nc; if (state.step === 5) runPreview(); }).catch(() => { });
        if (state.step === 5) runPreview();
        if (state.step === 4) renderCatalog();
      }).catch(() => { const proc = window.DCRender.proceduralTexture(p.slug || slugOf(p), p.category, p.unit_w_cm, p.unit_h_cm); Object.assign(t, proc, { loading: false }); if (state.step === 5) runPreview(); });
    }
    textureCache.set(p.id, t);
    return t;
  }

  /* ------------------------------------------------------ 5 · aperçu */
  function beforeUrl(p) {
    if (!p.beforeUrl) p.beforeUrl = p.canvas.toDataURL('image/jpeg', 0.82);
    return p.beforeUrl;
  }
  function buildLayers(p) {
    const g = p.geometry, prod = state.product, tex = getTexture(prod), layers = [];
    if (tex.loading) return null;
    const unit = { w: prod.unit_w_cm || (prod.category === 'floor' ? 90 : 240), h: prod.unit_h_cm || (prod.category === 'floor' ? 15 : 60) };
    if (prod.category === 'wall' && g.wall_on) layers.push({ kind: 'wall', quad: g.wall_quad, planeH: g.wall_height_cm || state.project.wall_height_cm || 260, texture: tex, normal: tex.normal || null, unit, pattern: state.pattern || 'horizontal', tint: prod.colorable && state.color ? state.color.hex : null, seed: 0.37 });
    if (prod.category === 'floor' && g.floor_on) layers.push({ kind: 'floor', quad: g.floor_quad, planeW: g.floor_width_cm || 400, texture: tex, normal: tex.normal || null, unit, pattern: state.pattern || 'droit', orientationDeg: state.orient, seed: 0.61 });
    return layers;
  }
  let previewBusy = false;
  function runPreview() {
    const p = currentPhoto(); if (!p || !state.product) return;
    readGeometryInputs();
    const info = el('renderInfo');
    if (state.product.category === 'wall' && !p.geometry.wall_on) { info.textContent = 'Activez la zone « Mur » sur cette photo pour projeter un panneau.'; return; }
    if (state.product.category === 'floor' && !p.geometry.floor_on) { info.textContent = 'Activez la zone « Sol » sur cette photo pour projeter un sol.'; return; }
    const layers = buildLayers(p);
    if (!layers) { info.textContent = 'Chargement de la texture…'; return; }
    if (previewBusy) return; previewBusy = true;
    info.textContent = 'Calcul en cours…';
    requestAnimationFrame(() => {
      try {
        const r = renderer.render({ photo: p.canvas, layers, mask: p.mask, watermark: true, maxSize: 2048 });
        const pc = el('previewCanvas'); pc.width = r.canvas.width; pc.height = r.canvas.height; pc.getContext('2d').drawImage(r.canvas, 0, 0);
        el('beforeImg').src = beforeUrl(p);
        const L = r.layers[0];
        info.textContent = `${r.ms} ms · ${r.mode === 'webgl2' ? 'WebGL' : 'Canvas'} · plan estimé ${L ? L.planeW + ' × ' + L.planeH + ' cm' : ''}`;
        el('previewTitle').textContent = state.product.category === 'wall' ? `${state.product.name}${state.color ? ' · ' + state.color.name : ''}` : `${state.product.name} · ${PATTERN_LABEL[state.pattern] || state.pattern}`;
        state.lastRender = { photo: p, product: state.product, color: state.color, pattern: state.pattern, orient: state.orient };
        track('VisualiserRender', { product: state.product.name, category: state.product.category });
      } catch (e) { console.error(e); info.textContent = 'Le rendu a échoué sur cet appareil. Essayez une photo plus petite ou un autre navigateur.'; }
      previewBusy = false;
      renderVariants();
    });
  }
  function renderVariants() {
    const wrap = el('variantsWrap'), root = el('variants');
    const show = state.product && state.product.category === 'wall' && state.product.colorable;
    wrap.classList.toggle('hidden', !show); if (!show) return;
    root.innerHTML = '';
    state.catalog.colors.forEach(k => {
      const b = document.createElement('button'); b.type = 'button'; b.className = state.color && state.color.code === k.code ? 'on' : ''; b.title = `${k.name} · Jotun ${k.code}`;
      b.innerHTML = `<i style="background:${esc(k.hex)}"></i><span>${esc(k.name)}</span>`;
      b.addEventListener('click', () => { state.color = k; root.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); runPreview(); save(); });
      root.appendChild(b);
    });
  }
  function bindCompare(id, rangeId) {
    const box = el(id), r = el(rangeId);
    r.addEventListener('input', () => box.style.setProperty('--pos', r.value + '%'));
  }

  /* ---------------------------------------------------- 6 · rendu HD */
  let hdPoll = null;
  async function requestHD() {
    const lr = state.lastRender; const p = lr && lr.photo;
    el('hdResult').classList.add('hidden'); el('hdWait').classList.remove('hidden'); el('hdSpin').classList.remove('hidden');
    el('nav').classList.remove('hidden'); el('nextBtn').textContent = 'Continuer vers le contact';
    track('VisualiserHD', { demo: state.demo });
    const localBlob = await renderer.exportJPEG(0.9);
    const localUrl = URL.createObjectURL(localBlob);
    const entry = { id: null, local_url: localUrl, blob: localBlob, status: 'local', product: lr.product.name, color: lr.color ? lr.color.name + ' (Jotun ' + lr.color.code + ')' : null, pattern: lr.pattern, url: null, url_ai: null };
    state.renders.push(entry);
    if (!state.token || !p.id) {
      el('hdTitle').textContent = state.demo ? 'Affinage HD indisponible en mode démonstration' : 'Affinage HD indisponible pour cette photo';
      el('hdText').textContent = 'Votre aperçu instantané est conservé et sera transmis à notre conseiller. Continuez vers le contact.';
      el('hdSpin').classList.add('hidden');
      return;
    }
    try {
      await saveGeometry();
      el('hdTitle').textContent = 'Envoi de votre aperçu…';
      const meta = { photo_id: p.id, product_id: isFinite(Number(lr.product.id)) ? Number(lr.product.id) : lr.product.id, color_code: lr.color ? lr.color.code : null, pattern: lr.pattern, orientation_deg: lr.orient || 0, want_ai: true };
      const r = await api('/' + state.token + '/renders', { method: 'POST', body: localBlob, headers: { 'Content-Type': 'application/octet-stream', 'X-Render': JSON.stringify(meta) }, timeout: 90000 });
      const rr = r.render || r;
      entry.id = rr.id; entry.status = rr.status || 'done';
      applyRenderUrls(entry, rr);
      if (entry.status === 'queued' || entry.status === 'processing') {
        el('hdTitle').textContent = 'Affinage en cours…';
        el('hdText').textContent = 'Nous ajustons lumière, ombres et bords dans la zone choisie. Comptez 30 à 90 secondes. Vous pouvez continuer : le rendu vous sera envoyé avec le dossier.';
        const t0 = Date.now();
        clearInterval(hdPoll);
        hdPoll = setInterval(async () => {
          try {
            const s = await api('/' + state.token + '/renders/' + entry.id, { timeout: 15000 });
            const ss = s.render || s;
            entry.status = ss.status || entry.status; applyRenderUrls(entry, ss);
            if (['done', 'failed', 'review'].includes(entry.status) || Date.now() - t0 > 150000) { clearInterval(hdPoll); showHD(entry); }
          } catch (e) { if (Date.now() - t0 > 150000) { clearInterval(hdPoll); showHD(entry); } }
        }, 3000);
      } else showHD(entry);
    } catch (e) {
      console.warn('render HD', e.message);
      el('hdTitle').textContent = 'Le rendu HD n\'a pas pu être envoyé';
      el('hdText').textContent = 'Votre aperçu instantané est conservé sur cet appareil et sera joint à votre message WhatsApp. Continuez vers le contact.';
      el('hdSpin').classList.add('hidden');
    }
  }
  function applyRenderUrls(entry, rr) {
    const abs = (u) => u ? (/^https?:/.test(u) ? u : API_BASE + u) : null;
    entry.url = abs(rr.file_url || rr.url || (rr.file ? `/api/public/visualiser/${state.token}/files/${rr.file}` : null));
    entry.url_ai = abs(rr.file_ai_url || rr.url_ai || rr.ai_url || (rr.file_ai ? `/api/public/visualiser/${state.token}/files/${rr.file_ai}` : null));
  }
  function showHD(entry) {
    el('hdSpin').classList.add('hidden');
    const p = state.lastRender.photo;
    if (entry.url_ai && entry.status !== 'failed') {
      el('hdTitle').textContent = 'Rendu HD prêt';
      el('hdText').textContent = 'Lumière et ombres harmonisées dans la zone choisie. Le reste de la photo est inchangé.';
      el('hdAfter').src = entry.url_ai; el('hdBefore').src = beforeUrl(p);
      el('hdResult').classList.remove('hidden');
    } else {
      el('hdTitle').textContent = entry.status === 'failed' ? 'Affinage HD non disponible pour cette photo' : 'Aperçu enregistré';
      el('hdText').textContent = 'Votre aperçu instantané est conservé tel quel dans votre dossier. Continuez vers le contact.';
    }
  }

  /* ---------------------------------------------------- 7 · contact */
  function summaryText() {
    const items = state.renders.map(r => r.product + (r.color ? ' · ' + r.color : '') + (r.pattern && r.pattern !== 'horizontal' ? ' · ' + (PATTERN_LABEL[r.pattern] || r.pattern) : ''));
    const uniq = [...new Set(items)];
    return uniq.length ? uniq.join(' ; ') : (state.product ? state.product.name : 'produit à définir');
  }
  function waLink(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
  function localWa(kind) {
    const code = state.dossier && state.dossier.dossier_code ? ' (code ' + state.dossier.dossier_code + ')' : '';
    const base = `Bonjour Deutschconfort, voici mon projet visualisé${code} : ${summaryText()}. Pièce : ${state.project.room_type || '—'}, ${state.project.city || ''}${state.project.surface_m2 ? ', ~' + state.project.surface_m2 + ' m²' : ''}.`;
    const suffix = kind === 'rdv' ? ' Je souhaite un rendez-vous au showroom.' : kind === 'metre' ? ' Je souhaite un métré.' : ' Je souhaite un rendez-vous / métré.';
    return waLink(base + suffix + (state.contact.first ? ` — ${state.contact.first} ${state.contact.last}` : ''));
  }
  async function submitContact() {
    if (el('website').value) { go(8); return; } // pot de miel
    el('nextBtn').disabled = true; el('nextBtn').textContent = 'Envoi…';
    const c = state.contact;
    const payload = {
      full_name: (c.first + ' ' + c.last).trim(), phone: c.phone, email: c.email || null, city: c.city || state.project.city,
      project_type: state.project.project_type || 'particulier', surface_m2: state.project.surface_m2, timeframe: state.project.timeframe,
      is_pro: state.project.project_type === 'professionnel' ? 1 : 0, profession: c.profession || null, message: c.message || null,
      selected: state.renders.filter(r => r.id).map(r => ({ render_id: r.id })), room_type: state.project.room_type
    };
    if (state.token) {
      try { state.dossier = await api('/' + state.token + '/contact', { method: 'POST', json: payload, timeout: 30000 }); }
      catch (e) { console.warn('contact', e.message); toast('Envoi impossible : votre projet part par WhatsApp.'); }
    }
    track('Lead', { content_name: 'visualiseur', city: payload.city });
    el('nextBtn').disabled = false;
    renderFinal(); go(8);
  }

  /* ------------------------------------------------------- 8 · final */
  function renderFinal() {
    const root = el('results'); root.innerHTML = '';
    state.renders.forEach((r, i) => {
      const d = document.createElement('div'); d.className = 'result';
      d.innerHTML = `<img src="${esc(r.url_ai || r.local_url)}" alt="Rendu ${i + 1}"><span class="cap">${esc(r.product)}${r.color ? ' · ' + esc(r.color) : ''}${r.url_ai ? ' · HD' : ''} · indicatif</span>`;
      root.appendChild(d);
    });
    const wa = (state.dossier && state.dossier.whatsapp_url) || localWa();
    el('waBtn').href = wa; el('rdvBtn').href = localWa('rdv'); el('metreBtn').href = localWa('metre');
    el('finalLead').textContent = state.dossier && state.dossier.dossier_code ? `Votre projet porte le code ${state.dossier.dossier_code}. Un conseiller Deutschconfort reprend contact sur WhatsApp ; vous pouvez aussi nous écrire dès maintenant.` : (state.demo ? 'Le serveur est injoignable : envoyez votre projet directement sur WhatsApp, le rendu ci-dessus est à joindre au message.' : 'Un conseiller Deutschconfort reprend contact sur WhatsApp. Vous pouvez aussi nous écrire dès maintenant.');
    const link = state.token ? location.origin + location.pathname + '?v=' + state.token : '';
    el('resumeRow').innerHTML = link ? `Reprendre ce projet plus tard : <code>${esc(link)}</code>` : '';
    el('shareBtn').classList.toggle('hidden', !navigator.share);
  }
  async function share() {
    const r = state.renders[state.renders.length - 1]; if (!r) return;
    try {
      const file = new File([r.blob], 'visualisation-deutschconfort.jpg', { type: 'image/jpeg' });
      const data = { title: 'Visualisation Deutschconfort', text: 'Visualisation indicative · Deutschconfort · ' + r.product };
      if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file]; else if (r.url_ai || r.url) data.url = r.url_ai || r.url;
      await navigator.share(data);
    } catch (e) { /* annulé */ }
  }
  async function deleteProject() {
    if (!confirm('Supprimer définitivement vos photos, rendus et ce projet ?')) return;
    if (state.token) { try { await api('/' + state.token, { method: 'DELETE' }); } catch (e) { toast('Suppression impossible pour le moment : écrivez-nous sur WhatsApp.'); return; } }
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    toast('Projet supprimé.'); setTimeout(() => location.replace(location.pathname), 900);
  }
  function restart() {
    if (state.step > 0 && !confirm('Recommencer un nouveau projet ? Les photos non envoyées seront perdues.')) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    location.replace(location.pathname);
  }

  /* ----------------------------------------------------------- reprise */
  async function resume(token) {
    try {
      const s = await api('/' + token, { timeout: 12000 });
      const sess = s.session || s;
      state.token = token;
      Object.assign(state.project, { room_type: sess.room_type || '', city: sess.city || '', surface_m2: sess.surface_m2 || null, wall_height_cm: sess.wall_height_cm || null, project_type: sess.project_type || '', timeframe: sess.timeframe || '' });
      const photos = s.photos || sess.photos || [];
      for (const ph of photos) {
        const url = ph.url || ph.file_url || (ph.file ? `${API}/${token}/files/${ph.file}` : null);
        if (!url) continue;
        try {
          const blob = await (await fetch(/^https?:/.test(url) ? url : API_BASE + url)).blob();
          const canvas = await fileToCanvas(blob, 2048);
          const geo = typeof ph.geometry === 'string' ? JSON.parse(ph.geometry || '{}') : (ph.geometry || ph.geometry_json || {});
          const g = defaultGeometry(canvas, ph.angle_hint || 'face');
          if (geo.wall_quad) { g.wall_quad = geo.wall_quad; g.wall_on = true; } else if (geo.floor_quad) g.wall_on = false;
          if (geo.floor_quad) { g.floor_quad = geo.floor_quad; g.floor_on = true; }
          if (geo.wall_height_cm) g.wall_height_cm = geo.wall_height_cm;
          if (geo.floor_width_cm) g.floor_width_cm = geo.floor_width_cm;
          const thumbC = document.createElement('canvas'); const ts = 240 / Math.max(canvas.width, canvas.height);
          thumbC.width = Math.round(canvas.width * ts); thumbC.height = Math.round(canvas.height * ts); thumbC.getContext('2d').drawImage(canvas, 0, 0, thumbC.width, thumbC.height);
          state.photos.push({ lid: uid++, id: ph.id, canvas, thumb: thumbC.toDataURL('image/jpeg', 0.7), angle: ph.angle_hint || 'autre', quality: ph.quality || {}, geometry: g, mask: null, maskHistory: [], beforeUrl: null });
        } catch (e) { console.warn('photo reprise', e.message); }
      }
      state.current = state.photos.length ? 0 : -1;
      (s.renders || []).forEach(r => { const e = { id: r.id, status: r.status, product: r.product_name || 'Rendu', color: r.color_code ? 'Jotun ' + r.color_code : null, pattern: r.pattern, local_url: null, blob: null }; applyRenderUrls(e, r); e.local_url = e.url; if (e.url || e.url_ai) state.renders.push(e); });
      state.consent = true; el('consent').checked = true;
      fillProjectInputs();
      if (sess.status === 'contacted') { renderFinal(); go(8); }
      else if (state.photos.length) go(3); else go(1);
      toast('Projet repris.');
      return true;
    } catch (e) { console.warn('reprise', e.message); return false; }
  }
  function fillProjectInputs() {
    el('city').value = state.project.city || ''; el('surface').value = state.project.surface_m2 || ''; el('ceiling').value = state.project.wall_height_cm || '';
    document.querySelectorAll('[data-field][data-value]').forEach(b => b.classList.toggle('selected', state.project[b.dataset.field] === b.dataset.value));
  }

  /* ------------------------------------------------- photo de test */
  async function loadTestPhoto(url) {
    try { const blob = await (await fetch(url)).blob(); await addPhoto(blob, 'face'); } catch (e) { console.warn('photo de test', e.message); }
  }

  /* --------------------------------------------------------------- boot */
  async function boot() {
    bindProject();
    el('nextBtn').addEventListener('click', next);
    el('backBtn').addEventListener('click', back);
    el('restartBtn').addEventListener('click', restart);
    el('consent').addEventListener('change', () => showError(0, false));
    el('levelBtn').addEventListener('click', enableLevel);
    document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
    el('toolUndo').addEventListener('click', editor.undo);
    el('toggleWall').addEventListener('click', () => { const p = currentPhoto(); if (!p) return; p.geometry.wall_on = !p.geometry.wall_on; editor.mount(); });
    el('toggleFloor').addEventListener('click', () => { const p = currentPhoto(); if (!p) return; p.geometry.floor_on = !p.geometry.floor_on; if (p.geometry.floor_on && !p.geometry.floor_width_cm && p.geometry.wall_on) el('floorWidth').placeholder = 'Ex. 400'; editor.mount(); if (p.geometry.floor_on) setTool('floor'); });
    el('wallHeight').addEventListener('input', readGeometryInputs); el('floorWidth').addEventListener('input', readGeometryInputs);
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { state.cat = t.dataset.cat; renderCatalog(); }));
    document.querySelectorAll('[data-orient]').forEach(b => b.addEventListener('click', () => { state.orient = Number(b.dataset.orient); renderOptions(); }));
    el('demandBtn').addEventListener('click', sendDemand);
    el('demandText').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sendDemand(); } });
    bindCompare('compare', 'compareRange'); bindCompare('hdCompare', 'hdRange');
    el('otherPhotoBtn').addEventListener('click', () => { if (state.photos.length > 1) { state.current = (state.current + 1) % state.photos.length; go(3); } else { go(2); } });
    el('otherProductBtn').addEventListener('click', () => go(4));
    el('adjustZoneBtn').addEventListener('click', () => go(3));
    el('shareBtn').addEventListener('click', share);
    el('deleteBtn').addEventListener('click', deleteProject);
    if (!window.DCRender || renderer.mode === 'canvas2d') console.info('[visualiseur] rendu :', renderer.mode);

    await loadCatalog();
    const v = qsp.get('v');
    const stored = load();
    if (v && !state.demo) { if (await resume(v)) return; }
    else if (stored && stored.token && stored.step >= 3 && !state.demo) { state.project = Object.assign(state.project, stored.project || {}); if (await resume(stored.token)) return; }
    if (stored && stored.project) { state.project = Object.assign(state.project, stored.project); fillProjectInputs(); }
    go(0);
    if (qsp.get('demo_photo')) { el('consent').checked = true; await startSession(); await loadTestPhoto(qsp.get('demo_photo')); go(2); }
  }
  boot();
})();
