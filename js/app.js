function init() {
    loadConfig();
    loadHistory();
    migrateHistory();
    // Ensure initial time is correct after load
    state.timeLeft = state.config.focus * 60;
    renderDots();
    updateDisplay();
}

// Event Listeners
settingsBtn.addEventListener('click', () => {
    if (state.isRunning) toggleTimer();
    settingsModal.classList.add('show');
});

chartBtn.addEventListener('click', () => {
    state.viewingDate = new Date();
    renderTimeline();
    activityModal.classList.add('show');
    activityNav.classList.remove('show');
    setBackSwipeModal(activityModal);
});


logBtn.addEventListener('click', () => {
    if (state.isRunning) toggleTimer();
    renderSessionLog();
    logModal.classList.add('show');
    setBackSwipeModal(logModal);
});



activityDate.addEventListener('click', () => {
    activityNav.classList.toggle('show');
    resetNavTimeout();
});

prevDayBtn.addEventListener('click', () => {
    state.viewingDate.setDate(state.viewingDate.getDate() - 1);
    renderTimeline();
    resetNavTimeout();
});

nextDayBtn.addEventListener('click', () => {
    state.viewingDate.setDate(state.viewingDate.getDate() + 1);
    renderTimeline();
    resetNavTimeout();
});

saveNoteBtn.addEventListener('click', () => {
    if (state.activeNoteDate !== null && state.activeNoteIndex !== null) {
        state.history[state.activeNoteDate][state.activeNoteIndex].note = noteInput.value;
        saveHistory();
        renderTimeline();
        noteEditor.classList.remove('show');
        clearTimeout(state.noteEditorHideTimeout);
    }
});

deleteNoteBtn.addEventListener('click', () => {
    if (state.activeNoteDate !== null && state.activeNoteIndex !== null) {
        deleteSession(state.activeNoteDate, state.activeNoteIndex);
        noteEditor.classList.remove('show');
        clearTimeout(state.noteEditorHideTimeout);
    }
});

noteEditor.addEventListener('input', resetNoteEditorTimeout);
noteEditor.addEventListener('click', resetNoteEditorTimeout);

saveBtn.addEventListener('click', () => {
    state.config = {
        focus: parseInt(focusInput.value) || 25,
        shortBreak: parseInt(shortBreakInput.value) || 5,
        longBreak: parseInt(longBreakInput.value) || 15,
        interval: parseInt(intervalInput.value) || 4,
        autoBreak: autoBreakInput.checked,
        autoFocus: autoFocusInput.checked,
        enableSound: enableSoundInput ? enableSoundInput.checked : true,
        selectedSound: soundSelectOptions.querySelector('.select-option.selected')?.dataset.value || 'audio/sound1.mp3'
    };
    saveConfig();
    settingsModal.classList.remove('show');
    restartTimer();
});

// Custom Dropdown Logic
if (soundSelectTrigger) {
    soundSelectTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        soundSelectContainer.classList.toggle('active');
    });

    Array.from(soundSelectOptions.children).forEach(option => {
        option.addEventListener('click', () => {
            const val = option.dataset.value;
            soundSelectValue.textContent = option.textContent;

            // Update selection state
            Array.from(soundSelectOptions.children).forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Update audio
            notificationSound.src = val;
            notificationSound.load();
            notificationSound.currentTime = 0;
            notificationSound.play().catch(e => console.log("Audio preview failed"));

            soundSelectContainer.classList.remove('active');
        });
    });

    // Click outside to close
    document.addEventListener('click', () => {
        soundSelectContainer.classList.remove('active');
    });
}

activityTimeline.addEventListener('click', (e) => {
    const rect = activityTimeline.getBoundingClientRect();
    let percentage = (e.clientX - rect.left) / rect.width;

    // Adjust for zoom if active
    if (activityTimeline.classList.contains('zoomed') && state.currentZoomP !== null) {
        const origin = state.currentZoomP / 100;
        percentage = (percentage - origin) / 5 + origin;
    }

    const d = new Date(state.viewingDate);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const timestamp = dayStart + (percentage * 24 * 60 * 60 * 1000);

    addPointEvent(timestamp);
});

activityChartWrapper.addEventListener('mousemove', handleTimelineZoom);
activityChartWrapper.addEventListener('mouseleave', resetZoom);

mainBtn.addEventListener('click', toggleTimer);
restartBtn.addEventListener('click', restartTimer);

testSoundBtn.addEventListener('click', () => {
    const selectedOption = soundSelectOptions.querySelector('.select-option.selected');
    if (selectedOption) {
        notificationSound.src = selectedOption.dataset.value;
        notificationSound.load();
    }
    notificationSound.currentTime = 0;
    notificationSound.play().catch(e => console.log("Audio test failed"));
});

modalOverlayClose(settingsModal, activityModal);
modalOverlayClose(activityModal, activityModal);
modalOverlayClose(logModal, activityModal);

init();
