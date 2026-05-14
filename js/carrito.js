(function(){
      window.getAssignedPromoIds = function(product) {
        if (!product) return [];
        const activePromos = typeof getActivePromos === 'function' ? getActivePromos() : [];
        const activeIds = new Set(activePromos.map(p => p.id));
        const manual = Array.isArray(product.promoAssignments)
          ? [...new Set(product.promoAssignments)].filter(id => activeIds.has(id))
          : [];
        const productText = `${product.name || ''} ${product.size || ''}`.toLowerCase();
        const autoMatched = activePromos
          .filter(promo => {
            if (!promo.sizeMatch || !promo.sizeMatch.trim()) return false;
            return productText.includes(promo.sizeMatch.trim().toLowerCase());
          })
          .map(p => p.id);
        return [...new Set([...manual, ...autoMatched])];
      };

      window.getCartActiveDiscounts = function(cartItems) {
        const items = Array.isArray(cartItems) ? cartItems : [];
        let totalDiscount = 0;
        const discountLines = [];
        if (!items.length || typeof getActivePromos !== 'function') {
          return { totalDiscount, discountLines };
        }
        for (const promo of getActivePromos()) {
          const promoItems = items.filter(item => {
            if (!item || item._isPromo) return false;
            const product = Array.isArray(PRODUCTS) ? PRODUCTS.find(p => p.id === item.id) : null;
            return window.getAssignedPromoIds(product).includes(promo.id);
          });
          const totalQtyForPromo = promoItems.reduce((sum, item) => sum + Number(item.qty || 0), 0);
          if (totalQtyForPromo === 0) continue;
          const discount = typeof getPromoDiscount === 'function'
            ? getPromoDiscount(promo, totalQtyForPromo)
            : null;
          if (discount && discount.saved > 0) {
            totalDiscount += Number(discount.saved || 0);
            discountLines.push({ promo, discount, qtyMatched: totalQtyForPromo });
          }
        }
        return { totalDiscount, discountLines };
      };

      window.getCartActiveDiscount = function(cartItems){
        const aggregated = window.getCartActiveDiscounts(cartItems);
        if (!aggregated.discountLines.length) return null;
        const first = aggregated.discountLines[0];
        return {
          promo: first.promo,
          tier: first.discount.tier,
          saved: first.discount.saved,
          qty: first.discount.tier?.qty || 0
        };
      };

      window.checkPromoEligibilityForProduct = function(product){
        const promoIds = window.getAssignedPromoIds(product);
        if (!promoIds.length || !window.Cart || typeof Cart.items !== 'function') return;
        const cartItems = Cart.items();
        for (const promoId of promoIds) {
          const promo = (typeof getActivePromos === 'function' ? getActivePromos() : []).find(p => p.id === promoId);
          if (!promo) continue;
          const totalQty = cartItems.reduce((sum, item) => {
            if (!item || item._isPromo) return sum;
            const p = Array.isArray(PRODUCTS) ? PRODUCTS.find(x => x.id === item.id) : null;
            return window.getAssignedPromoIds(p).includes(promoId) ? sum + Number(item.qty || 0) : sum;
          }, 0);
          const discount = typeof getPromoDiscount === 'function' ? getPromoDiscount(promo, totalQty) : null;
          if (discount && discount.saved > 0 && typeof showPromoDiscountToast === 'function') {
            showPromoDiscountToast(promo, discount);
            return;
          }
        }
      };

      function syncPromoBadgesAndButtons(){
        const activePromos = typeof getActivePromos === 'function' ? getActivePromos() : [];
        const activePromoMap = new Map(activePromos.map(p => [p.id, p]));

        document.querySelectorAll('.prod-card').forEach(card => {
          const heart = card.querySelector('.prod-heart[data-pid]');
          const pid = heart?.dataset?.pid;
          if (!pid) return;

          const product = Array.isArray(PRODUCTS) ? PRODUCTS.find(p => p.id === pid) : null;
          if (!product) return;

          const thumb = card.querySelector('.prod-thumb');
          const footer = card.querySelector('.prod-footer');
          if (!thumb || !footer) return;

          thumb.querySelector('.prod-promo-badge-img')?.remove();
          footer.querySelector('.prod-promo-btn')?.remove();

          const assignedPromos = window.getAssignedPromoIds(product)
            .map(id => activePromoMap.get(id))
            .filter(Boolean);

          if (!assignedPromos.length) return;

          const badge = document.createElement('div');
          badge.className = 'prod-promo-badge-img';
          badge.innerHTML = assignedPromos.length > 1
            ? '🎁 PROMO <span class="promo-badge-count">' + assignedPromos.length + '</span>'
            : '🎁 PROMO';
          thumb.appendChild(badge);

          const btn = document.createElement('button');
          btn.className = 'prod-promo-btn';
          btn.type = 'button';
          btn.innerHTML = assignedPromos.length > 1 ? 'Ver promos' : 'Ver promo';
          btn.onclick = function(event){
            event.stopPropagation();
            if (typeof PromoModal !== 'undefined' && PromoModal && typeof PromoModal.open === 'function') {
              PromoModal.open(assignedPromos[0].id);
            }
          };

          const addBtn = footer.querySelector('.prod-atc');
          if (addBtn) footer.insertBefore(btn, addBtn);
          else footer.appendChild(btn);
        });
      }

      function patchCartTotals(){
        if (!window.Cart || Cart.__promoPatchApplied) return;
        Cart.__promoPatchApplied = true;

        if (typeof Cart.addItem === 'function') {
          const originalAddItem = Cart.addItem;
          Cart.addItem = function(){
            const result = originalAddItem.apply(this, arguments);
            setTimeout(syncPromoBadgesAndButtons, 40);
            return result;
          };
        }

        if (typeof Cart.updateQty === 'function') {
          const originalUpdateQty = Cart.updateQty;
          Cart.updateQty = function(){
            const result = originalUpdateQty.apply(this, arguments);
            setTimeout(() => {
              if (typeof checkPromoEligibility === 'function') checkPromoEligibility();
            }, 50);
            return result;
          };
        }

        if (typeof Cart.remove === 'function') {
          const originalRemove = Cart.remove;
          Cart.remove = function(){
            const result = originalRemove.apply(this, arguments);
            setTimeout(() => {
              if (typeof checkPromoEligibility === 'function') checkPromoEligibility();
            }, 50);
            return result;
          };
        }
      }

      function patchRenderProducts(){
        if (typeof window.renderProducts !== 'function' || window.renderProducts.__promoPatchApplied) return;
        const originalRenderProducts = window.renderProducts;
        const wrapped = function(){
          const result = originalRenderProducts.apply(this, arguments);
          setTimeout(syncPromoBadgesAndButtons, 40);
          return result;
        };
        wrapped.__promoPatchApplied = true;
        window.renderProducts = wrapped;
      }

      function patchAppShow(){
        if (!window.App || typeof App.show !== 'function' || App.show.__promoPatchApplied) return;
        const originalShow = App.show;
        const wrapped = function(){
          const result = originalShow.apply(this, arguments);
          setTimeout(syncPromoBadgesAndButtons, 80);
          return result;
        };
        wrapped.__promoPatchApplied = true;
        App.show = wrapped;
      }

      function patchRefreshTotalsMarkup(){
        if (!window.Cart || Cart.__refreshTotalsMarkupPatched) return;
        Cart.__refreshTotalsMarkupPatched = true;

        const observer = new MutationObserver(() => {
          const totalsBox = document.getElementById('cart-totals');
          if (!totalsBox) return;

          totalsBox.querySelectorAll('.cart-discount-row').forEach(row => {
            if (row.querySelector('.cart-discount-meta')) return;
            const label = row.querySelector('.cart-discount-label');
            if (!label) return;
            const raw = label.textContent || '';
            const promoName = raw.replace(/^Descuento promo\s*/i, '').replace(/^Ahorraste\s+\$?[\d\.,]+\s+con\s+/i, '').trim();
            const promo = (typeof getActivePromos === 'function' ? getActivePromos() : []).find(p => p.name === promoName);
            if (!promo || !promo.tiers?.length) return;
            const matched = Cart.items().reduce((sum, item) => {
              const product = Array.isArray(PRODUCTS) ? PRODUCTS.find(p => p.id === item.id) : null;
              return window.getAssignedPromoIds(product).includes(promo.id) ? sum + Number(item.qty || 0) : sum;
            }, 0);
            const discount = typeof getPromoDiscount === 'function' ? getPromoDiscount(promo, matched) : null;
            if (!discount?.tier) return;
            const meta = document.createElement('span');
            meta.className = 'cart-discount-meta';
            meta.textContent = 'Aplicada con ' + discount.tier.qty + ' unidades';
            label.appendChild(meta);
          });
        });

        const cartTotals = document.getElementById('cart-totals');
        if (cartTotals) observer.observe(cartTotals, { childList: true, subtree: true });
      }

      function init(){
        patchRenderProducts();
        patchAppShow();
        patchCartTotals();
        patchRefreshTotalsMarkup();
        syncPromoBadgesAndButtons();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();

(function () {
      const COUPONS = { AURA10: 10, AURA15: 15 };
      const STORAGE_KEY = 'aura_checkout_state_v1';
      const FIELD_CONFIG_KEY = 'aura_checkout_field_config';
      const DEFAULT_FIELD_CONFIG = {
        name: { label: 'Nombre', group: 'Datos personales', enabled: true, required: true },
        phone: { label: 'Telefono', group: 'Datos personales', enabled: true, required: true },
        email: { label: 'Email', group: 'Datos personales', enabled: false, required: false },
        postalCode: { label: 'Codigo postal', group: 'Entrega', enabled: true, required: false },
        locality: { label: 'Localidad', group: 'Entrega', enabled: true, required: false },
        address: { label: 'Direccion', group: 'Entrega', enabled: true, required: false },
        notes: { label: 'Aclaraciones del pedido', group: 'Entrega', enabled: true, required: false },
        deliveryMethod: { label: 'Metodo de entrega: Retiro / Envio', group: 'Entrega', enabled: true, required: true },
        marketingOptIn: { label: 'Quiero recibir ofertas y novedades por e-mail', group: 'Marketing', enabled: false, required: false },
        coupon: { label: 'Mostrar cupon de descuento', group: 'Cupon', enabled: true, required: false },
        paymentMethod: { label: 'Seleccion de metodo de pago', group: 'Pago', enabled: true, required: true }
      };
      let addedBarTimer = null;
      let checkoutOpen = false;
      let checkoutStep = 1;
      let checkoutState = loadCheckoutState();
      let checkoutFieldConfig = loadCheckoutFieldConfig();

      function money(value) {
        return '$' + Number(value || 0).toLocaleString('es-AR');
      }

      function auraEscape(value) {
        return String(value ?? '').replace(/[&<>"']/g, ch => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]));
      }

      function firstImage(product) {
        return Array.isArray(product?.images) && product.images.length ? product.images[0] : '';
      }

      function renderProductPaymentInfo(product) {
        const stock = Number(product.stock ?? 0);
        return stock === 1
          ? '<div class="aura-stock-alert">&#161;No te lo pierdas, es el &uacute;ltimo!</div>'
          : (stock > 1 && stock <= 3 ? `<div class="aura-stock-alert">&#161;Solo quedan ${stock} en stock!</div>` : '');
      }

      function enhanceProductCards() {
        const grid = document.getElementById('product-grid');
        if (!grid || !Array.isArray(PRODUCTS)) return;
        grid.classList.add('aura-enhanced-products');
        grid.querySelectorAll('.prod-card:not(.promo-card)').forEach(card => {
          const heart = card.querySelector('.prod-heart[data-pid]');
          const productId = heart?.dataset?.pid || '';
          const product = PRODUCTS.find(p => p.id === productId);
          if (!product) return;
          card.querySelectorAll('.aura-product-pay-info,.aura-stock-alert').forEach(el => el.remove());
          const priceEl = card.querySelector('.prod-price');
          const addBtn = card.querySelector('.prod-atc');
          if (priceEl) {
            priceEl.textContent = money(product.price);
            priceEl.insertAdjacentHTML('afterend', renderProductPaymentInfo(product));
          }
          if (addBtn) {
            addBtn.textContent = 'Comprar';
            addBtn.setAttribute('aria-label', 'Comprar ' + product.name);
          }
        });
      }

      function ensureAddedCartBar() {
        let bar = document.getElementById('aura-added-cart-bar');
        if (bar) return bar;
        bar = document.createElement('div');
        bar.id = 'aura-added-cart-bar';
        bar.className = 'aura-added-cart-bar';
        bar.setAttribute('aria-live', 'polite');
        document.body.appendChild(bar);
        return bar;
      }

      function showAddedToCartBar(product, qty) {
        const bar = ensureAddedCartBar();
        const image = firstImage(product);
        const name = product?.name || 'Producto';
        const price = Number(product?.price || 0);
        bar.innerHTML = `
          <div class="aura-added-thumb">${image ? `<img src="${auraEscape(image)}" alt="${auraEscape(name)}">` : auraEscape(product?.emoji || 'A')}</div>
          <div>
            <div class="aura-added-name">${auraEscape(name)}</div>
            <div class="aura-added-meta">${Number(qty || 1)} x ${money(price)}</div>
            <div class="aura-added-strong">&#161;Agregado al carrito!</div>
          </div>
          <button class="aura-added-close" type="button" aria-label="Cerrar" onclick="hideAddedToCartBar()">&#215;</button>`;
        bar.classList.remove('show');
        void bar.offsetWidth;
        bar.classList.add('show');
        clearTimeout(addedBarTimer);
        addedBarTimer = setTimeout(hideAddedToCartBar, 3600);
      }

      function hideAddedToCartBar() {
        document.getElementById('aura-added-cart-bar')?.classList.remove('show');
      }

      function defaultCheckoutState() {
        return {
          detailsOpen: false,
          couponOpen: false,
          couponCode: '',
          couponPercent: 0,
          couponError: '',
          email: '',
          wantsNews: false,
          name: '',
          phone: '',
          deliveryType: 'retiro',
          postalCode: '',
          locality: '',
          address: '',
          notes: '',
          zoneId: '',
          paymentMethod: 'transferencia'
        };
      }

      function loadCheckoutState() {
        try {
          return { ...defaultCheckoutState(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}) };
        } catch (e) {
          return defaultCheckoutState();
        }
      }

      function saveCheckoutState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(checkoutState));
      }

      function normalizeCheckoutFieldConfig(config) {
        const normalized = {};
        Object.entries(DEFAULT_FIELD_CONFIG).forEach(([key, defaults]) => {
          const saved = config?.[key] || {};
          normalized[key] = {
            ...defaults,
            enabled: saved.enabled !== undefined ? !!saved.enabled : defaults.enabled,
            required: saved.required !== undefined ? !!saved.required : defaults.required
          };
          if (key === 'marketingOptIn' || key === 'coupon') normalized[key].required = false;
        });
        return normalized;
      }

      function loadCheckoutFieldConfig() {
        try {
          return normalizeCheckoutFieldConfig(JSON.parse(localStorage.getItem(FIELD_CONFIG_KEY) || '{}'));
        } catch (e) {
          return normalizeCheckoutFieldConfig({});
        }
      }

      function saveCheckoutFieldConfig() {
        localStorage.setItem(FIELD_CONFIG_KEY, JSON.stringify(checkoutFieldConfig));
      }

      function isFieldEnabled(key) {
        return checkoutFieldConfig[key]?.enabled !== false;
      }

      function isFieldRequired(key) {
        return isFieldEnabled(key) && checkoutFieldConfig[key]?.required === true;
      }

      function getCheckoutItems() {
        return (typeof Cart !== 'undefined' && typeof Cart.items === 'function') ? Cart.items() : [];
      }

      function getPromoDiscounts() {
        try {
          if (typeof getCartActiveDiscounts === 'function') return getCartActiveDiscounts(getCheckoutItems());
          if (window.getCartActiveDiscounts) return window.getCartActiveDiscounts(getCheckoutItems());
        } catch (e) { }
        return { totalDiscount: 0, discountLines: [] };
      }

      function readCartInputValue(id) {
        return String(document.getElementById(id)?.value || '').trim();
      }

      function syncCheckoutStateFromCart() {
        checkoutState = { ...defaultCheckoutState(), ...loadCheckoutState() };
        const cartName = readCartInputValue('order-name');
        const cartPhone = readCartInputValue('order-phone');
        const cartNotes = readCartInputValue('order-notes');
        const cartAddress = readCartInputValue('cust-addr');
        if (cartName) checkoutState.name = cartName;
        if (cartPhone) checkoutState.phone = cartPhone;
        if (cartNotes) checkoutState.notes = cartNotes;
        if (cartAddress) {
          checkoutState.address = cartAddress;
          checkoutState.deliveryType = 'envio';
        }
        saveCheckoutState();
      }

      function getCheckoutShippingZones() {
        const zones = Array.isArray(STORE?.shippingZones) ? STORE.shippingZones : [];
        const cleanZones = zones
          .filter(zone => zone && zone.name)
          .map(zone => ({
            id: String(zone.id || zone.name).toLowerCase().replace(/\s+/g, '-'),
            name: zone.name,
            price: Number(zone.price || 0)
          }));
        return cleanZones.length ? cleanZones : [
          { id: 'cipolletti', name: 'Cipolletti', price: 1500 },
          { id: 'neuquen', name: 'Neuquén', price: 3000 },
          { id: 'fernandez-oro', name: 'Fernández Oro', price: 3000 }
        ];
      }

      function getSelectedCheckoutZone() {
        return getCheckoutShippingZones().find(zone => zone.id === checkoutState.zoneId) || null;
      }

      function getOrderTotals() {
        const items = getCheckoutItems();
        const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
        const promo = getPromoDiscounts();
        const promoDiscount = Number(promo.totalDiscount || 0);
        const baseTotal = Math.max(0, subtotal - promoDiscount);
        const cartTotal = (typeof Cart !== 'undefined' && typeof Cart.total === 'function')
          ? Number(Cart.total() || 0)
          : baseTotal;
        const cartShipping = Math.max(0, cartTotal - baseTotal);
        const selectedZone = getSelectedCheckoutZone();
        const shipping = selectedZone ? Number(selectedZone.price || 0) : cartShipping;
        const totalBeforeCoupon = Math.max(0, baseTotal + shipping);
        const couponBase = Math.max(0, subtotal - promoDiscount);
        const couponDiscount = isFieldEnabled('coupon') && checkoutState.couponPercent
          ? Math.round(couponBase * (Number(checkoutState.couponPercent) / 100))
          : 0;
        const shippingLabel = selectedZone
          ? `${selectedZone.name} - ${money(selectedZone.price)}`
          : (shipping > 0
            ? money(shipping)
            : (checkoutState.deliveryType === 'retiro' ? 'Retiro coordinado por WhatsApp' : 'A coordinar por WhatsApp'));
        return {
          items,
          subtotal,
          promoDiscount,
          promoLines: promo.discountLines || [],
          couponDiscount,
          shipping,
          shippingLabel,
          selectedZone,
          cartTotal: totalBeforeCoupon,
          total: Math.max(0, totalBeforeCoupon - couponDiscount)
        };
      }

      const getCheckoutTotals = getOrderTotals;

      function normalizeCheckoutStep(step) {
        return Math.max(1, Math.min(3, Number(step) || 1));
      }

      function getCheckoutPanel() {
        return document.getElementById('checkoutModal') || document.getElementById('aura-checkout-panel');
      }

      function ensureCheckout() {
        let overlay = document.getElementById('aura-checkout-overlay');
        let panel = getCheckoutPanel();
        if (overlay && panel) return { overlay, panel };

        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'aura-checkout-overlay';
          overlay.className = 'aura-checkout-overlay';
          overlay.dataset.action = 'close-checkout';
          document.body.appendChild(overlay);
        } else {
          overlay.dataset.action = 'close-checkout';
        }

        if (!panel) {
          panel = document.createElement('section');
          document.body.appendChild(panel);
        }
        panel.id = 'checkoutModal';
        panel.classList.add('aura-checkout-panel');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Checkout AURA');
        panel.setAttribute('aria-hidden', 'true');
        return { overlay, panel };
      }

      function hideLegacyCartPanel() {
        document.getElementById('cart-overlay')?.classList.remove('open', 'peek');
        document.getElementById('cart-panel')?.classList.remove('open', 'peek');
        if (typeof Cart !== 'undefined' && typeof Cart.closeSuggestions === 'function') {
          try { Cart.closeSuggestions(); } catch (e) { }
        }
      }

      function renderCheckout() {
        checkoutFieldConfig = loadCheckoutFieldConfig();
        syncCheckoutStateFromCart();
      }

      function openCheckout(options = {}) {
        const wasOpen = checkoutOpen;
        const { overlay, panel } = ensureCheckout();
        checkoutOpen = true;
        if (!wasOpen && options.resetStep !== false) checkoutStep = 1;
        if (options.step) checkoutStep = normalizeCheckoutStep(options.step);
        renderCheckout();
        hideLegacyCartPanel();
        overlay.classList.add('open', 'is-open');
        panel.classList.add('open', 'is-open');
        panel.setAttribute('aria-hidden', 'false');
        document.body.classList.add('checkout-open');
        document.body.style.overflow = 'hidden';
        renderCheckoutStep(checkoutStep);
      }

      function closeCheckout() {
        checkoutOpen = false;
        const overlay = document.getElementById('aura-checkout-overlay');
        const panel = getCheckoutPanel();
        overlay?.classList.remove('open', 'is-open');
        panel?.classList.remove('open', 'is-open');
        panel?.setAttribute('aria-hidden', 'true');
        hideLegacyCartPanel();
        document.body.classList.remove('checkout-open');
        document.body.style.overflow = '';
      }

      function renderStepper() {
        const labels = ['Carrito', 'Entrega', 'Pago'];
        return `<div class="aura-stepper">${labels.map((label, idx) => {
          const stepNumber = idx + 1;
          const state = stepNumber < checkoutStep ? 'done' : (stepNumber === checkoutStep ? 'active' : '');
          const mark = stepNumber < checkoutStep ? '&#10003;' : String(stepNumber);
          return `<div class="aura-step ${state}"><span class="aura-step-mark">${mark}</span><span>${label}</span></div>`;
        }).join('')}</div>`;
      }

      function renderCheckoutSummary() {
        const totals = getCheckoutTotals();
        const caret = `<svg class="aura-summary-caret ${checkoutState.detailsOpen ? 'open' : ''}" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const itemsHTML = checkoutState.detailsOpen ? `
          <div class="aura-summary-body">
            ${totals.items.map(item => {
              const img = firstImage(item);
              return `<div class="aura-summary-item">
                <div class="aura-summary-thumb">${img ? `<img src="${auraEscape(img)}" alt="${auraEscape(item.name)}">` : auraEscape(item.emoji || 'A')}</div>
                <div>
                  <div class="aura-summary-name">${auraEscape(item.name)}</div>
                  <div class="aura-summary-meta">${Number(item.qty || 0)} x ${money(item.price)}</div>
                </div>
                <div class="aura-summary-money">${money(Number(item.price || 0) * Number(item.qty || 0))}</div>
              </div>`;
            }).join('')}
            <div class="aura-summary-row"><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div>
            ${(totals.promoDiscount + totals.couponDiscount) ? `<div class="aura-summary-row discount checkout-discount-row"><span>Beneficio activo · Ahorraste ${money(totals.promoDiscount + totals.couponDiscount)} en esta compra</span><strong>- ${money(totals.promoDiscount + totals.couponDiscount)}</strong></div>` : ''}
            <div class="aura-summary-row"><span>Envio</span><strong>${totals.shipping ? money(totals.shipping) : auraEscape(totals.shippingLabel)}</strong></div>
            <div class="aura-summary-row total"><span>Total final</span><strong>${money(totals.total)}</strong></div>
            ${(totals.promoDiscount + totals.couponDiscount) ? `<div class="checkout-saving-highlight">Tu ahorro total: ${money(totals.promoDiscount + totals.couponDiscount)}</div>` : ''}
          </div>` : '';
        return `<div class="aura-checkout-summary">
          <button class="aura-summary-toggle" type="button" onclick="AuraCheckout.toggleSummary()">
            <span>${caret} Ver detalles de mi compra</span>
            <span class="aura-summary-total">${money(totals.total)}</span>
          </button>
          ${itemsHTML}
        </div>`;
      }

      function renderCouponBlock() {
        if (!isFieldEnabled('coupon')) return '';
        return `<div class="aura-checkout-card">
          <button class="aura-coupon-toggle checkout-coupon-box" type="button" onclick="AuraCheckout.toggleCoupon()">🎁 ¿Tenés un cupón? Sumá más ahorro</button>
          ${checkoutState.couponOpen ? `<div class="aura-coupon-row">
            <input class="aura-input" id="aura-coupon-input" value="${auraEscape(checkoutState.couponCode || '')}" placeholder="AURA10" oninput="AuraCheckout.setField('couponCode', this.value)">
            <button class="aura-btn-secondary" type="button" onclick="applyCheckoutCoupon()">Aplicar</button>
          </div>` : ''}
          <div class="aura-msg ${checkoutState.couponError ? 'error' : (checkoutState.couponPercent ? 'ok' : '')}">
            ${checkoutState.couponError ? auraEscape(checkoutState.couponError) : (checkoutState.couponPercent ? `Cupon ${auraEscape(checkoutState.couponCode)} aplicado: ${checkoutState.couponPercent}% off.` : '')}
          </div>
        </div>`;
      }

      function renderCartStep() {
        const totals = getCheckoutTotals();
        if (!totals.items.length) return '<div class="aura-empty-checkout">Tu carrito esta vacio.</div>';
        return `<div class="aura-checkout-card">
          <div class="aura-checkout-card-title">Tu carrito</div>
          <div class="aura-checkout-card-sub">Revisa productos y cantidades antes de completar los datos de entrega.</div>
          ${totals.items.map(item => `<div class="aura-summary-item" style="margin-bottom:.6rem">
            <div class="aura-summary-thumb">${firstImage(item) ? `<img src="${auraEscape(firstImage(item))}" alt="${auraEscape(item.name)}">` : auraEscape(item.emoji || 'A')}</div>
            <div>
              <div class="aura-summary-name">${auraEscape(item.name)}</div>
              <div class="aura-summary-meta">${money(item.price)} c/u</div>
              <div class="qty-row" style="margin-top:.42rem">
                <button class="qty-btn" type="button" onclick="AuraCheckout.updateQty('${auraEscape(item.id)}',-1)">-</button>
                <span class="qty-val">${Number(item.qty || 0)}</span>
                <button class="qty-btn" type="button" onclick="AuraCheckout.updateQty('${auraEscape(item.id)}',1)">+</button>
                <button class="ci-rm" type="button" onclick="AuraCheckout.removeItem('${auraEscape(item.id)}')">Eliminar</button>
              </div>
            </div>
            <div class="aura-summary-money">${money(Number(item.price || 0) * Number(item.qty || 0))}</div>
          </div>`).join('')}
          <div class="aura-summary-body" style="border-top:1px solid rgba(12,15,26,.08);padding:.75rem 0 0;margin-top:.25rem">
            <div class="aura-summary-row"><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div>
            ${(totals.promoDiscount + totals.couponDiscount) ? `<div class="aura-summary-row discount checkout-discount-row"><span>Beneficio activo · Ahorraste ${money(totals.promoDiscount + totals.couponDiscount)} en esta compra</span><strong>- ${money(totals.promoDiscount + totals.couponDiscount)}</strong></div>` : ''}
            <div class="aura-summary-row"><span>Envio</span><strong>${totals.shipping ? money(totals.shipping) : auraEscape(totals.shippingLabel)}</strong></div>
            <div class="aura-summary-row total"><span>Total</span><strong>${money(totals.total)}</strong></div>
            ${(totals.promoDiscount + totals.couponDiscount) ? `<div class="checkout-saving-highlight">Tu ahorro total: ${money(totals.promoDiscount + totals.couponDiscount)}</div>` : ''}
          </div>
          <div class="aura-checkout-actions">
            <button class="aura-btn-secondary" type="button" data-action="close-checkout">Seguir comprando</button>
            <button class="aura-btn-primary" type="button" onclick="AuraCheckout.next()">Continuar</button>
          </div>
        </div>`;
      }

      function renderDeliveryStep() {
        const shippingZones = getCheckoutShippingZones();
        const contactFields = [
          isFieldEnabled('email') ? fieldHTML('email', 'E-mail', 'email', 'tu@email.com') : '',
          isFieldEnabled('name') ? fieldHTML('name', 'Nombre', 'text', 'Nombre y apellido') : '',
          isFieldEnabled('phone') ? fieldHTML('phone', 'Telefono', 'tel', 'Numero de contacto') : '',
          isFieldEnabled('marketingOptIn') ? `<label class="aura-check full"><input type="checkbox" ${checkoutState.wantsNews ? 'checked' : ''} onchange="AuraCheckout.setField('wantsNews', this.checked)"> Quiero recibir ofertas y novedades por e-mail</label>` : ''
        ].filter(Boolean).join('');
        const deliveryChoices = isFieldEnabled('deliveryMethod') ? `<div class="aura-choice-grid">
            <button class="aura-choice ${checkoutState.deliveryType === 'retiro' ? 'active' : ''}" type="button" onclick="AuraCheckout.setField('deliveryType','retiro', true)"><strong>Retiro</strong><span>Retiro coordinado por WhatsApp.</span></button>
            <button class="aura-choice ${checkoutState.deliveryType === 'envio' ? 'active' : ''}" type="button" onclick="AuraCheckout.setField('deliveryType','envio', true)"><strong>Envio</strong><span>Usa el envio calculado en el carrito o se coordina por WhatsApp.</span></button>
          </div>` : '';
        const zoneChoices = shippingZones.length ? `<div class="aura-field full">
            <label class="aura-label">Selecciona tu zona</label>
            <div class="aura-choice-grid aura-zone-grid">
              ${shippingZones.map(zone => `<button class="aura-choice ${checkoutState.zoneId === zone.id ? 'active' : ''}" type="button" onclick="AuraCheckout.selectZone('${auraEscape(zone.id)}')"><strong>${auraEscape(zone.name)}</strong><span>${money(zone.price)}</span></button>`).join('')}
            </div>
          </div>` : '';
        const deliveryFields = [
          isFieldEnabled('postalCode') ? fieldHTML('postalCode', 'Codigo postal', 'text', 'Ej: 8300') : '',
          isFieldEnabled('locality') ? fieldHTML('locality', 'Localidad', 'text', 'Ciudad o zona') : '',
          isFieldEnabled('address') && (!isFieldEnabled('deliveryMethod') || checkoutState.deliveryType === 'envio') ? fieldHTML('address', 'Direccion', 'text', 'Calle, numero, piso o referencia', true) : '',
          isFieldEnabled('notes') ? fieldHTML('notes', 'Aclaraciones del pedido', 'text', 'Aclaraciones del pedido o entrega', true) : '',
          isFieldEnabled('deliveryMethod') && checkoutState.deliveryType === 'retiro' ? '<div class="aura-msg full">Retiro coordinado por WhatsApp.</div>' : ''
        ].filter(Boolean).join('');
        return `<div class="aura-checkout-card">
          <div class="aura-checkout-card-title">Datos de contacto</div>
          <div class="aura-checkout-card-sub">Estos datos se suman al pedido que se envia por WhatsApp.</div>
          <div class="aura-checkout-form two">
            ${contactFields || '<div class="aura-msg full">No hay campos de contacto activos.</div>'}
          </div>
        </div>
        <div class="aura-checkout-card">
          <div class="aura-checkout-card-title">Entrega</div>
          ${deliveryChoices}
          ${zoneChoices}
          <div class="aura-checkout-form two">
            ${deliveryFields || '<div class="aura-msg full">La entrega se coordina con los datos del carrito.</div>'}
          </div>
          <div class="aura-checkout-actions">
            <button class="aura-btn-secondary" type="button" onclick="AuraCheckout.prev()">Volver</button>
            <button class="aura-btn-primary" type="button" onclick="AuraCheckout.next()">Continuar</button>
          </div>
        </div>`;
      }

      function fieldHTML(key, label, type, placeholder, full) {
        const required = isFieldRequired(key) ? ' *' : '';
        return `<div class="aura-field ${full ? 'full' : ''}">
          <label class="aura-label" for="aura-${key}">${label}${required}</label>
          <input class="aura-input" id="aura-${key}" type="${type}" value="${auraEscape(checkoutState[key] || '')}" placeholder="${auraEscape(placeholder || '')}" oninput="AuraCheckout.setField('${key}', this.value)">
        </div>`;
      }

      function renderPaymentStep() {
        const totals = getCheckoutTotals();
        const paymentChoices = isFieldEnabled('paymentMethod') ? `<div class="aura-choice-grid">
            <button class="aura-choice ${checkoutState.paymentMethod === 'transferencia' ? 'active' : ''}" type="button" onclick="AuraCheckout.setField('paymentMethod','transferencia', true)"><strong>Transferencia o deposito</strong><span>Se envia el pedido para coordinar los datos de pago.</span></button>
            <button class="aura-choice ${checkoutState.paymentMethod === 'whatsapp' ? 'active' : ''}" type="button" onclick="AuraCheckout.setField('paymentMethod','whatsapp', true)"><strong>Coordinar por WhatsApp</strong><span>Definimos pago y entrega por mensaje.</span></button>
          </div>` : '<div class="aura-msg">El pago se coordina por WhatsApp.</div>';
        return `<div class="aura-checkout-card">
          <div class="aura-checkout-card-title">Pago</div>
          <div class="aura-checkout-card-sub">No se cobra online. El pedido se finaliza por WhatsApp con el detalle completo.</div>
          <div class="aura-payment-total"><span>Total final</span><strong>${money(totals.total)}</strong></div>
          ${(totals.promoDiscount + totals.couponDiscount) ? `<div class="checkout-saving-highlight">Tu ahorro total: ${money(totals.promoDiscount + totals.couponDiscount)}</div>` : ''}
          ${paymentChoices}
          <div class="aura-checkout-actions">
            <button class="aura-btn-secondary" type="button" onclick="AuraCheckout.prev()">Volver</button>
            <button class="aura-btn-primary" type="button" onclick="AuraCheckout.finish()">Finalizar pedido por WhatsApp</button>
          </div>
        </div>`;
      }

      function renderCheckoutStep(step) {
        if (step) checkoutStep = normalizeCheckoutStep(step);
        const { panel } = ensureCheckout();
        const body = checkoutStep === 1 ? renderCartStep() : (checkoutStep === 2 ? renderDeliveryStep() : renderPaymentStep());
        panel.innerHTML = `
          <div class="aura-checkout-head">
            <div><div class="aura-checkout-title">Checkout AURA</div><div class="aura-checkout-sub">Carrito - Entrega - Pago</div></div>
            <button class="aura-checkout-close checkout-close" type="button" data-action="close-checkout" aria-label="Cerrar">&#215;</button>
          </div>
          <div class="aura-checkout-scroll">
            ${renderStepper()}
            ${renderCheckoutSummary()}
            ${renderCouponBlock()}
            ${body}
          </div>`;
      }

      function applyCheckoutCoupon() {
        if (!isFieldEnabled('coupon')) return;
        const code = String(checkoutState.couponCode || '').trim().toUpperCase();
        checkoutState.couponCode = code;
        if (!code) {
          checkoutState.couponPercent = 0;
          checkoutState.couponError = 'Ingresa un cupon para aplicar.';
        } else if (COUPONS[code]) {
          checkoutState.couponPercent = COUPONS[code];
          checkoutState.couponError = '';
          checkoutState.couponOpen = true;
        } else {
          checkoutState.couponPercent = 0;
          checkoutState.couponError = 'El cupon ingresado no existe.';
        }
        saveCheckoutState();
        renderCheckoutStep();
      }

      function validateDeliveryStep() {
        if (isFieldRequired('name') && !String(checkoutState.name || '').trim()) return 'Ingresa tu nombre.';
        if (isFieldRequired('email') && !String(checkoutState.email || '').trim()) return 'Ingresa tu e-mail.';
        if (isFieldRequired('phone') && !String(checkoutState.phone || '').trim()) return 'Ingresa tu telefono.';
        if (isFieldRequired('deliveryMethod') && isFieldEnabled('deliveryMethod') && !String(checkoutState.deliveryType || '').trim()) return 'Selecciona retiro o envio.';
        if (getCheckoutShippingZones().length && (!isFieldEnabled('deliveryMethod') || checkoutState.deliveryType === 'envio') && !checkoutState.zoneId) return 'Selecciona una zona de entrega.';
        if (isFieldRequired('postalCode') && !String(checkoutState.postalCode || '').trim()) return 'Ingresa el codigo postal.';
        if (isFieldRequired('locality') && !String(checkoutState.locality || '').trim()) return 'Ingresa la localidad.';
        if (isFieldEnabled('address') && checkoutState.deliveryType === 'envio' && (checkoutFieldConfig.address.required || false) && !String(checkoutState.address || '').trim()) return 'Ingresa la direccion de envio.';
        if (isFieldRequired('notes') && !String(checkoutState.notes || '').trim()) return 'Ingresa las aclaraciones del pedido.';
        return '';
      }

      function buildCheckoutWhatsAppMessage() {
        const totals = getCheckoutTotals();
        const orderId = 'PED-' + Date.now().toString().slice(-6);
        const itemsStr = totals.items.map(item => `- ${item.name} x${item.qty} - ${money(Number(item.price || 0) * Number(item.qty || 0))}`).join('\n');
        const promoText = totals.promoLines.map(({ promo, discount }) => `\nDescuento promo ${promo.name}: -${money(discount.saved)}`).join('');
        const couponText = totals.couponDiscount ? `\nDescuento cupon ${checkoutState.couponCode}: -${money(totals.couponDiscount)}` : '';
        const selectedZone = getSelectedCheckoutZone();
        const deliveryLabel = isFieldEnabled('deliveryMethod')
          ? (checkoutState.deliveryType === 'retiro' ? 'Retiro' : 'Envio')
          : (selectedZone ? 'Envio' : 'A coordinar');
        const addressParts = [
          selectedZone ? `Zona: ${selectedZone.name}` : '',
          isFieldEnabled('address') ? checkoutState.address : '',
          isFieldEnabled('locality') ? checkoutState.locality : '',
          isFieldEnabled('postalCode') ? checkoutState.postalCode : ''
        ].filter(Boolean);
        const address = isFieldEnabled('deliveryMethod') && checkoutState.deliveryType === 'retiro'
          ? 'Retiro coordinado por WhatsApp'
          : (addressParts.join(' - ') || readCartInputValue('cust-addr') || 'A coordinar');
        const notes = [
          isFieldEnabled('email') && checkoutState.email ? `Email: ${checkoutState.email}` : '',
          isFieldEnabled('deliveryMethod') ? `Entrega elegida: ${deliveryLabel}` : '',
          (isFieldEnabled('address') || isFieldEnabled('deliveryMethod')) ? `Direccion/retiro: ${address}` : '',
          isFieldEnabled('notes') && checkoutState.notes ? `Aclaraciones: ${checkoutState.notes}` : '',
          isFieldEnabled('paymentMethod') ? `Metodo de pago: ${checkoutState.paymentMethod === 'transferencia' ? 'Transferencia o deposito' : 'Coordinar por WhatsApp'}` : '',
          isFieldEnabled('marketingOptIn') && checkoutState.wantsNews ? 'Acepta recibir ofertas por e-mail.' : ''
        ].filter(Boolean).join('\n');
        const templateData = {
          tienda: STORE?.waName || 'AURA - Tienda Online',
          pedido_id: orderId,
          nombre: isFieldEnabled('name') && checkoutState.name ? checkoutState.name : 'Cliente sin nombre',
          telefono: isFieldEnabled('phone') && checkoutState.phone ? `\nTelefono: ${checkoutState.phone}` : '',
          productos: itemsStr,
          subtotal: money(totals.subtotal),
          metodo_envio: deliveryLabel,
          envio: totals.shipping ? money(totals.shipping) : totals.shippingLabel,
          descuentos: promoText + couponText,
          total: money(totals.total),
          direccion: address,
          notas: notes ? `\nNotas checkout:\n${notes}` : ''
        };
        const template = typeof buildWhatsAppMessageFromTemplate === 'function'
          ? (STORE?.waTemplate || getDefaultWATemplate())
          : 'Pedido {tienda}\n\nPedido: {pedido_id}\nCliente: {nombre}{telefono}\n\n{productos}\n\nSubtotal: {subtotal}\nMetodo de envio: {metodo_envio}\nEnvio: {envio}{descuentos}\nTotal: {total}\n\nDireccion / zona: {direccion}{notas}';
        const message = typeof buildWhatsAppMessageFromTemplate === 'function'
          ? buildWhatsAppMessageFromTemplate(template, templateData)
          : template.replace(/\{([a-z_]+)\}/gi, (full, key) => templateData[key] ?? full);
        return { message, orderId, totals, address, deliveryLabel };
      }

      function registerCheckoutOrder(data) {
        try {
          if (!Array.isArray(ORDERS)) return;
          const order = {
            id: data.orderId,
            customerName: isFieldEnabled('name') && checkoutState.name ? checkoutState.name : 'Cliente sin nombre',
            phone: isFieldEnabled('phone') && checkoutState.phone ? checkoutState.phone : 'Sin telefono',
            email: isFieldEnabled('email') ? (checkoutState.email || '') : '',
            address: data.address || 'No especificada',
            notes: [
              'Checkout por pasos.',
              isFieldEnabled('notes') && checkoutState.notes ? checkoutState.notes : '',
              data.totals.couponDiscount ? 'Cupon ' + checkoutState.couponCode + '.' : '',
              isFieldEnabled('marketingOptIn') && checkoutState.wantsNews ? 'Acepta novedades por email.' : ''
            ].filter(Boolean).join(' '),
            shippingMethod: data.deliveryLabel,
            paymentMethod: isFieldEnabled('paymentMethod') ? checkoutState.paymentMethod : 'Coordinar por WhatsApp',
            items: data.totals.items.map(item => ({ id: item.id, name: item.name, qty: item.qty, price: item.price, size: item.size || '35 ml - EDP' })),
            subtotal: data.totals.subtotal,
            delivery: data.totals.shipping,
            discount: data.totals.promoDiscount + data.totals.couponDiscount,
            total: data.totals.total,
            date: new Date().toISOString(),
            status: 'Pendiente de confirmacion',
            channel: 'WhatsApp'
          };
          ORDERS.unshift(order);
          if (typeof saveOrdersLS === 'function') saveOrdersLS();
          if (typeof upsertCustomerFromOrder === 'function') upsertCustomerFromOrder(order);
          if (typeof Dash !== 'undefined') {
            Dash.renderPedidos?.();
            Dash.renderClientes?.();
            Dash.updatePanelKPIs?.();
            Dash.initAnalytics?.();
          }
        } catch (e) {
          console.warn('No se pudo registrar el pedido de checkout', e);
        }
      }

      function finishCheckout() {
        const error = validateDeliveryStep();
        if (error) {
          checkoutStep = 2;
          if (typeof showToast === 'function') showToast(error, true);
          renderCheckoutStep();
          return;
        }
        const data = buildCheckoutWhatsAppMessage();
        registerCheckoutOrder(data);
        const waNum = STORE?.waNum || config?.waNum || '5492942444236';
        window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(data.message)}`, '_blank');
        if (typeof Cart !== 'undefined' && typeof Cart.remove === 'function') {
          getCheckoutItems().slice().forEach(item => Cart.remove(item.id));
        }
        localStorage.removeItem(STORAGE_KEY);
        checkoutState = defaultCheckoutState();
        closeCheckout();
      }

      function renderCheckoutFieldAdmin() {
        const panel = document.querySelector('#sec-config .config-panel[data-config-panel="pedidos"]');
        if (!panel) return;
        let section = document.getElementById('aura-checkout-field-config-section');
        if (!section) {
          section = document.createElement('div');
          section.id = 'aura-checkout-field-config-section';
          section.className = 'config-section';
          const flow = panel.querySelector('.config-section:last-child');
          panel.insertBefore(section, flow || null);
        }
        const grouped = {};
        Object.entries(DEFAULT_FIELD_CONFIG).forEach(([key, meta]) => {
          if (!grouped[meta.group]) grouped[meta.group] = [];
          grouped[meta.group].push([key, meta]);
        });
        section.classList.remove('is-accordion', 'is-open');
        section.removeAttribute('data-accordion-ready');
        section.innerHTML = `<div class="config-section-title">Campos solicitados en el checkout</div>
          <div class="config-hint" style="margin-bottom:.9rem">Defini que informacion ve el comprador y que campos son obligatorios. Se aplica inmediatamente al checkout.</div>
          <div class="aura-admin-checkout-fields">
            ${Object.entries(grouped).map(([group, rows]) => `
              <div class="aura-admin-field-group">${auraEscape(group)}</div>
              ${rows.map(([key, meta]) => {
                const cfg = checkoutFieldConfig[key] || meta;
                const canRequire = key !== 'marketingOptIn' && key !== 'coupon';
                const help = key === 'address' ? '<div class="config-hint">Si es obligatorio, solo se exige cuando el comprador elige envio.</div>' : '';
                return `<div class="aura-admin-field-row">
                  <div><div class="aura-admin-field-name">${auraEscape(meta.label)}</div>${help}</div>
                  <label class="aura-admin-field-check"><input type="checkbox" ${cfg.enabled ? 'checked' : ''} onchange="AuraCheckoutConfig.update('${key}','enabled',this.checked)"> Mostrar campo</label>
                  <label class="aura-admin-field-check"><input type="checkbox" ${cfg.required ? 'checked' : ''} ${canRequire ? '' : 'disabled'} onchange="AuraCheckoutConfig.update('${key}','required',this.checked)"> Obligatorio</label>
                </div>`;
              }).join('')}
            `).join('')}
          </div>`;
        if (typeof initConfigAccordions === 'function') initConfigAccordions();
        if (typeof refreshConfigAccordionHeights === 'function') refreshConfigAccordionHeights();
      }

      function patchRenderProducts() {
        if (typeof window.renderProducts !== 'function' || window.renderProducts.__auraCheckoutLayer) return;
        const original = window.renderProducts;
        const wrapped = function () {
          const result = original.apply(this, arguments);
          setTimeout(enhanceProductCards, 30);
          return result;
        };
        wrapped.__auraCheckoutLayer = true;
        window.renderProducts = wrapped;
      }

      function patchCartAddItem() {
        if (typeof Cart === 'undefined' || typeof Cart.addItem !== 'function' || Cart.addItem.__auraAddedBar) return;
        const original = Cart.addItem;
        const wrapped = function (product) {
          const result = original.apply(this, arguments);
          showAddedToCartBar(product || arguments[0], 1);
          if (getCheckoutPanel()?.classList.contains('open')) {
            syncCheckoutStateFromCart();
            renderCheckoutStep();
          }
          return result;
        };
        wrapped.__auraAddedBar = true;
        Cart.addItem = wrapped;
      }

      function patchCartButton() {
        const btn = document.getElementById('btn-wa-cart');
        if (!btn || btn.__auraCheckoutPatched) return;
        btn.__auraCheckoutPatched = true;
        btn.removeAttribute('onclick');
        btn.onclick = null;
        btn.dataset.action = 'open-checkout';
        btn.innerHTML = 'Continuar al checkout';
      }

      function patchCartOpen() {
        if (typeof Cart === 'undefined' || typeof Cart.open !== 'function' || Cart.open.__auraCheckoutOnly) return;
        const originalOpen = Cart.open;
        const wrapped = function () {
          openCheckout({ resetStep: true });
        };
        wrapped.__auraCheckoutOnly = true;
        wrapped.__originalCartOpen = originalOpen;
        Cart.open = wrapped;
      }

      window.hideAddedToCartBar = hideAddedToCartBar;
      window.showAddedToCartBar = showAddedToCartBar;
      window.renderProductPaymentInfo = renderProductPaymentInfo;
      window.openCheckout = openCheckout;
      window.closeCheckout = closeCheckout;
      window.openAuraCheckout = function (step) { openCheckout({ step: normalizeCheckoutStep((Number(step) || 0) + 1), resetStep: true }); };
      window.closeAuraCheckout = closeCheckout;
      window.renderCheckout = renderCheckout;
      window.renderCheckoutStep = renderCheckoutStep;
      window.renderCheckoutSummary = renderCheckoutSummary;
      window.applyCheckoutCoupon = applyCheckoutCoupon;
      window.buildCheckoutWhatsAppMessage = buildCheckoutWhatsAppMessage;
      window.getOrderTotals = getOrderTotals;
      window.loadCheckoutFieldConfig = loadCheckoutFieldConfig;
      window.renderCheckoutFields = renderDeliveryStep;
      window.validateCheckoutStep = function (step) {
        return step === 2 ? validateDeliveryStep() : '';
      };
      window.AuraCheckoutConfig = {
        update(key, prop, value) {
          checkoutFieldConfig = loadCheckoutFieldConfig();
          if (!checkoutFieldConfig[key]) checkoutFieldConfig[key] = { ...(DEFAULT_FIELD_CONFIG[key] || {}) };
          checkoutFieldConfig[key][prop] = !!value;
          if (key === 'marketingOptIn' || key === 'coupon') checkoutFieldConfig[key].required = false;
          if (prop === 'enabled' && !value) checkoutFieldConfig[key].required = false;
          saveCheckoutFieldConfig();
          renderCheckoutFieldAdmin();
          if (getCheckoutPanel()?.classList.contains('open')) renderCheckoutStep();
          if (typeof showToast === 'function') showToast('Campos del checkout actualizados');
        },
      };
      window.AuraCheckout = {
        toggleSummary() {
          checkoutState.detailsOpen = !checkoutState.detailsOpen;
          saveCheckoutState();
          renderCheckoutStep();
        },
        toggleCoupon() {
          checkoutState.couponOpen = !checkoutState.couponOpen;
          saveCheckoutState();
          renderCheckoutStep();
        },
        setField(key, value, rerender) {
          checkoutState[key] = value;
          if (key === 'deliveryType' && value === 'retiro') {
            checkoutState.zoneId = '';
            checkoutState.address = checkoutState.address || '';
          }
          saveCheckoutState();
          if (rerender) renderCheckoutStep();
        },
        selectZone(zoneId) {
          const zone = getCheckoutShippingZones().find(item => item.id === zoneId);
          if (!zone) return;
          checkoutState.zoneId = zone.id;
          checkoutState.deliveryType = 'envio';
          checkoutState.locality = checkoutState.locality || zone.name;
          saveCheckoutState();
          if (typeof Cart !== 'undefined' && typeof Cart.selectZone === 'function') {
            try { Cart.selectZone(zone.id); } catch (e) { }
          }
          renderCheckoutStep();
        },
        next() {
          if (checkoutStep === 2) {
            const error = validateDeliveryStep();
            if (error) {
              if (typeof showToast === 'function') showToast(error, true);
              return;
            }
          }
          checkoutStep = Math.min(3, checkoutStep + 1);
          renderCheckoutStep();
        },
        prev() {
          if (checkoutStep <= 1) {
            closeCheckout();
            return;
          }
          checkoutStep = Math.max(1, checkoutStep - 1);
          renderCheckoutStep();
        },
        updateQty(id, delta) {
          if (typeof Cart !== 'undefined' && typeof Cart.updateQty === 'function') Cart.updateQty(id, delta);
          syncCheckoutStateFromCart();
          if (!getCheckoutItems().length) {
            closeCheckout();
            return;
          }
          renderCheckoutStep();
        },
        removeItem(id) {
          if (typeof Cart !== 'undefined' && typeof Cart.remove === 'function') Cart.remove(id);
          syncCheckoutStateFromCart();
          if (!getCheckoutItems().length) {
            closeCheckout();
            return;
          }
          renderCheckoutStep();
        },
        finish: finishCheckout
      };

      function initCheckoutDelegation() {
        if (document.__auraCheckoutDelegationBound) return;
        document.__auraCheckoutDelegationBound = true;
        document.addEventListener('click', function (event) {
          const openBtn = event.target.closest?.('[data-action="open-checkout"]');
          const closeBtn = event.target.closest?.('[data-action="close-checkout"]');
          if (openBtn) {
            event.preventDefault();
            openCheckout({ resetStep: true });
            return;
          }
          if (closeBtn) {
            event.preventDefault();
            closeCheckout();
          }
        });
        document.addEventListener('keydown', function (event) {
          if (event.key !== 'Escape' || !checkoutOpen) return;
          closeCheckout();
        });
      }

      function initAuraCheckoutLayer() {
        checkoutFieldConfig = loadCheckoutFieldConfig();
        initCheckoutDelegation();
        patchRenderProducts();
        patchCartAddItem();
        patchCartButton();
        patchCartOpen();
        enhanceProductCards();
        renderCheckoutFieldAdmin();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuraCheckoutLayer);
      } else {
        initAuraCheckoutLayer();
      }
    })();

