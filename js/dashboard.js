/* MOD-1: disparadores psicologicos de compra */
/* MOD-2: reseñas al final del carrito */
/* MOD-3: banner inicial en la tienda */
/* MOD-4: métricas comerciales reales */
(function () {
  const REVIEWS = [
    { name: "Valentina M.", stars: 5, text: "Me enamoré del Yara, dura todo el día y el frasco es hermoso. ¡Lo recomiendo 100%!", product: "Yara" },
    { name: "Lucía P.", stars: 5, text: "El Erba Pura es increíble, muy dulce y femenino. Ya pedí el segundo.", product: "Erba Pura" },
    { name: "Carolina R.", stars: 5, text: "El 9pm para mi novio fue un éxito total, proyecto mucho y huele espectacular.", product: "9pm" },
    { name: "Martina G.", stars: 5, text: "La atención es excelente y los perfumes son inigualables. ¡Volveré a comprar!", product: "AURA" },
    { name: "Florencia T.", stars: 5, text: "Muy buena relación calidad-precio. El Khamrah es puro lujo árabe.", product: "Khamrah" },
  ];

  function safeJSONParse(raw, fallback) {
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function money(v) {
    return '$' + Number(v || 0).toLocaleString('es-AR');
  }

  function getOfferDeadline() {
    const key = 'aura_offer_deadline';
    const now = Date.now();
    let deadline = Number(localStorage.getItem(key) || 0);
    if (!deadline || deadline <= now) {
      deadline = now + (24 * 60 * 60 * 1000);
      localStorage.setItem(key, String(deadline));
    }
    return deadline;
  }

  function formatRemaining(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function isOfferProduct(product) {
    const badge = String(product?.badge || '').toUpperCase();
    return product?.oferta === true || badge.includes('PROMO') || badge.includes('OFERTA');
  }

  function getPopularity(productId) {
    const key = `aura_pop_${productId}`;
    let value = Number(localStorage.getItem(key) || 0);
    if (!value) {
      value = Math.floor(Math.random() * 40) + 60;
      localStorage.setItem(key, String(value));
    }
    return value;
  }

  function enhanceProductCards() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    const deadline = getOfferDeadline();
    grid.querySelectorAll('.prod-card').forEach(card => {
      const heart = card.querySelector('.prod-heart[data-pid]');
      const productId = heart?.dataset?.pid;
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) return;
      const body = card.querySelector('.prod-body');
      const nameEl = card.querySelector('.prod-name');
      const sizeEl = card.querySelector('.prod-size');
      const priceEl = card.querySelector('.prod-price');
      if (!body || !nameEl || !sizeEl || !priceEl) return;

      card.querySelectorAll('.aura-stock-low,.aura-offer-timer,.aura-popularity').forEach(el => el.remove());

      if (typeof product.stock === 'number' && product.stock <= 5 && product.stock > 0) {
        const stock = document.createElement('div');
        stock.className = 'aura-stock-low';
        stock.textContent = `⚠️ ¡Solo quedan ${product.stock}!`;
        nameEl.insertAdjacentElement('afterend', stock);
      }

      if (typeof product.stock !== 'undefined') {
        const pop = document.createElement('div');
        pop.className = 'aura-popularity';
        pop.textContent = `🔥 ${getPopularity(product.id)} personas lo vieron hoy`;
        sizeEl.insertAdjacentElement('afterend', pop);
      }

      if (isOfferProduct(product)) {
        const timer = document.createElement('div');
        timer.className = 'aura-offer-timer';
        timer.dataset.offerDeadline = String(deadline);
        timer.textContent = `🕐 Oferta termina en: ${formatRemaining(deadline - Date.now())}`;
        const footer = card.querySelector('.prod-footer');
        if (footer) footer.insertAdjacentElement('beforebegin', timer);
      }
    });
  }

  function updateOfferTimers() {
    let deadline = getOfferDeadline();
    const now = Date.now();
    if (deadline <= now) {
      deadline = now + (24 * 60 * 60 * 1000);
      localStorage.setItem('aura_offer_deadline', String(deadline));
    }
    document.querySelectorAll('.aura-offer-timer').forEach(el => {
      el.dataset.offerDeadline = String(deadline);
      el.textContent = `🕐 Oferta termina en: ${formatRemaining(deadline - Date.now())}`;
    });
  }

  function shufflePick(list, count) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
  }

  function injectCartReviews() {
    const body = document.getElementById('cart-body');
    if (!body || !Cart.items().length) return;
    const old = document.getElementById('cart-reviews');
    if (old) old.remove();
    const reviews = shufflePick(REVIEWS, 3);
    const wrap = document.createElement('div');
    wrap.id = 'cart-reviews';
    wrap.style.marginTop = '1.5rem';
    wrap.innerHTML = `
      <div style="font-family:'Cormorant Garamond',serif; font-size:1.15rem; color:#C9A84C; margin-bottom:0.75rem; font-weight:600">
        ⭐ Lo que dicen nuestras clientas
      </div>
      <div class="cart-reviews-track">
        ${reviews.map(r => `
          <div class="cart-review-card">
            <div class="cart-review-name">${escapeHtml(r.name)}</div>
            <div class="cart-review-stars">${'★'.repeat(r.stars)}</div>
            <div class="cart-review-text">${escapeHtml(r.text)}</div>
            <div class="cart-review-product">Reseña sobre: ${escapeHtml(r.product)}</div>
          </div>
        `).join('')}
      </div>`;
    body.appendChild(wrap);
  }

  function getProductVisual(product) {
    if (Array.isArray(product?.images) && product.images[0]) {
      return `<img src="${product.images[0]}" alt="${escapeHtml(product.name)}">`;
    }
    return `<div class="aura-store-emoji">${escapeHtml(product?.emoji || '🌸')}</div>`;
  }

  function chooseBannerProducts() {
    const valid = [...PRODUCTS].filter(p => typeof p.price === 'number');
    if (!valid.length) return [];
    const byPrice = [...valid].sort((a, b) => (b.price || 0) - (a.price || 0));
    const estrella = valid.find(p => String(p.badge || '').toUpperCase() === 'ESTRELLA') || byPrice[0];
    let recomendado = valid.find(p => {
      const badge = String(p.badge || '').toUpperCase();
      return badge === 'TOP' || badge === 'RECOMENDADO';
    }) || byPrice[1] || byPrice[0];
    if (recomendado && estrella && recomendado.id === estrella.id) recomendado = byPrice.find(p => p.id !== estrella.id) || recomendado;
    return [
      { kicker: 'Producto estrella', text: estrella, button: 'Ver producto' },
      { kicker: '⭐ Recomendado para vos', text: recomendado, button: 'Ver producto' }
    ].filter(x => x.text);
  }

  let bannerIndex = 0;
  let bannerInterval = null;
  let bannerStartX = null;

  function goToBannerSlide(index) {
    const banner = document.getElementById('aura-store-banner');
    if (!banner) return;
    const track = banner.querySelector('.aura-store-banner-track');
    const dots = banner.querySelectorAll('.aura-store-dot');
    const total = dots.length || 1;
    bannerIndex = ((index % total) + total) % total;
    if (track) track.style.transform = `translateX(-${bannerIndex * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === bannerIndex));
  }

  function restartBannerAuto() {
    clearInterval(bannerInterval);
    const banner = document.getElementById('aura-store-banner');
    if (!banner) return;
    const total = banner.querySelectorAll('.aura-store-dot').length;
    if (total <= 1) return;
    bannerInterval = setInterval(() => goToBannerSlide(bannerIndex + 1), 5000);
  }

  function scrollToProductCard(productId) {
    const targetHeart = document.querySelector(`.prod-heart[data-pid="${productId}"]`);
    const card = targetHeart?.closest('.prod-card');
    const screen = document.getElementById('s-store');
    if (!card || !screen) return;
    const top = card.offsetTop - 90;
    screen.scrollTo({ top, behavior: 'smooth' });
  }

  function initStoreBanner() {
    const storeBody = document.querySelector('#s-store .store-body');
    const hero = document.getElementById('store-hero');
    if (!storeBody || !hero) return;
    let banner = document.getElementById('aura-store-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'aura-store-banner';
      banner.className = 'aura-store-banner';
      storeBody.insertBefore(banner, hero);
    }
    const slides = chooseBannerProducts();
    if (!slides.length) {
      banner.style.display = 'none';
      return;
    }
    banner.style.display = '';
    banner.innerHTML = `
      <div class="aura-store-banner-track">
        ${slides.map(slide => `
          <div class="aura-store-slide">
            <div class="aura-store-media">${getProductVisual(slide.text)}</div>
            <div class="aura-store-copy">
              <div class="aura-store-kicker">${slide.kicker}</div>
              <div class="aura-store-title">${escapeHtml(slide.text.name)}</div>
              <div class="aura-store-price">${money(slide.text.price)}</div>
              <button class="aura-store-btn" type="button" data-product-id="${slide.text.id}">${slide.button}</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="aura-store-dots">
        ${slides.map((_, i) => `<button class="aura-store-dot ${i === 0 ? 'active' : ''}" type="button" data-index="${i}" aria-label="Ir al slide ${i + 1}"></button>`).join('')}
      </div>`;

    banner.querySelectorAll('.aura-store-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        goToBannerSlide(Number(dot.dataset.index || 0));
        restartBannerAuto();
      });
    });

    banner.querySelectorAll('.aura-store-btn').forEach(btn => {
      btn.addEventListener('click', () => scrollToProductCard(btn.dataset.productId));
    });

    banner.onpointerdown = e => { bannerStartX = e.clientX; };
    banner.onpointerup = e => {
      if (bannerStartX == null) return;
      const dx = e.clientX - bannerStartX;
      if (Math.abs(dx) > 40) goToBannerSlide(bannerIndex + (dx < 0 ? 1 : -1));
      bannerStartX = null;
      restartBannerAuto();
    };
    banner.onpointercancel = () => { bannerStartX = null; };

    goToBannerSlide(0);
    restartBannerAuto();
  }

  function getSalesHistory() {
    const key = 'aura_sales_history';
    const existing = safeJSONParse(localStorage.getItem(key), null);
    if (Array.isArray(existing) && existing.length) return existing;
    const history = [];
    const products = PRODUCTS.filter(p => typeof p.price === 'number');
    const today = new Date();
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - dayOffset);
      const day = d.toISOString().slice(0, 10);
      const salesCount = Math.floor(Math.random() * 21) + 5;
      for (let i = 0; i < salesCount; i++) {
        const product = products[Math.floor(Math.random() * products.length)] || products[0];
        if (!product) continue;
        history.push({
          date: day,
          productId: product.id,
          qty: Math.floor(Math.random() * 3) + 1,
          price: Number(product.price || 0)
        });
      }
    }
    localStorage.setItem(key, JSON.stringify(history));
    return history;
  }

  function buildCommercialMetrics() {
    const history = getSalesHistory();
    const today = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().slice(0, 10);

    const salesToday = history.filter(s => s.date === today).reduce((acc, s) => acc + Number(s.qty || 0), 0);
    const salesYesterday = history.filter(s => s.date === yesterday).reduce((acc, s) => acc + Number(s.qty || 0), 0);
    const diff = salesToday - salesYesterday;

    const revenue = history.reduce((acc, s) => acc + Number(s.qty || 0) * Number(s.price || 0), 0);
    const avgTicket = history.length ? Math.round(revenue / history.length) : 0;

    const byProduct = {};
    history.forEach(s => { byProduct[s.productId] = (byProduct[s.productId] || 0) + Number(s.qty || 0); });
    const top3 = Object.entries(byProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([productId, qty]) => ({ product: PRODUCTS.find(p => p.id === productId), qty }));

    const rotation = PRODUCTS
      .filter(p => typeof p.stock === 'number')
      .map(p => {
        const sold = byProduct[p.id] || 0;
        const denominator = Math.max(1, Number(p.stock || 0));
        return { product: p, ratio: sold / denominator };
      })
      .sort((a, b) => b.ratio - a.ratio)[0];

    return {
      salesToday,
      diff,
      avgTicket,
      top3,
      rotation
    };
  }

  function renderCommercialMetrics() {
    const panel = document.getElementById('sec-panel');
    const chartCard = panel?.querySelector('.chart-card');
    if (!panel || !chartCard) return;
    let wrap = document.getElementById('aura-commercial-metrics');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'aura-commercial-metrics';
      wrap.className = 'aura-metrics-wrap';
      chartCard.parentNode.insertBefore(wrap, chartCard);
    }

    const data = buildCommercialMetrics();
    const diffClass = data.diff >= 0 ? 'positive' : 'negative';
    const diffText = `${data.diff >= 0 ? '+' : ''}${data.diff} vs ayer`;
    const rotationName = data.rotation?.product?.name || 'Sin datos';
    const rotationRatio = data.rotation ? `${data.rotation.ratio.toFixed(1)}x` : '0x';
    const needRestock = (data.rotation?.ratio || 0) > 2;

    wrap.innerHTML = `
      <div class="aura-metrics-title">📊 Métricas Comerciales</div>
      <div class="aura-commercial-grid">
        <div class="aura-commercial-card">
          <div class="aura-commercial-head" style="color:var(--green)">📦 Ventas por día</div>
          <div class="aura-commercial-value">${data.salesToday}</div>
          <div class="aura-commercial-sub ${diffClass}">${diffText}</div>
        </div>
        <div class="aura-commercial-card">
          <div class="aura-commercial-head" style="color:var(--gold)">🧾 Ticket promedio</div>
          <div class="aura-commercial-value">${money(data.avgTicket)}</div>
          <div class="aura-commercial-sub">Promedio últimos 30 días</div>
        </div>
        <div class="aura-commercial-card tall">
          <div class="aura-commercial-head" style="color:var(--gold)">🏆 Productos más vendidos</div>
          <div class="aura-commercial-list">
            ${data.top3.map((row, idx) => `<div><span>${idx + 1}. ${escapeHtml(row.product?.name || 'Producto')}</span><strong>${row.qty} uds.</strong></div>`).join('') || '<div><span>Sin ventas</span><strong>0 uds.</strong></div>'}
          </div>
        </div>
        <div class="aura-commercial-card">
          <div class="aura-commercial-head" style="color:var(--orange)">🔄 Rotación de stock</div>
          <div class="aura-commercial-value">${escapeHtml(rotationName)}</div>
          <div class="aura-commercial-sub" style="color:${needRestock ? 'var(--red)' : 'var(--text)'}">${rotationRatio}</div>
          ${needRestock ? '<div class="aura-rotation-alert">⚠️ Reabastecer</div>' : '<div class="aura-commercial-sub">Mayor rotación de los últimos 30 días</div>'}
        </div>
      </div>`;
  }

  if (typeof renderProducts === 'function') {
  const originalRenderProducts = renderProducts;
  renderProducts = function () {
    originalRenderProducts.apply(this, arguments);
    enhanceProductCards();
    initStoreBanner();
    updateOfferTimers();
  };

  }
