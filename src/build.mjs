// Gerador estático do site da Trilha Socioambiental.
// Uso: node src/build.mjs            -> dist/ com URLs limpas (/a-trilha/)
//      LINK_MODE=file OUT=preview node src/build.mjs -> links apontando para index.html (abre sem servidor)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { icon } from './icons.mjs';
import * as ILL from './ill.mjs';
import { SITE, SOLUTIONS, AUDIENCES, METHOD, VALUES, COMMITMENTS, PILLARS, BLOG_CATS, POSTS, TERMS, PROFILES, TOPICS } from './data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODE = process.env.LINK_MODE || 'pretty';
const OUT = path.resolve(ROOT, process.env.OUT || 'dist');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sol = (slug) => SOLUTIONS.find((s) => s.slug === slug);
const aud = (slug) => AUDIENCES.find((a) => a.slug === slug);
const cat = (slug) => BLOG_CATS.find((c) => c[0] === slug);
const term = (slug) => TERMS.find((t) => t[0] === slug);
const AUD_MENU = { comunidades: 'Informação e apoio técnico para participar de decisões.', empresas: 'Leitura territorial, prevenção de riscos e relacionamento.', organizacoes: 'Diagnóstico, planejamento, governança e gestão.' };
const AUD_ICON = { comunidades: 'users', empresas: 'building', organizacoes: 'sprout' };

/* ------------------------------------------------------------------ */
/* Contexto de página: caminhos relativos                              */
/* ------------------------------------------------------------------ */
function makeCtx(p, opts = {}) {
  const depth = p ? p.split('/').length : 0;
  const R = opts.absolute ? '/' : '../'.repeat(depth);
  const href = (target, hash = '') => {
    const base = R + (target ? target + '/' : '');
    const url = MODE === 'file' ? base + 'index.html' : (base || './');
    return url + hash;
  };
  return { path: p, R, href, asset: (a) => R + 'assets/' + a, section: p.split('/')[0] };
}

/* ------------------------------------------------------------------ */
/* Peças reutilizáveis                                                 */
/* ------------------------------------------------------------------ */
const aura = () => '<div class="aura" aria-hidden="true"><i></i><i></i><i></i></div>';
const contours = (c, n = 1, dark = false) => `<div class="contours" aria-hidden="true"><img src="${c.asset(`img/contornos-${n}-${dark ? 'claro' : 'escuro'}.svg`)}" alt="" loading="lazy" decoding="async"></div>`;
const photo = (title, desc, cls = '') => `<div class="photo-ph ${cls}" role="img" aria-label="Espaço reservado para foto: ${esc(title)}"><div class="ph-inner">${icon('camera', '')}<strong>${title}</strong><span>${desc}</span></div></div>`;
const validate = (t = 'Conteúdo em validação') => `<span class="validate">${t}</span>`;
const btn = (href, label, cls = '', extra = '') => `<a class="btn ${cls}" href="${href}" ${extra}><span>${label}</span>${icon('arrow')}</a>`;
const kicker = (t) => `<p class="kicker">${t}</p>`;
const crumbs = (c, items) => `<nav class="breadcrumb" aria-label="Você está em"><ol><li><a href="${c.href('')}">Início</a></li>${items.map((it, i) => i === items.length - 1 ? `<li aria-current="page">${it[0]}</li>` : `<li><a href="${c.href(it[1])}">${it[0]}</a></li>`).join('')}</ol></nav>`;
const contactHref = (c, perfil, tema) => c.href('contato') + (perfil || tema ? '?' + [perfil && `perfil=${perfil}`, tema && `tema=${encodeURIComponent(tema)}`].filter(Boolean).join('&') : '');
const sk = (n = 4) => `<div class="sk" aria-hidden="true">${'<i></i>'.repeat(n)}</div>`;

function postCard(c, p, i = 0) {
  const k = cat(p.cat);
  return `<a class="post-card glass spot" href="${c.href('blog/' + p.slug)}" data-cat="${p.cat}" data-reveal style="--d:${i * 120}">
    <div class="post-cover">${ILL.coverIll(p.seed, k[2])}</div>
    <div class="post-body"><span class="post-cat">${k[1]}</span><h3>${p.title}</h3><p>${p.summary}</p>
    <div class="post-meta"><span>Artigo de lançamento</span><span>Leitura: a definir</span></div></div></a>`;
}

function solCard(c, s, i, variant = '') {
  const isHero = variant === 'hero';
  return `<a class="sol-card glass glass--dark spot ${isHero ? 'is-hero' : ''}" href="${c.href('solucoes/' + s.slug)}" data-tilt data-reveal style="--d:${(i % 4) * 90}">
    ${isHero ? `<div class="sol-ill">${ILL.featureIll()}</div>` : `<div class="sol-ico">${ILL.solIcon(s.key)}</div>`}
    ${s.featured ? '<span class="tag">Frente prioritária</span>' : ''}
    <h3>${s.name}</h3><p>${s.card}</p>
    <span class="more">Conheça a solução ${icon('arrow', '')}</span></a>`;
}

function ctaBand(c, title, text, label, link) {
  return `<section class="section section--tight"><div class="wrap"><div class="cta-band glass spot" data-reveal="scale">
    <div><h2>${title}</h2>${text ? `<p class="muted" style="margin-top:.6rem;max-width:56ch">${text}</p>` : ''}</div>
    <div class="btn-row">${btn(link, label, 'btn--primary', 'data-magnetic')}</div></div></div></section>`;
}

function finalCta(c) {
  return `<section class="section section--tight" aria-labelledby="cta-final-t"><div class="wrap">
  <div class="cta-final on-dark" data-reveal="clip">${ILL.ctaRings()}
    <div class="inner glass glass--dark">
      ${kicker('Primeira conversa')}
      <h2 id="cta-final-t">Todo projeto começa com uma boa conversa sobre o contexto.</h2>
      <p class="lede">Conte onde você está, o que precisa compreender e qual decisão está diante de você. A equipe fará uma primeira leitura e indicará o melhor próximo passo.</p>
      <div class="btn-row">${btn(c.href('contato'), 'Fale com a Trilha', 'btn--light', 'data-magnetic')}${btn(c.href('solucoes'), 'Conheça nossas soluções', 'btn--glass')}</div>
    </div></div></div></section>`;
}

/* ------------------------------------------------------------------ */
/* Cabeçalho, rodapé e moldura                                         */
/* ------------------------------------------------------------------ */
function header(c) {
  const cur = (s) => (c.section === s ? ' is-current' : '');
  const ac = (p) => (c.path === p ? ' aria-current="page"' : '');
  const trilhaLinks = [['a-trilha', 'Nossa história', 'De Porto Trombetas ao modelo atual.', 'route'], ['como-atuamos', 'Como atuamos', 'Método em cinco etapas.', 'compass'], ['integridade', 'Independência e integridade', 'Papéis claros e compromissos.', 'shield']];
  const sub = (links) => links.map((l) => `<li><a href="${c.href(l[0])}"${ac(l[0])}><span class="mi">${icon(l[3], '')}</span><strong>${l[1]}</strong><small>${l[2]}</small></a></li>`).join('');
  const isTrilha = ['a-trilha', 'como-atuamos', 'integridade'].includes(c.section);
  return `<header class="site-header" id="topo"><div class="wrap"><div class="nav-shell">
    <a class="brand" href="${c.href('')}" aria-label="Trilha Socioambiental, página inicial"><img src="${c.asset('img/logo-horizontal.png')}" alt="Trilha Consultoria &amp; Gestão Socioambiental" width="900" height="168"></a>
    <nav class="nav" aria-label="Principal"><ul>
      <li class="has-menu${isTrilha ? ' is-current' : ''}"><button class="nav-trigger" aria-expanded="false" aria-controls="m-trilha">A Trilha ${icon('chevron', '')}</button>
        <ul class="mega mega--sm glass" id="m-trilha" role="list">${sub(trilhaLinks)}</ul></li>
      <li class="has-menu${cur('solucoes')}"><button class="nav-trigger" aria-expanded="false" aria-controls="m-sol">Soluções ${icon('chevron', '')}</button>
        <ul class="mega glass" id="m-sol" role="list">${SOLUTIONS.map((s) => `<li><a href="${c.href('solucoes/' + s.slug)}"${ac('solucoes/' + s.slug)}><span class="mi">${icon(s.icon, '')}</span><strong>${s.name}</strong><small>${s.menu}</small></a></li>`).join('')}
        <li class="mega-all-li" style="grid-column:1/-1"><a class="mega-all" href="${c.href('solucoes')}"><strong>Ver todas as soluções</strong>${icon('arrow', '')}</a></li></ul></li>
      <li class="has-menu${cur('para-quem')}"><button class="nav-trigger" aria-expanded="false" aria-controls="m-pq">Para quem atuamos ${icon('chevron', '')}</button>
        <ul class="mega mega--sm glass" id="m-pq" role="list">${AUDIENCES.map((a) => `<li><a href="${c.href('para-quem/' + a.slug)}"${ac('para-quem/' + a.slug)}><span class="mi">${icon(AUD_ICON[a.key], '')}</span><strong>${a.name}</strong><small>${AUD_MENU[a.key]}</small></a></li>`).join('')}</ul></li>
      <li><a href="${c.href('projetos-territorios')}"${c.section === 'projetos-territorios' ? ' aria-current="page"' : ''}>Projetos e territórios</a></li>
      <li class="has-menu${cur('blog')}${cur('glossario')}"><button class="nav-trigger" aria-expanded="false" aria-controls="m-cont">Conteúdos ${icon('chevron', '')}</button>
        <ul class="mega mega--sm glass" id="m-cont" role="list">${sub([['blog', 'Blog', 'Artigos, guias e análises.', 'book'], ['glossario', 'Glossário', 'Termos socioambientais em linguagem clara.', 'quote']])}</ul></li>
    </ul></nav>
    <div class="nav-actions">
      <button class="icon-btn" type="button" data-search-open aria-label="Buscar no site">${icon('search', '')}</button>
      <a class="btn btn--primary btn--sm nav-cta" href="${c.href('contato')}" data-magnetic><span>Fale com a Trilha</span>${icon('arrow')}</a>
      <button class="icon-btn menu-toggle" type="button" aria-expanded="false" aria-controls="menu-mobile" aria-label="Abrir menu"><span class="bars"><i></i><i></i><i></i></span></button>
    </div>
  </div><div class="route-progress" aria-hidden="true"><i></i></div></div></header>
  <div class="mobile-panel on-dark" id="menu-mobile" aria-label="Menu">
    <ul>
      <li><a href="${c.href('')}">Início ${icon('arrow', '')}</a></li>
      <li><details><summary>A Trilha ${icon('chevron', '')}</summary><ul>${trilhaLinks.map((l) => `<li><a href="${c.href(l[0])}">${l[1]}</a></li>`).join('')}</ul></details></li>
      <li><details><summary>Soluções ${icon('chevron', '')}</summary><ul><li><a href="${c.href('solucoes')}">Todas as soluções</a></li>${SOLUTIONS.map((s) => `<li><a href="${c.href('solucoes/' + s.slug)}">${s.name}</a></li>`).join('')}</ul></details></li>
      <li><details><summary>Para quem atuamos ${icon('chevron', '')}</summary><ul>${AUDIENCES.map((a) => `<li><a href="${c.href('para-quem/' + a.slug)}">${a.name}</a></li>`).join('')}</ul></details></li>
      <li><a href="${c.href('projetos-territorios')}">Projetos e territórios ${icon('arrow', '')}</a></li>
      <li><details><summary>Conteúdos ${icon('chevron', '')}</summary><ul><li><a href="${c.href('blog')}">Blog</a></li><li><a href="${c.href('glossario')}">Glossário</a></li></ul></details></li>
      <li><a href="${c.href('contato')}">Contato ${icon('arrow', '')}</a></li>
    </ul>
    ${btn(c.href('contato'), 'Fale com a Trilha', 'btn--light')}
  </div>`;
}

