/* Language switcher + flag colour themes, shared by every page.
 *
 * Load it synchronously in <head> so the theme is set before the first paint.
 * English is the HTML itself. Each page adds its German/French text as
 *   window.I18N_PAGE = { de: { key: html, ... }, fr: { ... } }
 * keyed by the page's data-i18n attributes. A missing key keeps the English.
 */
(function () {
  const LANGS = ['de', 'en', 'fr'];
  const NAMES = { de: 'Deutsch', en: 'English', fr: 'Français' };
  const root = document.documentElement;

  // Shared by every page's header
  const COMMON = {
    de: {
      'nav.about': 'Über mich',
      'nav.experience': 'Erfahrung',
      'nav.education': 'Ausbildung',
      'nav.skills': 'Kompetenzen',
      'nav.projects': 'Projekte'
    },
    fr: {
      'nav.about': 'À propos',
      'nav.experience': 'Expérience',
      'nav.education': 'Formation',
      'nav.skills': 'Compétences',
      'nav.projects': 'Projets'
    }
  };

  const FLAGS = {
    de: '<svg viewBox="0 0 5 3" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<rect width="5" height="1" y="0" fill="#000"/>' +
        '<rect width="5" height="1" y="1" fill="#DD0000"/>' +
        '<rect width="5" height="1" y="2" fill="#FFCE00"/></svg>',
    en: '<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<clipPath id="uk-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>' +
        '<path d="M0,0 v30 h60 v-30 z" fill="#012169"/>' +
        '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>' +
        '<path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-diag)" stroke="#C8102E" stroke-width="4"/>' +
        '<path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>' +
        '<path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg>',
    fr: '<svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<rect width="1" height="2" x="0" fill="#0055A4"/>' +
        '<rect width="1" height="2" x="1" fill="#fff"/>' +
        '<rect width="1" height="2" x="2" fill="#EF4135"/></svg>'
  };

  // Saved choice wins; otherwise follow the browser language
  function initialLang() {
    let saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) {}
    if (LANGS.includes(saved)) return saved;
    const browser = (navigator.language || '').slice(0, 2).toLowerCase();
    return LANGS.includes(browser) ? browser : 'en';
  }

  let current = initialLang();
  root.lang = current;
  root.dataset.theme = current;

  // A [data-sweep] photo stays hidden (with the stripe and rings) until it has loaded;
  // init() then fades it in and starts the intro, so nothing animates over a
  // half-loaded image. Skipped for reduced motion, where nothing animates anyway.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('photo-wait');

  // The site translates itself; stop browser auto-translate (Chrome, Edge) from
  // re-translating it on top, which garbles names (e.g. "Tableau" → "Painting")
  root.setAttribute('translate', 'no');
  const noTranslate = document.createElement('meta');
  noTranslate.name = 'google';
  noTranslate.content = 'notranslate';
  document.head.appendChild(noTranslate);

  // Icons at the start/end of a translated element (e.g. "<i …></i> Back")
  // are kept automatically, so translations only need the text.
  function edgeIcons(el) {
    const nodes = [...el.childNodes].filter(n => !(n.nodeType === 3 && !n.textContent.trim()));
    const isIcon = n => n && n.nodeType === 1 && n.tagName === 'I' && !n.textContent.trim();
    const lead = [], trail = [];
    for (const n of nodes) { if (isIcon(n)) lead.push(n.outerHTML); else break; }
    for (const n of nodes.slice(lead.length).reverse()) { if (isIcon(n)) trail.unshift(n.outerHTML); else break; }
    return { lead: lead.join(''), trail: trail.join('') };
  }

  function init() {
    const page = window.I18N_PAGE || {};
    const dicts = {
      de: Object.assign({}, COMMON.de, page.de),
      fr: Object.assign({}, COMMON.fr, page.fr)
    };

    const i18nEls = [...document.querySelectorAll('[data-i18n]')];
    const english = new Map();
    const icons = new Map();
    i18nEls.forEach(el => { english.set(el, el.innerHTML); icons.set(el, edgeIcons(el)); });

    // Build the switcher and put it to the right of the nav links
    const nav = document.querySelector('nav');
    const links = nav && nav.querySelector('.nav-links');
    let navRight = nav && nav.querySelector('.nav-right');
    if (nav && !navRight) {
      navRight = document.createElement('div');
      navRight.className = 'nav-right';
      if (links) {
        links.replaceWith(navRight);
        navRight.appendChild(links);
      } else {
        nav.appendChild(navRight);
      }
    }
    const langSwitch = document.createElement('div');
    langSwitch.className = 'lang-switch';
    langSwitch.setAttribute('role', 'group');
    langSwitch.setAttribute('aria-label', 'Language');
    const langStack = document.createElement('div');
    langStack.className = 'lang-stack';
    const langBtns = LANGS.map(lang => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-btn';
      btn.dataset.lang = lang;
      btn.title = NAMES[lang];
      btn.setAttribute('aria-label', NAMES[lang]);
      btn.innerHTML = FLAGS[lang];
      return btn;
    });
    langSwitch.appendChild(langStack);
    if (navRight) navRight.appendChild(langSwitch);

    function swapText(lang) {
      const dict = dicts[lang] || {};
      i18nEls.forEach(el => {
        const t = dict[el.dataset.i18n];
        if (!t) { el.innerHTML = english.get(el); return; }
        const { lead, trail } = icons.get(el);
        el.innerHTML = t.includes('<i ')
          ? t
          : (lead ? lead + ' ' : '') + t + (trail ? ' ' + trail : '');
      });
    }

    // One timeline for every switch effect (text, stripe, rings; the theme colours'
    // 0.95s CSS transition matches OUT_MS + IN_MS), so they all move together
    const OUT_MS = 400;      // switch: text fades out, stripe collapses, rings un-draw
    const IN_MS = 550;       // switch and page load: text fades in, stripe grows, rings draw
    const HOLD_MS = 240;     // page load: hidden briefly while the page settles

    // Text fades out, swaps language while invisible, and fades back in. There is one
    // animation, of --i18n-fade on <html>; every translated element (and each
    // [data-i18n-fade] group, e.g. the social links row) reads that same value in CSS,
    // so they can't drift apart the way separate per-element animations could.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let fadeAnim, swapTimer, doneTimer;
    function fadeText(lang) {
      clearTimeout(swapTimer);
      clearTimeout(doneTimer);
      if (fadeAnim) fadeAnim.cancel();
      root.classList.add('i18n-fading');
      fadeAnim = root.animate([
        { '--i18n-fade': 1, easing: 'ease-in' },
        { '--i18n-fade': 0, offset: OUT_MS / (OUT_MS + IN_MS), easing: 'ease-out' },
        { '--i18n-fade': 1 }
      ], { duration: OUT_MS + IN_MS });
      swapTimer = setTimeout(() => swapText(lang), OUT_MS);   // swap while invisible
      const done = () => {
        clearTimeout(doneTimer);
        root.classList.remove('i18n-fading');
      };
      fadeAnim.onfinish = done;
      // Backstop: if frames stall (e.g. a background tab), never leave text invisible
      doneTimer = setTimeout(() => { fadeAnim.finish(); done(); }, OUT_MS + IN_MS + 100);
    }

    // Elements marked [data-sweep] animate a --sweep angle (0deg–360deg) that their
    // CSS uses to draw a ring clockwise from the top, e.g. the homepage photo ring
    const sweepEls = [...document.querySelectorAll('[data-sweep]')];
    const sweepAnims = new Map();
    function sweep(keyframes, duration) {
      sweepEls.forEach(el => {
        if (sweepAnims.has(el)) sweepAnims.get(el).cancel();
        const a = el.animate(keyframes, { duration });
        sweepAnims.set(el, a);
        setTimeout(() => a.finish(), duration + 100);   // backstop if frames stall
      });
    }

    // Header flag stripe: collapses into the centre, takes the new flag's
    // colours while hidden, then grows back out to both sides
    const FLAG_VARS = ['--flag-1', '--flag-2', '--flag-3'];
    let stripeAnim, stripeTimer, stripeDoneTimer;
    function swapStripe() {
      if (!nav || !nav.animate) return;
      clearTimeout(stripeTimer);
      clearTimeout(stripeDoneTimer);
      if (stripeAnim) stripeAnim.cancel();
      // Hold the old colours on the nav until the stripe is fully collapsed
      // (already held if a previous switch is still collapsing)
      if (!nav.style.getPropertyValue('--flag-1')) {
        const rootStyle = getComputedStyle(root);
        FLAG_VARS.forEach(v => nav.style.setProperty(v, rootStyle.getPropertyValue(v)));
      }
      stripeAnim = nav.animate([{ transform: 'scaleX(0)' }],
        { duration: OUT_MS, easing: 'ease-in', fill: 'forwards', pseudoElement: '::after' });
      stripeTimer = setTimeout(() => {
        FLAG_VARS.forEach(v => nav.style.removeProperty(v));
        stripeAnim.cancel();
        stripeAnim = nav.animate([{ transform: 'scaleX(0)', offset: 0 }],
          { duration: IN_MS, easing: 'ease-out', pseudoElement: '::after' });
        // Backstop: if frames stall, don't leave the stripe collapsed
        stripeDoneTimer = setTimeout(() => stripeAnim.finish(), IN_MS + 100);
      }, OUT_MS);
    }

    let switchingTimer;
    function setLanguage(lang) {
      current = lang;
      if (root.classList.contains('theme-ready') && !reduceMotion) {
        root.classList.add('theme-switching');
        clearTimeout(switchingTimer);
        switchingTimer = setTimeout(() => root.classList.remove('theme-switching'), OUT_MS + IN_MS);
        fadeText(lang);
        swapStripe();   // before the theme changes, so it can hold the old colours
        sweep([
          { '--sweep': '360deg', easing: 'ease-in' },
          { '--sweep': '0deg', offset: OUT_MS / (OUT_MS + IN_MS), easing: 'ease-out' },
          { '--sweep': '360deg' }
        ], OUT_MS + IN_MS);
      } else {
        swapText(lang);
      }
      root.lang = lang;
      root.dataset.theme = lang;

      // Selected bubble goes first and on top; the others keep their order behind it
      const ordered = [
        ...langBtns.filter(btn => btn.dataset.lang === lang),
        ...langBtns.filter(btn => btn.dataset.lang !== lang)
      ];
      ordered.forEach((btn, i) => {
        const active = i === 0;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active);
        btn.style.zIndex = ordered.length - i;
        btn.style.setProperty('--i', i);
        langStack.appendChild(btn);
      });
      try { localStorage.setItem('lang', lang); } catch (e) {}
    }

    // Touch screens have no hover: first tap opens the stack, second tap picks
    const canHover = window.matchMedia('(hover: hover)').matches;
    document.addEventListener('click', e => {
      if (!langSwitch.contains(e.target)) langSwitch.classList.remove('open');
    });

    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!canHover && !langSwitch.classList.contains('open')) {
          langSwitch.classList.add('open');
          return;
        }
        langSwitch.classList.remove('open');
        if (btn.dataset.lang === current) return;
        setLanguage(btn.dataset.lang);
        (window.dataLayer = window.dataLayer || []).push({
          event: 'language_switch',
          event_category: 'engagement',
          event_label: btn.dataset.lang,
          language: btn.dataset.lang,
          timestamp: new Date().toISOString()
        });
      });
    });

    setLanguage(current);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('theme-ready')));

    // On every page load: a [data-sweep] photo fades in once it has loaded, then the
    // stripe grows out from the centre and the rings draw in, like the second half of
    // a language switch. Pages without such a photo start straight away.
    const photos = sweepEls.flatMap(el => [...el.querySelectorAll('img')]);
    const PHOTO_FADE_MS = 300;
    function whenPhotosReady(cb) {
      const pending = photos.filter(img => !img.complete);
      if (!pending.length) return cb();
      let left = pending.length, fired = false;
      const go = () => { if (!fired) { fired = true; cb(); } };
      pending.forEach(img => {
        const one = () => { if (--left === 0) go(); };
        img.addEventListener('load', one, { once: true });
        img.addEventListener('error', one, { once: true });
      });
      setTimeout(go, 4000);   // don't hold the page back forever on a slow connection
    }

    if (nav && nav.animate && !reduceMotion) {
      const holdAt = HOLD_MS / (HOLD_MS + IN_MS);
      // Created paused at their start, so the stripe and rings stay hidden while waiting
      const intro = nav.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(0)', offset: holdAt, easing: 'ease-out' }, {}],
        { duration: HOLD_MS + IN_MS, pseudoElement: '::after' });
      stripeAnim = intro;   // so a language switch during the wait cancels it
      const rings = sweepEls.map(el => {
        const a = el.animate([
          { '--sweep': '0deg' },
          { '--sweep': '0deg', offset: holdAt, easing: 'ease-out' },
          { '--sweep': '360deg' }
        ], { duration: HOLD_MS + IN_MS });
        sweepAnims.set(el, a);
        return a;
      });
      const introAnims = [intro, ...rings];
      introAnims.forEach(a => a.pause());
      whenPhotosReady(() => {
        root.classList.remove('photo-wait');
        photos.forEach(img => {
          const a = img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: PHOTO_FADE_MS, easing: 'ease-out' });
          setTimeout(() => a.finish(), PHOTO_FADE_MS + 100);   // backstop if frames stall
        });
        setTimeout(() => introAnims.forEach(a => {
          if (a.playState !== 'paused') return;   // cancelled by a language switch meanwhile
          a.play();
          setTimeout(() => a.finish(), HOLD_MS + IN_MS + 100);   // backstop if frames stall
        }), photos.length ? PHOTO_FADE_MS : 0);
      });
    } else {
      root.classList.remove('photo-wait');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
