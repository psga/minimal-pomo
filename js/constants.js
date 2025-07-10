// DOM Elements
const timerDisplay = document.getElementById('timer');
const modeText = document.getElementById('modeText');
const mainBtn = document.getElementById('mainBtn');
const restartBtn = document.getElementById('restartBtn');
const controlsWrapper = document.getElementById('controlsWrapper');
const mainIcon = document.getElementById('mainIcon');
const dotsContainer = document.getElementById('dotsContainer');
const settingsBtn = document.getElementById('settingsBtn');
const chartBtn = document.getElementById('chartBtn');
const settingsModal = document.getElementById('settingsModal');
const activityModal = document.getElementById('activityModal');
const activityChartWrapper = document.querySelector('.activity-chart-wrapper');
const saveBtn = document.getElementById('saveBtn');
const logBtn = document.getElementById('logBtn');
const logModal = document.getElementById('logModal');
const logList = document.getElementById('logList');
const totalFocusSessions = document.getElementById('totalFocusSessions');

// Inputs
const focusInput = document.getElementById('focusTime');
const shortBreakInput = document.getElementById('shortBreakTime');
const longBreakInput = document.getElementById('longBreakTime');
const intervalInput = document.getElementById('longBreakInterval');
const autoBreakInput = document.getElementById('autoBreak');
const autoFocusInput = document.getElementById('autoFocus');
const enableSoundInput = document.getElementById('enableSound');
const soundSelectContainer = document.getElementById('soundSelectContainer');
const soundSelectTrigger = document.getElementById('soundSelectTrigger');
const soundSelectValue = document.getElementById('soundSelectValue');
const soundSelectOptions = document.getElementById('soundSelectOptions');
const testSoundBtn = document.getElementById('testSoundBtn');

// Audio
const notificationSound = new Audio('audio/sound1.mp3');

// Activity Elements
const activityTimeline = document.getElementById('activityTimeline');
const timelineContent = document.getElementById('timelineContent');
const activityDate = document.getElementById('activityDate');
const activityNav = document.querySelector('.activity-nav');
const prevDayBtn = document.getElementById('prevDayBtn');
const nextDayBtn = document.getElementById('nextDayBtn');
const noteEditor = document.getElementById('noteEditor');
const noteInput = document.getElementById('noteInput');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const timelineTooltip = document.getElementById('timelineTooltip');

// SVGs
const playSVG = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
const pauseSVG = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';

// Modes
const MODE_FOCUS = 'focus';
const MODE_SHORT_BREAK = 'shortBreak';
const MODE_LONG_BREAK = 'longBreak';

// Shared State Object
const state = {
    config: {
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
        interval: 4,
        autoBreak: false,
        autoFocus: false,
        selectedSound: 'audio/sound1.mp3'
    },
    currentMode: MODE_FOCUS,
    timeLeft: 25 * 60,
    timerId: null,
    isRunning: false,
    completedPomodoros: 0,
    history: {},
    currentSessionStart: null,
    viewingDate: new Date(),
    zoomEntryP: null,
    navHideTimeout: null,
    activeNoteIndex: null,
    activeNoteDate: null,
    noteEditorHideTimeout: null,
    currentZoomP: null
};
