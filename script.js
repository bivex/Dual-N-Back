class DualNBackGame {
    constructor() {
        this.nBackLevel = 2;
        this.isManualMode = false;
        this.isGameRunning = false;
        this.isPaused = false;
        this.sessionsToday = 0;
        this.currentTrial = 0;
        this.sessionStartTime = 0;
        
        // These will be updated from UI elements
        this.trialInterval = 3000; // 3 seconds
        this.sessionDuration = 60000; // 60 seconds
        
        // Progress tracking
        this.progressInterval = null;
        
        // Game state
        this.positionHistory = [];
        this.wordHistory = [];
        this.currentPosition = 0;
        this.currentWord = '';
        
        // Scoring
        this.positionHits = 0;
        this.positionMisses = 0;
        this.positionFalseAlarms = 0;
        this.wordHits = 0;
        this.wordMisses = 0;
        this.wordFalseAlarms = 0;
        
        // Feedback counts
        this.positionCorrectAnswers = 0;
        this.positionIncorrectAnswers = 0;
        this.positionMissedMatches = 0;
        this.positionFalseAlarms = 0; // Already exists, but explicitly setting to 0
        this.wordCorrectAnswers = 0;
        this.wordIncorrectAnswers = 0;
        this.wordMissedMatches = 0;
        this.wordFalseAlarms = 0; // Already exists, but explicitly setting to 0
        
        // Timing tracking
        this.positionResponseTimes = [];
        this.wordResponseTimes = [];
        this.lastTrialStartTime = 0;
        
        // Audio context for letter pronunciation
        this.audioContext = null;
        this.speechSynthesis = window.speechSynthesis;
        
        this.letters = ['дом', 'кот', 'сад', 'лес', 'море', 'солнце', 'цветок', 'книга', 'машина', 'окно']; // Changed from letters to words
        this.gameMode = 'dual'; // 'single' or 'dual'
        
        this.initializeElements();
        this.bindEvents();
        this.loadSessionsToday();
        this.updateDisplay();
        this.updateSettings();
        
        // Initialize match buttons as disabled
        this.elements.positionMatchBtn.disabled = true;
        this.elements.wordMatchBtn.disabled = true;
    }
    
    initializeElements() {
        this.elements = {
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            manualBtn: document.getElementById('manual-btn'),
            levelDown: document.getElementById('level-down'),
            levelUp: document.getElementById('level-up'),
            nbackLevel: document.getElementById('nback-level'),
            gameMode: document.getElementById('game-mode'),
            sessionsToday: document.getElementById('sessions-today'),
            currentLetter: document.getElementById('current-letter'),
            positionScore: document.getElementById('position-score'),
            letterScore: document.getElementById('letter-score'),
            totalScore: document.getElementById('total-score'),
            cells: document.querySelectorAll('.cell'),
            positionMatchBtn: document.getElementById('position-match-btn'),
            wordMatchBtn: document.getElementById('word-match-btn'),
            sessionDuration: document.getElementById('session-duration'),
            trialInterval: document.getElementById('trial-interval'),
            progressFill: document.getElementById('progress-fill'),
            timeDisplay: document.getElementById('time-display'),
            positionAvgTime: document.getElementById('position-avg-time'),
            letterAvgTime: document.getElementById('letter-avg-time'),
            trialTimer: document.getElementById('trial-timer'),
            // Feedback panel elements
            positionCorrect: document.getElementById('position-correct'),
            positionIncorrect: document.getElementById('position-incorrect'),
            positionMissed: document.getElementById('position-missed'),
            positionFalseAlarm: document.getElementById('position-false-alarm'),
            letterCorrect: document.getElementById('letter-correct'),
            letterIncorrect: document.getElementById('letter-incorrect'),
            letterMissed: document.getElementById('letter-missed'),
            letterFalseAlarm: document.getElementById('letter-false-alarm')
        };
        
        // Verify all required elements exist
        const requiredElements = [
            'startBtn', 'pauseBtn', 'manualBtn', 'levelDown', 'levelUp',
            'nbackLevel', 'gameMode', 'sessionsToday', 'currentLetter',
            'positionScore', 'letterScore', 'totalScore', 'positionMatchBtn',
            'wordMatchBtn', 'sessionDuration', 'trialInterval', 'progressFill',
            'timeDisplay', 'positionAvgTime', 'letterAvgTime', 'trialTimer',
            'positionCorrect', 'positionIncorrect', 'positionMissed', 'positionFalseAlarm',
            'letterCorrect', 'letterIncorrect', 'letterMissed', 'letterFalseAlarm'
        ];
        
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                console.error(`Required element not found: ${elementName}`);
            }
        }
    }
    
    bindEvents() {
        console.log("startBtn element:", this.elements.startBtn); // Added for debugging
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.toggleGame());
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        }
        if (this.elements.manualBtn) {
            this.elements.manualBtn.addEventListener('click', () => this.toggleManualMode());
        }
        if (this.elements.levelDown) {
            this.elements.levelDown.addEventListener('click', () => this.decreaseLevel());
        }
        if (this.elements.levelUp) {
            this.elements.levelUp.addEventListener('click', () => this.increaseLevel());
        }
        
        // Match buttons
        if (this.elements.positionMatchBtn) {
            this.elements.positionMatchBtn.addEventListener('click', () => this.checkPositionMatch());
        }
        if (this.elements.wordMatchBtn) {
            this.elements.wordMatchBtn.addEventListener('click', () => this.checkWordMatch());
        }
        
        // Settings controls
        if (this.elements.sessionDuration) {
            this.elements.sessionDuration.addEventListener('change', () => this.updateSettings());
        }
        if (this.elements.trialInterval) {
            this.elements.trialInterval.addEventListener('change', () => this.updateSettings());
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // F1 and F2 keys for level control
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.decreaseLevel();
            } else if (e.key === 'F2') {
                e.preventDefault();
                this.increaseLevel();
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.isGameRunning || this.isPaused) return;
        
        switch(e.key.toLowerCase()) {
            case 'a':
                this.checkPositionMatch();
                break;
            case 'l':
                this.checkWordMatch();
                break;
            case ' ':
                e.preventDefault();
                this.toggleGame();
                break;
            case 'm':
                this.toggleManualMode();
                break;
        }
    }
    
    toggleGame() {
        if (this.isGameRunning) {
            this.stopGame();
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.isGameRunning = true;
        this.isPaused = false;
        this.sessionStartTime = Date.now();
        this.currentTrial = 0;
        
        // Reset scoring
        this.positionHits = 0;
        this.positionMisses = 0;
        this.positionFalseAlarms = 0;
        this.wordHits = 0;
        this.wordMisses = 0;
        this.wordFalseAlarms = 0;
        
        // Feedback counts
        this.positionCorrectAnswers = 0;
        this.positionIncorrectAnswers = 0;
        this.positionMissedMatches = 0;
        this.positionFalseAlarms = 0; // Already exists, but explicitly setting to 0
        this.wordCorrectAnswers = 0;
        this.wordIncorrectAnswers = 0;
        this.wordMissedMatches = 0;
        this.wordFalseAlarms = 0; // Already exists, but explicitly setting to 0
        
        // Reset timing data
        this.positionResponseTimes = [];
        this.wordResponseTimes = [];
        
        // Reset history
        this.positionHistory = [];
        this.wordHistory = [];
        
        if (this.elements.startBtn) {
            this.elements.startBtn.textContent = 'Остановить';
            this.elements.startBtn.classList.remove('primary');
            this.elements.startBtn.classList.add('secondary');
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.disabled = false;
        }
        
        // Enable match buttons
        if (this.elements.positionMatchBtn) {
            this.elements.positionMatchBtn.disabled = false;
        }
        if (this.elements.wordMatchBtn) {
            this.elements.wordMatchBtn.disabled = false;
        }

        this.updateFeedbackTable(); // Initialize feedback table
        
        // Start progress tracking
        this.progressInterval = setInterval(() => this.updateProgress(), 100);
        
        this.runTrial();
    }
    
    stopGame() {
        this.isGameRunning = false;
        this.isPaused = false;
        
        if (this.elements.startBtn) {
            this.elements.startBtn.textContent = 'Начать сессию';
            this.elements.startBtn.classList.remove('secondary');
            this.elements.startBtn.classList.add('primary');
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.disabled = true;
            this.elements.pauseBtn.textContent = 'Пауза';
        }
        
        // Stop progress tracking
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        // Clear trial timer
        this.clearTrialTimer();
        
        // Reset progress display
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = '0%';
            this.elements.progressFill.style.background = 'linear-gradient(90deg, #48bb78, #38a169)';
        }
        if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = '--:--';
            this.elements.timeDisplay.style.color = '#4a5568';
        }
        
        // Disable match buttons
        if (this.elements.positionMatchBtn) {
            this.elements.positionMatchBtn.disabled = true;
        }
        if (this.elements.wordMatchBtn) {
            this.elements.wordMatchBtn.disabled = true;
        }
        
        // Clear active cell
        this.clearActiveCell();
        if (this.elements.currentLetter) {
            this.elements.currentLetter.textContent = '-';
        }
        
        // Increment sessions today
        this.sessionsToday++;
        this.saveSessionsToday();
        this.updateDisplay();
        
        // Show final scores
        this.showFinalScores();
    }
    
    togglePause() {
        if (!this.isGameRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.elements.pauseBtn.textContent = 'Продолжить';
            this.clearActiveCell();
            this.elements.currentLetter.textContent = '-';
            // Disable match buttons during pause
            this.elements.positionMatchBtn.disabled = true;
            this.elements.wordMatchBtn.disabled = true;
            // Stop progress tracking during pause
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
            // Clear trial timer if paused
            this.clearTrialTimer();
        } else {
            this.elements.pauseBtn.textContent = 'Пауза';
            // Enable match buttons when resuming
            this.elements.positionMatchBtn.disabled = false;
            this.elements.wordMatchBtn.disabled = false;
            // Resume progress tracking
            this.progressInterval = setInterval(() => this.updateProgress(), 100);
            this.runTrial();
        }
    }
    
    toggleManualMode() {
        this.isManualMode = !this.isManualMode;
        this.elements.gameMode.textContent = this.isManualMode ? 'Ручной' : 'Автоматический';
        this.elements.manualBtn.textContent = this.isManualMode ? 'Автоматический режим' : 'Ручной режим';
        this.updateDisplay();
    }
    
    increaseLevel() {
        if (this.nBackLevel < 10) {
            this.nBackLevel++;
            this.updateDisplay();
        }
    }
    
    decreaseLevel() {
        if (this.nBackLevel > 1) {
            this.nBackLevel--;
            this.updateDisplay();
        }
    }
    
    runTrial() {
        if (!this.isGameRunning || this.isPaused) return;
        
        // Check if session time is up
        if (Date.now() - this.sessionStartTime >= this.sessionDuration) {
            this.stopGame();
            return;
        }
        
        // Increment trial counter
        this.currentTrial++;
        
        // Generate new position and word
        this.currentPosition = Math.floor(Math.random() * 9);
        this.currentWord = this.letters[Math.floor(Math.random() * this.letters.length)];
        
        // Add to history
        this.positionHistory.push(this.currentPosition);
        this.wordHistory.push(this.currentWord);
        
        // Show current trial
        this.showCurrentTrial();

        // Start the trial timer animation
        this.startTrialTimer();

        this.trialTimeout = setTimeout(() => {
            if (this.isGameRunning && !this.isPaused) {
                // Check for missed matches from the trial that just ended
                this.checkMissedMatches();
                this.runTrial();
            }
        }, this.trialInterval);
        
        // Reset flags for next trial
        this.positionMatchPressedInTrial = false;
        this.wordMatchPressedInTrial = false;
    }
    
    showCurrentTrial() {
        // Clear previous active cell
        this.clearActiveCell();
        
        // Show new position
        if (this.elements.cells && this.elements.cells[this.currentPosition]) {
            this.elements.cells[this.currentPosition].classList.add('active');
        }
        
        // Show new letter
        if (this.elements.currentLetter) {
            this.elements.currentLetter.textContent = this.currentWord;
        }
        
        // Record trial start time for response timing
        this.lastTrialStartTime = Date.now();
        
        // Speak the letter
        this.speakLetter(this.currentWord);
    }
    
    clearActiveCell() {
        if (this.elements.cells) {
            this.elements.cells.forEach(cell => {
                cell.classList.remove('active', 'match');
            });
        }
    }
    
    speakLetter(word) {
        if (this.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.7; // Slightly slower for words
            this.speechSynthesis.speak(utterance);
        }
    }
    
    checkPositionMatch() {
        if (!this.isGameRunning || this.isPaused) return;

        this.positionMatchPressedInTrial = true; // Mark that position button was pressed

        const responseTime = Date.now() - this.lastTrialStartTime;
        this.positionResponseTimes.push(responseTime);

        // Check if we have enough history to check for N-back matches
        if (this.positionHistory.length <= this.nBackLevel) {
            // Not enough history yet, this is a false alarm
            this.positionFalseAlarms++;
            this.positionIncorrectAnswers++;
            this.showMatchFeedback('position', false);
        } else {
            // Get the current trial's position and the N-back position
            const currentPosition = this.positionHistory[this.positionHistory.length - 1];
            const nBackPosition = this.positionHistory[this.positionHistory.length - 1 - this.nBackLevel];
            
            const isPositionMatch = (currentPosition === nBackPosition);

            if (isPositionMatch) {
                this.positionHits++;
                this.positionCorrectAnswers++;
                this.showMatchFeedback('position', true);
            } else {
                this.positionFalseAlarms++;
                this.positionIncorrectAnswers++; // Incorrect as it's a false alarm
                this.showMatchFeedback('position', false);
            }
        }
        this.updateFeedbackTable();
    }

    checkWordMatch() {
        if (!this.isGameRunning || this.isPaused) return;

        this.wordMatchPressedInTrial = true; // Mark that word button was pressed

        const responseTime = Date.now() - this.lastTrialStartTime;
        this.wordResponseTimes.push(responseTime);

        // Check if we have enough history to check for N-back matches
        if (this.wordHistory.length <= this.nBackLevel) {
            // Not enough history yet, this is a false alarm
            this.wordFalseAlarms++;
            this.wordIncorrectAnswers++;
            this.showMatchFeedback('word', false);
        } else {
            // Get the current trial's word and the N-back word
            const currentWord = this.wordHistory[this.wordHistory.length - 1];
            const nBackWord = this.wordHistory[this.wordHistory.length - 1 - this.nBackLevel];
            
            const isWordMatch = (currentWord === nBackWord);

            if (isWordMatch) {
                this.wordHits++;
                this.wordCorrectAnswers++;
                this.showMatchFeedback('word', true);
            } else {
                this.wordFalseAlarms++;
                this.wordIncorrectAnswers++; // Incorrect as it's a false alarm
                this.showMatchFeedback('word', false);
            }
        }
        this.updateFeedbackTable();
    }

    checkMissedMatches() {
        if (!this.isGameRunning) return;

        // Check if we have enough history to check for N-back matches
        if (this.positionHistory.length <= this.nBackLevel) return;

        // Get the current trial's position and word (the ones that just ended)
        const currentPosition = this.positionHistory[this.positionHistory.length - 1];
        const currentWord = this.wordHistory[this.wordHistory.length - 1];
        
        // Get the N-back position and word
        const nBackPosition = this.positionHistory[this.positionHistory.length - 1 - this.nBackLevel];
        const nBackWord = this.wordHistory[this.wordHistory.length - 1 - this.nBackLevel];

        // Check if there was a position match that the user missed
        if (currentPosition === nBackPosition && !this.positionMatchPressedInTrial) {
            this.positionMisses++;
            this.positionMissedMatches++;
        }

        // Check if there was a word match that the user missed
        if (currentWord === nBackWord && !this.wordMatchPressedInTrial) {
            this.wordMisses++;
            this.wordMissedMatches++;
        }

        this.updateFeedbackTable();
        this.updateScores(); // Update scores after checking for missed matches
    }
    
    showMatchFeedback(type, isCorrect = null) {
        if (type === 'position' && this.elements.cells && this.elements.cells[this.currentPosition]) {
            if (isCorrect === true) {
                this.elements.cells[this.currentPosition].classList.add('match', 'correct');
            } else if (isCorrect === false) {
                this.elements.cells[this.currentPosition].classList.add('match', 'incorrect');
            } else {
                this.elements.cells[this.currentPosition].classList.add('match');
            }
        }
        // Letter feedback is shown by the letter display
    }
    
    updateScores() {
        const positionAccuracy = this.calculateAccuracy(this.positionHits, this.positionMisses, this.positionFalseAlarms);
        const wordAccuracy = this.calculateAccuracy(this.wordHits, this.wordMisses, this.wordFalseAlarms);
        const totalAccuracy = (positionAccuracy + wordAccuracy) / 2;
        
        if (this.elements.positionScore) {
            this.elements.positionScore.textContent = `${Math.round(positionAccuracy)}%`;
        }
        if (this.elements.letterScore) {
            this.elements.letterScore.textContent = `${Math.round(wordAccuracy)}%`;
        }
        if (this.elements.totalScore) {
            this.elements.totalScore.textContent = `${Math.round(totalAccuracy)}%`;
        }
        
        // Update response time displays
        this.updateResponseTimes();
    }
    
    updateResponseTimes() {
        // Calculate average response times
        const positionAvgTime = this.positionResponseTimes.length > 0 
            ? this.positionResponseTimes.reduce((a, b) => a + b, 0) / this.positionResponseTimes.length 
            : 0;
        const wordAvgTime = this.wordResponseTimes.length > 0 
            ? this.wordResponseTimes.reduce((a, b) => a + b, 0) / this.wordResponseTimes.length 
            : 0;
        
        // Update displays
        if (this.elements.positionAvgTime) {
            this.elements.positionAvgTime.textContent = positionAvgTime > 0 
                ? `${Math.round(positionAvgTime)}мс` 
                : '--';
        }
        if (this.elements.letterAvgTime) {
            this.elements.letterAvgTime.textContent = wordAvgTime > 0 
                ? `${Math.round(wordAvgTime)}мс` 
                : '--';
        }
    }
    
    calculateAccuracy(hits, misses, falseAlarms) {
        const totalResponses = hits + misses + falseAlarms;
        
        if (totalResponses === 0) return 0;
        
        // Простой расчет точности: правильные ответы / общее количество ответов
        const correctResponses = hits;
        const accuracy = (correctResponses / totalResponses) * 100;
        
        return Math.max(0, Math.min(100, accuracy));
    }
    
    showFinalScores() {
        const positionAccuracy = this.calculateAccuracy(this.positionHits, this.positionMisses, this.positionFalseAlarms);
        const wordAccuracy = this.calculateAccuracy(this.wordHits, this.wordMisses, this.wordFalseAlarms);
        const totalAccuracy = (positionAccuracy + wordAccuracy) / 2;
        
        // Calculate average response times
        const positionAvgTime = this.positionResponseTimes.length > 0 
            ? this.positionResponseTimes.reduce((a, b) => a + b, 0) / this.positionResponseTimes.length 
            : 0;
        const wordAvgTime = this.wordResponseTimes.length > 0 
            ? this.wordResponseTimes.reduce((a, b) => a + b, 0) / this.wordResponseTimes.length 
            : 0;
        
        alert(`Сессия завершена!\n\nТочность позиции: ${Math.round(positionAccuracy)}%\nТочность слова: ${Math.round(wordAccuracy)}%\nОбщая точность: ${Math.round(totalAccuracy)}%\n\nСреднее время ответа (позиция): ${Math.round(positionAvgTime)}мс\nСреднее время ответа (слово): ${Math.round(wordAvgTime)}мс\n\nСессий сегодня: ${this.sessionsToday}`);
        
        // Auto-adjust level if not in manual mode
        if (!this.isManualMode) {
            this.autoAdjustLevel(totalAccuracy);
        }
    }
    
    autoAdjustLevel(accuracy) {
        if (accuracy >= 80 && this.nBackLevel < 10) {
            this.nBackLevel++;
            alert(`Отличная работа! Уровень повышен до ${this.nBackLevel}-Back`);
        } else if (accuracy < 60 && this.nBackLevel > 1) {
            this.nBackLevel--;
            alert(`Уровень понижен до ${this.nBackLevel}-Back для лучшего обучения`);
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        if (this.elements.nbackLevel) {
            this.elements.nbackLevel.textContent = this.nBackLevel;
        }
        if (this.elements.sessionsToday) {
            this.elements.sessionsToday.textContent = this.sessionsToday;
        }
    }
    
    updateSettings() {
        // Update session duration (convert seconds to milliseconds)
        if (this.elements.sessionDuration) {
            this.sessionDuration = parseInt(this.elements.sessionDuration.value) * 1000;
        }
        
        // Update trial interval (already in milliseconds)
        if (this.elements.trialInterval) {
            this.trialInterval = parseInt(this.elements.trialInterval.value);
        }
    }
    
    updateProgress() {
        if (!this.isGameRunning || this.isPaused) return;
        
        const elapsed = Date.now() - this.sessionStartTime;
        const remaining = this.sessionDuration - elapsed;
        
        if (remaining <= 0) {
            this.stopGame();
            return;
        }
        
        // Update progress bar
        const progressPercent = (elapsed / this.sessionDuration) * 100;
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${Math.min(100, progressPercent)}%`;
        }
        
        // Update time display
        const remainingSeconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Change color when time is running out
        if (remainingSeconds <= 10) {
            if (this.elements.progressFill) {
                this.elements.progressFill.style.background = 'linear-gradient(90deg, #e53e3e, #c53030)';
            }
            if (this.elements.timeDisplay) {
                this.elements.timeDisplay.style.color = '#e53e3e';
            }
        } else if (remainingSeconds <= 30) {
            if (this.elements.progressFill) {
                this.elements.progressFill.style.background = 'linear-gradient(90deg, #ed8936, #dd6b20)';
            }
            if (this.elements.timeDisplay) {
                this.elements.timeDisplay.style.color = '#ed8936';
            }
        } else {
            if (this.elements.progressFill) {
                this.elements.progressFill.style.background = 'linear-gradient(90deg, #48bb78, #38a169)';
            }
            if (this.elements.timeDisplay) {
                this.elements.timeDisplay.style.color = '#4a5568';
            }
        }
    }
    
    loadSessionsToday() {
        const saved = localStorage.getItem('nbackSessionsToday');
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('nbackSessionsDate');
        
        if (savedDate === today) {
            this.sessionsToday = parseInt(saved) || 0;
        } else {
            this.sessionsToday = 0;
        }
    }
    
    saveSessionsToday() {
        localStorage.setItem('nbackSessionsToday', this.sessionsToday.toString());
        localStorage.setItem('nbackSessionsDate', new Date().toDateString());
    }

    startTrialTimer() {
        if (!this.elements.trialTimer) return;

        // Clear any existing animation
        this.elements.trialTimer.style.transition = 'none';
        this.elements.trialTimer.style.width = '100%';
        this.elements.trialTimer.offsetHeight; // Trigger reflow
        
        // Start the animation
        this.elements.trialTimer.style.transition = `width ${this.trialInterval / 1000}s linear`;
        this.elements.trialTimer.style.width = '0%';
    }

    clearTrialTimer() {
        if (!this.elements.trialTimer) return;
        this.elements.trialTimer.style.transition = 'none';
        this.elements.trialTimer.style.width = '0%';
    }

    updateFeedbackTable() {
        if (this.elements.positionCorrect) {
            this.elements.positionCorrect.textContent = this.positionCorrectAnswers;
        }
        if (this.elements.positionIncorrect) {
            this.elements.positionIncorrect.textContent = this.positionIncorrectAnswers;
        }
        if (this.elements.positionMissed) {
            this.elements.positionMissed.textContent = this.positionMissedMatches;
        }
        if (this.elements.positionFalseAlarm) {
            this.elements.positionFalseAlarm.textContent = this.positionFalseAlarms;
        }
        if (this.elements.letterCorrect) {
            this.elements.letterCorrect.textContent = this.wordCorrectAnswers;
        }
        if (this.elements.letterIncorrect) {
            this.elements.letterIncorrect.textContent = this.wordIncorrectAnswers;
        }
        if (this.elements.letterMissed) {
            this.elements.letterMissed.textContent = this.wordMissedMatches;
        }
        if (this.elements.letterFalseAlarm) {
            this.elements.letterFalseAlarm.textContent = this.wordFalseAlarms;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new DualNBackGame();
}); 
