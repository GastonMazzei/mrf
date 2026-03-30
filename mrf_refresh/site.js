(function () {
  const body = document.body;
  const buttons = Array.from(document.querySelectorAll('[data-set-lang]'));
  const yearNodes = document.querySelectorAll('.js-year');

  yearNodes.forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  function setLang(lang, persist = true) {
    body.dataset.lang = lang;
    document.documentElement.lang = lang;

    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.setLang === lang ? 'true' : 'false');
    });

    document.querySelectorAll('[data-alt-en]').forEach((img) => {
      img.alt = lang === 'es' ? img.dataset.altEs : img.dataset.altEn;
    });

    if (body.dataset.titleEn && body.dataset.titleEs) {
      document.title = lang === 'es' ? body.dataset.titleEs : body.dataset.titleEn;
    }

    if (persist) {
      try {
        localStorage.setItem('mrf_lang', lang);
      } catch (error) {
        /* ignore storage errors */
      }
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      setLang(button.dataset.setLang, true);
    });
  });

  let initialLang = 'en';

  try {
    const stored = localStorage.getItem('mrf_lang');
    if (stored === 'en' || stored === 'es') {
      initialLang = stored;
    } else if ((navigator.language || '').toLowerCase().startsWith('es')) {
      initialLang = 'es';
    }
  } catch (error) {
    if ((navigator.language || '').toLowerCase().startsWith('es')) {
      initialLang = 'es';
    }
  }

  setLang(initialLang, false);
})();
