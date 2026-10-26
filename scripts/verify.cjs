const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
const base='http://127.0.0.1:4173/';
fs.mkdirSync('.artifacts',{recursive:true});
for(const width of [1440,768,390,320]){
 await page.setViewportSize({width,height:1000});
 for(const file of ['index.html','catalog.html','product.html?id=studio','order.html','contacts.html']){
  await page.goto(base+file);
  assert.equal(await page.locator('h1').count(),1,`${file}: one h1`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow: ${file} ${width}`);
  await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.evaluate(()=>bootstrap.Modal.VERSION),'5.3.8');
  if(width===1440||width===390) await page.screenshot({path:`.artifacts/bootstrap-${file.split('.')[0]}-${width}.png`,fullPage:true});
 }
}
await page.setViewportSize({width:390,height:844});await page.goto(base);
await page.getByRole('button',{name:'Открыть меню'}).click();
await page.locator('#main-nav').waitFor({state:'visible'});assert.equal(await page.getByRole('button',{name:'Открыть меню'}).getAttribute('aria-expanded'),'true');
await page.locator('#main-nav').getByRole('link',{name:'Каталог',exact:true}).click();
await page.setViewportSize({width:1440,height:1000});
assert.equal(await page.locator('.product-card').count(),3);
await page.getByLabel('Вкладыши',{exact:true}).check();assert.equal(await page.locator('.product-card').count(),1);assert.match(await page.locator('.card-title').innerText(),/Air/);
await page.getByRole('button',{name:'Сбросить фильтры',exact:true}).first().click();assert.equal(await page.locator('.product-card').count(),3);
await page.getByLabel('Поиск по коллекции').fill('ничего');assert(await page.locator('#catalog-empty').isVisible());
await page.locator('#clear-filters').click();await page.getByLabel('Цена до, ₽').fill('6000');assert.equal(await page.locator('.product-card').count(),1);
await page.getByRole('button',{name:'Сбросить фильтры',exact:true}).first().click();await page.getByLabel('Сортировка').selectOption('price-asc');assert.match(await page.locator('.card-title').first().innerText(),/Air/);
await page.goto(base+'catalog.html?category=speakers');assert.equal(await page.locator('.product-card').count(),1);
await page.goto(base+'product.html?id=unknown');assert.match(await page.locator('h1').innerText(),/не найден/);
await page.goto(base+'product.html?id=air');await page.getByRole('button',{name:'Добавить в корзину'}).click();assert.equal(await page.locator('[data-cart-count]').innerText(),'1');
await page.getByRole('link',{name:'К оформлению'}).click();assert.match(await page.locator('#subtotal').innerText(),/5\s990/);assert.match(await page.locator('#shipping').innerText(),/490/);
for (const width of [1440, 768, 390, 320]) {
 await page.setViewportSize({width,height:1000});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `Filled checkout overflow: ${width}`);
 if(width===1440||width===390) await page.screenshot({path:`.artifacts/checkout-filled-${width}.png`,fullPage:true});
}
await page.setViewportSize({width:1440,height:1000});
assert(await page.locator('#order-address').evaluate(e=>e.required&&!e.validity.valid));
await page.getByRole('button',{name:'Увеличить количество Air 02'}).click();assert.match(await page.locator('#subtotal').innerText(),/11\s980/);assert.equal(await page.locator('#shipping').innerText(),'Бесплатно');
await page.reload();assert.equal(await page.locator('[data-cart-count]').innerText(),'2');
await page.getByRole('button',{name:'Уменьшить количество Air 02'}).click();await page.getByLabel('Способ получения').selectOption('pickup');assert.equal(await page.locator('#shipping').innerText(),'Бесплатно');assert(!(await page.locator('#address-field').isVisible()));
await page.getByRole('button',{name:'Оформить учебный заказ'}).click();assert(await page.locator('#order-name').evaluate(e=>!e.validity.valid));assert(await page.locator('#order-form').evaluate(e=>e.classList.contains('was-validated')));
await page.getByLabel('Имя *',{exact:true}).fill('Тест');await page.getByLabel('Телефон *').fill('123');await page.getByLabel('Email *',{exact:true}).fill('test@example.com');await page.locator('#order-agreement').check();
await page.getByRole('button',{name:'Оформить учебный заказ'}).click();assert(await page.locator('#order-phone').evaluate(e=>!e.validity.valid));
await page.getByLabel('Телефон *').fill('+7 (900) 123-45-67');await page.getByRole('button',{name:'Оформить учебный заказ'}).click();await page.locator('#success-modal').waitFor({state:'visible'});assert.match(await page.locator('#success-summary').innerText(),/5\s990/);assert.equal(await page.locator('[data-cart-count]').innerText(),'0');
await page.screenshot({path:'.artifacts/bootstrap-order-success.png',fullPage:true});await page.locator('#success-modal .btn-close').click();assert(await page.locator('#empty-cart').isVisible());
await page.goto(base+'product.html?id=studio');await page.getByRole('button',{name:'Доставка и оплата',exact:true}).first().click();await page.locator('#delivery-modal').waitFor({state:'visible'});await page.waitForFunction(()=>document.activeElement?.closest('#delivery-modal')); await page.keyboard.press('Escape');await page.locator('#delivery-modal').waitFor({state:'hidden'});
await page.getByRole('button',{name:'Как работает гарантия?'}).click();await page.locator('#faq-two').waitFor({state:'visible'});
await page.getByRole('button',{name:'Добавить в корзину'}).click();await page.goto(base+'order.html');await page.getByRole('button',{name:'Удалить Studio 01'}).click();assert(await page.locator('#empty-cart').isVisible());
await page.goto(base+'contacts.html');await page.getByRole('button',{name:'Отправить учебный вопрос'}).click();assert(await page.locator('#contact-name').evaluate(e=>!e.validity.valid));
await page.getByLabel('Имя *',{exact:true}).fill('Тест');await page.getByLabel('Email *',{exact:true}).fill('test@example.com');await page.getByLabel('Ваш вопрос *').fill('Помогите выбрать наушники');await page.getByRole('button',{name:'Отправить учебный вопрос'}).click();assert(await page.locator('#contact-success').isVisible());
await page.goto(base);await page.evaluate(()=>localStorage.setItem('ritm-cart-v1','{"studio":-1,"air":200,"bad":3}'));await page.reload();assert.equal(await page.locator('[data-cart-count]').innerText(),'99');await page.evaluate(()=>localStorage.removeItem('ritm-cart-v1'));
await page.reload();await page.screenshot({path:'.artifacts/preview.jpg',type:'jpeg',quality:85});
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: five pages at 1440/768/390/320px, images, Bootstrap 5.3.8, navigation, filters/search/sort, invalid products, persistent cart, quantities/deletion, shipping thresholds, checkout validation/success, contacts, modal, accordion, corrupt storage. No page errors or failed assets.');
})().catch(e=>{console.error(e);process.exit(1)});
