import './utils.js';

import './auth.js';

import './clientes.js';

import './agenda.js';

import './pagos.js';

import './reportes.js';

const PERFUME_SVG = window.PERFUME_SVG || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" fill="none" width="56" height="56" aria-hidden="true"><rect x="24" y="2" width="16" height="8" rx="3" fill="#C9A84C" opacity="0.7"/><rect x="27" y="10" width="10" height="6" rx="1" fill="#C9A84C" opacity="0.6"/><rect x="14" y="16" width="36" height="48" rx="8" fill="#C9A84C" opacity="0.18"/><rect x="14" y="16" width="36" height="48" rx="8" stroke="#C9A84C" stroke-width="1.5" fill="none" opacity="0.5"/><rect x="20" y="22" width="6" height="24" rx="3" fill="white" opacity="0.15"/><rect x="16" y="38" width="32" height="24" rx="0" fill="#C9A84C" opacity="0.12"/></svg>`;
window.PERFUME_SVG = PERFUME_SVG;

const DEFAULT_PRODUCTS = [
      { id: 'odyssey-tyrant', name: 'Odyssey Tyrant', cat: 'almizcle', cat2: 'madera', price: 12500, stock: 1, badge: 'Últimas unidades', emoji: '🥇', size: '35 ml · EDP', desc: 'Salida intensa y amaderada, con presencia firme y elegante.', images: [] },
      { id: 'odyssey-spectra', name: 'Odyssey Spectra', cat: 'madera', cat2: 'citrico', price: 11900, stock: 2, badge: 'Últimas unidades', emoji: '🌈', size: '35 ml · EDP', desc: 'Madera vibrante con apertura fresca y moderna.', images: [] },
      { id: 'odyssey-limoni', name: 'Odyssey Limoni', cat: 'fresco', cat2: 'acuatico', price: 10900, stock: 2, badge: 'Últimas unidades', emoji: '🍋', size: '35 ml · EDP', desc: 'Perfil luminoso, cítrico y limpio para uso diario.', images: [] },
      { id: 'odyssey-candeo', name: 'Odyssey Candeo', cat: 'floral', cat2: 'ambar', price: 13200, stock: 2, badge: 'Últimas unidades', emoji: '🌸', size: '35 ml · EDP', desc: 'Acorde floral dulce con base ámbar cálida.', images: [] },
      { id: 'absolu-noir', name: 'Absolu Noir', cat: 'oriental', cat2: 'oud', price: 15900, stock: 8, badge: null, emoji: '🖤', size: '35 ml · EDP', desc: 'Oscuro, profundo y envolvente.', images: [] },
      { id: 'rose-velours', name: 'Rose Velours', cat: 'floral', cat2: 'madera', price: 14500, stock: 12, badge: null, emoji: '🌹', size: '35 ml · EDP', desc: 'Rosa aterciopelada con fondo cálido.', images: [] },
      { id: 'musc-blanc', name: 'Musc Blanc', cat: 'almizcle', cat2: 'fresco', price: 9900, stock: 6, badge: null, emoji: '🤍', size: '35 ml · EDP', desc: 'Limpio, suave y muy versátil.', images: [] },
      { id: 'cedar-smoke', name: 'Cedar Smoke', cat: 'madera', cat2: 'oriental', price: 16900, stock: 4, badge: null, emoji: '🌲', size: '35 ml · EDP', desc: 'Cedro ahumado con carácter.', images: [] },
    ];
    const DEFAULT_TAXONOMY = {
      categories: [
        { id: 'floral', name: 'Floral' },
        { id: 'madera', name: 'Madera' },
        { id: 'oriental', name: 'Oriental' },
        { id: 'almizcle', name: 'Almizcle' },
        { id: 'fresco', name: 'Fresco' }
      ],
      subcategories: [
        { id: 'ambar', categoryId: 'floral', name: 'Ámbar' },
        { id: 'madera', categoryId: 'almizcle', name: 'Madera' },
        { id: 'citrico', categoryId: 'madera', name: 'Cítrico' },
        { id: 'acuatico', categoryId: 'fresco', name: 'Acuático' },
        { id: 'oud', categoryId: 'oriental', name: 'Oud' },
        { id: 'fresco', categoryId: 'almizcle', name: 'Fresco' },
        { id: 'oriental', categoryId: 'madera', name: 'Oriental' }
      ]
    };
    const PROMOS_DATA = [
      {
        id: 'promo-tubitos-arabes',
        name: 'Tubitos Árabes 35ml',
        emoji: '🌸',
        productCategory: 'promos',
        images: [],
        sizeMatch: '35ml',
        active: true,
        tiers: [
          { qty: 1, unitPrice: 8000, total: 8000, label: '1x $8.000' },
          { qty: 2, unitPrice: 7500, total: 15000, label: '2x $15.000 ($7.500 c/u)' },
          { qty: 3, unitPrice: 7000, total: 21000, label: '3x $21.000 ($7.000 c/u)' },
          { qty: 4, unitPrice: 7000, total: 28000, label: '4x $28.000 ($7.000 c/u)' },
          { qty: 5, unitPrice: 7000, total: 35000, label: '5x $35.000 ($7.000 c/u)' },
          { qty: 6, unitPrice: 7000, total: 42000, label: '6x $42.000 ($7.000 c/u)' },
          { qty: 7, unitPrice: 7000, total: 49000, label: '7x $49.000 ($7.000 c/u)' },
          { qty: 8, unitPrice: 7000, total: 56000, label: '8x $56.000 ($7.000 c/u)' },
          { qty: 9, unitPrice: 7000, total: 63000, label: '9x $63.000 ($7.000 c/u)' },
          { qty: 10, unitPrice: 4500, total: 45000, label: '10x $45.000 ($4.500 c/u) — MAYORISTA' },
          { qty: 25, unitPrice: 4000, total: 100000, label: '25x $100.000 ($4.000 c/u) — MAYORISTA' },
          { qty: 50, unitPrice: 3500, total: 175000, label: '50x $175.000 ($3.500 c/u) — MAYORISTA' },
        ],
        fragrances: ['Khamrah', 'Erba Pura', 'Yara', 'Yara Moi', '9pm', 'Asad', 'Odyssey Tyrant', 'Rose Velours', 'Musc Blanc', 'Cedar Smoke', 'Odyssey Candeo', 'Absolu Noir', 'Odyssey Spectra', 'Odyssey Limoni'],
        note: 'Desde 4 hasta 9 unidades: $7.000 c/u. Precio mayorista desde 10 unidades.',
      },
      {
        id: 'promo-bodysplash-100',
        name: 'Bodysplash 100ml',
        emoji: '💧',
        productCategory: 'promos',
        images: [],
        active: true,
        tiers: [
          { qty: 1, unitPrice: 15000, total: 15000, label: '1x $15.000' },
          { qty: 2, unitPrice: 13500, total: 27000, label: '2x $27.000 ($13.500 c/u)' },
          { qty: 3, unitPrice: 12000, total: 36000, label: '3x $36.000 ($12.000 c/u)' },
        ],
        fragrances: ['Khamrah', 'Erba Pura', 'Yara', 'Yara Candy', 'Absolu Noir', 'Rose Velours', 'Musc Blanc', 'Odyssey Candeo', 'Fakhar Rose'],
        note: 'Bodysplash formato 100ml. Armá tu combo eligiendo fragancias.',
      },
      {
        id: 'promo-bodysplash-250',
        name: 'Bodysplash 250ml',
        emoji: '🌊',
        productCategory: 'promos',
        images: [],
        active: true,
        tiers: [
          { qty: 1, unitPrice: 25000, total: 25000, label: '1x $25.000' },
          { qty: 2, unitPrice: 22000, total: 44000, label: '2x $44.000 ($22.000 c/u)' },
          { qty: 3, unitPrice: 20000, total: 60000, label: '3x $60.000 ($20.000 c/u)' },
        ],
        fragrances: ['Khamrah', 'Erba Pura', 'Yara', 'Yara Candy', 'Absolu Noir', 'Rose Velours', 'Khamrah Qahwa', 'Fakhar Rose', 'Fakhar Black'],
        note: 'Bodysplash formato 250ml. Armá tu combo eligiendo fragancias.',
      },
    ];

    function getActivePromos() {
      return PROMOS_DATA.filter(p => p.active !== false);
    }

    function getPromoTier(promo, qty) {
      if (!promo || !qty) return null;
      const exact = promo.tiers.find(t => t.qty === qty);
      if (exact) return exact;
      if (promo.id === 'promo-tubitos-arabes' && qty >= 4 && qty <= 9) {
        return { qty, unitPrice: 7000, total: qty * 7000, label: `${qty}x $${(qty * 7000).toLocaleString('es-AR')} ($7.000 c/u)` };
      }
      return null;
    }

    function getPromoDiscount(promo, qty) {
      const tier = getPromoTier(promo, qty);
      if (!tier) return null;
      const normalPrice = promo.tiers[0].unitPrice;
      const saved = (normalPrice * qty) - tier.total;
      return { tier, saved };
    }

    const DEFAULT_HEATMAP = { hero: 18, filters: 11, productCard: 25, addToCart: 20, cart: 8, whatsapp: 7, nav: 6, about: 4 };
    const DEFAULT_STORE_CONFIG = {
      waNum: '5492942444236', waName: 'AURA — Tienda Online', waTemplate: `🌸 *Pedido {tienda}*\n\nPedido: {pedido_id}\nCliente: {nombre}{telefono}\n\n{productos}\n\nSubtotal: {subtotal}\nMétodo de envío: {metodo_envio}\nEnvío: {envio}{descuentos}\n*Total: {total}*\n\n📍 Dirección / zona: {direccion}{notas}`, bannerText: 'Nueva colección Otoño/Invierno 2026 — Envío gratis (Cipolletti o Neuquén) en pedidos mayores a $50.000', bannerFg: '#C9A84C', bannerOn: true,
      dir: 'A coordinar', hs: 'Lun-Vie 10-19hs, Sáb 10-14hs', email: 'hola@aura.com',
      shippingGpsEnabled: true, shippingZoneEnabled: false,
      shippingZones: [
        { id: 'cipolletti', name: 'Cipolletti', price: 1500 },
        { id: 'neuquen', name: 'Neuquén', price: 3000 },
        { id: 'fernandez-oro', name: 'Fernández Oro', price: 3000 }
      ],
      heroEnc: 'Nueva colección Otoño/Invierno 2026 — Envío gratis (Cipolletti o Neuquén) en pedidos mayores a $50.000', heroTitle: 'Elevamos Tu Esencia', heroSub: 'Fragancias que hablan antes que vos.', heroExtra: '', heroEncOn: true, heroTitleOn: true, heroSubOn: true, heroExtraOn: false, heroLogo: '', heroLogoOn: false, heroBg: '', portalImg: 'assets/img/aura-inline-02.jpg'
    };
    const ORIGIN = { lat: -38.935186, lng: -68.010975 };
    const config = { rate: 500, waNum: '' };

    function slugify(v) { return String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('id-' + Date.now()) }
    function safeParse(key, fallback) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch (e) { return fallback } }
    function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)) }
    function loadProducts() { const items = safeParse('aura_products', null); return (items && Array.isArray(items) && items.length ? items : DEFAULT_PRODUCTS).map(p => ({ ...p, images: Array.isArray(p.images) ? p.images : [], size: p.size || '35 ml · EDP', desc: p.desc || 'Fragancia destacada de AURA.' })) }
    function saveProductsLS() {
      saveJSON('aura_products', PRODUCTS);
      // Also cache images separately to survive Firestore sync
      const imgMap = {};
      PRODUCTS.forEach(p => { if (p.images && p.images.length) imgMap[p.id] = p.images; });
      try { localStorage.setItem('aura_product_images', JSON.stringify(imgMap)); } catch (e) { }
    }
    function loadOrders() { return safeParse('aura_orders', []) }
    function saveOrdersLS() { saveJSON('aura_orders', ORDERS) }
    function loadCustomers() { return safeParse('aura_customers', []) }
    function saveCustomersLS() { saveJSON('aura_customers', CUSTOMERS) }
    function loadTaxonomy() { const base = safeParse('aura_taxonomy', DEFAULT_TAXONOMY); if (!base.categories?.length) base.categories = DEFAULT_TAXONOMY.categories; if (!base.subcategories) base.subcategories = []; return base }
    function saveTaxonomyLS() { saveJSON('aura_taxonomy', TAXONOMY) }
    function loadHeatmap() { return { ...DEFAULT_HEATMAP, ...safeParse('aura_heatmap', {}) } }
    function saveHeatmapLS() { saveJSON('aura_heatmap', HEATMAP) }
    function loadStoreConfig() { return { ...DEFAULT_STORE_CONFIG, ...safeParse('aura_store_config', {}) } }
    function saveStoreConfig() { saveJSON('aura_store_config', STORE) }
    function readFileAsDataURL(file) { return new Promise((resolve, reject) => { const fr = new FileReader(); fr.onload = () => resolve(fr.result); fr.onerror = reject; fr.readAsDataURL(file) }) }
    function formatDateTime(iso) { const d = new Date(iso); return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    function haversine(lat1, lng1, lat2, lng2) { const R = 6371, d2r = Math.PI / 180, dLat = (lat2 - lat1) * d2r, dLng = (lng2 - lng1) * d2r; const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r) * Math.sin(dLng / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) }
    function getCategoryName(id) { return TAXONOMY.categories.find(c => c.id === id)?.name || id }
    function getSubcategoryName(id) { return TAXONOMY.subcategories.find(s => s.id === id)?.name || id || '—' }
    function getSubcategoriesByCategory(catId) { return TAXONOMY.subcategories.filter(s => s.categoryId === catId) }
    function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])) }

    let PRODUCTS = loadProducts();
    let ORDERS = loadOrders();
    let CUSTOMERS = loadCustomers();
    let TAXONOMY = loadTaxonomy();
    let HEATMAP = loadHeatmap();
    let STORE = loadStoreConfig();


    function getDefaultWATemplate() {
      return DEFAULT_STORE_CONFIG.waTemplate;
    }

    function buildWhatsAppMessageFromTemplate(template, data) {
      const source = String(template || getDefaultWATemplate());
      const safeData = { ...data };
      return source.replace(/\{([a-z_]+)\}/gi, (full, key) => {
        return Object.prototype.hasOwnProperty.call(safeData, key) ? String(safeData[key] ?? '') : full;
      }).replace(/\n{3,}/g, '\n\n').trim();
    }

    function getWATemplateSampleData() {
      return {
        tienda: STORE?.waName || 'AURA — Tienda Online',
        pedido_id: 'PED-123456',
        nombre: 'Juan Pérez',
        telefono: '\nTeléfono: 2991234567',
        productos: '• Khamrah x1 — $50.000\n• 9pm x2 — $130.000',
        subtotal: '$180.000',
        metodo_envio: 'Zona fija',
        envio: '$3.000',
        descuentos: '\n💚 Descuento promo Combo Noche: −$10.000',
        total: '$173.000',
        direccion: 'Cipolletti',
        notas: '\n📝 Notas: Entregar por la tarde'
      };
    }

    function renderConfigWAPreview() {
      const textarea = document.getElementById('cfg-wa-template');
      const preview = document.getElementById('cfg-wa-preview');
      if (!textarea || !preview) return;
      const msg = buildWhatsAppMessageFromTemplate(textarea.value, getWATemplateSampleData());
      preview.textContent = msg;
    }

    const Cart = (() => {
      let items = []; let deliveryCost = 0; let selectedPos = null; let sugTimeout = null; let shippingMethod = '';
      let badgePulseTimer = null;
      let addToastTimer = null;
      const save = () => { localStorage.setItem('aura_cart', JSON.stringify(items)) };
      const load = () => { try { const r = localStorage.getItem('aura_cart'); if (r) items = JSON.parse(r) || [] } catch (e) { } render() };
      const subtotal = () => items.reduce((s, i) => s + i.price * i.qty, 0);
      const count = () => items.reduce((s, i) => s + i.qty, 0);
      const getAppliedDiscount = () => getCartActiveDiscount(items);
      const getAppliedDiscounts = () => getCartActiveDiscounts(items);
      const total = () => subtotal() + deliveryCost - getAppliedDiscounts().totalDiscount;
      const getShippingModes = () => ({ gps: STORE.shippingGpsEnabled !== false, zone: !!STORE.shippingZoneEnabled });
      function ensureAddToast() {
        let toast = document.getElementById('add-toast');
        if (toast) return toast;
        toast = document.createElement('div');
        toast.id = 'add-toast';
        toast.className = 'add-toast';
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
        return toast;
      }
      function showAddToast(name) {
        const toast = ensureAddToast();
        toast.textContent = `✓ ${name} agregado`;
        toast.classList.remove('show');
        void toast.offsetWidth;
        toast.classList.add('show');
        clearTimeout(addToastTimer);
        addToastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
      }
      function updateCartBadge(pop = false) {
        const badge = document.getElementById('cart-badge');
        if (!badge) return;
        const n = count();
        badge.textContent = n > 9 ? '9+' : String(n);
        badge.classList.toggle('has-items', n > 0);
        if (!pop || n <= 0) return;
        badge.classList.remove('pulse');
        requestAnimationFrame(() => badge.classList.add('pulse'));
        clearTimeout(badgePulseTimer);
        badgePulseTimer = setTimeout(() => badge.classList.remove('pulse'), 500);
      }
      function refreshTotals() {
        const hasItems = items.length > 0;
        const modes = getShippingModes();
        const { totalDiscount, discountLines } = getAppliedDiscounts();
        const subtotalValue = subtotal();
        const totalValue = subtotalValue + deliveryCost - totalDiscount;
        const totalsBox = document.getElementById('cart-totals');
        if (totalsBox) {
          let promoProgressHTML = '';
          for (const promo of (typeof getActivePromos === 'function' ? getActivePromos() : [])) {
            if (!promo.tiers || !promo.tiers.length) continue;
            const sortedTiers = [...promo.tiers].sort((a,b) => a.qty - b.qty);
            const qtyInCart = items.reduce((sum, item) => {
              if (item._isPromo) return sum;
              const product = Array.isArray(PRODUCTS) ? PRODUCTS.find(p => p.id === item.id) : null;
              return getAssignedPromoIds(product).includes(promo.id)
                ? sum + Number(item.qty || 0) : sum;
            }, 0);
            if (qtyInCart === 0) continue;
            const activeDiscount = discountLines.find(d => d.promo.id === promo.id);
            if (activeDiscount) {
              promoProgressHTML += `
            <div class="cart-promo-active-line">
              <span>🎉 Promo <strong>${escapeHtml(promo.name)}</strong> activa</span>
              <span style="color:#10B981">−$${activeDiscount.discount.saved.toLocaleString('es-AR')}</span>
            </div>`;
            } else {
              const nextTier = sortedTiers.find(t => t.qty > qtyInCart);
              if (nextTier) {
                const pct = Math.round((qtyInCart / nextTier.qty) * 100);
                const savedAtNext = subtotalValue - nextTier.total;
                promoProgressHTML += `
              <div class="cart-promo-progress">
                <div class="promo-progress-label">
                  🛒 ¡Agregá ${nextTier.qty - qtyInCart} más para activar <em>${escapeHtml(promo.name)}</em>!
                </div>
                ${savedAtNext > 0 ? `<div class="promo-progress-sub">Ahorrás $${savedAtNext.toLocaleString('es-AR')} con ${nextTier.qty} unidades</div>` : ''}
                <div class="promo-progress-bar">
                  <div class="promo-progress-fill" style="width:${Math.min(pct,99)}%"></div>
                </div>
                <div class="promo-progress-sub" style="margin-top:.3rem;text-align:right">
                  ${qtyInCart} / ${nextTier.qty} unidades
                </div>
              </div>`;
              }
            }
          }
          const subtotalHTML = totalDiscount > 0
            ? `<span class="cart-subtotal-original">$${subtotalValue.toLocaleString('es-AR')}</span>
           <span class="cart-subtotal-discount">$${(subtotalValue - totalDiscount).toLocaleString('es-AR')}</span>`
            : `$${subtotalValue.toLocaleString('es-AR')}`;

          totalsBox.innerHTML = `
        ${promoProgressHTML}
        <div class="cart-row"><span>Subtotal</span><span>${subtotalHTML}</span></div>
        ${discountLines.map(({ promo, discount }) => 
          `<div class="cart-discount-row">
            <span class="cart-discount-label">Ahorraste $${discount.saved.toLocaleString('es-AR')} con ${escapeHtml(promo.name)}</span>
            <span class="cart-discount-val">− $${discount.saved.toLocaleString('es-AR')}</span>
          </div>`
        ).join('')}
        <div class="cart-row"><span>Envío</span><span>${deliveryCost > 0 ? '$' + deliveryCost.toLocaleString('es-AR') : '$0'}</span></div>
        <div class="cart-row grand"><span>Total</span><span>$${totalValue.toLocaleString('es-AR')}</span></div>`;
          totalsBox.style.display = hasItems ? '' : 'none';
        }
        document.getElementById('order-fields').style.display = hasItems ? 'grid' : 'none';
        document.getElementById('order-note').style.display = hasItems ? 'block' : 'none';
        const waBtn = document.getElementById('btn-wa-cart');
        if (waBtn) waBtn.disabled = !hasItems;
      }
      function resetShippingState(clearMethod = false) {
        deliveryCost = 0; selectedPos = null;
        if (clearMethod) shippingMethod = '';
        const input = document.getElementById('cust-addr'); if (input) input.value = '';
        const status = document.getElementById('ship-status'); if (status) status.textContent = '';
        const btn = document.getElementById('calc-btn'); if (btn) { btn.textContent = 'Calcular'; btn.classList.remove('loading'); }
        document.querySelectorAll('.ship-zone-btn').forEach(el => el.classList.remove('active'));
      }
      function ensureShippingMethod() {
        const modes = getShippingModes();
        if (!modes.gps && !modes.zone) { shippingMethod = ''; return ''; }
        if (shippingMethod === 'gps' && !modes.gps) shippingMethod = '';
        if (shippingMethod === 'zone' && !modes.zone) shippingMethod = '';
        if (!shippingMethod) shippingMethod = modes.gps ? 'gps' : 'zone';
        return shippingMethod;
      }
      function renderShippingUI() {
        const selector = document.getElementById('ship-method-selector');
        const gpsBox = document.getElementById('ship-gps-box');
        const zoneBox = document.getElementById('ship-zone-box');
        const status = document.getElementById('ship-status');
        if (!selector || !gpsBox || !zoneBox || !status) return;
        const modes = getShippingModes();
        const method = ensureShippingMethod();
        if (!modes.gps && !modes.zone) {
          selector.style.display = 'none'; selector.innerHTML = ''; gpsBox.style.display = 'none'; zoneBox.style.display = 'none';
          status.textContent = 'No hay métodos de envío activos. El pedido se toma para coordinar.';
          return;
        }
        if (modes.gps && modes.zone) {
          selector.style.display = '';
          selector.innerHTML = `<div class="ship-method-grid"><button type="button" class="ship-method-btn ${method === 'gps' ? 'active' : ''}" onclick="Cart.selectShippingMethod('gps')"><span class="ship-method-name">Calculador por GPS</span><span class="ship-method-sub">Distancia por dirección o ubicación actual</span></button><button type="button" class="ship-method-btn ${method === 'zone' ? 'active' : ''}" onclick="Cart.selectShippingMethod('zone')"><span class="ship-method-name">Zonas fijas</span><span class="ship-method-sub">Cipolletti, Neuquén o Fernández Oro</span></button></div>`;
        } else {
          selector.style.display = 'none'; selector.innerHTML = '';
        }
        gpsBox.style.display = method === 'gps' ? '' : 'none';
        if (method === 'zone') {
          const zones = Array.isArray(STORE.shippingZones) ? STORE.shippingZones : [];
          zoneBox.style.display = '';
          zoneBox.innerHTML = `<div class="ship-calc-label" style="margin-bottom:.45rem">Seleccioná tu zona</div><div class="ship-zone-grid">${zones.map(z => `<button type="button" class="ship-zone-btn ${selectedPos?.zoneId === z.id ? 'active' : ''}" data-zone-id="${z.id}" onclick="Cart.selectZone('${z.id}')"><span class="ship-zone-name">${escapeHtml(z.name)}</span><span class="ship-zone-price">$${Number(z.price || 0).toLocaleString('es-AR')}</span></button>`).join('')}</div>`;
        } else {
          zoneBox.style.display = 'none'; zoneBox.innerHTML = '';
        }
      }
      function isMobileCartMode() { return window.innerWidth < 768 }
      function open(mode = 'full') {
        const overlay = document.getElementById('cart-overlay');
        const panel = document.getElementById('cart-panel');
        if (!overlay || !panel) return;
        overlay.classList.remove('peek');
        panel.classList.remove('peek');
        panel.style.minHeight = '';
        overlay.classList.add('open');
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
        trackZone('cart');
        render()
      }
      function close() {
        const overlay = document.getElementById('cart-overlay');
        const panel = document.getElementById('cart-panel');
        overlay?.classList.remove('open', 'peek');
        panel?.classList.remove('open', 'peek');
        document.body.style.overflow = '';
        closeSuggestions()
      }
      function addItem(p) { const ex = items.find(i => i.id === p.id); if (ex) ex.qty = Math.min(ex.qty + 1, 99); else items.push({ id: p.id, name: p.name, price: p.price, emoji: p.emoji, images: p.images || [], size: p.size || '35 ml · EDP', qty: 1, _isPromo: !!p._isPromo, _promoId: p._promoId || null, _promoQty: p._promoQty || null, _promoFragrances: p._promoFragrances || null }); save(); render(); updateCartBadge(true); showAddToast(p.name); trackZone('addToCart'); setTimeout(() => checkPromoEligibilityForProduct(p), 300) }
      function updateQty(id, d) { const it = items.find(i => i.id === id); if (!it) return; it.qty += d; if (it.qty <= 0) items = items.filter(i => i.id !== id); save(); render(); updateCartBadge(true); setTimeout(() => { if (typeof checkPromoEligibility === 'function') checkPromoEligibility(); }, 50); }
      function remove(id) { items = items.filter(i => i.id !== id); save(); render(); updateCartBadge(true); setTimeout(() => { if (typeof checkPromoEligibility === 'function') checkPromoEligibility(); }, 50); }
      function render() {
        updateCartBadge(false);
        const body = document.getElementById('cart-body'); const calcBox = document.getElementById('ship-calc-box'); const waBtn = document.getElementById('btn-wa-cart');
        if (!body) return;
        const hasItems = items.length > 0;
        if (calcBox) calcBox.style.display = hasItems ? '' : 'none';
        if (!hasItems) {
          body.innerHTML = '<div class="cart-empty"><span class="cart-empty-ico">🛍️</span><p class="cart-empty-txt">Tu carrito está vacío.<br>Descubrí nuestra colección.</p></div>';
          resetShippingState(true);
          refreshTotals();
          if (waBtn) waBtn.disabled = true;
          return;
        }
        body.innerHTML = items.map(it => {
          const itemProduct = Array.isArray(PRODUCTS) ? PRODUCTS.find(p => p.id === it.id) : null;
          const hasActivePromo = getAssignedPromoIds(itemProduct).length > 0;
          const promoTag = hasActivePromo
            ? '<span class="ci-promo-tag">🎁 En promo</span>'
            : '';
          return `<div class="cart-item" style="display:flex;gap:.75rem;align-items:flex-start;padding:.75rem 0;border-bottom:1px solid var(--border)">
      <div class="ci-thumb">${it.images?.[0]
            ? `<img src="${it.images[0]}" alt="${escapeHtml(it.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"/>`
            : it.emoji || '🌸'}</div>
      <div class="ci-info">
        <div class="ci-name">${escapeHtml(it.name)}</div>
        <div class="ci-sub">${escapeHtml(it.size || '35 ml · EDP')}</div>
        ${promoTag}
        <div class="ci-price">$${(it.price * it.qty).toLocaleString('es-AR')}</div>
        <div class="qty-row">
          <button class="qty-btn" onclick="Cart.updateQty('${it.id}',-1)">−</button>
          <span class="qty-val">${it.qty}</span>
          <button class="qty-btn" onclick="Cart.updateQty('${it.id}',1)">+</button>
          <button class="ci-rm" onclick="Cart.remove('${it.id}')">Eliminar</button>
        </div>
      </div>
    </div>`;
        }).join('');
        renderShippingUI();
        refreshTotals();
      }
      function selectShippingMethod(method) { shippingMethod = method; deliveryCost = 0; selectedPos = null; const status = document.getElementById('ship-status'); if (status) status.textContent = ''; const input = document.getElementById('cust-addr'); if (input) input.value = ''; renderShippingUI(); refreshTotals(); }
      function onAddrInput(val) { if (ensureShippingMethod() !== 'gps') return; selectedPos = null; deliveryCost = 0; refreshTotals(); const btn = document.getElementById('btn-wa-cart'); if (btn) btn.disabled = true; clearTimeout(sugTimeout); if (val.length < 4) { closeSuggestions(); return } sugTimeout = setTimeout(() => fetchSuggestions(val), 400) }
      async function fetchSuggestions(q) { try { const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&countrycodes=ar`; const res = await fetch(url, { headers: { 'Accept-Language': 'es', 'User-Agent': 'AURA-Parfum/1.0' } }); showSuggestions(await res.json()) } catch (e) { closeSuggestions() } }
      function showSuggestions(results) { const box = document.getElementById('addr-suggestions'); if (!box) return; if (!results || !results.length) { closeSuggestions(); return } box.innerHTML = results.map((r, i) => `<div class="addr-sug-item" onclick="Cart.selectAddr(${i})" data-idx="${i}">${r.display_name}</div>`).join(''); box._results = results; box.classList.add('open'); box.style.display = 'block' }
      function closeSuggestions() { const box = document.getElementById('addr-suggestions'); if (box) { box.classList.remove('open'); box.style.display = 'none'; box._results = null } }
      function selectAddr(idx) { if (ensureShippingMethod() !== 'gps') return; const box = document.getElementById('addr-suggestions'); if (!box || !box._results) return; const r = box._results[idx]; selectedPos = { lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name }; const input = document.getElementById('cust-addr'); if (input) input.value = r.display_name; closeSuggestions(); calcFromPos(selectedPos.lat, selectedPos.lng, selectedPos.label) }
      function calcDelivery() { if (ensureShippingMethod() !== 'gps') return; if (selectedPos) { calcFromPos(selectedPos.lat, selectedPos.lng, selectedPos.label); return } const status = document.getElementById('ship-status'); if (!navigator.geolocation) { if (status) status.textContent = 'GPS no disponible. Ingresá tu dirección.'; return } const btn = document.getElementById('calc-btn'); if (btn) btn.classList.add('loading'); if (status) status.textContent = 'Obteniendo ubicación...'; navigator.geolocation.getCurrentPosition(pos => calcFromPos(pos.coords.latitude, pos.coords.longitude, 'Tu ubicación actual (GPS)'), () => { if (btn) btn.classList.remove('loading'); if (status) status.textContent = 'No se pudo obtener GPS. Ingresá tu dirección.' }, { timeout: 8000, enableHighAccuracy: true }) }
      function calcFromPos(lat, lng, label) { const btn = document.getElementById('calc-btn'); const status = document.getElementById('ship-status'); const waBtn = document.getElementById('btn-wa-cart'); const rawKm = haversine(ORIGIN.lat, ORIGIN.lng, lat, lng); const km = Math.ceil(rawKm); deliveryCost = km * config.rate; refreshTotals(); if (status) status.textContent = `✓ ${label.split(',')[0]} — ${rawKm.toFixed(1)} km (cobrado: ${km} km) — Envío: $${deliveryCost.toLocaleString('es-AR')}`; if (btn) { btn.classList.remove('loading'); btn.textContent = 'Recalcular' } if (waBtn) waBtn.disabled = false }
      function selectZone(zoneId) {
        if (ensureShippingMethod() !== 'zone') return;
        const zone = (Array.isArray(STORE.shippingZones) ? STORE.shippingZones : []).find(z => z.id === zoneId);
        if (!zone) return;
        deliveryCost = Number(zone.price || 0);
        selectedPos = { zoneId: zone.id, label: zone.name, fixed: true };
        const input = document.getElementById('cust-addr'); if (input) input.value = zone.name;
        document.querySelectorAll('.ship-zone-btn').forEach(el => el.classList.toggle('active', el.dataset.zoneId === zone.id));
        const status = document.getElementById('ship-status'); if (status) status.textContent = `✓ Zona seleccionada: ${zone.name} — Envío: $${deliveryCost.toLocaleString('es-AR')}`;
        refreshTotals();
      }
      function registerOrder(addr) { const customerName = document.getElementById('order-name').value.trim() || 'Cliente sin nombre'; const phone = document.getElementById('order-phone').value.trim() || 'Sin teléfono'; const notes = document.getElementById('order-notes').value.trim(); const order = { id: 'PED-' + Date.now().toString().slice(-6), customerName, phone, address: addr || 'No especificada', notes, shippingMethod: shippingMethod || 'coordinar', items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, size: i.size || '35 ml · EDP' })), subtotal: subtotal(), delivery: deliveryCost, total: total(), date: new Date().toISOString(), status: 'Pendiente de confirmación', channel: 'WhatsApp' }; ORDERS.unshift(order); saveOrdersLS(); upsertCustomerFromOrder(order); Dash.renderPedidos(); Dash.renderClientes(); Dash.updatePanelKPIs(); Dash.initAnalytics(); return order }
      function confirmWhatsApp() { if (!items.length) return; const name = document.getElementById('order-name').value.trim(); if (!name) { showToast('Ingresá al menos el nombre del cliente.', true); return } const modes = getShippingModes(); const addr = (document.getElementById('cust-addr').value.trim()) || 'No especificada'; const phone = document.getElementById('order-phone').value.trim(); const notes = document.getElementById('order-notes').value.trim(); if ((modes.gps || modes.zone) && deliveryCost <= 0) { showToast('Seleccioná o calculá el envío.', true); return } const order = registerOrder(addr); const waNum = STORE.waNum || config.waNum || '5492942444236'; const itemsStr = items.map(i => `• ${i.name} x${i.qty} — $${(i.price * i.qty).toLocaleString('es-AR')}`).join('\n'); const envioLabel = shippingMethod === 'zone' ? 'Zona fija' : shippingMethod === 'gps' ? 'GPS' : 'A coordinar'; const envioStr = deliveryCost > 0 ? `$${deliveryCost.toLocaleString('es-AR')}` : 'A calcular'; const { discountLines } = getAppliedDiscounts(); const discountText = discountLines.map(({ promo, discount }) => `\n💚 Descuento promo ${promo.name}: −$${discount.saved.toLocaleString('es-AR')}`).join(''); const templateData = { tienda: STORE.waName || 'AURA — Tienda Online', pedido_id: order.id, nombre: name, telefono: phone ? `\nTeléfono: ${phone}` : '', productos: itemsStr, subtotal: `$${subtotal().toLocaleString('es-AR')}`, metodo_envio: envioLabel, envio: envioStr, descuentos: discountText, total: `$${total().toLocaleString('es-AR')}`, direccion: addr, notas: notes ? `\n📝 Notas: ${notes}` : '' }; const finalMessage = buildWhatsAppMessageFromTemplate(STORE.waTemplate || getDefaultWATemplate(), templateData); const msg = encodeURIComponent(finalMessage); window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank'); items = []; resetShippingState(true); save(); document.getElementById('order-name').value = ''; document.getElementById('order-phone').value = ''; document.getElementById('order-notes').value = ''; close(); render() }
      load();
      return { open, close, addItem, updateQty, remove, total, count, items: () => items, onAddrInput, selectAddr, calcDelivery, confirmWhatsApp, closeSuggestions, selectShippingMethod, selectZone, updateCartBadge };
    })();

    function getAssignedPromoIds(product) {
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
    }

    function getCartActiveDiscounts(cartItems) {
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
          return getAssignedPromoIds(product).includes(promo.id);
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
    }

    function getCartActiveDiscount(cartItems) {
      const aggregated = getCartActiveDiscounts(cartItems);
      if (!aggregated.discountLines.length) return null;
      const first = aggregated.discountLines[0];
      return { promo: first.promo, tier: first.discount.tier, saved: first.discount.saved, qty: first.discount.tier?.qty || 0 };
    }

    function checkPromoEligibility() {
      const appliedDiscount = getCartActiveDiscount(Cart.items());
      if (appliedDiscount) {
        showPromoDiscountToast(appliedDiscount.promo, appliedDiscount);
      }
    }

    function checkPromoEligibilityForProduct(product) {
      const cartItems = Cart.items();
      const relevantPromoIds = getAssignedPromoIds(product);
      if (!relevantPromoIds.length) return;
      for (const promoId of relevantPromoIds) {
        const promo = getActivePromos().find(p => p.id === promoId);
        if (!promo) continue;
        const totalQty = cartItems.reduce((sum, item) => {
          if (item._isPromo) return sum;
          const p = Array.isArray(PRODUCTS) ? PRODUCTS.find(x => x.id === item.id) : null;
          const belongsToPromo = getAssignedPromoIds(p).includes(promoId);
          return belongsToPromo ? sum + Number(item.qty || 0) : sum;
        }, 0);
        const discount = typeof getPromoDiscount === 'function' ? getPromoDiscount(promo, totalQty) : null;
        if (discount && discount.saved > 0) {
          showPromoDiscountToast(promo, discount);
          return;
        }
      }
    }

    let _promoToastTimer = null;
    function showPromoDiscountToast(promo, discount) {
      let toast = document.getElementById('promo-discount-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'promo-discount-toast';
        toast.className = 'promo-discount-toast';
        document.body.appendChild(toast);
      }
      toast.innerHTML = `
        <div class="promo-discount-toast-title">🎉 ¡Descuento disponible!</div>
        <div class="promo-discount-toast-body">Con ${discount.tier.qty} unidades podés aprovechar la promo <strong>${escapeHtml(promo.name)}</strong></div>
        <div class="promo-discount-toast-savings">Ahorrás $${discount.saved.toLocaleString('es-AR')}</div>
        <div style="margin-top:.5rem">
          <button onclick="PromoModal.open('${promo.id}');document.getElementById('promo-discount-toast').classList.remove('visible')" style="background:linear-gradient(135deg,#D4A843,#9E7A10);color:#1a1200;border:none;border-radius:8px;padding:.4rem .9rem;font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit">Ver promo →</button>
        </div>`;
      toast.classList.add('visible');
      clearTimeout(_promoToastTimer);
      _promoToastTimer = setTimeout(() => toast.classList.remove('visible'), 7000);
    }

    let revenueChart = null, analLineChart = null, analDonutChart = null, currentFilter = 'todos', currentSearch = '', invStatusFilter = 'todos', invTextFilter = '';
    function getRevenueSeries() { if (ORDERS.length) { const byMonth = {}; ORDERS.forEach(o => { const d = new Date(o.date); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; byMonth[k] = (byMonth[k] || 0) + o.total }); const keys = Object.keys(byMonth).sort(); return { labels: keys.map(k => { const [y, m] = k.split('-'); return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('es-AR', { month: 'short' }) }), data: keys.map(k => byMonth[k]) } } return { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], data: [800, 950, 1100, 980, 1350, 1200] } }
    function initChart(period = 'Semanal') { const ctx = document.getElementById('revenue-chart'); if (!ctx) return; let d; if (period === 'Semanal') { const last7 = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']; const totals = [0, 0, 0, 0, 0, 0, 0]; ORDERS.forEach(o => { const day = (new Date(o.date).getDay() + 6) % 7; totals[day] += o.total }); d = { labels: last7, data: totals.some(Boolean) ? totals : [120, 180, 160, 220, 195, 285, 250] } } else if (period === 'Mensual') { d = getRevenueSeries() } else { const yearly = {}; ORDERS.forEach(o => { const y = new Date(o.date).getFullYear(); yearly[y] = (yearly[y] || 0) + o.total }); const years = Object.keys(yearly).sort(); d = { labels: years.length ? years : ['2021', '2022', '2023', '2024', '2025', '2026'], data: years.length ? years.map(y => yearly[y]) : [5000, 6200, 7800, 9100, 11000, 14500] } } if (revenueChart) revenueChart.destroy(); revenueChart = new Chart(ctx, { type: 'line', data: { labels: d.labels, datasets: [{ data: d.data, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,.08)', tension: .4, pointBackgroundColor: '#10B981', pointRadius: 4, fill: true }] }, options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }, y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => '$' + Number(v).toLocaleString('es-AR') } } }, responsive: true, maintainAspectRatio: true } }) }
    function buildHeroTitle(title) { const words = String(title || '').trim().split(/\s+/).filter(Boolean); if (!words.length) return 'AURA'; const last = words.pop(); return `${escapeHtml(words.join(' '))}${words.length ? '<br>' : ''}<em>${escapeHtml(last)}</em>` }
    function renderStoreFilters() {
      const box = document.getElementById('filter-chips');
      if (!box) return;
      box.innerHTML = `<button class="chip ${currentFilter === 'todos' ? 'active' : ''}" data-cat="todos" onclick="App.filter(this)">Todos</button>` +
        `<button class="chip promo-chip ${currentFilter === 'promos' ? 'active' : ''}" data-cat="promos" onclick="App.filter(this)">🔥 PROMOS</button>` +
        TAXONOMY.categories.map(c => `<button class="chip ${currentFilter === c.id ? 'active' : ''}" data-cat="${c.id}" onclick="App.filter(this)">${escapeHtml(c.name)}</button>`).join('');
    }
    function buildProductCardCarousel(p, idx) {
      const images = Array.isArray(p.images) && p.images.length ? p.images.filter(Boolean) : [];
      const eager = idx < 6;
      const name = escapeHtml(p.name);
      if (!images.length) return `<div class="prod-thumb-svg">${PERFUME_SVG}</div>`;
      if (images.length === 1) {
        return `<div class="prod-thumb-skeleton" id="sk-${p.id}-0"></div><img src="${images[0]}" alt="${name}" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''} decoding="async" onload="const sk=document.getElementById('sk-${p.id}-0');if(sk)sk.classList.add('loaded')"/>`;
      }
      const slides = images.map((src, imageIdx) => `<div class="prod-carousel-slide"><div class="prod-thumb-skeleton" id="sk-${p.id}-${imageIdx}"></div><img src="${src}" alt="${name}" loading="${eager && imageIdx === 0 ? 'eager' : 'lazy'}"${eager && imageIdx === 0 ? ' fetchpriority="high"' : ''} decoding="async" draggable="false" onload="const sk=document.getElementById('sk-${p.id}-${imageIdx}');if(sk)sk.classList.add('loaded')"/></div>`).join('');
      const dots = images.map((_, imageIdx) => `<button class="prod-carousel-dot ${imageIdx === 0 ? 'active' : ''}" type="button" aria-label="Ver imagen ${imageIdx + 1}" data-index="${imageIdx}"></button>`).join('');
      return `<div class="prod-carousel" data-carousel data-product-id="${p.id}" data-index="0"><div class="prod-carousel-track">${slides}</div><button class="prod-carousel-nav prev" type="button" aria-label="Imagen anterior">‹</button><button class="prod-carousel-nav next" type="button" aria-label="Imagen siguiente">›</button><div class="prod-carousel-dots">${dots}</div></div>`;
    }

    function initProductCarousels(scope = document) {
      const carousels = scope.querySelectorAll('[data-carousel]');
      carousels.forEach(carousel => {
        if (carousel.dataset.carouselReady === '1') return;
        carousel.dataset.carouselReady = '1';
        const track = carousel.querySelector('.prod-carousel-track');
        const slides = Array.from(carousel.querySelectorAll('.prod-carousel-slide'));
        const dots = Array.from(carousel.querySelectorAll('.prod-carousel-dot'));
        const prev = carousel.querySelector('.prod-carousel-nav.prev');
        const next = carousel.querySelector('.prod-carousel-nav.next');
        if (!track || slides.length < 2) return;

        let current = 0;
        let startX = 0;
        let currentX = 0;
        let dragging = false;
        let moved = false;

        const goTo = (index, animate = true) => {
          current = (index + slides.length) % slides.length;
          carousel.dataset.index = String(current);
          track.style.transition = animate ? 'transform .38s cubic-bezier(.22, 1, .36, 1)' : 'none';
          track.style.transform = `translateX(-${current * 100}%)`;
          dots.forEach((dot, dotIdx) => dot.classList.toggle('active', dotIdx === current));
        };

        const stopCardClickOnce = () => {
          carousel.dataset.preventClick = '1';
          setTimeout(() => { carousel.dataset.preventClick = '0'; }, 120);
        };

        prev.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          goTo(current - 1);
        });

        next.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          goTo(current + 1);
        });

        dots.forEach((dot, dotIdx) => {
          dot.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            goTo(dotIdx);
          });
        });

        carousel.addEventListener('click', e => {
          if (carousel.dataset.preventClick === '1') {
            e.preventDefault();
            e.stopPropagation();
            carousel.dataset.preventClick = '0';
          }
        }, true);

        carousel.addEventListener('pointerdown', e => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          dragging = true;
          moved = false;
          startX = e.clientX;
          currentX = e.clientX;
          track.style.transition = 'none';
        });

        carousel.addEventListener('pointermove', e => {
          if (!dragging) return;
          currentX = e.clientX;
          const delta = currentX - startX;
          if (Math.abs(delta) > 6) moved = true;
          const base = -current * carousel.clientWidth;
          track.style.transform = `translateX(${base + delta}px)`;
        });

        const endDrag = () => {
          if (!dragging) return;
          dragging = false;
          const delta = currentX - startX;
          if (Math.abs(delta) > 35) {
            goTo(current + (delta < 0 ? 1 : -1));
            stopCardClickOnce();
          } else {
            goTo(current);
          }
        };

        carousel.addEventListener('pointerup', endDrag);
        carousel.addEventListener('pointercancel', endDrag);
        carousel.addEventListener('pointerleave', () => {
          if (dragging) endDrag();
        });
        carousel.addEventListener('dragstart', e => e.preventDefault());

        goTo(0, false);
      });
    }

    function renderProducts() {
      const grid = document.getElementById('product-grid');
      if (!grid) return;
      renderStoreFilters();
      const label = document.getElementById('store-products-label');

      if (currentFilter === 'promos') {
        const q = currentSearch.toLowerCase().trim();
        const promos = getActivePromos().filter(promo => !q || [promo.name, promo.note, ...(promo.fragrances || [])].join(' ').toLowerCase().includes(q));
        if (label) {
          label.textContent = '🔥 Promos y Combos';
          label.style.display = promos.length ? '' : 'none';
        }
        grid.innerHTML = promos.length ? promos.map(promo => {
          const firstTier = promo.tiers[0];
          const tiersPreview = promo.tiers.slice(0, 3).map(t => t.label).join('<br>');
          return `<div class="prod-card promo-card" onclick="PromoModal.open('${promo.id}')">
            <div class="prod-thumb">
              ${promo.images?.[0]
                ? `<div class="prod-thumb-skeleton" id="sk-promo-${promo.id}-0"></div><img src="${promo.images[0]}" alt="${escapeHtml(promo.name)}" loading="lazy" decoding="async" onload="const sk=document.getElementById('sk-promo-${promo.id}-0');if(sk)sk.classList.add('loaded')">`
                : `<div class="prod-thumb-svg aura-store-emoji">${escapeHtml(promo.emoji || '🎁')}</div>`}
              <span class="prod-badge" style="position:absolute;top:.5rem;right:.5rem;background:linear-gradient(135deg,#E2C987,#B9933B);color:#1a1200;padding:.2rem .55rem;border-radius:99px;font-size:.58rem;font-weight:800;letter-spacing:.06em">PROMO</span>
            </div>
            <div class="prod-body">
              <div class="prod-name" style="color:var(--gold)">${escapeHtml(promo.name)}</div>
              <div class="promo-card-tiers">${tiersPreview}</div>
              <div class="prod-size" style="color:rgba(255,255,255,.35);font-size:.65rem">Desde $${firstTier.unitPrice.toLocaleString('es-AR')}/u · ${promo.fragrances.length} fragancias</div>
            </div>
            <div class="prod-footer">
              <span class="prod-price">desde $${firstTier.total.toLocaleString('es-AR')}</span>
              <button class="prod-atc" style="background:linear-gradient(135deg,#E2C987,#B9933B);color:#1a1200;font-weight:700" onclick="event.stopPropagation();PromoModal.open('${promo.id}')">Armar combo</button>
            </div>
          </div>`;
        }).join('') : '<div class="section-card" style="grid-column:1/-1"><div class="tbl-empty">No hay promos activas en este momento.</div></div>';
        return;
      }

      let list = PRODUCTS.filter(p => {
        const q = currentSearch.toLowerCase().trim();
        const matchesFilter = currentFilter === 'todos' || p.cat === currentFilter || p.cat2 === currentFilter;
        const hay = [p.name, p.desc, getCategoryName(p.cat), getSubcategoryName(p.cat2)].join(' ').toLowerCase();
        return matchesFilter && (!q || hay.includes(q));
      });

      if (label) {
        const cat = currentFilter === 'todos' ? 'Colección completa' : TAXONOMY.categories.find(c => c.id === currentFilter)?.name || 'Colección';
        label.textContent = `${cat} — ${list.length} fragancia${list.length !== 1 ? 's' : ''}`;
        label.style.display = list.length ? '' : 'none';
      }

      grid.innerHTML = list.length ? list.map((p, idx) => {
        const thumbContent = buildProductCardCarousel(p, idx);
        const isFav = typeof Favorites !== 'undefined' && Favorites.has(p.id);
        const isSinStock = typeof p.stock === 'number' && p.stock <= 0;
        const ribbon = isSinStock ? '<div class="ribbon">Sin stock</div>' : '';
        return `<div class="prod-card${isSinStock ? ' sin-stock' : ''}" onclick="App.openProductDetail('${p.id}')" data-click-zone="productCard"><div class="prod-thumb img-box">${thumbContent}${ribbon}${p.badge ? `<span class="prod-badge">${escapeHtml(p.badge)}</span>` : ''}<button class="prod-heart${isFav ? ' liked' : ''}" data-pid="${p.id}" onclick="event.stopPropagation();Favorites.toggle('${p.id}',this)" title="Favorito">♡</button></div><div class="prod-body"><div class="prod-cat">${escapeHtml(getCategoryName(p.cat))} / ${escapeHtml(getSubcategoryName(p.cat2))}</div><div class="prod-name">${escapeHtml(p.name)}</div><div class="prod-size">${escapeHtml(p.size || '35 ml · EDP')}</div><div class="prod-footer"><span class="prod-price">$${p.price.toLocaleString('es-AR')}</span><button class="prod-atc" onclick="event.stopPropagation();Cart.addItem(PRODUCTS.find(x=>x.id==='${p.id}'))">+ Añadir</button></div></div></div>`;
      }).join('') : '<div class="section-card" style="grid-column:1/-1"><div class="tbl-empty">No hay fragancias para ese filtro.</div></div>';
      initProductCarousels(grid);
    }
    function upsertCustomerFromOrder(order) { const key = (order.phone || '').trim() || order.customerName.toLowerCase(); const idx = CUSTOMERS.findIndex(c => ((c.phone || '').trim() || c.name.toLowerCase()) === key); if (idx >= 0) { CUSTOMERS[idx].name = order.customerName; CUSTOMERS[idx].phone = order.phone; CUSTOMERS[idx].orders = (CUSTOMERS[idx].orders || 0) + 1; CUSTOMERS[idx].totalSpent = (CUSTOMERS[idx].totalSpent || 0) + order.total; CUSTOMERS[idx].lastOrder = order.date; CUSTOMERS[idx].segment = (CUSTOMERS[idx].totalSpent || 0) >= 50000 ? 'VIP' : 'Activo' } else { CUSTOMERS.push({ name: order.customerName, phone: order.phone, orders: 1, totalSpent: order.total, lastOrder: order.date, segment: order.total >= 50000 ? 'VIP' : 'Nuevo' }) } saveCustomersLS() }
    function rebuildCustomersFromOrders() {
      const grouped = {};
      ORDERS.forEach(order => {
        const key = (order.phone || '').trim() || String(order.customerName || '').toLowerCase();
        if (!key) return;
        if (!grouped[key]) {
          grouped[key] = {
            name: order.customerName || 'Cliente sin nombre',
            phone: order.phone || '',
            orders: 0,
            totalSpent: 0,
            lastOrder: order.date,
            segment: 'Nuevo'
          };
        }
        grouped[key].name = order.customerName || grouped[key].name;
        grouped[key].phone = order.phone || grouped[key].phone;
        grouped[key].orders += 1;
        grouped[key].totalSpent += Number(order.total || 0);
        if (!grouped[key].lastOrder || new Date(order.date) > new Date(grouped[key].lastOrder)) grouped[key].lastOrder = order.date;
      });
      CUSTOMERS = Object.values(grouped).map(c => ({
        ...c,
        segment: c.totalSpent >= 50000 ? 'VIP' : (c.orders > 1 ? 'Activo' : 'Nuevo')
      })).sort((a, b) => new Date(b.lastOrder || 0) - new Date(a.lastOrder || 0));
      saveCustomersLS();
    }
    function trackZone(zone) { HEATMAP[zone] = (HEATMAP[zone] || 0) + 1; saveHeatmapLS(); const onAnaliticas = document.getElementById('sec-analiticas')?.style.display !== 'none'; if (onAnaliticas) Dash.renderHeatmap() }

    const Dash = {
      renderInventory() { const tbody = document.getElementById('inv-tbody'); if (!tbody) return; this.renderInventoryFilters(); let list = PRODUCTS.filter(p => { const txt = invTextFilter.toLowerCase().trim(); const mt = !txt || [p.name, p.desc, getCategoryName(p.cat), getSubcategoryName(p.cat2)].join(' ').toLowerCase().includes(txt); let ok = true; if (invStatusFilter === 'stock') ok = (p.stock || 0) > 3; else if (invStatusFilter === 'bajo') ok = (p.stock || 0) > 0 && (p.stock || 0) <= 3; else if (invStatusFilter === 'agotado') ok = (p.stock || 0) === 0; else if (invStatusFilter !== 'todos') ok = p.cat === invStatusFilter || p.cat2 === invStatusFilter; return mt && ok }); if (!list.length) { tbody.innerHTML = '<tr><td colspan="6" class="tbl-empty">Sin resultados.</td></tr>'; return } tbody.innerHTML = list.map(p => { const s = p.stock || 0, pct = Math.min(100, Math.round((s / 15) * 100)), cls = s === 0 ? 'empty' : s <= 3 ? 'low' : '', badge = s === 0 ? '<span class="badge red">Agotado</span>' : s <= 3 ? '<span class="badge yellow">Stock bajo</span>' : '<span class="badge green">En stock</span>'; const media = p.images?.[0] ? `style="background-image:url('${p.images[0]}')"` : ''; return `<tr><td><div class="tbl-prod"><div class="inventory-thumb" ${media}>${p.images?.[0] ? '' : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;opacity:.5">${PERFUME_SVG}</div>`}</div><div><div class="tbl-prod-name">${escapeHtml(p.name)}</div><div class="tbl-prod-sub">${escapeHtml(p.size || '35 ml · EDP')}</div></div></div></td><td>${escapeHtml(getCategoryName(p.cat))} / ${escapeHtml(getSubcategoryName(p.cat2))}</td><td>${s}<span class="stock-bar"><span class="stock-bar-fill ${cls}" style="width:${pct}%"></span></span></td><td>$${p.price.toLocaleString('es-AR')}</td><td>${badge}</td><td><button class="tbl-action" onclick="Dash.editProduct('${p.id}')">Editar</button><button class="tbl-action del" onclick="Dash.deleteProduct('${p.id}')">Eliminar</button></td></tr>` }).join('') },
      renderInventoryFilters() { const row = document.getElementById('inv-filter-row'); if (!row) return; row.innerHTML = `<button class="fc ${invStatusFilter === 'todos' ? 'active' : ''}" data-f="todos" onclick="Dash.invFilter(this)">Todos</button><button class="fc ${invStatusFilter === 'stock' ? 'active' : ''}" data-f="stock" onclick="Dash.invFilter(this)">En stock</button><button class="fc ${invStatusFilter === 'bajo' ? 'active' : ''}" data-f="bajo" onclick="Dash.invFilter(this)">Stock bajo</button><button class="fc ${invStatusFilter === 'agotado' ? 'active' : ''}" data-f="agotado" onclick="Dash.invFilter(this)">Agotado</button>` + TAXONOMY.categories.map(c => `<button class="fc ${invStatusFilter === c.id ? 'active' : ''}" data-f="${c.id}" onclick="Dash.invFilter(this)">${escapeHtml(c.name)}</button>`).join('') },
      invFilter(btn) { document.querySelectorAll('#inv-filter-row .fc').forEach(b => b.classList.remove('active')); btn.classList.add('active'); invStatusFilter = btn.dataset.f; this.renderInventory() },
      filterInventory(val) { invTextFilter = val; this.renderInventory() },
      getOrderStatusBadgeClass(status) {
        const normalized = String(status || '').toLowerCase();
        if (normalized.includes('confirm')) return 'green';
        if (normalized.includes('deneg') || normalized.includes('cancel')) return 'red';
        return 'blue';
      },
      renderPedidos() {
        const t = document.getElementById('ped-tbody');
        if (!t) return;
        const q = (document.getElementById('ped-search')?.value || '').toLowerCase().trim();
        let list = ORDERS.filter(o => !q || [o.id, o.customerName, o.phone, o.address, o.status, o.items.map(i => i.name).join(' ')].join(' ').toLowerCase().includes(q));
        if (!list.length) {
          t.innerHTML = '<tr><td colspan="8" class="tbl-empty">0 de 0 pedidos</td></tr>';
          return;
        }
        t.innerHTML = list.map(o => {
          const badgeClass = this.getOrderStatusBadgeClass(o.status);
          return `<tr>
            <td><strong>${o.id}</strong></td>
            <td>${escapeHtml(o.customerName)}<div class="tbl-prod-sub">${escapeHtml(o.phone || 'Sin teléfono')}</div></td>
            <td>${escapeHtml(o.items.map(i => `${i.name} x${i.qty}`).join(', '))}</td>
            <td>$${Number(o.total).toLocaleString('es-AR')}</td>
            <td>${o.delivery ? `$${Number(o.delivery).toLocaleString('es-AR')}` : 'Retiro / sin cálculo'}</td>
            <td>${formatDateTime(o.date)}</td>
            <td><span class="badge ${badgeClass}">${escapeHtml(o.status || 'Pendiente de confirmación')}</span></td>
            <td>
              <div class="order-actions-cell">
                <button class="tbl-action" onclick="Dash.editOrder('${o.id}')">Editar</button>
                <button class="tbl-action ok" onclick="Dash.setOrderStatus('${o.id}','Confirmado')">Confirmar</button>
                <button class="tbl-action warn" onclick="Dash.setOrderStatus('${o.id}','Denegado')">Denegar</button>
                <button class="tbl-action del" onclick="Dash.deleteOrder('${o.id}')">Eliminar</button>
              </div>
            </td>
          </tr>`;
        }).join('');
      },
      filterPedidos() { this.renderPedidos() },
      editOrder(id) {
        const order = ORDERS.find(o => o.id === id);
        if (!order) return;
        document.getElementById('ord-edit-id').value = order.id;
        document.getElementById('ord-edit-code').textContent = order.id;
        document.getElementById('ord-edit-name').value = order.customerName || '';
        document.getElementById('ord-edit-phone').value = order.phone || '';
        document.getElementById('ord-edit-address').value = order.address || '';
        document.getElementById('ord-edit-delivery').value = Number(order.delivery || 0);
        document.getElementById('ord-edit-status').value = order.status || 'Pendiente de confirmación';
        document.getElementById('ord-edit-notes').value = order.notes || '';
        document.getElementById('ord-edit-items').innerHTML = (order.items || []).map(item => `<div class="ord-edit-item"><span>${escapeHtml(item.name)}</span><strong>x${Number(item.qty || 0)}</strong></div>`).join('') || '<div class="tbl-empty">Sin productos</div>';
        document.getElementById('order-edit-modal').classList.add('active');
      },
      closeOrderEdit() {
        document.getElementById('order-edit-modal')?.classList.remove('active');
      },
      saveOrderEdit() {
        const id = document.getElementById('ord-edit-id')?.value;
        const order = ORDERS.find(o => o.id === id);
        if (!order) return;
        order.customerName = document.getElementById('ord-edit-name').value.trim() || 'Cliente sin nombre';
        order.phone = document.getElementById('ord-edit-phone').value.trim();
        order.address = document.getElementById('ord-edit-address').value.trim() || 'No especificada';
        order.delivery = Math.max(0, Number(document.getElementById('ord-edit-delivery').value || 0));
        order.status = document.getElementById('ord-edit-status').value || 'Pendiente de confirmación';
        order.notes = document.getElementById('ord-edit-notes').value.trim();
        order.total = Number(order.subtotal || 0) + Number(order.delivery || 0);
        saveOrdersLS();
        rebuildCustomersFromOrders();
        this.renderPedidos();
        this.renderClientes();
        this.updatePanelKPIs();
        this.initAnalytics();
        this.closeOrderEdit();
        showToast('Pedido actualizado ✓');
      },
      setOrderStatus(id, status) {
        const order = ORDERS.find(o => o.id === id);
        if (!order) return;
        order.status = status;
        saveOrdersLS();
        this.renderPedidos();
        this.renderClientes();
        this.updatePanelKPIs();
        this.initAnalytics();
        showToast(`Pedido ${id} ${String(status).toLowerCase()} ✓`);
      },
      deleteOrder(id) {
        const order = ORDERS.find(o => o.id === id);
        if (!order) return;
        if (!confirm(`Eliminar el pedido ${id} de ${order.customerName || 'este cliente'}?`)) return;
        ORDERS = ORDERS.filter(o => o.id !== id);
        saveOrdersLS();
        rebuildCustomersFromOrders();
        this.renderPedidos();
        this.renderClientes();
        this.updatePanelKPIs();
        this.initAnalytics();
        showToast('Pedido eliminado ✓');
      },
      renderClientes() { const t = document.getElementById('cli-tbody'); if (!t) return; const q = (document.getElementById('cli-search')?.value || '').toLowerCase().trim(); let list = CUSTOMERS.filter(c => !q || [c.name, c.phone, c.segment].join(' ').toLowerCase().includes(q)); if (!list.length) { t.innerHTML = '<tr><td colspan="6" class="tbl-empty">0 clientes</td></tr>'; return } t.innerHTML = list.map(c => `<tr><td><strong>${escapeHtml(c.name)}</strong></td><td>${escapeHtml(c.phone || 'Sin teléfono')}</td><td>${c.orders || 0}</td><td>$${Number(c.totalSpent || 0).toLocaleString('es-AR')}</td><td>${c.lastOrder ? formatDateTime(c.lastOrder) : '—'}</td><td><span class="badge ${c.segment === 'VIP' ? 'green' : 'gray'}">${escapeHtml(c.segment || 'Activo')}</span></td></tr>`).join('') },
      filterClientes() { this.renderClientes() },
      renderHeatmap() { const box = document.getElementById('heatmap-grid'); if (!box) return; const labels = { hero: 'Hero / portada', filters: 'Filtros de catálogo', productCard: 'Fichas de producto', addToCart: 'Botones agregar', cart: 'Carrito', whatsapp: 'CTA WhatsApp', nav: 'Navegación', about: 'Nosotros / contacto' }; const total = Object.values(HEATMAP).reduce((a, b) => a + b, 0) || 1; box.innerHTML = Object.entries(labels).map(([k, label]) => { const val = HEATMAP[k] || 0; const intensity = Math.max(.08, Math.min(.95, val / Math.max(...Object.values(HEATMAP), 1))); const pct = Math.round((val / total) * 100); return `<div class="heat-cell" style="--intensity:${intensity}"><div class="heat-zone">${label}</div><div class="heat-value">${val}</div><div class="heat-sub">${pct}% de interacción</div></div>` }).join('') },
      initAnalytics() { const lineCtx = document.getElementById('anal-line-chart'); const donutCtx = document.getElementById('anal-donut-chart'); const revenue = getRevenueSeries(); if (lineCtx) { if (analLineChart) analLineChart.destroy(); analLineChart = new Chart(lineCtx, { type: 'line', data: { labels: revenue.labels, datasets: [{ data: revenue.data, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,.08)', tension: .35, pointRadius: 4, pointBackgroundColor: '#10B981', fill: true }] }, options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }, y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => '$' + Number(v).toLocaleString('es-AR') } } }, responsive: true, maintainAspectRatio: true } }) } if (donutCtx) { const cats = {}; PRODUCTS.forEach(p => { const n = getCategoryName(p.cat); cats[n] = (cats[n] || 0) + (p.stock || 0) }); if (analDonutChart) analDonutChart.destroy(); analDonutChart = new Chart(donutCtx, { type: 'doughnut', data: { labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: ['#F87171', '#92400e', '#8b5cf6', '#10B981', '#0ea5e9', '#f59e0b'], borderWidth: 0 }] }, options: { plugins: { legend: { position: 'right', labels: { font: { size: 11 }, color: '#334155', boxWidth: 14 } } }, responsive: true, maintainAspectRatio: true, cutout: '60%' } }) } const totalVentas = ORDERS.reduce((s, o) => s + o.total, 0); const ticket = ORDERS.length ? Math.round(totalVentas / ORDERS.length) : 0; document.getElementById('an-ticket').textContent = '$' + ticket.toLocaleString('es-AR'); document.getElementById('an-ticket-sub').textContent = ORDERS.length ? `${ORDERS.length} pedidos registrados` : 'Sin datos aún'; document.getElementById('an-pedmes').textContent = ORDERS.length; document.getElementById('an-pedmes-sub').textContent = ORDERS.length ? 'Pedidos acumulados' : 'Sin datos aún'; document.getElementById('an-clientes').textContent = CUSTOMERS.length; document.getElementById('an-agotados').textContent = PRODUCTS.filter(p => (p.stock || 0) === 0).length; this.renderHeatmap() },
      updatePanelKPIs() { const valor = PRODUCTS.reduce((s, p) => s + p.price * (p.stock || 0), 0); const skus = PRODUCTS.reduce((s, p) => s + (p.stock || 0), 0); const ingresos = ORDERS.reduce((s, o) => s + o.total, 0); document.getElementById('kpi-skus').textContent = skus; document.getElementById('kpi-valor').textContent = '$' + valor.toLocaleString('es-AR'); document.getElementById('kpi-ingresos').textContent = '$' + ingresos.toLocaleString('es-AR'); document.getElementById('kpi-ingresos-sub').textContent = ORDERS.length ? `↗ ${ORDERS.length} pedidos registrados` : '↗ Sin datos aún' },
      populateProductSelects() { const catSel = document.getElementById('ap-cat'); if (catSel) { catSel.innerHTML = TAXONOMY.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('') } const parent = document.getElementById('tax-parent-cat'); if (parent) { parent.innerHTML = TAXONOMY.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('') } this.syncSubcategorySelect() },
      syncSubcategorySelect() { const catId = document.getElementById('ap-cat')?.value || TAXONOMY.categories[0]?.id || ''; const subSel = document.getElementById('ap-cat2'); if (!subSel) return; const subs = getSubcategoriesByCategory(catId); subSel.innerHTML = `<option value="">Sin subcategoría</option>` + subs.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('') },
      openAddProduct() {
        document.getElementById('ap-title').textContent = 'Nueva Fragancia';
        document.getElementById('ap-edit-id').value = '';
        ['ap-name', 'ap-emoji', 'ap-badge', 'ap-desc'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('ap-price').value = '';
        document.getElementById('ap-stock').value = '5';
        document.getElementById('ap-size').value = '35 ml · EDP';
        this.populateProductSelects();
        // Reset URL fields
        const u1 = document.getElementById('ap-img1-url'); if (u1) u1.value = '';
        const u2 = document.getElementById('ap-img2-url'); if (u2) u2.value = '';
        const pu1 = document.getElementById('ap-img1-preview-url'); if (pu1) { pu1.style.backgroundImage = ''; pu1.textContent = 'Vista previa'; }
        const pu2 = document.getElementById('ap-img2-preview-url'); if (pu2) { pu2.style.backgroundImage = ''; pu2.textContent = 'Vista previa'; }
        document.getElementById('ap-modal').classList.add('active');
      },
      closeAddProduct() { document.getElementById('ap-modal').classList.remove('active') },
      switchImgTab(mode) {
        document.getElementById('img-mode-url').style.display = mode === 'url' ? '' : 'none';
        document.getElementById('img-mode-file').style.display = mode === 'file' ? '' : 'none';
        document.getElementById('tab-url').classList.toggle('active', mode === 'url');
        document.getElementById('tab-file').classList.toggle('active', mode === 'file');
      },
      previewUrl(url, previewId) {
        const box = document.getElementById(previewId);
        if (!box) return;
        if (url && url.startsWith('http')) {
          box.style.backgroundImage = `url('${url}')`;
          box.style.backgroundSize = 'cover';
          box.style.backgroundPosition = 'center';
          box.textContent = '';
        } else {
          box.style.backgroundImage = '';
          box.textContent = 'Vista previa';
        }
      },
      previewProductImage(evt, previewId) { const file = evt.target.files?.[0]; if (!file) return; const fr = new FileReader(); fr.onload = () => { const box = document.getElementById(previewId); box.style.backgroundImage = `url('${fr.result}')`; box.textContent = '' }; fr.readAsDataURL(file) },
      async getProductImagesFromInputs(existing = []) {
        const out = [...(existing || [])];
        const url1 = (document.getElementById('ap-img1-url')?.value || '').trim();
        const url2 = (document.getElementById('ap-img2-url')?.value || '').trim();
        if (url1) out[0] = url1;
        if (url2) out[1] = url2;
        return out.filter(Boolean).slice(0, 2);
      },
      editProduct(id) {
        const p = PRODUCTS.find(x => x.id === id); if (!p) return;
        this.populateProductSelects();
        document.getElementById('ap-title').textContent = 'Editar Fragancia';
        document.getElementById('ap-edit-id').value = id;
        document.getElementById('ap-name').value = p.name;
        document.getElementById('ap-cat').value = p.cat;
        this.syncSubcategorySelect();
        document.getElementById('ap-cat2').value = p.cat2 || '';
        document.getElementById('ap-price').value = p.price;
        document.getElementById('ap-stock').value = p.stock || 0;
        document.getElementById('ap-emoji').value = p.emoji || '';
        document.getElementById('ap-badge').value = p.badge || '';
        document.getElementById('ap-desc').value = p.desc || '';
        document.getElementById('ap-size').value = p.size || '35 ml · EDP';
        // Populate URL image fields
        const img0 = p.images?.[0] || '';
        const img1 = p.images?.[1] || '';
        const u1 = document.getElementById('ap-img1-url'); if (u1) u1.value = img0;
        const u2 = document.getElementById('ap-img2-url'); if (u2) u2.value = img1;
        this.previewUrl(img0, 'ap-img1-preview-url');
        this.previewUrl(img1, 'ap-img2-preview-url');
        document.getElementById('ap-modal').classList.add('active');
      },
      async saveProduct() { const name = document.getElementById('ap-name').value.trim(); const price = parseInt(document.getElementById('ap-price').value) || 0; if (!name || !price) { showToast('Completá el nombre y el precio.', true); return } const editId = document.getElementById('ap-edit-id').value; const existing = editId ? PRODUCTS.find(p => p.id === editId)?.images || [] : []; const prod = { id: editId || 'prod-' + Date.now(), name, cat: document.getElementById('ap-cat').value, cat2: document.getElementById('ap-cat2').value || '', price, stock: parseInt(document.getElementById('ap-stock').value) || 0, emoji: document.getElementById('ap-emoji').value || '🌸', badge: document.getElementById('ap-badge').value || null, desc: document.getElementById('ap-desc').value.trim() || 'Fragancia destacada de AURA.', size: document.getElementById('ap-size').value.trim() || '35 ml · EDP', images: await this.getProductImagesFromInputs(existing) }; if (editId) { const idx = PRODUCTS.findIndex(p => p.id === editId); if (idx >= 0) PRODUCTS[idx] = prod } else PRODUCTS.push(prod); saveProductsLS(); this.closeAddProduct(); this.renderInventory(); this.updatePanelKPIs(); renderProducts() },
      deleteProduct(id) { if (!window.confirm('¿Eliminar esta fragancia?')) return; PRODUCTS = PRODUCTS.filter(p => p.id !== id); saveProductsLS(); this.renderInventory(); this.updatePanelKPIs(); renderProducts() },
      goToSection(section) {
        const btn = [...document.querySelectorAll('.dash-nav-item')].find(el => (el.getAttribute('onclick') || '').includes(`'${section}'`));
        if (btn) App.dashNav(btn, section);
      },
      initConfigTabs() {
        initConfigAccordions();
        const activeBtn = document.querySelector('#config-tabs-nav .config-tab.active') || document.querySelector('#config-tabs-nav .config-tab');
        if (activeBtn) this.switchConfigTab(activeBtn.dataset.configTab || 'general', activeBtn);
        renderConfigWAPreview();
      },
      switchConfigTab(tab, btn) {
        document.querySelectorAll('#config-tabs-nav .config-tab').forEach(el => el.classList.toggle('active', el === btn || el.dataset.configTab === tab));
        document.querySelectorAll('#sec-config .config-panel').forEach(el => el.classList.toggle('active', el.dataset.configPanel === tab));
        collapseConfigPanel(tab);
        if (tab === 'catalogo') this.renderTaxonomy();
        if (tab === 'promociones') PromoAdmin.render();
        if (tab === 'ticket') renderConfigWAPreview();
        requestAnimationFrame(() => refreshConfigAccordionHeights());
      },
      renderWATemplatePreview() { renderConfigWAPreview(); },
      saveWATemplate() {
        const textarea = document.getElementById('cfg-wa-template');
        if (!textarea) return;
        STORE.waTemplate = textarea.value.trim() || getDefaultWATemplate();
        saveStoreConfig();
        renderConfigWAPreview();
        showToast('Mensaje de WhatsApp guardado ✓');
      },
      saveWA() {
        const num = document.getElementById('cfg-wa-num')?.value.trim();
        const generalNameInput = document.getElementById('cfg-wa-name');
        const ticketNameInput = document.getElementById('cfg-wa-name-ticket');
        const rawName = (generalNameInput?.value || ticketNameInput?.value || '').trim();
        if (!num) { showToast('Ingresá el número.', true); return }
        STORE.waNum = num;
        STORE.waName = rawName || STORE.waName;
        if (generalNameInput) generalNameInput.value = STORE.waName;
        if (ticketNameInput) ticketNameInput.value = STORE.waName;
        config.waNum = STORE.waNum;
        saveStoreConfig();
        renderConfigWAPreview();
        showToast('WhatsApp guardado ✓');
      },
      applyBanner() { STORE.bannerText = document.getElementById('cfg-banner-txt').value; STORE.bannerFg = document.getElementById('cfg-banner-fg').value; STORE.bannerOn = document.getElementById('cfg-banner-on').checked; saveStoreConfig(); applyStoreConfig(); showToast('Banner aplicado ✓') },
      saveTienda() { STORE.dir = document.getElementById('cfg-dir').value; STORE.hs = document.getElementById('cfg-hs').value; STORE.email = document.getElementById('cfg-email').value; saveStoreConfig(); showToast('Cambios guardados ✓') },
      saveShippingMethods() {
        STORE.shippingGpsEnabled = !!document.getElementById('cfg-ship-gps-on')?.checked;
        STORE.shippingZoneEnabled = !!document.getElementById('cfg-ship-zone-on')?.checked;
        saveStoreConfig();
        showToast('Métodos de envío guardados ✓');
      },
      applyPortada() { STORE.heroEnc = document.getElementById('cfg-hero-enc').value; STORE.heroTitle = document.getElementById('cfg-hero-title').value; STORE.heroSub = document.getElementById('cfg-hero-sub').value; STORE.heroExtra = (document.getElementById('cfg-hero-extra') || {}).value || ''; STORE.heroEncOn = document.getElementById('cfg-hero-enc-on')?.checked !== false; STORE.heroTitleOn = document.getElementById('cfg-hero-title-on')?.checked !== false; STORE.heroSubOn = document.getElementById('cfg-hero-sub-on')?.checked !== false; STORE.heroExtraOn = !!document.getElementById('cfg-hero-extra-on')?.checked; STORE.heroLogoOn = !!document.getElementById('cfg-hero-logo-on')?.checked; saveStoreConfig(); applyStoreConfig(); showToast('Portada actualizada ✓') },
      async loadHeroBackground(event) { const file = event.target.files?.[0]; if (!file) return; STORE._pendingHeroBg = await readFileAsDataURL(file); const preview = document.getElementById('hero-bg-preview'); preview.style.backgroundImage = `url('${STORE._pendingHeroBg}')`; preview.textContent = '' },
      previewHeroBgUrl(url) { const preview = document.getElementById('hero-bg-preview'); if (preview) { if (url) { preview.style.backgroundImage = `url('${url}')`; preview.style.backgroundSize = 'cover'; preview.style.backgroundPosition = 'center'; preview.textContent = '' } else { preview.style.backgroundImage = ''; preview.textContent = 'Vista previa de fondo principal' } } },
      applyHeroBgUrl() { const url = (document.getElementById('cfg-hero-bg-url')?.value || '').trim(); STORE.heroBg = url; saveStoreConfig(); applyStoreConfig(); showToast(url ? 'Fondo de portada aplicado ✓' : 'Fondo quitado ✓') },
      clearHeroBackground() { STORE._pendingHeroBg = ''; STORE.heroBg = ''; const preview = document.getElementById('hero-bg-preview'); preview.style.backgroundImage = ''; preview.textContent = 'Vista previa de fondo principal'; saveStoreConfig(); applyStoreConfig() },
      applyHeroBackground() { if (typeof STORE._pendingHeroBg !== 'undefined') STORE.heroBg = STORE._pendingHeroBg; saveStoreConfig(); applyStoreConfig(); showToast('Fondo de portada actualizado ✓') },
      async loadPortalImage(event) { const file = event.target.files?.[0]; if (!file) return; STORE._pendingPortalImg = await readFileAsDataURL(file); const preview = document.getElementById('portal-img-preview'); if (preview) { preview.style.backgroundImage = `url('${STORE._pendingPortalImg}')`; preview.textContent = '' } },
      previewPortalImgUrl(url) { const preview = document.getElementById('portal-img-preview'); if (preview) { if (url) { preview.style.backgroundImage = `url('${url}')`; preview.style.backgroundSize = 'cover'; preview.style.backgroundPosition = 'center'; preview.textContent = '' } else { preview.style.backgroundImage = ''; preview.textContent = 'Vista previa del panel inicial' } } },
      applyPortalImgUrl() { const url = (document.getElementById('cfg-portal-img-url')?.value || '').trim(); STORE.portalImg = url; saveStoreConfig(); applyStoreConfig(); showToast(url ? 'Imagen del panel aplicada ✓' : 'Imagen quitada ✓') },
      clearPortalImage() { STORE._pendingPortalImg = ''; STORE.portalImg = ''; const preview = document.getElementById('portal-img-preview'); if (preview) { preview.style.backgroundImage = ''; preview.textContent = 'Vista previa del panel inicial' } saveStoreConfig(); applyStoreConfig() },
      applyPortalImage() { if (typeof STORE._pendingPortalImg !== 'undefined') STORE.portalImg = STORE._pendingPortalImg; saveStoreConfig(); applyStoreConfig(); showToast('Imagen del panel actualizada ✓') },
      async loadHeroLogo(event) { const file = event.target.files?.[0]; if (!file) return; STORE._pendingHeroLogo = await readFileAsDataURL(file); const preview = document.getElementById('hero-logo-preview'); if (preview) { preview.style.backgroundImage = `url('${STORE._pendingHeroLogo}')`; preview.textContent = '' } },
      applyHeroLogo() { if (typeof STORE._pendingHeroLogo !== 'undefined') STORE.heroLogo = STORE._pendingHeroLogo; STORE.heroLogoOn = true; if (document.getElementById('cfg-hero-logo-on')) document.getElementById('cfg-hero-logo-on').checked = true; saveStoreConfig(); applyStoreConfig(); showToast('Logo de portada aplicado ✓') },
      clearHeroLogo() { STORE._pendingHeroLogo = ''; STORE.heroLogo = ''; STORE.heroLogoOn = false; if (document.getElementById('cfg-hero-logo-on')) document.getElementById('cfg-hero-logo-on').checked = false; const preview = document.getElementById('hero-logo-preview'); if (preview) { preview.style.backgroundImage = ''; preview.textContent = 'Sin logo cargado' } saveStoreConfig(); applyStoreConfig() },
      saveNosotros() { const vals = { title: document.getElementById('cfg-nos-title').value, p1: document.getElementById('cfg-nos-p1').value, p2: document.getElementById('cfg-nos-p2').value, s1v: document.getElementById('cfg-s1v').value, s1l: document.getElementById('cfg-s1l').value, s2v: document.getElementById('cfg-s2v').value, s2l: document.getElementById('cfg-s2l').value, s3v: document.getElementById('cfg-s3v').value, s3l: document.getElementById('cfg-s3l').value }; document.getElementById('nos-modal-title').textContent = vals.title; document.getElementById('nos-modal-p1').textContent = vals.p1; document.getElementById('nos-modal-p2').textContent = vals.p2;['s1', 's2', 's3'].forEach(k => { document.getElementById('nos-' + k + 'v').textContent = vals[k + 'v']; document.getElementById('nos-' + k + 'l').textContent = vals[k + 'l']; }); localStorage.setItem('aura_nosotros', JSON.stringify(vals)); showToast('Nosotros actualizado ✓') },
      exportCSV() { const rows = [['Fragancia', 'Categoría', 'Subcategoría', 'Stock', 'Precio'], ...PRODUCTS.map(p => [p.name, getCategoryName(p.cat), getSubcategoryName(p.cat2), p.stock || 0, p.price])]; const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n')); a.download = 'aura-inventario.csv'; a.click() },
      renderTaxonomy() { const catList = document.getElementById('tax-cat-list'); const subList = document.getElementById('tax-sub-list'); if (catList) catList.innerHTML = TAXONOMY.categories.map(c => `<span class="tax-tag">${escapeHtml(c.name)} <button type="button" onclick="Dash.removeCategory('${c.id}')">×</button></span>`).join(''); if (subList) subList.innerHTML = TAXONOMY.subcategories.map(s => `<span class="tax-tag">${escapeHtml(getCategoryName(s.categoryId))}: ${escapeHtml(s.name)} <button type="button" onclick="Dash.removeSubcategory('${s.id}')">×</button></span>`).join(''); this.populateProductSelects(); renderStoreFilters(); this.renderInventory() },
      addCategory() { const input = document.getElementById('tax-new-cat'); const name = input.value.trim(); if (!name) return; const id = slugify(name); if (TAXONOMY.categories.some(c => c.id === id)) { showToast('Esa categoría ya existe.', true); return } TAXONOMY.categories.push({ id, name }); saveTaxonomyLS(); input.value = ''; this.renderTaxonomy() },
      removeCategory(id) { if (PRODUCTS.some(p => p.cat === id)) { showToast('Categoría en uso, no se puede eliminar.', true); return } TAXONOMY.categories = TAXONOMY.categories.filter(c => c.id !== id); TAXONOMY.subcategories = TAXONOMY.subcategories.filter(s => s.categoryId !== id); saveTaxonomyLS(); this.renderTaxonomy() },
      addSubcategory() { const parent = document.getElementById('tax-parent-cat').value; const input = document.getElementById('tax-new-sub'); const name = input.value.trim(); if (!parent || !name) return; const id = slugify(name); if (TAXONOMY.subcategories.some(s => s.id === id && s.categoryId === parent)) { showToast('Subcategoría ya existente.', true); return } TAXONOMY.subcategories.push({ id, categoryId: parent, name }); saveTaxonomyLS(); input.value = ''; this.renderTaxonomy() },
      removeSubcategory(id) { if (PRODUCTS.some(p => p.cat2 === id)) { showToast('Subcategoría en uso, no se puede eliminar.', true); return } TAXONOMY.subcategories = TAXONOMY.subcategories.filter(s => s.id !== id); saveTaxonomyLS(); this.renderTaxonomy() }
    };

    function applyStoreConfig() {
      const cfgWaNum = document.getElementById('cfg-wa-num');
      const cfgWaName = document.getElementById('cfg-wa-name');
      const cfgWaNameTicket = document.getElementById('cfg-wa-name-ticket');
      const cfgWaTemplate = document.getElementById('cfg-wa-template');
      if (cfgWaNum) cfgWaNum.value = STORE.waNum;
      if (cfgWaName) cfgWaName.value = STORE.waName;
      if (cfgWaNameTicket) cfgWaNameTicket.value = STORE.waName;
      if (cfgWaTemplate) cfgWaTemplate.value = STORE.waTemplate || getDefaultWATemplate();
 document.getElementById('cfg-banner-txt').value = STORE.bannerText; document.getElementById('cfg-banner-fg').value = STORE.bannerFg; document.getElementById('cfg-banner-on').checked = !!STORE.bannerOn; document.getElementById('cfg-dir').value = STORE.dir; document.getElementById('cfg-hs').value = STORE.hs; document.getElementById('cfg-email').value = STORE.email; if (document.getElementById('cfg-ship-gps-on')) document.getElementById('cfg-ship-gps-on').checked = STORE.shippingGpsEnabled !== false; if (document.getElementById('cfg-ship-zone-on')) document.getElementById('cfg-ship-zone-on').checked = !!STORE.shippingZoneEnabled; document.getElementById('cfg-hero-enc').value = STORE.heroEnc; document.getElementById('cfg-hero-title').value = STORE.heroTitle; document.getElementById('cfg-hero-sub').value = STORE.heroSub; if (document.getElementById('cfg-hero-extra')) document.getElementById('cfg-hero-extra').value = STORE.heroExtra || ''; if (document.getElementById('cfg-hero-enc-on')) document.getElementById('cfg-hero-enc-on').checked = STORE.heroEncOn !== false; if (document.getElementById('cfg-hero-title-on')) document.getElementById('cfg-hero-title-on').checked = STORE.heroTitleOn !== false; if (document.getElementById('cfg-hero-sub-on')) document.getElementById('cfg-hero-sub-on').checked = STORE.heroSubOn !== false; if (document.getElementById('cfg-hero-extra-on')) document.getElementById('cfg-hero-extra-on').checked = !!STORE.heroExtraOn; if (document.getElementById('cfg-hero-logo-on')) document.getElementById('cfg-hero-logo-on').checked = !!STORE.heroLogoOn; const ann = document.getElementById('store-announce'); ann.textContent = STORE.heroEnc || STORE.bannerText; ann.style.color = STORE.bannerFg; ann.style.display = (STORE.bannerOn && STORE.heroEncOn !== false) ? '' : 'none'; const heroTitle = document.getElementById('store-hero-title'); if (heroTitle) { heroTitle.innerHTML = buildHeroTitle(STORE.heroTitle); heroTitle.style.display = STORE.heroTitleOn !== false ? '' : 'none' } const heroSub = document.getElementById('store-hero-sub'); if (heroSub) { heroSub.textContent = STORE.heroSub; heroSub.style.display = STORE.heroSubOn !== false ? '' : 'none' } const heroExtra = document.getElementById('store-hero-extra'); if (heroExtra) { heroExtra.textContent = STORE.heroExtra || ''; heroExtra.style.display = (STORE.heroExtraOn && STORE.heroExtra) ? '' : 'none' } const heroLogoEl = document.getElementById('store-hero-logo'); if (heroLogoEl) { if (STORE.heroLogo && STORE.heroLogoOn) { heroLogoEl.src = STORE.heroLogo; heroLogoEl.style.display = ''; const logoPreview = document.getElementById('hero-logo-preview'); if (logoPreview) { logoPreview.style.backgroundImage = `url('${STORE.heroLogo}')`; logoPreview.textContent = '' } } else { heroLogoEl.style.display = 'none'; heroLogoEl.src = '' } }
      /* Nav logo: if logo image configured, show it in nav too */
      const navLogo = document.getElementById('store-logo-nav');
      if (navLogo) { if (STORE.heroLogo && STORE.heroLogoOn) { navLogo.innerHTML = `<img src="${STORE.heroLogo}" alt="AURA" style="height:26px;width:auto;object-fit:contain;opacity:.9"/>`; } else if (!navLogo.querySelector('img') || STORE.heroLogo === '' || !STORE.heroLogoOn) { navLogo.innerHTML = 'AURA <span class="store-logo-dot"></span>'; } }
      const hero = document.getElementById('store-hero'); if (STORE.heroBg) { hero.style.setProperty('--hero-overlay', `url('${STORE.heroBg}')`); const preview = document.getElementById('hero-bg-preview'); if (preview) { preview.style.backgroundImage = `url('${STORE.heroBg}')`; preview.textContent = '' } } else { hero.style.removeProperty('--hero-overlay'); const preview = document.getElementById('hero-bg-preview'); if (preview) { preview.style.backgroundImage = ''; preview.textContent = 'Vista previa de fondo principal' } } const portal = document.getElementById('portal-media'); const portalPreview = document.getElementById('portal-img-preview');// Portal background image (full-screen behind buttons)
      const portalScreen = document.getElementById('s-portal');
      if (portalScreen) {
        if (STORE.portalImg) {
          portalScreen.style.backgroundImage = `radial-gradient(ellipse 100% 100% at 50% 50%,rgba(8,12,34,.55) 0%,rgba(8,12,34,.80) 60%,rgba(4,7,26,.97) 100%),url('${STORE.portalImg}')`;
          portalScreen.style.backgroundSize = 'cover';
          portalScreen.style.backgroundPosition = 'center';
          portalScreen.style.backgroundRepeat = 'no-repeat';
        } else {
          portalScreen.style.backgroundImage = '';
          portalScreen.style.backgroundSize = '';
          portalScreen.style.backgroundPosition = '';
          portalScreen.style.backgroundRepeat = '';
        }
      }
      if (portal) { portal.classList.remove('has-image'); portal.innerHTML = '<span class="portal-bottle-fallback" style="display:none"></span>'; }
      if (portalPreview) { if (STORE.portalImg) { portalPreview.style.backgroundImage = `url('${STORE.portalImg}')`; portalPreview.style.backgroundSize = 'cover'; portalPreview.textContent = '' } else { portalPreview.style.backgroundImage = ''; portalPreview.textContent = 'Vista previa del panel inicial' } }
      // Populate URL input fields
      const cfgPortalUrl = document.getElementById('cfg-portal-img-url'); if (cfgPortalUrl && STORE.portalImg && !STORE.portalImg.startsWith('data:')) cfgPortalUrl.value = STORE.portalImg;
      const cfgHeroBgUrl = document.getElementById('cfg-hero-bg-url'); if (cfgHeroBgUrl && STORE.heroBg && !STORE.heroBg.startsWith('data:')) cfgHeroBgUrl.value = STORE.heroBg;
renderConfigWAPreview();
/* portal bg now handled by portalImg field */config.waNum = STORE.waNum
    }

    function showToast(msg, isError = false) {
      let t = document.getElementById('aura-toast');
      if (!t) { t = document.createElement('div'); t.id = 'aura-toast'; document.body.appendChild(t) }
      t.textContent = msg;
      t.className = 'show' + (isError ? ' error' : '');
      clearTimeout(t._timer);
      t._timer = setTimeout(() => { t.className = t.className.replace(' show', '').replace('show', '') }, 2400);
    }


    function initConfigAccordions() {
      const panels = document.querySelectorAll('#sec-config .config-panel');
      panels.forEach(panel => {
        panel.querySelectorAll(':scope > .config-section').forEach((section, index) => {
          if (section.dataset.accordionReady === '1') return;
          const title = section.querySelector(':scope > .config-section-title');
          if (!title) return;

          const body = document.createElement('div');
          body.className = 'config-section-body';
          const inner = document.createElement('div');
          inner.className = 'config-section-inner';

          const nodes = Array.from(section.childNodes);
          nodes.forEach(node => {
            if (node !== title) inner.appendChild(node);
          });
          body.appendChild(inner);

          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'config-section-toggle';
          toggle.setAttribute('aria-expanded', 'false');
          toggle.innerHTML = `<span class="config-section-toggle-text">${title.outerHTML}</span><span class="config-section-arrow">▼</span>`;
          toggle.addEventListener('click', () => toggleConfigSection(section));

          section.innerHTML = '';
          section.classList.add('is-accordion');
          section.dataset.accordionReady = '1';
          section.dataset.panel = panel.dataset.configPanel || '';
          section.dataset.index = String(index);
          section.appendChild(toggle);
          section.appendChild(body);
        });
      });
      refreshConfigAccordionHeights();
    }

    function refreshConfigAccordionHeights() {
      document.querySelectorAll('#sec-config .config-section.is-accordion').forEach(section => {
        const body = section.querySelector('.config-section-body');
        const inner = section.querySelector('.config-section-inner');
        if (!body || !inner) return;
        body.style.maxHeight = section.classList.contains('is-open') ? inner.scrollHeight + 'px' : '0px';
      });
    }

    function collapseConfigPanel(panelName) {
      const panel = document.querySelector(`#sec-config .config-panel[data-config-panel="${panelName}"]`);
      if (!panel) return;
      panel.querySelectorAll('.config-section.is-accordion').forEach(section => closeConfigSection(section));
      refreshConfigAccordionHeights();
    }

    function closeConfigSection(section) {
      if (!section) return;
      section.classList.remove('is-open');
      const toggle = section.querySelector('.config-section-toggle');
      const body = section.querySelector('.config-section-body');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      if (body) body.style.maxHeight = '0px';
    }

    function openConfigSection(section) {
      if (!section) return;
      const panel = section.closest('.config-panel');
      if (panel) {
        panel.querySelectorAll('.config-section.is-accordion').forEach(other => {
          if (other !== section) closeConfigSection(other);
        });
      }
      section.classList.add('is-open');
      const toggle = section.querySelector('.config-section-toggle');
      const body = section.querySelector('.config-section-body');
      const inner = section.querySelector('.config-section-inner');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      if (body && inner) body.style.maxHeight = inner.scrollHeight + 'px';
    }

    function toggleConfigSection(section) {
      if (!section) return;
      if (section.classList.contains('is-open')) {
        closeConfigSection(section);
      } else {
        openConfigSection(section);
      }
      refreshConfigAccordionHeights();
    }

    const App = {
      show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); const el = document.getElementById(id); if (el) el.classList.add('active'); if (id === 's-dashboard') { setTimeout(() => { initChart(); Dash.renderInventory(); Dash.renderPedidos(); Dash.renderClientes(); Dash.updatePanelKPIs(); Dash.renderTaxonomy(); PromoAdmin.render() }, 80) } if (id === 's-store') { renderProducts(); applyStoreConfig() } window.scrollTo(0, 0) },
      goStaff() { this.show('s-staff-gate'); document.getElementById('staff-pwd').focus() },
      goStore() { this.show('s-store'); setTimeout(() => { const st = document.getElementById('s-store'); if (st) st.scrollTo({ top: 0, behavior: 'instant' }) }, 30) },
      staffLogin() { const pwd = document.getElementById('staff-pwd').value.trim(); if (pwd === 'piromagu2026') { this.show('s-dashboard') } else { document.getElementById('staff-pwd').style.borderColor = '#ef4444'; setTimeout(() => document.getElementById('staff-pwd').style.borderColor = '', 1200) } },
      togglePwd() { const inp = document.getElementById('staff-pwd'); inp.type = inp.type === 'password' ? 'text' : 'password' },
      dashNav(btn, section) { document.querySelectorAll('.dash-nav-item').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active');['panel', 'inventario', 'pedidos', 'clientes', 'analiticas', 'config'].forEach(s => { const el = document.getElementById('sec-' + s); if (el) el.style.display = s === section ? '' : 'none' }); if (section === 'inventario') Dash.renderInventory(); else if (section === 'pedidos') Dash.renderPedidos(); else if (section === 'clientes') Dash.renderClientes(); else if (section === 'analiticas') setTimeout(() => Dash.initAnalytics(), 80); else if (section === 'config') setTimeout(() => { Dash.renderTaxonomy(); PromoAdmin.render(); Dash.initConfigTabs(); }, 50) },
      chartPeriod(p, btn) { document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); initChart(p) },
      filter(btn) { document.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); btn.classList.add('active'); currentFilter = btn.dataset.cat; trackZone('filters'); renderProducts() },
      search(q) { currentSearch = q; renderProducts() },
      openNosotros() { document.getElementById('nosotros-modal').classList.add('active'); trackZone('about') },
      closeNosotros() { document.getElementById('nosotros-modal').classList.remove('active') },
      openProductDetail(id) { const p = PRODUCTS.find(x => x.id === id); if (!p) return; document.getElementById('detail-meta').textContent = `${getCategoryName(p.cat)} / ${getSubcategoryName(p.cat2)}`; document.getElementById('detail-name').textContent = p.name; document.getElementById('detail-price').textContent = '$' + p.price.toLocaleString('es-AR'); document.getElementById('detail-desc').textContent = p.desc || 'Fragancia destacada de AURA.'; document.getElementById('detail-size').textContent = p.size || '35 ml · EDP'; const main = document.getElementById('detail-main-img'); const thumbs = document.getElementById('detail-thumbs'); const imgs = (p.images && p.images.length ? p.images : [null]).slice(0, 2); const setMain = (src) => { if (src) { main.innerHTML = `<img src="${src}" alt="${escapeHtml(p.name)}" loading="eager" fetchpriority="high"/>` } else { main.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;opacity:.55">${PERFUME_SVG}</div>` } }; setMain(imgs[0]); thumbs.innerHTML = imgs.map((src, idx) => `<button class="detail-thumb ${idx === 0 ? 'active' : ''}" onclick="App.setDetailImage('${p.id}',${idx})">${src ? `<img src="${src}" alt="${escapeHtml(p.name)}">` : PERFUME_SVG}</button>`).join(''); document.getElementById('detail-add-btn').onclick = () => { Cart.addItem(p); this.closeProductDetail() }; document.getElementById('detail-modal').dataset.pid = id; document.getElementById('detail-modal').classList.add('active'); trackZone('productCard') },
      setDetailImage(id, idx) { const p = PRODUCTS.find(x => x.id === id); if (!p) return; const src = (p.images && p.images[idx]) || null; const main = document.getElementById('detail-main-img'); if (src) main.innerHTML = `<img src="${src}" alt="${escapeHtml(p.name)}" loading="eager"/>`; else main.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;opacity:.55">${PERFUME_SVG}</div>`; document.querySelectorAll('#detail-thumbs .detail-thumb').forEach((el, i) => el.classList.toggle('active', i === idx)) },
      closeProductDetail() { document.getElementById('detail-modal').classList.remove('active') },
      setMobNav(btn) { document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active') }
    };
function initializeAuraApp() {
      try { const nos = JSON.parse(localStorage.getItem('aura_nosotros') || 'null'); if (nos) { if (nos.title) document.getElementById('nos-modal-title').textContent = nos.title; if (nos.p1) document.getElementById('nos-modal-p1').textContent = nos.p1; if (nos.p2) document.getElementById('nos-modal-p2').textContent = nos.p2;['s1', 's2', 's3'].forEach(k => { if (nos[k + 'v']) { document.getElementById('nos-' + k + 'v').textContent = nos[k + 'v']; document.getElementById('nos-' + k + 'l').textContent = nos[k + 'l'] || '' } }) } } catch (e) { }
      PromoAdmin.loadOverrides();
      applyStoreConfig();
      renderStoreFilters();
      renderProducts();
      Dash.renderTaxonomy();
      PromoAdmin.render();
      Dash.updatePanelKPIs();
      initConfigAccordions();
      window.addEventListener('resize', refreshConfigAccordionHeights);
      document.getElementById('ap-cat')?.addEventListener('change', () => Dash.syncSubcategorySelect());
      document.querySelectorAll('[data-click-zone]').forEach(el => el.addEventListener('click', e => trackZone(e.currentTarget.dataset.clickZone)));
      document.querySelector('.store-nav')?.addEventListener('click', () => trackZone('nav'));
      document.getElementById('store-hero')?.addEventListener('click', () => trackZone('hero'));
      document.getElementById('btn-wa-cart')?.addEventListener('click', () => trackZone('whatsapp'));

      /* Bottom nav scroll spy */
      const storeScreen = document.getElementById('s-store');
      if (storeScreen) {
        storeScreen.addEventListener('scroll', () => {
          const prodTop = document.getElementById('product-grid')?.offsetTop || 999;
          const scrollY = storeScreen.scrollTop;
          const homeBtn = document.getElementById('mob-nav-home');
          const promosBtn = document.getElementById('mob-nav-promos');
          if (!homeBtn || !promosBtn) return;
          if (scrollY < prodTop - 120) {
            homeBtn.classList.add('active'); promosBtn.classList.remove('active');
          } else {
            if (currentFilter === 'promos') {
              promosBtn.classList.add('active');
              homeBtn.classList.remove('active');
            } else {
              homeBtn.classList.add('active');
              promosBtn.classList.remove('active');
            }
          }
        }, { passive: true });
      }
}


function exposeAuraBinding(name, getter, setter) {
  try { Object.defineProperty(window, name, { configurable: true, enumerable: true, get: getter, set: setter || function () {} }); }
  catch (err) { try { window[name] = getter(); } catch (_) {} }
}
function exposeAuraGlobals() {
  exposeAuraBinding('DEFAULT_PRODUCTS', () => DEFAULT_PRODUCTS);
  exposeAuraBinding('DEFAULT_TAXONOMY', () => DEFAULT_TAXONOMY);
  exposeAuraBinding('PROMOS_DATA', () => PROMOS_DATA);
  exposeAuraBinding('DEFAULT_HEATMAP', () => DEFAULT_HEATMAP);
  exposeAuraBinding('DEFAULT_STORE_CONFIG', () => DEFAULT_STORE_CONFIG);
  exposeAuraBinding('ORIGIN', () => ORIGIN);
  exposeAuraBinding('config', () => config);
  exposeAuraBinding('PRODUCTS', () => PRODUCTS, value => { PRODUCTS = value; });
  exposeAuraBinding('ORDERS', () => ORDERS, value => { ORDERS = value; });
  exposeAuraBinding('CUSTOMERS', () => CUSTOMERS, value => { CUSTOMERS = value; });
  exposeAuraBinding('TAXONOMY', () => TAXONOMY, value => { TAXONOMY = value; });
  exposeAuraBinding('HEATMAP', () => HEATMAP, value => { HEATMAP = value; });
  exposeAuraBinding('STORE', () => STORE, value => { STORE = value; });
  exposeAuraBinding('revenueChart', () => revenueChart, value => { revenueChart = value; });
  exposeAuraBinding('analLineChart', () => analLineChart, value => { analLineChart = value; });
  exposeAuraBinding('analDonutChart', () => analDonutChart, value => { analDonutChart = value; });
  exposeAuraBinding('currentFilter', () => currentFilter, value => { currentFilter = value; });
  exposeAuraBinding('currentSearch', () => currentSearch, value => { currentSearch = value; });
  exposeAuraBinding('invStatusFilter', () => invStatusFilter, value => { invStatusFilter = value; });
  exposeAuraBinding('invTextFilter', () => invTextFilter, value => { invTextFilter = value; });
  Object.assign(window, { getActivePromos, getPromoTier, getPromoDiscount, slugify, safeParse, saveJSON, loadProducts, saveProductsLS, loadOrders, saveOrdersLS, loadCustomers, saveCustomersLS, loadTaxonomy, saveTaxonomyLS, loadHeatmap, saveHeatmapLS, loadStoreConfig, saveStoreConfig, readFileAsDataURL, formatDateTime, haversine, getCategoryName, getSubcategoryName, getSubcategoriesByCategory, escapeHtml, getDefaultWATemplate, buildWhatsAppMessageFromTemplate, getWATemplateSampleData, renderConfigWAPreview, Cart, getAssignedPromoIds, getCartActiveDiscounts, getCartActiveDiscount, checkPromoEligibility, checkPromoEligibilityForProduct, showPromoDiscountToast, getRevenueSeries, initChart, buildHeroTitle, renderStoreFilters, buildProductCardCarousel, initProductCarousels, renderProducts, trackZone, Dash, applyStoreConfig, showToast, initConfigAccordions, refreshConfigAccordionHeights, App, initializeAuraApp });
}

function bindStaticHtmlActions() {
  const run = (el, eventName, event) => {
    const dataKey = `auraOn${eventName[0].toUpperCase()}${eventName.slice(1)}`;
    const code = el?.dataset?.[dataKey];
    if (!code) return;
    Function('event', `with(window){ return (function(){ ${code} }).call(this); }`).call(el, event);
  };

  ['click', 'input', 'change', 'keydown'].forEach(eventName => {
    document.addEventListener(eventName, event => {
      const el = event.target.closest?.(`[data-aura-on-${eventName}]`);
      if (!el) return;
      run(el, eventName, event);
    });
  });
}

exposeAuraGlobals();
bindStaticHtmlActions();
await import('./productos.js');
await import('./sugerencias.js');
await import('./carrito.js');
await import('./dashboard.js');
initializeAuraApp();
import('./firebase.js').catch(err => console.warn('Firebase sync no se pudo inicializar:', err));
