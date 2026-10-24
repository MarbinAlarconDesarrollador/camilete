(() => {
  const scriptUrl = document.currentScript.src;
  if ('serviceWorker' in navigator) {
    const workerUrl = new URL('../sw.js', scriptUrl);
    navigator.serviceWorker.register(workerUrl).catch(() => {});
  }

  let installPrompt;
  const isInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  const isIos =
    /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
    (window.navigator.platform === 'MacIntel' &&
      window.navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(window.navigator.userAgent);

  if (isInstalled()) return;

  const button = document.createElement('button');
  button.id = 'install-app';
  button.className = 'install-app-button';
  button.type = 'button';
  button.setAttribute('aria-label', 'Instalar CAMILETE en este dispositivo');
  button.title = 'Instalar CAMILETE';
  const logoUrl = new URL('../assets/icons/logogpt-2.png', scriptUrl);
  button.innerHTML = `<img src="${logoUrl.href}" alt="" aria-hidden="true">`;

  const modal = document.createElement('div');
  modal.className = 'install-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <section class="install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title" aria-describedby="install-description">
      <button class="install-modal-close" type="button" aria-label="Cerrar">×</button>
      <img class="install-modal-logo" src="${logoUrl.href}" alt="">
      <p class="install-modal-eyebrow">CAMILETE EN TU DISPOSITIVO</p>
      <h2 id="install-title">¿Quieres instalar CAMILETE?</h2>
      <p class="install-modal-description" id="install-description"></p>
      <ol class="install-steps"></ol>
      <div class="install-modal-actions">
        <button class="install-modal-primary" type="button"></button>
        <button class="install-modal-secondary" type="button">Ahora no</button>
      </div>
    </section>`;

  const description = modal.querySelector('#install-description');
  const steps = modal.querySelector('.install-steps');
  const primary = modal.querySelector('.install-modal-primary');
  const closeButton = modal.querySelector('.install-modal-close');
  const closeModal = () => {
    modal.hidden = true;
    button.focus();
  };

  const updateModalContent = () => {
    if (installPrompt) {
      description.textContent =
        'Accede a nuestro menú y haz tus pedidos más rápido, directamente desde tu pantalla de inicio.';
      steps.hidden = true;
      primary.textContent = 'Instalar ahora';
      primary.disabled = false;
      return;
    }

    steps.hidden = false;
    primary.textContent = 'Entendido';
    primary.disabled = false;
    if (isIos) {
      description.textContent =
        'Agrega CAMILETE a tu pantalla de inicio para tenernos siempre a mano:';
      steps.innerHTML =
        '<li>Toca el botón <strong>Compartir</strong> de Safari.</li><li>Elige <strong>Agregar a pantalla de inicio</strong>.</li><li>Confirma tocando <strong>Agregar</strong>.</li>';
    } else if (isAndroid) {
      description.textContent =
        'Si no aparece la instalación automática, puedes agregar CAMILETE desde el menú de tu navegador:';
      steps.innerHTML =
        '<li>Toca el menú <strong>⋮</strong> de Chrome.</li><li>Elige <strong>Instalar aplicación</strong> o <strong>Agregar a pantalla principal</strong>.</li><li>Confirma la instalación.</li>';
    } else {
      description.textContent =
        'Busca la opción para instalar CAMILETE o agregarla a la pantalla de inicio en el menú de tu navegador.';
      steps.innerHTML =
        '<li>Abre el menú del navegador.</li><li>Selecciona <strong>Instalar aplicación</strong> o <strong>Agregar a pantalla de inicio</strong>.</li>';
    }
  };

  const openModal = () => {
    updateModalContent();
    modal.hidden = false;
    closeButton.focus();
  };

  button.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);
  modal.querySelector('.install-modal-secondary').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
  primary.addEventListener('click', async () => {
    if (!installPrompt) {
      closeModal();
      return;
    }

    const prompt = installPrompt;
    installPrompt = null;
    primary.disabled = true;
    await prompt.prompt();
    await prompt.userChoice;
    modal.hidden = true;
    button.focus();
  });

  document.body.append(button, modal);

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    if (isInstalled()) return;
    installPrompt = event;
    if (!modal.hidden) updateModalContent();
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    modal.hidden = true;
    button.remove();
  });
})();
