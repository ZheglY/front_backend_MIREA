/* Корзина хранит только ID и количество. Цены всегда берутся из products.js.
   Снимок в ссылках сохраняет корзину и при запрете браузерного хранилища. */
(() => {
  'use strict';
  const key = 'ritm-cart-v1';
  const parameter = '_cart';
  const productIds = new Set(window.shopProducts.map(product => product.id));
  const pages = new Set(['index.html', 'catalog.html', 'product.html', 'order.html', 'contacts.html']);
  let current = {items: {}, revision: 0};
  const listeners = new Set();

  function normalize(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const items = {};
    for (const id of productIds) {
      if (Number.isInteger(value[id]) && value[id] > 0) items[id] = Math.min(value[id], 99);
    }
    const revision = Number.isSafeInteger(value._updatedAt) && value._updatedAt >= 0 && value._updatedAt <= Date.now() + 60000 ? value._updatedAt : 0;
    return {items, revision};
  }
  function fromStorage(name) {
    try { return normalize(JSON.parse(window[name].getItem(key))); }
    catch { return null; }
  }
  function fromUrl() {
    try {
      const raw = new URL(location.href).searchParams.get(parameter);
      if (!raw || raw.length > 500) return null;
      const [timestamp, ...entries] = raw.split(',');
      const value = {_updatedAt: Number(timestamp)};
      for (const entry of entries) {
        const [id, quantity] = entry.split(':');
        if (productIds.has(id)) value[id] = Number(quantity);
      }
      return normalize(value);
    } catch { return null; }
  }
  function token() {
    return [current.revision, ...Object.entries(current.items).map(([id, quantity]) => `${id}:${quantity}`)].join(',');
  }
  function decorateLinks() {
    if (!current.revision) return;
    document.querySelectorAll('a[href]').forEach(link => {
      const url = new URL(link.href, location.href);
      const localDirectory = new URL('.', location.href);
      if (url.protocol !== localDirectory.protocol || url.origin !== localDirectory.origin || new URL('.', url).pathname !== localDirectory.pathname || !pages.has(url.pathname.split('/').pop())) return;
      url.searchParams.set(parameter, token());
      link.href = url.href;
    });
  }
  function persist() {
    const value = JSON.stringify({...current.items, _updatedAt: current.revision});
    for (const name of ['localStorage', 'sessionStorage']) {
      try { window[name].setItem(key, value); } catch { /* URL остаётся резервным способом. */ }
    }
    try {
      const url = new URL(location.href);
      url.searchParams.set(parameter, token());
      history.replaceState(history.state, '', url);
    } catch { /* Некоторые браузеры ограничивают history для file://. */ }
    decorateLinks();
  }
  function refresh() {
    const candidates = [fromStorage('localStorage'), fromStorage('sessionStorage'), fromUrl()].filter(Boolean);
    for (const candidate of candidates) {
      if (candidate.revision >= current.revision) current = candidate;
    }
    if (current.revision) persist();
    listeners.forEach(listener => listener({...current.items}));
  }
  window.shopCart = {
    read: () => ({...current.items}),
    save(items) {
      const normalized = normalize(items);
      current = {items: normalized?.items || {}, revision: Math.max(Date.now(), current.revision + 1)};
      persist();
      listeners.forEach(listener => listener({...current.items}));
    },
    subscribe(listener) { listeners.add(listener); },
    refresh
  };
  refresh();
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', event => {
    if (event.key === key && event.newValue) refresh();
  });
  new MutationObserver(decorateLinks).observe(document.body, {childList: true, subtree: true});
})();
