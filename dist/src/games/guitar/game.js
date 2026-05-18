/**
 * 🎸 Guitar Hero Rítmico - Engine v1
 * Musidactica
 */

const CONFIG = {
    bpm: 120, // Tempo de "Rezo por vos" (BPM: 120)
    lookAheadBeats: 4, // Cuántos compases/beats vemos en pantalla antes de que lleguen
    toleranceBeats: 0.35, // Margen de acierto en beats
    measureBeats: 4,
    offsetBeats: 0.05, // Calibración ultra-precisa para el oído del profe
};

// Mapeo de teclas y carriles
const KEYS = {
    'D': { lane: 'D', color: 'green', index: 0 },
    'F': { lane: 'F', color: 'red', index: 1 },
    'H': { lane: 'H', color: 'yellow', index: 2 },
    'J': { lane: 'J', color: 'blue', index: 3 }
};

// Generador de patrones de rock rítmico procedurales
const PATTERNS = [
    // Patrón 1: Notas simples constantes
    [
        { time: 0, lane: 'D' },
        { time: 1, lane: 'F' },
        { time: 2, lane: 'H' },
        { time: 3, lane: 'J' }
    ],
    // Patrón 2: Doble acordes rítmicos
    [
        { time: 0, lane: 'D' },
        { time: 0, lane: 'J' },
        { time: 1, lane: 'F' },
        { time: 2, lane: 'H' },
        { time: 3, lane: 'F' },
        { time: 3, lane: 'H' }
    ],
    // Patrón 3: Ráfaga rápida (Corcheas rockeras!)
    [
        { time: 0, lane: 'D' },
        { time: 0.5, lane: 'D' },
        { time: 1, lane: 'F' },
        { time: 1.5, lane: 'F' },
        { time: 2, lane: 'H' },
        { time: 2.5, lane: 'J' },
        { time: 3, lane: 'H' }
    ],
    // Patrón 4: Sincopado y solos
    [
        { time: 0, lane: 'D' },
        { time: 0.75, lane: 'F' },
        { time: 1.5, lane: 'H' },
        { time: 2, lane: 'J' },
        { time: 2.75, lane: 'H' },
        { time: 3.5, lane: 'F' }
    ]
];

let player = null;
let isPlaying = false;
let isPlayerReady = false;
let startTime = 0;
let score = 0;
let combo = 0;
let notes = [];
let spawnedMeasureCount = 0;
let animationFrameId = null;

// DOM Elements
const btnStart = document.getElementById('btnStart');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const feedbackEl = document.getElementById('feedback');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumberEl = document.getElementById('countdown-number');
const resultModal = document.getElementById('resultModal');
const finalScoreEl = document.getElementById('finalScore');
const btnRestart = document.getElementById('btnRestart');

// Contenedores de carriles
const lanesDOM = {
    'D': document.getElementById('lane-D'),
    'F': document.getElementById('lane-F'),
    'H': document.getElementById('lane-H'),
    'J': document.getElementById('lane-J')
};

// Almohadillas / Receptores
const padsDOM = {
    'D': document.getElementById('pad-D'),
    'F': document.getElementById('pad-F'),
    'H': document.getElementById('pad-H'),
    'J': document.getElementById('pad-J')
};

// 1. YouTube Player API - Callback Global
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: '7qNgtbE7TIA', // Charly García - Rezo por vos (Official)
        playerVars: {
            'autoplay': 0,
            'controls': 1, // Obligatorio y visible por políticas de YouTube
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'iv_load_policy': 3,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    isPlayerReady = true;
    btnStart.textContent = "COMENZAR CONCIERTO ⚡";
    btnStart.disabled = false;
}

function onPlayerStateChange(event) {
    // Si el usuario pausa el video directamente en la pantalla de YouTube
    if (event.data === YT.PlayerState.PAUSED && isPlaying) {
        pauseGame();
    } else if (event.data === YT.PlayerState.PLAYING && !isPlaying) {
        resumeGameFromYouTube();
    } else if (event.data === YT.PlayerState.ENDED) {
        endGame();
    }
}

