/**
 * Base de datos del Cancionero de Aula.
 * Contiene las canciones clasificadas por categoría y sus respectivos enlaces e integraciones.
 * 
 * Categorías:
 * - infantil: Cancionero general/infantil
 * - folclore: Cancionero folclórico nacional
 * - rock: Cancionero de rock nacional
 * - patria: Canciones patrias
 */

export const CATEGORIAS = {
  infantil: 'Infantil / General',
  folclore: 'Folclore Nacional',
  rock: 'Rock Nacional',
  patria: 'Canciones Patrias'
};

export const canciones = [
  // --- INFANTIL / GENERAL ---
  {
    id: 'inf-001',
    titulo: 'Barrilete de colores',
    artista: 'Magdalena Fleitas',
    categoria: 'infantil',
    spotifyId: '1LR169lReEACr8JAN4m6EJ',
    resena: 'Una hermosa canción ideal para trabajar la espacialidad, los colores y el movimiento en los primeros grados de primaria. Invita a soñar y a expresarse corporalmente.',
    pdfLetra: 'letras/barrilete_de_colores_letra.pdf',
    pdfActividad: 'actividades/barrilete_de_colores_actividad.pdf'
  },
  {
    id: 'inf-002',
    titulo: 'El monstruo de la laguna',
    artista: 'Canticuénticos',
    categoria: 'infantil',
    spotifyId: '3wyR5QGncKmlkawPjD4iUv',
    resena: 'Un clásico de la cumbia infantil argentina. Excelente para trabajar el reconocimiento del cuerpo, el ritmo sincopado de la cumbia y el movimiento corporal lúdico.',
    pdfLetra: 'letras/el_monstruo_de_la_laguna_letra.pdf',
    pdfActividad: 'actividades/el_monstruo_de_la_laguna_actividad.pdf'
  },
  {
    id: 'inf-003',
    titulo: 'Los opuestos',
    artista: 'Pim Pau',
    categoria: 'infantil',
    spotifyId: '6iiAUoWRw5T4TNeLkb7jQG',
    resena: 'Una canción/juego dinámica que trabaja los conceptos de opuestos (arriba/abajo, grande/chico) a través del cuerpo, la voz y el contraste musical rápido.',
    pdfLetra: 'letras/los_opuestos_letra.pdf',
    pdfActividad: 'actividades/los_opuestos_actividad.pdf'
  },

  // --- FOLCLORE NACIONAL ---
  {
    id: 'fol-001',
    titulo: 'La chacarera de los gatos',
    artista: 'María Elena Walsh',
    categoria: 'folclore',
    spotifyId: '6kIy1NNsfp9La76wCixmit',
    resena: 'Una chacarera infantil sumamente divertida que introduce a los chicos en la rítmica del folclore (6/8 y 3/4) de la mano de una de las más grandes cantautoras.',
    pdfLetra: 'letras/chacarera_de_los_gatos_letra.pdf',
    pdfActividad: 'actividades/chacarera_de_los_gatos_actividad.pdf',
    isPlaceholder: true // Indica que los recursos PDF están listos para ser agregados por el usuario
  },
  {
    id: 'fol-002',
    titulo: 'Luna Tucumana',
    artista: 'Atahualpa Yupanqui',
    categoria: 'folclore',
    spotifyId: '0GrFnuUKkbeznqFhVI7tnA',
    resena: 'Una zamba fundamental para el aula de música. Permite explorar el folklore más profundo, la poesía paisajística, el canto comunitario y el pulso de la zamba.',
    pdfLetra: 'letras/luna_tucumana_letra.pdf',
    pdfActividad: 'actividades/luna_tucumana_actividad.pdf',
    isPlaceholder: true
  },

  // --- ROCK NACIONAL ---
  {
    id: 'rock-001',
    titulo: 'Seguir viviendo sin tu amor',
    artista: 'Luis Alberto Spinetta',
    categoria: 'rock',
    spotifyId: '2qBirMakpTdz9ymxrZEyzg',
    resena: 'Una de las melodías más perfectas y queridas del rock nacional. Ideal para trabajar el canto coral de baladas, la expresividad, los coros y el análisis armónico.',
    pdfLetra: 'letras/seguir_viviendo_sin_tu_amor_letra.pdf',
    pdfActividad: 'actividades/seguir_viviendo_sin_tu_amor_actividad.pdf',
    isPlaceholder: true
  },
  {
    id: 'rock-002',
    titulo: 'De música ligera',
    artista: 'Soda Stereo',
    categoria: 'rock',
    spotifyId: '4it4NYn9wNqGV54joA6oN0',
    resena: 'El himno por excelencia del rock latino. Excelente para trabajar la rítmica de batería/guitarra, la estructura de una canción clásica de rock (Intro-Estrofa-Estribillo) y ensamble instrumental.',
    pdfLetra: 'letras/de_musica_ligera_letra.pdf',
    pdfActividad: 'actividades/de_musica_ligera_actividad.pdf',
    isPlaceholder: true
  },

  // --- CANCIONES PATRIAS ---
  {
    id: 'pat-001',
    titulo: 'Himno Nacional Argentino',
    artista: 'Blas Parera / Vicente López y Planes',
    categoria: 'patria',
    spotifyId: '1Xm9G0H8dtDyRvcqlDvugI', // Versión instrumental/orquestal típica
    resena: 'Nuestra canción patria nacional por excelencia. Versión instrumental ideal para actos escolares, análisis lírico del poema original e introducción a los símbolos patrios.',
    pdfLetra: 'letras/himno_nacional_letra.pdf',
    pdfActividad: 'actividades/himno_nacional_actividad.pdf',
    audioMp3: 'mp3/himno_nacional_argentino.mp3' // Para descarga directa
  },
  {
    id: 'pat-002',
    titulo: 'Marcha de San Lorenzo',
    artista: 'Cayetano Silva / Carlos J. Benielli',
    categoria: 'patria',
    spotifyId: '6nDbBe96eWkowt5AF7BS2G',
    resena: 'Una marcha histórica y heroica que narra el combate de San Lorenzo. Excelente para explorar la métrica de marcha en 2/4, el pulso marcial y la historia de San Martín.',
    pdfLetra: 'letras/marcha_san_lorenzo_letra.pdf',
    pdfActividad: 'actividades/marcha_san_lorenzo_actividad.pdf',
    audioMp3: 'mp3/marcha_de_san_lorenzo.mp3' // Placeholder para más adelante
  },
  {
    id: 'pat-003',
    titulo: 'Mi Bandera',
    artista: 'Juan Imbroisi / Juan Chassaing',
    categoria: 'patria',
    spotifyId: '3kXNq3RgOvf6cnxeJlQAFe',
    resena: 'Canción dedicada a la bandera nacional. Una melodía alegre y solemne para cantar con entusiasmo en los actos del 20 de Junio o en la jura a la bandera.',
    pdfLetra: 'letras/mi_bandera_letra.pdf',
    pdfActividad: 'actividades/mi_bandera_actividad.pdf',
    audioMp3: 'mp3/mi_bandera.mp3' // Placeholder para más adelante
  }
];
