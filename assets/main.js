// Función genérica para cargar componentes HTML
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

// Detectar qué página mostrar (?p=)
const params = new URLSearchParams(window.location.search);
const page = params.get("p") || "formularios";

// Claves de persistencia (mismas que en tus 3 HTML)
const STORAGE_KEYS = {
  formularios: "intralink_last",
  visualizaciones: "conecta_last_viz",
};

(async () => {
  // 1) Cargar header y footer
  await loadComponent("header", "./components/header.html");
  await loadComponent("footer", "./components/footer.html");

  // El <script> embebido del footer no corre al inyectar, así que seteo el año aquí:
  const y = document.querySelector("#footer #y");
  if (y) y.textContent = new Date().getFullYear();

  // 2) Marcar botón activo del header según ?p=
  const btnForms = document.getElementById("btnForms");
  const btnDash = document.getElementById("btnDash");
  if (btnForms && btnDash) {
    btnForms.classList.toggle("active", page === "formularios");
    btnDash.classList.toggle("active", page === "visualizaciones");

    // Navegación (mismo comportamiento que 3-HTML)
    btnForms.addEventListener("click", () => (window.location.href = "?p=formularios"));
    btnDash.addEventListener("click", () => (window.location.href = "?p=visualizaciones"));
  }

  // 3) Cargar sidebar según la página y luego el visor
  if (page === "formularios") {
    await loadComponent("sidebar", "./components/sidebar-formularios.html");
  } else {
    await loadComponent("sidebar", "./components/sidebar-visualizaciones.html");
  }
  await loadComponent("viewer", "./components/viewer.html");

  // 4) Enganchar la lógica del visor (sin setTimeout)
  const iframe = document.getElementById("viewer");        // coincide con components/viewer.html
  const viewerTitle = document.getElementById("viewerTitle");
  const openNew = document.getElementById("openNew");

  function select(btn) {
    document.querySelectorAll(".item-btn.active").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const title = btn.dataset.title || "";
    const url = btn.dataset.url || "";

    if (viewerTitle) viewerTitle.textContent = title;
    if (iframe) iframe.src = url;
    if (openNew) {
      openNew.disabled = !url;
      openNew.onclick = () => window.open(url, "_blank");
    }

    // Persistencia igual que en la versión 3-HTML
    const key = STORAGE_KEYS[page];
    if (key) {
      localStorage.setItem(key, JSON.stringify({ title, url }));
    }
  }

  // Adjuntar listeners a los ítems del sidebar
  document.querySelectorAll(".item-btn").forEach((btn) => {
    btn.addEventListener("click", () => select(btn));
  });

  // Restaurar última selección (igual que en 3-HTML)
  const restoreKey = STORAGE_KEYS[page];
  const saved = restoreKey && localStorage.getItem(restoreKey);
  if (saved) {
    try {
      const { title } = JSON.parse(saved);
      const match = Array.from(document.querySelectorAll(".item-btn")).find(
        (b) => b.dataset.title === title
      );
      if (match) select(match);
    } catch (e) {
      // si hay error al parsear, no hacemos nada
    }
  }
})();
