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
        setBackSwipeModal(null);
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

// ── Back-swipe edge gesture ──────────────────────────────────────────────────
// Move the mouse close to the LEFT edge of the screen (< 80px) to reveal the
// hint. Glide all the way to ≤ 20px or off-screen to dismiss the modal with a
// satisfying slide-out animation.

const BACK_SWIPE_HINT_DIST = 80;   // px from left edge → hint appears
const BACK_SWIPE_READY_DIST = 20;   // px from left edge → highlight / "fire"

let backSwipeModal = null;     // currently-active swipeable modal
let backSwipeDismissing = false;    // guard against double-fires

const backEdgeHint = document.getElementById('backEdgeHint');

/** Register (or unregister) the currently-open swipeable modal. */
function setBackSwipeModal(modal) {
    backSwipeModal = modal;
    backSwipeDismissing = false;
    if (!modal) {
        backEdgeHint.classList.remove('visible', 'ready');
    }
}

function dismissWithSwipe() {
    if (backSwipeDismissing || !backSwipeModal) return;
    backSwipeDismissing = true;

    backEdgeHint.classList.remove('visible', 'ready');

    const inner = backSwipeModal.querySelector(
        '.log-container, .activity-container, .modal-content'
    );
    if (inner) {
        inner.classList.add('dismissing');
        inner.addEventListener('animationend', () => {
            inner.classList.remove('dismissing');
            backSwipeModal.classList.remove('show');
            noteEditor.classList.remove('show');
            activityNav.classList.remove('show');
            setBackSwipeModal(null);
        }, { once: true });
    } else {
        backSwipeModal.classList.remove('show');
        setBackSwipeModal(null);
    }
}

document.addEventListener('mousemove', (e) => {
    if (!backSwipeModal || backSwipeDismissing) return;

    const x = e.clientX;

    if (x <= 0) { dismissWithSwipe(); return; }

    if (x <= BACK_SWIPE_HINT_DIST) {
        backEdgeHint.classList.add('visible');
        backEdgeHint.classList.toggle('ready', x <= BACK_SWIPE_READY_DIST);
    } else {
        backEdgeHint.classList.remove('visible', 'ready');
    }
});

// Also catch when the pointer exits the viewport from the left
document.addEventListener('mouseleave', (e) => {
    if (!backSwipeModal || backSwipeDismissing) return;
    if (e.clientX <= 0) dismissWithSwipe();
});
