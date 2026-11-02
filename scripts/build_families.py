#!/usr/bin/env python3
"""Render the grouped catalogue and its homepage preview from public copy."""
import html
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'data/families.json').read_text())
FAMILIES = {f['id']: f for f in DATA['families']}


def bi(pair):
    return '<span class="lang lang-es">' + html.escape(pair[0]) + '</span><span class="lang lang-en">' + html.escape(pair[1]) + '</span>'


def family_image(f, kind='products'):
    media = f.get('service_media') if kind == 'services' else f.get('preview_media')
    if media:
        return ('<div class="visual-wash" style="background-image:url(\'' + html.escape(media[0]['src'], quote=True) + '\')"></div>'
                + '<div class="real-media-grid media-count-' + str(len(media)) + '">'
                + ''.join('<figure class="real-media ' + item.get('class', '') + '"><img src="'
                          + html.escape(item['src'], quote=True) + '" alt="'
                          + html.escape(item['alt'][0], quote=True) + '" data-alt-es="'
                          + html.escape(item['alt'][0], quote=True) + '" data-alt-en="'
                          + html.escape(item['alt'][1], quote=True) + '" loading="lazy">' + ('<figcaption>' + bi(item['caption']) + '</figcaption>' if item.get('caption') else '') + '</figure>' for item in media)
                + '</div>')
    if kind == 'services':
        if f.get('service_flow'):
            return '<div class="service-concept"><small>' + bi(['Esquema de servicio', 'Service outline']) + '</small><div class="service-flow">' + ''.join('<span>' + bi(step) + '</span>' for step in f['service_flow']) + '</div></div>'
        return '<div class="visual-pending"><strong>' + bi(f.get('service_short', f['name'])) + '</strong><span>' + bi(['Visual por confirmar', 'Visual to be confirmed']) + '</span></div>'
    if f.get('preview_images'):
        paths = ['assets/portfolio/' + x for x in f['preview_images']]
        return '<div class="visual-wash" style="background-image:url(\'' + paths[0] + '\')"></div><div class="visual-pair">' + ''.join('<img src="' + src + '" alt="' + ('RF tap construido / Built RF tap' if i == 0 else 'Diseño CAD del RF tap / RF tap CAD design') + '" loading="lazy">' for i, src in enumerate(paths)) + '</div>'
    if f.get('image'):
        src = 'assets/portfolio/' + f['image']
        return ('<div class="visual-wash" style="background-image:url(\'' + src + '\')"></div><img class="visual-main" src="' + src + '" alt="' + html.escape(f['image_alt'][0], quote=True)
                + '" data-alt-es="' + html.escape(f['image_alt'][0], quote=True) + '" data-alt-en="'
                + html.escape(f['image_alt'][1], quote=True) + '" width="1200" height="750" loading="lazy" decoding="async">')
    return '<div class="visual-pending">' + bi(['Material visual pendiente', 'Visual material pending']) + '</div>'


def carousel(kind, title, description):
    defaults = DATA['default_preview'][kind]
    available = {'products': ['rf', 'ant', 'sys', 'sdr', 'rad', 'con', 'sal'],
                 'services': ['pcb', 'firmware', 'med', 'rad', 'local-ai', 'rf', 'ant', 'sdr', 'con']}
    ids = defaults + [fid for fid in available[kind] if fid not in defaults]
    parts = ['<section class="family-carousel" id="' + kind + '" data-carousel aria-label="' + ' / '.join(title) + '">',
             '<div class="family-column-head"><h2>' + bi(title) + '</h2></div>',
             '<div class="carousel-stage"><div class="family-track" id="' + kind + '-track">']
    for i, fid in enumerate(ids):
        f = FAMILIES[fid]
        target = f.get('preview_target', 'familias.html?view=products#' + ('sys' if fid == 'rad' else fid)) if kind == 'products' else 'familias.html?view=services#' + fid
        story = ' data-open-story="passive-radar" aria-haspopup="dialog"' if kind == 'products' and fid == 'rad' else ''
        parts.append('<article class="family-slide"' + (' hidden data-default-hidden' if fid not in defaults else '') + ' data-family="' + fid + '" data-name-es="' + html.escape(f['name'][0], quote=True)
                     + '" data-name-en="' + html.escape(f['name'][1], quote=True) + '" aria-labelledby="' + kind + '-' + fid + '-title">'
                     + '<div class="family-visual" aria-hidden="true">' + family_image(f, kind) + '</div>'
                     + '<div class="family-card-copy"><h3 id="' + kind + '-' + fid + '-title">' + bi(f.get('preview_title', f['name']) if kind == 'products' else f.get('service_title', f['name'])) + '</h3>'
                     + '<p class="slide-description">' + bi(f.get('preview_description', f['summary']) if kind == 'products' else f.get('service_description', f['summary'])) + '</p>'
                     + '</div><a class="family-slide-link" href="' + html.escape(target, quote=True) + '"' + story + '><span class="visually-hidden">'
                     + bi(f.get('preview_title', f['name']) if kind == 'products' else f.get('service_title', f['name'])) + '</span></a></article>')
    parts.append('</div><div class="family-controls" hidden><button type="button" data-carousel-prev aria-controls="' + kind + '-track" aria-label="Anterior / Previous">‹</button>'
                 + '<p class="visually-hidden" data-carousel-status aria-live="off" aria-atomic="true"></p><button type="button" data-carousel-next aria-controls="' + kind
                 + '-track" aria-label="Siguiente / Next">›</button><div class="carousel-dots"></div></div></div></section>')
    return ''.join(parts)