function footer(c) {
  return `<footer class="site-footer on-dark">${contours(c, 3, true)}<div class="wrap">
  <div class="footer-top">
    <div class="footer-brand"><img src="${c.asset('img/logo-trilha-branco.png')}" alt="Trilha Consultoria &amp; Gestão Socioambiental" width="720" height="432">
      <p class="sign">${SITE.signature}</p><p>${SITE.footerLine}</p>
      <div class="socials"><a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram @trilha.socioambiental (abre em nova aba)">${icon('instagram', '')}</a><a href="#" aria-label="LinkedIn (a confirmar)">${icon('linkedin', '')}</a></div>
    </div>
    <div class="footer-col"><h3>Navegue</h3><ul>
      <li><a href="${c.href('a-trilha')}">A Trilha</a></li><li><a href="${c.href('solucoes')}">Soluções</a></li>
      <li><a href="${c.href('projetos-territorios')}">Projetos</a></li><li><a href="${c.href('blog')}">Blog</a></li>
      <li><a href="${c.href('glossario')}">Glossário</a></li><li><a href="${c.href('contato')}">Contato</a></li></ul></div>
    <div class="footer-col footer-contact"><h3>Contato</h3><ul>
      <li>${icon('mail', '')}<span>${SITE.email}</span></li>
      <li>${icon('whatsapp', '')}<span>${SITE.whatsapp}</span></li>
      <li>${icon('pin', '')}<span>${SITE.city}</span></li></ul></div>
    <div class="footer-col newsletter" id="rodape-newsletter"><h3>Receba conteúdos para decidir com mais clareza.</h3>
      <p style="font-size:.92rem">Uma seleção mensal de artigos, referências e aprendizados da Trilha. Sem excesso de mensagens.</p>
      <form data-newsletter novalidate><label class="sr-only" for="nl-${c.path.replace(/\W/g, '') || 'home'}">Seu e-mail</label>
        <input id="nl-${c.path.replace(/\W/g, '') || 'home'}" type="email" name="email" placeholder="Seu e-mail" autocomplete="email" required>
        <button class="btn btn--primary btn--sm" type="submit"><span>Quero receber</span></button></form>
      <p class="msg" role="status" aria-live="polite"></p></div>
  </div>
  <div class="footer-bottom">
    <p>© <span data-year>2026</span> ${SITE.legal}<br>CNPJ ${SITE.cnpj}</p>
    <ul><li><a href="${c.href('privacidade')}">Privacidade</a></li><li><a href="${c.href('cookies')}">Cookies</a></li><li><a href="${c.href('acessibilidade')}">Acessibilidade</a></li><li><a href="${c.href('integridade')}">Integridade</a></li><li><button type="button" data-cookie-open style="background:none;border:0;padding:0;color:inherit;font-size:inherit;text-decoration:underline">Preferências de cookies</button></li></ul>
  </div>
  <p class="footer-word" aria-hidden="true">Trilha</p>
  </div></footer>`;
}

function overlays(c) {
  return `
  <div class="search-overlay" data-search role="dialog" aria-modal="true" aria-label="Busca no site">
    <div class="search-panel glass">
      <div class="search-field">${icon('search', '')}<label class="sr-only" for="q">Buscar</label><input id="q" type="search" placeholder="Busque por temas, serviços ou termos técnicos" autocomplete="off"></div>
      <ul class="search-results" data-search-results aria-live="polite"></ul>
    </div>
    <button class="icon-btn search-close" type="button" data-search-close aria-label="Fechar busca">${icon('close', '')}</button>
  </div>
  <div class="cookie glass" data-cookie role="region" aria-label="Preferências de cookies">
    <p>Usamos cookies essenciais para o funcionamento do site e, com sua autorização, cookies de medição. Você pode aceitar, recusar ou configurar suas preferências.</p>
    <div class="cookie-prefs">
      <label class="toggle"><span><strong>Essenciais</strong><br><small>Necessários para o site funcionar.</small></span><input type="checkbox" checked disabled></label>
      <label class="toggle"><span><strong>Medição</strong><br><small>Ajudam a entender o uso das páginas.</small></span><input type="checkbox" data-cookie-analytics></label>
    </div>
    <div class="btn-row">
      <button class="btn btn--primary btn--sm" type="button" data-cookie-accept><span>Aceitar opcionais</span></button>
      <button class="btn btn--ghost btn--sm" type="button" data-cookie-reject><span>Recusar opcionais</span></button>
      <button class="btn btn--ghost btn--sm" type="button" data-cookie-config><span>Configurar</span></button>
    </div>
  </div>
  <a class="mobile-cta" href="${c.href('contato')}"><span class="dot" aria-hidden="true"></span>Falar agora</a>`;
}

