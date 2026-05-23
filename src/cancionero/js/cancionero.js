import { canciones, CATEGORIAS } from '../data/canciones.js';

const searchInputEl = document.getElementById('search-input');
const clearSearchBtnEl = document.getElementById('clear-search-btn');
const categoryTabsEl = document.querySelector('.category-filters');
const gridEl = document.getElementById('canciones-grid');
const emptyEl = document.getElementById('canciones-empty');
const countEl = document.getElementById('canciones-count');

let activeCategory = 'all';
let searchQuery = '';

// Iconos SVG para usar en los botones de descarga
const PDF_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
</svg>`;

const AUDIO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
</svg>`;

function createSongCard(song) {
  const article = document.createElement('article');
  article.className = `cancion-card cat-${song.categoria}`;
  article.dataset.id = song.id;

  // Renderizar badges de la canción
  const categoryLabel = CATEGORIAS[song.categoria] || song.categoria;
  let badgesHTML = `<span class="badge badge-cat-${song.categoria}">${categoryLabel}</span>`;
  if (song.isPlaceholder) {
    badgesHTML += `<span class="badge badge-status">Próximamente PDFs</span>`;
  }

  // Generar botones en el footer
  let footerButtonsHTML = '';
  
  // Si tiene MP3 (Canciones patrias)
  if (song.audioMp3) {
    footerButtonsHTML += `
      <a href="../../public/cancionero/${song.audioMp3}" class="download-action-btn btn-mp3" download title="Descargar audio MP3">
        ${AUDIO_ICON}
        <span>Descargar MP3</span>
      </a>
    `;
  }

  // Enlace para Letra PDF
  // Para las canciones sembradas placeholders, redirecciona a un aviso agradable o descarga la plantilla común
  const letraPath = song.isPlaceholder 
    ? '../../public/cancionero/letras/barrilete_de_colores_letra.pdf' 
    : `../../public/cancionero/${song.pdfLetra}`;
    
  const actividadPath = song.isPlaceholder
    ? '../../public/cancionero/actividades/barrilete_de_colores_actividad.pdf'
    : `../../public/cancionero/${song.pdfActividad}`;

  footerButtonsHTML += `
    <a href="${letraPath}" class="download-action-btn" download title="Descargar letra en PDF">
      ${PDF_ICON}
      <span>Letra</span>
    </a>
    <a href="${actividadPath}" class="download-action-btn" download title="Descargar propuesta didáctica en PDF">
      ${PDF_ICON}
      <span>Fotocopia</span>
    </a>
  `;

  article.innerHTML = `
    <div class="cancion-card-header">
      <div class="cancion-title-row">
        <h3 class="cancion-titulo">${song.titulo}</h3>
      </div>
      <p class="cancion-artista">por ${song.artista}</p>
      <div class="cancion-badges">${badgesHTML}</div>
    </div>
    
    <div class="cancion-card-body">
      <p class="cancion-resena">${song.resena}</p>
      
      <!-- Reproductor Spotify Integrado -->
      <div class="spotify-embed-container" aria-label="Reproductor de Spotify para ${song.titulo}">
        <iframe 
          src="https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator&theme=0" 
          width="100%" 
          height="80" 
          frameBorder="0" 
          allowfullscreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy">
        </iframe>
      </div>
    </div>
    
    <div class="cancion-card-footer">
      ${footerButtonsHTML}
    </div>
  `;

  return article;
}

function matchesFilters(song) {
  // Filtro por Categoría
  const categoryOk = activeCategory === 'all' || song.categoria === activeCategory;

  // Filtro por Búsqueda (Título o Artista)
  const term = searchQuery.toLowerCase().trim();
  const searchOk = term === '' || 
    song.titulo.toLowerCase().includes(term) || 
    song.artista.toLowerCase().includes(term);

  return categoryOk && searchOk;
}

function renderCanciones() {
  const filtered = canciones.filter(matchesFilters);

  // Limpiar grilla
  gridEl.replaceChildren();

  // Renderizar tarjetas
  filtered.forEach((song) => {
    gridEl.appendChild(createSongCard(song));
  });

  // Actualizar metadatos de conteo
  const total = canciones.length;
  const shown = filtered.length;
  
  if (shown === 0) {
    countEl.textContent = '0 canciones encontradas';
    emptyEl.hidden = false;
    gridEl.hidden = true;
  } else {
    countEl.textContent = shown === total 
      ? `Mostrando las ${total} canciones` 
      : `Mostrando ${shown} de ${total} canciones`;
    emptyEl.hidden = true;
    gridEl.hidden = false;
  }
}

function handleSearch(e) {
  searchQuery = e.target.value;
  clearSearchBtnEl.hidden = searchQuery === '';
  renderCanciones();
}

function clearSearch() {
  searchInputEl.value = '';
  searchQuery = '';
  clearSearchBtnEl.hidden = true;
  searchInputEl.focus();
  renderCanciones();
}

function handleCategoryChange(e) {
  const tab = e.target.closest('.filter-tab');
  if (!tab) return;

  // Desactivar pestaña previa
  document.querySelectorAll('.filter-tab').forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  // Activar nueva pestaña
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  activeCategory = tab.dataset.category;

  renderCanciones();
}

function bindEvents() {
  // Escucha del buscador
  searchInputEl.addEventListener('input', handleSearch);
  clearSearchBtnEl.addEventListener('click', clearSearch);

  // Escucha de las pestañas
  categoryTabsEl.addEventListener('click', handleCategoryChange);
}

// Inicialización de la Sección
bindEvents();
renderCanciones();
console.log('Cancionero de Aula inicializado correctamente');
