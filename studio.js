(function () {
  'use strict';
  document.documentElement.classList.add('js-enabled');

  document.querySelectorAll('[data-carousel]').forEach(function (region) {
    const allSlides = Array.from(region.querySelectorAll('.family-slide'));
    let slides = allSlides.filter(function (slide) { return !slide.hasAttribute('data-default-hidden'); });
    const controls = region.querySelector('.family-controls');
    const status = region.querySelector('[data-carousel-status]');
    let selected = 0;
    let hovered = false;
    let focused = false;
    let inView = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dots = region.querySelector('.carousel-dots');
    if (!slides.length || !controls || !status) return;
    function show(index, animate = true) {
      selected = (index + slides.length) % slides.length;
      allSlides.forEach(function (slide) { slide.hidden = slide !== slides[selected]; });
      const slide = slides[selected];
      const lang = document.body.dataset.lang;
      const name = lang === 'pt' ? slide.dataset.namePt : lang === 'es' ? slide.dataset.nameEs : slide.dataset.nameEn;
      status.textContent = (selected + 1) + ' / ' + slides.length + ' · ' + name;
      if (dots) dots.querySelectorAll('button').forEach((dot, i) => dot.setAttribute('aria-current', String(i === selected)));
      if (animate && !reducedMotion.matches) slide.animate([{opacity: .2, transform: 'scale(1.015)'}, {opacity: 1, transform: 'scale(1)'}], {duration: 500, easing: 'ease-out'});
    }
    function changeMarket() {
      const ids = (region.dataset.featuredIds || '').split(',').filter(Boolean);
      if (ids.length) {
        const ordered = ids.map(function (id) { return allSlides.find(function (slide) { return slide.dataset.family === id; }); }).filter(Boolean);
        if (ordered.length) slides = ordered;
      }
      if (dots) {
        dots.replaceChildren();
        slides.forEach((slide, i) => {
          const dot = document.createElement('button'); dot.type = 'button'; dot.className = 'carousel-dot';
          dot.setAttribute('aria-label', (i + 1) + ' · ' + (document.body.dataset.lang === 'pt' ? slide.dataset.namePt : document.body.dataset.lang === 'es' ? slide.dataset.nameEs : slide.dataset.nameEn));
          dot.addEventListener('click', () => show(i)); dots.appendChild(dot);
        });
      }
      show(0, false);
    }
    region.querySelector('[data-carousel-prev]').addEventListener('click', function () { show(selected - 1); });
    region.querySelector('[data-carousel-next]').addEventListener('click', function () { show(selected + 1); });
    controls.hidden = false;
    changeMarket();
    window.addEventListener('mrf:market', changeMarket);
    new MutationObserver(function () { show(selected, false); }).observe(document.body, {attributes: true, attributeFilter: ['data-lang']});
    region.addEventListener('pointerenter', () => { hovered = true; });
    region.addEventListener('pointerleave', () => { hovered = false; });
    region.addEventListener('focusin', () => { focused = true; });
    region.addEventListener('focusout', e => { focused = region.contains(e.relatedTarget); });
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }, {threshold: .25}).observe(region);
    setInterval(() => {
      if (!hovered && !focused && inView && !document.hidden && !reducedMotion.matches && !document.querySelector('dialog[open]')) show(selected + 1);
    }, region.id === 'products' ? 6500 : 7900);
    let touchStart = null;
    region.addEventListener('touchstart', e => { touchStart = {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}; }, {passive:true});
    region.addEventListener('touchend', e => { if (!touchStart) return; const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y; if (Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.5) show(selected+(dx<0?1:-1)); touchStart=null; }, {passive:true});
  });

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.new-nav');
  if (menuButton && navigation) {
    function closeMenu(returnFocus) {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      if (returnFocus) menuButton.focus();
    }
    menuButton.addEventListener('click', function () {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      navigation.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
    });
    navigation.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    window.matchMedia('(min-width: 851px)').addEventListener('change', function (event) {
      if (event.matches) closeMenu(false);
    });
  }

  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    // Filters are progressive enhancement; all projects remain available without JS.
    filterBar.hidden = false;
    const cards = Array.from(document.querySelectorAll('.work-card[data-category]'));
    const buttons = Array.from(filterBar.querySelectorAll('[data-filter]'));
    const status = document.getElementById('project-status');
    function updateCount() {
      if (!status) return;
      const count = cards.filter(function (card) { return !card.hidden; }).length;
      status.textContent = document.body.dataset.lang === 'es'
        ? count + ' proyectos visibles' : document.body.dataset.lang === 'pt'
          ? count + ' projetos visíveis' : count + ' projects shown';
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const filter = button.dataset.filter;
        cards.forEach(function (card) {
          card.hidden = filter !== 'all' && card.dataset.category !== filter;
        });
        buttons.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        updateCount();
      });
    });
    new MutationObserver(updateCount).observe(document.body, {attributes: true, attributeFilter: ['data-lang']});
  }
})();

