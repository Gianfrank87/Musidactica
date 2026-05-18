/**
 * PianoSynth v2 — Improved Web Audio API Piano Simulator
 * Uses multiple detuned oscillators + low-pass filter + shaped ADSR
 * for a warmer, more musical piano-like tone.
 */
class PianoSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Master gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.6;

        // Reverb convolver (simple impulse response)
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.18; // Dry/wet mix — subtle reverb

        this.dryGain = this.ctx.createGain();
        this.dryGain.gain.value = 1;

        this._buildReverb().then(reverb => {
            this.dryGain.connect(this.masterGain);
            reverb.connect(this.reverbGain);
            this.reverbGain.connect(this.masterGain);
        });

        this.masterGain.connect(this.ctx.destination);
    }

    async _buildReverb() {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * 2.5; // 2.5s tail
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        for (let c = 0; c < 2; c++) {
            const channel = impulse.getChannelData(c);
            for (let i = 0; i < length; i++) {
                channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
            }
        }
        const conv = this.ctx.createConvolver();
        conv.buffer = impulse;
        return conv;
    }

    async resume() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    /**
     * Play a single piano-like note.
     * @param {number} frequency  - Frequency in Hz
     * @param {number} time       - AudioContext time to start (default: now)
     * @param {number} duration   - Note duration in seconds
     */
    playNote(frequency, time = undefined, duration = 0.6) {
        if (!time) time = this.ctx.currentTime + 0.05;

        const noteGain = this.ctx.createGain();

        // Low-pass filter to soften harshness (piano warmth)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 12; // Open early, sweep closed
        filter.frequency.setTargetAtTime(frequency * 3, time + 0.05, 0.3);
        filter.Q.value = 0.5;

        // ─── Oscillator Bank ───────────────────────────────────────────
        // Fundamental (triangle - piano body)
        const osc1 = this._makeOsc('triangle', frequency, time, duration + 0.5);
        // 2nd harmonic (octave above, sine) — adds brightness
        const osc2 = this._makeOsc('sine', frequency * 2, time, duration + 0.3);
        // 3rd harmonic (fifth + octave, sine) — adds richness
        const osc3 = this._makeOsc('sine', frequency * 3, time, duration + 0.1);
        // Slight detune for natural choir effect
        const osc4 = this._makeOsc('sine', frequency * 1.003, time, duration + 0.4);

        // Mix harmonics
        const h2Gain = this.ctx.createGain(); h2Gain.gain.value = 0.35;
        const h3Gain = this.ctx.createGain(); h3Gain.gain.value = 0.1;
        const h4Gain = this.ctx.createGain(); h4Gain.gain.value = 0.4;

        osc1.connect(noteGain);
        osc2.connect(h2Gain); h2Gain.connect(noteGain);
        osc3.connect(h3Gain); h3Gain.connect(noteGain);
        osc4.connect(h4Gain); h4Gain.connect(noteGain);

        noteGain.connect(filter);
        filter.connect(this.dryGain);

        // ─── ADSR Envelope ──────────────────────────────────────────────
        const attack  = 0.015;
        const decay   = 0.12;
        const sustain = 0.4;
        const release = 0.45;

        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + attack);
        noteGain.gain.linearRampToValueAtTime(sustain, time + attack + decay);
        noteGain.gain.setValueAtTime(sustain, time + duration - release);
        noteGain.gain.linearRampToValueAtTime(0, time + duration + release);
    }

    _makeOsc(type, frequency, startTime, stopTime) {
        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = frequency;
        osc.start(startTime);
        osc.stop(startTime + stopTime);
        return osc;
    }

    /**
     * Play a sequence of note names with even timing.
     * Returns total duration in seconds.
     */
    playSequence(frequencies, noteDuration = 0.5, gap = 0.12) {
        this.resume();
        const startTime = this.ctx.currentTime + 0.15;
        frequencies.forEach((freq, i) => {
            if (freq > 0) {
                this.playNote(freq, startTime + i * (noteDuration + gap), noteDuration);
            }
        });
        return (noteDuration + gap) * frequencies.length;
    }
}

// ─── Note Frequency Table ──────────────────────────────────────────────────
const NOTES = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
    'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99
};