// ⏱️ OBTENER BEAT ACTUAL DESDE EL MASTER CLOCK DE YOUTUBE
function getCurrentBeat() {
    if (!isPlaying || !player || typeof player.getCurrentTime !== 'function') return 0;
    
    const time = player.getCurrentTime();
    // Convertir segundos a beats del tempo
    return (time * (CONFIG.bpm / 60)) - CONFIG.offsetBeats;
}

// Lógica de Inicio / Cuenta Atrás
function startPreCount() {
    if (!isPlayerReady) return;
    
    btnStart.disabled = true;
    countdownOverlay.classList.remove('hidden');
    let count = 4;
    
    // Preparar el video
    player.seekTo(0);
    player.pauseVideo();
    
    const beatInterval = (60 / CONFIG.bpm) * 1000;
    if (window.AudioFX) window.AudioFX.playTick();
    
    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumberEl.textContent = count;
            if (window.AudioFX) window.AudioFX.playTick();
        } else {
            clearInterval(timer);
            countdownOverlay.classList.add('hidden');
            startGame();
        }
    }, beatInterval);
}

function startGame() {
    isPlaying = true;
    score = 0;
    combo = 0;
    spawnedMeasureCount = 0;
    notes = [];
    
    // Limpiar restos visuales de partidas anteriores
    Object.values(lanesDOM).forEach(lane => lane.innerHTML = '');
    
    scoreEl.textContent = score;
    comboEl.textContent = combo;
    feedbackEl.textContent = "🎵 ¡ROCK AND ROLL! 🎵";
    btnStart.textContent = "ROCKING! 🎸";
    
    // Reproducir video
    player.playVideo();
    startTime = performance.now();
    
    // Iniciar loop de renderizado
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
}

function pauseGame() {
    isPlaying = false;
    feedbackEl.textContent = "JUEGO EN PAUSA";
    btnStart.textContent = "REANUDAR";
    btnStart.disabled = false;
}

