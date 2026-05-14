const Favorites = (() => {
  const LS_KEY = 'aura_favorites';

  function _load() {
    try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); }
    catch { return new Set(); }
  }
  function _save(set) {
    try { localStorage.setItem(LS_KEY, JSON.stringify([...set])); } catch {}
  }

  function _updateBadge() {
    const badge = document.getElementById('fav-badge');
    if (!badge) return;
    const count = _load().size;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }

  function toggle(productId, btnEl) {
    const favs = _load();
    if (favs.has(productId)) {
      favs.delete(productId);
      if (btnEl) btnEl.classList.remove('liked');
    } else {
      favs.add(productId);
      if (btnEl) {
        btnEl.classList.add('liked');
        btnEl.style.transform = 'scale(1.45)';
        setTimeout(() => { btnEl.style.transform = ''; }, 230);
      }
    }
    _save(favs);
    _updateBadge();
  }

  function has(productId) {
    return _load().has(productId);
  }

  function openPanel() {
    const favs = _load();
    if (!favs.size) {
      alert('Aún no tenés favoritos.\nTocá el ♡ en cualquier perfume para guardarlo.');
      return;
    }
    // Muestra solo favoritos en la grilla temporalmente
    const grid = document.getElementById('product-grid');
    const screen = document.getElementById('s-store');
    if (!grid) return;
    if (screen) screen.scrollTo({ top: grid.offsetTop - 80, behavior: 'smooth' });
    const origProducts = PRODUCTS;
    const favList = PRODUCTS.filter(p => favs.has(p.id));
    // eslint-disable-next-line no-global-assign
    PRODUCTS = favList;
    if (typeof renderProducts === 'function') renderProducts();
    // eslint-disable-next-line no-global-assign
    PRODUCTS = origProducts;
  }

  // Restaurar estados de corazón después de renderizar
  function restoreHearts() {
    const favs = _load();
    document.querySelectorAll('.prod-heart[data-pid]').forEach(btn => {
      btn.classList.toggle('liked', favs.has(btn.dataset.pid));
    });
  }

  // Inicializar badge al cargar la página
  setTimeout(_updateBadge, 500);

  return { toggle, has, openPanel, restoreHearts };
})();

if (typeof Favorites !== 'undefined') window.Favorites = Favorites;

