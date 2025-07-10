function getLocalDateString(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function recordSession(start, end, status) {
    const today = getLocalDateString(new Date(start));
    if (!state.history[today]) state.history[today] = [];
    state.history[today].push({ start, end, status, note: '' });
    saveHistory();
}

function addPointEvent(timestamp) {
    const dateStr = getLocalDateString(new Date(timestamp));
    if (!state.history[dateStr]) state.history[dateStr] = [];

    const newIndex = state.history[dateStr].length;
    state.history[dateStr].push({
        start: timestamp,
        end: timestamp,
        status: 'point',
        note: ''
    });

    saveHistory();
    renderTimeline();
    openNoteEditor(dateStr, newIndex);
}

function renderTimeline() {
    const todayStr = getLocalDateString(state.viewingDate);
    activityDate.textContent = (todayStr === getLocalDateString()) ? 'Today' : todayStr;

    // Clear segments (keep bar)
    const existingSegments = activityTimeline.querySelectorAll('.session-segment');
    existingSegments.forEach(s => s.remove());

    const daySessions = state.history[todayStr] || [];
    const d = new Date(state.viewingDate);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    daySessions.forEach((session, index) => {
        const isPoint = session.status === 'point' || session.start === session.end;

        // Clamp to current day
        const s = Math.max(session.start, dayStart);
        const e = Math.min(session.end, dayEnd);

        if (e < s) return;
        if (!isPoint && e === s) return;

        const left = ((s - dayStart) / (24 * 60 * 1000 * 60)) * 100;
        const width = isPoint ? 0 : ((e - s) / (24 * 60 * 1000 * 60)) * 100;

        const segment = document.createElement('div');
        segment.className = `session-segment ${session.status} ${isPoint ? 'session-point' : ''}`;
        segment.style.left = `${left}%`;
        if (!isPoint) {
            segment.style.width = `${width}%`;
        }

        segment.title = isPoint ?
            `${new Date(session.start).toLocaleTimeString()}${session.note ? ': ' + session.note : ''}` :
            `${new Date(session.start).toLocaleTimeString()} - ${new Date(session.end).toLocaleTimeString()}${session.note ? ': ' + session.note : ''}`;

        segment.addEventListener('click', (e) => {
            e.stopPropagation();
            openNoteEditor(todayStr, index);
        });

        segment.addEventListener('mouseenter', () => {
            if (!activityTimeline.classList.contains('zoomed')) return;

            const noteText = session.note || 'Focus';
            const timeText = isPoint ?
                new Date(session.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                `${new Date(session.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(session.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            timelineTooltip.querySelector('.tooltip-note').textContent = noteText;
            timelineTooltip.querySelector('.tooltip-time').textContent = timeText;

            // Positioning
            const segmentRect = segment.getBoundingClientRect();
            const wrapperRect = activityChartWrapper.getBoundingClientRect();

            const left = segmentRect.left - wrapperRect.left + segmentRect.width / 2;
            const top = segmentRect.top - wrapperRect.top;

            timelineTooltip.style.left = `${left}px`;
            timelineTooltip.style.top = `${top}px`;
            timelineTooltip.classList.add('show');
        });

        segment.addEventListener('mouseleave', () => {
            timelineTooltip.classList.remove('show');
        });

        timelineContent.appendChild(segment);
    });
}

function openNoteEditor(dateStr, index) {
    state.activeNoteDate = dateStr;
    state.activeNoteIndex = index;
    const session = state.history[dateStr][index];
    noteInput.value = session.note || '';
    noteEditor.classList.add('show');
    resetNoteEditorTimeout();
}

function renderSessionLog() {
    logList.innerHTML = '';
    const history = state.history || {};
    const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
    let totalCount = 0;

    sortedDates.forEach(dateStr => {
        const sessions = history[dateStr];
        if (!sessions || sessions.length === 0) return;

        const dayGroup = document.createElement('div');
        dayGroup.className = 'log-day';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'log-day-header';
        dayHeader.textContent = dateStr;
        dayGroup.appendChild(dayHeader);

        sessions.forEach((session, index) => {
            totalCount++;
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.title = 'Click to edit note';

            const time = document.createElement('div');
            time.className = 'log-entry-time';
            time.textContent = `${new Date(session.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(session.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            const noteText = document.createElement('div');
            noteText.className = 'log-entry-note';
            noteText.textContent = session.note || 'Focus';

            const status = document.createElement('div');
            status.className = `log-entry-status ${session.status}`;
            status.textContent = session.status === 'complete' ? 'Completed' : 'Incomplete';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'log-delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = 'Delete session';

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSession(dateStr, index);
            });

            entry.appendChild(time);
            entry.appendChild(noteText);
            entry.appendChild(status);
            entry.appendChild(deleteBtn);

            entry.addEventListener('click', () => {
                logModal.classList.remove('show');
                openNoteEditor(dateStr, index);
            });

            dayGroup.appendChild(entry);
        });

        logList.appendChild(dayGroup);
    });

    totalFocusSessions.textContent = `${totalCount} Session${totalCount !== 1 ? 's' : ''}`;
}

function deleteSession(dateStr, index) {
    if (state.history[dateStr]) {
        state.history[dateStr].splice(index, 1);
        if (state.history[dateStr].length === 0) {
            delete state.history[dateStr];
        }
        saveHistory();
        renderTimeline();
        renderSessionLog();
    }
}

function migrateHistory() {
    let changed = false;
    const history = state.history || {};
    const dates = Object.keys(history);

    dates.forEach(dateStr => {
        const sessions = history[dateStr];
        if (!sessions) return;

        // Create a copy of sessions to iterate
        const sessionsToProcess = [...sessions];
        let i = sessionsToProcess.length;

        while (i--) {
            const session = sessionsToProcess[i];
            const correctDateStr = getLocalDateString(new Date(session.start));

            if (correctDateStr !== dateStr) {
                // Remove from old date
                state.history[dateStr].splice(i, 1);
                if (state.history[dateStr].length === 0) {
                    delete state.history[dateStr];
                }

                // Add to correct date
                if (!state.history[correctDateStr]) {
                    state.history[correctDateStr] = [];
                }
                state.history[correctDateStr].push(session);

                // Sort by start time
                state.history[correctDateStr].sort((a, b) => a.start - b.start);
                changed = true;
            }
        }
    });

    if (changed) {
        saveHistory();
    }
}
