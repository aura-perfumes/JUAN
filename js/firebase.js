const firebaseConfig = {
      apiKey: "AIzaSyDPXcIHmLdv8jtfIPMJ8OmQYR8xRbT9Y-Y",
      authDomain: "auracipoletti.firebaseapp.com",
      databaseURL: "https://auracipoletti-default-rtdb.firebaseio.com",
      projectId: "auracipoletti",
      storageBucket: "auracipoletti.firebasestorage.app",
      messagingSenderId: "276346261251",
      appId: "1:276346261251:web:515be2d5b0afcaf6d1a336"
    };

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const rtdb = firebase.database ? firebase.database() : null;
    const firestore = firebase.firestore ? firebase.firestore() : null;
    const storage = firebase.storage ? firebase.storage() : null;
    console.log(rtdb ? 'Firebase Realtime Database conectado' : 'Firebase conectado sin Realtime Database');

    const LS = {
      get: k => {
        try { return JSON.parse(localStorage.getItem('aura_' + k)); }
        catch (e) { return null; }
      },
      set: (k, v) => {
        try { localStorage.setItem('aura_' + k, JSON.stringify(v)); }
        catch (e) { }
      }
    };

    window.__syncReady = false;
    window.__syncDb = rtdb || firestore;
    window.__syncRealtimeDb = rtdb;
    window.__syncFirestore = firestore;
    window.__syncStorage = storage;

    function applyNosotrosData(vals) {
      vals = vals || {};
      const map = {
        'cfg-nos-title': 'title', 'cfg-nos-p1': 'p1', 'cfg-nos-p2': 'p2',
        'cfg-s1v': 's1v', 'cfg-s1l': 's1l', 'cfg-s2v': 's2v', 'cfg-s2l': 's2l', 'cfg-s3v': 's3v', 'cfg-s3l': 's3l',
        'nos-modal-title': 'title', 'nos-modal-p1': 'p1', 'nos-modal-p2': 'p2',
        'nos-s1v': 's1v', 'nos-s1l': 's1l', 'nos-s2v': 's2v', 'nos-s2l': 's2l', 'nos-s3v': 's3v', 'nos-s3l': 's3l'
      };
      Object.entries(map).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if ('value' in el && el.tagName !== 'DIV') el.value = vals[key] || '';
        else el.textContent = vals[key] || '';
      });
    }

    function rerenderSyncedKey(key) {
      try {
        if (key === 'products') {
          const raw = LS.get('products');
          if (Array.isArray(raw) && shouldTrustRemoteProducts(raw)) {
            // Merge remote data with locally-stored images
            const localImgs = safeGetLocalImages();
            PRODUCTS = raw.map(p => ({
              ...p,
              images: (p.images && p.images.length) ? p.images : (localImgs[p.id] || [])
            }));
          }
          renderProducts();
          Dash.renderInventory();
          Dash.updatePanelKPIs();
          Dash.initAnalytics && Dash.initAnalytics();
        }
        if (key === 'taxonomy') {
          TAXONOMY = LS.get('taxonomy') || TAXONOMY;
          Dash.renderTaxonomy();
          renderStoreFilters();
          renderProducts();
          Dash.renderInventory();
        }
        if (key === 'store') {
          STORE = { ...DEFAULT_STORE_CONFIG, ...(LS.get('store') || {}) };
          applyStoreConfig();
        }
        if (key === 'orders') {
          ORDERS = Array.isArray(LS.get('orders')) ? LS.get('orders') : ORDERS;
          Dash.renderPedidos();
          Dash.updatePanelKPIs();
          Dash.initAnalytics && Dash.initAnalytics();
        }
        if (key === 'customers') {
          CUSTOMERS = Array.isArray(LS.get('customers')) ? LS.get('customers') : CUSTOMERS;
          Dash.renderClientes();
          Dash.initAnalytics && Dash.initAnalytics();
        }
        if (key === 'heatmap') {
          HEATMAP = { ...DEFAULT_HEATMAP, ...(LS.get('heatmap') || {}) };
          Dash.renderHeatmap && Dash.renderHeatmap();
        }
        if (key === 'nosotros') {
          applyNosotrosData(LS.get('nosotros') || {});
        }
        if (key === 'promos') {
          const promos = LS.get('promos');
          if (Array.isArray(promos) && window.PROMOS_DATA) {
            window.PROMOS_DATA.splice(0, window.PROMOS_DATA.length, ...promos);
            if (window.PromoAdmin?.render) window.PromoAdmin.render();
            renderProducts();
            Dash.renderInventory?.();
            Dash.updatePanelKPIs?.();
          }
        }
      } catch (err) { console.log('RENDER SYNC ERROR ->', key, err.message); }
    }

    (function () {
      const syncKeys = ['products', 'taxonomy', 'store', 'orders', 'customers', 'nosotros', 'heatmap', 'promos'];
      const baseSet = LS.set.bind(LS);
      const timers = {};
      const SYNC_BUILD = 'rtdb-sync-2026-05-01-2031';
      function hasLocalSyncKey(key) { return localStorage.getItem('aura_' + key) !== null; }
      function isDefaultProductsList(list) {
        return Array.isArray(list)
          && Array.isArray(DEFAULT_PRODUCTS)
          && list.length === DEFAULT_PRODUCTS.length
          && list.every((p, idx) => p && DEFAULT_PRODUCTS[idx] && p.id === DEFAULT_PRODUCTS[idx].id);
      }
      function shouldTrustRemoteProducts(remote) {
        if (!Array.isArray(remote)) return false;
        const local = LS.get('products');
        if (Array.isArray(local) && local.length > remote.length && isDefaultProductsList(remote)) {
          setSyncStatus('error', 'Firebase tiene el catálogo default de 8 productos; se protege el catálogo local de ' + local.length, true);
          return false;
        }
        return true;
      }
      window.__auraSyncBuild = SYNC_BUILD;
      if (new URLSearchParams(location.search).has('syncdebug')) localStorage.setItem('aura_sync_debug', '1');
      window.__syncClientId = window.__syncClientId || `aura-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      function setSyncStatus(state, message, alwaysShow) {
        window.__auraSyncStatus = { state, message, build: SYNC_BUILD, at: new Date().toISOString() };
        console.log(`AURA SYNC [${state}] ${message}`);
        if (!alwaysShow && state !== 'error' && !localStorage.getItem('aura_sync_debug')) return;
        let badge = document.getElementById('aura-sync-status');
        if (!badge) {
          badge = document.createElement('div');
          badge.id = 'aura-sync-status';
          badge.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:999999;padding:8px 10px;border-radius:10px;font:12px/1.25 system-ui,-apple-system,Segoe UI,sans-serif;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.24);max-width:310px;pointer-events:none';
          document.body.appendChild(badge);
        }
        badge.style.background = state === 'error' ? '#b42318' : state === 'ready' ? '#067647' : '#344054';
        badge.textContent = `AURA Sync ${state}: ${message}`;
      }

      window.AuraSyncDoctor = {
        build: SYNC_BUILD,
        enableDebug() { localStorage.setItem('aura_sync_debug', '1'); setSyncStatus('debug', 'debug visible activado', true); },
        disableDebug() { localStorage.removeItem('aura_sync_debug'); document.getElementById('aura-sync-status')?.remove(); },
        status() { return window.__auraSyncStatus || null; },
        async ping() {
          const payload = { at: new Date().toISOString(), client: window.__syncClientId, build: SYNC_BUILD };
          if (!rtdb) throw new Error('Realtime Database SDK no disponible');
          await rtdb.ref('aura_sync/__ping').set(payload);
          const snap = await rtdb.ref('aura_sync/__ping').once('value');
          return snap.val();
        }
      };
      setSyncStatus('init', rtdb ? `Realtime Database activo (${SYNC_BUILD})` : 'Realtime Database SDK no disponible', !!localStorage.getItem('aura_sync_debug'));

      function safeClone(v) { return JSON.parse(JSON.stringify(v)); }
      function safeGetLocalImages() {
        try { return JSON.parse(localStorage.getItem('aura_product_images') || '{}'); }
        catch (e) { return {}; }
      }
      function isDataImage(value) { return typeof value === 'string' && value.startsWith('data:image/'); }
      function safeAssetName(value) { return String(value || 'asset').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 60) || 'asset'; }
      async function uploadSyncAsset(dataUrl, name) {
        if (!isDataImage(dataUrl)) return dataUrl && dataUrl.startsWith('http') ? dataUrl : '';
        if (!storage) return '';
        try {
          const ref = storage.ref().child(`aura_sync_assets/${safeAssetName(name)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`);
          const snap = await ref.putString(dataUrl, 'data_url');
          return await snap.ref.getDownloadURL();
        } catch (err) {
          console.log('SYNC ASSET ERROR ->', name, err.message);
          return '';
        }
      }
      async function normalizeImageListForSync(images, name) {
        const list = Array.isArray(images) ? images : [];
        const out = [];
        for (let i = 0; i < list.length; i++) {
          const img = list[i];
          if (typeof img === 'string' && img.startsWith('http')) out.push(img);
          else if (isDataImage(img)) {
            const uploaded = await uploadSyncAsset(img, `${name}-${i}`);
            if (uploaded) out.push(uploaded);
          }
        }
        return out;
      }
      function syncRef(key) {
        if (rtdb) return { type: 'rtdb', ref: rtdb.ref(`aura_sync/${key}`) };
        if (firestore) return { type: 'firestore', ref: firestore.collection('aura_sync').doc(key) };
        return null;
      }
      async function readRemoteKey(key) {
        const target = syncRef(key);
        if (!target) return { exists: false, value: undefined };
        if (target.type === 'rtdb') {
          const snap = await target.ref.once('value');
          return { exists: snap.exists(), value: snap.exists() ? snap.val()?.value : undefined };
        }
        const snap = await target.ref.get();
        return { exists: snap.exists, value: snap.exists && snap.data() ? snap.data().value : undefined };
      }
      async function writeRemoteKey(key, value) {
        const payload = { value, updatedAt: new Date().toISOString(), source: window.__syncClientId };
        const target = syncRef(key);
        if (!target) throw new Error('Firebase Database no disponible');
        if (target.type === 'rtdb') return target.ref.set(payload);
        return target.ref.set(payload);
      }
      function listenRemoteKey(key, callback) {
        const target = syncRef(key);
        if (!target) return;
        if (target.type === 'rtdb') {
          target.ref.on('value', snap => {
            if (!snap.exists()) return;
            callback(snap.val() ? snap.val().value : null);
          }, err => setSyncStatus('error', 'listener ' + key + ': ' + err.message, true));
          return;
        }
        target.ref.onSnapshot(doc => {
          if (!doc.exists) return;
          callback(doc.data() ? doc.data().value : null);
        });
      }

      async function pushKey(key) {
        try {
          let value = safeClone(LS.get(key));
          if (typeof value === 'undefined' || value === null) return;
          // Firestore docs are capped at 1MB, so local data images are uploaded to Storage first.
          if (key === 'products' && Array.isArray(value)) {
            value = await Promise.all(value.map(async p => ({
              ...p,
              images: await normalizeImageListForSync(p.images, `product-${p.id || p.name}`)
            })));
          }
          if (key === 'promos' && Array.isArray(value)) {
            value = await Promise.all(value.map(async p => {
              const images = await normalizeImageListForSync(p.images, `promo-${p.id || p.name}`);
              const coverImage = String(p.coverImage || '').startsWith('http')
                ? p.coverImage
                : await uploadSyncAsset(p.coverImage, `promo-cover-${p.id || p.name}`);
              return { ...p, coverImage: coverImage || images[0] || '', images };
            }));
          }
          if (key === 'store' && value && typeof value === 'object') {
            for (const field of ['heroBg', 'portalImg', 'heroLogo']) {
              if (isDataImage(value[field])) value[field] = await uploadSyncAsset(value[field], `store-${field}`);
            }
            delete value._pendingHeroBg;
            delete value._pendingPortalImg;
            delete value._pendingHeroLogo;
          }
          await writeRemoteKey(key, value);
          window.__syncReady = true;
          setSyncStatus('ready', 'guardado ' + key + ' en Realtime Database', false);
        } catch (err) {
          setSyncStatus('error', key + ': ' + err.message, true);
        }
      }

      LS.set = function (key, value) {
        baseSet(key, value);
        if (syncKeys.includes(key)) {
          clearTimeout(timers[key]);
          timers[key] = setTimeout(() => pushKey(key), 50);
        }
      };
      window.LS = LS;

      window.addEventListener('storage', event => {
        if (!event.key || !event.key.startsWith('aura_')) return;
        const key = event.key.replace(/^aura_/, '');
        if (syncKeys.includes(key)) rerenderSyncedKey(key);
      });

      window.saveProductsLS = function () {
        // Save full products (with images) to localStorage
        LS.set('products', PRODUCTS);
        // Also save images separately keyed by product id (survives Firestore round-trips)
        const imgMap = {};
        PRODUCTS.forEach(p => { if (p.images && p.images.length) imgMap[p.id] = p.images; });
        try { localStorage.setItem('aura_product_images', JSON.stringify(imgMap)); } catch (e) { }
      };
      window.saveOrdersLS = function () { LS.set('orders', ORDERS); };
      window.saveCustomersLS = function () { LS.set('customers', CUSTOMERS); };
      window.saveTaxonomyLS = function () { LS.set('taxonomy', TAXONOMY); };
      window.saveHeatmapLS = function () { LS.set('heatmap', HEATMAP); };
      window.saveStoreConfig = function () { LS.set('store', STORE); };
      const originalSaveNosotros = Dash.saveNosotros.bind(Dash);
      Dash.saveNosotros = function () {
        const vals = {
          title: document.getElementById('cfg-nos-title').value,
          p1: document.getElementById('cfg-nos-p1').value,
          p2: document.getElementById('cfg-nos-p2').value,
          s1v: document.getElementById('cfg-s1v').value,
          s1l: document.getElementById('cfg-s1l').value,
          s2v: document.getElementById('cfg-s2v').value,
          s2l: document.getElementById('cfg-s2l').value,
          s3v: document.getElementById('cfg-s3v').value,
          s3l: document.getElementById('cfg-s3l').value
        };
        applyNosotrosData(vals);
        LS.set('nosotros', vals);
        showToast('Nosotros actualizado ✓');
      };

      async function bootstrapSync() {
        try {
          const localFallbacks = {
            products: hasLocalSyncKey('products') ? PRODUCTS : null,
            taxonomy: hasLocalSyncKey('taxonomy') ? TAXONOMY : null,
            store: hasLocalSyncKey('store') ? STORE : null,
            orders: hasLocalSyncKey('orders') ? ORDERS : null,
            customers: hasLocalSyncKey('customers') ? CUSTOMERS : null,
            heatmap: hasLocalSyncKey('heatmap') ? HEATMAP : null,
            nosotros: (function () {
              try { return JSON.parse(localStorage.getItem('aura_nosotros') || 'null') || null } catch (e) { return null }
            })(),
            promos: (function () {
              try { return JSON.parse(localStorage.getItem('aura_promos') || 'null') || null } catch (e) { return null }
            })()
          };
          for (const key of syncKeys) {
            const remoteSnap = await readRemoteKey(key);
            if (remoteSnap.exists && typeof remoteSnap.value !== 'undefined') {
              if (key === 'products' && !shouldTrustRemoteProducts(remoteSnap.value)) {
                await pushKey('products');
              } else {
                baseSet(key, remoteSnap.value);
              }
            } else if (localFallbacks[key] != null) {
              baseSet(key, localFallbacks[key]);
              await pushKey(key);
            }

            listenRemoteKey(key, remote => {
              const local = LS.get(key);
              if (JSON.stringify(remote) !== JSON.stringify(local)) {
                // For products: re-attach local images before saving (Storage/remote sync keeps URLs)
                if (key === 'products' && !shouldTrustRemoteProducts(remote)) {
                  pushKey('products');
                  return;
                }
                if (key === 'products' && Array.isArray(remote)) {
                  const imgMap = safeGetLocalImages();
                  const merged = remote.map(p => ({
                    ...p,
                    images: (p.images && p.images.length) ? p.images : (imgMap[p.id] || [])
                  }));
                  baseSet(key, merged);
                } else {
                  baseSet(key, remote);
                }
                rerenderSyncedKey(key);
              }
              window.__syncReady = true;
            });
          }

          rerenderSyncedKey('store');
          rerenderSyncedKey('taxonomy');
          rerenderSyncedKey('products'); // will merge local images automatically
          rerenderSyncedKey('orders');
          rerenderSyncedKey('customers');
          rerenderSyncedKey('heatmap');
          rerenderSyncedKey('nosotros');
          rerenderSyncedKey('promos');
          window.__syncReady = true;
          setSyncStatus('ready', 'escuchando ' + syncKeys.length + ' claves en Realtime Database', !!localStorage.getItem('aura_sync_debug'));
        } catch (err) {
          setSyncStatus('error', 'bootstrap: ' + err.message, true);
        }
      }

      bootstrapSync();
    })();

export { firebaseConfig, rtdb, firestore as db, firestore, storage, LS };
