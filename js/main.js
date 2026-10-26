/* Общая логика магазина. Персональные данные форм не сохраняются. */
(() => {
  'use strict';
  const products = window.shopProducts;
  const money = value => new Intl.NumberFormat('ru-RU', {style:'currency',currency:'RUB',maximumFractionDigits:0}).format(value);
  const storageKey = 'ritm-cart-v1';
  const findProduct = id => products.find(product => product.id === id);
  let cart = {};
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      for (const product of products) {
        const count = saved[product.id];
        if (Number.isInteger(count) && count > 0) cart[product.id] = Math.min(99, count);
      }
    }
  } catch { cart = {}; }
  function notify(message) {
    document.getElementById('cart-toast-text').textContent = message;
    bootstrap.Toast.getOrCreateInstance(document.getElementById('cart-toast'), {delay:3500}).show();
  }
  function updateCount() {
    const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach(node => {node.textContent = count; node.setAttribute('aria-label', `Товаров в корзине: ${count}`);});
  }
  function saveCart() {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); }
    catch { storageAvailable = false; notify('Браузер запретил сохранение корзины. Разрешите локальное хранилище и откройте сайт через localhost.'); }
    updateCount();
  }
  function addToCart(id) {
    if (!findProduct(id)) return;
    if ((cart[id] || 0) >= 99) {notify('Максимум 99 единиц одного товара.'); return;}
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    if (storageAvailable) notify(`${findProduct(id).name} — добавлено в корзину`);
  }
  function card(product) {
    return `<div class="col-sm-6 col-xl-4"><article class="card product-card"><a class="product-image" href="product.html?id=${product.id}" aria-label="Подробнее о ${product.name}"><img src="images/products/${product.image}" alt="${product.categoryName} ${product.name}" loading="lazy" width="800" height="640"><span class="badge product-badge">${product.badge}</span></a><div class="card-body d-flex flex-column"><span class="small-label">${product.categoryName}</span><h3 class="card-title"><a href="product.html?id=${product.id}">${product.name}</a></h3><p class="card-text">${product.short}</p><div class="d-flex justify-content-between align-items-center mt-auto"><strong class="product-price">${money(product.price)}</strong><button class="btn btn-outline-dark add-button" data-add="${product.id}" aria-label="Добавить ${product.name} в корзину">+</button></div></div></article></div>`;
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-add]');
    if (button) addToCart(button.dataset.add);
  });
  updateCount();
  const popular = document.getElementById('popular-products');
  if (popular) popular.innerHTML = products.map(card).join('');

  // Каталог: поиск, категория, предельная цена и сортировка работают совместно.
  const filters = document.getElementById('filter-form');
  if (filters) {
    const search = document.getElementById('search');
    const maxPrice = document.getElementById('max-price');
    const sort = document.getElementById('sort');
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const radio = [...filters.elements.category].find(input => input.value === category);
    if (radio) radio.checked = true;
    search.value = params.get('q') || '';
    function renderCatalog() {
      const selected = filters.elements.category.value;
      const query = search.value.trim().toLocaleLowerCase('ru');
      const limit = maxPrice.value === '' ? Infinity : Number(maxPrice.value);
      const result = products.filter(product => (selected === 'all' || product.category === selected) && `${product.name} ${product.categoryName} ${product.short}`.toLocaleLowerCase('ru').includes(query) && product.price <= limit);
      if (sort.value === 'price-asc') result.sort((a,b) => a.price-b.price);
      if (sort.value === 'price-desc') result.sort((a,b) => b.price-a.price);
      if (sort.value === 'name') result.sort((a,b) => a.name.localeCompare(b.name));
      document.getElementById('catalog-products').innerHTML = result.map(card).join('');
      document.getElementById('result-count').textContent = `Показано ${result.length} из ${products.length}`;
      document.getElementById('catalog-empty').hidden = result.length > 0;
    }
    filters.addEventListener('submit', event => event.preventDefault());
    filters.addEventListener('input', renderCatalog);
    sort.addEventListener('change', renderCatalog);
    filters.addEventListener('reset', () => {sort.value='featured'; setTimeout(renderCatalog, 0);});
    document.getElementById('clear-filters').addEventListener('click', () => filters.reset());
    renderCatalog();
  }

  // Карточка получает товар из URL; неизвестный ID не подменяется другим товаром.
  const detail = document.getElementById('product-detail');
  if (detail) {
    const id = new URLSearchParams(location.search).get('id') || 'studio';
    const product = findProduct(id);
    if (!product) {
      detail.innerHTML = '<div class="empty-state"><h1>Товар не найден</h1><p>Возможно, ссылка устарела.</p><a class="btn btn-primary" href="catalog.html">Вернуться в каталог</a></div>';
      document.getElementById('product-crumb').textContent = 'Товар не найден';
    } else {
      document.title = `${product.name} — ритм.`;
      document.getElementById('product-crumb').textContent = product.name;
      detail.innerHTML = `<div class="row gy-5 gx-4 gx-lg-5 align-items-center"><div class="col-lg-6"><img class="detail-photo" src="images/products/${product.image}" alt="${product.categoryName} ${product.name}"></div><div class="col-lg-6"><p class="eyebrow text-secondary">${product.categoryName}</p><h1>${product.name}</h1><p class="availability">● В наличии в демокаталоге</p><p class="detail-description mt-4">${product.description}</p><ul class="detail-points my-4">${product.points.map(point=>`<li>↗ &nbsp; ${point}</li>`).join('')}</ul><p class="detail-price mb-3">${money(product.price)}</p><div class="d-flex flex-wrap gap-2"><button class="btn btn-primary" data-add="${product.id}">Добавить в корзину <span class="arrow">+</span></button><a class="btn btn-outline-dark" href="order.html">К оформлению ↗</a></div><button class="btn btn-link text-secondary px-0 mt-3 small" data-bs-toggle="modal" data-bs-target="#delivery-modal">Доставка и оплата</button></div></div><div class="row gy-5 gx-4 gx-lg-5 pt-5 mt-lg-3"><section class="col-lg-6"><h2 class="mb-4 fs-3">В деталях.</h2><div class="table-responsive"><table class="table"><caption class="visually-hidden">Характеристики ${product.name}</caption><tbody>${Object.entries(product.specs).map(([key,value])=>`<tr><th scope="row">${key}</th><td>${value}</td></tr>`).join('')}</tbody></table></div></section><section class="col-lg-6"><h2 class="mb-4 fs-3">Хорошо знать.</h2><div class="accordion accordion-flush" id="product-faq"><div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button" data-bs-toggle="collapse" data-bs-target="#faq-one" aria-expanded="true" aria-controls="faq-one">Что в комплекте?</button></h3><div id="faq-one" class="accordion-collapse collapse show" data-bs-parent="#product-faq"><div class="accordion-body small">${product.name}, кабель для зарядки и инструкция. Для Air 02 также предусмотрен зарядный кейс.</div></div></div><div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#faq-two" aria-expanded="false" aria-controls="faq-two">Как работает гарантия?</button></h3><div id="faq-two" class="accordion-collapse collapse" data-bs-parent="#product-faq"><div class="accordion-body small">В демонстрационных условиях магазина предусмотрена гарантия 12 месяцев. Проект учебный: реальная продажа товаров не производится.</div></div></div></div></section></div>`;
    }
  }

  // Проверка форм использует Constraint Validation API и оформление Bootstrap.
  function validate(form, focusInvalid = true) {
    form.querySelectorAll('input[minlength], textarea[minlength]').forEach(input => {
      input.setCustomValidity(input.value.trim().length < Number(input.minLength) && !input.disabled ? 'Недостаточно символов.' : '');
    });
    if (form.id === 'order-form') {
      const phone = document.getElementById('order-phone');
      const digits = phone.value.replace(/\D/g,'');
      phone.setCustomValidity(/^[+\d\s()-]+$/.test(phone.value) && /^[78]\d{10}$/.test(digits) ? '' : 'Введите российский номер телефона.');
    }
    form.classList.add('was-validated');
    const valid = form.checkValidity();
    [...form.elements].filter(input=>input.willValidate).forEach(input=>input.setAttribute('aria-invalid', String(!input.validity.valid)));
    if (!valid && focusInvalid) form.querySelector(':invalid')?.focus();
    return valid;
  }
  document.querySelectorAll('form[novalidate]').forEach(form => form.addEventListener('input', () => {
    if (form.classList.contains('was-validated')) {
      // При редактировании пересчитываем ограничения без перемещения фокуса.
      validate(form, false);
    }
  }));
  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    const delivery = document.getElementById('delivery');
    const address = document.getElementById('order-address');
    const subtotal = () => products.reduce((sum,product)=>sum + product.price*(cart[product.id]||0),0);
    const shipping = () => delivery.value === 'pickup' || subtotal() >= 10000 || subtotal() === 0 ? 0 : 490;
    function renderOrder() {
      const empty = Object.keys(cart).length === 0;
      document.getElementById('empty-cart').hidden = !empty;
      document.getElementById('checkout-content').hidden = empty;
      document.getElementById('order-items').innerHTML = products.filter(product=>cart[product.id]).map(product=>`<div class="order-item"><div class="d-flex gap-3"><a href="product.html?id=${product.id}"><img src="images/products/${product.image}" alt="${product.name}"></a><div class="flex-grow-1"><div class="d-flex justify-content-between gap-2 flex-wrap"><a class="text-decoration-none fw-semibold" href="product.html?id=${product.id}">${product.name}</a><strong class="small">${money(product.price*cart[product.id])}</strong></div><div class="small text-secondary">${money(product.price)} / шт.</div><div class="d-flex justify-content-between mt-2 gap-2"><div class="quantity-control"><button type="button" class="btn btn-outline-dark btn-sm" data-quantity="${product.id}" data-delta="-1" aria-label="Уменьшить количество ${product.name}" ${cart[product.id]===1?'disabled':''}>−</button><span>${cart[product.id]}</span><button type="button" class="btn btn-outline-dark btn-sm" data-quantity="${product.id}" data-delta="1" aria-label="Увеличить количество ${product.name}" ${cart[product.id]===99?'disabled':''}>+</button></div><button type="button" class="remove-item" data-remove="${product.id}" aria-label="Удалить ${product.name}">Удалить</button></div></div></div></div>`).join('');
      document.getElementById('subtotal').textContent = money(subtotal());
      document.getElementById('shipping').textContent = shipping() === 0 ? 'Бесплатно' : money(shipping());
      document.getElementById('total').textContent = money(subtotal()+shipping());
    }
    delivery.addEventListener('change', () => {
      const pickup = delivery.value === 'pickup';
      address.disabled = pickup;
      address.required = !pickup;
      document.getElementById('address-field').hidden = pickup;
      document.getElementById('pickup-note').hidden = !pickup;
      renderOrder();
    });
    document.getElementById('order-items').addEventListener('click', event => {
      const quantity = event.target.closest('[data-quantity]');
      const remove = event.target.closest('[data-remove]');
      if (quantity) cart[quantity.dataset.quantity] = Math.max(1,Math.min(99,cart[quantity.dataset.quantity]+Number(quantity.dataset.delta)));
      if (remove) delete cart[remove.dataset.remove];
      if (quantity || remove) {
        const selector = quantity ? `[data-quantity="${quantity.dataset.quantity}"][data-delta="${quantity.dataset.delta}"]` : null;
        saveCart(); renderOrder();
        if (selector) document.querySelector(selector)?.focus();
      }
    });
    orderForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!Object.keys(cart).length || !validate(orderForm)) return;
      document.getElementById('success-summary').textContent = `Сумма вашего заказа — ${money(subtotal()+shipping())}.`;
      cart = {}; saveCart(); renderOrder(); orderForm.reset();
      orderForm.classList.remove('was-validated');
      [...orderForm.elements].forEach(input=>input.removeAttribute('aria-invalid'));
      address.disabled=false; address.required=true;
      bootstrap.Modal.getOrCreateInstance(document.getElementById('success-modal')).show();
    });
    document.getElementById('success-modal').addEventListener('hidden.bs.modal',()=>document.querySelector('#empty-cart a').focus());
    renderOrder();
    window.addEventListener('storage',event=>{if(event.key===storageKey) location.reload();});
  }
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit',event=>{
      event.preventDefault();
      if (!validate(contactForm)) return;
      contactForm.reset(); contactForm.classList.remove('was-validated');
      [...contactForm.elements].forEach(input=>input.removeAttribute('aria-invalid'));
      document.getElementById('contact-success').hidden=false;
    });
    contactForm.addEventListener('input',()=>{document.getElementById('contact-success').hidden=true;});
  }
})();
