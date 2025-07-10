function resetNavTimeout() {
    clearTimeout(state.navHideTimeout);
    if (activityNav.classList.contains('show')) {
        state.navHideTimeout = setTimeout(() => {
            activityNav.classList.remove('show');
        }, 3000);
    }
}

function resetNoteEditorTimeout() {
    clearTimeout(state.noteEditorHideTimeout);
    if (noteEditor.classList.contains('show')) {
        state.noteEditorHideTimeout = setTimeout(() => {
            noteEditor.classList.remove('show');
        }, 3000);
    }
}

function modalOverlayClose(modal, activityModalElement) {
    modal.querySelector('.modal-content, .activity-container, .log-container').addEventListener('click', (e) => e.stopPropagation());
    modal.addEventListener('click', () => {
        modal.classList.remove('show');
        if (modal === activityModalElement) {
            noteEditor.classList.remove('show');
            activityNav.classList.remove('show');
        }
    });
}

function handleTimelineZoom(e) {
    const rect = activityTimeline.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const distY = Math.abs(mouseY - (rect.top + rect.height / 2));
    const triggerDist = 40;
    const exitDist = 100;

    const isCurrentlyZoomed = activityTimeline.classList.contains('zoomed');
    const threshold = isCurrentlyZoomed ? exitDist : triggerDist;

    if (distY < threshold) {
        const relativeX = Math.max(0, Math.min(rect.width, mouseX - rect.left));
        const pRaw = (relativeX / rect.width) * 100;

        if (!isCurrentlyZoomed) {
            state.zoomEntryP = pRaw;
            activityTimeline.classList.add('zoomed');
        }

        const sensitivity = 0.2;
        const diff = (pRaw - state.zoomEntryP) * sensitivity;
        const pFinal = Math.max(0, Math.min(100, state.zoomEntryP + diff));

        timelineContent.style.transformOrigin = `${pFinal}% center`;
        timelineContent.style.transform = 'scaleX(5)';
        state.currentZoomP = pFinal;
    } else {
        resetZoom();
    }
}

function resetZoom() {
    activityTimeline.classList.remove('zoomed');
    timelineContent.style.transform = 'none';
    state.zoomEntryP = null;
    state.currentZoomP = null;
}