function page(c, { title, desc, body, bodyClass = '' }) {
  const fullTitle = c.path ? `${title} | Trilha Socioambiental` : `Trilha Socioambiental | ${title}`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0e3b2c">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Trilha Socioambiental">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${c.asset('img/og-trilha.png')}">
<link rel="icon" href="${c.asset('img/favicon-32.png')}" sizes="32x32">
<link rel="apple-touch-icon" href="${c.asset('img/apple-touch-icon.png')}">
<link rel="preload" href="${c.asset('fonts/familjen-grotesk-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${c.asset('fonts/instrument-sans-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${c.asset('css/styles.css')}">
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="${bodyClass}" data-root="${c.R}" data-mode="${MODE}">
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
${header(c)}
<main id="conteudo" tabindex="-1">
${body}
</main>
${footer(c)}
${overlays(c)}
<script src="${c.asset('js/search-index.js')}" defer></script>
<script src="${c.asset('js/main.js')}" defer></script>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* HOME                                                                */
/* ------------------------------------------------------------------ */
function home(c) {
  const h1 = 'Do território à decisão, construímos caminhos possíveis.';
  const words = h1.split(' ').map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' ');
  const [A, ...rest] = SOLUTIONS;
  return page(c, {
    title: 'Consultoria e assessoria técnica socioambiental',
    desc: 'A Trilha combina conhecimento técnico, escuta qualificada e articulação institucional para apoiar comunidades, organizações e empreendimentos diante de desafios sociais, ambientais e de governança.',
    body: `
<section class="hero" aria-labelledby="hero-t">${aura()}${contours(c, 1)}
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <span class="chip" data-reveal><span class="pulse" aria-hidden="true"></span>Consultoria e assessoria técnica socioambiental</span>
      <h1 id="hero-t" aria-label="${h1}"><span aria-hidden="true">${words}</span></h1>
      <p class="lede" data-reveal style="--d:500">A Trilha combina conhecimento técnico, escuta qualificada e articulação institucional para apoiar comunidades, organizações e empreendimentos diante de desafios sociais, ambientais e de governança.</p>
      <div class="btn-row" data-reveal style="--d:650">${btn(c.href('solucoes'), 'Conheça nossas soluções', 'btn--primary', 'data-magnetic')}${btn(c.href('contato'), 'Fale sobre o seu contexto', 'btn--ghost')}</div>
      <p class="proof" data-reveal style="--d:800">${icon('pin', '')}<span>Experiência construída na Amazônia, rede multidisciplinar e capacidade de atuação em diferentes territórios do Brasil.</span></p>
    </div>
    <div class="hero-visual" data-reveal="scale" style="--d:200">
      <div class="map-frame">${ILL.livingMap()}</div>
      ${photo('Foto documental de campo', 'Trabalho real, com autorização. Evitar floresta genérica de banco de imagem.', 'hero-photo')}
      <div class="waypoint waypoint--1 glass"><span class="n">1</span><span>Escuta<small>contexto e atores</small></span></div>
      <div class="waypoint waypoint--2 glass"><span class="n">2</span><span>Diagnóstico<small>evidências e riscos</small></span></div>
      <div class="waypoint waypoint--3 glass"><span class="n">${icon('check', '', 'style="width:16px;height:16px"')}</span><span>Decisão<small>ação coordenada</small></span></div>
    </div>
  </div>
</section>

<div class="trust"><div class="wrap"><ul class="trust-bar glass" role="list" data-reveal>
  <li class="trust-item"><span class="ti-ico">${ILL.solIcon('pgtaq')}</span><strong>Experiência territorial na Amazônia</strong></li>
  <li class="trust-item"><span class="ti-ico">${ILL.solIcon('articulacao')}</span><strong>Rede multidisciplinar</strong></li>
  <li class="trust-item"><span class="ti-ico">${ILL.solIcon('esg')}</span><strong>Atuação técnica e institucional</strong></li>
</ul></div></div>

<section class="section" aria-labelledby="prob-t"><div class="wrap grid-2">
  <div>
    ${kicker('Nossa abordagem')}
    <h2 class="h2" id="prob-t" style="margin:1rem 0 1.4rem;color:var(--forest)" data-reveal>Antes de propor uma resposta, é preciso compreender o território.</h2>
    <div class="prose-measure" style="display:grid;gap:1rem;--d:100" data-reveal>
      <p class="lede">Projetos, políticas e empreendimentos afetam relações, modos de vida, oportunidades e expectativas. Quando decisões são tomadas sem diagnóstico, participação e coordenação, aumentam os riscos sociais, operacionais e institucionais.</p>
      <p class="muted">Na Trilha, cada trabalho começa pela escuta e pela análise do contexto. A partir daí, organizamos informações, mobilizamos especialistas e desenhamos uma atuação adequada à realidade de cada projeto.</p>
    </div>
    <ul class="highlights" role="list">
      ${[['Leitura territorial e mapeamento de atores', 'map'], ['Tradução de informações técnicas', 'fileSearch'], ['Planejamento, implementação e monitoramento', 'calendar'], ['Articulação entre território e instituições', 'network']].map((h, i) => `<li class="glass" data-reveal style="--d:${i * 90}">${icon(h[1], '')}${h[0]}</li>`).join('')}
    </ul>
  </div>
  <div class="layers-ill" data-reveal="right">${ILL.layersIll()}</div>
</div></section>

<section class="section section--dark" aria-labelledby="sol-t">${aura()}${contours(c, 2, true)}<div class="wrap">
  <div class="sec-head sec-head--split">
    <div style="display:grid;gap:1rem">${kicker('Soluções')}<h2 class="h2" id="sol-t" data-reveal>Soluções desenhadas para cada etapa do caminho.</h2></div>
    <p class="lede" data-reveal style="--d:120">Atuamos desde o diagnóstico inicial até a implementação e o acompanhamento de programas, com equipes formadas conforme a complexidade da demanda.</p>
  </div>
  <div class="bento">
    ${solCard(c, A, 0, 'hero')}
    ${rest.map((s, i) => solCard(c, s, i + 1)).join('')}
    <a class="sol-card sol-card--cta spot" href="${c.href('contato')}" data-reveal style="--d:270">
      <div class="sol-ico">${icon('route', '')}</div>
      <h3>Não sabe qual solução se aplica?</h3><p>Descreva sua necessidade. A equipe indica o caminho mais adequado.</p>
      <span class="more">Descreva sua necessidade ${icon('arrow', '')}</span></a>
  </div>
</div></section>

<section class="section section--sand2" aria-labelledby="rot-t">${contours(c, 3)}<div class="wrap">
  <div class="sec-head">${kicker('Para quem atuamos')}<h2 class="h2" id="rot-t" style="color:var(--forest)" data-reveal>O mesmo território. Papéis, necessidades e responsabilidades diferentes.</h2></div>
  <div class="routes">
    ${AUDIENCES.map((a, i) => `<article class="route-card glass ${a.tone ? 'route-card--' + a.tone : ''}" data-reveal style="--d:${i * 120}">
      <div class="rc-ill">${ILL.audienceIll(a.key)}</div>
      <div class="rc-body"><p class="who">${a.name}</p><h3>${a.card}</h3>
      ${btn(c.href('para-quem/' + a.slug), a.cardCta)}</div></article>`).join('')}
  </div>
</div></section>

<section class="section method" aria-labelledby="met-t" data-method><div class="wrap">
  <div class="sec-head sec-head--split">
    <div style="display:grid;gap:1rem">${kicker('Método')}<h2 class="h2" id="met-t" style="color:var(--forest)" data-reveal>Escutamos. Diagnosticamos. Planejamos. Implementamos. Monitoramos.</h2></div>
    <div style="display:grid;gap:1.2rem;justify-items:start"><p class="lede" data-reveal>Cada demanda é única, mas a qualidade não pode depender de improviso.</p>${btn(c.href('como-atuamos'), 'Veja como atuamos', 'btn--ghost')}</div>
  </div>
  <div style="position:relative">
    <div class="method-line">${ILL.methodLine()}</div>
    <ol class="method-track">
      ${METHOD.map((m, i) => `<li class="step glass" data-reveal style="--d:${i * 110}"><span class="num">${i + 1}</span><h3>${m[0]}</h3><p>${m[1]}</p></li>`).join('')}
    </ol>
  </div>
</div></section>

<section class="section section--dark" aria-labelledby="exp-t">${aura()}<div class="wrap grid-2">
  <div>
    ${kicker('Experiência')}
    <h2 class="h2" id="exp-t" style="margin:1rem 0 1.4rem" data-reveal>Conhecimento que nasce no campo e alcança os espaços de decisão.</h2>
    <p class="lede" data-reveal>A história da Trilha começou na região de Porto Trombetas, em Oriximiná, no Oeste do Pará, em contextos que conectam comunidades tradicionais, grandes empreendimentos e políticas públicas.</p>
    <ul class="exp-facts" role="list">
      ${[['Comunidades tradicionais', 'users'], ['Grandes empreendimentos', 'building'], ['Políticas públicas', 'scale']].map((f, i) => `<li class="glass glass--dark" data-reveal style="--d:${i * 100}">${icon(f[1], '')}<span>${f[0]}</span></li>`).join('')}
    </ul>
    ${btn(c.href('a-trilha'), 'Conheça nossa trajetória', 'btn--light')}
  </div>
  <div data-reveal="right">
    <div class="river-map glass glass--dark">${ILL.riverMap()}<span class="rm-note">Representação esquemática, fora de escala.</span></div>
    ${photo('Foto de campo no Oeste do Pará', 'Equipe em processo de trabalho ou paisagem relacionada a projeto, com autorização.', 'exp-photo')}
  </div>
</div></section>

<section class="section" aria-labelledby="caso-t">${contours(c, 2)}<div class="wrap">
  <article class="case-card glass" data-reveal="scale">
    ${photo('Foto do caso', 'Imagem autorizada do trabalho com a comunidade. Validar nome, período e créditos.')}
    <div class="case-body">
      <div class="case-meta">${kicker('Caso')}${validate('Texto provisório: validar antes de publicar')}</div>
      <h2 id="caso-t">Participação qualificada pode mudar a trajetória de um território.</h2>
      <p class="muted">Em um trabalho continuado com comunidade quilombola na região de Oriximiná, a Trilha mobilizou uma equipe multidisciplinar para apoiar diagnósticos, organização de demandas, diálogo técnico e construção de programas sociais.</p>
      <div class="case-meta"><span class="pill">${icon('pin', '')}Oriximiná, PA</span><span class="pill">${icon('calendar', '')}Período a validar</span><span class="pill">${icon('users', '')}Equipe multidisciplinar</span></div>
      <div>${btn(c.href('projetos-territorios/caso-oriximina'), 'Conheça a abordagem do projeto', 'btn--primary')}</div>
    </div>
  </article>
</div></section>

<section class="section section--sand2" aria-labelledby="blog-t"><div class="wrap">
  <div class="sec-head sec-head--split">
    <div style="display:grid;gap:1rem">${kicker('Conteúdos')}<h2 class="h2" id="blog-t" style="color:var(--forest)" data-reveal>Informação para participar, planejar e decidir melhor.</h2></div>
    <div style="justify-self:start">${btn(c.href('blog'), 'Acesse os conteúdos', 'btn--ghost')}</div>
  </div>
  <div class="posts">${POSTS.map((p, i) => postCard(c, p, i)).join('')}</div>
</div></section>

${finalCta(c)}`,
  });
}

