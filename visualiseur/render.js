/* ============================================================================
   Visualiseur Deutschconfort — render.js
   Moteur de projection : WebGL2 (repli Canvas 2D).
   - homographie quad -> plan (cm), tuilage à l'échelle réelle
   - motifs : panneaux (horizontal/vertical), lames (droit, chevron, point de
     Hongrie, bâton rompu)
   - ombrage conservé : luminance de la photo (flou 3 px) normalisée par sa
     moyenne sous le quad, multipliée à l'albedo
   - teinte Jotun (murs) : albedo blanc × couleur en espace linéaire
   - relief : normal map facultative, sinon accentuation douce depuis l'albedo
   - anti-aliasing des bords, masque d'occlusion, filigrane
   - export JPEG du composite + PNG du masque (zone rendue moins occlusion)
   Aucune dépendance. ES2020.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ utils */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function srgbToLinear(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function linearToSrgb(v) { v = clamp(v, 0, 1); return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; }
  function hexToLinear(hex) {
    const m = String(hex || '').replace('#', '');
    if (m.length < 6) return [0.8, 0.8, 0.8];
    return [srgbToLinear(parseInt(m.slice(0, 2), 16)), srgbToLinear(parseInt(m.slice(2, 4), 16)), srgbToLinear(parseInt(m.slice(4, 6), 16))];
  }

  /* ------------------------------------------------------------ homographie */
  // Résout H (3x3, ligne-majeure) telle que dst = H * src pour 4 correspondances.
  function homography(src, dst) {
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const x = src[i][0], y = src[i][1], u = dst[i][0], v = dst[i][1];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    const h = solve(A, b);
    if (!h) return null;
    return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
  }
  function solve(A, b) {
    const n = b.length, M = A.map((r, i) => r.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-12) return null;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c] / M[c][c];
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return M.map((r, i) => r[n] / r[i]);
  }
  function invert3(m) {
    const [a, b, c, d, e, f, g, h, i] = m;
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    const det = a * A + b * B + c * C;
    if (Math.abs(det) < 1e-14) return null;
    const s = 1 / det;
    return [A * s, (c * h - b * i) * s, (b * f - c * e) * s,
      B * s, (a * i - c * g) * s, (c * d - a * f) * s,
      C * s, (b * g - a * h) * s, (a * e - b * d) * s];
  }
  function applyH(m, x, y) {
    const w = m[6] * x + m[7] * y + m[8];
    return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
  }

  /* -------------------------------------------- ratio réel du rectangle (cm) */
  // Zhang & He, "Whiteboard scanning" : ratio largeur/hauteur d'un rectangle
  // vu en perspective, focale supposée 0,85 × max(W,H), point principal centré.
  function estimateAspect(quad, W, H) {
    const f = 0.85 * Math.max(W, H), u0 = W / 2, v0 = H / 2;
    const m = (p) => [p[0] - u0, p[1] - v0, 1];
    const m1 = m(quad[0]), m2 = m(quad[1]), m3 = m(quad[3]), m4 = m(quad[2]); // TL, TR, BL, BR
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const k2d = dot(cross(m2, m4), m3), k3d = dot(cross(m3, m4), m2);
    if (Math.abs(k2d) < 1e-9 || Math.abs(k3d) < 1e-9) return fallbackAspect(quad);
    const k2 = dot(cross(m1, m4), m3) / k2d, k3 = dot(cross(m1, m4), m2) / k3d;
    const n2 = [k2 * m2[0] - m1[0], k2 * m2[1] - m1[1], k2 * m2[2] - m1[2]];
    const n3 = [k3 * m3[0] - m1[0], k3 * m3[1] - m1[1], k3 * m3[2] - m1[2]];
    const q = (n) => (n[0] * n[0] + n[1] * n[1]) / (f * f) + n[2] * n[2];
    const num = q(n2), den = q(n3);
    if (!(num > 0) || !(den > 0)) return fallbackAspect(quad);
    const r = Math.sqrt(num / den);
    if (!isFinite(r)) return fallbackAspect(quad);
    return clamp(r, 0.15, 12);
  }
  function fallbackAspect(q) {
    const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const w = (d(q[0], q[1]) + d(q[3], q[2])) / 2, h = (d(q[0], q[3]) + d(q[1], q[2])) / 2;
    return clamp(w / Math.max(1, h), 0.15, 12);
  }

  /* ---------------------------------------------------- géométrie de plan */
  function pointInQuad(q, x, y) {
    let inside = false;
    for (let i = 0, j = 3; i < 4; j = i++) {
      const xi = q[i][0], yi = q[i][1], xj = q[j][0], yj = q[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function quadBounds(q) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    q.forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    return { x0, y0, x1, y1 };
  }

  /* ------------------------------------------------- luminance de la photo */
  // Carte de luminance linéaire floutée (~3 px) à l'échelle de la photo.
  function luminanceMap(photo, w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    let blurred = false;
    try { if ('filter' in ctx) { ctx.filter = 'blur(3px)'; blurred = true; } } catch (e) { /* ignore */ }
    ctx.drawImage(photo, 0, 0, w, h);
    ctx.filter = 'none';
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    const lum = new Float32Array(w * h);
    const lut = new Float32Array(256); for (let i = 0; i < 256; i++) lut[i] = srgbToLinear(i);
    for (let i = 0, p = 0; i < lum.length; i++, p += 4) lum[i] = 0.2126 * lut[d[p]] + 0.7152 * lut[d[p + 1]] + 0.0722 * lut[d[p + 2]];
    if (!blurred) boxBlur(lum, w, h, 2);
    // Encodage 8 bits (racine carrée pour garder de la précision dans les ombres)
    const enc = new Uint8Array(w * h);
    for (let i = 0; i < lum.length; i++) enc[i] = Math.round(Math.sqrt(clamp(lum[i], 0, 1)) * 255);
    return { lum, enc, w, h };
  }
  function boxBlur(a, w, h, r) {
    const tmp = new Float32Array(a.length);
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let s = 0, n = 0;
        for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < w) { s += a[y * w + xx]; n++; } }
        tmp[y * w + x] = s / n;
      }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let s = 0, n = 0;
        for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; n++; } }
        a[y * w + x] = s / n;
      }
    }
  }
  // Moyenne de luminance sous le quad + vecteur lumière estimé du gradient.
  function quadStats(lm, quad, H) {
    const b = quadBounds(quad);
    const step = Math.max(1, Math.round(Math.max(b.x1 - b.x0, b.y1 - b.y0) / 96));
    let sum = 0, n = 0;
    // régression lum ~ a + p*s + q*t  (s,t : coordonnées plan normalisées)
    let Ss = 0, St = 0, Sss = 0, Stt = 0, Sst = 0, Sl = 0, Ssl = 0, Stl = 0;
    const Hinv = invert3(H);
    for (let y = Math.max(0, b.y0 | 0); y < Math.min(lm.h, b.y1); y += step) {
      for (let x = Math.max(0, b.x0 | 0); x < Math.min(lm.w, b.x1); x += step) {
        if (!pointInQuad(quad, x + 0.5, y + 0.5)) continue;
        const l = lm.lum[y * lm.w + x];
        sum += l; n++;
        if (Hinv) {
          const p = applyH(Hinv, x, y);
          const s = p[0], t = p[1];
          Ss += s; St += t; Sss += s * s; Stt += t * t; Sst += s * t; Sl += l; Ssl += s * l; Stl += t * l;
        }
      }
    }
    const mean = n ? sum / n : 0.3;
    let light = [0, 0, 1];
    if (n > 12) {
      // Résolution des équations normales (3x3)
      const sol = solve([[n, Ss, St], [Ss, Sss, Sst], [St, Sst, Stt]], [Sl, Ssl, Stl]);
      if (sol) {
        const gx = sol[1] / Math.max(mean, 1e-3), gy = sol[2] / Math.max(mean, 1e-3);
        const k = 220; // sensibilité (cm)
        const lx = clamp(gx * k, -0.8, 0.8), ly = clamp(gy * k, -0.8, 0.8);
        const len = Math.hypot(lx, ly, 1);
        light = [lx / len, ly / len, 1 / len];
      }
    }
    return { mean: Math.max(mean, 0.02), light, count: n };
  }

  /* -------------------------------------------------- textures procédurales */
  function makeNoise(seed) {
    function h(ix, iy) {
      let n = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1274126177)) | 0;
      n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16;
      return (n >>> 0) / 4294967296;
    }
    return function (x, y, px, py) {
      const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const w = (a, b) => h(((a % px) + px) % px, ((b % py) + py) % py);
      const a = w(ix, iy), b = w(ix + 1, iy), c = w(ix, iy + 1), d = w(ix + 1, iy + 1);
      return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    };
  }
  function fbm(noise, x, y, px, py, oct) {
    let s = 0, a = 0.5, f = 1, t = 0;
    for (let i = 0; i < oct; i++) { s += a * noise(x * f, y * f, px * f, py * f); t += a; a *= 0.5; f *= 2; }
    return s / t;
  }
  function hash1(a, b, seed) {
    let n = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(seed | 0, 1274126177)) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16;
    return (n >>> 0) / 4294967296;
  }

  // Tuile de relief (gris) pour panneaux Le Celestone : 60 × 60 cm, sans raccord.
  function wallTile(slug) {
    const S = 512, CM = 60, ppc = S / CM;
    const c = document.createElement('canvas'); c.width = S; c.height = S;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(S, S), d = img.data;
    const seed = slug.split('').reduce((a, ch) => a + ch.charCodeAt(0) * 31, 7);
    const noise = makeNoise(seed);
    const grain = (x, y) => fbm(noise, x * 0.6, y * 0.6, 36, 36, 4);   // x,y en cm
    const micro = (x, y) => noise(x * 4, y * 4, 240, 240);
    let val;
    switch (slug) {
      case 'big-rock': {
        // assises de pierre bouchardée : hauteurs [9,11,10,8,12,10] = 60 cm
        const courses = [9, 11, 10, 8, 12, 10];
        const courseTop = []; let acc = 0; courses.forEach(hh => { courseTop.push(acc); acc += hh; });
        const splits = courses.map((hh, ci) => {
          const arr = [0]; let x = 0, k = 0;
          while (x < CM - 6) { x += 9 + Math.floor(hash1(ci, k++, seed) * 13); if (x < CM - 5) arr.push(x); }
          arr.push(CM); return arr;
        });
        const J = 0.7; // joint 7 mm
        val = (x, y) => {
          let ci = courses.length - 1;
          for (let i = 0; i < courses.length; i++) if (y >= courseTop[i] && y < courseTop[i] + courses[i]) { ci = i; break; }
          const top = courseTop[ci], hh = courses[ci];
          const sp = splits[ci]; let bi = 0;
          for (let i = 0; i < sp.length - 1; i++) if (x >= sp[i] && x < sp[i + 1]) { bi = i; break; }
          const bx0 = sp[bi], bx1 = sp[bi + 1];
          const dy = Math.min(y - top, top + hh - y), dx = Math.min(x - bx0, bx1 - x);
          const edge = Math.min(dx, dy);
          const face = 0.76 + 0.16 * hash1(ci * 31, bi, seed + 3);
          const rough = (grain(x + bi * 7, y + ci * 5) - 0.5) * 0.28 + (micro(x, y) - 0.5) * 0.12;
          const lit = 1 + 0.10 * (1 - clamp((y - top) / hh, 0, 1)) - 0.06; // haut clair, bas ombré
          let v = (face + rough) * lit;
          if (edge < J) v = 0.34 + 0.12 * micro(x, y);                       // joint creux
          else if (edge < J + 0.5) v *= 0.75 + 0.25 * (edge - J) / 0.5;       // arête cassée
          return v;
        };
        break;
      }
      case 'beton-brut': {
        val = (x, y) => {
          let v = 0.80 + (fbm(noise, x * 0.12, y * 0.12, 7.2, 7.2, 3) - 0.5) * 0.16 + (micro(x, y) - 0.5) * 0.06;
          v += (fbm(noise, x * 0.9, y * 0.05, 54, 3, 2) - 0.5) * 0.05; // stries de talochage
          for (let i = 0; i < 14; i++) {                                     // bulles
            const cx = hash1(i, 1, seed) * CM, cy = hash1(i, 2, seed) * CM, r = 0.25 + hash1(i, 3, seed) * 0.5;
            const dx = Math.min(Math.abs(x - cx), CM - Math.abs(x - cx)), dy = Math.min(Math.abs(y - cy), CM - Math.abs(y - cy));
            const dd = Math.hypot(dx, dy);
            if (dd < r) v *= 0.45 + 0.4 * (dd / r);
          }
          return v;
        };
        break;
      }
      case 'cemento': {
        val = (x, y) => {
          let v = 0.84 + (fbm(noise, x * 0.15, y * 0.15, 9, 9, 3) - 0.5) * 0.08 + (micro(x, y) - 0.5) * 0.03;
          const holes = [[15, 30], [45, 30]];
          holes.forEach(hc => {
            const dd = Math.hypot(x - hc[0], y - hc[1]);
            if (dd < 1.1) v = 0.28 + 0.3 * clamp((dd - 0.5) / 0.6, 0, 1);
            else if (dd < 1.6) v *= 0.82 + 0.18 * (dd - 1.1) / 0.5;
          });
          return v;
        };
        break;
      }
      case 'brick': case 'mattoni': {
        const bw = slug === 'brick' ? 20 : 30, bh = slug === 'brick' ? 6 : 7.5, jw = slug === 'brick' ? 1.0 : 0.8;
        val = (x, y) => {
          const row = Math.floor(y / bh);
          const xs = x + (row % 2) * bw / 2;
          const col = Math.floor(xs / bw);
          const lx = xs - col * bw, ly = y - row * bh;
          const edge = Math.min(lx, bw - lx, ly, bh - ly);
          const face = 0.72 + 0.2 * hash1(col + row * 17, row, seed + 5);
          let v = face + (grain(x + col * 3, y + row * 2) - 0.5) * 0.22 + (micro(x, y) - 0.5) * 0.08;
          const chip = fbm(noise, x * 1.3, y * 1.3, 78, 78, 2);
          if (edge < jw * 0.5) v = 0.42 + 0.14 * micro(x, y);
          else if (edge < jw * 0.5 + 0.35 + chip * 0.35) v *= 0.7;
          return v;
        };
        break;
      }
      case 'cubo': case 'bois-cubo': {
        const sq = 10;
        val = (x, y) => {
          const col = Math.floor(x / sq), row = Math.floor(y / sq);
          const lx = x - col * sq, ly = y - row * sq;
          const lvl = Math.floor(hash1(col, row, seed + 9) * 3); // 0..2 : saillie
          const base = [0.66, 0.78, 0.9][lvl];
          let v = base;
          if (slug === 'bois-cubo') {
            const vert = hash1(col * 3, row * 5, seed) > 0.5;
            const gx = vert ? y : x, gy = vert ? x : y;
            v += (fbm(noise, gx * 0.25 + col * 3, gy * 2.2 + row * 7, 15, 132, 3) - 0.5) * 0.26;
          } else {
            v += (micro(x, y) - 0.5) * 0.05 + (grain(x, y) - 0.5) * 0.06;
          }
          const e = 0.35 * (lvl + 1);                       // largeur d'ombre selon la saillie
          if (lx > sq - e) v *= 0.55;                       // arête droite ombrée
          else if (ly > sq - e) v *= 0.62;                  // arête basse ombrée
          else if (lx < 0.25 || ly < 0.25) v = Math.min(1, v * 1.08); // arêtes hautes éclairées
          return v;
        };
        break;
      }
      case 'moon': {
        const craters = [];
        for (let i = 0; i < 9; i++) craters.push([hash1(i, 11, seed) * CM, hash1(i, 12, seed) * CM, 3.5 + hash1(i, 13, seed) * 6]);
        val = (x, y) => {
          let v = 0.84 + (fbm(noise, x * 0.2, y * 0.2, 12, 12, 3) - 0.5) * 0.10 + (micro(x, y) - 0.5) * 0.05;
          craters.forEach(cr => {
            const dx = Math.min(Math.abs(x - cr[0]), CM - Math.abs(x - cr[0])), dy = Math.min(Math.abs(y - cr[1]), CM - Math.abs(y - cr[1]));
            const dd = Math.hypot(dx, dy) / cr[2];
            if (dd < 1) {
              const sdx = ((x - cr[0] + CM * 1.5) % CM) - CM / 2, sdy = ((y - cr[1] + CM * 1.5) % CM) - CM / 2;
              const ang = (sdx * -0.6 + sdy * -0.8) / (cr[2] + 1e-3);      // lumière haut-gauche
              v *= 0.85 + 0.12 * ang * (1 - dd) - 0.18 * (1 - dd) * (1 - dd);
              if (dd > 0.86) v *= 1.06 + 0.06 * ang;                         // rebord
            }
          });
          return v;
        };
        break;
      }
      default:
        val = (x, y) => 0.85 + (grain(x, y) - 0.5) * 0.1;
    }
    for (let py = 0, i = 0; py < S; py++) for (let px = 0; px < S; px++, i += 4) {
      const v = clamp(val((px + 0.5) / ppc, (py + 0.5) / ppc), 0.05, 1);
      const g = Math.round(linearToSrgb(v) * 255);
      d[i] = g; d[i + 1] = g; d[i + 2] = g; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return { canvas: c, pxPerCm: ppc, wCm: CM, hCm: CM, seamless: true, procedural: true };
  }

  // Tuile de lame (couleur) pour sols : L × W cm, sans raccord en longueur.
  function floorTile(slug, L, W) {
    const ppc = 6;
    const SW = Math.round(L * ppc), SH = Math.round(W * ppc);
    const c = document.createElement('canvas'); c.width = SW; c.height = SH;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(SW, SH), d = img.data;
    const seed = slug.split('').reduce((a, ch) => a + ch.charCodeAt(0) * 17, 3);
    const noise = makeNoise(seed);
    const cfg = {
      'chene-clair': { base: [0.62, 0.45, 0.28], ring: 0.16, grainAmp: 0.14, fine: 0.05 },
      'chene-fume': { base: [0.30, 0.20, 0.13], ring: 0.22, grainAmp: 0.16, fine: 0.05 },
      'stratifie-chene': { base: [0.56, 0.42, 0.27], ring: 0.10, grainAmp: 0.08, fine: 0.03 },
      'spc-greige': { base: [0.42, 0.38, 0.33], ring: 0.06, grainAmp: 0.06, fine: 0.03 }
    }[slug] || { base: [0.5, 0.4, 0.3], ring: 0.1, grainAmp: 0.1, fine: 0.04 };
    const px = Math.max(2, Math.round(L / 10)); // périodes entières en x
    for (let py = 0, i = 0; py < SH; py++) for (let pxl = 0; pxl < SW; pxl++, i += 4) {
      const x = (pxl + 0.5) / ppc, y = (py + 0.5) / ppc;
      const warp = fbm(noise, x * 0.05, y * 0.35, px * 0.5, 64, 2);
      const rings = Math.sin((y * 1.8 + warp * 9 + noise(x * 0.02, y * 0.1, px * 0.2, 8) * 6) * 1.7);
      const g = (fbm(noise, x * 0.35, y * 3.0, px * 3.5, 128, 3) - 0.5) * cfg.grainAmp;
      const f = (noise(x * 3, y * 3, px * 30, 128) - 0.5) * cfg.fine;
      const k = 1 + rings * cfg.ring * 0.5 + g + f;
      d[i] = Math.round(linearToSrgb(clamp(cfg.base[0] * k, 0, 1)) * 255);
      d[i + 1] = Math.round(linearToSrgb(clamp(cfg.base[1] * k * (1 - 0.02 * rings), 0, 1)) * 255);
      d[i + 2] = Math.round(linearToSrgb(clamp(cfg.base[2] * k * (1 - 0.04 * rings), 0, 1)) * 255);
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return { canvas: c, pxPerCm: ppc, wCm: L, hCm: W, seamless: true, procedural: true };
  }

  function proceduralTexture(slug, category, unitW, unitH) {
    return category === 'floor' ? floorTile(slug, unitW || 90, unitH || 15) : wallTile(slug);
  }

  function textureMean(tex) {
    const c = tex.canvas || tex.image;
    const s = document.createElement('canvas'); s.width = 32; s.height = 32;
    const ctx = s.getContext('2d'); ctx.drawImage(c, 0, 0, 32, 32);
    const d = ctx.getImageData(0, 0, 32, 32).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.2126 * srgbToLinear(d[i]) + 0.7152 * srgbToLinear(d[i + 1]) + 0.0722 * srgbToLinear(d[i + 2]);
    return Math.max(0.02, sum / (d.length / 4));
  }

  /* -------------------------------------------------- motifs (version JS) */
  const PATTERN_ID = { horizontal: 0, droit: 0, vertical: 1, chevron: 2, point_hongrie: 3, baton_rompu: 4 };
  function jsHash(a, b, seed) { return hash1(Math.round(a), Math.round(b), Math.round(seed * 1000)); }
  // Retourne {lx, ly, dw, dh, cx, cy, jd}
  function layoutJS(px, py, L, W, pat, seed, randomStagger) {
    let lx, ly, dw = L, dh = W, cx, cy, jd;
    if (pat === 0 || pat === 1) {
      const x = pat === 1 ? py : px, y = pat === 1 ? px : py;
      const row = Math.floor(y / W);
      const off = randomStagger ? jsHash(row, 7, seed) * L : (row % 2 ? L * 0.5 : 0);
      const xs = x + off, col = Math.floor(xs / L);
      lx = xs - col * L; ly = y - row * W; cx = col; cy = row;
      jd = Math.min(lx, L - lx, ly, W - ly);
    } else if (pat === 2 || pat === 3) {
      const phi = pat === 3 ? Math.PI / 4 : Math.PI / 3;
      const sn = Math.sin(phi), cs = Math.cos(phi);
      const bandW = L * sn;
      const band = Math.floor(px / bandW), s = band % 2 === 0 ? 1 : -1;
      const xc = band * bandW;
      const across = -s * cs * px + sn * py;
      const y0 = (across + s * cs * xc) / sn;
      const along0 = xc * sn + s * cs * y0;
      const along = px * sn + s * cs * py;
      lx = along - along0; const arow = Math.floor(across / W); ly = across - arow * W;
      cx = band; cy = arow;
      jd = Math.min(ly, W - ly, px - xc, xc + bandW - px);
    } else {
      const n = Math.max(2, Math.round(L / W));
      const qx = px / W, qy = py / W, ix = Math.floor(qx), iy = Math.floor(qy);
      const dd = ((ix - iy) % (2 * n) + 2 * n) % (2 * n);
      dw = n * W;
      if (dd < n) { const start = ix - dd; lx = (qx - start) * W; ly = (qy - iy) * W; cx = start; cy = iy; }
      else { const e = dd - n; const sr = iy - (n - 1 - e); lx = (qy - sr) * W; ly = (qx - ix) * W; cx = ix + 4096; cy = sr; }
      jd = Math.min(lx, dw - lx, ly, dh - ly);
    }
    return { lx, ly, dw, dh, cx, cy, jd };
  }

  /* -------------------------------------------------------------- shaders */
  const VS = `#version 300 es
precision highp float;
uniform vec2 uSize;
out vec2 vPx;
void main(){
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
  vPx = vec2((p.x + 1.0) * 0.5, (1.0 - p.y) * 0.5) * uSize;
}`;
  const FS_BLIT = `#version 300 es
precision highp float;
in vec2 vPx; out vec4 o;
uniform sampler2D uPhoto; uniform vec2 uSize;
void main(){ o = vec4(texture(uPhoto, vPx / uSize).rgb, 1.0); }`;
  const FS_LAYER = `#version 300 es
precision highp float;
in vec2 vPx; out vec4 o;
uniform sampler2D uAlbedo, uNormal, uLum, uMask;
uniform vec2 uSize, uPlane, uTileCm, uUnit;
uniform mat3 uHinv;
uniform int uPattern;
uniform float uOrient, uHasTint, uAlbedoMean, uLumMean, uGain, uHasNormal, uRelief, uJointCm, uJointDark, uSeed, uRandomStagger, uVariation, uFlip, uUvJitter;
uniform vec3 uTint, uLight;

float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21) + uSeed); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec3 toLin(vec3 c){ return pow(max(c, 0.0), vec3(2.2)); }
vec3 toSrgb(vec3 c){ return pow(max(c, 0.0), vec3(1.0 / 2.2)); }

void computeLayout(vec2 p, out vec2 local, out vec2 cell, out vec2 dims, out float jd){
  float L = uUnit.x, W = uUnit.y;
  if (uPattern == 0 || uPattern == 1) {
    vec2 q = (uPattern == 1) ? p.yx : p;
    float row = floor(q.y / W);
    float off = (uRandomStagger > 0.5) ? hash21(vec2(row, 7.0)) * L : mod(row, 2.0) * L * 0.5;
    float xs = q.x + off; float col = floor(xs / L);
    local = vec2(xs - col * L, q.y - row * W); cell = vec2(col, row); dims = vec2(L, W);
    jd = min(min(local.x, L - local.x), min(local.y, W - local.y));
  } else if (uPattern == 2 || uPattern == 3) {
    float phi = (uPattern == 3) ? 0.785398 : 1.047198;
    float sn = sin(phi), cs = cos(phi);
    float bandW = L * sn;
    float band = floor(p.x / bandW); float s = (mod(band, 2.0) < 0.5) ? 1.0 : -1.0;
    float xc = band * bandW;
    float across = -s * cs * p.x + sn * p.y;
    float y0 = (across + s * cs * xc) / sn;
    float along0 = xc * sn + s * cs * y0;
    float along = p.x * sn + s * cs * p.y;
    float arow = floor(across / W);
    local = vec2(along - along0, across - arow * W); cell = vec2(band, arow); dims = vec2(L, W);
    jd = min(min(local.y, W - local.y), min(p.x - xc, xc + bandW - p.x));
  } else {
    float n = max(2.0, floor(L / W + 0.5));
    vec2 q = p / W; vec2 ij = floor(q);
    float d = mod(ij.x - ij.y, 2.0 * n);
    dims = vec2(n * W, W);
    if (d < n) { float st = ij.x - d; local = vec2(q.x - st, q.y - ij.y) * W; cell = vec2(st, ij.y); }
    else { float e = d - n; float sr = ij.y - (n - 1.0 - e); local = vec2(q.y - sr, q.x - ij.x) * W; cell = vec2(ij.x + 4096.0, sr); }
    jd = min(min(local.x, dims.x - local.x), min(local.y, dims.y - local.y));
  }
}

void main(){
  vec3 hp = uHinv * vec3(vPx, 1.0);
  vec2 pl = hp.xy / hp.z;                       // coordonnées plan (cm)
  float ed = min(min(pl.x, uPlane.x - pl.x), min(pl.y, uPlane.y - pl.y));
  float aa = clamp(ed / max(fwidth(ed), 1e-4) + 0.5, 0.0, 1.0);
  if (aa <= 0.0 || hp.z <= 0.0) { o = vec4(0.0); return; }
  float m = texture(uMask, vPx / uSize).a;
  aa *= 1.0 - m;
  if (aa <= 0.001) { o = vec4(0.0); return; }

  // orientation du motif autour du centre du plan
  float c = cos(uOrient), s = sin(uOrient);
  vec2 pc = pl - uPlane * 0.5;
  vec2 pr = vec2(c * pc.x - s * pc.y, s * pc.x + c * pc.y) + uPlane * 0.5 + vec2(1000.0);

  vec2 local, cell, dims; float jd;
  computeLayout(pr, local, cell, dims, jd);
  float h1 = hash21(cell), h2 = hash21(cell + 17.0);
  vec2 lo = local;
  if (uFlip > 0.5 && h2 > 0.5) lo.x = dims.x - lo.x;
  vec2 uv = (lo + vec2(h1, h2) * uTileCm * uUvJitter) / uTileCm;
  vec3 alb = toLin(textureGrad(uAlbedo, uv, dFdx(uv), dFdy(uv)).rgb);
  alb *= 1.0 + (h1 - 0.5) * uVariation;

  // teinte Jotun : albedo (blanc) × couleur, micro-contrastes conservés
  if (uHasTint > 0.5) alb = (alb / uAlbedoMean) * uTint;

  // ombrage conservé
  float lum = texture(uLum, vPx / uSize).r; lum *= lum;
  float shade = clamp(lum / uLumMean, 0.10, 2.6) * uGain;

  // relief
  vec3 nrm;
  if (uHasNormal > 0.5) { nrm = normalize(texture(uNormal, uv).rgb * 2.0 - 1.0); }
  else {
    vec2 e = 1.0 / vec2(textureSize(uAlbedo, 0));
    float hx = dot(texture(uAlbedo, uv + vec2(e.x, 0.0)).rgb, vec3(0.333)) - dot(texture(uAlbedo, uv - vec2(e.x, 0.0)).rgb, vec3(0.333));
    float hy = dot(texture(uAlbedo, uv + vec2(0.0, e.y)).rgb, vec3(0.333)) - dot(texture(uAlbedo, uv - vec2(0.0, e.y)).rgb, vec3(0.333));
    nrm = normalize(vec3(-hx * 6.0, -hy * 6.0, 1.0));
  }
  float diff = max(dot(nrm, normalize(uLight)), 0.0) / max(normalize(uLight).z, 0.2);
  shade *= mix(1.0, diff, uRelief);

  // joints
  float jw = fwidth(jd);
  float joint = 1.0 - uJointDark * (1.0 - smoothstep(uJointCm - jw, uJointCm + jw, jd));

  vec3 col = alb * shade * joint;
  o = vec4(toSrgb(col), aa);
}`;

  /* ------------------------------------------------------------- renderer */
  function createRenderer(opts) {
    const out = document.createElement('canvas');
    const glCanvas = document.createElement('canvas');
    let gl = null, prog = null, blit = null, ready = false;
    try {
      gl = (opts && opts.forceCanvas) ? null : glCanvas.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: false, alpha: true });
    } catch (e) { gl = null; }
    if (gl) {
      try {
        prog = program(gl, VS, FS_LAYER); blit = program(gl, VS, FS_BLIT);
        gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        ready = !!(prog && blit);
      } catch (e) { ready = false; }
      if (!ready) gl = null;
    }
    const texCache = new WeakMap();
    let lastJob = null, lastPre = null;

    function program(gl, vs, fs) {
      const p = gl.createProgram();
      const a = shader(gl, gl.VERTEX_SHADER, vs), b = shader(gl, gl.FRAGMENT_SHADER, fs);
      gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn('[render] link', gl.getProgramInfoLog(p)); return null; }
      return p;
    }
    function shader(gl, type, src) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('[render] shader', gl.getShaderInfoLog(s)); throw new Error('shader'); }
      return s;
    }
    function texFromImage(img, repeat, mips) {
      let t = texCache.get(img);
      if (t) return t;
      t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      const wrap = repeat === 'mirror' ? gl.MIRRORED_REPEAT : (repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (mips) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      const ext = gl.getExtension('EXT_texture_filter_anisotropic');
      if (ext && mips) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      texCache.set(img, t);
      return t;
    }
    function texFromBytes(bytes, w, h, channels) {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      if (channels === 1) gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, bytes);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return t;
    }

    // Pré-calcul commun : dimensions, homographies, luminance, stats.
    function prepare(job) {
      const photo = job.photo;
      const pw = photo.naturalWidth || photo.width, ph = photo.naturalHeight || photo.height;
      const max = job.maxSize || 2048;
      const sc = Math.min(1, max / Math.max(pw, ph));
      const w = Math.round(pw * sc), h = Math.round(ph * sc);
      const lm = (lastPre && lastPre.photo === photo && lastPre.w === w) ? lastPre.lm : luminanceMap(photo, w, h);
      const layers = (job.layers || []).map(layer => {
        const quad = layer.quad.map(p => [p[0] * sc, p[1] * sc]);
        let planeW = layer.planeW, planeH = layer.planeH;
        const aspect = estimateAspect(quad, w, h);
        if (layer.kind === 'floor') { if (!planeW) planeW = 400; planeH = planeW / aspect; }
        else { if (!planeH) planeH = 260; planeW = planeH * aspect; }
        const H = homography([[0, 0], [planeW, 0], [planeW, planeH], [0, planeH]], quad);
        if (!H) return null;
        const Hinv = invert3(H);
        const st = quadStats(lm, quad, H);
        const tex = layer.texture;
        const albedoMean = tex.mean || (tex.mean = textureMean(tex));
        const patId = PATTERN_ID[layer.pattern] != null ? PATTERN_ID[layer.pattern] : 0;
        const isFloor = layer.kind === 'floor';
        return {
          kind: layer.kind, quad, planeW, planeH, aspect, H, Hinv, stats: st, tex, albedoMean, patId,
          unit: [layer.unit ? layer.unit.w : (isFloor ? 90 : 240), layer.unit ? layer.unit.h : (isFloor ? 15 : 60)],
          tileCm: [tex.wCm || (tex.canvas || tex.image).width / (tex.pxPerCm || 8), tex.hCm || (tex.canvas || tex.image).height / (tex.pxPerCm || 8)],
          orient: (layer.orientationDeg || 0) * Math.PI / 180,
          tint: layer.tint && !isFloor ? hexToLinear(layer.tint) : null,
          normal: layer.normal || null,
          relief: layer.relief != null ? layer.relief : (isFloor ? 0.12 : 0.38),
          jointCm: layer.jointCm != null ? layer.jointCm : (isFloor ? 0.09 : 0.14),
          jointDark: layer.jointDark != null ? layer.jointDark : (isFloor ? 0.42 : 0.30),
          randomStagger: isFloor ? 1 : 0,
          variation: isFloor ? 0.16 : 0.03,
          flip: isFloor ? 1 : 0,
          uvJitter: isFloor && tex.seamless !== false ? 1 : 0,
          mirror: tex.seamless === false,
          gain: clamp(Math.pow(st.mean / 0.42, 0.32), 0.45, 1.15),
          seed: (layer.seed || 0.37)
        };
      }).filter(Boolean);
      const pre = { photo, w, h, sc, lm, layers, mask: job.mask || null };
      lastPre = pre;
      return pre;
    }

    function drawWatermark(ctx, w, h) {
      const fs = Math.max(11, Math.round(w / 48));
      ctx.save();
      ctx.font = `500 ${fs}px Jost, system-ui, sans-serif`;
      ctx.textBaseline = 'bottom'; ctx.textAlign = 'right';
      const txt = 'VISUALISATION INDICATIVE · DEUTSCHCONFORT'.split('').join(' ');
      const x = w - fs * 1.2, y = h - fs * 1.0;
      ctx.shadowColor = 'rgba(20,20,15,.55)'; ctx.shadowBlur = fs * 0.5;
      ctx.fillStyle = 'rgba(245,242,236,.82)';
      ctx.fillText(txt, x, y);
      ctx.restore();
    }

    function renderGL(pre) {
      const { w, h } = pre;
      glCanvas.width = w; glCanvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      // 1. photo
      const photoTex = texFromImage(pre.photo, false, false);
      gl.useProgram(blit);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, photoTex);
      gl.uniform1i(gl.getUniformLocation(blit, 'uPhoto'), 0);
      gl.uniform2f(gl.getUniformLocation(blit, 'uSize'), w, h);
      gl.disable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // 2. couches
      const lumTex = texFromBytes(pre.lm.enc, w, h, 1);
      let maskTex;
      if (pre.mask) {
        maskTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, maskTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pre.mask);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      } else maskTex = texFromBytes(new Uint8Array([0, 0, 0, 0]), 1, 1, 4);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(prog);
      const U = (n) => gl.getUniformLocation(prog, n);
      pre.layers.forEach(L => {
        const albTex = texFromImage(L.tex.canvas || L.tex.image, L.mirror ? 'mirror' : true, true);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, albTex); gl.uniform1i(U('uAlbedo'), 0);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, L.normal ? texFromImage(L.normal, true, true) : albTex); gl.uniform1i(U('uNormal'), 1);
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, lumTex); gl.uniform1i(U('uLum'), 2);
        gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, maskTex); gl.uniform1i(U('uMask'), 3);
        gl.uniform2f(U('uSize'), w, h);
        gl.uniform2f(U('uPlane'), L.planeW, L.planeH);
        gl.uniform2f(U('uTileCm'), L.tileCm[0], L.tileCm[1]);
        gl.uniform2f(U('uUnit'), L.unit[0], L.unit[1]);
        const m = L.Hinv; // ligne-majeure -> colonne-majeure
        gl.uniformMatrix3fv(U('uHinv'), false, new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]));
        gl.uniform1i(U('uPattern'), L.patId);
        gl.uniform1f(U('uOrient'), L.orient);
        gl.uniform1f(U('uHasTint'), L.tint ? 1 : 0);
        gl.uniform3f(U('uTint'), ...(L.tint || [1, 1, 1]));
        gl.uniform1f(U('uAlbedoMean'), L.albedoMean);
        gl.uniform1f(U('uLumMean'), L.stats.mean);
        gl.uniform1f(U('uGain'), L.gain);
        gl.uniform3f(U('uLight'), ...L.stats.light);
        gl.uniform1f(U('uHasNormal'), L.normal ? 1 : 0);
        gl.uniform1f(U('uRelief'), L.relief);
        gl.uniform1f(U('uJointCm'), L.jointCm);
        gl.uniform1f(U('uJointDark'), L.jointDark);
        gl.uniform1f(U('uSeed'), L.seed);
        gl.uniform1f(U('uRandomStagger'), L.randomStagger);
        gl.uniform1f(U('uVariation'), L.variation);
        gl.uniform1f(U('uFlip'), L.flip);
        gl.uniform1f(U('uUvJitter'), L.uvJitter);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      });
      gl.deleteTexture(lumTex); gl.deleteTexture(maskTex);
      const ctx = out.getContext('2d');
      out.width = w; out.height = h;
      ctx.drawImage(glCanvas, 0, 0);
    }

    // Repli CPU : même modèle (sans relief), résolution limitée à 1100 px.
    function render2D(pre) {
      const scale = Math.min(1, 1100 / Math.max(pre.w, pre.h));
      const w = Math.round(pre.w * scale), h = Math.round(pre.h * scale);
      const base = document.createElement('canvas'); base.width = w; base.height = h;
      const bctx = base.getContext('2d', { willReadFrequently: true });
      bctx.drawImage(pre.photo, 0, 0, w, h);
      const img = bctx.getImageData(0, 0, w, h), d = img.data;
      let maskData = null;
      if (pre.mask) {
        const mc = document.createElement('canvas'); mc.width = w; mc.height = h;
        const mctx = mc.getContext('2d', { willReadFrequently: true }); mctx.drawImage(pre.mask, 0, 0, w, h);
        maskData = mctx.getImageData(0, 0, w, h).data;
      }
      const lut = new Float32Array(256); for (let i = 0; i < 256; i++) lut[i] = srgbToLinear(i);
      const outLut = new Uint8ClampedArray(4096); for (let i = 0; i < 4096; i++) outLut[i] = Math.round(linearToSrgb(i / 4095) * 255);
      pre.layers.forEach(L => {
        const quad = L.quad.map(p => [p[0] * scale, p[1] * scale]);
        const H = homography([[0, 0], [L.planeW, 0], [L.planeW, L.planeH], [0, L.planeH]], quad);
        const Hinv = invert3(H); if (!Hinv) return;
        const tc = L.tex.canvas || L.tex.image;
        const tcv = document.createElement('canvas'); tcv.width = tc.width; tcv.height = tc.height;
        tcv.getContext('2d').drawImage(tc, 0, 0);
        const td = tcv.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, tc.width, tc.height).data;
        const tw = tc.width, th = tc.height;
        const b = quadBounds(quad);
        const cO = Math.cos(L.orient), sO = Math.sin(L.orient);
        const tint = L.tint;
        for (let y = Math.max(0, Math.floor(b.y0)); y < Math.min(h, Math.ceil(b.y1)); y++) {
          for (let x = Math.max(0, Math.floor(b.x0)); x < Math.min(w, Math.ceil(b.x1)); x++) {
            const p = applyH(Hinv, x + 0.5, y + 0.5);
            const ed = Math.min(p[0], L.planeW - p[0], p[1], L.planeH - p[1]);
            if (ed < -2) continue;
            const p2 = applyH(Hinv, x + 1.5, y + 0.5), p3 = applyH(Hinv, x + 0.5, y + 1.5);
            const cmPerPx = Math.max(1e-4, (Math.hypot(p2[0] - p[0], p2[1] - p[1]) + Math.hypot(p3[0] - p[0], p3[1] - p[1])) / 2);
            let aa = clamp(ed / cmPerPx + 0.5, 0, 1);
            const idx = (y * w + x) * 4;
            if (maskData) aa *= 1 - maskData[idx + 3] / 255;
            if (aa <= 0.002) continue;
            const pcx = p[0] - L.planeW / 2, pcy = p[1] - L.planeH / 2;
            const prx = cO * pcx - sO * pcy + L.planeW / 2 + 1000, pry = sO * pcx + cO * pcy + L.planeH / 2 + 1000;
            const lay = layoutJS(prx, pry, L.unit[0], L.unit[1], L.patId, L.seed, L.randomStagger);
            const h1 = jsHash(lay.cx, lay.cy, L.seed), h2 = jsHash(lay.cx + 17, lay.cy + 17, L.seed);
            let lx = lay.lx; if (L.flip && h2 > 0.5) lx = lay.dw - lx;
            const u = (lx + h1 * L.tileCm[0] * L.uvJitter) / L.tileCm[0], v = (lay.ly + h2 * L.tileCm[1] * L.uvJitter) / L.tileCm[1];
            // échantillonnage bilinéaire (répétition ou miroir)
            let fu = u * tw - 0.5, fv = v * th - 0.5;
            const wrapX = (i) => { if (L.mirror) { const p2 = ((i % (2 * tw)) + 2 * tw) % (2 * tw); return p2 < tw ? p2 : 2 * tw - 1 - p2; } return ((i % tw) + tw) % tw; };
            const wrapY = (i) => { if (L.mirror) { const p2 = ((i % (2 * th)) + 2 * th) % (2 * th); return p2 < th ? p2 : 2 * th - 1 - p2; } return ((i % th) + th) % th; };
            const x0 = Math.floor(fu), y0 = Math.floor(fv), ax = fu - x0, ay = fv - y0;
            const tx0 = wrapX(x0), tx1 = wrapX(x0 + 1), ty0 = wrapY(y0), ty1 = wrapY(y0 + 1);
            const i00 = (ty0 * tw + tx0) * 4, i10 = (ty0 * tw + tx1) * 4, i01 = (ty1 * tw + tx0) * 4, i11 = (ty1 * tw + tx1) * 4;
            const bil = (o) => (lut[td[i00 + o]] * (1 - ax) + lut[td[i10 + o]] * ax) * (1 - ay) + (lut[td[i01 + o]] * (1 - ax) + lut[td[i11 + o]] * ax) * ay;
            let r = bil(0), g = bil(1), bl = bil(2);
            const varf = 1 + (h1 - 0.5) * L.variation; r *= varf; g *= varf; bl *= varf;
            if (tint) { r = r / L.albedoMean * tint[0]; g = g / L.albedoMean * tint[1]; bl = bl / L.albedoMean * tint[2]; }
            const lx0 = Math.min(pre.lm.w - 1, Math.floor(x / scale)), ly0 = Math.min(pre.lm.h - 1, Math.floor(y / scale));
            const lum = pre.lm.lum[ly0 * pre.lm.w + lx0];
            const shade = clamp(lum / L.stats.mean, 0.1, 2.6) * L.gain;
            const joint = 1 - L.jointDark * (1 - clamp((lay.jd - L.jointCm) / cmPerPx + 0.5, 0, 1));
            const k = shade * joint;
            const R = outLut[Math.round(clamp(r * k, 0, 1) * 4095)], G = outLut[Math.round(clamp(g * k, 0, 1) * 4095)], B = outLut[Math.round(clamp(bl * k, 0, 1) * 4095)];
            d[idx] = d[idx] + (R - d[idx]) * aa; d[idx + 1] = d[idx + 1] + (G - d[idx + 1]) * aa; d[idx + 2] = d[idx + 2] + (B - d[idx + 2]) * aa;
          }
        }
      });
      bctx.putImageData(img, 0, 0);
      out.width = pre.w; out.height = pre.h;
      const ctx = out.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(base, 0, 0, pre.w, pre.h);
    }

    function render(job) {
      const t0 = performance.now();
      const pre = prepare(job);
      lastJob = job;
      if (gl) {
        try { renderGL(pre); }
        catch (e) { console.warn('[render] WebGL2 a échoué, repli Canvas 2D', e); gl = null; render2D(pre); }
      } else render2D(pre);
      if (job.watermark !== false) drawWatermark(out.getContext('2d'), out.width, out.height);
      return { canvas: out, ms: Math.round(performance.now() - t0), mode: gl ? 'webgl2' : 'canvas2d', layers: pre.layers.map(L => ({ kind: L.kind, planeW: Math.round(L.planeW), planeH: Math.round(L.planeH), lumMean: L.stats.mean, light: L.stats.light })) };
    }

    // Masque PNG : zone rendue (blanc) moins occlusion (noir), à la taille du composite.
    function maskCanvas() {
      if (!lastPre) return null;
      const c = document.createElement('canvas'); c.width = lastPre.w; c.height = lastPre.h;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#fff';
      lastPre.layers.forEach(L => { ctx.beginPath(); L.quad.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); });
      if (lastPre.mask) { ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(lastPre.mask, 0, 0, c.width, c.height); ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height); }
      return c;
    }
    function toBlob(canvas, type, q) { return new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob')), type, q)); }

    return {
      canvas: out,
      get mode() { return gl ? 'webgl2' : 'canvas2d'; },
      render,
      exportJPEG: (q) => toBlob(out, 'image/jpeg', q || 0.9),
      exportMaskPNG: () => { const c = maskCanvas(); return c ? toBlob(c, 'image/png') : Promise.resolve(null); },
      lastLayers: () => (lastPre ? lastPre.layers : [])
    };
  }

  global.DCRender = {
    createRenderer, proceduralTexture, estimateAspect, homography, invert3, applyH, pointInQuad,
    hexToLinear, srgbToLinear, linearToSrgb, textureMean
  };
})(window);
