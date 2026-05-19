import { actividades, NIVELES, EJES } from '../data/actividades.js';

const nivelFiltersEl = document.getElementById('nivel-filters');
const ejeFiltersEl = document.getElementById('eje-filters');
const gridEl = document.getElementById('actividades-grid');
const emptyEl = document.getElementById('actividades-empty');
const countEl = document.getElementById('actividades-count');

const selectedNiveles = new Set();
const selectedEjes = new Set();

function createFilterButton(label, group, value) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'filter-btn';
  btn.textContent = label;
  btn.dataset.group = group;
  btn.dataset.value = value;
  return btn;
}

function renderFilters() {
  nivelFiltersEl.appendChild(createFilterButton('Todos', 'nivel', 'all'));
  NIVELES.forEach((nivel) => {
    nivelFiltersEl.appendChild(createFilterButton(`${nivel} grado`, 'nivel', nivel));
  });

  ejeFiltersEl.appendChild(createFilterButton('Todos', 'eje', 'all'));
  EJES.forEach((eje) => {
    ejeFiltersEl.appendChild(createFilterButton(eje, 'eje', eje));
  });
}

function syncFilterButtons() {
  document.querySelectorAll('.docentes-filters .filter-btn').forEach((btn) => {
    const { group, value } = btn.dataset;
    if (value === 'all') {
      const set = group === 'nivel' ? selectedNiveles : selectedEjes;
      btn.classList.toggle('active', set.size === 0);
      return;
    }
    const set = group === 'nivel' ? selectedNiveles : selectedEjes;
    btn.classList.toggle('active', set.has(value));
  });
}

function toggleFilter(group, value) {
  const set = group === 'nivel' ? selectedNiveles : selectedEjes;

  if (value === 'all') {
    set.clear();
  } else if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }

  syncFilterButtons();
  renderActividades();
}

function matchesFilters(actividad) {
  const nivelOk =
    selectedNiveles.size === 0 || selectedNiveles.has(actividad.nivel);
  const ejeOk = selectedEjes.size === 0 || selectedEjes.has(actividad.eje);
  return nivelOk && ejeOk;
}

function ejeAccentClass(eje) {
  const map = {
    Melodía: 'accent-purple',
    Ritmo: 'accent-blue',
    Canto: 'accent-orange',
    Audioperceptiva: 'accent-green',
    'Lenguaje Musical': 'accent-teal',
    'Historia de la Música': 'accent-rose',
  };
  return map[eje] || 'accent-purple';
}

function createActividadCard(actividad) {
  const article = document.createElement('article');
  article.className = `actividad-card ${ejeAccentClass(actividad.eje)}`;
  article.dataset.id = actividad.id;

  article.innerHTML = `
    <header class="actividad-card-header">
      <h3 class="actividad-titulo">${actividad.titulo}</h3>
      <div class="actividad-tags">
        <span class="tag tag-level">${actividad.nivel} grado</span>
        <span class="tag tag-category">${actividad.eje}</span>
      </div>
    </header>
    <div class="actividad-card-body">
      <p class="actividad-resena">${actividad.resena}</p>
      <a href="${actividad.pdf}" class="fotocopia-btn" download title="Descargar fotocopia en PDF">
        <span class="fotocopia-stack" aria-hidden="true">
          <span class="fotocopia-sheet fotocopia-sheet-back"></span>
          <span class="fotocopia-sheet fotocopia-sheet-front">📄</span>
        </span>
        <span class="fotocopia-label">Fotocopia</span>
        <span class="fotocopia-hint">PDF</span>
      </a>
    </div>
  `;

  return article;
}

function renderActividades() {
  const filtered = actividades.filter(matchesFilters);

  gridEl.replaceChildren();
  filtered.forEach((act) => gridEl.appendChild(createActividadCard(act)));

  const total = actividades.length;
  const shown = filtered.length;
  countEl.textContent =
    shown === total
      ? `${shown} actividades`
      : `${shown} de ${total} actividades`;

  emptyEl.hidden = shown > 0;
  gridEl.hidden = shown === 0;
}

function bindFilterEvents() {
  document.querySelector('.docentes-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    toggleFilter(btn.dataset.group, btn.dataset.value);
  });
}

renderFilters();
syncFilterButtons();
bindFilterEvents();
renderActividades();
