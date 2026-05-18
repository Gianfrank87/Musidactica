/**
 * game.js — Dictado Melódico v3
 * - Clef: Unicode 𝄞 rendered as SVG <text> (always perfect)
 * - Dynamic round count: 5 / 8 / 10 / 15 (user selects)
 * - Difficulty sets the MIX of exercise types; round count scales that mix
 */

// ─── Staff constants ────────────────────────────────────────────────────────
const STAFF_Y1 = 30;  // Y of top staff line
const LINE_GAP = 15;  // pixels between lines

const NOTE_Y = {
    'G5': STAFF_Y1 - LINE_GAP,          // 15
    'F5': STAFF_Y1,                      // 30  — line 1
    'E5': STAFF_Y1 + LINE_GAP * 0.5,    // 37.5
    'D5': STAFF_Y1 + LINE_GAP * 1,      // 45  — line 2
    'C5': STAFF_Y1 + LINE_GAP * 1.5,    // 52.5
    'B4': STAFF_Y1 + LINE_GAP * 2,      // 60  — line 3
    'A4': STAFF_Y1 + LINE_GAP * 2.5,    // 67.5
    'G4': STAFF_Y1 + LINE_GAP * 3,      // 75  — line 4
    'F4': STAFF_Y1 + LINE_GAP * 3.5,    // 82.5
    'E4': STAFF_Y1 + LINE_GAP * 4,      // 90  — line 5 (bottom)
    'D4': STAFF_Y1 + LINE_GAP * 4.5,    // 97.5
    'C4': STAFF_Y1 + LINE_GAP * 5,      // 105 — middle C (ledger line)
};

const NOTE_NAMES = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5'];

// ─── Difficulty templates ───────────────────────────────────────────────────
// mix: ratio of each exercise type per N rounds
// Rounds are generated dynamically to fill the chosen count
const DIFFICULTY = {
    principiante: {
        label: 'Principiante',
        // All direction rounds. Notes: 6 per round.
        mix: [
            { type: 'direction', notes: 6 }
        ],
        points: { direction: 10, staff: 20, dictation: 30 }
    },
    medio: {
        label: 'Medio',
        // 2 direction → 2 staff → 1 dictation (cycle)
        mix: [
            { type: 'direction', notes: 7 },
            { type: 'direction', notes: 8 },
            { type: 'staff',     notes: 5 },
            { type: 'staff',     notes: 5 },
            { type: 'dictation', notes: 4 },
        ],
        points: { direction: 10, staff: 20, dictation: 35 }
    },
    dificil: {
        label: 'Difícil',
        // 1 direction → 1 staff → 1 dictation (cycle, dictation has more notes)
        mix: [
            { type: 'direction', notes: 8 },
            { type: 'staff',     notes: 6 },
            { type: 'dictation', notes: 5 },
            { type: 'direction', notes: 8 },
            { type: 'staff',     notes: 6 },
            { type: 'dictation', notes: 6 },
        ],
        points: { direction: 10, staff: 20, dictation: 40 }
    }
};

/** Generate `count` rounds by cycling through difficulty.mix */
function generateRounds(diffKey, count) {
    const diff = DIFFICULTY[diffKey];
    const mix  = diff.mix;
    const rounds = [];
    for (let i = 0; i < count; i++) {
        rounds.push({ ...mix[i % mix.length] });
    }
    return rounds;
}

// ─── Game ───────────────────────────────────────────────────────────────────
class Game {
    constructor() {
        this.synth      = new PianoSynth();
        this.score      = 0;
        this.diffKey    = null;
        this.rounds     = [];
        this.roundIndex = 0;

        // Round state
        this.currentSequence = [];
        this.direction       = '';
        this.l2Options       = [];
        this.l2CorrectIdx    = 0;
        this.userNotes       = [];

        // UI: track selected options
        this._selectedDiff       = null;
        this._selectedRoundCount = null;

        this._bindUIEvents();
        this._showScreen('start');
    }