(function(){
    function uniqueIds(arr){ return Array.from(new Set((arr||[]).map(v => String(v||'').trim()).filter(Boolean))); }
    function normalizeProductAssignments(product){
      product.promoAssignments = uniqueIds(product.promoAssignments || []);
      return product;
    }
    PRODUCTS.forEach(normalizeProductAssignments);

    function ensureDetailPromoContainer(){
      const info = document.querySelector('#detail-modal .detail-info');
      if (!info || document.getElementById('detail-promos-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'detail-promos-wrap';
      wrap.id = 'detail-promos-wrap';
      wrap.innerHTML = '<div class="subtle-divider"></div><div class="detail-desc" style="font-weight:700;color:var(--text);margin-bottom:.65rem">Promos disponibles</div><div id="detail-promos-list"></div>';
      const actions = info.querySelector('.detail-actions');
      if (actions) info.insertBefore(wrap, actions);
    }

    function ensureApPromoSection(){
      const grid = document.querySelector('#ap-modal .ap-grid');
      if (!grid || document.getElementById('ap-promo-box')) return;
      const box = document.createElement('div');
      box.className = 'ap-full';
      box.id = 'ap-promo-box';
      box.innerHTML = '<div class="promo-inline-box"><div class="config-label" style="margin-bottom:.2rem">Asignación a promos</div><div class="config-hint">Cada perfume se habilita desde aquí para las promos activas.</div><div id="ap-promo-grid" class="promo-inline-grid"></div></div>';
      grid.appendChild(box);
    }

    function getAssignedProductsForPromo(promoId){
      return PRODUCTS.filter(p => (p.promoAssignments || []).includes(promoId));
    }

    function isPromoAvailable(promo){
      return getAssignedProductsForPromo(promo.id).length > 0;
    }

    function formatTierLabel(t){
      const qty = Number(t.qty || 0);
      const total = Number(t.total || 0);
      return qty > 0 ? `${qty} x $${total.toLocaleString('es-AR')}` : `$${total.toLocaleString('es-AR')}`;
    }

    function getPromoBrief(promo){
      return promo.note || 'Promo disponible para fragancias seleccionadas.';
    }

    function getPromoPricePreview(promo){
      const tier = (promo.tiers || []).slice().sort((a,b)=>Number(a.total||0)-Number(b.total||0))[0];
      return tier ? `Desde $${Number(tier.total||0).toLocaleString('es-AR')}` : 'Consultar';
    }

    function savePromosLS(){
      if (window.LS?.set) window.LS.set('promos', PROMOS_DATA);
      else { try { localStorage.setItem('aura_promos', JSON.stringify(PROMOS_DATA)); } catch(e){} }
    }

    function loadPromosLS(){
      try {
        const raw = JSON.parse(localStorage.getItem('aura_promos') || 'null');
        if (Array.isArray(raw) && raw.length) {
          PROMOS_DATA.splice(0, PROMOS_DATA.length, ...raw.map(p => ({
            ...p,
            coverImage: typeof p.coverImage === 'string' ? p.coverImage : (Array.isArray(p.images) && p.images[0] ? p.images[0] : ''),
            images: Array.isArray(p.images) ? p.images : (p.coverImage ? [p.coverImage] : []),
            tiers: Array.isArray(p.tiers) ? p.tiers : []
          })));
        }
      } catch(e){}
      PROMOS_DATA.forEach(p => {
        p.coverImage = typeof p.coverImage === 'string' ? p.coverImage : (Array.isArray(p.images) && p.images[0] ? p.images[0] : '');
        p.images = Array.isArray(p.images) ? p.images : (p.coverImage ? [p.coverImage] : []);
      });
      savePromosLS();
    }
    window.PROMOS_DATA = PROMOS_DATA;
    loadPromosLS();

    const originalSaveProductsLS = saveProductsLS;
    saveProductsLS = function(){ PRODUCTS.forEach(normalizeProductAssignments); originalSaveProductsLS(); };

    const Promos = {
      renderVitrina(){
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        const q = String(currentSearch || '').toLowerCase().trim();
        const promos = getActivePromos().filter(p => !q || [p.name, p.note, ...(p.tiers||[]).map(formatTierLabel)].join(' ').toLowerCase().includes(q));
        const label = document.getElementById('store-products-label');
        if (label) {
          label.textContent = '🔥 Promos disponibles';
          label.style.display = promos.length ? '' : 'none';
        }
        grid.classList.add('promo-cover-grid');
        grid.innerHTML = promos.length ? promos.map(promo => {
          const available = isPromoAvailable(promo);
          const cover = promo.coverImage || promo.images?.[0] || '';
          return `<div class="promo-cover-card" onclick="PromoModal.open('${promo.id}')">
            <div class="promo-cover-media">
              ${cover ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(promo.name)}">` : `<div class="promo-cover-placeholder">${escapeHtml(promo.emoji || '🎁')}</div>`}
              <span class="promo-cover-status ${available ? 'activa' : 'agotada'}">${available ? 'Activa' : 'Agotada'}</span>
            </div>
            <div class="promo-cover-body">
              <div class="promo-cover-name">${escapeHtml(promo.name || 'Promo')}</div>
              <div class="promo-cover-note">${escapeHtml(getPromoBrief(promo))}</div>
              <div class="promo-cover-price"><span>Precio promo</span><strong>${escapeHtml(getPromoPricePreview(promo))}</strong></div>
            </div>
          </div>`;
        }).join('') : '<div class="tbl-empty" style="grid-column:1/-1">No hay promos activas por mostrar.</div>';
      }
    };
    window.Promos = Promos;

    PromoModal.open = function(promoId){
      const promo = getActivePromos().find(p => p.id === promoId) || PROMOS_DATA.find(p => p.id === promoId);
      if (!promo) return;
      const modal = document.querySelector('#promo-modal .promo-modal');
      if (modal) modal.classList.add('higher-detail');
      const body = document.getElementById('promo-modal-body');
      const title = document.getElementById('promo-modal-title');
      const footerBtn = document.getElementById('promo-confirm-btn');
      const footerLabel = document.getElementById('promo-total-label');
      const assignedProducts = getAssignedProductsForPromo(promo.id);
      if (title) title.textContent = promo.name || 'Promo';
      if (body) body.innerHTML = `
        <div class="promo-detail-list">
          <div class="promo-detail-box">
            <div class="promo-detail-label">Descripción</div>
            <div style="font-size:.84rem;line-height:1.6;color:var(--text)">${escapeHtml(promo.note || 'Promo disponible en la tienda para productos seleccionados.')}</div>
          </div>
          <div class="promo-detail-box">
            <div class="promo-detail-label">Tiers disponibles</div>
            <div class="promo-detail-tierchips">${(promo.tiers||[]).map(t => `<span class="promo-detail-tier">${escapeHtml(formatTierLabel(t))}</span>`).join('') || '<span class="promo-detail-empty">Sin tiers configurados.</span>'}</div>
          </div>
          <div class="promo-detail-box">
            <div class="promo-detail-label">Perfumes asignados</div>
            <div class="promo-detail-products">${assignedProducts.length ? assignedProducts.map(p => `<span class="promo-detail-prod">${escapeHtml(p.name)}</span>`).join('') : '<span class="promo-detail-empty">No hay perfumes asignados a esta promo.</span>'}</div>
          </div>
        </div>`;
      if (footerBtn) {
        footerBtn.textContent = 'Ir a la tienda a armar mi promo →';
        footerBtn.onclick = function(){ PromoModal.close(); App.show('s-store'); currentFilter = 'todos'; renderProducts(); };
      }
      if (footerLabel) footerLabel.textContent = getPromoPricePreview(promo);
      document.getElementById('promo-modal').classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    const originalPromoClose = PromoModal.close;
    PromoModal.close = function(){ const modal = document.querySelector('#promo-modal .promo-modal'); if (modal) modal.classList.remove('higher-detail'); originalPromoClose(); };
    PromoModal.selectTier = function(){};
    PromoModal.updateFragrance = function(){};
    PromoModal.addToCart = function(){};

    const originalRenderProducts = renderProducts;
    renderProducts = function(){
      const grid = document.getElementById('product-grid');
      if (!grid) return;
      grid.classList.remove('promo-cover-grid');
      if (currentFilter === 'promos') {
        renderStoreFilters();
        Promos.renderVitrina();
        return;
      }
      originalRenderProducts.apply(this, arguments);
      injectPromoButtonsInCards();
    };

    function injectPromoButtonsInCards(){
      document.querySelectorAll('.prod-card').forEach(card => {
        const heart = card.querySelector('.prod-heart[data-pid]');
        const pid = heart?.dataset?.pid;
        if (!pid) return;
        const product = PRODUCTS.find(p => p.id === pid);
        if (!product) return;
        const footer = card.querySelector('.prod-footer');
        if (!footer) return;
        footer.querySelector('.prod-promo-btn')?.remove();
        const activePromos = getActivePromos();
        if (!activePromos.length) return;
        const assigned = uniqueIds(product.promoAssignments || []).filter(id => activePromos.some(p => p.id === id));
        if (!assigned.length) return;
        const btn = document.createElement('button');
        btn.className = 'prod-promo-btn';
        btn.setAttribute('type','button');
        btn.innerHTML = assigned.length > 1 ? `<span class="promo-btn-icon">🎁</span><span>×${assigned.length}</span>` : `<span class="promo-btn-icon">🎁</span><span>promo</span>`;
        btn.onclick = function(event){ event.stopPropagation(); PromoAssign.openForProduct(pid); };
        const addBtn = footer.querySelector('.prod-atc');
        if (addBtn) footer.insertBefore(btn, addBtn);
      });
    }

    const originalOpenProductDetail = App.openProductDetail.bind(App);
    App.openProductDetail = function(id){
      originalOpenProductDetail(id);
      ensureDetailPromoContainer();
      const p = PRODUCTS.find(x => x.id === id);
      const list = document.getElementById('detail-promos-list');
      if (!list || !p) return;
      const promos = uniqueIds(p.promoAssignments || []).map(pid => PROMOS_DATA.find(pr => pr.id === pid)).filter(Boolean);
      list.innerHTML = promos.length ? promos.map(pr => `<div class="detail-promo-item"><div class="detail-promo-name">${escapeHtml(pr.name)}</div><div class="detail-promo-tiers">${(pr.tiers||[]).map(formatTierLabel).join(' · ')}</div></div>`).join('') : '<div class="detail-desc" style="color:var(--muted)">Este perfume no está asignado a ninguna promo.</div>';
    };

    const PromoAssign = (() => {
      let currentProductId = null;
      function activePromos(){ return getActivePromos(); }
      function renderRows(product){
        const promos = activePromos();
        const selected = uniqueIds(product.promoAssignments || []);
        return promos.length ? promos.map(promo => {
          const checked = selected.includes(promo.id);
          return `<label class="promo-assign-row"><div class="promo-assign-row-main"><div class="promo-assign-row-name">${escapeHtml(promo.name)}</div><div class="promo-assign-row-sub">${escapeHtml((promo.tiers||[]).map(formatTierLabel).join(' · ') || 'Sin tiers')}</div></div><input type="checkbox" data-promo-id="${promo.id}" ${checked ? 'checked' : ''}></label>`;
        }).join('') : '<div class="promo-detail-empty">No hay promos activas.</div>';
      }
      function openForProduct(productId){
        currentProductId = productId;
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;
        document.getElementById('promo-assign-title').textContent = `Promos · ${product.name}`;
        document.getElementById('promo-assign-body').innerHTML = renderRows(product);
        document.getElementById('promo-assign-modal').classList.add('active');
      }
      function close(){ document.getElementById('promo-assign-modal').classList.remove('active'); currentProductId = null; }
      function save(productId, selectedPromoIds){
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;
        product.promoAssignments = uniqueIds(selectedPromoIds);
        saveProductsLS();
        Dash.renderInventory?.();
        renderProducts();
        showToast('Asignaciones guardadas ✓');
        renderProductPromoInline(product.id);
        close();
      }
      function saveCurrent(){
        if (!currentProductId) return;
        const selected = Array.from(document.querySelectorAll('#promo-assign-body [data-promo-id]:checked')).map(el => el.getAttribute('data-promo-id'));
        save(currentProductId, selected);
      }
      return { openForProduct, close, save, saveCurrent };
    })();
    window.PromoAssign = PromoAssign;

    function renderProductPromoInline(productId){
      ensureApPromoSection();
      const grid = document.getElementById('ap-promo-grid');
      if (!grid) return;
      const product = PRODUCTS.find(p => p.id === productId) || { promoAssignments: [] };
      const promos = getActivePromos();
      grid.innerHTML = promos.length ? promos.map(promo => {
        const checked = uniqueIds(product.promoAssignments || []).includes(promo.id);
        return `<label class="promo-inline-row"><div><div style="font-size:.8rem;font-weight:700;color:var(--text)">${escapeHtml(promo.name)}</div><div class="promo-inline-meta">${escapeHtml((promo.tiers||[]).map(formatTierLabel).join(' · ') || 'Sin tiers')}</div></div><input type="checkbox" data-ap-promo-id="${promo.id}" ${checked ? 'checked' : ''}></label>`;
      }).join('') : '<div class="promo-inline-meta">No hay promos activas.</div>';
    }

    const originalOpenAddProduct = Dash.openAddProduct.bind(Dash);
    Dash.openAddProduct = function(){ originalOpenAddProduct(); ensureApPromoSection(); renderProductPromoInline('__new__'); };
    const originalEditProduct = Dash.editProduct.bind(Dash);
    Dash.editProduct = function(id){ originalEditProduct(id); ensureApPromoSection(); renderProductPromoInline(id); };
    const originalSaveProduct = Dash.saveProduct.bind(Dash);
    Dash.saveProduct = async function(){
      ensureApPromoSection();
      const selectedPromoIds = Array.from(document.querySelectorAll('#ap-promo-grid [data-ap-promo-id]:checked')).map(el => el.getAttribute('data-ap-promo-id'));
      const name = document.getElementById('ap-name').value.trim();
      const price = parseInt(document.getElementById('ap-price').value) || 0;
      if (!name || !price) { showToast('Completá el nombre y el precio.', true); return; }
      const editId = document.getElementById('ap-edit-id').value;
      const existing = editId ? PRODUCTS.find(p => p.id === editId)?.images || [] : [];
      const prod = { id: editId || 'prod-' + Date.now(), name, cat: document.getElementById('ap-cat').value, cat2: document.getElementById('ap-cat2').value || '', price, stock: parseInt(document.getElementById('ap-stock').value) || 0, emoji: document.getElementById('ap-emoji').value || '🌸', badge: document.getElementById('ap-badge').value || null, desc: document.getElementById('ap-desc').value.trim() || 'Fragancia destacada de AURA.', size: document.getElementById('ap-size').value.trim() || '35 ml · EDP', images: await Dash.getProductImagesFromInputs(existing), promoAssignments: uniqueIds(selectedPromoIds) };
      normalizeProductAssignments(prod);
      if (editId) {
        const idx = PRODUCTS.findIndex(p => p.id === editId);
        if (idx >= 0) PRODUCTS[idx] = prod;
      } else PRODUCTS.push(prod);
      saveProductsLS();
      Dash.closeAddProduct();
      Dash.renderInventory();
      Dash.updatePanelKPIs();
      renderProducts();
    };

    const originalRenderInventory = Dash.renderInventory.bind(Dash);
    Dash.renderInventory = function(){
      if (!String(invStatusFilter||'').startsWith('promo:')) return originalRenderInventory();
      const tbody = document.getElementById('inv-tbody'); if (!tbody) return;
      this.renderInventoryFilters();
      const promoId = String(invStatusFilter).slice(6);
      const txt = String(invTextFilter || '').toLowerCase().trim();
      const list = PRODUCTS.filter(p => (p.promoAssignments || []).includes(promoId)).filter(p => !txt || [p.name,p.desc,getCategoryName(p.cat),getSubcategoryName(p.cat2)].join(' ').toLowerCase().includes(txt));
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="6" class="tbl-empty">Sin resultados.</td></tr>'; return; }
      tbody.innerHTML = list.map(p => { const s = p.stock || 0, pct = Math.min(100, Math.round((s / 15) * 100)), cls = s === 0 ? 'empty' : s <= 3 ? 'low' : '', badge = s === 0 ? '<span class="badge red">Agotado</span>' : s <= 3 ? '<span class="badge yellow">Stock bajo</span>' : '<span class="badge green">En stock</span>'; const media = p.images?.[0] ? `style="background-image:url('${p.images[0]}')"` : ''; return `<tr><td><div class="tbl-prod"><div class="inventory-thumb" ${media}>${p.images?.[0] ? '' : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;opacity:.5">${PERFUME_SVG}</div>`}</div><div><div class="tbl-prod-name">${escapeHtml(p.name)}</div><div class="tbl-prod-sub">${escapeHtml(p.size || '35 ml · EDP')}</div></div></div></td><td>${escapeHtml(getCategoryName(p.cat))} / ${escapeHtml(getSubcategoryName(p.cat2))}</td><td>${s}<span class="stock-bar"><span class="stock-bar-fill ${cls}" style="width:${pct}%"></span></span></td><td>$${p.price.toLocaleString('es-AR')}</td><td>${badge}</td><td><button class="tbl-action" onclick="Dash.editProduct('${p.id}')">Editar</button><button class="tbl-action del" onclick="Dash.deleteProduct('${p.id}')">Eliminar</button></td></tr>` }).join('');
    };
    Dash.renderInventoryFilters = function(){
      const row = document.getElementById('inv-filter-row'); if (!row) return;
      const promoFilter = String(invStatusFilter||'').startsWith('promo:') ? invStatusFilter.slice(6) : '';
      const promoChip = promoFilter ? `<button class="fc active" data-f="${escapeHtml('promo:'+promoFilter)}" onclick="Dash.invFilter(this)">Promo: ${escapeHtml(PROMOS_DATA.find(p => p.id===promoFilter)?.name || 'asignada')}</button>` : '';
      row.innerHTML = `<button class="fc ${invStatusFilter === 'todos' ? 'active' : ''}" data-f="todos" onclick="Dash.invFilter(this)">Todos</button><button class="fc ${invStatusFilter === 'stock' ? 'active' : ''}" data-f="stock" onclick="Dash.invFilter(this)">En stock</button><button class="fc ${invStatusFilter === 'bajo' ? 'active' : ''}" data-f="bajo" onclick="Dash.invFilter(this)">Stock bajo</button><button class="fc ${invStatusFilter === 'agotado' ? 'active' : ''}" data-f="agotado" onclick="Dash.invFilter(this)">Agotado</button>` + promoChip + TAXONOMY.categories.map(c => `<button class="fc ${invStatusFilter === c.id ? 'active' : ''}" data-f="${c.id}" onclick="Dash.invFilter(this)">${escapeHtml(c.name)}</button>`).join('');
    };

    function openInventoryForPromo(promoId){
      invStatusFilter = 'promo:' + promoId;
      document.querySelectorAll('.dash-nav-item').forEach(btn => btn.classList.remove('active'));
      const invBtn = document.querySelector('.dash-nav-item[onclick*="sec-inventory"]');
      if (invBtn) invBtn.classList.add('active');
      document.querySelectorAll('#s-dashboard [id^="sec-"]').forEach(sec => sec.style.display = 'none');
      const sec = document.getElementById('sec-inventory'); if (sec) sec.style.display = '';
      Dash.renderInventory();
    }
    window.openInventoryForPromo = openInventoryForPromo;

    function normalizePromoDraft(promo){
      return {
        ...promo,
        coverImage: typeof promo.coverImage === 'string' ? promo.coverImage.trim() : (promo.images?.[0] || ''),
        images: (typeof promo.coverImage === 'string' && promo.coverImage.trim()) ? [promo.coverImage.trim()] : (Array.isArray(promo.images) ? promo.images.filter(Boolean) : []),
        sizeMatch: typeof promo.sizeMatch === 'string' ? promo.sizeMatch.trim() : '',
        tiers: Array.isArray(promo.tiers) ? promo.tiers.map(t => ({ qty: Math.max(1, Number(t.qty||0)), total: Math.max(0, Number(t.total||0)) })) : [{qty:1,total:0}],
        active: promo.active !== false
      };
    }

    PromoAdmin.render = function(){
      const list = document.getElementById('promo-admin-list');
      if (!list) return;
      list.innerHTML = PROMOS_DATA.map(promo => {
        const count = getAssignedProductsForPromo(promo.id).length;
        const cover = promo.coverImage || promo.images?.[0] || '';
        return `
          <div class="promo-admin-card">
            <div class="promo-admin-head">
              <div>
                <div style="font-weight:700;font-size:.95rem">${escapeHtml(promo.name || 'Promo')}</div>
                <div class="promo-admin-count">${count} fragancias asignadas · <a href="#" onclick="event.preventDefault();openInventoryForPromo('${promo.id}')">Ver productos →</a></div>
              </div>
              <div class="toggle-row" style="margin:0">
                <label class="toggle"><input type="checkbox" id="promo-active-${promo.id}" ${promo.active !== false ? 'checked' : ''}/><span class="toggle-slider"></span></label>
                <span class="toggle-label">Promo activa</span>
              </div>
            </div>
            <div class="promo-admin-grid">
              <div>
                <label class="config-label">Nombre de la promo</label>
                <input class="config-input" type="text" id="promo-name-${promo.id}" value="${escapeHtml(promo.name || '')}" />
              </div>
              <div>
                <label class="config-label">Imagen de portada URL</label>
                <input class="config-input" type="text" id="promo-img-${promo.id}" value="${escapeHtml(cover)}" oninput="PromoAdmin.updateImagePreview('${promo.id}')" />
              </div>
            </div>
            <div style="margin-top:.85rem">
              <label class="config-label">Descripción</label>
              <textarea class="config-textarea" id="promo-note-${promo.id}" style="min-height:78px">${escapeHtml(promo.note || '')}</textarea>
            </div>
            <label class="config-label" style="margin-top:.85rem;display:block">Tamaño / tag auto-match</label>
            <input class="config-input" type="text"
              id="promo-sizematch-${promo.id}"
              value="${escapeHtml(promo.sizeMatch || '')}"
              placeholder="Ej: 35ml, 100ml, bodysplash — deja vacío para solo asignación manual" />
            <div class="config-hint">Si completás esto, la promo aplica automáticamente a todos los productos
            cuyo tamaño (size) o nombre contenga este texto (sin distinguir mayúsculas).</div>
            <div class="promo-admin-grid" style="margin-top:.85rem">
              <div>
                <label class="config-label">Preview</label>
                <div style="height:84px;border:1px solid var(--border);border-radius:12px;background:#0f1220;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:.35rem">${cover ? `<img id="promo-img-preview-${promo.id}" src="${escapeHtml(cover)}" alt="Preview promo" style="max-width:100%;max-height:100%;object-fit:cover;display:block" />` : `<img id="promo-img-preview-${promo.id}" alt="Preview promo" style="display:none;max-width:100%;max-height:100%;object-fit:cover" /><span style="color:rgba(255,255,255,.45);font-size:.78rem">Sin imagen</span>`}</div>
              </div>
              <div>
                <label class="config-label">Estado de asignación</label>
                <div class="config-hint" style="margin-top:.35rem">Los productos se asignan desde cada ficha de perfume. Esta promo ya no administra fragancias desde acá.</div>
              </div>
            </div>
            <label class="config-label" style="margin-top:.9rem;display:block">Tiers</label>
            <div class="promo-tiers-admin" id="promo-tiers-${promo.id}">${(promo.tiers||[]).map((tier,index) => `<div class="promo-tier-row"><div><label class="config-label">Cantidad mínima</label><input class="config-input" type="number" min="1" data-tier-qty value="${Number(tier.qty || 0)}" /></div><div><label class="config-label">Precio total</label><input class="config-input" type="number" min="0" step="1" data-tier-total value="${Number(tier.total || 0)}" /></div><button type="button" class="btn-outline" style="padding:.55rem 0;font-size:1rem;line-height:1;border-radius:10px" onclick="PromoAdmin.removeTier('${promo.id}', ${index})">×</button></div>`).join('')}</div>
            <div class="promo-tier-actions"><button type="button" class="btn-outline" style="border-radius:10px;padding:.5rem .9rem;font-size:.78rem" onclick="PromoAdmin.addTier('${promo.id}')">+ Agregar tier</button></div>
            <div style="display:flex;justify-content:flex-end;margin-top:1rem"><button type="button" class="btn-outline promo-delete-btn" style="border-radius:99px;padding:.55rem 1rem;font-size:.72rem" onclick="PromoAdmin.remove('${promo.id}')">Eliminar promo</button></div>
          </div>`;
      }).join('');
    };

    PromoAdmin.save = function(){
      PROMOS_DATA.splice(0, PROMOS_DATA.length, ...PROMOS_DATA.map(promo => normalizePromoDraft({
        ...promo,
        name: document.getElementById(`promo-name-${promo.id}`)?.value?.trim() || 'Nueva promo',
        note: document.getElementById(`promo-note-${promo.id}`)?.value?.trim() || '',
        active: !!document.getElementById(`promo-active-${promo.id}`)?.checked,
        coverImage: document.getElementById(`promo-img-${promo.id}`)?.value?.trim() || '',
        sizeMatch: document.getElementById(`promo-sizematch-${promo.id}`)?.value?.trim() || '',
        tiers: Array.from(document.querySelectorAll(`#promo-tiers-${promo.id} .promo-tier-row`)).map(row => ({ qty: row.querySelector('[data-tier-qty]')?.value, total: row.querySelector('[data-tier-total]')?.value }))
      })));
      savePromosLS();
      renderProducts();
      Dash.renderInventory?.();
      showToast('Promos guardadas ✓');
      PromoAdmin.render();
    };

    PromoAdmin.openNew = function(){
      PROMOS_DATA.push(normalizePromoDraft({ id: 'promo-' + Date.now(), name: 'Nueva promo', note: '', active: false, coverImage: '', images: [], sizeMatch: '', tiers: [{ qty: 1, total: 0 }] }));
      savePromosLS();
      PromoAdmin.render();
    };

    PromoAdmin.remove = function(id){
      const promo = PROMOS_DATA.find(item => item.id === id);
      if (!promo) return;
      if (!window.confirm(`¿Eliminar la promo "${promo.name}"?`)) return;
      const idx = PROMOS_DATA.findIndex(item => item.id === id);
      if (idx >= 0) PROMOS_DATA.splice(idx, 1);
      PRODUCTS.forEach(product => {
        product.promoAssignments = uniqueIds((product.promoAssignments || []).filter(pid => pid !== id));
      });
      saveProductsLS();
      savePromosLS();
      Dash.renderInventory?.();
      renderProducts();
      PromoAdmin.render();
      showToast('Promo eliminada ✓');
    };

    PromoAdmin.addTier = function(id){
      const promo = PROMOS_DATA.find(item => item.id === id); if (!promo) return;
      promo.tiers = Array.isArray(promo.tiers) ? promo.tiers : [];
      promo.tiers.push({ qty: 1, total: 0 });
      PromoAdmin.render();
    };

    PromoAdmin.removeTier = function(id, index){
      const promo = PROMOS_DATA.find(item => item.id === id); if (!promo) return;
      promo.tiers = Array.isArray(promo.tiers) ? promo.tiers : [];
      promo.tiers.splice(index, 1);
      if (!promo.tiers.length) promo.tiers = [{ qty: 1, total: 0 }];
      PromoAdmin.render();
    };

    PromoAdmin.updateImagePreview = function(id){
      const img = document.getElementById(`promo-img-preview-${id}`);
      const src = document.getElementById(`promo-img-${id}`)?.value?.trim() || '';
      if (img) {
        if (src) { img.src = src; img.style.display = 'block'; }
        else { img.removeAttribute('src'); img.style.display = 'none'; }
      }
    };

    PromoAdmin.loadOverrides = function(){ loadPromosLS(); };

    const originalAppShow = App.show.bind(App);
    App.show = function(id){
      const result = originalAppShow(id);
      if (id === 's-store') setTimeout(() => { injectPromoButtonsInCards(); }, 60);
      if (id === 's-dashboard') setTimeout(() => { PromoAdmin.render(); }, 100);
      return result;
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => Cart.updateCartBadge());
    } else {
      Cart.updateCartBadge();
    }

    ensureDetailPromoContainer();
    ensureApPromoSection();
    renderProducts();
  })();

/* AURA PREMIUM MOTION LAYER JS - START */
    (function () {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const root = document.documentElement;
      root.classList.add('aura-motion-ready');

      const revealSelectors = [
        '.store-announce',
        '.store-hero-h1',
        '.store-hero-sub',
        '.store-hero-cta',
        '.filter-bar',
        '.prod-card',
        '.promo-card',
        '.aura-store-banner',
        '.aura-store-slide',
        '.kpi-card',
        '.chart-card',
        '.aura-commercial-card',
        '.portal-card',
        '.staff-card',
        '.dash-topbar',
        '.dash-nav-item',
        '.category-card',
        '.suggestion-card',
        '.sug-card',
        'section',
        '[data-reveal]'
      ];

      let observer = null;
      let scanTimer = null;

      function isSafeRevealTarget(el) {
        if (!el || el.classList.contains('aura-reveal')) return false;
        if (el.closest('.cart-panel, .cart-overlay, script, style, template')) return false;
        return true;
      }

      function collectRevealTargets(scope) {
        const base = scope && scope.querySelectorAll ? scope : document;
        const found = [];
        revealSelectors.forEach(selector => {
          base.querySelectorAll(selector).forEach(el => {
            if (isSafeRevealTarget(el)) found.push(el);
          });
        });
        return found;
      }

      function applyReveal(scope) {
        if (reduceMotion) return;
        const elements = collectRevealTargets(scope);
        elements.forEach((el, index) => {
          el.classList.add('aura-reveal');
          el.style.setProperty('--aura-reveal-delay', `${Math.min(index % 8, 7) * 70}ms`);
          if (observer) observer.observe(el);
        });
      }

      function initObserver() {
        if (reduceMotion || !('IntersectionObserver' in window)) {
          document.querySelectorAll('.aura-reveal').forEach(el => el.classList.add('aura-visible'));
          return;
        }

        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('aura-visible');
            observer.unobserve(entry.target);
          });
        }, {
          threshold: 0.12,
          rootMargin: '0px 0px -8% 0px'
        });
      }

      function setCompactNav() {
        const scrolled = window.scrollY > 24 || (document.getElementById('s-store') && document.getElementById('s-store').scrollTop > 24);
        document.querySelectorAll('.store-nav, .dash-sidebar, .mobile-bottom-nav, .mob-nav').forEach(nav => {
          nav.classList.toggle('aura-nav-compact', scrolled);
        });
      }

      function bindScrollablePanels() {
        document.querySelectorAll('#s-store, .dash-main').forEach(panel => {
          if (panel.dataset.auraMotionScrollBound === '1') return;
          panel.dataset.auraMotionScrollBound = '1';
          panel.addEventListener('scroll', setCompactNav, { passive: true });
        });
      }

      function scheduleScan(scope) {
        clearTimeout(scanTimer);
        scanTimer = setTimeout(() => {
          bindScrollablePanels();
          applyReveal(scope || document);
          setCompactNav();
        }, 80);
      }

      function initMotionLayer() {
        initObserver();
        bindScrollablePanels();
        applyReveal(document);
        setCompactNav();

        window.addEventListener('scroll', setCompactNav, { passive: true });
        window.addEventListener('resize', setCompactNav, { passive: true });

        const mutationObserver = new MutationObserver(mutations => {
          for (const mutation of mutations) {
            if (mutation.addedNodes && mutation.addedNodes.length) {
              scheduleScan(mutation.target);
              break;
            }
          }
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMotionLayer, { once: true });
      } else {
        initMotionLayer();
      }
    })();
    /* AURA PREMIUM MOTION LAYER JS - END */

/* AURA PREMIUM CATEGORY MOTION JS - START */
    (function () {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let filterTimer = null;
      let productTimer = null;
      let resizeTimer = null;

      function getFilterBox() {
        return document.getElementById('filter-chips');
      }

      function getStoreScroller() {
        return document.getElementById('s-store');
      }

      function ensureCategoryStructure() {
        const box = getFilterBox();
        if (!box) return;

        const bar = box.closest('.filter-bar');
        if (bar) bar.classList.add('aura-category-premium');
        box.classList.add('aura-category-track');

        let indicator = box.querySelector('.aura-filter-indicator');
        if (!indicator) {
          indicator = document.createElement('span');
          indicator.className = 'aura-filter-indicator';
          indicator.setAttribute('aria-hidden', 'true');
          box.appendChild(indicator);
        }

        const chips = Array.from(box.querySelectorAll(':scope > .chip'));
        chips.forEach((chip, index) => {
          chip.style.setProperty('--aura-cat-delay', `${index * 80}ms`);
          if (!reduceMotion) {
            chip.classList.remove('aura-cat-in');
            requestAnimationFrame(() => chip.classList.add('aura-cat-in'));
          } else {
            chip.classList.add('aura-cat-in');
          }
        });

        updateCategoryIndicator();
      }

      function updateCategoryIndicator() {
        const box = getFilterBox();
        if (!box) return;

        const indicator = box.querySelector('.aura-filter-indicator');
        const active = box.querySelector(':scope > .chip.active') || box.querySelector(':scope > .chip');
        if (!indicator || !active) return;

        const x = active.offsetLeft;
        const w = active.offsetWidth;
        box.style.setProperty('--aura-cat-indicator-x', `${x}px`);
        box.style.setProperty('--aura-cat-indicator-w', `${w}px`);

        const scroller = getStoreScroller() || box;
        const boxRect = box.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        const isOutside = activeRect.left < boxRect.left || activeRect.right > boxRect.right;
        if (isOutside && typeof active.scrollIntoView === 'function') {
          active.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
        }
      }

      function animateProductCards() {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        const cards = Array.from(grid.querySelectorAll(':scope > .prod-card'));
        if (!cards.length) return;

        if (reduceMotion) {
          cards.forEach(card => {
            card.classList.add('aura-product-enter', 'aura-product-in');
            card.style.removeProperty('--aura-prod-delay');
          });
          return;
        }

        grid.classList.add('aura-products-animating');
        cards.forEach((card, index) => {
          card.classList.remove('aura-product-in');
          card.classList.add('aura-product-enter');
          card.style.setProperty('--aura-prod-delay', `${Math.min(index, 10) * 45}ms`);
        });

        requestAnimationFrame(() => {
          grid.classList.remove('aura-products-animating');
          cards.forEach(card => card.classList.add('aura-product-in'));
        });
      }

      function scheduleCategoryRefresh() {
        clearTimeout(filterTimer);
        filterTimer = setTimeout(ensureCategoryStructure, 40);
      }

      function scheduleProductAnimation() {
        clearTimeout(productTimer);
        productTimer = setTimeout(animateProductCards, 45);
      }

      function patchAppFilter() {
        if (!window.App || typeof window.App.filter !== 'function' || window.App.filter.__auraCategoryPatched) return;
        const originalFilter = window.App.filter;
        window.App.filter = function () {
          const result = originalFilter.apply(this, arguments);
          scheduleCategoryRefresh();
          scheduleProductAnimation();
          return result;
        };
        window.App.filter.__auraCategoryPatched = true;
      }

      function patchRenderProducts() {
        if (typeof window.renderProducts !== 'function' || window.renderProducts.__auraCategoryPatched) return;
        const originalRenderProducts = window.renderProducts;
        window.renderProducts = function () {
          const result = originalRenderProducts.apply(this, arguments);
          scheduleCategoryRefresh();
          scheduleProductAnimation();
          return result;
        };
        window.renderProducts.__auraCategoryPatched = true;
      }

      function bindEvents() {
        const box = getFilterBox();
        if (box && box.dataset.auraCategoryBound !== '1') {
          box.dataset.auraCategoryBound = '1';
          box.addEventListener('click', function (event) {
            if (!event.target.closest('.chip')) return;
            scheduleCategoryRefresh();
            scheduleProductAnimation();
          }, { passive: true });
        }

        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(updateCategoryIndicator, 120);
        }, { passive: true });
      }

      function observeDynamicRenders() {
        if (!('MutationObserver' in window) || !document.body) return;
        const observer = new MutationObserver(function (mutations) {
          let filterChanged = false;
          let productsChanged = false;

          for (const mutation of mutations) {
            const target = mutation.target;
            if (!target) continue;

            if (target.id === 'filter-chips' || target.closest?.('#filter-chips')) filterChanged = true;
            if (target.id === 'product-grid' || target.closest?.('#product-grid')) productsChanged = true;

            if (filterChanged && productsChanged) break;
          }

          if (filterChanged) scheduleCategoryRefresh();
          if (productsChanged) scheduleProductAnimation();
        });

        observer.observe(document.body, { childList: true, subtree: true });
      }

      function initAuraCategoryMotion() {
        patchAppFilter();
        patchRenderProducts();
        bindEvents();
        observeDynamicRenders();
        ensureCategoryStructure();
        animateProductCards();

        setTimeout(function () {
          patchAppFilter();
          patchRenderProducts();
          ensureCategoryStructure();
          animateProductCards();
        }, 250);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuraCategoryMotion, { once: true });
      } else {
        initAuraCategoryMotion();
      }
    })();
    /* AURA PREMIUM CATEGORY MOTION JS - END */