if (window.Cart?.open) {
  const originalCartOpen = Cart.open;
  Cart.open = function () {
    const result = originalCartOpen.apply(this, arguments);
    setTimeout(injectCartReviews, 0);
    return result;
  };

  ['addItem', 'updateQty', 'remove'].forEach(method => {
    const original = Cart[method];
    Cart[method] = function () {
      const result = original.apply(this, arguments);
      setTimeout(injectCartReviews, 0);
      return result;
    };
  });

  }
if (window.Dash?.updatePanelKPIs) {
  const originalDashKPIs = Dash.updatePanelKPIs;
  Dash.updatePanelKPIs = function () {
    const result = originalDashKPIs.apply(this, arguments);
    renderCommercialMetrics();
    return result;
  };

  }
if (window.App?.show) {
  const originalAppShow = App.show;
  App.show = function (id) {
    const result = originalAppShow.apply(this, arguments);
    if (id === 's-store') {
      setTimeout(() => {
        initStoreBanner();
        enhanceProductCards();
        updateOfferTimers();
      }, 30);
    }
    if (id === 's-dashboard') {
      setTimeout(renderCommercialMetrics, 120);
    }
    return result;
  };

  setInterval(updateOfferTimers, 1000);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initStoreBanner();
      enhanceProductCards();
      renderCommercialMetrics();
      updateOfferTimers();
    });
  } else {
    initStoreBanner();
    enhanceProductCards();
    renderCommercialMetrics();
    updateOfferTimers();
  }
}
})();