def showcase():
    return ('<!-- family-showcase:start --><div class="wrap"><section class="family-intro" aria-labelledby="hero-title"><h1 id="hero-title" class="visually-hidden">'
            + bi(['Catálogo', 'Catalogue']) + '</h1></section><p class="institutional-notice"><strong>DISCLAIMER</strong> ' + bi(DATA['institutional_notice'])
            + ' <a href="https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-121/section-121.1#p-121.1(XI)(a)(3)(xxvii)">22 CFR 121.1 · XI(a)(3)(xxvii)</a></p><div class="family-showcase">'
            + carousel('products', ['Productos', 'Products'], ['Equipos, módulos y plataformas. Explorá cada familia.', 'Equipment, modules and platforms. Explore each family.'])
            + carousel('services', ['Servicios', 'Services'], ['Desde una consulta puntual hasta un desarrollo completo.', 'From a focused consultation to a complete development.'])
            + '</div></div>' + story_dialog() + '<!-- family-showcase:end -->')


def image_figure(media, css='option-photo'):
    image = ('<img src="' + html.escape(media['src'], quote=True) + '" alt="'
             + html.escape(media['alt'][0], quote=True) + '" data-alt-es="'
             + html.escape(media['alt'][0], quote=True) + '" data-alt-en="'
             + html.escape(media['alt'][1], quote=True)
             + '" width="1000" height="700" loading="lazy" decoding="async">')
    if media.get('video'):
        image = ('<video controls playsinline preload="none" poster="' + html.escape(media['src'], quote=True)
                 + '" aria-label="' + html.escape(media['alt'][1], quote=True) + '"><source src="'
                 + html.escape(media['video'], quote=True) + '" type="video/mp4">' + image + '</video>')
    caption = '<figcaption>' + bi(media['caption']) + '</figcaption>' if media.get('caption') else ''
    return '<figure class="' + css + '">' + image + caption + '</figure>'


def story_dialog():
    story = DATA['passive_radar_story']
    sections = ''.join('<section><h3>' + bi(s['title']) + '</h3><p>' + bi(s['text']) + '</p>'
                       + ''.join(image_figure(m, 'story-photo') for m in s.get('media', [])) + '</section>' for s in story['sections'])
    return ('<dialog class="product-story" id="passive-radar" aria-labelledby="passive-radar-title">'
            + '<button class="story-close" type="button" data-close-story aria-label="Cerrar / Close / Fechar">×</button>'
            + '<div class="story-content"><h2 id="passive-radar-title">' + bi(story['title']) + '</h2><p>' + bi(story['intro']) + '</p>'
            + ''.join(image_figure(m, 'story-photo') for m in story.get('media', [])) + sections
            + '<a class="action action-primary" href="mailto:sales@marsupialrf.com">sales@marsupialrf.com ↗</a></div></dialog>')