/* ROOT CART/CHECKOUT CONTROLLER - single source of truth */
    (function () {
      if (window.__auraRootCartControllerV2) return;
      window.__auraRootCartControllerV2 = true;

      let checkoutOpen = false;
      let checkoutStep = 1;
      let observer = null;

      function clampStep(step) {
        return Math.max(1, Math.min(3, Number(step) || 1));
      }

      function textOf(node) {
        return String(node?.textContent || '').trim().toLowerCase();
      }

      function panel() {
        return document.getElementById('checkoutModal') || document.getElementById('aura-checkout-panel');
      }

      function overlay() {
        let el = document.getElementById('aura-checkout-overlay');
        if (!el) {
          el = document.createElement('div');
          el.id = 'aura-checkout-overlay';
          document.body.appendChild(el);
        }
        el.className = 'aura-checkout-overlay';
        el.setAttribute('data-action', 'close-checkout');
        return el;
      }

      function ensurePanel() {
        let el = panel();
        if (!el) {
          el = document.createElement('section');
          document.body.appendChild(el);
        }
        el.id = 'checkoutModal';
        el.classList.add('aura-checkout-panel');
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', 'Checkout AURA');
        return el;
      }

      function hideLegacyCart() {
        const oldOverlay = document.getElementById('cart-overlay');
        const oldPanel = document.getElementById('cart-panel');
        oldOverlay?.classList.remove('open', 'peek', 'active', 'is-open');
        oldPanel?.classList.remove('open', 'peek', 'active', 'is-open');
        if (oldOverlay) {
          oldOverlay.style.pointerEvents = 'none';
          oldOverlay.style.visibility = 'hidden';
        }
        if (oldPanel) {
          oldPanel.style.pointerEvents = 'none';
          oldPanel.style.visibility = 'hidden';
        }
        try { window.Cart?.closeSuggestions?.(); } catch (error) { }
      }

      function normalizeStaticControls() {
        document.querySelectorAll('.store-cart-btn, #mob-nav-cart, #btn-wa-cart').forEach(function (el) {
          el.setAttribute('type', 'button');
          el.setAttribute('data-action', 'open-checkout');
          el.removeAttribute('onclick');
          el.onclick = null;
        });

        const oldOverlay = document.getElementById('cart-overlay');
        if (oldOverlay) {
          oldOverlay.setAttribute('data-action', 'close-checkout');
          oldOverlay.removeAttribute('onclick');
          oldOverlay.onclick = null;
        }

        document.querySelectorAll('.cart-x, .checkout-close, .aura-checkout-close').forEach(function (el) {
          el.setAttribute('type', 'button');
          el.setAttribute('data-action', 'close-checkout');
          el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Cerrar');
          el.removeAttribute('onclick');
          el.onclick = null;
        });
      }

      function normalizeRenderedControls() {
        normalizeStaticControls();
        document.querySelectorAll('#checkoutModal button, #aura-checkout-panel button, #cart-panel button, #cart-panel span, #cart-panel a').forEach(function (el) {
          if (textOf(el) !== 'seguir comprando') return;
          if (el.tagName === 'BUTTON') {
            el.setAttribute('type', 'button');
            el.setAttribute('data-action', 'close-checkout');
            el.removeAttribute('onclick');
            el.onclick = null;
            return;
          }
          const button = document.createElement('button');
          button.type = 'button';
          button.className = el.className || 'cart-continue';
          button.innerHTML = el.innerHTML || 'Seguir comprando';
          button.setAttribute('data-action', 'close-checkout');
          el.replaceWith(button);
        });
      }

      function renderCheckoutAtStep(step) {
        checkoutStep = clampStep(step);
        try { window.renderCheckout?.(); } catch (error) { }
        try {
          if (typeof window.renderCheckoutStep === 'function') {
            window.renderCheckoutStep(checkoutStep);
          }
        } catch (error) {
          console.warn('No se pudo renderizar el checkout', error);
        }
        normalizeRenderedControls();
      }

      function setOpenState(open) {
        const p = ensurePanel();
        const o = overlay();
        checkoutOpen = !!open;

        if (checkoutOpen) {
          p.classList.add('open', 'is-open');
          p.setAttribute('aria-hidden', 'false');
          p.style.pointerEvents = 'auto';
          p.style.visibility = 'visible';
          o.classList.add('open', 'is-open');
          o.style.pointerEvents = 'auto';
          o.style.visibility = 'visible';
          document.body.classList.add('checkout-open');
          document.documentElement.classList.add('checkout-open');
          document.body.style.overflow = 'hidden';
          document.documentElement.style.overflow = 'hidden';
          return;
        }

        p.classList.remove('open', 'is-open', 'active');
        p.setAttribute('aria-hidden', 'true');
        p.style.pointerEvents = 'none';
        p.style.visibility = 'hidden';
        o.classList.remove('open', 'is-open', 'active');
        o.style.pointerEvents = 'none';
        o.style.visibility = 'hidden';
        document.body.classList.remove('checkout-open', 'cart-open', 'modal-open');
        document.documentElement.classList.remove('checkout-open', 'cart-open', 'modal-open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        hideLegacyCart();
      }

      function openCheckoutRoot(options) {
        const resetStep = !checkoutOpen || options?.resetStep !== false;
        const nextStep = options?.step ? clampStep(options.step) : (resetStep ? 1 : checkoutStep);
        hideLegacyCart();
        renderCheckoutAtStep(nextStep);
        setOpenState(true);
        requestAnimationFrame(function () {
          normalizeRenderedControls();
          setOpenState(true);
        });
      }

      function closeCheckoutRoot() {
        setOpenState(false);
        requestAnimationFrame(function () {
          setOpenState(false);
          normalizeRenderedControls();
        });
      }

      function patchLegacyAPIs() {
        window.openCheckout = openCheckoutRoot;
        window.closeCheckout = closeCheckoutRoot;
        window.openAuraCheckout = function (step) {
          openCheckoutRoot({ step: clampStep((Number(step) || 0) + 1), resetStep: true });
        };
        window.closeAuraCheckout = closeCheckoutRoot;

        if (window.Cart && !window.Cart.__rootCheckoutPatched) {
          window.Cart.__rootCheckoutPatched = true;
          window.Cart.open = function () { openCheckoutRoot({ resetStep: true }); };
          window.Cart.close = closeCheckoutRoot;
        }

        if (window.MobNav && typeof window.MobNav.goCarrito === 'function' && !window.MobNav.goCarrito.__rootCheckoutPatched) {
          window.MobNav.goCarrito = function () { openCheckoutRoot({ resetStep: true }); };
          window.MobNav.goCarrito.__rootCheckoutPatched = true;
        }
      }

      function isCloseClick(target) {
        if (!target?.closest) return false;
        if (target.closest('[data-action="close-checkout"], .aura-checkout-close, .checkout-close, .cart-x')) return true;
        const action = target.closest('button, a, span');
        return !!action && textOf(action) === 'seguir comprando' && !!action.closest('#checkoutModal, #aura-checkout-panel, #cart-panel');
      }

      function isOpenClick(target) {
        if (!target?.closest) return false;
        return !!target.closest('[data-action="open-checkout"], .store-cart-btn, #mob-nav-cart, #btn-wa-cart');
      }

      document.addEventListener('click', function (event) {
        if (isCloseClick(event.target)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          closeCheckoutRoot();
          return;
        }
        if (isOpenClick(event.target)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          openCheckoutRoot({ resetStep: true });
        }
      }, true);

      document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape' || !checkoutOpen) return;
        event.preventDefault();
        closeCheckoutRoot();
      }, true);

      function boot() {
        patchLegacyAPIs();
        normalizeRenderedControls();
        hideLegacyCart();
        setOpenState(false);

        if (!observer && document.body) {
          observer = new MutationObserver(function () {
            patchLegacyAPIs();
            normalizeRenderedControls();
            if (!checkoutOpen) hideLegacyCart();
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
      } else {
        boot();
      }

      setTimeout(boot, 250);
      setTimeout(boot, 900);
    })();

(function () {
  function readStoredCartCount() {
    try {
      const raw = localStorage.getItem('aura_cart') || localStorage.getItem('cart') || '[]';
      const cart = JSON.parse(raw) || [];
      return Array.isArray(cart)
        ? cart.reduce((acc, item) => acc + Number(item.qty || 1), 0)
        : 0;
    } catch (error) {
      return 0;
    }
  }

  function getCartTotal() {
    if (typeof Cart !== 'undefined' && typeof Cart.count === 'function') {
      return Number(Cart.count() || 0);
    }
    return readStoredCartCount();
  }

  function ensureCartBadge() {
    const cartButton = document.getElementById('aura-dock-cart') || document.querySelector('.store-cart-btn, .cart-btn');
    if (!cartButton) return null;

    let badge = cartButton.querySelector('.cart-count');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-count';
      badge.setAttribute('aria-hidden', 'true');
      cartButton.appendChild(badge);
    }
    return badge;
  }

  function updateCartBadge(options) {
    const badge = ensureCartBadge();
    if (!badge) return;

    const total = getCartTotal();
    const displayTotal = total > 99 ? '99+' : String(total);
    const changed = badge.textContent !== displayTotal;

    badge.textContent = displayTotal;
    badge.classList.toggle('visible', total > 0);

    if (total > 0 && (options?.bump || changed)) {
      badge.classList.remove('bump');
      void badge.offsetWidth;
      badge.classList.add('bump');
    } else if (total <= 0) {
      badge.classList.remove('bump');
    }
  }

  function patchCartBadgeUpdates() {
    if (typeof Cart === 'undefined' || Cart.__auraCartCountBadgePatched) return;
    Cart.__auraCartCountBadgePatched = true;

    ['addItem', 'updateQty', 'remove'].forEach(function (method) {
      if (typeof Cart[method] !== 'function') return;
      const original = Cart[method];
      Cart[method] = function () {
        const result = original.apply(this, arguments);
        setTimeout(function () { updateCartBadge({ bump: true }); }, 0);
        return result;
      };
    });
  }

  function bootCartBadge() {
    ensureCartBadge();
    patchCartBadgeUpdates();
    updateCartBadge({ bump: false });
  }

  window.updateCartBadge = updateCartBadge;
  window.AuraUpdateCartBadge = updateCartBadge;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootCartBadge, { once: true });
  } else {
    bootCartBadge();
  }

  window.addEventListener('storage', function (event) {
    if (event.key === 'aura_cart' || event.key === 'cart') updateCartBadge({ bump: true });
  });

  setTimeout(bootCartBadge, 250);
  setTimeout(bootCartBadge, 900);
})();

