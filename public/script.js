class TypingTest {
    constructor() {
        this.socket = io();
        this.currentText = '';
        this.words = [];
        this.currentWordIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isTestActive = false;
        this.errors = 0;
        this.totalTyped = 0;
        this.timer = null;
        this.timeLimit = 60; // 60 seconds
        this.currentTime = this.timeLimit;
        
        this.initializeElements();
        this.bindEvents();
        this.loadNewText();
    }

    initializeElements() {
        this.textDisplay = document.getElementById('textDisplay');
        this.textInput = document.getElementById('textInput');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.newTextBtn = document.getElementById('newTextBtn');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.timerDisplay = document.getElementById('timer');
        this.finalWpm = document.getElementById('finalWpm');
        this.finalAccuracy = document.getElementById('finalAccuracy');
        this.finalTime = document.getElementById('finalTime');
        this.finalErrors = document.getElementById('finalErrors');
        this.shareBtn = document.getElementById('shareBtn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startTest());
        this.restartBtn.addEventListener('click', () => this.restartTest());
        this.newTextBtn.addEventListener('click', () => this.loadNewText());
        this.textInput.addEventListener('input', (e) => this.handleInput(e));
        this.textInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.shareBtn.addEventListener('click', () => this.shareResults());
        
        // Socket events
        this.socket.on('userStartedTest', (data) => {
            console.log('Another user started a test');
        });
        
        this.socket.on('userTypingProgress', (data) => {
            console.log('Another user typing progress:', data);
        });
        
        this.socket.on('userTestComplete', (data) => {
            console.log('Another user completed test:', data);
        });
    }

    async loadNewText() {
        try {
            const response = await fetch('/api/texts');
            const texts = await response.json();
            const randomIndex = Math.floor(Math.random() * texts.length);
            this.currentText = texts[randomIndex];
            this.words = this.currentText.split(' ');
            this.renderText();
            this.resetTest();
        } catch (error) {
            console.error('Error loading text:', error);
            this.currentText = 'The quick brown fox jumps over the lazy dog. This is a sample text for typing practice.';
            this.words = this.currentText.split(' ');
            this.renderText();
        }
    }

    renderText() {
        this.textDisplay.innerHTML = '';
        this.words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word;
            wordSpan.className = 'word';
            wordSpan.dataset.index = index;
            this.textDisplay.appendChild(wordSpan);
        });
    }

    startTest() {
        this.isTestActive = true;
        this.startTime = new Date();
        this.currentTime = this.timeLimit;
        this.errors = 0;
        this.totalTyped = 0;
        this.currentWordIndex = 0;
        
        this.textInput.disabled = false;
        this.textInput.focus();
        this.textInput.value = '';
        
        this.startBtn.style.display = 'none';
        this.restartBtn.style.display = 'inline-flex';
        
        this.startTimer();
        this.socket.emit('startTest', { timestamp: Date.now() });
        
        // Highlight first word
        this.highlightCurrentWord();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.currentTime--;
            this.timerDisplay.textContent = `${this.currentTime}s`;
            
            if (this.currentTime <= 0) {
                this.endTest();
            }
        }, 1000);
    }

    handleInput(e) {
        if (!this.isTestActive) return;
        
        const input = e.target.value;
        this.totalTyped = input.length;
        
        // Calculate current WPM and accuracy
        this.updateStats();
        
        // Emit progress to other users
        this.socket.emit('typingProgress', {
            progress: (this.currentWordIndex / this.words.length) * 100,
            wpm: this.calculateWPM(),
            accuracy: this.calculateAccuracy()
        });
    }

    handleKeydown(e) {
        if (!this.isTestActive) return;
        
        if (e.key === ' ') {
            e.preventDefault();
            this.checkWord();
        }
    }

    checkWord() {
        const input = this.textInput.value.trim();
        const currentWord = this.words[this.currentWordIndex];
        
        if (input === currentWord) {
            // Correct word
            this.markWordCorrect(this.currentWordIndex);
            this.currentWordIndex++;
            
            if (this.currentWordIndex >= this.words.length) {
                this.endTest();
                return;
            }
        } else {
            // Incorrect word
            this.errors++;
            this.markWordIncorrect(this.currentWordIndex);
        }
        
        this.textInput.value = '';
        this.highlightCurrentWord();
    }

    markWordCorrect(index) {
        const wordElement = this.textDisplay.querySelector(`[data-index="${index}"]`);
        if (wordElement) {
            wordElement.classList.remove('current', 'incorrect');
            wordElement.classList.add('correct');
        }
    }

    markWordIncorrect(index) {
        const wordElement = this.textDisplay.querySelector(`[data-index="${index}"]`);
        if (wordElement) {
            wordElement.classList.remove('current', 'correct');
            wordElement.classList.add('incorrect');
        }
    }

    highlightCurrentWord() {
        // Remove current class from all words
        this.textDisplay.querySelectorAll('.word').forEach(word => {
            word.classList.remove('current');
        });
        
        // Add current class to current word
        if (this.currentWordIndex < this.words.length) {
            const currentWordElement = this.textDisplay.querySelector(`[data-index="${this.currentWordIndex}"]`);
            if (currentWordElement) {
                currentWordElement.classList.add('current');
            }
        }
    }

    updateStats() {
        const wpm = this.calculateWPM();
        const accuracy = this.calculateAccuracy();
        
        this.wpmDisplay.textContent = Math.round(wpm);
        this.accuracyDisplay.textContent = `${Math.round(accuracy)}%`;
    }

    calculateWPM() {
        if (!this.startTime) return 0;
        
        const elapsedMinutes = (new Date() - this.startTime) / 60000;
        const wordsTyped = this.currentWordIndex;
        
        return elapsedMinutes > 0 ? wordsTyped / elapsedMinutes : 0;
    }

    calculateAccuracy() {
        if (this.totalTyped === 0) return 100;
        
        const correctChars = this.totalTyped - this.errors;
        return (correctChars / this.totalTyped) * 100;
    }

    endTest() {
        this.isTestActive = false;
        this.endTime = new Date();
        
        clearInterval(this.timer);
        this.textInput.disabled = true;
        
        this.startBtn.style.display = 'inline-flex';
        this.restartBtn.style.display = 'none';
        
        this.showResults();
        
        // Emit test completion
        this.socket.emit('testComplete', {
            results: {
                wpm: this.calculateWPM(),
                accuracy: this.calculateAccuracy(),
                time: this.timeLimit - this.currentTime,
                errors: this.errors
            }
        });
    }

    showResults() {
        const finalWpm = Math.round(this.calculateWPM());
        const finalAccuracy = Math.round(this.calculateAccuracy());
        const finalTime = this.timeLimit - this.currentTime;
        
        this.finalWpm.textContent = finalWpm;
        this.finalAccuracy.textContent = `${finalAccuracy}%`;
        this.finalTime.textContent = `${finalTime}s`;
        this.finalErrors.textContent = this.errors;
        
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    restartTest() {
        this.resetTest();
        this.startTest();
    }

    resetTest() {
        this.isTestActive = false;
        this.startTime = null;
        this.endTime = null;
        this.currentWordIndex = 0;
        this.errors = 0;
        this.totalTyped = 0;
        this.currentTime = this.timeLimit;
        
        clearInterval(this.timer);
        
        this.textInput.disabled = true;
        this.textInput.value = '';
        
        this.wpmDisplay.textContent = '0';
        this.accuracyDisplay.textContent = '100%';
        this.timerDisplay.textContent = '60s';
        
        this.startBtn.style.display = 'inline-flex';
        this.restartBtn.style.display = 'none';
        this.resultsContainer.style.display = 'none';
        
        // Reset word highlighting
        this.textDisplay.querySelectorAll('.word').forEach(word => {
            word.classList.remove('current', 'correct', 'incorrect');
        });
    }

    shareResults() {
        const finalWpm = Math.round(this.calculateWPM());
        const finalAccuracy = Math.round(this.calculateAccuracy());
        const finalTime = this.timeLimit - this.currentTime;
        
        const shareText = `I just achieved ${finalWpm} WPM with ${finalAccuracy}% accuracy in ${finalTime} seconds on TypeType! 🚀`;
        
        if (navigator.share) {
            navigator.share({
                title: 'TypeType Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Results copied to clipboard!');
            }).catch(() => {
                prompt('Copy these results:', shareText);
            });
        }
    }
}

// Initialize the typing test when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TypingTest();
});

// Add some fun keyboard sound effects (optional)
document.addEventListener('keydown', (e) => {
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
        // You could add sound effects here
        // playKeySound();
    }
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 