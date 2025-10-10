// Carga dinámica de componentes HTML (100% estático)
async function loadComponent(url, target) {
  const res = await fetch(url);
  target.innerHTML = await res.text();
}

// Inicialización
(async () => {
  const app = document.getElementById('app');

  // Carga secuencial: header, sidebar (por defecto formularios), viewer, footer
  await loadComponent('components/header.html', app);
  await loadComponent('components/sidebar-formularios.html', app);
  await loadComponent('components/viewer.html', app);
  await loadComponent('components/footer.html', app);

  // Referencias
  const btnForms = document.getElementById('btnForms');
  const btnDash = document.getElementById('btnDash');
  const viewer = document.getElementById('viewer');
  const viewerTitle = document.getElementById('viewerTitle');
  const openNew = document.getElementById('openNew');

  // Función para manejar click en sidebar
  function setupSidebar() {
    document.querySelectorAll('.item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.item-btn.active').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const title = btn.dataset.title;
        const url = btn.dataset.url;
        viewerTitle.textContent = title;
        viewer.src = url;
        openNew.disabled = false;
        openNew.onclick = () => window.open(url, '_blank');
      });
    });
  }
  setupSidebar();

  // Navegación entre Formularios / Visualizaciones
  btnForms.addEventListener('click', async () => {
    btnForms.classList.add('active');
    btnDash.classList.remove('active');
    await loadComponent('components/sidebar-formularios.html', app);
    setupSidebar();
  });

  btnDash.addEventListener('click', async () => {
    btnDash.classList.add('active');
    btnForms.classList.remove('active');
    await loadComponent('components/sidebar-visualizaciones.html', app);
    setupSidebar();
  });
})();
