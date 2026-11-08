from pathlib import Path
from PIL import Image
p=Path('.')
f=p/'catalog.html';s=f.read_text(encoding='utf-8-sig');s=s.replace('<form class="filters">','<div class="catalog-layout"><aside aria-label="Фильтр меню"><form class="filters">').replace('</form><p id="filter-status"','</form></aside><div class="catalog-results"><p id="filter-status"').replace('</section></main>','</div></div></section></main>');f.write_text(s,encoding='utf-8')
for f in p.glob('*.html'):
 s=f.read_text(encoding='utf-8-sig')
 if f.name.startswith('product_'):
  s=s.replace('<title>','<link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/responsive.css"><title>')
 for n in ['pizza','pasta','dessert']:
  im=Image.open(p/'images'/f'{n}-960.webp');w,h=im.size
  import re
  s=re.sub(r'(<img[^>]+src="images/'+n+r'-960.webp"[^>]*?)width="960" height="960"',lambda m:m[1]+f'width="{w}" height="{h}"',s)
 if f.name in ['index.html','product.html']:
  s=s.replace('sizes="(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw"','sizes="(min-width: 1000px) 45vw, 90vw"',1)
 s=s.replace('<main id="main"','<main tabindex="-1" id="main"')
 f.write_text(s,encoding='utf-8')
f=p/'css/style.css';f.write_text(f.read_text(encoding='utf-8-sig')+'\nvideo{max-width:100%;height:auto}.catalog-layout{display:grid;gap:28px}.catalog-layout>*{min-width:0}.catalog-layout .filters{align-items:stretch;flex-direction:column;padding:20px;border:1px solid var(--line);margin:0}.catalog-layout select{width:100%}\n',encoding='utf-8')
f=p/'css/responsive.css';f.write_text(f.read_text(encoding='utf-8-sig')+'\n@media(min-width:1000px){.catalog-layout{grid-template-columns:230px minmax(0,1fr)}.catalog-layout .cards{grid-template-columns:repeat(2,minmax(0,1fr))}}\n@media(max-width:639px){.table-wrapper table,.table-wrapper tbody{display:block}.table-wrapper tr{display:grid;grid-template-columns:1fr;margin:12px 0;border:1px solid var(--line)}.table-wrapper th,.table-wrapper td{display:block;border:0;padding:8px 14px}.table-wrapper th{background:#e5e8dc}}\n',encoding='utf-8')
