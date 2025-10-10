// ===== Función genérica para cargar componentes =====
async function loadComponent(id, file) {
  const container = document.getElementById(id);
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`${file} no encontrado`);
    const html = await res.text();
    container.innerHTML = html;
  } catch (err) {
    console.error("Error al cargar componente:", err);
    container.innerHTML = `<p style="color:red">Error al cargar ${file}</p>`;
  }
}

// ===== Función principal =====
(async () => {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("p") || "formularios";

  // Cargar estructura base
  await loadComponent("header", "./components/header.html");
  await loadComponent("footer", "./components/footer.html");

  if (page === "formularios") {
    await loadComponent("sidebar", "./components/sidebar-formularios.html");
  } else {
    await loadComponent("sidebar", "./components/sidebar-visualizaciones.html");
  }

  await loadComponent("viewerContainer", "./components/viewer.html");

  // === Configurar botones de navegación (header) ===
  const btnForms = document.getElementById("btnForms");
  const btnDash  = document.getElementById("btnDash");
  if (btnForms && btnDash) {
    btnForms.addEventListener("click", () => window.location.href = "?p=formularios");
    btnDash.addEventListener("click",  () => window.location.href = "?p=visualizaciones");
    if (page === "formularios") {
      btnForms.classList.add("active");
      btnDash.classList.remove("active");
    } else {
      btnDash.classList.add("active");
      btnForms.classList.remove("active");
    }
  }

  // === Activar lógica del visor ===
  const viewer      = document.getElementById("viewer");
  const viewerTitle = document.getElementById("viewerTitle");
  const openNew     = document.getElementById("openNew");

  function select(btn) {
    document.querySelectorAll(".item-btn.active").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const title = btn.dataset.title;
    const url   = btn.dataset.url;
    viewerTitle.textContent = title;
    viewer.src = url || "";
    openNew.disabled = !url;
    openNew.onclick = () => window.open(url, "_blank");

    // Persistencia local
    const key = page === "formularios" ? "conecta_last_form" : "conecta_last_viz";
    localStorage.setItem(key, JSON.stringify({ title, url }));
  }

  // Delegación de eventos (más confiable que setTimeout)
  const sidebar = document.getElementById("sidebar");
  sidebar.addEventListener("click", e => {
    const btn = e.target.closest(".item-btn");
    if (btn) select(btn);
  });

  // Restaurar última selección
  const key = page === "formularios" ? "conecta_last_form" : "conecta_last_viz";
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const { title } = JSON.parse(saved);
      const match = Array.from(document.querySelectorAll(".item-btn"))
        .find(b => b.dataset.title === title);
      if (match) select(match);
    } catch {}
  }
})();
