/**
 * Estudio Virtual - Musidactica
 * Piano: Tone.Sampler (Salamander Grand) — sonido real
 * Batería: Síntesis procedural Web Audio API — latencia cero
 */

// ─────────────────────────────────────────────────────────────────────────────
// DRUM SYNTH: Todos los sonidos de batería generados matemáticamente
// Esto elimina la latencia de red y garantiza calidad uniforme.
// ─────────────────────────────────────────────────────────────────────────────
class DrumMachine {
    constructor() {
        this.ctx = null;
    }

    _ctx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    }

    // Bombo: onda senoidal con pitch sweep rápido hacia abajo
    kick() {
        const ctx = this._ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);

        const t = ctx.currentTime;
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
        gain.gain.setValueAtTime(1.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t); osc.stop(t + 0.5);
    }

    // Caja (Snare): ruido blanco + tono
    snare() {
        const ctx = this._ctx();
        const t = ctx.currentTime;

        // Ruido blanco
        const bufLen = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(1, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        noise.connect(noiseGain); noiseGain.connect(ctx.destination);
        noise.start(t); noise.stop(t + 0.2);

        // Tono bajo para darle cuerpo
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.frequency.value = 180;
        oscGain.gain.setValueAtTime(0.7, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(oscGain); oscGain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.1);
    }

    // Hi-Hat cerrado: ruido blanco de muy corta duración con filtro
    hihatClosed() {
        const ctx = this._ctx();
        const t = ctx.currentTime;

        const bufLen = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 8000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        noise.start(t); noise.stop(t + 0.05);
    }

    // Hi-Hat abierto: igual pero más largo y con fade out lento
    hihatOpen() {
        const ctx = this._ctx();
        const t = ctx.currentTime;

        const bufLen = ctx.sampleRate * 0.6;
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 8000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        noise.start(t); noise.stop(t + 0.6);
    }

    // Tom (ajustable por frecuencia)
    tom(freq = 120, duration = 0.3) {
        const ctx = this._ctx();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + duration);
        gain.gain.setValueAtTime(1.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + duration);
    }

    // Crash: ruido blanco largo + múltiples tonos metálicos
    crash() {
        const ctx = this._ctx();
        const t = ctx.currentTime;
        const dur = 1.5;

        const bufLen = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 6000; filter.Q.value = 0.5;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        noise.start(t); noise.stop(t + dur);
    }

    // Ride: tono metálico sostenido con ping
    ride() {
        const ctx = this._ctx();
        const t = ctx.currentTime;

        // Ping agudo
        const osc = ctx.createOscillator();
        osc.type = 'triangle'; osc.frequency.value = 850;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.8);

        // Ruido de fondo
        const bufLen = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 10000; filter.Q.value = 2;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(ctx.destination);
        noise.start(t); noise.stop(t + 0.4);
    }

    // Palillo en aro (rim shot)
    rim() {
        const ctx = this._ctx();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.frequency.value = 1200;
        osc.type = 'square';
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.04);
    }

    // Dispatch general
    play(name) {
        const map = {
            kick:        () => this.kick(),
            snare:       () => this.snare(),
            hihat:       () => this.hihatClosed(),
            hihatOpen:   () => this.hihatOpen(),
            tomHigh:     () => this.tom(220, 0.25),
            tomMid:      () => this.tom(160, 0.3),
            tomLow:      () => this.tom(110, 0.4),
            crash:       () => this.crash(),
            ride:        () => this.ride(),
            rim:         () => this.rim(),
        };
        if (map[name]) map[name]();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL STUDIO — Clase principal
// ─────────────────────────────────────────────────────────────────────────────
class VirtualStudio {
    constructor() {
        this.isLoaded = false;
        this.currentInstrument = 'piano';

        // Instruments
        this.piano = null;
        this.drumMachine = new DrumMachine();

        // Piano: teclado QWERTY → notas (layout tipo Garageband)
        this.pianoKeyMap = {
            'a': 'C4',  'w': 'C#4', 's': 'D4',  'e': 'D#4',
            'd': 'E4',  'f': 'F4',  't': 'F#4', 'g': 'G4',
            'y': 'G#4', 'h': 'A4',  'u': 'A#4', 'j': 'B4',
            'k': 'C5',  'o': 'C#5', 'l': 'D5',  'p': 'D#5',
            ';': 'E5',  "'": 'F5'
        };

        // Octapad: key → drum name
        this.drumKeyMap = {
            'q': 'crash',   'w': 'ride',
            'e': 'tomHigh', 'r': 'hihatOpen',
            'a': 'tomMid',  's': 'snare',
            'd': 'kick',    'f': 'tomLow'
        };

        this.initUI();
        this.generatePianoKeys();
        this.loadPiano(); // Solo carga piano, batería es instantánea
    }

    initUI() {
        this.ui = {
            loading:         document.getElementById('loading-screen'),
            btnPiano:        document.getElementById('btn-piano'),
            btnDrums:        document.getElementById('btn-drums'),
            pianoContainer:  document.getElementById('piano-container'),
            drumsContainer:  document.getElementById('drums-container'),
            pianoKeys:       document.getElementById('piano-keys'),
            drumPads:        document.querySelectorAll('.pad-btn'),
        };

        // Toggle instrumento
        this.ui.btnPiano.addEventListener('click', () => this.switchInstrument('piano'));
        this.ui.btnDrums.addEventListener('click', () => this.switchInstrument('drums'));

        // Teclado global
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup',   (e) => this.handleKeyUp(e));

        // Pads de batería
        this.ui.drumPads.forEach(pad => {
            pad.addEventListener('mousedown', () => this.playDrum(pad));
            pad.addEventListener('touchstart', (e) => { e.preventDefault(); this.playDrum(pad); }, { passive: false });
        });
    }

    generatePianoKeys() {
        const notes = [
            'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
            'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6'
        ];

        const whiteNotes = notes.filter(n => !n.includes('#'));
        const totalWhites = whiteNotes.length; // 15

        let whiteIdx = 0;

        notes.forEach(note => {
            const isBlack = note.includes('#');
            const el = document.createElement('div');
            el.dataset.note = note;

            const playNote = () => { if (this.isLoaded) this.playPiano(note, el); };
            const stopNote = () => { if (this.isLoaded) this.stopPiano(note, el); };

            el.addEventListener('mousedown', playNote);
            el.addEventListener('mouseup', stopNote);
            el.addEventListener('mouseleave', stopNote);
            el.addEventListener('touchstart', (e) => { e.preventDefault(); playNote(); }, { passive: false });
            el.addEventListener('touchend',   (e) => { e.preventDefault(); stopNote(); }, { passive: false });

            if (!isBlack) {
                el.className = 'key-white';
                const keyEntry = Object.entries(this.pianoKeyMap).find(([, v]) => v === note);
                if (keyEntry) {
                    const label = document.createElement('span');
                    label.className = 'key-label';
                    label.innerText = keyEntry[0].toUpperCase();
                    el.appendChild(label);
                }
                this.ui.pianoKeys.appendChild(el);
                whiteIdx++;
            } else {
                el.className = 'key-black';
                // Posición precisa de teclas negras relativa al contenedor
                const leftPct = (whiteIdx / totalWhites) * 100;
                el.style.left = `${leftPct}%`;
                this.ui.pianoKeys.appendChild(el);
            }
        });
    }

    async loadPiano() {
        this.piano = new Tone.Sampler({
            urls: {
                "A0":"A0.mp3","C1":"C1.mp3","D#1":"Ds1.mp3","F#1":"Fs1.mp3",
                "A1":"A1.mp3","C2":"C2.mp3","D#2":"Ds2.mp3","F#2":"Fs2.mp3",
                "A2":"A2.mp3","C3":"C3.mp3","D#3":"Ds3.mp3","F#3":"Fs3.mp3",
                "A3":"A3.mp3","C4":"C4.mp3","D#4":"Ds4.mp3","F#4":"Fs4.mp3",
                "A4":"A4.mp3","C5":"C5.mp3","D#5":"Ds5.mp3","F#5":"Fs5.mp3",
                "A5":"A5.mp3","C6":"C6.mp3","D#6":"Ds6.mp3","F#6":"Fs6.mp3",
                "A6":"A6.mp3","C7":"C7.mp3","D#7":"Ds7.mp3","F#7":"Fs7.mp3",
                "A7":"A7.mp3","C8":"C8.mp3"
            },
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            release: 1,
            onload: () => {
                // Warm-up: tocar una nota silenciosa para que el primer toque no sufra demora
                this.piano.triggerAttackRelease("C4", 0.001, Tone.now(), 0.0001);
            }
        }).toDestination();

        await Tone.loaded();

        this.isLoaded = true;
        this.ui.loading.classList.add('hidden');
    }

    switchInstrument(type) {
        this.currentInstrument = type;
        this.ui.btnPiano.classList.toggle('active', type === 'piano');
        this.ui.btnDrums.classList.toggle('active', type === 'drums');

        if (type === 'piano') {
            this.ui.pianoContainer.classList.add('active');
            this.ui.drumsContainer.classList.remove('active');
        } else {
            this.ui.pianoContainer.classList.remove('active');
            this.ui.drumsContainer.classList.add('active');
        }
    }

    playPiano(note, el) {
        Tone.start();
        this.piano.triggerAttack(note);
        el.classList.add('active');
    }

    stopPiano(note, el) {
        this.piano.triggerRelease(note);
        el.classList.remove('active');
    }

    playDrum(padEl) {
        const drumName = padEl.dataset.drum;
        if (!drumName) return;

        this.drumMachine.play(drumName);

        // Flash de animación
        padEl.classList.remove('active');
        void padEl.offsetWidth; // reflow para reiniciar animación
        padEl.classList.add('active');
        setTimeout(() => padEl.classList.remove('active'), 120);
    }

    handleKeyDown(e) {
        if (e.repeat) return;
        const key = e.key.toLowerCase();

        if (this.currentInstrument === 'piano' && this.isLoaded) {
            const note = this.pianoKeyMap[key];
            if (note) {
                const el = document.querySelector(`.piano-keys [data-note="${note}"]`);
                if (el) this.playPiano(note, el);
            }
        } else if (this.currentInstrument === 'drums') {
            const drumName = this.drumKeyMap[key];
            if (drumName) {
                const pad = document.querySelector(`.pad-btn[data-drum="${drumName}"]`);
                if (pad) this.playDrum(pad);
            }
        }
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (this.currentInstrument === 'piano' && this.isLoaded) {
            const note = this.pianoKeyMap[key];
            if (note) {
                const el = document.querySelector(`.piano-keys [data-note="${note}"]`);
                if (el) this.stopPiano(note, el);
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => { new VirtualStudio(); });
