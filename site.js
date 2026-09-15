(function () {
  const body = document.body;
  const buttons = Array.from(document.querySelectorAll('[data-set-lang]'));
  const yearNodes = document.querySelectorAll('.js-year');

  document.querySelectorAll('.footer-contacts').forEach((footerContacts) => {
    if (footerContacts.querySelector('a[href^="tel:"]')) return;

    const item = document.createElement('div');
    item.className = 'footer-contact-item';
    item.innerHTML = '<span class="footer-label"><span class="lang lang-en">Telephone / WhatsApp</span><span class="lang lang-es">Teléfono / WhatsApp</span></span><a href="tel:+5491126126091">+54 9 11 2612-6091</a>';
    footerContacts.appendChild(item);
  });

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

  let initialLang = body.dataset.fixedLang || 'en';

  if (!body.dataset.fixedLang) {
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
  }

  setLang(initialLang, false);
})();