/* ------------------------------------------------------------------ */
/* Página genérica com hero                                            */
/* ------------------------------------------------------------------ */
function pageHero(c, { crumbs: cr, kick, h1, lede, ctas = '', ill = '', dark = false, illClass = 'glass' }) {
  return `<section class="page-hero ${dark ? 'page-hero--dark on-dark' : ''}">${aura()}${contours(c, 1, dark)}
  <div class="wrap ph-grid">
    <div class="ph-copy">
      ${crumbs(c, cr)}
      ${kick ? kicker(kick) : ''}
      <h1 data-reveal>${h1}</h1>
      ${lede ? `<p class="lede" data-reveal style="--d:120">${lede}</p>` : ''}
      ${ctas ? `<div class="btn-row" data-reveal style="--d:220">${ctas}</div>` : ''}
    </div>
    ${ill ? `<div class="ph-ill ${illClass} ${dark ? 'glass--dark' : ''}" data-reveal="scale" style="--d:150">${ill}</div>` : ''}
  </div></section>`;
}

/* ---------- A Trilha / Nossa história ---------- */
function aTrilha(c) {
  return page(c, {
    title: 'Nossa história', desc: 'Uma consultoria que nasceu do território: da região de Porto Trombetas, em Oriximiná, ao modelo atual de equipes multidisciplinares.',
    body: `${pageHero(c, { crumbs: [['A Trilha', 'a-trilha']], kick: 'A Trilha', h1: 'Uma consultoria que nasceu do território.', lede: 'A Trilha surgiu para apoiar decisões complexas onde desenvolvimento, direitos, ambiente e modos de vida se encontram. Desde o início, aprendemos que uma solução só se sustenta quando combina qualidade técnica, escuta verdadeira e capacidade de articulação.', ill: `<div class="river-map" style="width:100%;height:100%;aspect-ratio:auto">${ILL.riverMap()}</div>`, illClass: 'glass glass--dark', ctas: btn(c.href('como-atuamos'), 'Conheça como atuamos', 'btn--primary') })}
<section class="section"><div class="wrap grid-2">
  <div><h2 class="h2" style="color:var(--forest);margin-bottom:2rem" data-reveal>Nossa história</h2>
    <ol class="timeline" role="list">
      <li class="glass" data-reveal><h3>Porto Trombetas, Oriximiná</h3><p class="muted">A história da empresa começa na região de Porto Trombetas, em Oriximiná, no Oeste do Pará. O primeiro ciclo de atuação exigiu integrar conhecimentos, traduzir informações técnicas, organizar prioridades e conectar o território a instituições e espaços de decisão.</p></li>
      <li class="glass" data-reveal style="--d:120"><h3>O modelo atual</h3><p class="muted">Esse aprendizado formou o modelo atual: equipes multidisciplinares mobilizadas conforme a demanda e trabalho organizado do diagnóstico ao monitoramento.</p></li>
      <li class="glass" data-reveal style="--d:240"><h3>Base em Santarém</h3><p class="muted">Com sede em Santarém, no Pará, a Trilha amplia sua atuação para outros territórios do Brasil.</p>${validate('Validar ano de fundação')}</li>
    </ol></div>
  <div style="display:grid;gap:1rem">${photo('Equipe em campo', 'Registro autorizado da equipe em processo de trabalho.', 'is-wide')}${photo('Reunião ou oficina', 'Encontro autorizado com participantes, sem crianças identificáveis.', 'is-wide')}</div>
</div></section>
<section class="section section--dark">${aura()}<div class="wrap">
  <div class="sec-head">${kicker('Valores')}<h2 class="h2" data-reveal>O que orienta cada trabalho.</h2></div>
  <ul class="value-grid" role="list">${VALUES.map((v, i) => `<li class="value-card glass glass--dark spot" data-reveal style="--d:${(i % 3) * 100}"><span class="v-ico">${icon(v[1], '')}</span><h3>${v[0]}</h3></li>`).join('')}</ul>
</div></section>
<section class="section section--sand2"><div class="wrap">
  <div class="sec-head">${kicker('Equipe')}<h2 class="h2" style="color:var(--forest)" data-reveal>Equipe fixa e rede multidisciplinar.</h2><p class="lede">${validate('Aguardando minibiografias e fotos autorizadas')}</p></div>
  <div class="team">${[1, 2, 3, 4].map((n, i) => `<div class="team-card glass" data-reveal style="--d:${i * 90}">${photo('Retrato ' + n, 'Foto autorizada')}${sk(3)}</div>`).join('')}</div>
</div></section>
${ctaBand(c, 'Quer entender como a Trilha pode apoiar o seu contexto?', '', 'Conheça como atuamos', c.href('como-atuamos'))}
${finalCta(c)}`,
  });
}

/* ---------- Como atuamos ---------- */
function comoAtuamos(c) {
  const orbit = `<svg viewBox="0 0 400 360" aria-hidden="true">
    <circle cx="200" cy="180" r="130" fill="none" stroke="rgba(14,59,44,.25)" stroke-dasharray="2 9"/>
    <g class="a-orbit" style="transform-origin:200px 180px;animation-duration:30s">${METHOD.map((m, i) => { const t = (i / 5) * Math.PI * 2 - Math.PI / 2; const x = 200 + Math.cos(t) * 130, y = 180 + Math.sin(t) * 130; return `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="26" fill="${i === 0 ? '#047234' : '#fff'}" stroke="#047234" stroke-width="2"/><text x="${x.toFixed(1)}" y="${(y + 6).toFixed(1)}" text-anchor="middle" font-family="Familjen Grotesk" font-weight="700" font-size="18" fill="${i === 0 ? '#fff' : '#047234'}">${i + 1}</text></g>`; }).join('')}</g>
    <circle cx="200" cy="180" r="70" fill="rgba(255,255,255,.75)" stroke="#fff"/><g transform="translate(164 144) scale(1.5)" style="color:#047234">${ILL.SOL_RAW.consultoria}</g></svg>`;
  return page(c, {
    title: 'Como atuamos', desc: 'Método para transformar informação em ação coordenada: cinco etapas adaptáveis, com entregas, responsáveis e critérios claros.',
    body: `${pageHero(c, { crumbs: [['A Trilha', 'a-trilha'], ['Como atuamos', 'como-atuamos']], kick: 'Método', h1: 'Método para transformar informação em ação coordenada.', lede: 'Cada demanda é única, mas a qualidade não pode depender de improviso. A Trilha organiza seus projetos em cinco etapas adaptáveis, com entregas, responsáveis e critérios claros.', ill: orbit, ctas: btn(c.href('contato'), 'Solicite uma conversa inicial', 'btn--primary') })}
<section class="section method" data-method><div class="wrap">
  <div class="sec-head"><h2 class="h2" style="color:var(--forest)" data-reveal>Escuta, diagnóstico, planejamento, implementação e monitoramento.</h2></div>
  <div style="position:relative"><div class="method-line">${ILL.methodLine()}</div>
  <ol class="method-track">${METHOD.map((m, i) => `<li class="step glass" data-reveal style="--d:${i * 110}"><span class="num">${i + 1}</span><h3>${m[0]}</h3><p>${m[1]}</p></li>`).join('')}</ol></div>
</div></section>
<section class="section section--dark">${aura()}<div class="wrap">
  <div class="sec-head">${kicker('Pilares')}<h2 class="h2" data-reveal>Como a Trilha pensa cada trabalho.</h2></div>
  <ul class="value-grid" role="list">${PILLARS.map((p, i) => `<li class="value-card glass glass--dark spot" data-reveal style="--d:${(i % 3) * 100}"><span class="v-ico">${icon(p[2], '')}</span><h3>${p[0]}</h3><p style="color:rgba(233,239,233,.8)">${p[1]}</p></li>`).join('')}</ul>
</div></section>
${ctaBand(c, 'Solicite uma conversa inicial.', 'A equipe fará uma primeira leitura do contexto e indicará o melhor próximo passo.', 'Solicite uma conversa inicial', c.href('contato'))}`,
  });
}

/* ---------- Integridade ---------- */
function integridade(c) {
  return page(c, {
    title: 'Independência e integridade', desc: 'Confiança começa pela clareza do papel de cada parte. Regras transparentes para preservar autonomia técnica, confidencialidade e legitimidade.',
    body: `${pageHero(c, { crumbs: [['A Trilha', 'a-trilha'], ['Integridade', 'integridade']], kick: 'Independência e integridade', h1: 'Confiança começa pela clareza do papel de cada parte.', lede: 'A Trilha atua com comunidades, organizações, instituições e empreendimentos. Essa amplitude exige regras transparentes para preservar autonomia técnica, confidencialidade e legitimidade.', ill: ILL.badgeIll(ILL.SOL_RAW.licenciamento), ctas: btn(c.href('contato'), 'Fale com a Trilha', 'btn--primary') })}
<section class="section"><div class="wrap">
  <div class="sec-head">${kicker('Compromissos')}<h2 class="h2" style="color:var(--forest)" data-reveal>Seis compromissos que orientam a atuação.</h2><p>${validate('Aprovar política de independência e conflitos de interesse')}</p></div>
  <ul class="value-grid" role="list">${COMMITMENTS.map((v, i) => `<li class="value-card glass spot" data-reveal style="--d:${(i % 3) * 100}"><span class="v-ico">${icon(v[1], '')}</span><h3>${v[0]}</h3>${sk(2)}</li>`).join('')}</ul>
</div></section>
${finalCta(c)}`,
  });
}

