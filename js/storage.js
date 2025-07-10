function loadConfig() {
    const saved = localStorage.getItem('pomodoroConfig');
    if (saved) {
        state.config = JSON.parse(saved);
        focusInput.value = state.config.focus;
        shortBreakInput.value = state.config.shortBreak;
        longBreakInput.value = state.config.longBreak;
        intervalInput.value = state.config.interval;
        autoBreakInput.checked = !!state.config.autoBreak;
        autoFocusInput.checked = !!state.config.autoFocus;
        if (enableSoundInput) enableSoundInput.checked = state.config.enableSound !== false;

        if (soundSelectContainer && state.config.selectedSound) {
            const selectedPath = state.config.selectedSound;
            const option = Array.from(soundSelectOptions.children).find(opt => opt.dataset.value === selectedPath);
            if (option) {
                soundSelectValue.textContent = option.textContent;
                notificationSound.src = selectedPath;
                notificationSound.load();

                // Update selected class
                Array.from(soundSelectOptions.children).forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            }
        }
    }
}

function saveConfig() {
    localStorage.setItem('pomodoroConfig', JSON.stringify(state.config));
}

function loadHistory() {
    const saved = localStorage.getItem('pomodoroHistory');
    if (saved) state.history = JSON.parse(saved);
}

function saveHistory() {
    localStorage.setItem('pomodoroHistory', JSON.stringify(state.history));
}