def directory():
    links = ''.join('<a href="familias.html?view=' + ('services' if f['id'] in ['pcb','firmware','med','local-ai'] else 'products') + '#' + ('sys' if f['id']=='rad' else f['id']) + '">' + bi(f['name']) + ' <span aria-hidden="true">↗</span></a>' for f in DATA['families'] if f['id'] != 'sal')
    return ('<!-- family-directory:start --><section class="family-directory wrap" aria-label="Catálogo / Catalogue"><h2>'
            + bi(['Productos y servicios', 'Products & services']) + '</h2><div class="family-directory-links">' + links + '</div>'
            + '<div class="family-development"><div><p class="small-label">' + bi(['Foco actual de I+D', 'Current R&D Focus']) + '</p><h3>'
            + bi(['Nuevas ideas para salud.', 'New ideas for health.']) + '</h3><p>'
            + bi(['FieldDS y sensado de presión/carga: una línea joven, abierta a colaboraciones y validación experimental.', 'FieldDS and pressure/load sensing: an early programme open to collaboration and experimental validation.'])
            + '</p></div><a class="text-link" href="familias.html?view=products#sal">' + bi(['Conocé los proyectos', 'Explore the projects'])
            + ' ↗</a></div></section><!-- family-directory:end -->')


def option_markup(opt, anchor=None):
    ident = ' id="' + anchor + '"' if anchor else ''
    media = opt[2] if len(opt) > 2 else {}
    if media.get('kind') == 'contact':
        return '<aside class="custom-requirements"' + ident + '><strong>' + bi(opt[0]) + '</strong> <span>' + bi(opt[1]) + '</span> <a href="mailto:engineering@marsupialrf.com">engineering@marsupialrf.com ↗</a></aside>'
    badge = '<span class="development-badge">' + bi(media['badge']) + '</span>' if media.get('badge') else ''
    copy = '<div class="family-option-copy">' + badge + '<h3>' + bi(opt[0]) + '</h3><p>' + bi(opt[1]) + '</p>'
    if media.get('href'):
        copy += '<a class="text-link" href="' + html.escape(media['href'], quote=True) + '">' + bi(media['link_label']) + ' ↗</a>'
    copy += '</div>'
    images = media.get('images', [media] if media.get('src') else [])
    if not images:
        return '<article class="family-option"' + ident + '>' + copy + '</article>'
    figure = ''.join(image_figure(m) for m in images)
    if len(images) > 1:
        figure = '<div class="option-gallery">' + figure + '</div>'
    return '<article class="family-option family-option-illustrated"' + ident + '>' + figure + copy + '</article>'


def detail_sections():
    result = []
    for f in DATA['families']:
        options = ''.join(option_markup(opt, f['id'] + '-option-' + str(i+1)) for i,opt in enumerate(f['options']))
        name = bi(f['name'])
        intro = bi(f['intro']) if any(f['intro']) else ''
        if f.get('service_options'):
            name = '<span data-catalog-variant="products">' + name + '</span><span data-catalog-variant="services" hidden>' + bi(f['service_title']) + '</span>'
            intro = '<span data-catalog-variant="products">' + intro + '</span><span data-catalog-variant="services" hidden>' + bi(f['service_intro']) + '</span>'
            flow = '<div class="rf-integration-flow">' + ''.join('<span>' + bi(step) + '</span>' for step in f.get('service_flow', [])) + '</div>' if f.get('service_flow') else ''
            options = '<div class="catalog-options" data-catalog-variant="products">' + options + '</div><div class="catalog-options rf-service-options" data-catalog-variant="services" hidden>' + flow + ''.join(option_markup(opt, f['id'] + '-service-' + str(i+1)) for i,opt in enumerate(f['service_options'])) + '</div>'
        media_class = ' has-option-media' if any(len(opt) > 2 for opt in f['options']) else ''
        portfolio = '<a class="text-link" href="' + f['portfolio'] + '">' + bi(['Ver un ejemplo de nuestro portfolio', 'See a portfolio example']) + ' ↗</a>' if f.get('portfolio') else ''
        tag = '<p class="small-label">' + bi(['Investigación y desarrollo', 'Research & development']) + '</p>' if f['id'] == 'sal' else ''
        result.append('<section class="family-detail' + media_class + '" data-sections="' + ('products ' if f['id'] in ['rf','ant','sys','sdr','sal','con'] else '') + ('services' if f['id'] in ['pcb','firmware','med','local-ai','rf','ant','sdr','rad','con'] else '') + '" id="' + f['id'] + '" aria-labelledby="detail-' + f['id'] + '"><div class="family-detail-intro">' + tag
                      + '<h2 id="detail-' + f['id'] + '">' + name + '</h2>' + ('<p>' + intro + '</p>' if intro else '') + portfolio
                      + '</div><div class="family-options">' + options + '<a class="action action-primary" href="index.html#contact">'
                      + bi(['Consultar por esta familia', 'Discuss this family']) + ' ↗</a></div></section>')
    return ''.join(result)


