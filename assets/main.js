// ===================== util: cargar componentes HTML =====================
async function loadComponent(containerId, file) {
  const el = document.getElementById(containerId);
  try {
    const res = await fetch(file, { cache: "no-cache" });
    if (!res.ok) throw new Error(file + " no encontrado");
    el.innerHTML = await res.text();
  } catch (err) {
    console.error("Error al cargar componente:", err);
    el.innerHTML = '<p style="color:red">Error al cargar ' + file + '</p>';
  }
}

// ===================== estado: página desde ?p= =====================
const params = new URLSearchParams(location.search);
const page = params.get("p") || "formularios"; // "formularios" | "visualizaciones"
const STORAGE_KEYS = {
  formularios: "conecta_last_form",
  visualizaciones: "conecta_last_viz",
};

// ===================== flujo principal =====================
(async () => {
  // 1) Cargar header y footer
  await loadComponent("header", "./components/header.html");
  await loadComponent("footer", "./components/footer.html");

  // El script inline del footer NO se ejecuta al inyectar.
  // Seteamos el año aquí para garantizarlo en GitHub Pages:
  const y = document.querySelector("#footer #y");
  if (y) y.textContent = new Date().getFullYear();

  // 2) Marcar botón activo del header y wire de navegación
  const btnForms = document.getElementById("btnForms");
  const btnDash  = document.getElementById("btnDash");
  if (btnForms && btnDash) {
    btnForms.classList.toggle("active", page === "formularios");
    btnDash.classList.toggle("active",  page === "visualizaciones");
    btnForms.onclick = () => (location.href = "?p=formularios");
    btnDash .onclick = () => (location.href = "?p=visualizaciones");
  }

  // 3) Cargar sidebar según la página
  if (page === "formularios") {
    await loadComponent("sidebar", "./components/sidebar-formularios.html");
  } else {
    await loadComponent("sidebar", "./components/sidebar-visualizaciones.html");
  }

  // 4) Cargar viewer (sin contenedor extra, evita "recuadro del recuadro")
  await loadComponent("viewerContainer", "./components/viewer.html");

  // 5) Lógica del visor (sin setTimeout; listeners por delegación)
  const iframe = document.getElementById("viewer");           // iframe verdadero
  const viewerTitle = document.getElementById("viewerTitle");
  const openNew = document.getElementById("openNew");
  const sidebar = document.getElementById("sidebar");

  function select(btn){
    // estilos activos
    document.querySelectorAll(".item-btn.active").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // datos
    const title = btn.dataset.title || "";
    const url   = btn.dataset.url || "";

    // aplicar en visor
    if (viewerTitle) viewerTitle.textContent = title;

    if (iframe) {
      iframe.src = url || "";

      // Ajuste solo si es un dashboard de Power BI
      const wrapper = iframe.parentElement;
      if (url.includes("app.powerbi.com")) {
        wrapper.style.overflowX = "auto";   // permite scroll lateral
        wrapper.style.overflowY = "hidden";
        iframe.style.width = "1140px";      // ancho real del embed Power BI
        iframe.style.minWidth = "1140px";
        iframe.style.height = "70vh";       // respeta tu alto base
      } else {
      // todo lo demás (Looker, PDFs, etc.) se comporta igual que siempre
        wrapper.style.overflowX = "visible";
        wrapper.style.overflowY = "visible";
        iframe.style.width = "100%";
        iframe.style.minWidth = "";
        iframe.style.height = "70vh";
      }
    }

    if (openNew) {
      openNew.disabled = !url;
      openNew.onclick = () => url && window.open(url, "_blank");
    }

    // persistencia (igual que versión 3-HTML)
    const key = STORAGE_KEYS[page];
    if (key) {
      localStorage.setItem(key, JSON.stringify({ title, url }));
    }
  }

  // Delegación: cualquier click en un botón del sidebar
  if (sidebar) {
    sidebar.addEventListener("click", (e) => {
      const btn = e.target.closest(".item-btn");
      if (!btn) return;
      select(btn);
    });
  }

  // 6) Restaurar última selección (igual que 3-HTML)
  const restoreKey = STORAGE_KEYS[page];
  const saved = restoreKey && localStorage.getItem(restoreKey);
  if (saved) {
    try {
      const { title } = JSON.parse(saved);
      const match = Array.from(document.querySelectorAll(".item-btn"))
        .find(b => b.dataset.title === title);
      if (match) select(match);
    } catch (e) { /* no-op */ }
  }
})();
