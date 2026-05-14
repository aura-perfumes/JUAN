/* ══════════════════════════════════════════════════════════════════════════
   CENTRAL DE SUGERENCIAS
   Usa Fuse.js para búsqueda fuzzy tolerante a errores tipográficos.
   La tabla de recomendaciones cruza categorías y similitudes de perfumes.
   Modular: no modifica ningún código existente.
══════════════════════════════════════════════════════════════════════════ */

/* ══ PROMO MODAL — Sistema de combos armables ══════ */
const PromoModal = (() => {
  let currentPromo = null;
  let selectedTier = null;
  let selectedFragrances = [];

  function open(promoId) {
    const promo = getActivePromos().find(p => p.id === promoId);
    if (!promo) return;
    currentPromo = { ...promo, fragrances: Array.from(new Set((promo.fragrances || []).filter(Boolean))) };
    selectedTier = currentPromo.tiers[0];
    selectedFragrances = Array.from({ length: selectedTier.qty }, (_, i) => currentPromo.fragrances[i] || currentPromo.fragrances[0] || '');
    render();
    document.getElementById('promo-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    document.getElementById('promo-modal').classList.remove('active');
    document.body.style.overflow = '';
  }

  function selectTier(qty) {
    const promo = currentPromo;
    if (!promo) return;
    const tier = getPromoTier(promo, qty);
    if (!tier) return;
    selectedTier = tier;
    while (selectedFragrances.length < tier.qty) selectedFragrances.push(promo.fragrances[0] || '');
    if (selectedFragrances.length > tier.qty) selectedFragrances = selectedFragrances.slice(0, tier.qty);
    render();
  }

  function updateFragrance(idx, value) {
    selectedFragrances[idx] = value;
    updateFooter();
  }

  function render() {
    const promo = currentPromo;
    if (!promo) return;
    const body = document.getElementById('promo-modal-body');
    document.getElementById('promo-modal-title').textContent = promo.name;
    const tierButtons = promo.tiers.map(t => `
      <button class="promo-tier-btn ${selectedTier?.qty === t.qty ? 'active' : ''}" onclick="PromoModal.selectTier(${t.qty})">
        <span class="promo-tier-qty">${t.qty}x</span>
        <span>$${t.total.toLocaleString('es-AR')}</span>
      </button>`).join('');
    const fragCount = selectedTier?.qty || 1;
    const fragSlots = Array.from({ length: Math.min(fragCount, 50) }, (_, i) => `
      <div class="promo-frag-slot">
        <div class="promo-frag-num">${i + 1}</div>
        <select class="promo-frag-select" onchange="PromoModal.updateFragrance(${i}, this.value)">
          ${promo.fragrances.map(f => `<option value="${escapeHtml(f)}" ${selectedFragrances[i] === f ? 'selected' : ''}>${escapeHtml(f)}</option>`).join('')}
        </select>
      </div>`).join('');
    body.innerHTML = `
      <div>
        <div class="promo-tiers-label">Elegí la cantidad</div>
        <div class="promo-tiers-grid">${tierButtons}</div>
      </div>
      <div>
        <div class="promo-frags-label">Elegí las fragancias (${fragCount} ${fragCount === 1 ? 'unidad' : 'unidades'})</div>
        <div class="promo-frags-info">Podés repetir fragancias. Cada selector equivale a una unidad.</div>
        <div class="promo-frag-slots">${fragSlots}</div>
      </div>
      ${promo.note ? `<div class="promo-note">ℹ️ ${escapeHtml(promo.note)}</div>` : ''}
    `;
    updateFooter();
  }

  function updateFooter() {
    if (!selectedTier) return;
    const label = document.getElementById('promo-total-label');
    if (label) label.textContent = `Total: $${selectedTier.total.toLocaleString('es-AR')}`;
  }

  function addToCart() {
    const promo = currentPromo;
    const tier = selectedTier;
    if (!promo || !tier) return;
    const frags = selectedFragrances.slice(0, tier.qty);
    Cart.addItem({
      id: `${promo.id}-${Date.now()}`,
      name: `${promo.name} — Combo x${tier.qty}`,
      price: tier.total,
      qty: 1,
      emoji: promo.emoji,
      images: promo.images || [],
      size: `x${tier.qty}: ${frags.join(', ')}`,
      _isPromo: true,
      _promoId: promo.id,
      _promoQty: tier.qty,
      _promoFragrances: frags,
    });
    close();
    showToast(`Combo "${promo.name}" x${tier.qty} agregado al carrito ✓`);
  }

  return { open, close, selectTier, updateFragrance, addToCart };
})();

const PromoAdmin = (() => {
  function parseFragrances(value) {
    return String(value || '').split(',').map(f => f.trim()).filter(Boolean);
  }

  function normalizePromoImages(value) {
    if (Array.isArray(value)) return value.map(v => String(v || '').trim()).filter(Boolean);
    const single = String(value || '').trim();
    return single ? [single] : [];
  }

  function getPromoImageValue(id) {
    return document.getElementById(`promo-img-${id}`)?.value?.trim() || '';
  }

  function updatePromoImagePreview(id) {
    const img = document.getElementById(`promo-img-preview-${id}`);
    if (!img) return;
    const src = getPromoImageValue(id);
    if (src) {
      img.src = src;
      img.style.display = 'block';
    } else {
      img.removeAttribute('src');
      img.style.display = 'none';
    }
  }

  function normalizeTiers(rows) {
    const tiers = (rows || []).map(row => ({
      qty: Math.max(1, Number(row?.qty || 0)),
      total: Math.max(0, Number(row?.total || 0))
    })).filter(row => Number.isFinite(row.qty) && Number.isFinite(row.total));
    return tiers.length ? tiers : [{ qty: 3, total: 0 }];
  }

  function readTiersFromDom(id) {
    const box = document.getElementById(`promo-tiers-${id}`);
    if (!box) return [{ qty: 3, total: 0 }];
    const rows = Array.from(box.querySelectorAll('.promo-tier-row')).map(row => ({
      qty: row.querySelector('[data-tier-qty]')?.value,
      total: row.querySelector('[data-tier-total]')?.value
    }));
    return normalizeTiers(rows);
  }

  function renderTierRows(promo) {
    const tiers = normalizeTiers(promo.tiers || []);
    return tiers.map((tier, index) => `
      <div class="promo-tier-row">
        <div>
          <label class="config-label">Cant.</label>
          <input class="config-input" type="number" min="1" data-tier-qty value="${Number(tier.qty || 0)}" />
        </div>
        <div>
          <label class="config-label">Precio total</label>
          <input class="config-input" type="number" min="0" step="1" data-tier-total value="${Number(tier.total || 0)}" />
        </div>
        <button type="button" class="btn-outline" style="padding:.55rem 0;font-size:1rem;line-height:1;border-radius:10px" onclick="PromoAdmin.removeTier('${promo.id}', ${index})">×</button>
      </div>`).join('');
  }

  function syncPromoDraft(id) {
    const promo = PROMOS_DATA.find(item => item.id === id);
    if (!promo) return null;
    const name = document.getElementById(`promo-name-${id}`)?.value?.trim();
    const emoji = document.getElementById(`promo-emoji-${id}`)?.value?.trim();
    const note = document.getElementById(`promo-note-${id}`)?.value?.trim();
    const frags = document.getElementById(`promo-frags-${id}`)?.value;
    const active = document.getElementById(`promo-active-${id}`)?.checked;
    const imageUrl = getPromoImageValue(id);
    if (name) promo.name = name;
    if (emoji) promo.emoji = emoji;
    promo.note = note || '';
    if (typeof frags === 'string') promo.fragrances = parseFragrances(frags);
    if (typeof active === 'boolean') promo.active = active;
    promo.images = normalizePromoImages(imageUrl);
    promo.tiers = readTiersFromDom(id);
    return promo;
  }

  function render() {
    const list = document.getElementById('promo-admin-list');
    if (!list) return;
    list.innerHTML = PROMOS_DATA.map(promo => {
      const fragStr = (promo.fragrances || []).join(', ');
      const note = promo.note || '';
      const promoImage = promo.images?.[0] || '';
      return `
        <div class="promo-admin-card">
          <div class="promo-admin-head">
            <div style="font-weight:700;font-size:.85rem">${escapeHtml(promo.emoji || '🔥')} ${escapeHtml(promo.name || 'Promo')}</div>
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
              <label class="config-label">Emoji</label>
              <input class="config-input" type="text" id="promo-emoji-${promo.id}" value="${escapeHtml(promo.emoji || '🔥')}" maxlength="4" />
            </div>
          </div>

          <div class="promo-admin-grid" style="margin-top:.85rem">
            <div>
              <label class="config-label">Imagen de portada (URL)</label>
              <input class="config-input" type="text" id="promo-img-${promo.id}" value="${escapeHtml(promoImage)}" oninput="PromoAdmin.updateImagePreview('${promo.id}')" />
            </div>
            <div>
              <label class="config-label">Preview</label>
              <div style="height:72px;border:1px solid var(--border);border-radius:12px;background:#0f1220;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:.35rem">
                <img id="promo-img-preview-${promo.id}" src="${escapeHtml(promoImage)}" alt="Preview promo" style="max-width:100%;max-height:100%;object-fit:cover;display:${promoImage ? 'block' : 'none'}" />
              </div>
            </div>
          </div>

          <label class="config-label">Nota opcional</label>
          <input class="config-input" type="text" id="promo-note-${promo.id}" value="${escapeHtml(note)}" style="margin-bottom:.85rem" />

          <label class="config-label">Fragancias disponibles</label>
          <textarea class="config-textarea" id="promo-frags-${promo.id}" style="min-height:70px;margin-bottom:.85rem">${escapeHtml(fragStr)}</textarea>

          <label class="config-label">Tiers</label>
          <div class="promo-tiers-admin" id="promo-tiers-${promo.id}">
            ${renderTierRows(promo)}
          </div>
          <div class="promo-tier-actions">
            <button type="button" class="btn-outline" style="border-radius:10px;padding:.5rem .9rem;font-size:.78rem" onclick="PromoAdmin.addTier('${promo.id}')">+ Agregar tier</button>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:1rem">
            <button type="button" class="btn-outline promo-delete-btn" style="border-radius:99px;padding:.55rem 1rem;font-size:.72rem" onclick="PromoAdmin.remove('${promo.id}')">Eliminar promo</button>
          </div>
        </div>`;
    }).join('');
  }

  function save() {
    const overrides = {};
    PROMOS_DATA.forEach(promo => {
      const name = document.getElementById(`promo-name-${promo.id}`)?.value?.trim() || 'Nueva promo';
      const emoji = document.getElementById(`promo-emoji-${promo.id}`)?.value?.trim() || '🔥';
      const note = document.getElementById(`promo-note-${promo.id}`)?.value?.trim() || '';
      const frags = parseFragrances(document.getElementById(`promo-frags-${promo.id}`)?.value || '');
      const active = !!document.getElementById(`promo-active-${promo.id}`)?.checked;
      const tiers = readTiersFromDom(promo.id);
      const images = normalizePromoImages(getPromoImageValue(promo.id));
      promo.name = name;
      promo.emoji = emoji;
      promo.note = note;
      promo.fragrances = frags;
      promo.active = active;
      promo.tiers = tiers;
      promo.images = images;
      overrides[promo.id] = { name, emoji, fragrances: frags, active, tiers, note, images };
    });
    localStorage.setItem('aura_promo_overrides', JSON.stringify(overrides));
    renderProducts();
    showToast('Promos guardadas ✓');
  }

  function openNew() {
    PROMOS_DATA.push({
      id: 'promo-' + Date.now(),
      name: 'Nueva promo',
      emoji: '🔥',
      active: false,
      images: [],
      fragrances: [],
      tiers: [{ qty: 3, total: 0 }],
      note: ''
    });
    render();
  }

  function remove(id) {
    const promo = PROMOS_DATA.find(item => item.id === id);
    if (!promo) return;
    if (!window.confirm(`¿Eliminar la promo "${promo.name}"?`)) return;
    const index = PROMOS_DATA.findIndex(item => item.id === id);
    if (index >= 0) PROMOS_DATA.splice(index, 1);
    save();
    render();
  }

  function addTier(id) {
    const promo = syncPromoDraft(id);
    if (!promo) return;
    promo.tiers.push({ qty: 1, total: 0 });
    render();
  }

  function removeTier(id, index) {
    const promo = syncPromoDraft(id);
    if (!promo) return;
    const tiers = normalizeTiers(promo.tiers || []);
    if (tiers.length <= 1) {
      promo.tiers = [{ qty: 3, total: 0 }];
      render();
      return;
    }
    tiers.splice(index, 1);
    promo.tiers = normalizeTiers(tiers);
    render();
  }

  function loadOverrides() {
    try {
      const overrides = JSON.parse(localStorage.getItem('aura_promo_overrides') || '{}');
      PROMOS_DATA.forEach(promo => {
        const override = overrides[promo.id];
        if (!override) return;
        if (typeof override.name === 'string' && override.name.trim()) promo.name = override.name.trim();
        if (typeof override.emoji === 'string' && override.emoji.trim()) promo.emoji = override.emoji.trim();
        if (Array.isArray(override.fragrances)) promo.fragrances = override.fragrances.filter(Boolean);
        if (typeof override.active === 'boolean') promo.active = override.active;
        if (Array.isArray(override.tiers)) promo.tiers = normalizeTiers(override.tiers);
        if (typeof override.note === 'string') promo.note = override.note;
        if (Array.isArray(override.images)) promo.images = normalizePromoImages(override.images);
      });
    } catch (e) {}
  }

  return { render, save, loadOverrides, openNew, remove, addTier, removeTier, updateImagePreview: updatePromoImagePreview };
})();

const SugCenter = (() => {

  // ── Grupos de sugerencias (bidireccional) ───────────────────────────────
  // Cada array es una familia de perfumes relacionados.
  // Cualquier elemento puede ser el punto de entrada; se sugieren los demás.
  const gruposSugerencias = [
      [
          "Xerjoff Erba Pura 35ml",
          "Amber Oud Gold Edition 35ml",
          "Xerjoff Coro 35ml"
      ],
      [
          "Fakhar Rose 35ml",
          "Victoria 35ml",
          "Her Confession 35ml"
      ],
      [
          "Club de Nuit Intense Man 35ml",
          "Qaed al Fursan 35ml",
          "Creed Aventus"
      ],
      [
          "Hawas Ice 35ml",
          "9am Dive 35ml",
          "9am 35ml",
          "Odyssey Limoni 35ml",
          "Vulcan Black 35ml",
          "Vulcan Feu 35ml",
          "Jean Paul Gaultier Ultra Male"
      ],
      [
          "9pm 35ml",
          "Odyssey Spectra 35ml"
      ],
      [
          "Club de Nuit Untold 35ml",
          "Amber Oud Ultra 35ml"
      ],
      [
          "Eclaire 35ml",
          "Eclaire Pistache 35ml",
          "Whipped Pleasure 35ml",
          "Mallow Madness 35ml",
          "Vanilla Freak 35ml",
          "Berry on Top 35ml",
          "Paco Rabanne Invictus / Invictus Aqua"
      ],
      [
          "Fakhar Black 35ml",
          "Club de Nuit Sillage 35ml",
          "Odyssey Mega 35ml",
          "Yves Saint Laurent Y EDP"
      ],
      [
          "Khamrah Qahwa 35ml",
          "Asad Bourbon 35ml",
          "Raghba 35ml",
          "Sehr 35ml",
          "His Confession 35ml",
          "Kilian Angels’ Share"
      ],
      [
          "Odyssey Dubai Chocolat 35ml",
          "Choco Overdose 35ml",
          "Asad Bourbon 35ml",
          "Khamrah Qahwa 35ml"
      ],
      [
          "Yara 35ml",
          "Noble Blush 35ml",
          "Odyssey Candee 35ml",
          "Club de Nuit Woman 35ml",
          "Vulcan Baie 35ml",
          "Ariana Grande Cloud / Sol de Janeiro Cheirosa 62"
      ],
      [
          "Yara Moi 35ml",
          "Fakhar Rose 35ml",
          "Club de Nuit Woman 35ml",
          "Fakhar Gold Extrait 35ml",
          "Atheeri 35ml",
          "Givenchy L’Interdit"
      ],
      [
          "Yara Tous 35ml",
          "Island Bliss 35ml"
      ],
      [
          "Asad 35ml",
          "Bade’e al Oud for Glory 35ml",
          "Hawas Fire 35ml",
          "Dior Sauvage Elixir"
      ],
      [
          "Yum Yum 35ml",
          "Bade’e al Oud Noble Blush 35ml",
          "Berry on Top 35ml"
      ],
      [
          "Xerjoff Soprano 35ml",
          "Xerjoff Opera",
          "Bade’e al Oud Amethyst 35ml",
          "Initio Atomic Rose"
      ],
      [
          "Bade’e al Oud Honor & Glory 35ml",
          "Club de Nuit Milestone 35ml",
          "Whipped Pleasure 35ml"
      ],
      [
          "Asad Zanzibar 35ml",
          "Qaed al Fursan Unlimited 35ml",
          "Amber Oud White Edition 35ml",
          "Vulcan Sable 35ml"
      ],
      [
          "Khamrah 250ml",
          "Khamrah Qahwa 250ml",
          "Raghba 250ml",
          "Kilian Angels’ Share"
      ],
      [
          "Club de Nuit Intense Man 250ml",
          "Fakhar Black 250ml",
          "Creed Aventus"
      ],
      [
          "Yara Moi 250ml",
          "Fakhar Rose 250ml",
          "Givenchy L’Interdit"
      ],
      [
          "Yara 250ml",
          "Yara Candy 250ml",
          "Ariana Grande Cloud / Sol de Janeiro Cheirosa 62"
      ],
      [
          "Khamrah 100ml",
          "Khamrah Qahwa 100ml",
          "Liquid Brun 100ml",
          "Kilian Angels’ Share"
      ],
      [
          "Liquid Brun 100ml",
          "Asad Bourbon 100ml",
          "Parfums de Marly Althaïr"
      ],
      [
          "Yara 100ml",
          "Odyssey Candee 100ml",
          "Ariana Grande Cloud / Sol de Janeiro Cheirosa 62"
      ]
  ];

  // Corpus plano: cada entrada tiene el nombre del perfume + índice de su grupo
  // Esto permite búsqueda fuzzy sobre TODOS los nombres, no solo la primera columna.
  let _fuseTodos = null;

  // Índice Fuse para resolver nombres sugeridos contra el catálogo AURA
  let _fuseCatalog = null;

  function _buildFuse() {
    // Corpus 1 — todos los nombres de todos los grupos (bidireccional)
    const corpus = [];
    gruposSugerencias.forEach((grupo, gi) => {
      grupo.forEach(nombre => {
        corpus.push({ nombre, grupoIdx: gi });
      });
    });
    _fuseTodos = new Fuse(corpus, {
      keys: [{ name: 'nombre', weight: 1 }],
      threshold: 0.42,
      distance: 150,
      minMatchCharLength: 2,
      includeScore: true,
    });

    // Corpus 2 — productos del catálogo AURA (para resolver a objetos reales)
    _fuseCatalog = new Fuse(PRODUCTS, {
      keys: [
        { name: 'name', weight: 0.85 },
        { name: 'desc', weight: 0.15 },
      ],
      threshold: 0.50,
      distance: 150,
      minMatchCharLength: 2,
      includeScore: true,
    });
  }

  // Resuelve un nombre de la tabla al producto del catálogo más cercano
  function _resolveProductByName(nombre) {
    if (!_fuseCatalog) return null;
    const hits = _fuseCatalog.search(nombre);
    return hits.length ? hits[0].item : null;
  }

  // Dado el hit de búsqueda, devuelve todos los otros miembros del grupo
  // (excluyendo el que el cliente ya tiene) resueltos como productos del catálogo
  function _getRecommendations(matchedNombre, grupoIdx) {
    const grupo = gruposSugerencias[grupoIdx];
    const otrosNombres = grupo.filter(n => n !== matchedNombre);
    return otrosNombres
      .map(n => _resolveProductByName(n))
      .filter(p => p && (p.stock == null || p.stock > 0));
  }

  // ── Renderiza las cards de sugerencias ──────────────────────────────────
  // matchedName: nombre canónico del perfume que el cliente ya tiene (string)
  // suggestions: array de objetos producto del catálogo AURA
  function _renderResults(matchedName, suggestions) {
    const box = document.getElementById('sug-results');
    if (!box) return;

    if (!suggestions.length) {
      box.innerHTML = `
        <div class="sug-empty">
          <span class="sug-empty-ico">🌿</span>
          <p class="sug-empty-txt">¡Ya tenés lo mejor de nuestra colección! 😊</p>
          <p class="sug-empty-hint">No hay sugerencias adicionales en este momento.</p>
        </div>`;
      return;
    }

    const cards = suggestions.map((p, i) => {
      const hasImg = !!(p.images && p.images[0]);
      const imgHtml = hasImg
        ? `<img src="${p.images[0]}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async"/>`
        : `<span style="position:relative;z-index:1;font-size:3.2rem">${p.emoji || '🌸'}</span>`;
      const badgeHtml = p.badge
        ? `<span class="sug-card-badge">${escapeHtml(p.badge)}</span>` : '';
      return `
        <div class="sug-card" style="animation-delay:${i * 0.08}s">
          <div class="sug-card-thumb">
            ${imgHtml}
            ${badgeHtml}
          </div>
          <div class="sug-card-body">
            <div class="sug-card-cat">${escapeHtml(getCategoryName(p.cat))} · ${escapeHtml(getSubcategoryName(p.cat2))}</div>
            <div class="sug-card-name">${escapeHtml(p.name)}</div>
            <div class="sug-card-footer">
              <span class="sug-card-price">$${p.price.toLocaleString('es-AR')}</span>
              <button class="sug-card-btn" onclick="SugCenter.addToCart('${p.id}')">
                🛍 Comprar
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    box.innerHTML = `
      <div class="sug-result-wrap">
        <div class="sug-match-banner">
          <span class="sug-match-ico">✅</span>
          <div>
            Tenés <span class="sug-match-name">${escapeHtml(matchedName)}</span> —
            te recomendamos estas fragancias que te van a encantar:
          </div>
        </div>
        <div class="sug-section-label">Perfumes recomendados para vos</div>
        <div class="sug-grid">${cards}</div>
      </div>`;
  }

  // ── Función principal de búsqueda ───────────────────────────────────────
  function search() {
    const input = document.getElementById('sug-input');
    if (!input) return;
    const query = input.value.trim();

    if (!query) {
      document.getElementById('sug-results').innerHTML = `
        <div class="sug-no-query">
          <span class="sug-no-query-ico">🌸</span>
          <p class="sug-no-query-txt">Ingresá el nombre de un perfume que ya tenés<br>y descubrí qué más te puede gustar.</p>
        </div>`;
      return;
    }

    // Reconstruye los índices Fuse cada vez (incorpora productos agregados dinámicamente)
    _buildFuse();

    // 1. Busca en TODOS los nombres de todos los grupos (bidireccional) con tolerancia fuzzy
    const hits = _fuseTodos.search(query);

    if (!hits.length) {
      document.getElementById('sug-results').innerHTML = `
        <div class="sug-empty">
          <span class="sug-empty-ico">🔍</span>
          <p class="sug-empty-txt">No encontramos <em style="color:var(--gold)">"${escapeHtml(query)}"</em><br>en nuestra base de sugerencias.</p>
          <p class="sug-empty-hint">Intentá con otro nombre. Ej: "Erba Pura", "9pm", "Yara Moi", "Khamrah"…</p>
        </div>`;
      return;
    }

    // 2. Obtenemos el nombre canónico que coincidió y el índice de su grupo
    const { nombre: matchedNombre, grupoIdx } = hits[0].item;

    // 3. Todos los otros miembros del grupo como sugerencias del catálogo
    const suggestions = _getRecommendations(matchedNombre, grupoIdx);

    // 4. Renderiza
    _renderResults(matchedNombre, suggestions);
  }

  // ── Abre la pestaña de sugerencias (oculta la tienda normal) ───────────
  function openTab() {
    const storeBody = document.querySelector('#s-store .store-body');
    const sec = document.getElementById('sec-sugerencias');
    if (storeBody) storeBody.style.display = 'none';
    if (sec) sec.style.display = '';
    const screen = document.getElementById('s-store');
    if (screen) screen.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const inp = document.getElementById('sug-input');
      if (inp) inp.focus();
    }, 300);
  }

  // ── Cierra la pestaña y vuelve a la tienda normal ───────────────────────
  function closeTab() {
    const storeBody = document.querySelector('#s-store .store-body');
    const sec = document.getElementById('sec-sugerencias');
    if (storeBody) storeBody.style.display = '';
    if (sec) sec.style.display = 'none';
  }

  // ── Agrega un producto al carrito desde la Central ─────────────────────
  function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) Cart.addItem(product);
  }

  return { search, openTab, closeTab, addToCart };
})();
/* FIN — Central de Sugerencias */

for (const [name, value] of Object.entries({ PromoModal, PromoAdmin, SugCenter })) { if (typeof value !== 'undefined') window[name] = value; }

export const Sugerencias = { open: () => window.SugCenter?.openTab?.(), close: () => window.SugCenter?.closeTab?.(), search: () => window.SugCenter?.search?.() };