def catalogue_navigation():
    groups=[]
    for f in DATA['families']:
        subs=''.join('<li><a href="#' + f['id'] + '-option-' + str(i+1) + '">' + bi(opt[0]) + '</a></li>' for i,opt in enumerate(f['options']) if len(opt) < 3 or opt[2].get('kind') != 'contact')
        if f.get('service_options'):
            subs='<ul data-catalog-variant="products">' + subs + '</ul><ul data-catalog-variant="services" hidden>' + ''.join('<li><a href="#' + f['id'] + '-service-' + str(i+1) + '">' + bi(opt[0]) + '</a></li>' for i,opt in enumerate(f['service_options'])) + '</ul>'
        else:
            subs='<ul>' + subs + '</ul>'
        groups.append('<li data-nav-family="' + f['id'] + '"><a class="catalog-family-link" href="#' + f['id'] + '">' + bi(f['name']) + '</a>' + subs + '</li>')
    return ('<aside class="catalog-drawer" aria-label="Catálogo / Catalogue"><button class="catalog-toggle" type="button" aria-expanded="false" aria-controls="catalog-tree">☰ <span>' + bi(['Catálogo','Catalogue']) + '</span></button>'
            + '<nav class="case-nav" id="catalog-tree"><div class="catalog-roots"><a href="familias.html?view=products">' + bi(['Productos','Products']) + '</a><a href="familias.html?view=services">' + bi(['Servicios','Services']) + '</a></div><ul>' + ''.join(groups) + '</ul></nav></aside>')


def product_overview():
    cards = []
    for fid, indices in [('sys', range(4)), ('rf', range(4)), ('ant', [0, 1, 3])]:
        family = FAMILIES[fid]
        bullets = ''.join('<li><a href="#' + fid + '-option-' + str(i+1) + '">' + bi(family['options'][i][0]) + '</a></li>' for i in indices)
        cards.append('<article><h2><a href="#' + fid + '">' + bi(family['name']) + '</a></h2><ul>' + bullets + '</ul></article>')
    return '<section class="product-overview" data-catalog-variant="products">' + ''.join(cards) + '</section>'


def main():
    path = ROOT / 'index.html'
    original = path.read_text()
    if '<!-- family-showcase:start -->' in original:
        updated = re.sub(r'<!-- family-showcase:start -->.*?<!-- family-showcase:end -->', lambda _: showcase(), original, flags=re.S)
        updated = re.sub(r'<!-- family-directory:start -->.*?<!-- family-directory:end -->', lambda _: directory(), updated, flags=re.S)
    else:
        main_start = original.index('<main id="main-content">') + len('<main id="main-content">')
        services = original.index('<section class="section-pad" id="services"')
        cases = original.index('<section class="project-section', services)
        updated = original[:main_start] + showcase() + directory() + original[cases:]
    nav = '<nav class="new-nav" id="main-navigation" aria-label="Principal / Main">' + ''.join(
        '<a href="' + url + '">' + bi(name) + '</a>' for url, name in [
            ('familias.html?view=products', ['Productos', 'Products']), ('familias.html?view=services', ['Servicios', 'Services']),
            ('portfolio.html', ['Casos', 'Case studies']), ('index.html#about', ['Nosotros', 'About']),
            ('index.html#contact', ['Contacto', 'Contact'])]) + '</nav>'
    updated = re.sub(r'<nav class="new-nav".*?</nav>', lambda _: nav, updated, count=1, flags=re.S)
    path.write_text(updated)
    head = updated[:updated.index('<main id="main-content">')]
    head = re.sub(r'<title>.*?</title>', '<title>Marsupial RF — Productos y servicios</title>', head)
    head = re.sub(r'data-title-es="[^"]*"', 'data-title-es="Marsupial RF — Productos y servicios"', head)
    head = re.sub(r'data-title-en="[^"]*"', 'data-title-en="Marsupial RF — Products &amp; services"', head)
    footer = updated[updated.index('<footer class="new-footer">'):]
    detail = '<main id="main-content" class="wrap"><section class="family-intro"><h1 data-catalog-title>' + bi(['Productos', 'Products']) + '</h1></section>'
    detail += product_overview() + catalogue_navigation()
    detail += detail_sections() + '</main>'
    (ROOT / 'familias.html').write_text(head + detail + footer)


if __name__ == '__main__':
    main()