/* AURA LOCATION MAP */
    (function () {
      const locationMarker = {
        city: "Cipolletti",
        province: "Rio Negro",
        country: "Argentina",
        region: "Patagonia",
        x: "48.7%",
        y: "68%",
        label: "Cipolletti, Rio Negro",
        sublabel: "Argentina · Patagonia",
        pulseColor: "#8B5CF6"
      };

      function applyAuraLocationMarker() {
        const marker = document.getElementById("aura-location-marker");
        const markerLabel = document.getElementById("aura-marker-label");
        const markerLabelTitle = document.getElementById("aura-marker-label-title");
        const markerLabelSub = document.getElementById("aura-marker-label-sub");
        if (!marker) return;

        marker.style.left = locationMarker.x;
        marker.style.top = locationMarker.y;
        document.documentElement.style.setProperty("--aura-location-pulse", locationMarker.pulseColor);

        if (markerLabel) markerLabel.setAttribute("aria-label", locationMarker.label);
        if (markerLabelTitle) markerLabelTitle.textContent = locationMarker.label;
        if (markerLabelSub) markerLabelSub.textContent = locationMarker.sublabel || [locationMarker.country, locationMarker.region].filter(Boolean).join(" · ");
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyAuraLocationMarker);
      } else {
        applyAuraLocationMarker();
      }
    })();

export const Productos = { render: () => window.renderProducts?.(), favoritos: () => window.Favorites };