/* ---------- Soluções (hub) ---------- */
function solucoes(c) {
  const hubIll = `<svg viewBox="0 0 400 360" aria-hidden="true"><g class="a-orbit" style="transform-origin:200px 180px;animation-duration:50s">${SOLUTIONS.map((s, i) => { const t = (i / 8) * Math.PI * 2; const x = 200 + Math.cos(t) * 140 - 22, y = 180 + Math.sin(t) * 140 - 22; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><rect width="44" height="44" rx="14" fill="#0e3b2c"/><g transform="translate(6 6) scale(.67)" style="color:#6dbb45">${ILL.SOL_RAW[s.key]}</g></g>`; }).join('')}</g><circle cx="200" cy="180" r="140" fill="none" stroke="rgba(14,59,44,.2)" stroke-dasharray="2 8"/><circle cx="200" cy="180" r="74" fill="rgba(255,255,255,.75)" stroke="#fff"/><g transform="translate(164 144) scale(1.5)" style="color:#047234">${ILL.SOL_RAW.pgtaq}</g></svg>`;
  return page(c, {
    title: 'Soluções', desc: 'Soluções para compreender, planejar e agir em contextos socioambientais complexos: assessoria técnica, consultoria, projetos sociais, ESG, licenciamento, CPLI, PGTAQs e articulação institucional.',
    body: `${pageHero(c, { crumbs: [['Soluções', 'solucoes']], kick: 'Soluções', h1: 'Soluções para compreender, planejar e agir em contextos socioambientais complexos.', lede: 'A Trilha combina competências conforme o problema, o território e a etapa do projeto. É possível contratar uma entrega específica ou uma jornada completa.', ill: hubIll, ctas: btn(c.href('contato'), 'Descreva sua necessidade', 'btn--primary') })}
<section class="section section--dark">${aura()}${contours(c, 2, true)}<div class="wrap">
  <div class="bento">${solCard(c, SOLUTIONS[0], 0, 'hero')}${SOLUTIONS.slice(1).map((s, i) => solCard(c, s, i + 1)).join('')}
  <a class="sol-card sol-card--cta spot" href="${c.href('contato')}" data-reveal><div class="sol-ico">${icon('route', '')}</div><h3>Não sabe qual solução se aplica?</h3><p>Descreva sua necessidade. A equipe indica o caminho mais adequado.</p><span class="more">Descreva sua necessidade ${icon('arrow', '')}</span></a></div>
</div></section>
<section class="section"><div class="wrap">
  <div class="sec-head">${kicker('Por público')}<h2 class="h2" style="color:var(--forest)" data-reveal>Encontre as soluções pelo seu papel no território.</h2></div>
  <div class="related">${AUDIENCES.map((a, i) => `<a class="glass spot" href="${c.href('para-quem/' + a.slug)}" data-reveal style="--d:${i * 100}"><span class="r-ico">${icon(AUD_ICON[a.key], '')}</span><strong>${a.name}</strong><small>${a.card}</small><span class="link-arrow"><span>${a.cardCta}</span>${icon('arrow')}</span></a>`).join('')}</div>
</div></section>
${finalCta(c)}`,
  });
}

/* ---------- Página de solução ---------- */
function solucao(c, s) {
  const a = aud(s.audience);
  const others = SOLUTIONS.filter((x) => x.slug !== s.slug).slice(0, 3);
  return page(c, {
    title: s.name, desc: `${s.h1} ${s.text}`,
    body: `${pageHero(c, { crumbs: [['Soluções', 'solucoes'], [s.name, 'solucoes/' + s.slug]], kick: s.name, h1: s.h1, lede: s.text, ill: ILL.badgeIll(ILL.SOL_RAW[s.key]), ctas: btn(contactHref(c, '', s.topic), s.cta, 'btn--primary', 'data-magnetic') + btn(c.href('como-atuamos'), 'Entenda como funciona', 'btn--ghost') })}
<section class="section section--dark">${aura()}${contours(c, 3, true)}<div class="wrap">
  <div class="sec-head">${kicker('Entregas')}<h2 class="h2" data-reveal>O que pode fazer parte deste trabalho.</h2><p class="lede">As entregas são combinadas conforme o território, o papel da Trilha e a etapa do projeto.</p></div>
  <ul class="deliverables" role="list">${s.entregas.map((e, i) => `<li class="deliverable glass glass--dark spot" data-reveal style="--d:${(i % 3) * 90}"><span class="d-ico">${icon(e[1], '')}</span><span>${e[0]}</span></li>`).join('')}</ul>
</div></section>
<section class="section method" data-method><div class="wrap">
  <div class="sec-head sec-head--split"><div style="display:grid;gap:1rem">${kicker('Como funciona')}<h2 class="h2" style="color:var(--forest)" data-reveal>Escutamos. Diagnosticamos. Planejamos. Implementamos. Monitoramos.</h2></div><div>${btn(c.href('como-atuamos'), 'Veja como atuamos', 'btn--ghost')}</div></div>
  <div style="position:relative"><div class="method-line">${ILL.methodLine()}</div>
  <ol class="method-track">${METHOD.map((m, i) => `<li class="step glass" data-reveal style="--d:${i * 110}"><span class="num">${i + 1}</span><h3>${m[0]}</h3><p>${m[1]}</p></li>`).join('')}</ol></div>
</div></section>
<section class="section section--sand2"><div class="wrap">
  <div class="sec-head">${kicker('Continue explorando')}<h2 class="h2" style="color:var(--forest)" data-reveal>Soluções relacionadas.</h2></div>
  <div class="related">
    <a class="glass spot" href="${c.href('para-quem/' + a.slug)}" data-reveal><span class="r-ico">${icon('users', '')}</span><small>Para quem</small><strong>${a.name}</strong><small>${a.card}</small></a>
    ${others.map((o, i) => `<a class="glass spot" href="${c.href('solucoes/' + o.slug)}" data-reveal style="--d:${(i + 1) * 90}"><span class="r-ico">${ILL.solIcon(o.key)}</span><strong>${o.name}</strong><small>${o.card}</small></a>`).join('')}
  </div>
</div></section>
${ctaBand(c, s.cta + '.', 'Conte onde você está e qual decisão está diante de você. A equipe fará uma primeira leitura.', 'Fale com a Trilha', contactHref(c, '', s.topic))}`,
  });
}

/* ---------- Página por público ---------- */
function publico(c, a) {
  return page(c, {
    title: a.name, desc: `${a.h1} ${a.text}`,
    body: `${pageHero(c, { crumbs: [['Para quem atuamos', 'para-quem/' + a.slug], [a.name, 'para-quem/' + a.slug]], kick: a.name, h1: a.h1, lede: a.text, ill: ILL.audienceIll(a.key), ctas: btn(contactHref(c, a.profile), a.cta, 'btn--primary', 'data-magnetic') })}
<section class="section"><div class="wrap">
  <div class="sec-head">${kicker(a.listTitle)}<h2 class="h2" style="color:var(--forest)" data-reveal>${a.key === 'comunidades' ? 'Quando o apoio técnico faz diferença.' : 'Onde a Trilha pode contribuir.'}</h2></div>
  <ul class="value-grid" role="list">${a.items.map((it, i) => `<li class="value-card glass spot" data-reveal style="--d:${(i % 3) * 90}"><span class="v-ico">${icon(it[1], '')}</span><h3>${it[0]}</h3></li>`).join('')}</ul>
</div></section>
<section class="section section--dark">${aura()}${contours(c, 2, true)}<div class="wrap">
  <div class="sec-head">${kicker('Soluções indicadas')}<h2 class="h2" data-reveal>Caminhos mais usados por ${a.short.toLowerCase()}.</h2></div>
  <div class="bento">${a.solutions.map((sl, i) => solCard(c, sol(sl), i)).join('')}</div>
</div></section>
${a.key === 'comunidades' ? `<section class="section section--tight"><div class="wrap"><div class="notice" data-reveal>${icon('lock', '')}<p><strong>Conversa reservada.</strong> Demandas sensíveis podem seguir para um canal reservado. Não envie documentos confidenciais no primeiro contato: se necessário, a equipe indicará um canal seguro.</p></div></div></section>` : ''}
${ctaBand(c, a.cta + '.', 'Conte o contexto em poucas linhas. A equipe responde pelo canal que você preferir.', a.cta, contactHref(c, a.profile))}`,
  });
}

/* ---------- Projetos e territórios ---------- */
function projetos(c) {
  return page(c, {
    title: 'Projetos e territórios', desc: 'Nossa experiência foi formada em contextos amazônicos e vem se ampliando para outras regiões do Brasil.',
    body: `${pageHero(c, { crumbs: [['Projetos e territórios', 'projetos-territorios']], kick: 'Projetos e territórios', h1: 'Cada território ensina uma forma diferente de construir soluções.', lede: 'Nossa experiência foi formada em contextos amazônicos e vem se ampliando para outras regiões do Brasil. Trabalhamos com leitura de campo, equipes mobilizadas conforme a demanda e articulação entre escalas local e institucional.', dark: true, ill: ILL.badgeIll(ILL.SOL_RAW.pgtaq, { dark: true }) })}
