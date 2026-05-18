/**
 * Ritmograma Engine v3 - Musidactica
 * Velocidad base: 90 BPM
 */

const CONFIG = {
    bpm: 90,
    pixelsPerBeat: 300,
    targetX: 80,
    tolerance: 150, // ms
    measureBeats: 4,
    patternChangeMeasures: 4,
};

// Figuras musicales para la vista previa
const FIGURES = {
    'F': '♩', // Negra
    'H': '♫', // Corcheas
    'J': '♬', // Semicorcheas
    'S': '𝄽', // Silencio de Negra
};

// Definición de posibles patrones rítmicos mejorados
const PATTERNS = [
    [
        { time: 0, type: 'F', color: 'red' },
        { time: 1, type: 'S', color: 'silent' }, // Silencio
        { time: 2, type: 'H', color: 'blue' },
        { time: 2.5, type: 'H', color: 'blue' },
        { time: 3, type: 'F', color: 'red' }
    ],
    [
        { time: 0, type: 'J', color: 'yellow' }, // Semicorcheas
        { time: 0.25, type: 'J', color: 'yellow' },
        { time: 0.5, type: 'J', color: 'yellow' },
        { time: 0.75, type: 'J', color: 'yellow' },
        { time: 1, type: 'F', color: 'red' },
        { time: 2, type: 'S', color: 'silent' },
        { time: 3, type: 'F', color: 'red' }
    ],
    [
        { time: 0, type: 'F', color: 'red' },
        { time: 1, type: 'H', color: 'blue' },
        { time: 1.5, type: 'H', color: 'blue' },
        { time: 2, type: 'J', color: 'yellow' },
        { time: 2.25, type: 'J', color: 'yellow' },
        { time: 2.5, type: 'J', color: 'yellow' },
        { time: 2.75, type: 'J', color: 'yellow' },
        { time: 3, type: 'F', color: 'red' }
    ],
    [
        { time: 0, type: 'S', color: 'silent' },
        { time: 1, type: 'F', color: 'red' },
        { time: 2, type: 'F', color: 'red' },
        { time: 3, type: 'S', color: 'silent' }
    ]
];

let isPlaying = false;
let startTime = 0;
let score = 0;
let combo = 0;
let notes = [];
let currentPatternIndex = 0;
let nextPatternMeasure = 0;
let spawnedMeasureCount = 0;

// DOM
const notesContainer = document.getElementById('notesContainer');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const feedbackEl = document.getElementById('feedback');
const btnStart = document.getElementById('btnStart');
const subliminalOverlay = document.getElementById('subliminal-overlay');
const targetZone = document.getElementById('targetZone');
const patternNotesEl = document.getElementById('patternNotes');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumberEl = document.getElementById('countdown-number');
const muteBtn = document.getElementById('mute-btn');

if (muteBtn && window.AudioFX) {
    muteBtn.addEventListener('click', () => {
        const isMuted = window.AudioFX.toggleMute();
        muteBtn.classList.toggle('muted', isMuted);
    });
}

// Lógica de Cuenta Atrás
function startPreCount() {
    btnStart.disabled = true;
    countdownOverlay.classList.remove('hidden');
    let count = 4;
    
    // El intervalo de tiempo basado en BPM (90 BPM = 666.6ms por beat)
    const beatInterval = (60 / CONFIG.bpm) * 1000;
    
    const timer = setInterval(() => {
        // Sonido de palillos
        if (window.AudioFX) window.AudioFX.playTick();
        
        count--;
        if (count > 0) {
            countdownNumberEl.textContent = count;
        } else {
            clearInterval(timer);
            countdownOverlay.classList.add('hidden');
            startGame();
        }
    }, beatInterval);
}

function startGame() {
    isPlaying = true;
    startTime = performance.now();
    score = 0;
    combo = 0;
    spawnedMeasureCount = 0;
    currentPatternIndex = 0;
    nextPatternMeasure = CONFIG.patternChangeMeasures;
    notes = [];
    notesContainer.innerHTML = '';
    btnStart.textContent = "¡JUGANDO!";
    
    updatePatternPreview();
    requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
    if (!isPlaying) return;

    const elapsedTime = (currentTime - startTime) / 1000;
    const currentBeat = elapsedTime * (CONFIG.bpm / 60);

    handleSubliminalPulse(currentBeat);
    spawnManager(currentBeat);
    updateNotes(currentBeat);

    if (currentBeat > 64) {
        endGame();
        return;
    }

    requestAnimationFrame(gameLoop);
}

