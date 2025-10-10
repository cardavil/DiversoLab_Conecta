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

// Cargar estructura básica
(async () => {
  await loadComponent("header", "./components/header.html");
  await loadComponent("footer", "./components/footer.html");

  if (page === "formularios") {
    await loadComponent("sidebar", "./components/sidebar-formularios.html");
  } else {
    await loadComponent("sidebar", "./components/sidebar-visualizaciones.html");
  }

  await loadComponent("viewer", "./components/viewer.html");

  // Configurar navegación (botones del header)
  const btnForms = document.getElementById("btnForms");
  const btnDash = document.getElementById("btnDash");

  if (btnForms && btnDash) {
    btnForms.addEventListener("click", () => {
      window.location.href = "?p=formularios";
    });
    btnDash.addEventListener("click", () => {
      window.location.href = "?p=visualizaciones";
    });
  }

  // Activar los botones del sidebar para abrir en el visor
  setTimeout(() => {
    const viewer = document.getElementById("iframeViewer");
    const viewerTitle = document.getElementById("viewerTitle");
    const openNew = document.getElementById("openNew");

    document.querySelectorAll(".item-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".item-btn.active").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const url = btn.dataset.url;
        const title = btn.dataset.title;
        viewer.src = url;
        viewerTitle.textContent = title;
        openNew.disabled = false;
        openNew.onclick = () => window.open(url, "_blank");
      });
    });
  }, 300);
})();
