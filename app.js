
/* Lógica principal de NewsHub.
   Aplicación estática: los datos se guardan en localStorage, sin backend.
   Los HTML, app.js, styles.css y las imágenes están en la raíz del repositorio. */

"use strict";

const NEWS_STORAGE_KEY = "newshub_news";
const FAVORITES_STORAGE_KEY = "newshub_favorites";

const DEFAULT_NEWS = [
  {
    id: 1,
    title: "Innovación educativa y nuevas herramientas digitales",
    category: "Educación",
    date: "2026-09-01",
    description: "Nuevas herramientas digitales apoyan los procesos de aprendizaje.",
    image: "educacion.jpg",
    content: "La transformación digital continúa incorporando recursos que facilitan el acceso a contenidos educativos y nuevas experiencias de aprendizaje."
  },
  {
    id: 2,
    title: "Tendencias tecnológicas para el segundo semestre",
    category: "Tecnología",
    date: "2026-09-05",
    description: "Conoce algunas tendencias que marcarán el desarrollo tecnológico.",
    image: "tecnologia.jpg",
    content: "La inteligencia artificial, la automatización y las soluciones basadas en datos continúan generando nuevas oportunidades para organizaciones y usuarios."
  },
  {
    id: 3,
    title: "Destinos turísticos para descubrir",
    category: "Turismo",
    date: "2026-09-08",
    description: "Ideas para planear experiencias turísticas y culturales.",
    image: "turismo.jpg",
    content: "Los destinos con experiencias culturales, naturales y gastronómicas ofrecen alternativas para diferentes perfiles de viajeros."
  },
  {
    id: 4,
    title: "Nuevas oportunidades para el comercio digital",
    category: "Comercio",
    date: "2026-09-10",
    description: "El comercio electrónico sigue ampliando sus canales de atención.",
    image: "comercio.jpg",
    content: "Las herramientas digitales permiten a pequeños y medianos negocios ampliar su presencia y establecer nuevos canales de comunicación con sus clientes."
  }
];

/* Los archivos de imagen están en la raíz del repositorio. */
function getImageByCategory(category) {
  const images = {
    "Educación": "educacion.jpg",
    "Tecnología": "tecnologia.jpg",
    "Turismo": "turismo.jpg",
    "Comercio": "comercio.jpg"
  };

  return images[category] || "educacion.jpg";
}

function normalizeImagePath(image, category) {
  const allowedImages = [
    "educacion.jpg",
    "tecnologia.jpg",
    "turismo.jpg",
    "comercio.jpg"
  ];

  if (typeof image === "string" && image.trim()) {
    let filename = image.trim().split("/").pop();

    try {
      filename = decodeURIComponent(filename);
    } catch (error) {
      // Se conserva el nombre original si no puede decodificarse.
    }

    if (allowedImages.includes(filename)) {
      return filename;
    }
  }

  return getImageByCategory(category);
}

function getNews() {
  const stored = localStorage.getItem(NEWS_STORAGE_KEY);

  if (!stored) {
    const initialNews = DEFAULT_NEWS.map(item => ({
      ...item,
      image: normalizeImagePath(item.image, item.category)
    }));

    localStorage.setItem(
      NEWS_STORAGE_KEY,
      JSON.stringify(initialNews)
    );

    return initialNews;
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      throw new Error("El registro de noticias no es una lista.");
    }

    const news = parsed.map((item, index) => ({
      ...item,
      id: Number(item.id) || index + 1,
      title: String(item.title || "Noticia sin título"),
      category: String(item.category || "Educación"),
      date: String(item.date || new Date().toISOString().slice(0, 10)),
      description: String(item.description || ""),
      content: String(item.content || ""),
      image: normalizeImagePath(item.image, item.category)
    }));

    localStorage.setItem(
      NEWS_STORAGE_KEY,
      JSON.stringify(news)
    );

    return news;
  } catch (error) {
    console.error(
      "No se pudieron leer las noticias guardadas. Se restaurarán los datos iniciales.",
      error
    );

    const initialNews = DEFAULT_NEWS.map(item => ({
      ...item,
      image: normalizeImagePath(item.image, item.category)
    }));

    localStorage.setItem(
      NEWS_STORAGE_KEY,
      JSON.stringify(initialNews)
    );

    return initialNews;
  }
}

