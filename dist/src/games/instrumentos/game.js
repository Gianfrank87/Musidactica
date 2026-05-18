// Banco de 20 instrumentos (con URLs de imágenes en Cloudinary y placeholders para audios)
const INSTRUMENTS = [
    { id: 'piano', name: 'Piano', emoji: '🎹', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779069329/3b257150-0130-42b5-8d21-6f499f74cf4f_dflagc.png', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779073623/piano_imuqhd.mp3' },
    { id: 'guitarra', name: 'Guitarra Acústica', emoji: '🎸', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779069334/fa3133d1-c807-466b-a668-b716ae70aed5_xjuy6i.png', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779073481/guitarra_z1m2iw.mp3' },
    { id: 'bateria', name: 'Batería', emoji: '🥁', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779069343/7fc8d225-aeaa-4290-aead-7369cc4126d7_ldtayx.png', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779073720/drums_lyqhn3.mp3' },
    { id: 'bajo', name: 'Bajo Eléctrico', emoji: '🎸', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779069397/612da06f-22be-4b3c-bd8d-be734a5ddd46_ignis5.png', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779073819/bass_w_kiiq5u.mp3' },
    { id: 'violin', name: 'Violín', emoji: '🎻', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779069547/f00942d3-d8b5-426f-afd9-920dec34432e_lp1pom.png', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779073873/violin_b37t4b.mp3' },
    { id: 'flauta', name: 'Flauta Traversa', emoji: '🥖', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779069615/84bc1ff2-feef-402a-b230-d242abc8d61b_fwrtvv.png', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779074044/flauta_x1vrou.mp3' },
    { id: 'saxofon', name: 'Saxofón', emoji: '🎷', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779069671/2f1ad9d7-8c1a-4fc9-a550-1e408edafb70_qbqwno.png', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779074079/saxofon_rdnqzy.mp3' },
    { id: 'trompeta', name: 'Trompeta', emoji: '🎺', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070129/a421b2aa-32e7-48bd-887c-caa12e72e5fb_tk09pr.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779074202/trompeta_cydxua.mp3' },
    { id: 'trombon', name: 'Trombón', emoji: '📯', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070255/unnamed_bjsshb.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779074659/trombones_mqo7ok.mp3' },
    { id: 'clarinete', name: 'Clarinete', emoji: '🥢', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070372/unnamed_lzq6jx.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779074713/clarinete_b1yrz8.mp3' },
    { id: 'xilofono', name: 'Xilófono', emoji: '🎹', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070452/unnamed_mm0vnd.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779074773/xilofon_zf8ikf.mp3' },
    { id: 'triangulo', name: 'Triángulo', emoji: '🔺', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070542/unnamed_b70n87.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779074890/triangulo_xwbaie.mp3' },
    { id: 'pandereta', name: 'Pandereta', emoji: '🪘', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070622/unnamed_pntxvx.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779075001/pandero_fw575q.mp3' },
    { id: 'maracas', name: 'Maracas', emoji: '🪇', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070684/unnamed_jzvjb3.jpg', audioUrl: 'https://www.youtube.com/watch?v=Hrhkn4QqhXs' },
    { id: 'arpa', name: 'Arpa', emoji: '🪕', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070817/unnamed_gh7fkz.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779075123/arpa_q8oy3q.mp3' },
    { id: 'armonica', name: 'Armónica', emoji: '🪈', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070888/unnamed_t1vziq.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779075157/armonica_zzpils.mp3' },
    { id: 'charango', name: 'Charango', emoji: '🪕', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779070963/unnamed_axwhtm.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779075279/charango_nbbjra.mp3' },
    { id: 'acordeon', name: 'Acordeón', emoji: '🪗', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779071072/unnamed_pgib6u.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779075343/acordeon_sgwgm5.mp3' },
    { id: 'bombo', name: 'Bombo Legüero', emoji: '🥁', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779071183/5154879699379738312_ivl6zr.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779075433/bombo_zzep3u.mp3' },
    { id: 'ukelele', name: 'Ukelele', emoji: '🎸', imageUrl: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1779073023/unnamed_aa2ouo.jpg', audioUrl: 'https://res.cloudinary.com/dl3t6vykm/video/upload/v1779075461/ukelele_b2hcac.mp3' }
];

// Estado del juego
let currentRound = 1;
let score = 0;
const TOTAL_ROUNDS = 10;
let roundInstruments = []; // Los 10 instrumentos que se jugarán en esta partida
let currentTarget = null; // El instrumento correcto de la ronda actual
let isWaiting = false; // Bloquea clics durante la animación de transición
const gameAudio = new Audio(); // Instancia de Audio real para los sonidos de instrumentos

// Elementos del DOM
const uiRound = document.getElementById('currentRound');
const uiScore = document.getElementById('currentScore');
const mysteryCard = document.getElementById('mysteryCard');
const instrumentImage = document.getElementById('instrumentImage');
const emojiFallback = document.getElementById('emojiFallback');
const instrumentRevealName = document.getElementById('instrumentRevealName');
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

    // Detener y resetear audio de la ronda anterior
    gameAudio.pause();
    gameAudio.currentTime = 0;

    // Resetear UI del botón de reproducir
    btnPlay.disabled = false;
    btnPlay.classList.remove('hidden');
    audioToast.classList.add('hidden');

    // Resetear UI de la ronda (quitar el volteado del círculo)
    updateStats();
    if (mysteryCard) {
        mysteryCard.classList.remove('flipped');
    }

    // ⚡ PRECARGA DE IMAGEN EN SEGUNDO PLANO
    // Empezamos a cargar la imagen del nuevo instrumento mientras el alumno escucha el audio.
    // Esto evita que cuando la carta gire muestre por una fracción de segundo la foto de la ronda anterior!
    if (instrumentImage && emojiFallback) {
        // Inicialmente mostramos el emoji fallback (mientras la nueva imagen se descarga)
        instrumentImage.classList.add('hidden');
        emojiFallback.classList.remove('hidden');
        emojiFallback.textContent = currentTarget.emoji;

        if (currentTarget.imageUrl && !currentTarget.imageUrl.startsWith('ACA VA')) {
            // Creamos un cargador temporal para asegurar que la imagen esté 100% lista
            const imgLoader = new Image();
            imgLoader.src = currentTarget.imageUrl;

            imgLoader.onload = () => {
                // Si cargó exitosamente en segundo plano, la vinculamos al DOM y la destapamos
                instrumentImage.src = currentTarget.imageUrl;
                instrumentImage.classList.remove('hidden');
                emojiFallback.classList.add('hidden');
            };

            imgLoader.onerror = () => {
                // Si la imagen falla (Cloudinary caído o URL incorrecta), se queda el emoji
                instrumentImage.classList.add('hidden');
                emojiFallback.classList.remove('hidden');
            };
        } else {
            // Si es un placeholder ("ACA VA EL..."), usamos el emoji fallback
            instrumentImage.src = '';
            instrumentImage.classList.add('hidden');
            emojiFallback.classList.remove('hidden');
        }
    }

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

    // Configurar el nombre en el cartel del dorso
    if (instrumentRevealName) {
        instrumentRevealName.textContent = currentTarget.name;
    }

    // Darle la vuelta al círculo misterioso (3D Flip)
    if (mysteryCard) {
        mysteryCard.classList.add('flipped');
    }

    if (isCorrect) {
        // Acierto
        btnElement.classList.add('correct');
        score++;
        updateStats();
        if (window.AudioFX) window.AudioFX.playCorrect();
    } else {
        // Fallo
        btnElement.classList.add('wrong');
        // Resaltar la correcta en verde
        const correctBtn = Array.from(allButtons).find(btn => btn.dataset.id === currentTarget.id);
        if (correctBtn) correctBtn.classList.add('correct');
        if (window.AudioFX) window.AudioFX.playWrong();
    }

    // Esperar 2.8 segundos para dar tiempo a ver la imagen y pasar a la siguiente ronda
    setTimeout(() => {
        if (currentRound < TOTAL_ROUNDS) {
            currentRound++;
            startRound();
        } else {
            endGame();
        }
    }, 2800);
}

function updateStats() {
    uiRound.textContent = currentRound;
    uiScore.textContent = score;
}

function endGame() {
    finalScore.textContent = score;

    // Detener cualquier audio sonando
    gameAudio.pause();
    gameAudio.currentTime = 0;

    // Mensaje dinámico según puntaje
    if (score === 10) finalMessage.textContent = '¡Impresionante! Tienes un oído absoluto. 🥇';
    else if (score >= 7) finalMessage.textContent = '¡Muy bien hecho! Eres genial reconociendo instrumentos. 🥈';
    else if (score >= 4) finalMessage.textContent = 'Buen intento. ¡Un poco más de práctica y lo lograrás! 🥉';
    else finalMessage.textContent = '¡Sigue practicando! Cada vez lo harás mejor. 💪';

    if (window.AudioFX) window.AudioFX.playWin();
    modal.classList.remove('hidden');
}

// 🔊 LÓGICA DE AUDIO REAL DE INSTRUMENTOS
btnPlay.addEventListener('click', () => {
    if (!currentTarget) return;

    btnPlay.disabled = true;
    audioToast.classList.remove('hidden');
    audioToast.textContent = '🔊 Reproduciendo...';

    // Verificamos si hay un audio cargado de Cloudinary
    if (currentTarget.audioUrl && !currentTarget.audioUrl.startsWith('ACA VA')) {
        gameAudio.src = currentTarget.audioUrl;
        gameAudio.play().catch(error => {
            console.warn("No se pudo iniciar el audio:", error);
            audioToast.textContent = '⚠️ Error al cargar el audio';
            setTimeout(() => { btnPlay.disabled = false; audioToast.classList.add('hidden'); }, 1500);
        });

        // Al terminar el audio real, rehabilitar controles
        const onAudioEnded = () => {
            btnPlay.disabled = false;
            audioToast.classList.add('hidden');
            gameAudio.removeEventListener('ended', onAudioEnded);
        };
        gameAudio.addEventListener('ended', onAudioEnded);

    } else {
        // Fallback: Si no hay audio de Cloudinary cargado aún, sintetizamos un tono de prueba con Web Audio API
        audioToast.textContent = '🎵 Tono de prueba (Sube el audio a Cloudinary!)';
        if (window.AudioFX) {
            // Tono bonito sintetizado según el emoji del instrumento para diferenciar
            const freq = currentTarget.id === 'piano' ? 440 : 587.33; // A4 o D5
            window.AudioFX._playTone(freq, 'triangle', 2.0, 0.15);
        }

        setTimeout(() => {
            btnPlay.disabled = false;
            audioToast.classList.add('hidden');
        }, 2200);
    }
});

// Eventos Globales
btnRestart.addEventListener('click', initGame);

// Arrancar el juego la primera vez
initGame();
