// Ilustrações vivas em SVG. Animadas por CSS (classes em styles.css) e SMIL (animateMotion).
// Conceito: o caminho como linhas, rotas, camadas, rios e pontos de passagem.

export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const r1 = (n) => Math.round(n * 10) / 10;

export function smoothClosed(pts) {
  const n = pts.length; let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + 'Z';
}
function blob(cx, cy, r, ph, k = 26, amp = 0.16, sx = 1, sy = 1) {
  const pts = [];
  for (let i = 0; i < k; i++) {
    const t = (i / k) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(3 * t + ph[0]) + amp * 0.6 * Math.sin(5 * t + ph[1]) + amp * 0.35 * Math.sin(2 * t + ph[2]));
    pts.push([cx + Math.cos(t) * rr * sx, cy + Math.sin(t) * rr * sy]);
  }
  return smoothClosed(pts);
}
function ringSet(cx, cy, from, to, step, seed, cls = '') {
  const R = rng(seed); const ph = [R() * 6, R() * 6, R() * 6];
  let s = '';
  for (let r = from, i = 0; r <= to; r += step, i++) {
    const p = [ph[0] + i * 0.12, ph[1] - i * 0.09, ph[2] + i * 0.05];
    const c = [cls, i % 4 === 3 ? 'strong' : ''].filter(Boolean).join(' ');
    s += `<path d="${blob(cx, cy, r, p)}"${c ? ` class="${c}"` : ''}/>`;
  }
  return s;
}