<section class="section section--dark" style="padding-top:0">${aura()}<div class="wrap">
  <div class="terr-grid">
    <div data-reveal="scale"><div class="river-map glass glass--dark">${ILL.riverMap()}<span class="rm-note">Representação esquemática, fora de escala.</span></div>
      <ul class="legend" role="list"><li><i class="l-done"></i>Projetos concluídos</li><li><i class="l-now"></i>Projetos em andamento</li><li><i class="l-net"></i>Rede e capacidade de mobilização</li></ul></div>
    <div style="display:grid;gap:1rem;align-content:start">
      <h2 class="h2" style="font-size:1.8rem">Territórios no mapa</h2>
      <p style="color:rgba(233,239,233,.8)">Lista textual equivalente ao mapa. Somente locais com atuação comprovada e autorizada.</p>
      <ul class="place-list" role="list">
        ${[['Porto Trombetas', 'Oriximiná, PA'], ['Oriximiná', 'Oeste do Pará'], ['Santarém', 'Pará, sede da Trilha']].map((p, i) => `<li class="glass glass--dark" data-reveal style="--d:${i * 90}"><span><strong>${p[0]}</strong><small>${p[1]}</small></span>${validate('Validar')}</li>`).join('')}
      </ul>
      <p style="font-size:.85rem;color:rgba(233,239,233,.65)">Outros territórios citados em materiais serão incluídos após validação e autorização.</p>
    </div>
  </div>
</div></section>
<section class="section"><div class="wrap">
  <div class="sec-head sec-head--split"><div style="display:grid;gap:1rem">${kicker('Casos')}<h2 class="h2" style="color:var(--forest)" data-reveal>Trabalhos que podem ser compartilhados.</h2></div><p class="muted">Cada caso é publicado com autorização das partes envolvidas, sem informações sensíveis.</p></div>
  <div class="filters" role="group" aria-label="Filtrar casos">${['Todos', 'Comunidades', 'Empresas', 'Organizações'].map((f, i) => `<button class="filter" type="button" aria-pressed="${i === 0}" data-filter="${i === 0 ? '*' : f.toLowerCase()}">${f}</button>`).join('')}</div>
  <div class="case-grid" data-filter-list>
    <a class="case-tile glass spot" href="${c.href('projetos-territorios/caso-oriximina')}" data-tags="comunidades" data-reveal>${photo('Foto do caso', 'Imagem autorizada')}
      <div class="ct-body">${validate('Texto provisório')}<h3>Participação qualificada com comunidade quilombola</h3>
      <dl><dt>Território e período</dt><dd>Região de Oriximiná, PA. Período a validar.</dd><dt>Desafio</dt><dd>Apoiar diagnósticos, organização de demandas e diálogo técnico.</dd><dt>Atuação da Trilha</dt><dd>Equipe multidisciplinar e construção de programas sociais.</dd><dt>Resultado verificável</dt><dd>${sk(2)}</dd></dl>
      <span class="link-arrow"><span>Ver caso</span>${icon('arrow')}</span></div></a>
    ${['empresas', 'organizações'].map((t, i) => `<div class="case-tile glass is-empty" data-tags="${t}" data-reveal style="--d:${(i + 1) * 100}">${photo('Próximo caso', 'Aguardando caso publicável e autorização')}<div class="ct-body"><h3 style="color:var(--ink-3)">Caso em preparação</h3>${sk(4)}</div></div>`).join('')}
  </div>
</div></section>
${finalCta(c)}`,
  });
}

function casoPage(c) {
  const sections = [['Contexto', 4], ['Papel da Trilha', 3], ['Desafio', 3], ['Caminho construído', 4], ['Entregas', 3], ['Resultados', 3], ['Aprendizados', 3], ['Créditos e autorizações', 2]];
  return page(c, {
    title: 'Caso: participação qualificada em Oriximiná', desc: 'Modelo de página de caso: contexto, papel da Trilha, desafio, caminho, entregas, resultados, aprendizados e créditos.',
    body: `${pageHero(c, { crumbs: [['Projetos e territórios', 'projetos-territorios'], ['Caso', 'projetos-territorios/caso-oriximina']], kick: 'Caso', h1: 'Participação qualificada pode mudar a trajetória de um território.', lede: 'Em um trabalho continuado com comunidade quilombola na região de Oriximiná, a Trilha mobilizou uma equipe multidisciplinar para apoiar diagnósticos, organização de demandas, diálogo técnico e construção de programas sociais.', ill: photo('Foto principal do caso', 'Autorizada, com créditos'), illClass: '' })}
<section class="section section--tight"><div class="wrap"><p style="margin-bottom:1.5rem">${validate('VALIDAR: nome, período, resultados, valores, fotos, depoimentos e autorização antes de publicar')}</p>
  <ol class="case-steps" role="list">${sections.map((s, i) => `<li class="glass" data-reveal style="--d:${(i % 2) * 90}"><h2>${s[0]}</h2>${sk(s[1])}</li>`).join('')}</ol>
</div></section>
${ctaBand(c, 'Quer conversar sobre um contexto parecido?', '', 'Fale com a Trilha', c.href('contato'))}`,
  });
}

/* ---------- Blog ---------- */
function blog(c) {
  return page(c, {
    title: 'Blog', desc: 'Artigos, guias e análises sobre assessoria técnica, comunidades tradicionais, licenciamento, projetos sociais, ESG, governança e articulação institucional.',
    body: `${pageHero(c, { crumbs: [['Conteúdos', 'blog'], ['Blog', 'blog']], kick: 'Blog', h1: 'Informação para compreender territórios e participar de decisões.', lede: 'Artigos, guias e análises sobre assessoria técnica, comunidades tradicionais, licenciamento, projetos sociais, ESG, governança e articulação institucional.', ill: ILL.badgeIll(`<rect x="10" y="6" width="28" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 15h16M16 21h16M16 27h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="a-blink"/><circle cx="36" cy="36" r="7" fill="#e0b062" class="a-pop"/>`) })}
<section class="section"><div class="wrap">
  <div class="filters" role="group" aria-label="Filtrar por categoria"><button class="filter" type="button" aria-pressed="true" data-filter="*">Todas</button>${BLOG_CATS.map((k) => `<button class="filter" type="button" aria-pressed="false" data-filter="${k[0]}">${k[1]}</button>`).join('')}</div>
  <div class="posts" data-filter-list>${POSTS.map((p, i) => postCard(c, p, i).replace('data-cat=', 'data-tags=')).join('')}</div>
  <div class="empty-state glass is-hidden" data-filter-empty><strong style="font-family:var(--f-display);font-size:1.2rem;color:var(--forest)">Ainda não há artigos nesta categoria.</strong><p class="muted">Novos conteúdos são publicados mensalmente. Veja todas as categorias ou receba a seleção por e-mail.</p></div>
</div></section>
${ctaBand(c, 'Receba conteúdos para decidir com mais clareza.', 'Uma seleção mensal de artigos, referências e aprendizados da Trilha. Sem excesso de mensagens.', 'Quero receber', '#rodape-newsletter')}`,
  });
}

function artigo(c, p) {
  const k = cat(p.cat);
  const others = POSTS.filter((x) => x.slug !== p.slug);
  return page(c, {
    title: p.title, desc: p.summary,
    body: `<section class="page-hero">${aura()}${contours(c, 2)}<div class="wrap" style="display:grid;gap:1.3rem;max-width:980px">
  ${crumbs(c, [['Blog', 'blog'], [k[1], 'blog'], ['Artigo', 'blog/' + p.slug]])}
  <span class="post-cat" style="font-weight:650;color:var(--terra)">${k[1]}</span>
  <h1 style="font-size:var(--t-h1);color:var(--forest);max-width:22ch" data-reveal>${p.title}</h1>
  <p class="lede" data-reveal>${p.summary}</p>
  <div class="article-meta"><span class="author"><span class="av" aria-hidden="true"></span>Autor a definir</span><span>${icon('calendar', '', 'style="width:16px;display:inline;vertical-align:-3px"')} Data de publicação</span><span>${icon('clock', '', 'style="width:16px;display:inline;vertical-align:-3px"')} Tempo de leitura</span></div>
  <div class="post-cover glass" style="aspect-ratio:21/9;border-radius:var(--r-xl);margin-top:1rem" data-reveal="clip">${ILL.coverIll(p.seed, k[2])}</div>
