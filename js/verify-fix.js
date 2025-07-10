
// Mock state and saveHistory
const state = {
    history: {
        "2026-02-28": [ // UTC tomorrow (if it's 2026-02-27T22:00:00-05:00)
            { start: new Date("2026-02-27T22:00:00-05:00").getTime(), end: new Date("2026-02-27T22:25:00-05:00").getTime(), status: 'complete', note: 'test' }
        ],
        "2026-02-27": [
            { start: new Date("2026-02-27T10:00:00-05:00").getTime(), end: new Date("2026-02-27T10:25:00-05:00").getTime(), status: 'complete', note: 'morning' }
        ]
    }
};

function saveHistory() {
    console.log("History saved:", JSON.stringify(state.history, null, 2));
}

function getLocalDateString(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function migrateHistory() {
    let changed = false;
    const history = state.history || {};
    const dates = Object.keys(history);

    dates.forEach(dateStr => {
        const sessions = history[dateStr];
        if (!sessions) return;

        const sessionsToProcess = [...sessions];
        let i = sessionsToProcess.length;

        while (i--) {
            const session = sessionsToProcess[i];
            const correctDateStr = getLocalDateString(new Date(session.start));

            if (correctDateStr !== dateStr) {
                state.history[dateStr].splice(i, 1);
                if (state.history[dateStr].length === 0) {
                    delete state.history[dateStr];
                }

                if (!state.history[correctDateStr]) {
                    state.history[correctDateStr] = [];
                }
                state.history[correctDateStr].push(session);
                state.history[correctDateStr].sort((a, b) => a.start - b.start);
                changed = true;
            }
        }
    });

    if (changed) {
        saveHistory();
    }
}

console.log("Before migration:", JSON.stringify(state.history, null, 2));
migrateHistory();
console.log("After migration:", JSON.stringify(state.history, null, 2));

const expectedDate = "2026-02-27";
if (state.history[expectedDate] && state.history[expectedDate].length === 2) {
    console.log("SUCCESS: Sessions migrated correctly.");
} else {
    console.error("FAILURE: Sessions not migrated as expected.");
    process.exit(1);
}
