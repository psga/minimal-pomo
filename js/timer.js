function updateDisplay() {
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (state.currentMode === MODE_FOCUS) {
        modeText.textContent = 'FOCUS';
        modeText.className = 'mode-text focus';
    } else if (state.currentMode === MODE_SHORT_BREAK) {
        modeText.textContent = 'SHORT BREAK';
        modeText.className = 'mode-text break';
    } else {
        modeText.textContent = 'LONG BREAK';
        modeText.className = 'mode-text break';
    }
}

function renderDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < state.config.interval; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i < state.completedPomodoros) dot.classList.add('completed');
        dotsContainer.appendChild(dot);
    }
}

function setInitialTimeForMode(mode) {
    if (mode === MODE_FOCUS) state.timeLeft = state.config.focus * 60;
    else if (mode === MODE_SHORT_BREAK) state.timeLeft = state.config.shortBreak * 60;
    else state.timeLeft = state.config.longBreak * 60;
}

function toggleTimer() {
    if (state.isRunning) {
        clearInterval(state.timerId);
        state.isRunning = false;
        mainIcon.innerHTML = playSVG;
        controlsWrapper.classList.add('paused');

        if (state.currentMode === MODE_FOCUS && state.currentSessionStart) {
            recordSession(state.currentSessionStart, Date.now(), 'incomplete');
            state.currentSessionStart = null;
        }
    } else {
        state.isRunning = true;
        mainIcon.innerHTML = pauseSVG;
        controlsWrapper.classList.remove('paused');

        // Prime audio for browser policy
        if (state.config.enableSound !== false && notificationSound.paused) {
            notificationSound.play().then(() => {
                notificationSound.pause();
                notificationSound.currentTime = 0;
            }).catch(() => { });
        }

        if (state.currentMode === MODE_FOCUS) {
            state.currentSessionStart = Date.now();
        }

        state.timerId = setInterval(() => {
            state.timeLeft--;
            if (state.timeLeft <= 0) handleTimerComplete();
            else updateDisplay();
        }, 1000);
    }
}

function restartTimer() {
    clearInterval(state.timerId);
    state.isRunning = false;
    mainIcon.innerHTML = playSVG;
    controlsWrapper.classList.remove('paused');

    if (state.currentMode === MODE_FOCUS && state.currentSessionStart) {
        recordSession(state.currentSessionStart, Date.now(), 'incomplete');
        state.currentSessionStart = null;
    }

    setInitialTimeForMode(state.currentMode);
    updateDisplay();
}

function handleTimerComplete() {
    document.body.classList.remove('mini-mode');
    clearInterval(state.timerId);
    state.isRunning = false;
    mainIcon.innerHTML = playSVG;
    controlsWrapper.classList.remove('paused');

    if (state.config.enableSound !== false) {
        notificationSound.play().catch(e => console.log("Audio completion play failed"));
    }

    if (state.currentMode === MODE_FOCUS) {
        if (state.currentSessionStart) {
            recordSession(state.currentSessionStart, Date.now(), 'complete');
            state.currentSessionStart = null;
        }
        state.completedPomodoros++;
        if (state.completedPomodoros >= state.config.interval) {
            state.currentMode = MODE_LONG_BREAK;
            setInitialTimeForMode(MODE_LONG_BREAK);
        } else {
            state.currentMode = MODE_SHORT_BREAK;
            setInitialTimeForMode(MODE_SHORT_BREAK);
        }
        renderDots();
        updateDisplay();
        if (state.config.autoBreak) setTimeout(toggleTimer, 800);
    } else {
        if (state.currentMode === MODE_LONG_BREAK) {
            state.completedPomodoros = 0;
            renderDots();
        }
        state.currentMode = MODE_FOCUS;
        setInitialTimeForMode(MODE_FOCUS);
        updateDisplay();
        if (state.config.autoFocus) setTimeout(toggleTimer, 800);
    }
}
