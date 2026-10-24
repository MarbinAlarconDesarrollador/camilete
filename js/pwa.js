(() => {
  if ('serviceWorker' in navigator) {
    const workerUrl = new URL('../sw.js', document.currentScript.src);
    navigator.serviceWorker.register(workerUrl).catch(() => {});
  }

  let installPrompt;
  const isInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    if (isInstalled()) return;
    installPrompt = event;
    if (document.querySelector('#install-app')) return;

    const button = document.createElement('button');
    button.id = 'install-app';
    button.className = 'install-app-button';
    button.type = 'button';
    button.setAttribute('aria-label', 'Instalar CAMILETE en este dispositivo');
    button.title = 'Instalar CAMILETE';
    button.innerHTML = '<img src="assets/icons/logogpt-2.png" alt="" aria-hidden="true">';
    button.addEventListener('click', async () => {
      if (!installPrompt) return;

      const wantsToInstall = window.confirm(
        '¿Quieres instalar CAMILETE en tu dispositivo?',
      );
      if (!wantsToInstall) return;

      const prompt = installPrompt;
      installPrompt = null;
      await prompt.prompt();
      await prompt.userChoice;
      button.remove();
    });
    document.body.append(button);
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    document.querySelector('#install-app')?.remove();
  });
})();