/* Curvas de nível de fundo — arquivos SVG externos, animados internamente */
export function contourFile(seed, color) {
  const R = rng(seed);
  const centers = [[R() * 500 + 150, R() * 300 + 120], [R() * 450 + 850, R() * 360 + 400], [R() * 300 + 520, R() * 200 + 700]];
  let paths = '';
  centers.forEach((c, j) => { paths += ringSet(c[0], c[1], 40, j === 2 ? 260 : 520, 46, seed * 7 + j); });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" stroke="${color}" stroke-width="1.3">
<style>path{transform-box:fill-box;transform-origin:center;animation:b 16s ease-in-out infinite alternate}path:nth-child(2n){animation-delay:-5s}path:nth-child(3n){animation-delay:-10s}.strong{stroke-width:2}@keyframes b{from{transform:scale(.985) rotate(-.8deg)}to{transform:scale(1.02) rotate(.8deg)}}@media (prefers-reduced-motion:reduce){path{animation:none}}</style>
${paths}</svg>`;
}

/* ---------------- Mapa vivo do hero ---------------- */
export function livingMap() {
  const route = 'M300 500 C 360 455, 360 420, 330 385 S 300 300, 380 280 S 470 250, 430 190 S 450 110, 525 95';
  return `<svg class="living-map" viewBox="0 0 600 570" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <radialGradient id="lmGlow" cx="70%" cy="20%" r="55%"><stop offset="0" stop-color="#6dbb45" stop-opacity=".35"/><stop offset="1" stop-color="#6dbb45" stop-opacity="0"/></radialGradient>
    <linearGradient id="lmSweep" x1="0" x2="1"><stop offset="0" stop-color="#bfe3a8" stop-opacity="0"/><stop offset="1" stop-color="#bfe3a8" stop-opacity=".22"/></linearGradient>
  </defs>
  <rect width="600" height="570" fill="url(#lmGlow)"/>
  <g class="lm-grid">${Array.from({ length: 11 }, (_, i) => `<path d="M${i * 60} 0V570"/>`).join('')}${Array.from({ length: 10 }, (_, i) => `<path d="M0 ${i * 60}H600"/>`).join('')}</g>
  <g>${ringSet(430, 170, 22, 260, 24, 11, 'lm-contour')}${ringSet(150, 420, 18, 170, 22, 29, 'lm-contour')}</g>
  <path class="lm-sweep" d="M420 171 L 640 120 A 225 225 0 0 1 600 300 Z" fill="url(#lmSweep)"/>
  <path class="lm-river" d="M-20 250 C 80 260, 120 330, 210 330 S 330 250, 410 330 S 520 470, 640 450"/>
  <path class="lm-river-flow" d="M-20 250 C 80 260, 120 330, 210 330 S 330 250, 410 330 S 520 470, 640 450"/>
  <path class="lm-route" d="${route}"/>
  <path class="lm-route-draw" style="--len:520" d="${route}"/>
  <circle r="6" fill="#e0b062"><animateMotion dur="9s" repeatCount="indefinite" path="${route}" keyPoints="0;1;1" keyTimes="0;.6;1" calcMode="linear"/></circle>
  <g><circle class="lm-pin-ring" cx="300" cy="500" r="12"/><circle cx="300" cy="500" r="7" fill="#6dbb45"/><circle cx="300" cy="500" r="3" fill="#0e3b2c"/></g>
  <g><circle class="lm-pin-ring d2" cx="380" cy="280" r="10"/><circle cx="380" cy="280" r="6" fill="#fff"/></g>
  <g><circle class="lm-pin-ring d3" cx="525" cy="95" r="14"/><circle cx="525" cy="95" r="9" fill="#e0b062"/><path d="M521 95l3 3 5-6" stroke="#0e3b2c" stroke-width="2" fill="none" stroke-linecap="round"/></g>
  <text class="lm-label" x="318" y="530">território</text>
  <text class="lm-label" x="470" y="70">decisão</text>
  <g transform="translate(60 70)" opacity=".75"><circle r="26" fill="none" stroke="rgba(191,227,168,.4)"/><path d="M0 -20 L5 0 L0 20 L-5 0Z" fill="rgba(191,227,168,.55)"><animateTransform attributeName="transform" type="rotate" values="-20;25;-10;-20" dur="8s" repeatCount="indefinite"/></path><text class="lm-label" x="-4" y="-32">N</text></g>
</svg>`;
}

/* ---------------- Camadas (problema e proposta) ---------------- */
export function layersIll() {
  const plate = (y, fill, stroke) => `<path d="M200 ${y - 75} L350 ${y} L200 ${y + 75} L50 ${y} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  const L = [
    { y: 380, y1: 0, fill: '#0e3b2c', stroke: '#0e3b2c', label: 'Território', sub: 'contexto e relações', inner: (y) => [100, 70, 42, 18].map((r) => `<ellipse cx="200" cy="${y}" rx="${r}" ry="${r / 2}" fill="none" stroke="#6dbb45" stroke-opacity=".7" stroke-width="1.4"/>`).join('') + `<path d="M95 ${y + 12} C 150 ${y - 30}, 230 ${y + 40}, 300 ${y - 8}" stroke="#7cc7d9" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>` },
    { y: 292, y1: -12, fill: '#d6ebc4', stroke: '#b7d99e', label: 'Atores', sub: 'quem participa e decide', inner: (y) => { const n = [[140, y - 8], [200, y - 38], [262, y - 4], [205, y + 30], [170, y + 12]]; return n.map((a, i) => n.slice(i + 1).filter((_, j) => (i + j) % 2 === 0).map((b) => `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#047234" stroke-opacity=".5" stroke-dasharray="3 4" class="a-dash"/>`).join('')).join('') + n.map((a, i) => `<circle cx="${a[0]}" cy="${a[1]}" r="${i === 1 ? 9 : 6.5}" fill="${i === 1 ? '#b4552f' : '#047234'}" class="a-blink d${i % 4}"/>`).join(''); } },
    { y: 204, y1: -26, fill: 'rgba(255,255,255,.78)', stroke: '#fff', label: 'Impactos', sub: 'riscos e oportunidades', inner: (y) => [[150, y, 14], [205, y - 30, 9], [250, y + 8, 18], [195, y + 28, 7], [120, y - 4, 5]].map((c, i) => `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${c[2]}" ry="${c[2] / 2}" fill="${i % 2 ? '#d27650' : '#e0b062'}" opacity=".75" class="a-blink d${i % 4}"/>`).join('') },
    { y: 116, y1: -44, fill: 'rgba(255,255,255,.92)', stroke: '#fff', label: 'Decisões', sub: 'caminhos possíveis', inner: (y) => `<path d="M110 ${y + 6} C 150 ${y + 30}, 180 ${y - 20}, 215 ${y} S 265 ${y - 26}, 292 ${y - 6}" fill="none" stroke="#047234" stroke-width="2.5" stroke-dasharray="2 7" stroke-linecap="round" class="a-dash"/><circle cx="110" cy="${y + 6}" r="5" fill="#6dbb45"/><g transform="translate(292 ${y - 6})"><circle r="11" fill="#047234"/><path d="M-4.5 0l3 3 6-6.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>` },
  ];
  return `<svg viewBox="0 0 560 480" aria-hidden="true">
  <defs><filter id="lsh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#0e3b2c" flood-opacity=".22"/></filter></defs>
  ${L.map((l, i) => `<g class="layer l${i + 1}" style="--y0:0px;--y1:${l.y1}px">
    <g filter="url(#lsh)">${plate(l.y, l.fill, l.stroke)}</g>${l.inner(l.y)}
    <path d="M350 ${l.y} H 392" stroke="#0e3b2c" stroke-opacity=".35" stroke-dasharray="2 4"/>
    <circle cx="350" cy="${l.y}" r="3.5" fill="#0e3b2c"/>
    <text class="layer-label" x="400" y="${l.y - 2}">${l.label}</text><text class="layer-label-sub" x="400" y="${l.y + 15}">${l.sub}</text>
  </g>`).join('')}
</svg>`;
}

