const splash = document.getElementById('app-splash');

function hideSplashFallback() {
  if (!splash || splash.classList.contains('is-hidden')) return;
  splash.classList.add('is-hidden');
  window.setTimeout(() => splash.remove(), 520);
}

window.addEventListener('error', () => {
  window.setTimeout(hideSplashFallback, 700);
});

window.addEventListener('unhandledrejection', () => {
  window.setTimeout(hideSplashFallback, 700);
});

window.setTimeout(hideSplashFallback, 5200);