    // ══════════════════════════════════════════════════════════════════════════
    // UI Helpers
    // ══════════════════════════════════════════════════════════════════════════
    _showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const el = document.getElementById(id + '-screen');
        if (el) el.classList.add('active');
    }

    _updateScore(pts) {
        this.score += pts;
        document.getElementById('score').innerText = this.score;
    }

    _showFeedback(isCorrect, cb) {
        if (window.AudioFX) {
            if (isCorrect) window.AudioFX.playCorrect();
            else window.AudioFX.playWrong();
        }
        const overlay = document.getElementById('feedback-overlay');
        document.getElementById('feedback-icon').innerText = isCorrect ? '✅' : '❌';
        document.getElementById('feedback-msg').innerText  = isCorrect
            ? '¡Correcto!' : 'Casi... ¡Sigue practicando!';
        overlay.classList.add('show');
        setTimeout(() => {
            overlay.classList.remove('show');
            if (cb) cb();
        }, 1200);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Event binding
    // ══════════════════════════════════════════════════════════════════════════
    _bindUIEvents() {
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn && window.AudioFX) {
            muteBtn.addEventListener('click', () => {
                const isMuted = window.AudioFX.toggleMute();
                muteBtn.classList.toggle('muted', isMuted);
            });
        }

        // Difficulty selector buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                this._selectedDiff = e.currentTarget.dataset.diff;
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                document.getElementById('step-2-rounds').classList.remove('hidden');
                document.getElementById('start-game-btn').classList.remove('hidden');
                this._checkCanStart();
            });
        });

        // Round count selector buttons
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                this._selectedRoundCount = parseInt(e.currentTarget.dataset.count, 10);
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this._checkCanStart();
            });
        });

        // Start button (enabled only when both options chosen)
        document.getElementById('start-game-btn').addEventListener('click', () => {
            if (this._selectedDiff && this._selectedRoundCount) {
                this._startGame(this._selectedDiff, this._selectedRoundCount);
            }
        });

        // Direction round
        document.getElementById('play-direction-btn').addEventListener('click', () => this._playCurrent());
        document.querySelectorAll('.dir-option').forEach(btn => {
            btn.addEventListener('click', e => this._checkDirection(e.currentTarget.dataset.answer));
        });

        // Staff round
        document.getElementById('play-staff-btn').addEventListener('click', () => {
            this._playSequence(this.l2Options[this.l2CorrectIdx]);
        });

        // Dictation round
        document.getElementById('play-dictation-btn').addEventListener('click',  () => this._playCurrent());
        document.getElementById('undo-note-btn').addEventListener('click',        () => this._undoLastNote());
        document.getElementById('clear-staff-btn').addEventListener('click',      () => {
            this.userNotes = [];
            this._renderInteractiveStaff();
        });
        document.getElementById('check-dictation-btn').addEventListener('click',  () => this._checkDictation());

        // Result
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.score = 0;
            document.getElementById('score').innerText = 0;
            this._selectedDiff = null;
            this._selectedRoundCount = null;
            document.querySelectorAll('.diff-btn, .count-btn').forEach(b => b.classList.remove('selected'));
            document.getElementById('start-game-btn').disabled = true;
            this._showScreen('start');
        });
    }

    _checkCanStart() {
        const btn = document.getElementById('start-game-btn');
        btn.disabled = !(this._selectedDiff && this._selectedRoundCount);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Game flow
    // ══════════════════════════════════════════════════════════════════════════
    _startGame(diffKey, count) {
        this.diffKey    = diffKey;
        this.rounds     = generateRounds(diffKey, count);
        this.score      = 0;
        this.roundIndex = 0;
        document.getElementById('score').innerText = 0;
        document.getElementById('difficulty-label').innerText = DIFFICULTY[diffKey].label;
        this._nextRound();
    }

    _nextRound() {
        if (this.roundIndex >= this.rounds.length) {
            this._endGame();
            return;
        }
        const round = this.rounds[this.roundIndex];
        const total = this.rounds.length;
        document.getElementById('round-counter').innerText =
            `Ronda ${this.roundIndex + 1} de ${total}`;

        switch (round.type) {
            case 'direction':  this._startDirectionRound(round); break;
            case 'staff':      this._startStaffRound(round);     break;
            case 'dictation':  this._startDictationRound(round); break;
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Direction Round
    // ══════════════════════════════════════════════════════════════════════════
    _startDirectionRound(round) {
        const dirs = ['sube', 'baja', 'mixta'];
        this.direction = dirs[Math.floor(Math.random() * dirs.length)];
        this.currentSequence = this._generateDirectionalMelody(this.direction, round.notes);
        this._showScreen('direction');
        setTimeout(() => this._playCurrent(), 600);
    }

    _generateDirectionalMelody(dir, count) {
        const seq = [];
        let idx = dir === 'sube' ? 0
                : dir === 'baja' ? NOTE_NAMES.length - 1
                : Math.floor(NOTE_NAMES.length / 2);

        for (let i = 0; i < count; i++) {
            seq.push(NOTE_NAMES[idx]);
            if (dir === 'sube') {
                idx = Math.min(NOTE_NAMES.length - 1, idx + 1 + Math.floor(Math.random() * 2));
            } else if (dir === 'baja') {
                idx = Math.max(0, idx - 1 - Math.floor(Math.random() * 2));
            } else {
                idx = Math.max(2, Math.min(NOTE_NAMES.length - 3, idx + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1)));
            }
        }
        return seq;
    }

    _checkDirection(answer) {
        const ok = answer === this.direction;
        if (ok) this._updateScore(DIFFICULTY[this.diffKey].points.direction);
        this._showFeedback(ok, () => { this.roundIndex++; this._nextRound(); });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Staff Identification Round
    // ══════════════════════════════════════════════════════════════════════════
    _startStaffRound(round) {
        this.l2Options = [];
        for (let i = 0; i < 3; i++) this.l2Options.push(this._randomMelody(round.notes));
        this.l2CorrectIdx    = Math.floor(Math.random() * 3);
        this.currentSequence = this.l2Options[this.l2CorrectIdx];
        this._showScreen('staff');
        this._renderStaffOptions();
        setTimeout(() => this._playSequence(this.currentSequence), 600);
    }

    _renderStaffOptions() {
        const container = document.getElementById('staff-options');
        container.innerHTML = '';
        this.l2Options.forEach((seq, idx) => {
            const div = document.createElement('div');
            div.className = 'staff-card';
            div.innerHTML = this._createStaffSVG(seq);
            div.addEventListener('click', () => this._checkStaff(idx));
            container.appendChild(div);
        });
    }

    _checkStaff(selectedIdx) {
        const ok = selectedIdx === this.l2CorrectIdx;
        if (ok) this._updateScore(DIFFICULTY[this.diffKey].points.staff);
        const cards = document.querySelectorAll('.staff-card');
        cards[selectedIdx].classList.add(ok ? 'card-correct' : 'card-wrong');
        if (!ok) cards[this.l2CorrectIdx].classList.add('card-correct');
        cards.forEach(c => c.style.pointerEvents = 'none');
        this._showFeedback(ok, () => { this.roundIndex++; this._nextRound(); });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Dictation Round
    // ══════════════════════════════════════════════════════════════════════════
    _startDictationRound(round) {
        this.currentSequence = this._randomMelody(round.notes, 0, 7);
        this.userNotes       = [];
        this._showScreen('dictation');
        document.getElementById('notes-needed').innerText = round.notes;
        document.getElementById('notes-placed').innerText = 0;
        this._renderInteractiveStaff();
        setTimeout(() => this._playCurrent(), 600);
    }

    _renderInteractiveStaff() {
        const svg     = document.getElementById('interactive-staff');
        const maxNotes = this.rounds[this.roundIndex]?.notes || 4;
        svg.innerHTML  = '';

        const W          = 480;
        const CLEF_X     = 8;
        const NOTE_X_START = 68; // after clef
        const NOTE_X_END   = W - 15;
        const NOTE_AREA_W  = NOTE_X_END - NOTE_X_START;

        // Staff lines
        for (let i = 0; i < 5; i++) {
            const y    = STAFF_Y1 + i * LINE_GAP;
            const line = this._svgEl('line', { x1: CLEF_X, y1: y, x2: W - 8, y2: y, class: 'staff-line' });
            svg.appendChild(line);
        }

        // Treble clef via Unicode text
        this._appendClef(svg, CLEF_X, 0);

        // Clickable hit zones (only in the note area, right of clef)
        Object.entries(NOTE_Y).forEach(([noteName, y]) => {
            const rect = this._svgEl('rect', {
                x: NOTE_X_START, y: y - 7.5,
                width: NOTE_AREA_W, height: 15,
                class: 'hit-zone'
            });
            rect.addEventListener('click', () => {
                if (this.userNotes.length < maxNotes) {
                    this.synth.resume();
                    this.synth.playNote(NOTES[noteName], undefined, 0.5);
                    this.userNotes.push(noteName);
                    document.getElementById('notes-placed').innerText = this.userNotes.length;
                    this._renderInteractiveStaff();
                }
            });
            svg.appendChild(rect);
        });

        // User-placed notes
        const spacing = NOTE_AREA_W / (maxNotes + 1);
        this.userNotes.forEach((note, idx) => {
            const cx = NOTE_X_START + spacing * (idx + 1);
            const cy = NOTE_Y[note];
            this._drawNote(svg, cx, cy, note, true);
        });
    }

    _undoLastNote() {
        if (this.userNotes.length > 0) {
            this.userNotes.pop();
            document.getElementById('notes-placed').innerText = this.userNotes.length;
            this._renderInteractiveStaff();
        }
    }

    _checkDictation() {
        const maxNotes = this.rounds[this.roundIndex]?.notes || 4;
        if (this.userNotes.length < maxNotes) {
            this._shake(document.getElementById('check-dictation-btn'));
            return;
        }
        const ok = this.userNotes.every((n, i) => n === this.currentSequence[i]);
        if (ok) this._updateScore(DIFFICULTY[this.diffKey].points.dictation);
        this._showFeedback(ok, () => { this.roundIndex++; this._nextRound(); });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Result
    // ══════════════════════════════════════════════════════════════════════════
    _endGame() {
        if (window.AudioFX) window.AudioFX.playWin();
        this._showScreen('result');
        const total = this.rounds.reduce(
            (s, r) => s + DIFFICULTY[this.diffKey].points[r.type], 0
        );
        const pct = Math.round((this.score / total) * 100);
        document.getElementById('final-score-val').innerText = this.score;
        document.getElementById('max-score-val').innerText   = total;
        document.getElementById('result-pct').innerText      = pct + '%';
        setTimeout(() => {
            document.getElementById('result-pct-fill').style.width = pct + '%';
        }, 150);
        const titles = ['¡Gran Esfuerzo!', '¡Bien Hecho!', '¡Excelente Oído!', '¡Oído Perfecto! 🎯'];
        document.getElementById('result-title').innerText =
            titles[pct < 40 ? 0 : pct < 65 ? 1 : pct < 85 ? 2 : 3];
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SVG Helpers
    // ══════════════════════════════════════════════════════════════════════════

    /** Treble clef using the 𝄞 Unicode character — always renders correctly */
    _appendClef(svg, x, yOffset) {
        const text = this._svgEl('text', {
            x: x + 2,
            y: STAFF_Y1 + LINE_GAP * 5 - 12,   // Moved up to align spiral with G line
            'font-size': 86,
            'font-family': 'Times New Roman, Georgia, serif',
            'class': 'treble-clef-text',
            'text-anchor': 'start'
        });
        text.textContent = '𝄞';
        svg.appendChild(text);
    }

    _createStaffSVG(notes) {
        const W          = 420;
        const H          = 145;
        const CLEF_X     = 8;
        const NOTE_X_START = 65;
        const NOTE_X_END   = W - 12;
        const NOTE_AREA_W  = NOTE_X_END - NOTE_X_START;

        let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" xmlns="http://www.w3.org/2000/svg">`;

        // Staff lines
        for (let i = 0; i < 5; i++) {
            const y = STAFF_Y1 + i * LINE_GAP;
            svg += `<line x1="${CLEF_X}" y1="${y}" x2="${W - 8}" y2="${y}" class="staff-line"/>`;
        }

        // Treble clef — Unicode character as SVG text
        const clefY = STAFF_Y1 + LINE_GAP * 5 - 12; // Moved up to align spiral with G line
        svg += `<text x="${CLEF_X + 2}" y="${clefY}" font-size="86" font-family="Times New Roman, Georgia, serif" class="treble-clef-text">𝄞</text>`;

        // Notes
        if (notes) {
            const spacing = NOTE_AREA_W / (notes.length + 1);
            notes.forEach((n, idx) => {
                const cx = NOTE_X_START + spacing * (idx + 1);
                const cy = NOTE_Y[n];
                if (n === 'C4') {
                    svg += `<line x1="${cx - 13}" y1="${NOTE_Y['C4']}" x2="${cx + 13}" y2="${NOTE_Y['C4']}" class="ledger-line"/>`;
                }
                svg += `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="5.5" class="notehead"/>`;
                const midStaff = STAFF_Y1 + LINE_GAP * 2;
                const stemDir  = cy > midStaff ? -1 : 1;
                const stemX    = stemDir === 1 ? cx - 6 : cx + 6;
                const stemY    = cy + stemDir * 30;
                svg += `<line x1="${stemX}" y1="${cy}" x2="${stemX}" y2="${stemY}" class="note-stem"/>`;
            });
        }

        svg += `</svg>`;
        return svg;
    }

    _drawNote(svg, cx, cy, noteName, interactive = false) {
        if (noteName === 'C4') {
            svg.appendChild(this._svgEl('line', {
                x1: cx - 13, y1: NOTE_Y['C4'], x2: cx + 13, y2: NOTE_Y['C4'],
                class: 'ledger-line'
            }));
        }
        svg.appendChild(this._svgEl('ellipse', {
            cx, cy, rx: 8, ry: 6,
            class: 'notehead' + (interactive ? ' notehead-placed' : '')
        }));
        const midStaff = STAFF_Y1 + LINE_GAP * 2;
        const stemDir  = cy > midStaff ? -1 : 1;
        const stemX    = stemDir === 1 ? cx - 7 : cx + 7;
        svg.appendChild(this._svgEl('line', {
            x1: stemX, y1: cy, x2: stemX, y2: cy + stemDir * 32,
            class: 'note-stem'
        }));
    }

    _svgEl(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Audio helpers
    // ══════════════════════════════════════════════════════════════════════════
    _playCurrent()         { this._playSequence(this.currentSequence); }
    _playSequence(seq)     {
        this.synth.resume();
        this.synth.playSequence(seq.map(n => NOTES[n]), 0.45, 0.1);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Misc helpers
    // ══════════════════════════════════════════════════════════════════════════
    _randomMelody(count, minIdx = 0, maxIdx = NOTE_NAMES.length - 1) {
        const mel = [];
        let idx   = minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1));
        for (let i = 0; i < count; i++) {
            mel.push(NOTE_NAMES[idx]);
            idx += (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1);
            idx  = Math.max(minIdx, Math.min(maxIdx, idx));
        }
        return mel;
    }

    _shake(el) {
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 500);
    }
}

window.addEventListener('DOMContentLoaded', () => { new Game(); });