function saveNews(news) {
  localStorage.setItem(
    NEWS_STORAGE_KEY,
    JSON.stringify(news)
  );
}

function getFavorites() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]"
    );

    return Array.isArray(stored) ? stored.map(Number) : [];
  } catch (error) {
    console.error("No se pudieron leer los favoritos.", error);
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(favorites)
  );
}

function newsCard(news) {
  const image = normalizeImagePath(news.image, news.category);
  const fallbackImage = getImageByCategory(news.category);

  return `
    <div class="col-md-6 col-lg-4">
      <article class="news-card">
        <img
          class="news-image"
          src="${image}"
          alt="Imagen de la noticia: ${escapeHtml(news.title)}"
          loading="lazy"
          onerror="this.onerror=null; this.src='${fallbackImage}';"
        >

        <div class="content">
          <span class="badge text-bg-secondary">
            ${escapeHtml(news.category)}
          </span>

          <h3 class="h5 mt-2">
            ${escapeHtml(news.title)}
          </h3>

          <p class="text-muted">
            ${escapeHtml(news.description)}
          </p>

          <a
            class="btn btn-primary btn-sm"
            href="detalle.html?id=${encodeURIComponent(news.id)}"
          >
            Ver más
          </a>
        </div>
      </article>
    </div>`;
}

function renderFeaturedNews() {
  const container = document.getElementById("featuredNews");

  if (!container) return;

  container.innerHTML = getNews()
    .slice(0, 3)
    .map(newsCard)
    .join("");
}

function renderNews(newsList = getNews()) {
  const container = document.getElementById("newsGrid");

  if (!container) return;

  container.innerHTML = newsList.length
    ? newsList.map(newsCard).join("")
    : '<div class="col-12"><div class="alert alert-info">No se encontraron noticias.</div></div>';
}

function setupNewsCatalog() {
  const container = document.getElementById("newsGrid");

  if (!container) return;

  renderNews();

  const search = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");

  function applyFilters() {
    const query = search
      ? search.value.toLowerCase().trim()
      : "";

    const selectedCategory = category
      ? category.value
      : "";

    const filtered = getNews().filter(news =>
      (!query ||
        `${news.title} ${news.description}`
          .toLowerCase()
          .includes(query)) &&
      (!selectedCategory ||
        news.category === selectedCategory)
    );

    renderNews(filtered);
  }

  if (search) {
    search.addEventListener("input", applyFilters);
  }

  if (category) {
    category.addEventListener("change", applyFilters);
  }
}

function renderNewsDetail() {
  const container = document.getElementById("newsDetail");

  if (!container) return;

  const id = Number(
    new URLSearchParams(window.location.search).get("id") || 1
  );

  const news = getNews().find(item => item.id === id);

  if (!news) {
    container.innerHTML =
      '<div class="alert alert-warning">La noticia no existe.</div>';
    return;
  }

  const isFavorite = getFavorites().includes(news.id);
  const image = normalizeImagePath(news.image, news.category);
  const fallbackImage = getImageByCategory(news.category);

  container.innerHTML = `
    <img
      class="detail-image"
      src="${image}"
      alt="Imagen representativa de: ${escapeHtml(news.title)}"
      onerror="this.onerror=null; this.src='${fallbackImage}';"
    >

    <h1 class="mt-4">
      ${escapeHtml(news.title)}
    </h1>

    <p class="text-muted">
      Publicado: ${formatDate(news.date)}
      · Categoría: ${escapeHtml(news.category)}
    </p>

    <p class="lead">
      ${escapeHtml(news.description)}
    </p>

    <div class="mb-4">
      <p>${escapeHtml(news.content)}</p>
    </div>

    <div class="d-flex gap-2">
      <button
        class="btn btn-primary ${isFavorite ? "favorite-active" : ""}"
        id="favoriteButton"
      >
        ${isFavorite ? "★ En favoritos" : "☆ Agregar a favoritos"}
      </button>

      <a class="btn btn-outline-primary" href="contacto.html">
        Contacto
      </a>
    </div>
  `;

  const favoriteButton = document.getElementById("favoriteButton");

  if (favoriteButton) {
    favoriteButton.addEventListener("click", () => {
      const favorites = getFavorites();

      const updated = favorites.includes(news.id)
        ? favorites.filter(item => item !== news.id)
        : [...favorites, news.id];

      saveFavorites(updated);
      renderNewsDetail();
    });
  }
}

