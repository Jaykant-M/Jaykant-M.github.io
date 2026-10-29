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

    // Text cross-fades along with the colours instead of snapping. Web Animations
    // sit on top of the page CSS, so the pages' own opacity transitions are untouched.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let fadeOuts = [], swapTimer;
    function fadeText(lang) {
      clearTimeout(swapTimer);
      fadeOuts.forEach(a => a.cancel());
      fadeOuts = i18nEls.map(el => el.animate([{ opacity: 0 }], { duration: 150, easing: 'ease-in', fill: 'forwards' }));
      swapTimer = setTimeout(() => {
        swapText(lang);
        fadeOuts.forEach(a => a.cancel());
        fadeOuts = [];
        i18nEls.forEach(el => el.animate([{ opacity: 0, offset: 0 }], { duration: 250, easing: 'ease-out' }));
      }, 150);
    }

    function setLanguage(lang) {
      current = lang;
      if (root.classList.contains('theme-ready') && !reduceMotion) fadeText(lang);
      else swapText(lang);
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