function handleSubliminalPulse(currentBeat) {
    const frac = currentBeat % 1;
    if (frac < 0.15) {
        subliminalOverlay.classList.add('pulse');
        targetZone.classList.add('active');
    } else {
        subliminalOverlay.classList.remove('pulse');
        targetZone.classList.remove('active');
    }
}

function spawnManager(currentBeat) {
    const lookAheadBeats = 8;
    const targetBeat = currentBeat + lookAheadBeats;
    const targetMeasure = Math.floor(targetBeat / CONFIG.measureBeats);

    if (targetMeasure >= spawnedMeasureCount) {
        if (targetMeasure >= nextPatternMeasure) {
            currentPatternIndex = (currentPatternIndex + 1) % PATTERNS.length;
            nextPatternMeasure += CONFIG.patternChangeMeasures;
            updatePatternPreview();
        }
        spawnMeasure(spawnedMeasureCount, currentPatternIndex);
        spawnedMeasureCount++;
    }
}

function spawnMeasure(measureIdx, patternIdx) {
    const pattern = PATTERNS[patternIdx];
    const baseBeat = measureIdx * CONFIG.measureBeats;

    pattern.forEach(noteData => {
        if (noteData.type === 'S') return; // No spawneamos nada para silencios

        const noteEl = document.createElement('div');
        noteEl.className = `note ${noteData.color}`;
        noteEl.textContent = noteData.type;
        notesContainer.appendChild(noteEl);
        
        notes.push({
            el: noteEl,
            beat: baseBeat + noteData.time,
            type: noteData.type,
            hit: false,
            missed: false
        });
    });
}

function updatePatternPreview() {
    const pattern = PATTERNS[currentPatternIndex];
    let previewStr = "";
    pattern.forEach((n) => {
        previewStr += FIGURES[n.type] + " ";
    });
    patternNotesEl.textContent = previewStr;
}

function updateNotes(currentBeat) {
    notes.forEach((note) => {
        if (note.hit) return;
        const beatsLeft = note.beat - currentBeat;
        const xPos = CONFIG.targetX + (beatsLeft * CONFIG.pixelsPerBeat);
        note.el.style.left = `${xPos}px`;

        if (beatsLeft < -0.25 && !note.missed) {
            note.missed = true;
            note.el.style.opacity = "0.2";
            handleMiss("¡MISS!");
        }
    });

    while (notes.length > 0 && (currentBeat - notes[0].beat) > 2) {
        notes[0].el.remove();
        notes.shift();
    }
}

window.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    const key = e.key.toUpperCase();
    if (key === 'F' || key === 'H' || key === 'J') checkHit(key);
});

function checkHit(key) {
    const now = performance.now();
    const elapsedTime = (now - startTime) / 1000;
    const currentBeat = elapsedTime * (CONFIG.bpm / 60);

    const targetNote = notes.find(n => !n.hit && !n.missed && Math.abs(n.beat - currentBeat) < 0.35);

    if (targetNote) {
        if (targetNote.type === key) {
            const diff = Math.abs(targetNote.beat - currentBeat);
            if (diff < 0.12) handleHit("¡PERFECTO!", 100, targetNote);
            else handleHit("BIEN", 50, targetNote);
        } else {
            handleMiss("TECLA INCORRECTA");
        }
    } else {
        handleMiss("FUERA DE TIEMPO");
    }
}

function handleHit(msg, points, note) {
    score += points;
    combo++;
    scoreEl.textContent = score;
    comboEl.textContent = combo;
    feedbackEl.textContent = msg;
    feedbackEl.style.color = "var(--color-primary)";
    note.hit = true;
    note.el.classList.add('hit-explosion');
    
    // Desaparecer después de la animación
    setTimeout(() => { note.el.classList.add('hidden'); }, 400);
}

function handleMiss(msg) {
    combo = 0;
    comboEl.textContent = combo;
    feedbackEl.textContent = msg;
    feedbackEl.style.color = "#ef4444";
}

function endGame() {
    isPlaying = false;
    if (window.AudioFX) window.AudioFX.playWin();
    document.getElementById('resultModal').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
    btnStart.disabled = false;
    btnStart.textContent = "COMENZAR JUEGO";
    countdownNumberEl.textContent = "4";
}

btnStart.addEventListener('click', startPreCount);
document.getElementById('btnRestart').addEventListener('click', () => {
    document.getElementById('resultModal').classList.add('hidden');
    startPreCount();
});