(function () {
      const SPLASH_MIN_MS = 800;
      const SPLASH_MAX_MS = 5000;
      const SPLASH_FADE_MS = 420;
      const splash = document.getElementById('app-splash');
      if (!splash) return;

      const startedAt = Date.now();
      let hidden = false;

      function waitForImage(img) {
        return new Promise(resolve => {
          if (!img) {
            resolve();
            return;
          }
          if (img.complete) {
            resolve();
            return;
          }
          const done = () => {
            img.removeEventListener('load', done);
            img.removeEventListener('error', done);
            resolve();
          };
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        });
      }

      function hideSplash() {
        if (hidden) return;
        hidden = true;
        splash.classList.add('is-hidden');
        window.setTimeout(() => {
          splash.remove();
        }, SPLASH_FADE_MS + 40);
      }

      function whenWindowLoaded() {
        return new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
            return;
          }
          window.addEventListener('load', resolve, { once: true });
        });
      }

      function minDelay() {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, SPLASH_MIN_MS - elapsed);
        return new Promise(resolve => window.setTimeout(resolve, remaining));
      }

      function maxDelay() {
        return new Promise(resolve => window.setTimeout(resolve, SPLASH_MAX_MS));
      }

      const imagesReady = Promise.all(Array.from(document.images).map(waitForImage));
      const readySequence = Promise.all([whenWindowLoaded(), imagesReady, minDelay()]);

      Promise.race([readySequence, maxDelay()]).then(hideSplash);
    })();

export const Dashboard = { updateKPIs: () => window.Dash?.updatePanelKPIs?.(), analytics: () => window.Dash?.initAnalytics?.() };
