(() => {
  if (!('serviceWorker' in navigator)) return;
  const workerUrl = new URL('../sw.js', document.currentScript.src);
  navigator.serviceWorker.register(workerUrl).catch(() => {});

  let installPrompt;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    if (document.querySelector('#install-app')) return;
    const button = document.createElement('button');
    button.id = 'install-app';
    button.className = 'install-app-button';
    button.type = 'button';
    button.textContent = '＋ Instalar CAMILETE';
    button.setAttribute('aria-label', 'Instalar CAMILETE en este dispositivo');
    button.addEventListener('click', async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      button.remove();
    });
    document.body.append(button);
  });
})();