(function () {
  const title = document.querySelector('[data-catalog-title]');
  if (!title) return;
  const params = new URLSearchParams(location.search);
  const requested = params.get('view');
  const view = ['products', 'services'].includes(requested) ? requested : (['pcb','firmware','med','local-ai'].includes(location.hash.slice(1).split('-option-')[0]) ? 'services' : 'products');
  if (requested !== view) {const url=new URL(location.href);url.searchParams.set('view',view);history.replaceState(null,'',url);}
  if(view==='products' && location.hash==='#rad'){const url=new URL(location.href);url.hash='sys';history.replaceState(null,'',url);}
  document.body.dataset.titleEs='Marsupial RF — '+(view==='products'?'Productos':'Servicios');
  document.body.dataset.titleEn='Marsupial RF — '+(view==='products'?'Products':'Services');
  document.body.dataset.titlePt='Marsupial RF — '+(view==='products'?'Produtos':'Serviços');
  document.title=document.body.dataset[document.body.dataset.lang==='es'?'titleEs':document.body.dataset.lang==='pt'?'titlePt':'titleEn'];
  title.querySelector('.lang-es').textContent = view === 'products' ? 'Productos' : 'Servicios';
  title.querySelector('.lang-en').textContent = view === 'products' ? 'Products' : 'Services';
  if (title.querySelector('.lang-pt')) title.querySelector('.lang-pt').textContent = view === 'products' ? 'Produtos' : 'Serviços';
  document.querySelectorAll('[data-catalog-variant]').forEach(el => { el.hidden = el.dataset.catalogVariant !== view; });
  document.querySelectorAll('.family-detail').forEach(section => {
    const visible = section.dataset.sections.split(' ').includes(view);
    section.hidden = !visible;
    section.dataset.view = view;
    const navGroup = document.querySelector('[data-nav-family="' + section.id + '"]');
    if (navGroup) navGroup.hidden = !visible;
    const link = Array.from(document.querySelectorAll('.case-nav a')).find(a => new URL(a.href).hash === '#' + section.id);
    if (link) link.hidden = !visible;
    const serviceName = section.querySelector('h2 [data-catalog-variant="services"]');
    if (link && serviceName && view === 'services') link.replaceChildren(...Array.from(serviceName.childNodes, node => node.cloneNode(true)));
  });
  document.querySelectorAll('.new-nav a').forEach(a => {
    if (new URL(a.href).searchParams.get('view') === view) a.setAttribute('aria-current', 'page');
  });
  window.MRF?.updateLinks();
  if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
})();

(function () {
  const drawer=document.querySelector('.catalog-drawer');
  if(!drawer)return;
  const toggle=drawer.querySelector('.catalog-toggle');
  const setOpen=open=>{drawer.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));};
  toggle.addEventListener('click',()=>setOpen(!drawer.classList.contains('is-open')));
  drawer.addEventListener('keydown',e=>{if(e.key==='Escape'){setOpen(false);toggle.focus();}});
  drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{setOpen(false);if(e.detail)a.blur();}));
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&matchMedia('(min-width: 851px)').matches){
    drawer.classList.add('is-peeking');setTimeout(()=>drawer.classList.remove('is-peeking'),550);
  }
})();

// One dismissible invitation per tab/session; no tracking or external calls.
(function(){
 if(!document.querySelector('[data-catalog-title]'))return;
 const key='mrf-contact-shown';let shown=false;
 try{shown=sessionStorage.getItem(key)==='1'}catch(_){}
 if(shown)return;
 const prompt=document.createElement('aside');prompt.className='contact-invitation';prompt.hidden=true;
 const close=document.createElement('button'),copy=document.createElement('p'),link=document.createElement('a');
 close.type='button';close.textContent='×';link.href='mailto:sales@marsupialrf.com';link.textContent='sales@marsupialrf.com';
 const translate=()=>{const lang=document.body.dataset.lang;copy.textContent=lang==='es'?'¿Tenés preguntas? ¡Escribinos!':lang==='pt'?'Tem dúvidas? Envie um e-mail!':'Have questions? Send us an email!';close.setAttribute('aria-label',lang==='es'?'Cerrar':lang==='pt'?'Fechar':'Close');prompt.setAttribute('aria-label',copy.textContent)};
 translate();window.addEventListener('mrf:language',translate);prompt.append(close,copy,link);document.body.append(prompt);
 close.onclick=()=>{prompt.hidden=true};prompt.onkeydown=e=>{if(e.key==='Escape')prompt.hidden=true};
 const onScroll=()=>{if(shown||scrollY<Math.max(600,innerHeight*.8)||document.querySelector('.country-modal[open]'))return;shown=true;prompt.hidden=false;try{sessionStorage.setItem(key,'1')}catch(_){}window.removeEventListener('scroll',onScroll)};
 window.addEventListener('scroll',onScroll,{passive:true});
})();
