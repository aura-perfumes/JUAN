export function formatMoney(value) { return '$' + Number(value || 0).toLocaleString('es-AR'); }
export function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
export function safeJSONParse(raw, fallback = null) { try { return JSON.parse(raw); } catch (_) { return fallback; } }
export function formatDate(value, locale = 'es-AR') { const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(locale); }
export const storage = { get(key, fallback = null) { return safeJSONParse(localStorage.getItem(key), fallback); }, set(key, value) { localStorage.setItem(key, JSON.stringify(value)); } };

/* SVG perfume bottle — fallback global para cards sin imagen */
const PERFUME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" fill="none" width="56" height="56" aria-hidden="true">
  <rect x="24" y="2" width="16" height="8" rx="3" fill="#C9A84C" opacity="0.7"/>
  <rect x="27" y="10" width="10" height="6" rx="1" fill="#C9A84C" opacity="0.6"/>
  <rect x="14" y="16" width="36" height="48" rx="8" fill="#C9A84C" opacity="0.18"/>
  <rect x="14" y="16" width="36" height="48" rx="8" stroke="#C9A84C" stroke-width="1.5" fill="none" opacity="0.5"/>
  <rect x="20" y="22" width="6" height="24" rx="3" fill="white" opacity="0.15"/>
  <rect x="16" y="38" width="32" height="24" rx="0" fill="#C9A84C" opacity="0.12"/>
</svg>`;
/* ───────────────────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════
   MobNav — Controla la barra de navegación inferior mobile.
   • Centraliza las acciones de cada botón.
   • Usa IntersectionObserver para marcar el botón activo según scroll.
   Modular: no toca código existente.
══════════════════════════════════════════════════════════════════════════ */
const MobNav = (() => {

  function _setActive(id) {
    document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(id);
    if (btn) btn.classList.add('active');
  }

  function goHome(btn) {
    SugCenter.closeTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const screen = document.getElementById('s-store');
    if (screen) screen.scrollTo({ top: 0, behavior: 'smooth' });
    _setActive('mob-nav-home');
  }

  function goPromos(btn) {
    SugCenter.closeTab();
    currentFilter = 'promos';
    renderProducts();
    const promosChip = document.querySelector('.chip[data-cat="promos"]');
    if (promosChip) {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      promosChip.classList.add('active');
    }
    const grid = document.getElementById('product-grid');
    const screen = document.getElementById('s-store');
    if (grid && screen) screen.scrollTo({ top: grid.offsetTop - 80, behavior: 'smooth' });
    _setActive('mob-nav-promos');
  }

  function goSugerencias(btn) {
    SugCenter.openTab();
    _setActive('mob-nav-sug');
  }

  function goCarrito(btn) {
    if (typeof openCheckout === 'function') openCheckout({ resetStep: true });
    else Cart.open();
    // No cambiamos active: el carrito es un overlay, no una sección
  }

  // ── IntersectionObserver: activa el botón correcto al hacer scroll ──────
  function _initObserver() {
    const screen = document.getElementById('s-store');
    if (!screen || !('IntersectionObserver' in window)) return;

    // Observamos el hero y el product-grid dentro del scroll container (#s-store)
    // Usamos un trick: root = #s-store, threshold = 0.15
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        if (id === 'store-hero') _setActive('mob-nav-home');
        if (id === 'product-grid') _setActive(currentFilter === 'promos' ? 'mob-nav-promos' : 'mob-nav-home');
      });
    }, {
      root: screen,
      rootMargin: '0px 0px -40% 0px',
      threshold: 0.10,
    });

    // Observar tras un breve delay para que el DOM esté listo
    setTimeout(() => {
      const hero = document.getElementById('store-hero');
      const grid = document.getElementById('product-grid');
      if (hero) observer.observe(hero);
      if (grid) observer.observe(grid);
    }, 800);
  }

  // Arrancar el observer cuando el script carga
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initObserver);
  } else {
    setTimeout(_initObserver, 400);
  }

  return { goHome, goPromos, goSugerencias, goCarrito };
})();
/* FIN — MobNav */

if (typeof PERFUME_SVG !== 'undefined') window.PERFUME_SVG = PERFUME_SVG;
if (typeof MobNav !== 'undefined') window.MobNav = MobNav;

window.AuraDock = (() => {
  function setActive(id) {
    document.querySelectorAll('.aura-dock-item').forEach(item => item.classList.remove('active'));
    const item = document.getElementById(id);
    if (item) item.classList.add('active');
  }

  function goHome() {
    if (typeof MobNav !== 'undefined' && typeof MobNav.goHome === 'function') MobNav.goHome();
    else App.goStore();
    setActive('aura-dock-home');
  }

  function goCollection() {
    if (typeof SugCenter !== 'undefined' && typeof SugCenter.closeTab === 'function') SugCenter.closeTab();
    const grid = document.getElementById('product-grid');
    const screen = document.getElementById('s-store');
    if (grid && screen) screen.scrollTo({ top: grid.offsetTop - 80, behavior: 'smooth' });
    setActive('aura-dock-collection');
  }

  function goSugerencias() {
    if (typeof MobNav !== 'undefined' && typeof MobNav.goSugerencias === 'function') MobNav.goSugerencias();
    else if (typeof SugCenter !== 'undefined' && typeof SugCenter.openTab === 'function') SugCenter.openTab();
    setActive('aura-dock-sug');
  }

  function goFavorites() {
    if (typeof Favorites !== 'undefined' && typeof Favorites.openPanel === 'function') Favorites.openPanel();
    setActive('aura-dock-favorites');
  }

  function goNosotros() {
    if (typeof App !== 'undefined' && typeof App.openNosotros === 'function') App.openNosotros();
    setActive('aura-dock-about');
  }

  function goCart() {
    setActive('aura-dock-cart');
  }

  function syncFromMobileNav() {
    const map = {
      'mob-nav-home': 'aura-dock-home',
      'mob-nav-promos': 'aura-dock-collection',
      'mob-nav-sug': 'aura-dock-sug'
    };
    const active = document.querySelector('.mob-nav-btn.active');
    if (active && map[active.id]) setActive(map[active.id]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncFromMobileNav);
  } else {
    setTimeout(syncFromMobileNav, 300);
  }

  return { setActive, goHome, goCollection, goSugerencias, goFavorites, goNosotros, goCart };
})();