</div></section>
<section class="section" style="padding-top:0"><div class="wrap article-layout">
  <nav class="toc glass" aria-label="Sumário"><h2>Neste artigo</h2><ol>${p.toc.map((t, i) => `<li><a href="#s${i + 1}">${t}</a></li>`).join('')}</ol></nav>
  <article class="prose">
    <p>${validate('Texto do artigo a produzir')}</p>
    ${p.toc.map((t, i) => `<h2 id="s${i + 1}">${t}</h2>${sk(4)}${i === 1 ? `<aside class="box box--atencao"><h3>${icon('alert', '')}Atenção</h3>${sk(2)}</aside>` : ''}`).join('')}
    <aside class="box box--resumo"><h3>${icon('check', '')}Em resumo</h3>${sk(3)}</aside>
    <h2>Fontes</h2>${sk(2)}
    <aside class="box box--proximo on-dark"><h3>${icon('route', '')}Próximo passo</h3><p>Conte o seu contexto. A equipe fará uma primeira leitura e indicará o melhor próximo passo.</p><div>${btn(c.href('contato'), 'Fale com a Trilha', 'btn--light btn--sm')}</div></aside>
    <p class="muted" style="font-size:.92rem">Termos citados: ${p.terms.map((t) => `<a href="${c.href('glossario/' + t)}">${term(t)[1]}</a>`).join(', ')}. Solução relacionada: <a href="${c.href('solucoes/' + p.related[0])}">${sol(p.related[0]).name}</a>.</p>
  </article>
</div></section>
<section class="section section--sand2"><div class="wrap"><div class="sec-head">${kicker('Relacionados')}<h2 class="h2" style="color:var(--forest)">Continue lendo.</h2></div><div class="posts">${others.map((o, i) => postCard(c, o, i)).join('')}</div></div></section>`,
  });
}

/* ---------- Glossário ---------- */
function glossario(c) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const have = new Set(TERMS.map((t) => t[1][0].toUpperCase()));
  const sorted = [...TERMS].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  return page(c, {
    title: 'Glossário', desc: 'Termos socioambientais em linguagem clara: assessoria técnica independente, CPLI, ECQ, PBAQ, PNGTAQ, PGTAQ e outros.',
    body: `${pageHero(c, { crumbs: [['Conteúdos', 'blog'], ['Glossário', 'glossario']], kick: 'Glossário', h1: 'Termos socioambientais em linguagem clara.', lede: 'Siglas e conceitos que aparecem em processos de licenciamento, participação, projetos sociais e governança, explicados de forma direta.', ill: ILL.badgeIll(`<text x="24" y="31" text-anchor="middle" font-family="Familjen Grotesk" font-weight="700" font-size="20" fill="currentColor">Aa</text><path d="M10 38h28" stroke="#e0b062" stroke-width="3" stroke-linecap="round" class="a-draw" style="--len:30"/>`) })}
<section class="section" style="padding-top:2rem"><div class="wrap">
  <div class="search-field"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><label class="sr-only" for="gq">Filtrar termos</label><input id="gq" type="search" placeholder="Filtrar termos" data-gloss-filter></div>
  <nav class="az" aria-label="Índice alfabético">${letters.map((l) => (have.has(l) ? `<a href="#letra-${l}">${l}</a>` : `<span aria-hidden="true">${l}</span>`)).join('')}</nav>
  <ul class="terms" role="list" data-gloss-list>
    ${sorted.map((t, i) => { const L = t[1][0].toUpperCase(); const first = sorted.findIndex((x) => x[1][0].toUpperCase() === L) === i; return `<li class="term glass" id="${first ? 'letra-' + L : t[0]}" data-term="${esc((t[1] + ' ' + t[2]).toLowerCase())}" data-reveal><h2><a href="${c.href('glossario/' + t[0])}" style="text-decoration:none">${t[1]}</a>${t[2] ? `<small>${t[2]}</small>` : ''}</h2>${sk(2)}<div class="term-links"><a class="link-arrow" href="${c.href('glossario/' + t[0])}"><span>Ver definição</span>${icon('arrow')}</a>${t[3].map((s) => `<a href="${c.href('solucoes/' + s)}">${sol(s).name}</a>`).join('')}</div></li>`; }).join('')}
  </ul>
  <div class="empty-state glass is-hidden" data-gloss-empty><strong style="font-family:var(--f-display);font-size:1.2rem;color:var(--forest)">Não encontramos esse termo.</strong><p class="muted">Tente uma palavra diferente ou fale com a equipe.</p>${btn(c.href('contato'), 'Fale com a Trilha', 'btn--ghost btn--sm')}</div>
</div></section>`,
  });
}

function termoPage(c, t) {
  const posts = POSTS.filter((p) => p.terms.includes(t[0]));
  return page(c, {
    title: t[2] ? `${t[1]}: ${t[2]}` : t[1], desc: `${t[1]}${t[2] ? ` (${t[2]})` : ''}: definição em linguagem clara no glossário da Trilha Socioambiental.`,
    body: `<section class="page-hero">${aura()}${contours(c, 3)}<div class="wrap" style="display:grid;gap:1.3rem;max-width:900px">
  ${crumbs(c, [['Glossário', 'glossario'], [t[1], 'glossario/' + t[0]]])}
  <h1 style="font-size:var(--t-h1);color:var(--forest)" data-reveal>${t[1]}</h1>
  ${t[2] ? `<p class="lede" data-reveal>${t[2]}</p>` : ''}
  <div class="glass" style="padding:1.75rem;border-radius:var(--r-lg);display:grid;gap:1rem" data-reveal>${validate('Definição a produzir pela equipe')}${sk(4)}</div>
  <div class="related" style="margin-top:1rem">
    ${t[3].map((s) => `<a class="glass spot" href="${c.href('solucoes/' + s)}"><span class="r-ico">${ILL.solIcon(sol(s).key)}</span><small>Solução relacionada</small><strong>${sol(s).name}</strong></a>`).join('')}
    ${posts.map((p) => `<a class="glass spot" href="${c.href('blog/' + p.slug)}"><span class="r-ico">${icon('book', '')}</span><small>Artigo relacionado</small><strong>${p.title}</strong></a>`).join('')}
  </div>
  <div>${btn(c.href('glossario'), 'Voltar ao glossário', 'btn--ghost')}</div>
</div></section>`,
  });
}

/* ---------- Contato ---------- */
function contato(c) {
  return page(c, {
    title: 'Contato', desc: 'Conte o contexto. A Trilha ajuda a organizar o próximo passo.',
    body: `${pageHero(c, { crumbs: [['Contato', 'contato']], kick: 'Contato', h1: 'Conte o contexto. A Trilha ajuda a organizar o próximo passo.', lede: 'Escolha o perfil que melhor representa você e compartilhe apenas as informações necessárias para uma primeira conversa. Demandas sensíveis podem seguir para um canal reservado.' })}
