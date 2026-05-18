/**
 * Global Audio Effects for Musidactica
 * Uses Web Audio API to synthesize UI sounds (no external files needed)
 */

class UI_AudioFX {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        
        // Ensure audio context is created only on user interaction to comply with browser policies
        this._initOnInteraction = this._initOnInteraction.bind(this);
        document.addEventListener('click', this._initOnInteraction, { once: true });
        document.addEventListener('keydown', this._initOnInteraction, { once: true });
    }

    _initOnInteraction() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    // Helper to create an oscillator
    _playTone(freq, type, duration, vol = 0.1, slideFreq = null) {
        if (this.isMuted) return;
        if (!this.ctx) this._initOnInteraction(); // Failsafe
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        
        // Setup envelopes to avoid clicks
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slideFreq) {
            osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
        }

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    // A short sharp tick for countdowns
    playTick() {
        this._playTone(880, 'triangle', 0.1, 0.15); // A5
    }

    // A pleasant "ding-ding" for correct answers
    playCorrect() {
        if (this.isMuted) return;
        // Play C5
        this._playTone(523.25, 'sine', 0.3, 0.15);
        // Play G5 slightly after
        setTimeout(() => {
            this._playTone(783.99, 'sine', 0.4, 0.15);
        }, 100);
    }

    // A low buzzer for wrong answers
    playWrong() {
        // Sawtooth that slides down
        this._playTone(150, 'sawtooth', 0.3, 0.2, 100);
    }

    // A celebratory arpeggio for winning/completing
    playWin() {
        if (this.isMuted) return;
        // C major arpeggio C4, E4, G4, C5
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this._playTone(freq, 'sine', 0.4, 0.15);
            }, index * 100);
        });
    }
}

// Global instance
window.AudioFX = new UI_AudioFX();
