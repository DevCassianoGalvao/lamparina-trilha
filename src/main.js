/* Trilha Socioambiental — interações do front-end (sem dependências) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const root = document.documentElement;
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* armazenamento indisponível */ } },
  };

  /* ---------- Cabeçalho: estado de rolagem + progresso da rota ---------- */
  const header = $('.site-header');
  const progress = $('.route-progress i');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    body.classList.toggle('is-scrolled', y > 24);
    body.classList.toggle('show-mobile-cta', y > window.innerHeight * 0.7);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    methodProgress();
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  /* ---------- Menus suspensos (disclosure) ---------- */
  const menus = $$('.has-menu');
  const closeAll = (except) => menus.forEach((m) => { if (m !== except) { m.classList.remove('is-open'); $('.nav-trigger', m).setAttribute('aria-expanded', 'false'); } });
  menus.forEach((m) => {
    const t = $('.nav-trigger', m);
    let timer;
    const open = () => { closeAll(m); m.classList.add('is-open'); t.setAttribute('aria-expanded', 'true'); };
    const close = () => { m.classList.remove('is-open'); t.setAttribute('aria-expanded', 'false'); };
    t.addEventListener('click', () => (m.classList.contains('is-open') ? close() : open()));
    if (finePointer) {
      m.addEventListener('mouseenter', () => { clearTimeout(timer); open(); });
      m.addEventListener('mouseleave', () => { timer = setTimeout(close, 180); });
    }
    m.addEventListener('focusout', (e) => { if (!m.contains(e.relatedTarget)) close(); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-menu')) closeAll(); });

  /* ---------- Menu mobile ---------- */
  const toggle = $('.menu-toggle');
  const panel = $('#menu-mobile');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) setTimeout(() => $('a, summary', panel)?.focus(), 250);
  };
  toggle?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  panel?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAll();
      if (body.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
      closeSearch();
    }
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
    if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openSearch(); }
  });

  /* ---------- Animações de entrada ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add('is-in'));

  /* ---------- Luz que segue o ponteiro, inclinação e botões magnéticos ---------- */
  if (finePointer && !reduce) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.spot');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    }, { passive: true });

    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Método: progresso da linha conforme a rolagem ---------- */
  const methods = $$('[data-method]');
  function methodProgress() {
    methods.forEach((m) => {
      const r = m.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height * 0.9)));
      m.style.setProperty('--mp', reduce ? 1 : p.toFixed(3));
      $$('.step', m).forEach((s, i, all) => s.classList.toggle('is-active', p >= (i + 0.5) / all.length));
    });
  }

  /* ---------- Busca ---------- */
  const overlay = $('[data-search]');
  const q = $('#q');
  const results = $('[data-search-results]');
  const index = window.TRILHA_SEARCH || [];
  const rootPath = body.dataset.root || '';
  let lastFocus = null;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function renderResults(term) {
    if (!results) return;
    const t = norm(term.trim());
    if (!t) { results.innerHTML = index.slice(0, 6).map(item).join(''); return; }
    const found = index.filter((i) => norm(`${i.title} ${i.d} ${i.t}`).includes(t));
    results.innerHTML = found.length ? found.map(item).join('')
      : `<li class="search-empty">Não encontramos esse termo. Tente uma palavra diferente ou <a href="${rootPath}${body.dataset.mode === 'file' ? 'contato/index.html' : 'contato/'}">fale com a equipe</a>.</li>`;
  }
  const item = (i) => `<li><a href="${rootPath}${i.url}"><span class="type">${i.t}</span><strong>${i.title}</strong><small>${i.d}</small></a></li>`;
  function openSearch() {
    if (!overlay) return;
    lastFocus = document.activeElement;
    overlay.classList.add('is-open');
    renderResults(q.value);
    setTimeout(() => q.focus(), 60);
  }
  function closeSearch() {
    if (!overlay?.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    lastFocus?.focus?.();
  }
  $$('[data-search-open]').forEach((b) => b.addEventListener('click', openSearch));
  $('[data-search-close]')?.addEventListener('click', closeSearch);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
  q?.addEventListener('input', () => renderResults(q.value));
  overlay?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('input, a, button', overlay).filter((x) => x.offsetParent !== null);
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------- Cookies ---------- */
  const cookie = $('[data-cookie]');
  const KEY = 'trilha-cookies';
  const showCookie = () => cookie?.classList.add('is-visible');
  const saveCookie = (analytics) => { store.set(KEY, JSON.stringify({ analytics, at: Date.now() })); cookie.classList.remove('is-visible', 'is-config'); };
  if (cookie && !store.get(KEY)) setTimeout(showCookie, 1200);
  $('[data-cookie-accept]')?.addEventListener('click', () => saveCookie(true));
  $('[data-cookie-reject]')?.addEventListener('click', () => {
    if (cookie.classList.contains('is-config')) saveCookie(!!$('[data-cookie-analytics]').checked);
    else saveCookie(false);
  });
  $('[data-cookie-config]')?.addEventListener('click', (e) => {
    cookie.classList.add('is-config');
    $('span', e.currentTarget).textContent = 'Salvar preferências';
    e.currentTarget.onclick = () => saveCookie(!!$('[data-cookie-analytics]').checked);
  });
  $$('[data-cookie-open]').forEach((b) => b.addEventListener('click', () => { cookie.classList.add('is-visible', 'is-config'); }));

  /* ---------- Newsletter (integração no back-end) ---------- */
  $$('[data-newsletter]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('input', f), msg = f.parentElement.querySelector('.msg');
    if (!input.checkValidity()) { msg.textContent = 'Informe um e-mail válido, como nome@exemplo.com.'; input.focus(); return; }
    // TODO back-end: enviar para a ferramenta de newsletter escolhida.
    msg.textContent = 'Inscrição registrada. Você receberá a próxima seleção mensal.';
    f.reset();
  }));

  /* ---------- Filtros (blog e casos) ---------- */
  $$('.filters').forEach((group) => {
    const list = group.nextElementSibling?.matches('[data-filter-list]') ? group.nextElementSibling : $('[data-filter-list]');
    const empty = $('[data-filter-empty]');
    $$('.filter', group).forEach((b) => b.addEventListener('click', () => {
      $$('.filter', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const f = b.dataset.filter;
      let shown = 0;
      $$('[data-tags]', list).forEach((it) => {
        const ok = f === '*' || it.dataset.tags.split(' ').includes(f);
        it.classList.toggle('is-hidden', !ok);
        if (ok) { shown++; it.classList.add('is-in'); }
      });
      empty?.classList.toggle('is-hidden', shown > 0);
    }));
  });

  /* ---------- Glossário ---------- */
  const gq = $('[data-gloss-filter]');
  gq?.addEventListener('input', () => {
    const t = norm(gq.value.trim());
    let shown = 0;
    $$('[data-gloss-list] .term').forEach((li) => { const ok = !t || norm(li.dataset.term).includes(t); li.classList.toggle('is-hidden', !ok); if (ok) shown++; });
    $('[data-gloss-empty]').classList.toggle('is-hidden', shown > 0);
  });

  /* ---------- Sumário do artigo ---------- */
  const tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { tocLinks.forEach((a) => a.classList.remove('is-active')); map.get(en.target.id)?.classList.add('is-active'); }
    }), { rootMargin: '-30% 0px -60% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- Formulário de contato adaptativo ---------- */
  const form = $('[data-contact]');
  if (form) {
    const steps = $$('.fstep', form);
    const prog = $$('[data-progress]');
    const prev = $('[data-prev]', form), next = $('[data-next]', form), submit = $('[data-submit]', form);
    const success = $('[data-success]');
    let cur = 0;

    const ADAPT = {
      comunidade: { org: 'Nome da comunidade ou associação', topics: ['assessoria', 'cpli', 'pgtaq', 'ecq'], hint: 'Temas comuns para comunidades aparecem primeiro.' },
      empresa: { org: 'Empresa ou empreendimento', topics: ['consultoria', 'esg', 'ecq', 'projetos'], hint: 'Temas comuns para empresas e empreendimentos aparecem primeiro.' },
      organizacao: { org: 'Organização ou instituição', topics: ['projetos', 'articulacao', 'consultoria', 'esg'], hint: 'Temas comuns para organizações aparecem primeiro.' },
      orgao: { org: 'Órgão público', topics: ['articulacao', 'pgtaq', 'cpli', 'projetos'], hint: 'Temas comuns para órgãos públicos aparecem primeiro.' },
      parceiro: { org: 'Organização ou empresa parceira', topics: ['parceria'], hint: 'Conte que tipo de parceria você quer propor.' },
      outro: { org: 'Organização ou comunidade', topics: [], hint: 'Escolha um tema. Se tiver dúvida, selecione "Outro".' },
    };
    const TOPIC_BY_NAME = { 'Assessoria técnica': 'assessoria', Consultoria: 'consultoria', 'Projetos sociais': 'projetos', ESG: 'esg', 'ECQ/PBAQ': 'ecq', CPLI: 'cpli', PGTAQ: 'pgtaq', Articulação: 'articulacao', Parceria: 'parceria' };

    const adapt = (perfil) => {
      const a = ADAPT[perfil] || ADAPT.outro;
      $('[data-org-label]').textContent = a.org;
      $('[data-topic-hint]').textContent = a.hint;
      const wrap = $('[data-topics]');
      const all = $$('[data-topic]', wrap);
      all.forEach((el) => { const s = a.topics.includes(el.dataset.topic); el.classList.toggle('is-suggested', s); $('.sug', el).hidden = !s; });
      [...a.topics].reverse().forEach((t) => { const el = all.find((x) => x.dataset.topic === t); if (el) wrap.prepend(el); });
      $('#f-canal').value = perfil === 'comunidade' ? 'Conversa reservada' : 'WhatsApp';
    };

    const setErr = (input, id, text) => {
      const e = document.getElementById(id);
      if (e) e.textContent = text || '';
      if (input) input.setAttribute('aria-invalid', text ? 'true' : 'false');
      return !text;
    };
    const validateStep = (i) => {
      let ok = true, firstBad = null;
      const mark = (input, id, msg) => { const good = setErr(input, id, msg); if (!good && !firstBad) firstBad = input; ok = ok && good; };
      if (i === 0) mark(null, 'err-perfil', form.perfil.value ? '' : 'Escolha o perfil que melhor representa você.');
      if (i === 1) {
        const n = $('#f-nome'), o = $('#f-org'), em = $('#f-email'), w = $('#f-whats'), ci = $('#f-cidade');
        mark(n, 'err-nome', n.value.trim().length < 2 ? 'Informe seu nome.' : '');
        mark(o, 'err-org', o.value.trim() ? '' : `Preencha o campo "${$('[data-org-label]').textContent}".`);
        mark(em, 'err-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()) ? '' : 'Informe um e-mail válido, como nome@exemplo.com.');
        mark(w, 'err-whats', w.value.replace(/\D/g, '').length >= 10 ? '' : 'Informe o WhatsApp com DDD.');
        mark(ci, 'err-cidade', ci.value.trim() ? '' : 'Informe cidade e estado.');
      }
      if (i === 2) mark(null, 'err-tema', form.tema.value ? '' : 'Escolha o tema mais próximo da sua demanda.');
      if (i === 3) { const t = $('#f-ctx'); mark(t, 'err-ctx', t.value.trim().length < 20 ? 'Conte o contexto em pelo menos uma ou duas frases.' : ''); }
      if (!ok) (firstBad || $(`.fstep[data-step="${i}"] input`, form))?.focus();
      return ok;
    };
    const go = (i) => {
      steps[cur].classList.remove('is-active');
      cur = i;
      steps[cur].classList.add('is-active');
      prog.forEach((p, k) => { p.classList.toggle('is-done', k < cur); p.classList.toggle('is-current', k === cur); });
      prev.hidden = cur === 0;
      next.hidden = cur === steps.length - 1;
      submit.hidden = cur !== steps.length - 1;
      $('legend', steps[cur]).setAttribute('tabindex', '-1');
      $('legend', steps[cur]).focus({ preventScroll: true });
      form.closest('.form-card').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    };
    next.addEventListener('click', () => { if (validateStep(cur)) go(cur + 1); });
    prev.addEventListener('click', () => go(cur - 1));
    form.addEventListener('change', (e) => {
      if (e.target.name === 'perfil') { adapt(e.target.value); setErr(null, 'err-perfil', ''); }
      if (e.target.name === 'tema') setErr(null, 'err-tema', '');
    });
    form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); next.hidden ? submit.click() : next.click(); } });
    const ctx = $('#f-ctx'), cnt = $('#ctx-count');
    ctx.addEventListener('input', () => { cnt.textContent = `${ctx.value.length} de 1200 caracteres`; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateStep(3)) return;
      // TODO back-end: enviar FormData(form) para o endpoint de contato (e-mail/CRM/WhatsApp).
      form.hidden = true;
      $('.progress').hidden = true;
      success.classList.add('is-active');
      success.focus();
    });

    // Pré-seleção vinda das páginas (?perfil=comunidade&tema=CPLI)
    const params = new URLSearchParams(location.search);
    const perfil = params.get('perfil');
    if (perfil && form.querySelector(`#pf-${perfil}`)) { form.querySelector(`#pf-${perfil}`).checked = true; adapt(perfil); }
    const tema = params.get('tema');
    const tKey = tema && TOPIC_BY_NAME[tema];
    if (tKey) { const r = form.querySelector(`#tp-${tKey}`); if (r) r.checked = true; }
  }

  /* ---------- Diversos ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  onScroll();
})();
