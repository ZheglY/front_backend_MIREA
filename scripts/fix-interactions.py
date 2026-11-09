from pathlib import Path
p=Path('js/main.js');s=p.read_text(encoding='utf-8-sig');start=s.index("document.querySelector('.filters')");end=s.index('const dishes=',start);s=s[:start]+'''const filterForm = document.querySelector('.filters');
const categorySelect = document.querySelector('#category');
function applyCategory() {
  const category = categorySelect.value;
  let count = 0;
  document.querySelectorAll('.card').forEach(card => {
    card.hidden = category !== 'all' && card.dataset.category !== category;
    if (!card.hidden) count++;
  });
  document.querySelector('#filter-status').textContent = 'Блюд: ' + count;
}
if (filterForm && categorySelect) {
  categorySelect.addEventListener('change', applyCategory);
  filterForm.addEventListener('submit', event => { event.preventDefault(); applyCategory(); });
  applyCategory();
}
''' +s[end:];p.write_text(s,encoding='utf-8')
p=Path('css/style.css');p.write_text(p.read_text(encoding='utf-8-sig')+'''\n/* Единая типографика и стабильная ширина при переходах. */
html{scrollbar-gutter:stable}
h1{font-size:clamp(40px,5vw,68px);line-height:1.12;letter-spacing:-1.5px}
.hero-copy h1 br:first-child{display:none}
.hero-copy h1 br:first-child::after{content:' '}
.hero-image img{max-height:500px}
''',encoding='utf-8')
p=Path('index.html');s=p.read_text(encoding='utf-8-sig').replace('Счастье —<br>за одним','Счастье — за одним');p.write_text(s,encoding='utf-8')
p=Path('css/responsive.css');p.write_text(p.read_text(encoding='utf-8-sig')+'\n@media(min-width:1000px){.hero-copy{padding-top:40px;padding-bottom:40px}.hero-image{margin-top:40px;margin-bottom:40px}}\n',encoding='utf-8')
p=Path('scripts/verify.cjs');s=p.read_text(encoding='utf-8-sig');s=s.replace("await page.selectOption('#category','pasta');await page.locator('.filters button').click();assert.equal(await page.locator('.card:visible').count(),1);", "for(const category of ['pizza','pasta','dessert','all']){await page.selectOption('#category',category);assert.equal(await page.locator('.card:visible').count(),category==='all'?3:1);if(category!=='all')assert.equal(await page.locator('.card:visible').getAttribute('data-category'),category);assert.equal(await page.locator('#filter-status').textContent(),'Блюд: '+(category==='all'?3:1));}await page.locator('.filters button').click();assert.equal(await page.locator('.card:visible').count(),3);")
s=s.replace("await page.locator('#date').fill('2027-01-15');", "await page.locator('#date').fill(await page.locator('#date').getAttribute('min'));")
s=s.replace("const results=[];", "const results=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));")
s=s.replace("await browser.close();fs.writeFileSync", "assert.deepEqual(errors,[]);await browser.close();fs.writeFileSync")
p.write_text(s,encoding='utf-8')
