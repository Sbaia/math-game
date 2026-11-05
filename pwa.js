/* Installation and update controls stay outside individual game sessions. */
(function () {
  const install = document.getElementById('pwa-install');
  const update = document.getElementById('pwa-update');
  const status = document.getElementById('pwa-status');
  let installPrompt = null;
  let registration = null;
  let updateRequested = false;
  let readyOffline = false;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  function showStatus() {
    status.textContent = !navigator.onLine
      ? 'SEI OFFLINE. PUOI CONTINUARE A GIOCARE. L’AUDIO POTREBBE RICHIEDERE INTERNET.'
      : readyOffline ? 'PRONTO PER GIOCARE ANCHE OFFLINE.' : '';
  }
  window.addEventListener('online', showStatus);
  window.addEventListener('offline', showStatus);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    install.hidden = !!standalone();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    install.hidden = true;
  });
  install.addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    install.hidden = true;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch (_) { status.textContent = 'PUOI INSTALLARE IL GIOCO DAL MENU DEL BROWSER.'; }
  });
  function showUpdate() { update.hidden = !(registration && registration.waiting && navigator.serviceWorker.controller); }
  update.addEventListener('click', () => {
    if (!registration || !registration.waiting) return;
    updateRequested = true;
    update.disabled = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  showStatus();
  if (!('serviceWorker' in navigator) || !window.isSecureContext || !/^https?:$/.test(location.protocol)) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateRequested) location.reload();
  });
  navigator.serviceWorker.ready.then(() => { readyOffline = true; showStatus(); });
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then(reg => {
    registration = reg;
    showUpdate();
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') showUpdate();
      });
    });
  }).catch(() => {
    if (!navigator.serviceWorker.controller) status.textContent = 'PER PREPARARE IL GIOCO OFFLINE, RIAPRILO CON INTERNET.';
  });
})();
