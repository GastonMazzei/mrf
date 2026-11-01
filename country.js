(function () {
  'use strict';
  const app = window.MRF;
  const host = document.querySelector('.header-actions');
  if (!host || !app?.config) return;
  const countries = app.config.countries;
  const text = {
    es: {title:'Elegí tu país', language:'Idioma', country:'País', search:'Buscar país', another:'Elegir otro país', select:'Seleccionar país', checking:'Buscando tu país…', suggested:'País sugerido', confirm:'Confirmá tu país para entrar', manual:'Elegí el país para el que querés ver la oferta.', enter:'Entrar', apply:'Guardar cambios', close:'Cerrar', change:'Cambiar país e idioma', empty:'No encontramos ese país.'},
    en: {title:'Choose your country', language:'Language', country:'Country', search:'Search countries', another:'Choose another country', select:'Select a country', checking:'Finding your country…', suggested:'Suggested country', confirm:'Confirm your country to enter', manual:'Choose the country you are shopping for.', enter:'Enter', apply:'Save changes', close:'Close', change:'Change country and language', empty:'No matching countries.'},
    pt: {title:'Escolha seu país', language:'Idioma', country:'País', search:'Buscar país', another:'Escolher outro país', select:'Selecionar país', checking:'Buscando seu país…', suggested:'País sugerido', confirm:'Confirme seu país para entrar', manual:'Escolha o país para o qual deseja ver a oferta.', enter:'Entrar', apply:'Salvar alterações', close:'Fechar', change:'Alterar país e idioma', empty:'Nenhum país encontrado.'}
  };
  let saved;
  try { saved = JSON.parse(localStorage.getItem('mrf_country') || 'null'); } catch (_) {}
  let draftCountry = app.country || '';
  let draftLanguage = document.body.dataset.lang || 'en';
  let detectedCountry = app.country || '';
  let mode = 'entry';
  let state = 'manual';
  let touched = false;
  let lookup = null;
  const words = () => text[draftLanguage] || text.en;
  const countryName = (code, lang = draftLanguage) => {
    if (code === 'FK') return 'Islas Malvinas/Falkland Islands';
    try { return new Intl.DisplayNames([lang === 'pt' ? 'pt-BR' : lang], {type:'region'}).of(code); }
    catch (_) { return countries.find(c => c.code === code)?.name || code; }
  };
  const marketName = (code, lang = draftLanguage) => app.config.markets.find(m => m.id === app.marketOf(code))?.names[lang] || '';
  function flag(code, className = '') {
    if (code === 'FK') code = 'AR';
    const image = document.createElement('img');
    image.className = 'country-flag-image ' + className;
    image.src = new URL('assets/flags/' + code.toLowerCase() + '.svg', document.baseURI).href;
    image.alt = ''; image.width = 24; image.height = 18;
    return image;
  }
  const trigger = document.createElement('button');
  trigger.className = 'country-trigger'; trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  host.prepend(trigger);
  const dialog = document.createElement('dialog');
  dialog.className = 'country-modal';
  dialog.setAttribute('aria-labelledby', 'country-title');
  dialog.innerHTML = `<form novalidate>
    <button type="button" class="country-close"><span aria-hidden="true">×</span></button>
    <p class="country-brand">MARSUPIAL RF</p><h2 id="country-title"></h2>
    <p class="geo-status" role="status"></p>
    <div class="region-choices"></div>
    <div class="country-card"></div>
    <button type="button" class="country-picker" aria-expanded="false" aria-controls="country-options"></button>
    <div id="country-options" class="country-options" hidden>
      <label class="visually-hidden" for="country-search"></label>
      <input id="country-search" type="search" autocomplete="off" spellcheck="false">
      <ul class="country-list"></ul><p class="country-empty" hidden></p>
    </div>
    <fieldset class="country-language"><legend></legend>
      <button type="button" data-draft-lang="es" lang="es">ES <span>Español</span></button>
      <button type="button" data-draft-lang="en" lang="en">EN <span>English</span></button>
      <button type="button" data-draft-lang="pt" lang="pt-BR">BR <span>Português</span></button>
    </fieldset>
    <button type="submit" class="country-submit"></button>
  </form>`;
  document.body.appendChild(dialog);
  const picker = dialog.querySelector('.country-picker');
  const options = dialog.querySelector('.country-options');
  const search = dialog.querySelector('input');
  const list = dialog.querySelector('.country-list');
  const submit = dialog.querySelector('.country-submit');
  const close = dialog.querySelector('.country-close');
  const card = dialog.querySelector('.country-card');
  const status = dialog.querySelector('.geo-status');
  const regions = dialog.querySelector('.region-choices');
  const regionChoices = [
    {id:'latam',fallback:'AR',lang:'es',names:{es:'Latinoamérica',en:'Latin America',pt:'América Latina'},big:['AR'],small:['MX','BR','UY','CL','BO','VE','CO','EC','PE']},
    {id:'us-ca',fallback:'US',lang:'en',names:{es:'Estados Unidos y Canadá',en:'United States & Canada',pt:'Estados Unidos e Canadá'},big:['US','CA'],small:[]},
    {id:'europe',fallback:'CH',lang:'en',names:{es:'Europa',en:'Europe',pt:'Europa'},big:['EU'],small:['FR','DE','CZ','HR','ES','FI','NO','CH','RU']},
    {id:'africa',fallback:'',lang:'en',names:{es:'África',en:'Africa',pt:'África'},big:[],small:[]},
    {id:'asia',fallback:'',lang:'en',names:{es:'Asia',en:'Asia',pt:'Ásia'},big:[],small:[]}
  ];
  function commitRegion(region, language = region.lang) {
    touched = true; lookup?.abort();
    const code = detectedCountry && app.marketOf(detectedCountry) === region.id ? detectedCountry : region.fallback;
    saved = {version:3,code,market:region.id,confirmedAt:new Date().toISOString()};
    try { localStorage.setItem('mrf_country',JSON.stringify(saved)); } catch (_) {}
    app.chooseRegion(region.id,code,language); header(); dialog.close();
  }
  function renderRegions() {
    regions.replaceChildren();
    const rest=document.createElement('div');rest.className='region-rest';
    regionChoices.forEach(region => {
      const tile=document.createElement('div');tile.className='region-tile';tile.dataset.region=region.id;
      const button=document.createElement('button');button.type='button';button.className='region-enter';
      button.dataset.chooseRegion=region.id;
      const flags=document.createElement('div');flags.className='region-flags';
      const big=document.createElement('div');big.className='region-main-flags';
      region.big.forEach(code=>big.append(flag(code,'region-main-flag')));
      const small=document.createElement('div');small.className='region-small-flags';
      region.small.forEach(code=>small.append(flag(code)));
      flags.append(big,small);button.append(flags);
      const title=document.createElement('strong');title.textContent=region.id==='latam'?'LATAM':region.names[draftLanguage]||region.names.en;
      button.append(title);
      button.addEventListener('click',()=>commitRegion(region));tile.append(button);
      if(region.id==='latam'||region.id==='europe'){
        const languages=document.createElement('div');languages.className='region-language';
        languages.setAttribute('aria-label',words().language);
        (region.id==='latam'?['es','en','pt']:['en','es']).forEach(lang=>{
          const quick=document.createElement('button');quick.type='button';quick.lang=lang;quick.textContent=lang==='pt'?'BR':lang.toUpperCase();
          quick.dataset.regionLanguage=region.id+':'+lang;quick.addEventListener('click',()=>commitRegion(region,lang));languages.append(quick);
        });tile.append(languages);
      }
      if(region.id==='africa'||region.id==='asia')rest.append(tile);else regions.append(tile);
    });
    regions.append(rest);
  }
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function header() {
    const lang = document.body.dataset.lang;
    const labels = text[lang] || text.en;
    trigger.replaceChildren();
    if (app.country) trigger.append(flag(app.country));
    const name = document.createElement('span'); name.className = 'country-trigger-label';
    name.textContent = app.country ? countryName(app.country, lang) : labels.country;
    const caret = document.createElement('span'); caret.textContent = '▾'; caret.setAttribute('aria-hidden','true');
    trigger.append(name, caret);
    trigger.title = labels.change;
    trigger.setAttribute('aria-label', labels.change + (app.country ? ': ' + name.textContent : ''));
  }
  function renderList() {
    const term = normalize(search.value.trim());
    list.replaceChildren();
    const sorted = countries.map(c => ({...c, label: countryName(c.code)})).sort((a,b) => a.label.localeCompare(b.label, draftLanguage));
    const shown = sorted.filter(c => !term || normalize(c.label + ' ' + c.name + ' ' + c.code).includes(term));
    shown.forEach(c => {
      const li = document.createElement('li'); const button = document.createElement('button');
      button.type = 'button'; button.dataset.countryCode = c.code;
      button.setAttribute('aria-pressed', String(c.code === draftCountry));
      const image = flag(c.code); image.loading = 'lazy';
      const name = document.createElement('span'); name.textContent = c.label;
      button.append(image, name); li.append(button); list.append(li);
    });
    dialog.querySelector('.country-empty').hidden = !!shown.length;
  }
  function labels() {
    const w = words();
    dialog.dataset.mode = mode;
    dialog.querySelector('h2').textContent = mode === 'entry' ? ({es:'Elegí tu región',en:'Choose your region',pt:'Escolha sua região'}[draftLanguage] || 'Choose your region') : w.title;
    close.hidden = mode === 'entry'; close.setAttribute('aria-label', w.close);
    status.textContent = state === 'loading' ? w.checking : mode === 'entry' && detectedCountry ? w.suggested + ': ' + countryName(detectedCountry) : w.manual;
    status.dataset.busy = String(state === 'loading');
    card.replaceChildren();
    if (draftCountry) {
      card.append(flag(draftCountry, 'country-flag-large'));
      const copy = document.createElement('div');
      const name = document.createElement('strong'); name.textContent = countryName(draftCountry);
      const region = document.createElement('span'); region.textContent = marketName(draftCountry);
      copy.append(name, region); card.append(copy);
    }
    card.hidden = true;
    regions.hidden = mode !== 'entry';
    if (mode === 'entry') renderRegions();
    picker.replaceChildren();
    if (mode === 'change' && draftCountry) picker.append(flag(draftCountry));
    const label = document.createElement('span');
    label.textContent = mode === 'entry' ? (draftCountry ? w.another : w.select) : (draftCountry ? countryName(draftCountry) : w.select);
    const arrow = document.createElement('span'); arrow.textContent = '▾'; arrow.setAttribute('aria-hidden','true');
    picker.append(label, arrow);
    search.placeholder = w.search;
    dialog.querySelector('label[for=country-search]').textContent = w.search;
    dialog.querySelector('legend').textContent = w.language;
    dialog.querySelector('.country-empty').textContent = w.empty;
    dialog.querySelectorAll('[data-draft-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.draftLang === draftLanguage)));
    submit.textContent = mode === 'entry' ? w.enter + ' →' : w.apply;
    submit.disabled = !app.validCountry(draftCountry);
    if (!options.hidden) renderList();
  }
  function toggleOptions(open) {
    options.hidden = !open; picker.setAttribute('aria-expanded', String(open));
    if (open) { renderList(); search.focus(); }
    else picker.focus();
  }
  function show(kind) {
    mode = kind; touched = false;
    delete dialog.dataset.manualCountry;
    draftCountry = app.country || ''; draftLanguage = document.body.dataset.lang;
    state = draftCountry ? 'ready' : 'manual';
    search.value = ''; options.hidden = true; picker.setAttribute('aria-expanded','false');
    labels(); dialog.showModal();
    if (kind === 'change') picker.focus();
    else regions.querySelector('button')?.focus();
  }
  picker.addEventListener('click', () => { touched = true; lookup?.abort(); state = 'manual'; toggleOptions(options.hidden); });
  search.addEventListener('input', renderList);
  search.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); list.querySelector('button')?.focus(); }
    if (e.key === 'Enter') { e.preventDefault(); if (list.children.length === 1) list.querySelector('button').click(); }
  });
  list.addEventListener('click', e => {
    const button = e.target.closest('[data-country-code]');
    if (!button) return;
    touched = true; draftCountry = button.dataset.countryCode; state = 'manual';
    dialog.dataset.manualCountry = 'true';
    toggleOptions(false); labels();
  });
  list.addEventListener('keydown', e => {
    if (!['ArrowDown','ArrowUp','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const buttons = Array.from(list.querySelectorAll('button'));
    let i = buttons.indexOf(document.activeElement);
    i = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : i + (e.key === 'ArrowDown' ? 1 : -1);
    (i < 0 ? search : buttons[Math.min(i, buttons.length-1)])?.focus();
  });
  dialog.querySelectorAll('[data-draft-lang]').forEach(b => b.addEventListener('click', () => { draftLanguage = b.dataset.draftLang; labels(); }));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', e => {
    if (!options.hidden) { e.preventDefault(); toggleOptions(false); }
    else if (mode === 'entry') e.preventDefault();
  });
  dialog.addEventListener('click', e => {
    if (e.target !== dialog || mode !== 'change') return;
    const box = dialog.getBoundingClientRect();
    if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { lookup?.abort(); trigger.focus({preventScroll:true}); });
  dialog.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    if (!app.validCountry(draftCountry)) { toggleOptions(true); return; }
    lookup?.abort();
    saved = {version:3, code:draftCountry, market:app.marketOf(draftCountry), confirmedAt:new Date().toISOString()};
    try { localStorage.setItem('mrf_country', JSON.stringify(saved)); } catch (_) {}
    app.chooseCountry(draftCountry, draftLanguage); header(); dialog.close();
  });
  trigger.addEventListener('click', () => show('change'));
  window.addEventListener('mrf:language', header);
  window.addEventListener('mrf:country', header);
  header();
  const force = new URLSearchParams(location.search).get('choose-country') === '1';
  if (saved?.version === 3 && (app.validCountry(saved.code) || app.config.markets.some(m=>m.id===saved.market)) && !force) {
    if (app.country) app.chooseCountry(app.country, document.body.dataset.lang);
    return;
  }
  show('entry');
  if (draftCountry) return;
  state = 'loading'; labels();
  lookup = new AbortController();
  const timeout = setTimeout(() => lookup.abort(), 3500);
  fetch('https://ipapi.co/country/', {signal:lookup.signal, credentials:'omit', referrerPolicy:'no-referrer'})
    .then(r => { if (!r.ok) throw Error('location'); return r.text(); })
    .then(code => {
      code = code.trim().toUpperCase();
      if (!app.validCountry(code)) throw Error('country');
      if (!touched && dialog.open && mode === 'entry') { draftCountry = code; detectedCountry = code; state = 'detected'; }
    })
    .catch(() => { if (state === 'loading') state = 'manual'; })
    .finally(() => {
      clearTimeout(timeout); labels();
    });
})();
