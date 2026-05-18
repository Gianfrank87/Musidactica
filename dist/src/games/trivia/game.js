class TriviaGame {
    constructor() {
        this.currentLevel = null;
        this.questions = [];
        this.currentQIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        
        this.timer = null;
        this.timeLeft = 0;
        this.timeTotal = 15; // 15 seconds per question
        this.isWaiting = false;

        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen')
        };
        
        this.levelBtns = document.querySelectorAll('.level-btn');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        
        this.levelBadge = document.getElementById('level-badge');
        this.progressBadge = document.getElementById('progress-badge');
        this.scoreEl = document.getElementById('score');
        
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options-container');
        this.timerText = document.getElementById('timer-text');
        this.timerRing = document.getElementById('timer-ring');
    }

    bindEvents() {
        this.levelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(e.currentTarget.dataset.level);
                this.selectLevel(level);
            });
        });

        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.showStartScreen());

        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn && window.AudioFX) {
            muteBtn.addEventListener('click', () => {
                const isMuted = window.AudioFX.toggleMute();
                muteBtn.classList.toggle('muted', isMuted);
            });
        }
    }

    showScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[name].classList.add('active');
        
        if (name === 'game') {
            this.levelBadge.classList.remove('hidden');
            this.progressBadge.classList.remove('hidden');
        } else {
            this.levelBadge.classList.add('hidden');
            this.progressBadge.classList.add('hidden');
        }
    }

    selectLevel(level) {
        this.currentLevel = level;
        this.levelBtns.forEach(btn => btn.classList.remove('selected'));
        const selectedBtn = Array.from(this.levelBtns).find(btn => parseInt(btn.dataset.level) === level);
        if (selectedBtn) selectedBtn.classList.add('selected');
        
        this.startBtn.disabled = false;
    }

    startGame() {
        if (!this.currentLevel) return;
        
        // Setup state
        this.score = 0;
        this.correctAnswers = 0;
        this.currentQIndex = 0;
        this.updateScore(0);
        
        this.levelBadge.innerText = `Nivel ${this.currentLevel}`;
        
        // Select 10 random questions from the DB for this level
        const allQuestions = [...TRIVIA_DB[this.currentLevel]];
        this.questions = this.shuffleArray(allQuestions).slice(0, 10);
        
        this.showScreen('game');
        this.loadQuestion();
    }

    loadQuestion() {
        this.isWaiting = false;
        const q = this.questions[this.currentQIndex];
        
        this.progressBadge.innerText = `Pregunta ${this.currentQIndex + 1}/10`;
        this.questionText.innerText = q.q;
        
        // Render options
        this.optionsContainer.innerHTML = '';
        
        // We need to shuffle the options but remember the correct one
        const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.a }));
        const shuffledOptions = this.shuffleArray(optionsWithIndex);
        
        shuffledOptions.forEach(optData => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = optData.text;
            btn.dataset.correct = optData.isCorrect;
            btn.addEventListener('click', (e) => this.handleAnswer(e.currentTarget, optData.isCorrect));
            this.optionsContainer.appendChild(btn);
        });

        this.startTimer();
    }

    startTimer() {
        this.timeLeft = this.timeTotal;
        this.updateTimerVisuals();
        
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerVisuals();
            
            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    updateTimerVisuals() {
        this.timerText.innerText = this.timeLeft;
        const dashoffset = 283 - (this.timeLeft / this.timeTotal) * 283;
        this.timerRing.style.strokeDashoffset = dashoffset;
        
        if (this.timeLeft <= 5) {
            this.timerRing.classList.add('warning');
            this.timerText.style.color = '#ef4444';
        } else {
            this.timerRing.classList.remove('warning');
            this.timerText.style.color = 'var(--color-text)';
        }
    }

    stopTimer() {
        clearInterval(this.timer);
    }

    handleAnswer(selectedBtn, isCorrect) {
        if (this.isWaiting) return;
        this.isWaiting = true;
        this.stopTimer();
        
        // Disable all buttons
        const allBtns = this.optionsContainer.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.disabled = true);
        
        if (isCorrect) {
            if (window.AudioFX) window.AudioFX.playCorrect();
            selectedBtn.classList.add('correct');
            this.correctAnswers++;
            // Calculate points: 100 base + up to 50 for time
            const timeBonus = Math.floor((this.timeLeft / this.timeTotal) * 50);
            this.updateScore(100 + timeBonus);
        } else {
            if (window.AudioFX) window.AudioFX.playWrong();
            selectedBtn.classList.add('wrong');
            // Highlight the correct one
            allBtns.forEach(b => {
                if (b.dataset.correct === "true") b.classList.add('correct');
            });
        }
        
        setTimeout(() => this.nextQuestion(), 2000);
    }

    handleTimeout() {
        if (this.isWaiting) return;
        this.isWaiting = true;
        this.stopTimer();
        if (window.AudioFX) window.AudioFX.playWrong();
        
        // Disable all and highlight correct
        const allBtns = this.optionsContainer.querySelectorAll('.option-btn');
        allBtns.forEach(b => {
            b.disabled = true;
            if (b.dataset.correct === "true") b.classList.add('correct');
        });
        
        setTimeout(() => this.nextQuestion(), 2000);
    }

    nextQuestion() {
        this.currentQIndex++;
        if (this.currentQIndex >= this.questions.length) {
            this.endGame();
        } else {
            this.loadQuestion();
        }
    }

    endGame() {
        if (window.AudioFX) window.AudioFX.playWin();
        this.showScreen('result');
        const accuracy = Math.round((this.correctAnswers / 10) * 100);
        
        document.getElementById('correct-count').innerText = `${this.correctAnswers}/10`;
        document.getElementById('final-score').innerText = this.score;
        document.getElementById('accuracy-pct').innerText = `${accuracy}%`;
        
        const titleEl = document.getElementById('result-title');
        const iconEl = document.getElementById('result-icon');
        
        if (accuracy === 100) {
            titleEl.innerText = "¡Perfección Absoluta!";
            iconEl.innerText = "👑";
        } else if (accuracy >= 80) {
            titleEl.innerText = "¡Excelente Trabajo!";
            iconEl.innerText = "🌟";
        } else if (accuracy >= 50) {
            titleEl.innerText = "¡Bien Jugado!";
            iconEl.innerText = "👍";
        } else {
            titleEl.innerText = "Sigue Practicando";
            iconEl.innerText = "📚";
        }
    }

    showStartScreen() {
        this.score = 0;
        this.updateScore(0);
        this.currentLevel = null;
        this.levelBtns.forEach(btn => btn.classList.remove('selected'));
        this.startBtn.disabled = true;
        this.showScreen('start');
    }

    updateScore(points) {
        this.score += points;
        this.scoreEl.innerText = this.score;
        // Animación pequeña al puntuar
        if (points > 0) {
            this.scoreEl.style.transform = 'scale(1.3)';
            setTimeout(() => this.scoreEl.style.transform = 'scale(1)', 200);
        }
    }

    // Util: Fisher-Yates shuffle
    shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}

// Iniciar al cargar
window.addEventListener('DOMContentLoaded', () => {
    new TriviaGame();
});