<section class="section" style="padding-top:0"><div class="wrap contact-grid">
  <div class="form-card glass" data-reveal>
    <ol class="progress" aria-label="Etapas do formulário">${['Perfil', 'Dados', 'Tema', 'Contexto'].map((s, i) => `<li class="${i === 0 ? 'is-current' : ''}" data-progress="${i}"><span>${i + 1}. ${s}</span></li>`).join('')}</ol>
    <form data-contact novalidate>
      <fieldset class="fstep is-active" data-step="0">
        <legend>Você fala em nome de quem?</legend>
        <p class="hint">As próximas perguntas se adaptam à sua resposta.</p>
        <div class="choice-grid" role="radiogroup">${PROFILES.map((p) => `<div class="choice"><input type="radio" name="perfil" id="pf-${p[0]}" value="${p[0]}" required><label for="pf-${p[0]}">${icon(p[2], '')}${p[1]}</label></div>`).join('')}</div>
        <p class="field"><span class="err" id="err-perfil" role="alert"></span></p>
      </fieldset>
      <fieldset class="fstep" data-step="1">
        <legend>Como podemos falar com você?</legend>
        <div class="fields">
          <div class="field"><label for="f-nome">Nome</label><input id="f-nome" name="nome" autocomplete="name" required aria-describedby="err-nome"><span class="err" id="err-nome"></span></div>
          <div class="field"><label for="f-org" data-org-label>Organização ou comunidade</label><input id="f-org" name="organizacao" autocomplete="organization" required aria-describedby="err-org"><span class="err" id="err-org"></span></div>
          <div class="field"><label for="f-email">E-mail</label><input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="err-email"><span class="err" id="err-email"></span></div>
          <div class="field"><label for="f-whats">WhatsApp</label><input id="f-whats" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(DDD) 9 0000-0000" required aria-describedby="err-whats"><span class="err" id="err-whats"></span></div>
          <div class="field"><label for="f-cidade">Cidade e estado</label><input id="f-cidade" name="cidade" autocomplete="address-level2" placeholder="Ex.: Santarém, PA" required aria-describedby="err-cidade"><span class="err" id="err-cidade"></span></div>
          <div class="field"><label for="f-canal">Canal preferido</label><select id="f-canal" name="canal"><option>WhatsApp</option><option>E-mail</option><option>Ligação</option><option>Conversa reservada</option></select></div>
        </div>
      </fieldset>
      <fieldset class="fstep" data-step="2">
        <legend>Qual tema está mais próximo da sua demanda?</legend>
        <p class="hint" data-topic-hint>Escolha um tema. Se tiver dúvida, selecione "Outro".</p>
        <div class="choice-grid" data-topics>${TOPICS.map((t) => `<div class="choice" data-topic="${t[0]}"><input type="radio" name="tema" id="tp-${t[0]}" value="${t[1]}" required><label for="tp-${t[0]}">${icon(t[2], '')}<span>${t[1]}<small class="sug" hidden>Comum para o seu perfil</small></span></label></div>`).join('')}</div>
        <p class="field"><span class="err" id="err-tema" role="alert"></span></p>
      </fieldset>
      <fieldset class="fstep" data-step="3">
        <legend>O que está acontecendo?</legend>
        <div class="field"><label for="f-ctx">Conte, em poucas linhas, o que está acontecendo e qual decisão ou prazo está diante de você.</label>
          <textarea id="f-ctx" name="contexto" maxlength="1200" required aria-describedby="err-ctx ctx-count"></textarea>
          <span class="counter" id="ctx-count" aria-live="polite">0 de 1200 caracteres</span><span class="err" id="err-ctx"></span></div>
        <div class="notice">${icon('alert', '')}<p>Não envie documentos confidenciais neste primeiro formulário. Se necessário, a equipe indicará um canal seguro.</p></div>
      </fieldset>
      <div class="form-nav">
        <button class="btn btn--ghost" type="button" data-prev hidden><span>Voltar</span></button>
        <button class="btn btn--primary" type="button" data-next style="margin-left:auto"><span>Continuar</span>${icon('arrow')}</button>
        <button class="btn btn--primary" type="submit" data-submit hidden style="margin-left:auto"><span>Enviar contexto</span>${icon('arrow')}</button>
      </div>
    </form>
    <div class="form-success" data-success role="status" aria-live="polite" tabindex="-1">
      <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#d6ebc4"/><circle cx="60" cy="60" r="54" fill="none" stroke="#047234" stroke-width="3" stroke-dasharray="4 8" class="a-orbit" style="transform-origin:60px 60px"/><path class="success-check" d="M38 62l15 15 30-33" fill="none" stroke="#047234" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <h2>Contexto enviado.</h2>
      <p class="lede" style="margin-inline:auto">Recebemos sua mensagem. Nossa equipe fará uma leitura inicial e responderá pelo canal indicado em até ${SITE.responseTime}.</p>
      ${btn(c.href('solucoes'), 'Conheça nossas soluções', 'btn--ghost')}
    </div>
  </div>
  <aside class="contact-side">
    <div class="glass" data-reveal="right"><h2>Outros canais</h2>
      <a class="channel" href="${SITE.whatsappHref}"><span class="c-ico">${icon('whatsapp', '')}</span><span><strong>WhatsApp</strong><small>${SITE.whatsapp}</small></span></a>
      <a class="channel" href="mailto:"><span class="c-ico">${icon('mail', '')}</span><span><strong>E-mail</strong><small>${SITE.email}</small></span></a>
      <a class="channel" href="${SITE.instagram}" target="_blank" rel="noopener"><span class="c-ico">${icon('instagram', '')}</span><span><strong>Instagram</strong><small>@trilha.socioambiental</small></span></a>
      <div class="channel" style="cursor:default"><span class="c-ico">${icon('pin', '')}</span><span><strong>Base</strong><small>${SITE.city}</small></span></div>
      ${validate('Validar e-mail, número oficial, horário e prazo de resposta')}
    </div>
    <div class="glass" data-reveal="right" style="--d:120"><h2>Como funciona a primeira conversa</h2>
      <ol style="list-style:none;display:grid;gap:.8rem">${['Você conta o contexto.', 'A equipe faz uma leitura inicial.', 'Indicamos o melhor próximo passo.'].map((s, i) => `<li style="display:flex;gap:.8rem;align-items:center"><span class="num" style="width:34px;height:34px;border-radius:50%;background:var(--forest);color:#fff;display:grid;place-items:center;font-family:var(--f-display);font-weight:650;flex:none">${i + 1}</span>${s}</li>`).join('')}</ol>
    </div>
  </aside>
</div></section>`,
  });
}

/* ---------- Legais e 404 ---------- */
function legal(c, slug, title, intro) {
  return page(c, {
    title, desc: `${title} da Trilha Socioambiental.`,
    body: `${pageHero(c, { crumbs: [[title, slug]], h1: title, lede: intro })}
<section class="section" style="padding-top:0"><div class="wrap"><div class="legal-body glass" style="padding:clamp(1.5rem,4vw,3rem);border-radius:var(--r-xl)">
  ${validate('Texto jurídico a ser fornecido e revisado')}
  ${['Quem somos', 'Quais dados tratamos', 'Para que usamos', 'Seus direitos', 'Contato'].map((h) => `<h2>${h}</h2>${sk(4)}`).join('')}
</div></div></section>`,
  });
}
function notFound(c) {
  return page(c, {
    title: 'Página não encontrada', desc: 'Este caminho não foi encontrado.',
    body: `<section class="nf">${aura()}${contours(c, 1)}<div>
  ${ILL.lostIll()}
  <h1>Este caminho não foi encontrado.</h1>
  <p>O conteúdo pode ter mudado de endereço. Volte ao início, explore nossas soluções ou use a busca.</p>
  <div class="btn-row">${btn(c.href(''), 'Ir para o início', 'btn--primary')}<button class="btn btn--ghost" type="button" data-search-open><span>Buscar conteúdo</span>${icon('search')}</button></div>
</div></section>`,
  });
}

/* ------------------------------------------------------------------ */
/* Saída                                                               */
/* ------------------------------------------------------------------ */
function write(p, html) {
  const file = p === '404' ? path.join(OUT, '404.html') : path.join(OUT, p, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return file;
}

const routes = [
  ['', home], ['a-trilha', aTrilha], ['como-atuamos', comoAtuamos], ['integridade', integridade],
  ['solucoes', solucoes], ...SOLUTIONS.map((s) => ['solucoes/' + s.slug, (c) => solucao(c, s)]),
  ...AUDIENCES.map((a) => ['para-quem/' + a.slug, (c) => publico(c, a)]),
  ['projetos-territorios', projetos], ['projetos-territorios/caso-oriximina', casoPage],
  ['blog', blog], ...POSTS.map((p) => ['blog/' + p.slug, (c) => artigo(c, p)]),
  ['glossario', glossario], ...TERMS.map((t) => ['glossario/' + t[0], (c) => termoPage(c, t)]),
  ['contato', contato],
  ['privacidade', (c) => legal(c, 'privacidade', 'Política de privacidade', 'Como a Trilha trata dados pessoais coletados pelo site e pelos canais de contato.')],
  ['cookies', (c) => legal(c, 'cookies', 'Política de cookies', 'Quais cookies usamos, para que servem e como alterar suas preferências.')],
  ['acessibilidade', (c) => legal(c, 'acessibilidade', 'Acessibilidade', 'Compromissos e recursos de acessibilidade do site, e como relatar uma barreira.')],
];

// Assets estáticos
fs.mkdirSync(path.join(OUT, 'assets/css'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets/js'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets/img'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets/fonts'), { recursive: true });
fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(OUT, 'assets/css/styles.css'));
fs.copyFileSync(path.join(__dirname, 'main.js'), path.join(OUT, 'assets/js/main.js'));
for (const dir of ['img', 'fonts']) {
  const src = path.join(__dirname, 'assets', dir);
  for (const f of fs.readdirSync(src)) fs.copyFileSync(path.join(src, f), path.join(OUT, 'assets', dir, f));
}
[1, 2, 3].forEach((n) => {
  fs.writeFileSync(path.join(OUT, `assets/img/contornos-${n}-escuro.svg`), ILL.contourFile(n * 13, '#0e3b2c'));
  fs.writeFileSync(path.join(OUT, `assets/img/contornos-${n}-claro.svg`), ILL.contourFile(n * 13, '#bfe3a8'));
});

// Índice de busca
const idx = [];
const add = (t, title, d, url) => idx.push({ t, title, d, url: MODE === 'file' ? (url ? url + '/' : '') + 'index.html' : (url ? url + '/' : '') });
add('Página', 'A Trilha: nossa história', 'Uma consultoria que nasceu do território.', 'a-trilha');
add('Página', 'Como atuamos', 'Método em cinco etapas: escuta, diagnóstico, planejamento, implementação e monitoramento.', 'como-atuamos');
add('Página', 'Independência e integridade', 'Confiança começa pela clareza do papel de cada parte.', 'integridade');
add('Página', 'Soluções', 'Todas as soluções da Trilha.', 'solucoes');
SOLUTIONS.forEach((s) => add('Solução', s.name, s.card + ' ' + s.entregas.map((e) => e[0]).join(', '), 'solucoes/' + s.slug));
AUDIENCES.forEach((a) => add('Para quem', a.name, a.card, 'para-quem/' + a.slug));
add('Página', 'Projetos e territórios', 'Experiência formada em contextos amazônicos. Oriximiná, Porto Trombetas, Santarém.', 'projetos-territorios');
POSTS.forEach((p) => add('Artigo', p.title, p.summary, 'blog/' + p.slug));
TERMS.forEach((t) => add('Glossário', t[1], t[2] || 'Termo do glossário', 'glossario/' + t[0]));
add('Página', 'Contato', 'Conte o contexto. Formulário, WhatsApp e e-mail.', 'contato');
fs.writeFileSync(path.join(OUT, 'assets/js/search-index.js'), `window.TRILHA_SEARCH=${JSON.stringify(idx)};`);

let n = 0;
for (const [p, fn] of routes) { write(p, fn(makeCtx(p))); n++; }
write('404', notFound(makeCtx('', { absolute: MODE === 'pretty' })));
console.log(`OK: ${n + 1} páginas em ${path.relative(ROOT, OUT)}/ (modo ${MODE})`);
