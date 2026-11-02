#!/usr/bin/env python3
"""Vector illustration for local website review, NOT a validated RF/CAD design.

Geometry is illustrative, unitless, and has no claimed frequency or dimensions.
It visualizes a light shell, coupled cavities, and an exploded cover.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def point(x, y, z):
    return (240 + 3.1 * x - 1.5 * y, 340 + .7 * x + 1.25 * y - 2.5 * z)


def polygon(vertices, fill, stroke='#795a48', width=.8):
    pts = ' '.join(f'{a:.1f},{b:.1f}' for a, b in (point(*v) for v in vertices))
    return f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round"/>'


def box(x, y, z, w, d, h, top='#e5c5a3', front='#aa7758', side='#c59a75'):
    return ''.join([
        polygon([(x,y+d,z),(x+w,y+d,z),(x+w,y+d,z+h),(x,y+d,z+h)],front),
        polygon([(x+w,y,z),(x+w,y+d,z),(x+w,y+d,z+h),(x+w,y,z+h)],side),
        polygon([(x,y,z+h),(x+w,y,z+h),(x+w,y+d,z+h),(x,y+d,z+h)],top)
    ])


def main():
    parts = ['''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700" role="img" aria-labelledby="title desc">
<title id="title">Cavity filter — conceptual cutaway</title>
<desc id="desc">Illustrative lightweight shell with four coupled cavities and an exploded lid. This is a visual concept, not a validated design or prototype.</desc>
<defs>
 <linearGradient id="paper" x2="0" y2="1"><stop stop-color="#faf8f2"/><stop offset="1" stop-color="#eee8dd"/></linearGradient>
 <linearGradient id="metal" x2="1" y2="1"><stop stop-color="#f6e7cd"/><stop offset=".5" stop-color="#dfb78c"/><stop offset="1" stop-color="#c08a62"/></linearGradient>
 <filter id="soft"><feGaussianBlur stdDeviation="17"/></filter>
</defs>
<rect width="1000" height="700" rx="8" fill="url(#paper)"/>
<ellipse cx="480" cy="520" rx="340" ry="62" fill="#51483a" opacity=".13" filter="url(#soft)"/>
<g stroke-linejoin="round">''']
    # Far walls, floor, cavity partitions, then near walls; cover is exploded.
    parts.append(box(0, 0, 0, 180, 100, 4, top='url(#metal)'))
    parts.append(box(0, 0, 4, 180, 3, 31))
    parts.append(box(177, 3, 4, 3, 94, 31))
    for x in [45, 90, 135]:
        parts.append(box(x, 3, 4, 2, 36, 31))
        parts.append(box(x, 61, 4, 2, 36, 31))
    for x in [22, 67, 112, 157]:
        parts.append(box(x-5, 45, 4, 10, 10, 19, top='#f8e8ce', front='#b5865f', side='#d7aa7e'))
    parts.append(box(0, 3, 4, 3, 94, 31))
    parts.append(box(0, 97, 4, 180, 3, 31))
    for x in [5, 175]:
        for y in [6, 94]:
            px, py = point(x,y,35)
            parts.append(f'<ellipse cx="{px}" cy="{py}" rx="3.5" ry="1.8" fill="#65574d"/>')
    for x,y in [(0,0),(180,0),(0,100),(180,100)]:
        a,b=point(x,y,39);c,d=point(x,y,78)
        parts.append(f'<path d="M{a},{b} L{c},{d}" stroke="#a9a092" stroke-dasharray="4 6" stroke-width="1"/>')
    parts.append(box(0, 0, 82, 180, 100, 3, top='url(#metal)', front='#ba8c68', side='#cfa27a'))
    for x in [5,175]:
        for y in [6,94]:
            px,py=point(x,y,85)
            parts.append(f'<ellipse cx="{px}" cy="{py}" rx="3.5" ry="1.8" fill="#fff8eb" stroke="#9c7959" stroke-width="1"/>')
    parts.append('</g></svg>')
    target=ROOT/'assets/concepts/cavity-shell.svg'
    target.parent.mkdir(exist_ok=True)
    target.write_text('\n'.join(parts)+'\n')


if __name__ == '__main__':
    main()