(function () {
  let lastAddButton = null;
  let lastAddCard = null;
  let toastTimer = null;

  function closestAddControl(target) {
    return target?.closest?.('.prod-atc, #detail-add-btn, .detail-cta') || null;
  }

  function rememberAddContext(event) {
    const button = closestAddControl(event.target);
    if (!button) return;
    lastAddButton = button;
    lastAddCard = button.closest('.prod-card') || null;
  }

  function findCardForProduct(product) {
    if (!product?.id) return lastAddCard;
    const productId = String(product.id);
    const heart = Array.from(document.querySelectorAll('.prod-heart[data-pid]')).find(function (item) {
      return item.dataset.pid === productId;
    });
    return heart?.closest('.prod-card') || lastAddCard;
  }

  function showPremiumToast() {
    let toast = document.getElementById('add-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'add-toast';
      toast.className = 'add-toast aura-add-toast';
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.classList.add('aura-add-toast');
    toast.textContent = 'Producto agregado al carrito';
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  function pulseCartBadge() {
    if (typeof window.AuraUpdateCartBadge === 'function') {
      window.AuraUpdateCartBadge({ bump: true });
      return;
    }
    if (typeof Cart !== 'undefined' && typeof Cart.updateCartBadge === 'function') {
      Cart.updateCartBadge(true);
    }
  }

  function markAdded(product) {
    const card = findCardForProduct(product);
    const button = lastAddButton && document.body.contains(lastAddButton)
      ? lastAddButton
      : card?.querySelector('.prod-atc');

    if (card) {
      card.classList.add('just-added');
      clearTimeout(card.__auraJustAddedTimer);
      card.__auraJustAddedTimer = setTimeout(function () {
        card.classList.remove('just-added');
      }, 950);
    }

    if (button) {
      const originalText = button.dataset.auraOriginalText || button.textContent.trim() || 'Comprar';
      button.dataset.auraOriginalText = originalText;
      button.classList.add('added');
      button.textContent = 'AGREGADO ✓';
      clearTimeout(button.__auraAddedTimer);
      button.__auraAddedTimer = setTimeout(function () {
        button.classList.remove('added');
        button.textContent = button.dataset.auraOriginalText || originalText;
      }, 1200);
    }

    showPremiumToast();
    pulseCartBadge();
  }

  function patchCartAddFeedback() {
    if (typeof Cart === 'undefined' || typeof Cart.addItem !== 'function' || Cart.addItem.__auraPremiumAddFeedback) return;
    const original = Cart.addItem;
    Cart.addItem = function (product) {
      const result = original.apply(this, arguments);
      setTimeout(function () { markAdded(product || arguments[0]); }, 0);
      return result;
    };
    Cart.addItem.__auraPremiumAddFeedback = true;
  }

  document.addEventListener('click', rememberAddContext, true);

  function boot() {
    patchCartAddFeedback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  setTimeout(boot, 300);
  setTimeout(boot, 1000);
})();

(function () {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const controllers = new WeakMap();
  const resumeDelay = 3600;
  const edgePause = 900;
  const pxPerSecond = 16;

  function getBars() {
    return Array.from(new Set([
      document.querySelector('.aura-dock-panel'),
      document.getElementById('filter-chips'),
      document.querySelector('.category-bar')
    ].filter(Boolean)));
  }

  function hasOverflow(el) {
    return el && el.scrollWidth > el.clientWidth + 6;
  }

  function setUserInteracting(el, active) {
    el.classList.toggle('user-interacting', !!active);
    if (active) el.classList.remove('is-autoscrolling');
  }

  function scheduleResume(state, delay) {
    clearTimeout(state.resumeTimer);
    state.resumeTimer = setTimeout(function () {
      state.paused = false;
      state.lastTs = 0;
      state.waitUntil = performance.now() + 250;
      setUserInteracting(state.el, false);
    }, delay || resumeDelay);
  }

  function pauseForUser(state) {
    state.paused = true;
    setUserInteracting(state.el, true);
    scheduleResume(state, resumeDelay);
  }

  function step(state, ts) {
    const el = state.el;
    if (!document.body.contains(el)) return;

    if (!hasOverflow(el)) {
      el.classList.remove('is-autoscrolling', 'user-interacting');
      el.scrollLeft = 0;
      state.lastTs = ts;
      state.raf = requestAnimationFrame(function (next) { step(state, next); });
      return;
    }

    if (!state.paused && ts >= state.waitUntil) {
      el.classList.add('is-autoscrolling');
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      const delta = state.lastTs ? ((ts - state.lastTs) / 1000) * pxPerSecond : 0;

      if (state.direction > 0) {
        el.scrollLeft = Math.min(max, el.scrollLeft + delta);
        if (el.scrollLeft >= max - 1) {
          state.direction = -1;
          state.waitUntil = ts + edgePause;
        }
      } else {
        el.scrollLeft = Math.max(0, el.scrollLeft - delta);
        if (el.scrollLeft <= 1) {
          state.direction = 1;
          state.waitUntil = ts + edgePause;
        }
      }
    }

    state.lastTs = ts;
    state.raf = requestAnimationFrame(function (next) { step(state, next); });
  }

  function bindBar(el) {
    if (!el || controllers.has(el)) return;

    const state = {
      el,
      direction: 1,
      paused: false,
      waitUntil: performance.now() + 1200,
      lastTs: 0,
      resumeTimer: null,
      raf: null
    };

    controllers.set(el, state);

    ['pointerdown', 'touchstart', 'wheel'].forEach(function (eventName) {
      el.addEventListener(eventName, function () { pauseForUser(state); }, { passive: true });
    });

    el.addEventListener('scroll', function () {
      if (el.classList.contains('is-autoscrolling')) return;
      pauseForUser(state);
    }, { passive: true });

    el.addEventListener('mouseenter', function () { pauseForUser(state); }, { passive: true });
    el.addEventListener('mouseleave', function () { scheduleResume(state, 1400); }, { passive: true });

    state.raf = requestAnimationFrame(function (ts) { step(state, ts); });
  }

  function initAutoscroll() {
    getBars().forEach(bindBar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoscroll, { once: true });
  } else {
    initAutoscroll();
  }

  window.addEventListener('resize', function () {
    getBars().forEach(function (el) {
      if (!hasOverflow(el)) el.scrollLeft = 0;
      bindBar(el);
    });
  }, { passive: true });

  const observer = new MutationObserver(function () {
    initAutoscroll();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  setTimeout(initAutoscroll, 500);
  setTimeout(initAutoscroll, 1500);
})();

export const Carrito = { open: () => window.Cart?.open?.(), close: () => window.Cart?.close?.(), items: () => window.Cart?.items?.() || [] };