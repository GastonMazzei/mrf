(function () {
  'use strict';
  const body = document.body;
  const config = window.MRF_REGIONS;
  const params = new URLSearchParams(location.search);
  const route = location.pathname.match(/^\/(es|en|br)\/([^/]+)\//);
  const file = location.pathname.split('/').pop() || 'index.html';
  const regionalPages = ['index.html', 'familias.html', 'portfolio.html', 'hat-usb3.html', 'open-source.html'];
  const regional = !!config && regionalPages.includes(file);
  const validCountry = code => !!config?.country_market[code];
  const marketOf = code => config?.country_market[code] || 'global';
  const validMarket = id => config?.markets.some(m => m.id === id);
  const palette = params.get('palette') === 'arena' ? 'arena' : 'clara';
  document.documentElement.dataset.palette = palette;
  let saved;
  try { saved = JSON.parse(localStorage.getItem('mrf_country') || 'null'); } catch (_) {}
  let country = validCountry(params.get('country')) ? params.get('country') : validCountry(saved?.code) ? saved.code : '';
  let market = route && validMarket(route[2]) ? route[2] : country ? marketOf(country) : validMarket(saved?.market) ? saved.market : 'global';
  if (country && marketOf(country) !== market) country = '';
  body.dataset.country = country;
  body.dataset.market = market;

  function localURL(url, lang = body.dataset.lang) {
    const page = url.pathname.split('/').pop() || 'index.html';
    if (page === 'products.html') url.searchParams.set('view', 'products');
    const target = page === 'products.html' ? 'familias.html' : page;
    url.pathname = '/' + (lang === 'pt' ? 'br' : lang) + '/' + market + '/' + (target === 'index.html' ? '' : target);
    url.searchParams.delete('lang');
    url.searchParams.delete('market');
    url.searchParams.delete('choose-country');
    if (country) url.searchParams.set('country', country);
    else url.searchParams.delete('country');
    if (palette === 'arena') url.searchParams.set('palette', palette);
    return url.pathname + url.search + url.hash;
  }
  function updateLinks() {
    if (!regional) return;
    document.querySelectorAll('a[href]').forEach(link => {
      const raw = link.dataset.originalHref || link.getAttribute('href');
      if (!raw) return;
      link.dataset.originalHref = raw;
      const url = new URL(raw, raw.startsWith('#') ? location.href : document.baseURI);
      if (url.origin !== location.origin || !['', 'products.html', ...regionalPages].includes(url.pathname.split('/').pop())) return;
      link.href = localURL(url);
    });
  }
  function writeURL() {
    if (regional) history.replaceState(null, '', localURL(new URL(location.href)));
    else {
      const url = new URL(location.href);
      url.searchParams.set('lang', body.dataset.lang);
      history.replaceState(null, '', url);
    }
  }
  function applyMarket() {
    const entry = config?.markets.find(m => m.id === market);
    if (!entry || !regional) return;
    body.dataset.market = market;
    body.dataset.country = country;
    document.querySelectorAll('[data-market-name]').forEach(el => { el.textContent = entry.names[body.dataset.lang] || entry.names.en; });
    document.querySelectorAll('[data-carousel]').forEach(el => {
      el.dataset.featuredIds = entry.featured[el.id].join(',');
    });
    window.dispatchEvent(new Event('mrf:market'));
  }
  function setLang(lang, persist = true) {
    if (!['es', 'en', 'pt'].includes(lang)) lang = 'en';
    if (!regional && lang === 'pt') lang = 'en';
    body.dataset.lang = lang;
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    document.querySelectorAll('[data-set-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
    document.querySelectorAll('[data-alt-en]').forEach(img => {
      img.alt = lang === 'pt' ? (img.dataset.altPt || img.dataset.altEn) : lang === 'es' ? img.dataset.altEs : img.dataset.altEn;
    });
    document.title = body.dataset[lang === 'pt' ? 'titlePt' : lang === 'es' ? 'titleEs' : 'titleEn'] || document.title;
    if (persist) {
      try { localStorage.setItem('mrf_lang', lang); } catch (_) {}
      writeURL();
    }
    applyMarket();
    updateLinks();
    window.dispatchEvent(new Event('mrf:language'));
  }
  window.MRF = {config, validCountry, marketOf, setLang, updateLinks,
    chooseCountry(code, lang) {
      if (!validCountry(code)) return;
      country = code; market = marketOf(code);
      body.dataset.country = code; body.dataset.market = market;
      setLang(lang, true);
      window.dispatchEvent(new Event('mrf:country'));
    },
    chooseRegion(region, code, lang) {
      if (!validMarket(region)) return;
      country = validCountry(code) && marketOf(code) === region ? code : '';
      market = region;
      body.dataset.country = country; body.dataset.market = market;
      setLang(lang, true);
      window.dispatchEvent(new Event('mrf:country'));
    },
    get country() { return country; },
    get market() { return market; }
  };
  if (regional) {
    const strip = document.createElement('div');
    strip.className = 'market-strip wrap';
    strip.innerHTML = '<span data-market-name></span>';
    document.querySelector('main')?.prepend(strip);
  }
  document.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.setLang)));
  document.querySelectorAll('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });
  let storedLang;
  try { storedLang = localStorage.getItem('mrf_lang'); } catch (_) {}
  const browserLang = (navigator.language || '').slice(0, 2);
  const requestedLang = params.get('lang');
  const routeLang = route && (route[1] === 'br' ? 'pt' : route[1]);
  const lang = body.dataset.fixedLang || (['es', 'en', 'pt'].includes(requestedLang) ? requestedLang : routeLang || storedLang || browserLang);
  setLang(lang, false);
})();