/* ---------------- Ícones animados das soluções (48x48) ---------------- */
const SOL = {
  assessoria: `<rect x="8" y="5" width="24" height="31" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 13h14M13 18h14M13 23h9" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".6"/><g class="a-scan"><circle cx="31" cy="30" r="8" fill="rgba(14,59,44,.5)" stroke="currentColor" stroke-width="2.4"/><path d="M37 36l6 6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></g>`,
  consultoria: `<circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 3" opacity=".6"/><g class="a-needle"><path d="M24 9 L28 24 L24 28 L20 24Z" fill="#e0b062"/><path d="M24 39 L28 24 L20 24Z" fill="currentColor" opacity=".55"/></g><circle cx="24" cy="24" r="2.5" fill="#e0b062"/>`,
  gestao: `<path d="M7 40h34M7 8v32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect class="a-bar" x="10" y="12" width="22" height="6" rx="3" fill="currentColor"/><rect class="a-bar b2" x="16" y="22" width="20" height="6" rx="3" fill="#e0b062"/><rect class="a-bar b3" x="12" y="32" width="26" height="6" rx="3" fill="currentColor" opacity=".6"/>`,
  esg: `<path d="M6 34 24 44 42 34 24 24Z" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".55"/><path d="M6 24 24 34 42 24 24 14Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 4v20" stroke="currentColor" stroke-width="2" stroke-dasharray="2 3" class="a-dash"/><circle cx="24" cy="24" r="3.5" fill="#e0b062" class="a-blink"/><circle cx="14" cy="24" r="2.5" fill="currentColor" class="a-blink d1"/><circle cx="34" cy="24" r="2.5" fill="currentColor" class="a-blink d2"/><circle cx="24" cy="4" r="3" fill="currentColor"/>`,
  licenciamento: `<rect x="9" y="7" width="30" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="17" y="3.5" width="14" height="7" rx="2.5" fill="currentColor"/><path d="M15 26l6 6 12-13" fill="none" stroke="#e0b062" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="a-draw" style="--len:32"/>`,
  cpli: `<g class="a-pop"><path d="M4 8h22v13H12l-6 5v-5H4z" fill="currentColor" opacity=".9"/></g><g class="a-pop d1"><path d="M22 18h22v13h-2v5l-6-5H22z" fill="#e0b062"/></g><g class="a-pop d2"><circle cx="13" cy="37" r="3" fill="currentColor"/><circle cx="21" cy="37" r="3" fill="currentColor" opacity=".7"/><circle cx="29" cy="37" r="3" fill="currentColor" opacity=".45"/></g>`,
  pgtaq: `<path d="M5 12l12-5 14 5 12-5v29l-12 5-14-5-12 5z" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".55"/><path d="M12 30 C 12 20, 22 14, 30 18 S 38 30, 30 33 S 14 38, 12 30Z" fill="rgba(109,187,69,.18)" stroke="currentColor" stroke-width="2.2" stroke-dasharray="3 3" class="a-dash"/><circle cx="24" cy="25" r="3.2" fill="#e0b062" class="a-blink"/>`,
  articulacao: `<path d="M24 10 L10 34 M24 10 L38 34 M10 34 H38 M24 10 V26 M10 34 L24 26 L38 34" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3" class="a-dash" fill="none"/><circle cx="24" cy="10" r="5.5" fill="#e0b062"/><circle cx="10" cy="34" r="5" fill="currentColor"/><circle cx="38" cy="34" r="5" fill="currentColor"/><circle cx="24" cy="26" r="3.5" fill="currentColor" class="a-blink"/>`,
};
export function solIcon(key) {
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${SOL[key] || SOL.consultoria}</svg>`;
}

/* Ilustração grande para o card em destaque (assessoria técnica) */
export function featureIll() {
  return `<svg viewBox="0 0 360 260" aria-hidden="true">
  <g class="a-float"><rect x="60" y="30" width="150" height="190" rx="14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>
  ${[60, 80, 100, 120].map((y, i) => `<rect x="80" y="${y}" width="${[110, 90, 100, 60][i]}" height="7" rx="3.5" fill="rgba(233,239,233,${i === 1 ? .7 : .3})"/>`).join('')}
  <rect x="80" y="145" width="110" height="52" rx="8" fill="rgba(109,187,69,.22)"/><path d="M88 186 C 110 160, 130 190, 150 168 S 175 165, 182 158" stroke="#6dbb45" stroke-width="2.5" fill="none" stroke-linecap="round" class="a-draw" style="--len:120"/></g>
  <g class="a-scan" style="animation-duration:5s"><circle cx="205" cy="120" r="34" fill="rgba(14,59,44,.55)" stroke="#e0b062" stroke-width="4"/><path d="M230 145l30 30" stroke="#e0b062" stroke-width="7" stroke-linecap="round"/><path d="M188 120h34M205 103v34" stroke="rgba(224,176,98,.45)" stroke-width="1.5"/></g>
  ${[[290, 60], [315, 120], [285, 185]].map((p, i) => `<g class="a-pop d${i}"><path d="M240 ${p[1] - 10} C 260 ${p[1] - 10}, 265 ${p[1]}, ${p[0] - 14} ${p[1]}" stroke="rgba(191,227,168,.5)" fill="none" stroke-dasharray="3 4"/><circle cx="${p[0]}" cy="${p[1]}" r="14" fill="#6dbb45"/><circle cx="${p[0]}" cy="${p[1] - 4}" r="4.5" fill="#0e3b2c"/><path d="M${p[0] - 7} ${p[1] + 8} a7 6 0 0 1 14 0" fill="#0e3b2c"/></g>`).join('')}
</svg>`;
}

/* ---------------- Ilustrações por público (320x220) ---------------- */
export function audienceIll(key) {
  if (key === 'comunidades') {
    const n = 7, cx = 160, cy = 112, R = 78;
    const nodes = Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2 - Math.PI / 2; return [cx + Math.cos(t) * R, cy + Math.sin(t) * R * .72]; });
    return `<svg viewBox="0 0 320 220" aria-hidden="true">
    <ellipse cx="${cx}" cy="${cy}" rx="${R + 26}" ry="${(R + 26) * .72}" fill="none" stroke="#047234" stroke-opacity=".25" stroke-dasharray="3 6" class="a-dash"/>
    ${nodes.map((p) => `<path d="M${cx} ${cy} L${p[0].toFixed(1)} ${p[1].toFixed(1)}" stroke="#047234" stroke-opacity=".35" stroke-dasharray="2 5" class="a-dash"/>`).join('')}
    <g class="a-float"><rect x="${cx - 26}" y="${cy - 32}" width="52" height="64" rx="8" fill="#fff" stroke="#047234" stroke-width="2"/><path d="M${cx - 15} ${cy - 16}h30M${cx - 15} ${cy - 6}h30M${cx - 15} ${cy + 4}h18" stroke="#047234" stroke-width="2.5" stroke-linecap="round" opacity=".55"/><circle cx="${cx + 18}" cy="${cy + 22}" r="11" fill="#6dbb45"/><path d="M${cx + 13} ${cy + 22}l3.5 3.5 6.5-7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    ${nodes.map((p, i) => `<g class="a-blink d${i % 4}" style="animation-duration:3.4s"><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="13" fill="${i % 3 === 0 ? '#b4552f' : '#047234'}"/><circle cx="${p[0].toFixed(1)}" cy="${(p[1] - 3).toFixed(1)}" r="4" fill="#fff" opacity=".9"/><path d="M${(p[0] - 6).toFixed(1)} ${(p[1] + 7).toFixed(1)} a6 5 0 0 1 12 0" fill="#fff" opacity=".9"/></g>`).join('')}
    <g class="a-pop"><path d="M232 22h58v26h-36l-10 9v-9h-12z" fill="#fff" stroke="#047234" stroke-width="1.6"/><circle cx="248" cy="35" r="3" fill="#047234"/><circle cx="261" cy="35" r="3" fill="#047234" opacity=".6"/><circle cx="274" cy="35" r="3" fill="#047234" opacity=".3"/></g>
    </svg>`;
  }
  if (key === 'empresas') {
    return `<svg viewBox="0 0 320 220" aria-hidden="true">
    <g stroke="#b4552f" stroke-opacity=".22">${Array.from({ length: 9 }, (_, i) => `<path d="M${20 + i * 35} 20 V200"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<path d="M10 ${30 + i * 33} H310"/>`).join('')}</g>
    ${[[90, 120, 70], [90, 120, 46], [90, 120, 22]].map((c) => `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${c[2]}" ry="${c[2] * .7}" fill="none" stroke="#b4552f" stroke-opacity=".45"/>`).join('')}
    <g class="a-orbit" style="transform-origin:90px 120px;animation-duration:6s"><path d="M90 120 L160 120 A70 49 0 0 0 139 85Z" fill="#b4552f" opacity=".18"/></g>
    <g class="a-float"><path d="M70 150 V96 l22 -12 22 12 V150Z" fill="#fff" stroke="#0e3b2c" stroke-width="2"/><path d="M80 106h8M96 106h8M80 120h8M96 120h8M80 134h8M96 134h8" stroke="#0e3b2c" stroke-width="3" stroke-linecap="round" opacity=".45"/></g>
    <rect x="180" y="40" width="120" height="120" rx="14" fill="#fff" stroke="#0e3b2c" stroke-opacity=".15"/>
    <path d="M195 135 L218 112 L238 122 L260 88 L285 70" fill="none" stroke="#b4552f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="a-draw" style="--len:140"/>
    ${[[195, 135], [218, 112], [238, 122], [260, 88], [285, 70]].map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#0e3b2c" class="a-blink d${i % 4}"/>`).join('')}
    <path d="M195 150h90" stroke="#0e3b2c" stroke-opacity=".2" stroke-width="2"/>
    <g class="a-pop d1"><circle cx="300" cy="40" r="15" fill="#047234"/><path d="M293 40l5 5 9-10" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    </svg>`;
  }
  // organizações
  return `<svg viewBox="0 0 320 220" aria-hidden="true">
  <path d="M30 190H290" stroke="#0e3b2c" stroke-opacity=".3" stroke-width="2"/>
  ${[[60, 150, 40], [110, 120, 70], [160, 95, 95], [210, 70, 120]].map((b, i) => `<g class="a-grow" style="animation-delay:${i * 0.35}s"><rect x="${b[0]}" y="${190 - b[2]}" width="40" height="${b[2]}" rx="8" fill="${i === 3 ? '#047234' : i === 2 ? '#0e3b2c' : '#cfe0d6'}" stroke="#0e3b2c" stroke-opacity=".2"/></g>`).join('')}
  <g class="a-float" style="animation-duration:4s"><path d="M230 70 V40" stroke="#047234" stroke-width="3" stroke-linecap="round"/><path d="M230 50 c-14 0 -22 -9 -22 -22 c14 0 22 9 22 22z" fill="#6dbb45"/><path d="M230 44 c12 0 20 -8 20 -20 c-12 0 -20 8 -20 20z" fill="#047234"/></g>
  <path d="M50 120 C 100 110, 130 80, 175 72 S 250 40, 290 30" fill="none" stroke="#b4552f" stroke-width="2.5" stroke-dasharray="3 6" class="a-dash" stroke-linecap="round"/>
  <g class="a-orbit" style="transform-origin:280px 150px;animation-duration:9s"><circle cx="280" cy="150" r="22" fill="none" stroke="#0e3b2c" stroke-width="7" stroke-dasharray="6 5"/></g><circle cx="280" cy="150" r="9" fill="#fff" stroke="#0e3b2c" stroke-width="2"/>
  </svg>`;
}

/* ---------------- Linha do método ---------------- */
export function methodLine() {
  const d = 'M100 50 C 160 10, 240 10, 300 50 S 440 90, 500 50 S 640 10, 700 50 S 840 90, 900 50';
  return `<svg viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
  <path class="ml-base" d="${d}" vector-effect="non-scaling-stroke"/>
  <path class="ml-progress" d="${d}" pathLength="1000" style="--len:1000" vector-effect="non-scaling-stroke"/>
  <circle class="ml-traveler" r="6"><animateMotion dur="7s" repeatCount="indefinite" path="${d}"/></circle>
</svg>`;
}

/* ---------------- Mapa de rios (Oeste do Pará, esquemático) ---------------- */
export function riverMap() {
  const amazonas = 'M-10 330 C 70 318, 120 345, 170 330 S 290 300, 360 312 S 470 300, 570 290';
  const trombetas = 'M60 30 C 90 80, 70 120, 115 160 S 150 250, 168 326';
  const tapajos = 'M500 490 C 480 430, 470 380, 445 340 S 440 312, 438 306';
  const route = 'M120 160 C 150 220, 140 280, 168 326 S 330 280, 438 306';
  return `<svg viewBox="0 0 560 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><radialGradient id="rmg" cx="40%" cy="55%" r="65%"><stop offset="0" stop-color="#1c5a43"/><stop offset="1" stop-color="#0b3326"/></radialGradient></defs>
  <rect width="560" height="480" fill="url(#rmg)"/>
  <g fill="none" stroke="rgba(191,227,168,.12)">${ringSet(300, 170, 30, 300, 30, 5)}</g>
  <path class="rm-river" d="${amazonas}" stroke-width="16"/><path class="rm-flow" d="${amazonas}" stroke-width="3"/>
  <path class="rm-river" d="${trombetas}" stroke-width="7"/><path class="rm-flow" d="${trombetas}" stroke-width="2" style="animation-duration:3.6s"/>
  <path class="rm-river" d="${tapajos}" stroke-width="10"/><path class="rm-flow" d="${tapajos}" stroke-width="2.5" style="animation-direction:reverse"/>
  <path d="${route}" fill="none" stroke="#e0b062" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>
  <circle r="5" fill="#e0b062"><animateMotion dur="8s" repeatCount="indefinite" path="${route}"/></circle>
  ${[[120, 160, 'Porto Trombetas', 'Oriximiná, PA', 0], [168, 326, 'Oriximiná', 'Oeste do Pará', 1], [438, 306, 'Santarém', 'base da Trilha', 2]].map((p) => `<g class="rm-pin"><circle class="lm-pin-ring d${p[4] + 1}" cx="${p[0]}" cy="${p[1]}" r="12"/><circle class="core" cx="${p[0]}" cy="${p[1]}" r="7"/><circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="#0e3b2c"/><text class="rm-label" x="${p[0] + 16}" y="${p[1] - 6}">${p[2]}</text><text class="rm-sub" x="${p[0] + 16}" y="${p[1] + 10}">${p[3]}</text></g>`).join('')}
  <text class="rm-sub" x="250" y="352" opacity=".8">Rio Amazonas</text>
  <text class="rm-sub" x="30" y="110" opacity=".8" transform="rotate(58 30 110)">Rio Trombetas</text>
  <text class="rm-sub" x="470" y="430" opacity=".8">Rio Tapajós</text>
</svg>`;
}

/* ---------------- Composição "insígnia" para heros internos ---------------- */
export function badgeIll(innerSvg48, opts = {}) {
  const dark = opts.dark;
  const ring = dark ? 'rgba(191,227,168,.35)' : 'rgba(14,59,44,.28)';
  return `<svg viewBox="0 0 400 360" aria-hidden="true">
  <g fill="none" stroke="${dark ? 'rgba(191,227,168,.14)' : 'rgba(14,59,44,.1)'}">${ringSet(200, 180, 96, 200, 16, 17)}</g>
  <g class="a-orbit" style="transform-origin:200px 180px;animation-duration:40s"><circle cx="200" cy="180" r="160" fill="none" stroke="${ring}" stroke-dasharray="2 10"/><circle cx="360" cy="180" r="7" fill="${dark ? '#e0b062' : '#b4552f'}"/></g>
  <g class="a-orbit" style="transform-origin:200px 180px;animation-duration:24s;animation-direction:reverse"><circle cx="200" cy="180" r="118" fill="none" stroke="${ring}" stroke-dasharray="1 7"/><circle cx="200" cy="62" r="6" fill="${dark ? '#6dbb45' : '#047234'}"/><circle cx="96" cy="236" r="4.5" fill="${dark ? '#fff' : '#0e3b2c'}"/></g>
  <circle cx="200" cy="180" r="84" fill="${dark ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.7)'}" stroke="${dark ? 'rgba(255,255,255,.25)' : '#fff'}" stroke-width="1.5"/>
  <g transform="translate(140 120) scale(2.5)" color="${dark ? '#6dbb45' : '#047234'}" style="color:${dark ? '#6dbb45' : '#047234'}">${innerSvg48}</g>
</svg>`;
}
export const SOL_RAW = SOL;

/* Capas de artigos (geradas por categoria) */
export function coverIll(seed, palette) {
  const [bg, fg, ac] = palette;
  const R = rng(seed);
  const cx = 120 + R() * 200, cy = 60 + R() * 120;
  return `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="250" fill="${bg}"/>
  <g fill="none" stroke="${fg}" stroke-opacity=".35">${ringSet(cx, cy, 14, 260, 18, seed)}</g>
  <path d="M-10 ${200 - R() * 60} C 100 ${120 + R() * 80}, 220 ${220 - R() * 100}, 410 ${60 + R() * 100}" stroke="${ac}" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" fill="none" class="a-dash"/>
  <circle cx="${cx}" cy="${cy}" r="9" fill="${ac}"/><circle cx="${cx}" cy="${cy}" r="18" fill="none" stroke="${ac}" class="lm-pin-ring"/>
</svg>`;
}

/* Anéis do CTA final */
export function ctaRings() {
  return `<svg class="cta-rings" viewBox="0 0 100 100" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="50" cy="50" r="49" stroke-width=".3" style="animation-delay:${-i * 1.33}s"/>`).join('')}</svg>`;
}

/* 404 */
export function lostIll() {
  return `<svg class="nf-ill" viewBox="0 0 420 300" aria-hidden="true">
  <path d="M30 250 C 90 200, 120 260, 180 210 S 240 150, 270 170" fill="none" stroke="#047234" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" class="a-dash"/>
  <circle cx="30" cy="250" r="8" fill="#6dbb45"/>
  <g transform="translate(320 120)"><circle r="70" fill="rgba(255,255,255,.7)" stroke="#fff" stroke-width="2"/><circle r="56" fill="none" stroke="#0e3b2c" stroke-opacity=".25" stroke-dasharray="2 6"/>
  <g><path d="M0 -46 L10 0 L0 46 L-10 0Z" fill="#b4552f"/><path d="M0 46 L10 0 L-10 0Z" fill="#0e3b2c" opacity=".5"/><animateTransform attributeName="transform" type="rotate" values="0;140;80;260;200;360" dur="6s" repeatCount="indefinite"/></g><circle r="6" fill="#0e3b2c"/></g>
  <text x="250" y="200" font-family="Familjen Grotesk, sans-serif" font-size="46" font-weight="700" fill="#b4552f">?</text>
</svg>`;
}
