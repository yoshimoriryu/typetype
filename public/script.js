class TypingTest {
    constructor() {
        this.socket = io();
        this.currentText = '';
        this.words = [];
        this.currentWordIndex = 0;
        this.currentCharIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isTestActive = false;
        this.errors = 0;
        this.totalTyped = 0;
        this.timer = null;
        this.timeLimit = 60; // 60 seconds
        this.currentTime = this.timeLimit;
        this.typedWords = [];
        this.cursorMode = false; // false = golden highlight, true = normal cursor
        
        this.initializeElements();
        this.bindEvents();
        this.loadNewText();
    }

    initializeElements() {
        this.textDisplay = document.getElementById('textDisplay');
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
        this.cursorModeToggle = document.getElementById('cursorMode');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startTest());
        this.restartBtn.addEventListener('click', () => this.restartTest());
        this.newTextBtn.addEventListener('click', () => this.loadNewText());
        this.textDisplay.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.textDisplay.addEventListener('focus', () => this.handleFocus());
        this.textDisplay.addEventListener('blur', () => this.handleBlur());
        this.shareBtn.addEventListener('click', () => this.shareResults());
        
        // Cursor mode toggle
        this.cursorModeToggle.addEventListener('change', () => {
            this.cursorMode = this.cursorModeToggle.checked;
            this.updateCursorMode();
        });
        
        // Keyboard navigation for buttons
        this.startBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.startTest();
            }
        });
        
        this.restartBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.restartTest();
            }
        });
        
        this.newTextBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.loadNewText();
            }
        });
        
        this.shareBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.shareResults();
            }
        });
        
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

    updateCursorMode() {
        if (this.cursorMode) {
            this.textDisplay.classList.add('normal-cursor');
        } else {
            this.textDisplay.classList.remove('normal-cursor');
        }
        this.highlightCurrentWord();
    }

    async loadNewText() {
        try {
            const response = await fetch('/api/texts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const texts = await response.json();
            const randomIndex = Math.floor(Math.random() * texts.length);
            this.currentText = texts[randomIndex];
            this.words = this.currentText.split(' ');
            this.renderText();
            this.resetTest();
        } catch (error) {
            console.error('Error loading text from API:', error);
            // Fallback texts if API fails
            const fallbackTexts = [
                "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. Pangrams are often used to display font samples and test keyboards.",
                "Programming is the art of telling another human being what one wants the computer to do. It requires logical thinking and creative problem-solving skills.",
                "The internet is a global system of interconnected computer networks that use the standard Internet protocol suite to link devices worldwide.",
                "Artificial intelligence is the simulation of human intelligence in machines that are programmed to think and learn like humans.",
                "JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification. It is a language that is also characterized as dynamic, weakly typed, prototype-based and multi-paradigm.",
                "Computer science is the study of computers and computational systems. Unlike electrical and computer engineers, computer scientists deal mostly with software and software systems.",
                "Web development is the work involved in developing a website for the Internet or an intranet. Web development can range from developing a simple single static page of plain text to complex web applications.",
                "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task."
            ];
            const randomIndex = Math.floor(Math.random() * fallbackTexts.length);
            this.currentText = fallbackTexts[randomIndex];
            this.words = this.currentText.split(' ');
            this.renderText();
            this.resetTest();
        }
    }

    renderText() {
        this.textDisplay.innerHTML = '';
        this.words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.dataset.index = index;
            
            // Create character spans for each word
            word.split('').forEach((char, charIndex) => {
                const charSpan = document.createElement('span');
                charSpan.textContent = char;
                charSpan.className = 'char';
                charSpan.dataset.charIndex = charIndex;
                wordSpan.appendChild(charSpan);
            });
            
            this.textDisplay.appendChild(wordSpan);
        });
        
        // Don't highlight any word initially
        this.clearAllHighlights();
    }

    startTest() {
        // First, ensure we have a clean state before starting
        this.cleanupBeforeStart();
        
        this.isTestActive = true;
        this.startTime = new Date();
        this.currentTime = this.timeLimit;
        this.errors = 0;
        this.totalTyped = 0;
        this.currentWordIndex = 0;
        this.currentCharIndex = 0;
        this.typedWords = [];
        
        // Make text display focusable and focus it
        this.textDisplay.setAttribute('tabindex', '0');
        this.textDisplay.focus();
        this.textDisplay.classList.add('active');
        
        this.startBtn.style.display = 'none';
        this.restartBtn.style.display = 'inline-flex';
        
        this.startTimer();
        this.socket.emit('startTest', { timestamp: Date.now() });
        
        // Highlight first word
        this.highlightCurrentWord();
    }

    cleanupBeforeStart() {
        // Clear any existing timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Reset stats display
        this.wpmDisplay.textContent = '0';
        this.accuracyDisplay.textContent = '100%';
        this.timerDisplay.textContent = '60s';
        
        // Hide results container
        this.resultsContainer.style.display = 'none';
        
        // Clear all highlights
        this.clearAllHighlights();
        
        // Reset text display state
        this.textDisplay.classList.remove('active');
        this.textDisplay.removeAttribute('tabindex');
        this.textDisplay.blur();
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

    handleFocus() {
        if (this.isTestActive) {
            this.textDisplay.classList.add('active');
        }
    }

    handleBlur() {
        this.textDisplay.classList.remove('active');
    }

    handleKeydown(e) {
        if (!this.isTestActive) return;
        
        // Allow tab navigation during typing
        if (e.key === 'Tab') {
            // Don't prevent default - let tab work normally
            return;
        }
        
        e.preventDefault();
        
        if (e.key === 'Backspace') {
            this.handleBackspace();
        } else if (e.key === ' ') {
            // Only allow space if the current word is complete
            if (this.currentCharIndex >= this.words[this.currentWordIndex].length) {
                this.handleSpace();
            }
            // If word is not complete, ignore the space key
        } else if (e.key.length === 1) {
            this.handleCharacter(e.key);
        }
        
        // Update stats
        this.updateStats();
        
        // Emit progress to other users
        this.socket.emit('typingProgress', {
            progress: (this.currentWordIndex / this.words.length) * 100,
            wpm: this.calculateWPM(),
            accuracy: this.calculateAccuracy()
        });
    }

    handleCharacter(char) {
        const currentWord = this.words[this.currentWordIndex];
        
        if (this.currentCharIndex < currentWord.length) {
            this.totalTyped++;
            
            if (char === currentWord[this.currentCharIndex]) {
                // Correct character
                this.markCharCorrect(this.currentWordIndex, this.currentCharIndex);
            } else {
                // Incorrect character
                this.errors++;
                this.markCharIncorrect(this.currentWordIndex, this.currentCharIndex);
            }
            
            this.currentCharIndex++;
            
            // Update cursor position
            this.highlightCurrentWord();
            
            // Check if word is complete
            if (this.currentCharIndex >= currentWord.length) {
                this.completeWord();
            }
        }
    }

    handleBackspace() {
        if (this.currentCharIndex > 0) {
            this.currentCharIndex--;
            this.totalTyped--;
            this.unmarkChar(this.currentWordIndex, this.currentCharIndex);
            this.highlightCurrentWord();
        } else if (this.currentWordIndex > 0) {
            // Go back to previous word
            this.currentWordIndex--;
            const prevWord = this.words[this.currentWordIndex];
            this.currentCharIndex = prevWord.length;
            this.totalTyped -= prevWord.length;
            this.resetWord(this.currentWordIndex);
            this.highlightCurrentWord();
        }
    }

    handleSpace() {
        // Only complete word if it's actually complete
        if (this.currentCharIndex >= this.words[this.currentWordIndex].length) {
            this.completeWord();
        }
    }

    completeWord() {
        const currentWord = this.words[this.currentWordIndex];
        const typedWord = this.getTypedWord();
        
        // Check if word is completely correct
        if (typedWord === currentWord) {
            this.markWordCorrect(this.currentWordIndex);
        } else {
            this.markWordIncorrect(this.currentWordIndex);
        }
        
        this.typedWords.push(typedWord);
        this.currentWordIndex++;
        this.currentCharIndex = 0;
        
        if (this.currentWordIndex >= this.words.length) {
            this.endTest();
            return;
        }
        
        this.highlightCurrentWord();
    }

    getTypedWord() {
        const wordElement = this.textDisplay.querySelector(`[data-index="${this.currentWordIndex}"]`);
        if (!wordElement) return '';
        
        const chars = wordElement.querySelectorAll('.char');
        return Array.from(chars).map(char => char.textContent).join('');
    }

    markCharCorrect(wordIndex, charIndex) {
        const wordElement = this.textDisplay.querySelector(`[data-index="${wordIndex}"]`);
        if (!wordElement) return;
        
        const chars = wordElement.querySelectorAll('.char');
        if (chars[charIndex]) {
            chars[charIndex].classList.remove('incorrect');
            chars[charIndex].classList.add('correct');
        }
    }

    markCharIncorrect(wordIndex, charIndex) {
        const wordElement = this.textDisplay.querySelector(`[data-index="${wordIndex}"]`);
        if (!wordElement) return;
        
        const chars = wordElement.querySelectorAll('.char');
        if (chars[charIndex]) {
            chars[charIndex].classList.remove('correct');
            chars[charIndex].classList.add('incorrect');
        }
    }

    unmarkChar(wordIndex, charIndex) {
        const wordElement = this.textDisplay.querySelector(`[data-index="${wordIndex}"]`);
        if (!wordElement) return;
        
        const chars = wordElement.querySelectorAll('.char');
        if (chars[charIndex]) {
            chars[charIndex].classList.remove('correct', 'incorrect');
        }
    }

    resetWord(wordIndex) {
        const wordElement = this.textDisplay.querySelector(`[data-index="${wordIndex}"]`);
        if (!wordElement) return;
        
        wordElement.classList.remove('correct', 'incorrect');
        const chars = wordElement.querySelectorAll('.char');
        chars.forEach(char => {
            char.classList.remove('correct', 'incorrect');
        });
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

    clearAllHighlights() {
        // Remove current class from all words and characters
        this.textDisplay.querySelectorAll('.word').forEach(word => {
            word.classList.remove('current', 'correct', 'incorrect');
        });
        this.textDisplay.querySelectorAll('.char').forEach(char => {
            char.classList.remove('current-char', 'correct', 'incorrect');
        });
    }

    highlightCurrentWord() {
        // Remove current class from all words and characters
        this.textDisplay.querySelectorAll('.word').forEach(word => {
            word.classList.remove('current');
        });
        this.textDisplay.querySelectorAll('.char').forEach(char => {
            char.classList.remove('current-char');
        });
        
        // Add current class to current word
        if (this.currentWordIndex < this.words.length) {
            const currentWordElement = this.textDisplay.querySelector(`[data-index="${this.currentWordIndex}"]`);
            if (currentWordElement) {
                currentWordElement.classList.add('current');
                
                // In normal cursor mode, highlight the current character position
                if (this.cursorMode) {
                    // Position cursor at the end of typed characters (currentCharIndex - 1)
                    const cursorPosition = Math.max(0, this.currentCharIndex - 1);
                    if (cursorPosition < this.words[this.currentWordIndex].length) {
                        const currentCharElement = currentWordElement.querySelector(`[data-char-index="${cursorPosition}"]`);
                        if (currentCharElement) {
                            currentCharElement.classList.add('current-char');
                        }
                    }
                }
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
        this.textDisplay.classList.remove('active');
        this.textDisplay.removeAttribute('tabindex');
        this.textDisplay.blur();
        
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
        // First, completely reset everything and wait for DOM updates
        this.resetTest();
        
        // Use setTimeout to ensure DOM updates are processed before starting new test
        setTimeout(() => {
            this.startTest();
        }, 10);
    }

    resetTest() {
        this.isTestActive = false;
        this.startTime = null;
        this.endTime = null;
        this.currentWordIndex = 0;
        this.currentCharIndex = 0;
        this.errors = 0;
        this.totalTyped = 0;
        this.currentTime = this.timeLimit;
        this.typedWords = [];
        
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Reset text display
        this.textDisplay.classList.remove('active');
        this.textDisplay.removeAttribute('tabindex');
        this.textDisplay.blur();
        
        // Reset stats display
        this.wpmDisplay.textContent = '0';
        this.accuracyDisplay.textContent = '100%';
        this.timerDisplay.textContent = '60s';
        
        // Reset button states
        this.startBtn.style.display = 'inline-flex';
        this.restartBtn.style.display = 'none';
        
        // Hide results container
        this.resultsContainer.style.display = 'none';
        
        // Clear all highlights - this is crucial for the restart bug fix
        this.clearAllHighlights();
        
        // Force a re-render of the text to ensure clean state
        this.renderText();
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