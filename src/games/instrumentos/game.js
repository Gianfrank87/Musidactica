// Banco de 20 instrumentos (con los cambios solicitados)
const INSTRUMENTS = [
    { id: 'piano', name: 'Piano', emoji: '🎹' },
    { id: 'guitarra', name: 'Guitarra Acústica', emoji: '🎸' },
    { id: 'bateria', name: 'Batería', emoji: '🥁' },
    { id: 'bajo', name: 'Bajo Eléctrico', emoji: '🎸' },
    { id: 'violin', name: 'Violín', emoji: '🎻' },
    { id: 'flauta', name: 'Flauta Traversa', emoji: '🥖' },
    { id: 'saxofon', name: 'Saxofón', emoji: '🎷' },
    { id: 'trompeta', name: 'Trompeta', emoji: '🎺' },
    { id: 'trombon', name: 'Trombón', emoji: '📯' },
    { id: 'clarinete', name: 'Clarinete', emoji: '🥢' },
    { id: 'xilofono', name: 'Xilófono', emoji: '🎹' },
    { id: 'triangulo', name: 'Triángulo', emoji: '🔺' },
    { id: 'pandereta', name: 'Pandereta', emoji: '🪘' },
    { id: 'maracas', name: 'Maracas', emoji: '🪇' },
    { id: 'arpa', name: 'Arpa', emoji: '🪕' },
    { id: 'armonica', name: 'Armónica', emoji: '🪈' }, // Reemplaza Violonchelo
    { id: 'charango', name: 'Charango', emoji: '🪕' }, // Reemplaza Contrabajo
    { id: 'acordeon', name: 'Acordeón', emoji: '🪗' },
    { id: 'bombo', name: 'Bombo Legüero', emoji: '🥁' }, // Reemplaza Órgano
    { id: 'ukelele', name: 'Ukelele', emoji: '🎸' }
];

// Estado del juego
let currentRound = 1;
let score = 0;
const TOTAL_ROUNDS = 10;
let roundInstruments = []; // Los 10 instrumentos que se jugarán en esta partida
let currentTarget = null; // El instrumento correcto de la ronda actual
let isWaiting = false; // Bloquea clics durante la animación de transición

// Elementos del DOM
const uiRound = document.getElementById('currentRound');
const uiScore = document.getElementById('currentScore');
const mysteryBox = document.getElementById('mysteryBox');
const mysteryContent = document.getElementById('mysteryContent');
const btnPlay = document.getElementById('btnPlay');
const audioToast = document.getElementById('audioToast');
const optionsGrid = document.getElementById('optionsGrid');
const modal = document.getElementById('endGameModal');
const finalScore = document.getElementById('finalScore');
const finalMessage = document.getElementById('finalMessage');
const btnRestart = document.getElementById('btnRestart');
const muteBtn = document.getElementById('mute-btn');

if (muteBtn && window.AudioFX) {
    muteBtn.addEventListener('click', () => {
        const isMuted = window.AudioFX.toggleMute();
        muteBtn.classList.toggle('muted', isMuted);
    });
}

// Funciones de Utilidad
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Lógica Principal
function initGame() {
    currentRound = 1;
    score = 0;
    updateStats();
    modal.classList.add('hidden');
    
    // Elegimos 10 instrumentos aleatorios para la partida
    const shuffledAll = shuffleArray(INSTRUMENTS);
    roundInstruments = shuffledAll.slice(0, TOTAL_ROUNDS);
    
    startRound();
}

function startRound() {
    isWaiting = false;
    currentTarget = roundInstruments[currentRound - 1];
    
    // Resetear UI de la ronda
    updateStats();
    mysteryBox.classList.remove('revealed');
    mysteryContent.textContent = '❓';
    
    // Conseguir 3 distractores aleatorios
    let distractors = INSTRUMENTS.filter(inst => inst.id !== currentTarget.id);
    distractors = shuffleArray(distractors).slice(0, 3);
    
    // Unir correcta + distractores y mezclar
    const currentOptions = shuffleArray([currentTarget, ...distractors]);
    
    // Renderizar botones
    optionsGrid.innerHTML = '';
    currentOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option.name;
        btn.dataset.id = option.id;
        btn.onclick = () => handleAnswer(option.id, btn);
        optionsGrid.appendChild(btn);
    });
}

function handleAnswer(selectedId, btnElement) {
    if (isWaiting) return;
    isWaiting = true; // Previene doble clics

    const allButtons = document.querySelectorAll('.option-btn');
    // Deshabilitar todos los botones
    allButtons.forEach(btn => btn.disabled = true);

    const isCorrect = selectedId === currentTarget.id;

    if (isCorrect) {
        // Acierto
        btnElement.classList.add('correct');
        score++;
        updateStats();
        if (window.AudioFX) window.AudioFX.playCorrect();
    } else {
        // Fallo
        btnElement.classList.add('wrong');
        // Resaltar la correcta
        const correctBtn = Array.from(allButtons).find(btn => btn.dataset.id === currentTarget.id);
        if (correctBtn) correctBtn.classList.add('correct');
        
        // Revelar imagen real (emoji por ahora)
        mysteryBox.classList.add('revealed');
        mysteryContent.textContent = currentTarget.emoji;
        if (window.AudioFX) window.AudioFX.playWrong();
    }

    // Esperar 2 segundos y pasar a la siguiente ronda
    setTimeout(() => {
        if (currentRound < TOTAL_ROUNDS) {
            currentRound++;
            startRound();
        } else {
            endGame();
        }
    }, 2000);
}

function updateStats() {
    uiRound.textContent = currentRound;
    uiScore.textContent = score;
}

function endGame() {
    finalScore.textContent = score;
    
    // Mensaje dinámico según puntaje
    if (score === 10) finalMessage.textContent = '¡Impresionante! Tienes un oído absoluto. 🥇';
    else if (score >= 7) finalMessage.textContent = '¡Muy bien hecho! Eres genial reconociendo instrumentos. 🥈';
    else if (score >= 4) finalMessage.textContent = 'Buen intento. ¡Un poco más de práctica y lo lograrás! 🥉';
    else finalMessage.textContent = '¡Sigue practicando! Cada vez lo harás mejor. 💪';

    if (window.AudioFX) window.AudioFX.playWin();
    modal.classList.remove('hidden');
}

// Eventos de Audio Simulado
btnPlay.addEventListener('click', () => {
    // Aquí iría: audio.src = currentTarget.audioUrl; audio.play();
    btnPlay.classList.add('hidden');
    audioToast.classList.remove('hidden');
    
    // Simular que el audio dura 3 segundos
    setTimeout(() => {
        btnPlay.classList.remove('hidden');
        audioToast.classList.add('hidden');
    }, 3000);
});

// Eventos Globales
btnRestart.addEventListener('click', initGame);

// Arrancar el juego la primera vez
initGame();