function renderFavorites() {
  const container = document.getElementById("favoritesGrid");

  if (!container) return;

  const ids = getFavorites();

  const favorites = getNews().filter(news =>
    ids.includes(Number(news.id))
  );

  container.innerHTML = favorites.length
    ? favorites.map(newsCard).join("")
    : '<div class="col-12"><div class="alert alert-info">Aún no tienes noticias favoritas.</div></div>';
}

function setupContactForm() {
  const form = document.getElementById("contactForm");

  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const message = document.getElementById("formMessage");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");

      if (message) {
        message.innerHTML =
          '<div class="alert alert-danger">Completa los campos obligatorios y verifica el correo electrónico.</div>';
      }

      return;
    }

    if (message) {
      message.innerHTML =
        '<div class="alert alert-success">Tu mensaje fue enviado con éxito.</div>';
    }

    form.reset();
    form.classList.remove("was-validated");
  });
}

function setupAdmin() {
  const form = document.getElementById("newsForm");
  const list = document.getElementById("adminNewsList");

  if (!form || !list) return;

  function renderAdminList() {
    list.innerHTML = getNews().map(news => `
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <span class="badge text-bg-secondary">
              ${escapeHtml(news.category)}
            </span>

            <h2 class="h5 mt-2">
              ${escapeHtml(news.title)}
            </h2>

            <p>${escapeHtml(news.description)}</p>

            <button
              class="btn btn-outline-danger btn-sm"
              data-delete="${news.id}"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    `).join("");

    list.querySelectorAll("[data-delete]").forEach(button => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.delete);

        saveNews(
          getNews().filter(news => news.id !== id)
        );

        renderAdminList();
      });
    });
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const news = getNews();

    const categoryField = document.getElementById("newsCategory");
    const titleField = document.getElementById("newsTitle");
    const descriptionField = document.getElementById("newsDescription");
    const contentField = document.getElementById("newsContent");

    if (
      !categoryField ||
      !titleField ||
      !descriptionField ||
      !contentField
    ) {
      return;
    }

    const nextId = news.length
      ? Math.max(...news.map(item => Number(item.id) || 0)) + 1
      : 1;

    news.push({
      id: nextId,
      title: titleField.value.trim(),
      category: categoryField.value,
      description: descriptionField.value.trim(),
      image: getImageByCategory(categoryField.value),
      content: contentField.value.trim(),
      date: new Date().toISOString().slice(0, 10)
    });

    saveNews(news);

    form.reset();
    form.classList.remove("was-validated");

    renderAdminList();
  });

  renderAdminList();
}

function formatDate(date) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date || "");
  }

  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(parsedDate);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* Inicializa las funciones correspondientes a la página actual. */
function initializeNewsHub() {
  renderFeaturedNews();
  setupNewsCatalog();
  renderNewsDetail();
  renderFavorites();
  setupContactForm();
  setupAdmin();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNewsHub);
} else {
  initializeNewsHub();
}