function resumeGameFromYouTube() {
    isPlaying = true;
    feedbackEl.textContent = "¡A SEGUIR TOCANDO!";
    btnStart.textContent = "ROCKING! 🎸";
    btnStart.disabled = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Loop de juego
function gameLoop() {
    if (!isPlaying) return;

    const currentBeat = getCurrentBeat();

    // Administrar el generador de notas
    spawnManager(currentBeat);
    
    // Mover notas en pantalla
    updateNotes(currentBeat);

    // Finalizar si el video de YouTube terminó o superamos la duración segura de la canción
    if (player && player.getPlayerState && player.getPlayerState() === YT.PlayerState.ENDED) {
        endGame();
        return;
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Spawner de compases procedurales para rock
function spawnManager(currentBeat) {
    const targetBeat = currentBeat + CONFIG.lookAheadBeats;
    const targetMeasure = Math.floor(targetBeat / CONFIG.measureBeats);

    if (targetMeasure >= spawnedMeasureCount) {
        // Seleccionamos un patrón rítmico aleatorio
        const patternIdx = Math.floor(Math.random() * PATTERNS.length);
        spawnMeasure(spawnedMeasureCount, patternIdx);
        spawnedMeasureCount++;
    }
}

function spawnMeasure(measureIdx, patternIdx) {
    const pattern = PATTERNS[patternIdx];
    const baseBeat = measureIdx * CONFIG.measureBeats;

    pattern.forEach(noteData => {
        const lane = noteData.lane;
        const color = KEYS[lane].color;
        
        // Crear elemento en el DOM
        const noteEl = document.createElement('div');
        noteEl.className = `guitar-note note-${color}`;
        lanesDOM[lane].appendChild(noteEl);
        
        notes.push({
            el: noteEl,
            beat: baseBeat + noteData.time,
            lane: lane,
            hit: false,
            missed: false
        });
    });
}

// Animación física del mástil Guitar Hero
function updateNotes(currentBeat) {
    notes.forEach(note => {
        if (note.hit) return;

        const beatsLeft = note.beat - currentBeat;
        
        // El progreso va de 0 (aparece arriba) a 1 (línea de impacto)
        const progress = 1 - (beatsLeft / CONFIG.lookAheadBeats);
        
        if (progress >= 0 && progress <= 1.1) {
            // Posicionar visualmente la nota (85% es la strum-line)
            const topPercent = progress * 85;
            note.el.style.top = `${topPercent}%`;
            note.el.style.opacity = '1';
        } else if (progress < 0) {
            // Ocultar antes de aparecer arriba del mástil
            note.el.style.opacity = '0';
        }

        // Marcar miss si pasó de largo la tolerancia
        if (beatsLeft < -CONFIG.toleranceBeats && !note.missed) {
            note.missed = true;
            note.el.style.opacity = '0.15';
            handleMiss("¡MISS!");
        }
    });

    // Limpieza de notas antiguas del DOM
    while (notes.length > 0 && (currentBeat - notes[0].beat) > 2) {
        notes[0].el.remove();
        notes.shift();
    }
}

// ⌨️ CONTROLES Y EVENTOS DE TECLADO
window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (KEYS[key]) {
        // Evitar repetición por tecla presionada prolongadamente
        if (e.repeat) return;
        
        // Activar glow visual del pad correspondiente
        padsDOM[KEYS[key].lane].classList.add('active');
        
        if (isPlaying) {
            checkHit(KEYS[key].lane);
        }
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toUpperCase();
    if (KEYS[key]) {
        padsDOM[KEYS[key].lane].classList.remove('active');
    }
});

function checkHit(lane) {
    const currentBeat = getCurrentBeat();
    
    // Buscar la nota más cercana en el carril pulsado
    const targetNote = notes.find(n => n.lane === lane && !n.hit && !n.missed && Math.abs(n.beat - currentBeat) < CONFIG.toleranceBeats);

    if (targetNote) {
        const diff = Math.abs(targetNote.beat - currentBeat);
        
        if (diff < 0.12) {
            handleHit("¡EXCELENTE!", 100, targetNote);
        } else {
            handleHit("¡BUENA!", 50, targetNote);
        }
    } else {
        handleMiss("¡RASGUEO VACÍO!");
    }
}

function handleHit(msg, points, note) {
    score += points;
    combo++;
    scoreEl.textContent = score;
    comboEl.textContent = combo;
    feedbackEl.textContent = msg;
    feedbackEl.className = "feedback-text neon-text";
    
    note.hit = true;
    note.el.classList.add('note-explosion');
    
    if (window.AudioFX) {
        // Pequeño sintetizador que simula una nota de guitarra
        const freqs = { 'D': 196.00, 'F': 293.66, 'H': 329.63, 'J': 392.00 }; // G3, D4, E4, G4
        window.AudioFX._playTone(freqs[note.lane], 'sawtooth', 0.15, 0.08);
    }
    
    setTimeout(() => {
        note.el.remove();
    }, 350);
}

function handleMiss(msg) {
    combo = 0;
    comboEl.textContent = combo;
    feedbackEl.textContent = msg;
    feedbackEl.className = "feedback-text";
    feedbackEl.style.color = "#ef4444";
}

function endGame() {
    isPlaying = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    if (player && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
    }
    
    if (window.AudioFX) window.AudioFX.playWin();
    
    finalScoreEl.textContent = score;
    resultModal.classList.remove('hidden');
    
    btnStart.textContent = "TOCAR DE NUEVO 🎸";
    btnStart.disabled = false;
    countdownNumberEl.textContent = "4";
}

// Iniciar cargador
btnStart.addEventListener('click', () => {
    if (!isPlaying) {
        startPreCount();
    } else {
        pauseGame();
    }
});

btnRestart.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    startPreCount();
});
