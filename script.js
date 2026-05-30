(() => {
    const STORAGE_KEY = "prodigy-pulse-v1";
    const DAY_MS = 24 * 60 * 60 * 1000;

    const defaultState = {
        theme: { mode: "dark", accent: "#68d5ff" },
        stopwatch: { running: false, elapsed: 0, startedAt: null, laps: [] },
        pomodoro: {
            work: 25,
            shortBreak: 5,
            longBreak: 15,
            mode: "work",
            running: false,
            remainingMs: 25 * 60 * 1000,
            endsAt: null,
            cycle: 1,
            sessionsToday: 0,
            history: {},
            linkedTaskId: ""
        },
        countdowns: [],
        alarms: [],
        focusSessions: [],
        tasks: [],
        habits: [],
        goals: [],
        journal: {},
        settings: { notifications: false },
        gamification: { xp: 0, level: 1 },
        ui: { search: "", selectedHabitId: "" }
    };

    const appShell = `
        <div class="page-shell">
            <aside class="sidebar">
                <div class="brand-block">
                  
                    <div>
                        <p class="eyebrow">Productivity OS</p>
                        <h1>Prodigy Pulse</h1>
                    </div>
                </div>
                <p class="sidebar-copy">An all-in-one productivity dashboard with timers, planning tools, habits, analytics, and gamification.</p>
                <nav class="quick-nav" aria-label="Section navigation">
                    <button data-scroll="overview">Overview</button>
                    <button data-scroll="timers">Timers</button>
                    <button data-scroll="tasks">Tasks</button>
                    <button data-scroll="habits">Habits</button>
                    <button data-scroll="analytics">Analytics</button>
                </nav>
                <div class="sidebar-stack">
                    <div class="status-card">
                        <span class="status-label">Rank</span>
                        <strong id="rankLabel">Starter</strong>
                        <small id="rankHint">Build momentum to unlock the next tier.</small>
                    </div>
                    <div class="status-card accent">
                        <span class="status-label">Next badge</span>
                        <strong id="badgeHint">First Sprint</strong>
                        <small id="badgeProgress">Complete a focused session to unlock it.</small>
                    </div>
                </div>
                <div class="sidebar-actions">
                    <button class="ghost-button" id="helpButton">Shortcuts</button>
                    <button class="ghost-button" id="installButton">Install App</button>
                </div>
            </aside>

            <main class="main-shell">
                <header class="topbar">
                    <div>
                        <p class="eyebrow">Dashboard</p>
                        <h2>Build flow, track progress, and review your day.</h2>
                    </div>
                    <div class="topbar-controls">
                        <label class="search-shell" for="searchInput">
                            <span>Search</span>
                            <input id="searchInput" type="search" placeholder="Search tasks, notes, habits, sessions...">
                        </label>
                        <select id="themeMode" aria-label="Theme mode">
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                        <select id="accentTone" aria-label="Accent tone">
                            <option value="#68d5ff">Cyan</option>
                            <option value="#7c5cff">Violet</option>
                            <option value="#35d07f">Mint</option>
                            <option value="#ff9a62">Sunset</option>
                        </select>
                        <button class="primary-button" id="notifyButton">Enable Alerts</button>
                        <button class="ghost-button" id="exportButton">Export</button>
                        <button class="ghost-button" id="importButton">Import</button>
                        <button class="ghost-button danger" id="resetButton">Reset</button>
                    </div>
                    <input type="file" id="importInput" accept="application/json" hidden>
                </header>

                <section class="hero-grid" id="overview">
                    <article class="hero-card spotlight">
                        <div class="hero-copy">
                            <p class="eyebrow">Today at a glance</p>
                            <h3>One workspace for deep work, planning, and review.</h3>
                            <p>Track stopwatch sessions, Pomodoros, countdowns, alarms, habits, goals, and journal entries in one clean interface.</p>
                        </div>
                        <div class="hero-metrics" id="overviewMetrics"></div>
                    </article>
                    <article class="hero-card insight-card">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">AI-inspired insights</p>
                                <h3>Smart suggestions</h3>
                            </div>
                            <span class="pill">Local analysis</span>
                        </div>
                        <ul class="insight-list" id="insightList"></ul>
                    </article>
                </section>

                <section class="panel-grid" id="timers">
                    <article class="panel timer-panel">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Advanced stopwatch</p>
                                <h3>Focus stopwatch</h3>
                            </div>
                            <div class="card-actions">
                                <button class="ghost-button" id="focusModeButton">Focus mode</button>
                                <button class="ghost-button" id="exportLapsButton">Export laps</button>
                            </div>
                        </div>
                        <div class="timer-display" id="stopwatchDisplay" aria-live="polite">00:00:00.000</div>
                        <div class="button-row">
                            <button class="primary-button" id="stopwatchToggle">Start</button>
                            <button class="ghost-button" id="stopwatchLap">Lap</button>
                            <button class="ghost-button" id="stopwatchReset">Reset</button>
                            <button class="ghost-button" id="logFocusButton">Log session</button>
                        </div>
                        <div class="mini-stats" id="stopwatchStats"></div>
                        <div class="section-divider"></div>
                        <div class="list-shell">
                            <div class="list-shell-head">
                                <h4>Lap history</h4>
                                <button class="ghost-button small" id="clearLapsButton">Clear all</button>
                            </div>
                            <ul class="record-list" id="lapList"></ul>
                        </div>
                    </article>

                    <article class="panel timer-panel">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Pomodoro timer</p>
                                <h3>Work, break, repeat</h3>
                            </div>
                            <span class="pill" id="pomodoroCycleLabel">Cycle 1</span>
                        </div>
                        <div class="timer-display compact" id="pomodoroDisplay" aria-live="polite">25:00</div>
                        <div class="button-row">
                            <button class="primary-button" id="pomodoroToggle">Start</button>
                            <button class="ghost-button" id="pomodoroSkip">Skip</button>
                            <button class="ghost-button" id="pomodoroReset">Reset</button>
                        </div>
                        <div class="timer-settings">
                            <label>Work <input id="workLength" type="number" min="5" max="180" step="5"></label>
                            <label>Short break <input id="shortBreakLength" type="number" min="1" max="60" step="1"></label>
                            <label>Long break <input id="longBreakLength" type="number" min="5" max="120" step="5"></label>
                            <label>Link task
                                <select id="pomodoroTaskLink"></select>
                            </label>
                        </div>
                        <div class="mini-stats" id="pomodoroStats"></div>
                    </article>

                    <article class="panel timer-panel">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Countdown timers</p>
                                <h3>Multiple countdowns</h3>
                            </div>
                            <span class="pill">Templates ready</span>
                        </div>
                        <form id="countdownForm" class="stack-form">
                            <label>Label <input id="countdownLabel" type="text" placeholder="Tea break"></label>
                            <div class="inline-fields">
                                <label>Minutes <input id="countdownMinutes" type="number" min="1" value="15"></label>
                                <label>Template
                                    <select id="countdownPreset">
                                        <option value="custom">Custom</option>
                                        <option value="focus">Deep work</option>
                                        <option value="break">Break</option>
                                        <option value="presentation">Presentation</option>
                                    </select>
                                </label>
                            </div>
                            <button class="primary-button" type="submit">Add countdown</button>
                        </form>
                        <div class="list-shell">
                            <div class="list-shell-head">
                                <h4>Active timers</h4>
                            </div>
                            <ul class="record-list" id="countdownList"></ul>
                        </div>
                    </article>

                    <article class="panel timer-panel">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Alarm system</p>
                                <h3>Recurring alarms</h3>
                            </div>
                            <span class="pill">Snooze supported</span>
                        </div>
                        <form id="alarmForm" class="stack-form">
                            <label>Label <input id="alarmLabel" type="text" placeholder="Morning review"></label>
                            <div class="inline-fields">
                                <label>Time <input id="alarmTime" type="time"></label>
                                <label>Repeat days
                                    <select id="alarmRepeat" multiple size="4">
                                        <option value="0">Sun</option>
                                        <option value="1">Mon</option>
                                        <option value="2">Tue</option>
                                        <option value="3">Wed</option>
                                        <option value="4">Thu</option>
                                        <option value="5">Fri</option>
                                        <option value="6">Sat</option>
                                    </select>
                                </label>
                            </div>
                            <label>Sound
                                <select id="alarmSound">
                                    <option value="soft">Soft chime</option>
                                    <option value="bright">Bright ping</option>
                                    <option value="deep">Deep tone</option>
                                </select>
                            </label>
                            <button class="primary-button" type="submit">Add alarm</button>
                        </form>
                        <div class="list-shell">
                            <div class="list-shell-head">
                                <h4>Alarm list</h4>
                            </div>
                            <ul class="record-list" id="alarmList"></ul>
                        </div>
                    </article>
                </section>

                <section class="panel-grid" id="productivity">
                    <article class="panel" id="tasks">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Task management</p>
                                <h3>Tasks and priorities</h3>
                            </div>
                            <span class="pill">Drag to reorder</span>
                        </div>
                        <form id="taskForm" class="stack-form">
                            <label>Task <input id="taskTitle" type="text" placeholder="Finish project case study"></label>
                            <div class="inline-fields">
                                <label>Priority
                                    <select id="taskPriority">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </label>
                                <label>Due date <input id="taskDue" type="date"></label>
                            </div>
                            <label>Pomodoro target <input id="taskPomodoros" type="number" min="0" value="0"></label>
                            <button class="primary-button" type="submit">Add task</button>
                        </form>
                        <div class="list-shell"><ul class="record-list drag-list" id="taskList"></ul></div>
                    </article>

                    <article class="panel" id="habits">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Habit tracker</p>
                                <h3>Daily consistency</h3>
                            </div>
                            <span class="pill" id="habitCompletion">0% complete</span>
                        </div>
                        <form id="habitForm" class="stack-form">
                            <label>Habit <input id="habitName" type="text" placeholder="Read 20 pages"></label>
                            <button class="primary-button" type="submit">Add habit</button>
                        </form>
                        <div class="habit-layout">
                            <div class="list-shell"><ul class="record-list" id="habitList"></ul></div>
                            <div class="calendar-card">
                                <div class="card-head compact-head">
                                    <h4>Monthly view</h4>
                                    <select id="habitCalendarSelect"></select>
                                </div>
                                <div class="calendar-grid" id="habitCalendar"></div>
                            </div>
                        </div>
                    </article>

                    <article class="panel" id="focus">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Focus session tracker</p>
                                <h3>Sessions and notes</h3>
                            </div>
                            <span class="pill" id="focusScore">Score 0</span>
                        </div>
                        <form id="focusForm" class="stack-form">
                            <div class="inline-fields">
                                <label>Category
                                    <select id="focusCategory">
                                        <option value="Study">Study</option>
                                        <option value="Deep Work">Deep Work</option>
                                        <option value="Planning">Planning</option>
                                        <option value="Creative">Creative</option>
                                    </select>
                                </label>
                                <label>Duration (min) <input id="focusDuration" type="number" min="5" value="25"></label>
                            </div>
                            <label>Session notes <textarea id="focusNotes" rows="3" placeholder="What you planned, learned, or completed"></textarea></label>
                            <button class="primary-button" type="submit">Log focus session</button>
                        </form>
                        <ul class="record-list" id="focusList"></ul>
                    </article>
                </section>

                <section class="panel-grid analytics-grid" id="analytics">
                    <article class="panel">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Goals system</p>
                                <h3>Daily, weekly, monthly goals</h3>
                            </div>
                            <span class="pill" id="goalProgressHint">0% progress</span>
                        </div>
                        <form id="goalForm" class="stack-form">
                            <label>Goal <input id="goalTitle" type="text" placeholder="Complete 3 study sessions"></label>
                            <div class="inline-fields">
                                <label>Scope
                                    <select id="goalScope">
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </label>
                                <label>Target <input id="goalTarget" type="number" min="1" value="1"></label>
                            </div>
                            <button class="primary-button" type="submit">Add goal</button>
                        </form>
                        <ul class="record-list" id="goalList"></ul>
                    </article>

                    <article class="panel">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Productivity journal</p>
                                <h3>Daily reflections</h3>
                            </div>
                            <span class="pill" id="journalStamp"></span>
                        </div>
                        <form id="journalForm" class="stack-form">
                            <label>Reflection <textarea id="journalReflection" rows="3" placeholder="What did you accomplish today?"></textarea></label>
                            <label>Session summary <textarea id="journalSummary" rows="2" placeholder="Highlight your key wins"></textarea></label>
                            <label>Notes <textarea id="journalNotes" rows="2" placeholder="Capture ideas, blockers, and next steps"></textarea></label>
                            <button class="primary-button" type="submit">Save journal entry</button>
                        </form>
                        <div class="list-shell"><ul class="record-list" id="journalList"></ul></div>
                    </article>

                    <article class="panel wide-panel">
                        <div class="card-head">
                            <div>
                                <p class="eyebrow">Analytics dashboard</p>
                                <h3>Daily, weekly, and monthly trends</h3>
                            </div>
                            <span class="pill">Auto-generated from local data</span>
                        </div>
                        <div class="analytics-layout">
                            <div class="chart-card"><h4>Weekly productivity</h4><div class="chart-bars" id="weeklyChart"></div></div>
                            <div class="chart-card"><h4>Category mix</h4><div class="chart-bars compact" id="categoryChart"></div></div>
                            <div class="chart-card"><h4>Best working hours</h4><div class="chart-bars compact" id="hourChart"></div></div>
                        </div>
                    </article>
                </section>
            </main>
        </div>

        <div class="alarm-modal hidden" id="alarmModal" role="dialog" aria-modal="true" aria-labelledby="alarmModalTitle">
            <div class="alarm-card">
                <p class="eyebrow">Alarm ringing</p>
                <h3 id="alarmModalTitle">Time to refocus</h3>
                <p id="alarmModalText"></p>
                <div class="button-row wrap-row">
                    <button class="primary-button" id="alarmDismissButton">Dismiss</button>
                    <button class="ghost-button" id="alarmSnoozeButton">Snooze 10m</button>
                </div>
            </div>
        </div>

        <div class="shortcuts-modal hidden" id="shortcutsModal" role="dialog" aria-modal="true" aria-labelledby="shortcutsTitle">
            <div class="shortcuts-card">
                <div class="card-head">
                    <div>
                        <p class="eyebrow">Keyboard shortcuts</p>
                        <h3 id="shortcutsTitle">Fast navigation</h3>
                    </div>
                    <button class="ghost-button small" id="closeShortcutsButton">Close</button>
                </div>
                <div class="shortcut-grid">
                    <div><strong>Space</strong><span>Start or pause stopwatch</span></div>
                    <div><strong>L</strong><span>Record stopwatch lap</span></div>
                    <div><strong>R</strong><span>Reset stopwatch</span></div>
                    <div><strong>P</strong><span>Toggle Pomodoro</span></div>
                    <div><strong>F</strong><span>Focus mode</span></div>
                    <div><strong>/</strong><span>Jump to search</span></div>
                </div>
            </div>
        </div>

        <div class="toast-region" id="toastRegion" aria-live="polite" aria-atomic="true"></div>
    `;

    const state = loadState();
    const dom = {};
    let alarmSession = null;
    let installPrompt = null;
    let audioContext = null;
    let stopwatchFrame = null;

    document.body.innerHTML = appShell;
    document.title = "Prodigy Pulse | Productivity OS";

    cacheDom();
    hydrateInputs();
    applyTheme();
    bindEvents();
    syncDerivedState();
    renderAll();
    startTicker();
    registerServiceWorker();

    function cacheDom() {
        [
            "rankLabel", "rankHint", "badgeHint", "badgeProgress", "helpButton", "installButton",
            "searchInput", "themeMode", "accentTone", "notifyButton", "exportButton", "importButton",
            "resetButton", "importInput", "overviewMetrics", "insightList", "focusModeButton",
            "exportLapsButton", "stopwatchDisplay", "stopwatchToggle", "stopwatchLap", "stopwatchReset",
            "logFocusButton", "stopwatchStats", "lapList", "clearLapsButton", "pomodoroDisplay",
            "pomodoroToggle", "pomodoroSkip", "pomodoroReset", "pomodoroCycleLabel", "workLength",
            "shortBreakLength", "longBreakLength", "pomodoroTaskLink", "pomodoroStats", "countdownForm",
            "countdownLabel", "countdownMinutes", "countdownPreset", "countdownList", "alarmForm",
            "alarmLabel", "alarmTime", "alarmRepeat", "alarmSound", "alarmList", "alarmModal",
            "alarmModalText", "alarmDismissButton", "alarmSnoozeButton", "taskForm", "taskTitle",
            "taskPriority", "taskDue", "taskPomodoros", "taskList", "habitForm", "habitName",
            "habitList", "habitCalendarSelect", "habitCalendar", "habitCompletion", "focusForm",
            "focusCategory", "focusDuration", "focusNotes", "focusList", "focusScore", "goalForm",
            "goalTitle", "goalScope", "goalTarget", "goalList", "goalProgressHint", "journalStamp",
            "journalForm", "journalReflection", "journalSummary", "journalNotes", "journalList",
            "weeklyChart", "categoryChart", "hourChart", "shortcutsModal", "closeShortcutsButton",
            "toastRegion"
        ].forEach((id) => { dom[id] = document.getElementById(id); });
    }

    function bindEvents() {
        document.querySelectorAll("[data-scroll]").forEach((button) => {
            button.addEventListener("click", () => document.getElementById(button.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" }));
        });

        dom.helpButton.addEventListener("click", () => dom.shortcutsModal.classList.remove("hidden"));
        dom.closeShortcutsButton.addEventListener("click", () => dom.shortcutsModal.classList.add("hidden"));
        dom.installButton.addEventListener("click", promptInstall);
        dom.searchInput.addEventListener("input", (event) => { state.ui.search = event.target.value.toLowerCase().trim(); renderAll(); saveState(); });
        dom.themeMode.addEventListener("change", (event) => { state.theme.mode = event.target.value; applyTheme(); renderAll(); saveState(); });
        dom.accentTone.addEventListener("change", (event) => { state.theme.accent = event.target.value; applyTheme(); renderAll(); saveState(); });
        dom.notifyButton.addEventListener("click", requestNotifications);
        dom.exportButton.addEventListener("click", exportData);
        dom.importButton.addEventListener("click", () => dom.importInput.click());
        dom.importInput.addEventListener("change", importData);
        dom.resetButton.addEventListener("click", resetData);

        dom.stopwatchToggle.addEventListener("click", toggleStopwatch);
        dom.stopwatchLap.addEventListener("click", recordLap);
        dom.stopwatchReset.addEventListener("click", resetStopwatch);
        dom.clearLapsButton.addEventListener("click", clearLaps);
        dom.exportLapsButton.addEventListener("click", () => exportLaps("csv"));
        dom.logFocusButton.addEventListener("click", logStopwatchSession);
        dom.focusModeButton.addEventListener("click", toggleFocusMode);

        dom.pomodoroToggle.addEventListener("click", togglePomodoro);
        dom.pomodoroSkip.addEventListener("click", skipPomodoro);
        dom.pomodoroReset.addEventListener("click", resetPomodoro);
        dom.workLength.addEventListener("change", updatePomodoroDurations);
        dom.shortBreakLength.addEventListener("change", updatePomodoroDurations);
        dom.longBreakLength.addEventListener("change", updatePomodoroDurations);
        dom.pomodoroTaskLink.addEventListener("change", (event) => { state.pomodoro.linkedTaskId = event.target.value; saveState(); renderAll(); });

        dom.countdownPreset.addEventListener("change", updateCountdownPreset);
        dom.countdownForm.addEventListener("submit", addCountdown);
        dom.alarmForm.addEventListener("submit", addAlarm);
        dom.alarmDismissButton.addEventListener("click", dismissAlarm);
        dom.alarmSnoozeButton.addEventListener("click", snoozeAlarm);
        dom.taskForm.addEventListener("submit", addTask);
        dom.habitForm.addEventListener("submit", addHabit);
        dom.habitCalendarSelect.addEventListener("change", (event) => { state.ui.selectedHabitId = event.target.value; saveState(); renderHabitCalendar(); });
        dom.focusForm.addEventListener("submit", addFocusSession);
        dom.goalForm.addEventListener("submit", addGoal);
        dom.journalForm.addEventListener("submit", saveJournalEntry);

        document.addEventListener("keydown", handleShortcuts);
        window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); installPrompt = event; });

        [dom.taskList, dom.countdownList, dom.alarmList, dom.habitList, dom.goalList, dom.journalList].forEach((list) => {
            list.addEventListener("click", handleListClick);
            if (list === dom.taskList) {
                list.addEventListener("dragstart", handleTaskDragStart);
                list.addEventListener("dragover", (event) => event.preventDefault());
                list.addEventListener("drop", handleTaskDrop);
            }
        });

        document.addEventListener("fullscreenchange", () => {
            if (!document.fullscreenElement) document.body.classList.remove("focus-mode");
        });
    }

    function hydrateInputs() {
        dom.themeMode.value = state.theme.mode;
        dom.accentTone.value = state.theme.accent;
        dom.workLength.value = state.pomodoro.work;
        dom.shortBreakLength.value = state.pomodoro.shortBreak;
        dom.longBreakLength.value = state.pomodoro.longBreak;
        dom.searchInput.value = state.ui.search || "";
        dom.alarmTime.value = "08:00";
        dom.journalStamp.textContent = formatFriendlyDate(new Date());
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return structuredClone(defaultState);
            return normalizeState(JSON.parse(raw));
        } catch {
            return structuredClone(defaultState);
        }
    }

    function normalizeState(input) {
        const merged = structuredClone(defaultState);
        Object.assign(merged.theme, input.theme || {});
        Object.assign(merged.pomodoro, input.pomodoro || {});
        Object.assign(merged.settings, input.settings || {});
        Object.assign(merged.gamification, input.gamification || {});
        Object.assign(merged.ui, input.ui || {});
        merged.stopwatch = { ...merged.stopwatch, ...(input.stopwatch || {}) };
        merged.countdowns = Array.isArray(input.countdowns) ? input.countdowns : [];
        merged.alarms = Array.isArray(input.alarms) ? input.alarms : [];
        merged.focusSessions = Array.isArray(input.focusSessions) ? input.focusSessions : [];
        merged.tasks = Array.isArray(input.tasks) ? input.tasks : [];
        merged.habits = Array.isArray(input.habits) ? input.habits : [];
        merged.goals = Array.isArray(input.goals) ? input.goals : [];
        merged.journal = input.journal || {};
        merged.pomodoro.remainingMs = merged.pomodoro.remainingMs || merged.pomodoro.work * 60 * 1000;
        merged.ui.selectedHabitId = merged.ui.selectedHabitId || merged.habits[0]?.id || "";
        return merged;
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function syncDerivedState() {
        state.gamification.xp = computeXP();
        state.gamification.level = Math.floor(state.gamification.xp / 250) + 1;
        if (!state.ui.selectedHabitId && state.habits[0]) state.ui.selectedHabitId = state.habits[0].id;
        if (!state.pomodoro.remainingMs) state.pomodoro.remainingMs = state.pomodoro.work * 60 * 1000;
        saveState();
    }

    function applyTheme() {
        document.body.classList.toggle("light", state.theme.mode === "light");
        document.documentElement.style.setProperty("--accent", state.theme.accent);
        document.documentElement.style.setProperty("--accent-soft", toRgba(state.theme.accent, 0.18));
    }

    function renderAll() {
        renderOverview();
        renderStopwatch();
        renderPomodoro();
        renderCountdowns();
        renderAlarms();
        renderTasks();
        renderHabits();
        renderHabitCalendar();
        renderFocusSessions();
        renderGoals();
        renderJournal();
        renderAnalytics();
        renderRankCards();
        renderJournalStamp();
        renderTaskSelect();
    }

    function startTicker() {
        setInterval(() => {
            updateStopwatchClock();
            updatePomodoroClock();
            updateCountdownClock();
            checkAlarms();
        }, 250);
    }

    function renderOverview() {
        const tasksDone = state.tasks.filter((task) => task.completed).length;
        const todaySessions = sessionsToday().length;
        const habitRate = completionRate();
        const metrics = [
            { label: "XP earned", value: state.gamification.xp, note: `Level ${state.gamification.level}` },
            { label: "Focus today", value: `${formatMinutes(getFocusMinutesToday())}`, note: `${todaySessions} sessions logged` },
            { label: "Task progress", value: `${state.tasks.length ? Math.round(tasksDone / state.tasks.length * 100) : 0}%`, note: `${tasksDone}/${state.tasks.length} complete` },
            { label: "Habit score", value: `${habitRate}%`, note: `${getHabitStreak()} day streak` }
        ];

        dom.overviewMetrics.innerHTML = metrics.map((metric) => `
            <div class="metric-card">
                <span class="metric-label">${metric.label}</span>
                <strong class="metric-value">${metric.value}</strong>
                <span class="metric-footnote">${metric.note}</span>
            </div>
        `).join("");

        const insights = buildInsights();
        dom.insightList.innerHTML = insights.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }

    function renderStopwatch() {
        const elapsed = getStopwatchElapsed();
        dom.stopwatchDisplay.textContent = formatStopwatch(elapsed);
        dom.stopwatchToggle.textContent = state.stopwatch.running ? "Pause" : "Start";
        const fastest = state.stopwatch.laps.reduce((best, lap, index, array) => {
            const delta = lap.elapsed - (array[index - 1]?.elapsed || 0);
            return !best || delta < best.delta ? { delta } : best;
        }, null);
        const slowest = state.stopwatch.laps.reduce((best, lap, index, array) => {
            const delta = lap.elapsed - (array[index - 1]?.elapsed || 0);
            return !best || delta > best.delta ? { delta } : best;
        }, null);
        dom.lapList.innerHTML = state.stopwatch.laps.length ? [...state.stopwatch.laps].reverse().map((lap, index, array) => `
            <li>
                <div class="row wrap">
                    <div>
                        <strong class="title">Lap #${state.stopwatch.laps.length - index}</strong>
                        <div class="meta">Split ${formatStopwatch(lap.elapsed - (state.stopwatch.laps[state.stopwatch.laps.indexOf(lap) - 1]?.elapsed || 0))}</div>
                    </div>
                    <span class="pill">${formatStopwatch(lap.elapsed)}</span>
                </div>
            </li>
        `).join("") : `<li><div class="meta">No laps recorded yet.</div></li>`;
        dom.stopwatchStats.innerHTML = [
            { label: "Total", value: formatStopwatch(elapsed) },
            { label: "Lap count", value: String(state.stopwatch.laps.length) },
            { label: "Fastest", value: fastest ? formatStopwatch(fastest.delta) : "—" },
            { label: "Slowest", value: slowest ? formatStopwatch(slowest.delta) : "—" }
        ].map(renderMiniStat).join("");
    }

    function renderPomodoro() {
        dom.pomodoroDisplay.textContent = formatCountdown(state.pomodoro.remainingMs);
        dom.pomodoroToggle.textContent = state.pomodoro.running ? "Pause" : "Start";
        dom.pomodoroCycleLabel.textContent = `Cycle ${state.pomodoro.cycle}`;
        dom.pomodoroStats.innerHTML = [
            { label: "Mode", value: capitalize(state.pomodoro.mode) },
            { label: "Today", value: `${state.pomodoro.sessionsToday} sessions` },
            { label: "Daily log", value: `${state.pomodoro.history[todayKey()] || 0} sessions` },
            { label: "Linked task", value: getTaskTitle(state.pomodoro.linkedTaskId) || "None" }
        ].map(renderMiniStat).join("");
    }

    function renderCountdowns() {
        const filtered = visibleItems(state.countdowns, (timer) => `${timer.label} ${timer.templateLabel}`);
        dom.countdownList.innerHTML = filtered.length ? filtered.map((timer) => {
            const remaining = timer.running ? Math.max(0, timer.endAt - Date.now()) : timer.remainingMs;
            return `
                <li data-id="${timer.id}">
                    <div class="row wrap">
                        <div>
                            <strong class="title">${escapeHtml(timer.label)}</strong>
                            <div class="meta">${timer.templateLabel || "Custom"}</div>
                        </div>
                        <span class="pill ${remaining <= 0 ? "success" : ""}">${remaining <= 0 ? "Done" : formatCountdown(remaining)}</span>
                    </div>
                    <div class="actions wrap-row">
                        <button class="chip small" data-action="countdown-toggle">${timer.running ? "Pause" : "Start"}</button>
                        <button class="chip small" data-action="countdown-reset">Reset</button>
                        <button class="chip small danger" data-action="countdown-delete">Delete</button>
                    </div>
                </li>
            `;
        }).join("") : `<li><div class="meta">No countdowns yet.</div></li>`;
    }

    function renderAlarms() {
        dom.alarmList.innerHTML = state.alarms.length ? state.alarms.map((alarm) => `
            <li data-id="${alarm.id}">
                <div class="row wrap">
                    <div>
                        <strong class="title">${escapeHtml(alarm.label)}</strong>
                        <div class="meta">${alarm.time} · ${(alarm.repeatDays?.length ? alarm.repeatDays.map(shortDay).join(", ") : "Daily")} · ${capitalize(alarm.sound)} sound</div>
                    </div>
                    <span class="pill ${alarm.enabled ? "success" : ""}">${alarm.enabled ? "Enabled" : "Paused"}</span>
                </div>
                <div class="actions wrap-row">
                    <button class="chip small" data-action="alarm-toggle">${alarm.enabled ? "Disable" : "Enable"}</button>
                    <button class="chip small danger" data-action="alarm-delete">Delete</button>
                </div>
            </li>
        `).join("") : `<li><div class="meta">No alarms created yet.</div></li>`;
    }

    function renderTasks() {
        const items = visibleItems(state.tasks, (task) => `${task.title} ${task.priority} ${task.dueDate || ""}`);
        dom.taskList.innerHTML = items.length ? items.map((task) => `
            <li data-id="${task.id}" draggable="true">
                <header>
                    <div>
                        <strong class="title">${escapeHtml(task.title)}</strong>
                        <div class="meta">${task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}</div>
                    </div>
                    <span class="pill ${priorityClass(task.priority)}">${capitalize(task.priority)}</span>
                </header>
                <div class="row wrap">
                    <span class="chip ${task.completed ? "success" : ""}">${task.completed ? "Complete" : "Open"}</span>
                    <span class="chip">${task.pomodoros || 0} Pomodoros</span>
                    <span class="chip">${task.order || 0}</span>
                </div>
                <div class="actions wrap-row">
                    <button class="chip small" data-action="task-toggle">${task.completed ? "Mark open" : "Mark complete"}</button>
                    <button class="chip small danger" data-action="task-delete">Delete</button>
                </div>
            </li>
        `).join("") : `<li><div class="meta">No tasks match your search.</div></li>`;
    }

    function renderHabits() {
        const items = visibleItems(state.habits, (habit) => habit.name);
        dom.habitList.innerHTML = items.length ? items.map((habit) => `
            <li data-id="${habit.id}">
                <div class="row wrap">
                    <div>
                        <strong class="title">${escapeHtml(habit.name)}</strong>
                        <div class="meta">Streak ${habit.streak || 0} days · ${habit.completions || 0} completions</div>
                    </div>
                    <span class="pill ${habit.history?.[todayKey()] ? "success" : ""}">${habit.history?.[todayKey()] ? "Done today" : "Open"}</span>
                </div>
                <div class="actions wrap-row">
                    <button class="chip small ${habit.history?.[todayKey()] ? "success" : ""}" data-action="habit-toggle">${habit.history?.[todayKey()] ? "Undo" : "Mark today"}</button>
                    <button class="chip small danger" data-action="habit-delete">Delete</button>
                </div>
            </li>
        `).join("") : `<li><div class="meta">Create a habit to begin streak tracking.</div></li>`;
        dom.habitCompletion.textContent = `${completionRate()}% complete`;
    }

    function renderHabitCalendar() {
        const habit = state.habits.find((item) => item.id === state.ui.selectedHabitId) || state.habits[0];
        if (!habit) {
            dom.habitCalendarSelect.innerHTML = `<option value="">No habits yet</option>`;
            dom.habitCalendar.innerHTML = `<div class="meta">Add a habit to see the monthly view.</div>`;
            return;
        }
        state.ui.selectedHabitId = habit.id;
        dom.habitCalendarSelect.innerHTML = state.habits.map((item) => `<option value="${item.id}" ${item.id === habit.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("");
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const blocks = [];
        for (let index = 0; index < start.getDay(); index += 1) blocks.push(`<div class="calendar-day ghost"></div>`);
        for (let day = 1; day <= end.getDate(); day += 1) {
            const key = dateKey(new Date(now.getFullYear(), now.getMonth(), day));
            const completed = Boolean(habit.history?.[key]);
            blocks.push(`<div class="calendar-day ${completed ? "completed" : ""}"><span>${day}</span><span class="dot"></span></div>`);
        }
        dom.habitCalendar.innerHTML = blocks.join("");
    }

    function renderFocusSessions() {
        const items = visibleItems(state.focusSessions, (session) => `${session.category} ${session.notes}`);
        dom.focusList.innerHTML = items.length ? [...items].reverse().map((session) => `
            <li>
                <div class="row wrap">
                    <div>
                        <strong class="title">${escapeHtml(session.category)}</strong>
                        <div class="meta">${formatDateTime(session.date)} · ${session.duration} min</div>
                    </div>
                    <span class="pill">${session.score} score</span>
                </div>
                <div class="submeta">${escapeHtml(session.notes || "No notes recorded.")}</div>
            </li>
        `).join("") : `<li><div class="meta">Log a focus session to start building productivity analytics.</div></li>`;
        dom.focusScore.textContent = `Score ${computeFocusScore()}`;
    }

    function renderGoals() {
        dom.goalList.innerHTML = state.goals.length ? state.goals.map((goal) => {
            const percent = Math.min(100, Math.round(goal.progress / goal.target * 100));
            return `
                <li data-id="${goal.id}">
                    <div class="row wrap">
                        <div>
                            <strong class="title">${escapeHtml(goal.title)}</strong>
                            <div class="meta">${goal.scope} goal · ${goal.progress}/${goal.target}</div>
                        </div>
                        <span class="pill ${percent >= 100 ? "success" : ""}">${percent}%</span>
                    </div>
                    <div class="progress-shell"><div class="progress-fill" style="width:${percent}%"></div></div>
                    <div class="actions wrap-row">
                        <button class="chip small" data-action="goal-progress">+1 progress</button>
                        <button class="chip small danger" data-action="goal-delete">Delete</button>
                    </div>
                </li>
            `;
        }).join("") : `<li><div class="meta">Add goals to track daily, weekly, and monthly progress.</div></li>`;
    }

    function renderJournal() {
        const entries = Object.entries(state.journal).sort((a, b) => b[0].localeCompare(a[0]));
        dom.journalList.innerHTML = entries.length ? entries.map(([date, entry]) => `
            <li data-id="${date}">
                <div class="row wrap">
                    <div>
                        <strong class="title">${formatDate(date)}</strong>
                        <div class="meta">Journal entry saved</div>
                    </div>
                    <button class="chip small" data-action="journal-load">Open</button>
                </div>
                <div class="submeta">${escapeHtml(entry.reflection || entry.summary || entry.notes || "")}</div>
            </li>
        `).join("") : `<li><div class="meta">Write your first daily reflection.</div></li>`;
    }

    function renderAnalytics() {
        dom.weeklyChart.innerHTML = weeklyChart();
        dom.categoryChart.innerHTML = categoryChart();
        dom.hourChart.innerHTML = hourChart();
    }

    function renderRankCards() {
        const rank = getRank(state.gamification.level);
        dom.rankLabel.textContent = rank.name;
        dom.rankHint.textContent = rank.hint;
        const badge = nextBadge();
        dom.badgeHint.textContent = badge.name;
        dom.badgeProgress.textContent = badge.progress;
        dom.goalProgressHint.textContent = `${goalCompletionRate()}% progress`;
    }

    function renderJournalStamp() {
        dom.journalStamp.textContent = formatFriendlyDate(new Date());
    }

    function renderTaskSelect() {
        dom.pomodoroTaskLink.innerHTML = [`<option value="">No linked task</option>`].concat(
            state.tasks.map((task) => `<option value="${task.id}" ${task.id === state.pomodoro.linkedTaskId ? "selected" : ""}>${escapeHtml(task.title)}</option>`)
        ).join("");
    }

    function updateStopwatchClock() {
        if (state.stopwatch.running) renderStopwatch();
    }

    function updatePomodoroClock() {
        if (!state.pomodoro.running) return;
        const remaining = Math.max(0, state.pomodoro.endsAt - Date.now());
        state.pomodoro.remainingMs = remaining;
        if (remaining <= 0) {
            finishPomodoroCycle();
            return;
        }
        saveState();
        renderPomodoro();
    }

    function updateCountdownClock() {
        let dirty = false;
        state.countdowns.forEach((timer) => {
            if (!timer.running || timer.completed) return;
            const remaining = Math.max(0, timer.endAt - Date.now());
            timer.remainingMs = remaining;
            if (remaining <= 0) {
                timer.running = false;
                timer.completed = true;
                dirty = true;
                playTone(timer.sound || "bright");
                toast("Countdown complete", timer.label, "success");
                notifyUser("Countdown complete", timer.label);
            }
        });
        if (dirty) { saveState(); renderCountdowns(); }
    }

    function checkAlarms() {
        if (alarmSession) return;
        const now = new Date();
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const alarm = state.alarms.find((item) => item.enabled && item.time === time && (!item.repeatDays?.length || item.repeatDays.includes(now.getDay())) && item.lastTriggered !== dateKey(now) + time && (!item.snoozedUntil || item.snoozedUntil <= Date.now()));
        if (!alarm) return;
        alarm.lastTriggered = dateKey(now) + time;
        alarmSession = alarm;
        dom.alarmModalText.textContent = `${alarm.label} at ${alarm.time}`;
        dom.alarmModal.classList.remove("hidden");
        playTone(alarm.sound || "soft");
        notifyUser("Alarm ringing", alarm.label);
        toast("Alarm ringing", alarm.label, "warning");
        saveState();
    }

    function toggleStopwatch() {
        if (state.stopwatch.running) {
            pauseStopwatch();
        } else {
            startStopwatch();
        }
    }

    function startStopwatch() {
        state.stopwatch.running = true;
        state.stopwatch.startedAt = Date.now();
        saveState();
        renderStopwatch();
        if (!stopwatchFrame) runStopwatchFrame();
        toast("Stopwatch started", "Your focus session is live.", "success");
    }

    function pauseStopwatch() {
        state.stopwatch.elapsed = getStopwatchElapsed();
        state.stopwatch.running = false;
        state.stopwatch.startedAt = null;
        saveState();
        renderStopwatch();
        if (stopwatchFrame) {
            cancelAnimationFrame(stopwatchFrame);
            stopwatchFrame = null;
        }
        toast("Stopwatch paused", formatStopwatch(state.stopwatch.elapsed));
    }

    function resetStopwatch() {
        state.stopwatch = { running: false, elapsed: 0, startedAt: null, laps: [] };
        saveState();
        renderStopwatch();
        if (stopwatchFrame) {
            cancelAnimationFrame(stopwatchFrame);
            stopwatchFrame = null;
        }
        toast("Stopwatch reset", "Lap history cleared.");
    }

    function runStopwatchFrame() {
        if (!state.stopwatch.running) {
            stopwatchFrame = null;
            return;
        }
        renderStopwatch();
        stopwatchFrame = requestAnimationFrame(runStopwatchFrame);
    }

    function getStopwatchElapsed() {
        return state.stopwatch.running && state.stopwatch.startedAt ? state.stopwatch.elapsed + (Date.now() - state.stopwatch.startedAt) : state.stopwatch.elapsed;
    }

    function recordLap() {
        if (!state.stopwatch.running && !state.stopwatch.elapsed) return;
        const elapsed = getStopwatchElapsed();
        state.stopwatch.laps.push({ id: uid(), elapsed });
        state.stopwatch.elapsed = elapsed;
        if (state.stopwatch.running) state.stopwatch.startedAt = Date.now();
        saveState();
        renderStopwatch();
        toast("Lap recorded", formatStopwatch(elapsed));
    }

    function clearLaps() {
        state.stopwatch.laps = [];
        saveState();
        renderStopwatch();
        toast("Lap history cleared", "All splits were removed.");
    }

    function exportLaps(format) {
        const rows = state.stopwatch.laps.map((lap, index) => ({ lap: index + 1, elapsed: formatStopwatch(lap.elapsed), split: formatStopwatch(lap.elapsed - (state.stopwatch.laps[index - 1]?.elapsed || 0)) }));
        const content = format === "csv" ? ["Lap,Elapsed,Split", ...rows.map((row) => `${row.lap},${row.elapsed},${row.split}`)].join("\n") : JSON.stringify(rows, null, 2);
        downloadFile(`stopwatch-laps.${format}`, content, format === "csv" ? "text/csv" : "application/json");
    }

    function logStopwatchSession() {
        const minutes = Math.max(1, Math.round(getStopwatchElapsed() / 60000));
        if (!minutes) return;
        state.focusSessions.push({ id: uid(), category: "Stopwatch", duration: minutes, notes: `Logged from stopwatch (${formatStopwatch(getStopwatchElapsed())}).`, date: new Date().toISOString(), score: Math.round(minutes * 2) });
        addXP(minutes * 2);
        saveState();
        renderAll();
        toast("Focus session logged", `${minutes} minutes added to your dashboard.`, "success");
    }

    function toggleFocusMode() {
        document.body.classList.toggle("focus-mode");
        if (document.body.classList.contains("focus-mode") && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => undefined);
        }
        if (!document.body.classList.contains("focus-mode") && document.fullscreenElement) {
            document.exitFullscreen().catch(() => undefined);
        }
    }

    function togglePomodoro() {
        if (state.pomodoro.running) {
            state.pomodoro.remainingMs = Math.max(0, state.pomodoro.endsAt - Date.now());
            state.pomodoro.running = false;
            state.pomodoro.endsAt = null;
            saveState();
            renderPomodoro();
            toast("Pomodoro paused", formatCountdown(state.pomodoro.remainingMs));
            return;
        }
        state.pomodoro.running = true;
        state.pomodoro.endsAt = Date.now() + state.pomodoro.remainingMs;
        saveState();
        renderPomodoro();
        toast("Pomodoro started", `${capitalize(state.pomodoro.mode)} session in progress.`, "success");
    }

    function skipPomodoro() {
        state.pomodoro.remainingMs = 0;
        finishPomodoroCycle();
    }

    function resetPomodoro() {
        state.pomodoro.running = false;
        state.pomodoro.mode = "work";
        state.pomodoro.remainingMs = state.pomodoro.work * 60 * 1000;
        state.pomodoro.endsAt = null;
        saveState();
        renderPomodoro();
    }

    function updatePomodoroDurations() {
        state.pomodoro.work = clamp(Number(dom.workLength.value), 5, 180);
        state.pomodoro.shortBreak = clamp(Number(dom.shortBreakLength.value), 1, 60);
        state.pomodoro.longBreak = clamp(Number(dom.longBreakLength.value), 5, 120);
        if (!state.pomodoro.running && state.pomodoro.mode === "work") state.pomodoro.remainingMs = state.pomodoro.work * 60 * 1000;
        saveState();
        renderPomodoro();
    }

    function finishPomodoroCycle() {
        const previousMode = state.pomodoro.mode;
        state.pomodoro.running = false;
        state.pomodoro.endsAt = null;
        if (previousMode === "work") {
            state.pomodoro.sessionsToday += 1;
            state.pomodoro.history[todayKey()] = (state.pomodoro.history[todayKey()] || 0) + 1;
            const linkedTask = state.tasks.find((task) => task.id === state.pomodoro.linkedTaskId);
            if (linkedTask) linkedTask.pomodorosCompleted = (linkedTask.pomodorosCompleted || 0) + 1;
            state.pomodoro.mode = state.pomodoro.cycle % 4 === 0 ? "longBreak" : "shortBreak";
            state.pomodoro.remainingMs = (state.pomodoro.mode === "longBreak" ? state.pomodoro.longBreak : state.pomodoro.shortBreak) * 60 * 1000;
            state.pomodoro.cycle += 1;
            addXP(20);
        } else {
            state.pomodoro.mode = "work";
            state.pomodoro.remainingMs = state.pomodoro.work * 60 * 1000;
        }
        playTone("bright");
        notifyUser("Pomodoro complete", `Next mode: ${capitalize(state.pomodoro.mode)}`);
        toast("Pomodoro complete", `Switched to ${capitalize(state.pomodoro.mode)}.`, "success");
        saveState();
        renderPomodoro();
    }

    function updateCountdownPreset() {
        const presets = { custom: [15, "Countdown"], focus: [50, "Deep work"], break: [10, "Break"], presentation: [5, "Presentation prep"] };
        const preset = presets[dom.countdownPreset.value];
        if (!preset) return;
        dom.countdownMinutes.value = preset[0];
        if (!dom.countdownLabel.value) dom.countdownLabel.value = preset[1];
    }

    function addCountdown(event) {
        event.preventDefault();
        const label = dom.countdownLabel.value.trim() || "Countdown";
        const minutes = clamp(Number(dom.countdownMinutes.value), 1, 24 * 60);
        state.countdowns.unshift({
            id: uid(), label, templateLabel: dom.countdownPreset.options[dom.countdownPreset.selectedIndex].text,
            durationMs: minutes * 60 * 1000, remainingMs: minutes * 60 * 1000, running: true, completed: false, endAt: Date.now() + minutes * 60 * 1000
        });
        dom.countdownForm.reset();
        dom.countdownMinutes.value = minutes;
        dom.countdownPreset.value = "custom";
        addXP(8);
        saveState();
        renderCountdowns();
        toast("Countdown added", label, "success");
    }

    function addAlarm(event) {
        event.preventDefault();
        const label = dom.alarmLabel.value.trim() || "Alarm";
        const time = dom.alarmTime.value || "08:00";
        const repeatDays = [...dom.alarmRepeat.selectedOptions].map((option) => Number(option.value));
        state.alarms.unshift({ id: uid(), label, time, repeatDays, sound: dom.alarmSound.value, enabled: true, snoozedUntil: null, lastTriggered: null });
        dom.alarmForm.reset();
        dom.alarmTime.value = time;
        saveState();
        renderAlarms();
        toast("Alarm added", `${label} at ${time}`, "success");
    }

    function addTask(event) {
        event.preventDefault();
        const title = dom.taskTitle.value.trim();
        if (!title) return;
        state.tasks.unshift({ id: uid(), title, priority: dom.taskPriority.value, dueDate: dom.taskDue.value, pomodoros: clamp(Number(dom.taskPomodoros.value), 0, 99), completed: false, order: state.tasks.length + 1 });
        dom.taskForm.reset();
        dom.taskPomodoros.value = 0;
        saveState();
        renderAll();
        toast("Task added", title, "success");
    }

    function addHabit(event) {
        event.preventDefault();
        const name = dom.habitName.value.trim();
        if (!name) return;
        const habit = { id: uid(), name, history: {}, streak: 0, completions: 0 };
        state.habits.unshift(habit);
        state.ui.selectedHabitId = habit.id;
        dom.habitForm.reset();
        saveState();
        renderAll();
        toast("Habit added", name, "success");
    }

    function addFocusSession(event) {
        event.preventDefault();
        const category = dom.focusCategory.value;
        const duration = clamp(Number(dom.focusDuration.value), 5, 1440);
        const notes = dom.focusNotes.value.trim();
        const score = Math.round(duration * 2 + Math.min(20, notes.length / 20));
        state.focusSessions.push({ id: uid(), category, duration, notes, date: new Date().toISOString(), score });
        dom.focusForm.reset();
        dom.focusDuration.value = duration;
        addXP(score);
        saveState();
        renderAll();
        toast("Focus session logged", `${duration} minutes in ${category}.`, "success");
    }

    function addGoal(event) {
        event.preventDefault();
        const title = dom.goalTitle.value.trim();
        if (!title) return;
        state.goals.unshift({ id: uid(), title, scope: dom.goalScope.value, target: clamp(Number(dom.goalTarget.value), 1, 999), progress: 0 });
        dom.goalForm.reset();
        dom.goalTarget.value = 1;
        saveState();
        renderGoals();
        toast("Goal added", title, "success");
    }

    function saveJournalEntry(event) {
        event.preventDefault();
        state.journal[todayKey()] = { reflection: dom.journalReflection.value.trim(), summary: dom.journalSummary.value.trim(), notes: dom.journalNotes.value.trim(), updatedAt: new Date().toISOString() };
        addXP(10);
        saveState();
        renderJournal();
        renderRankCards();
        toast("Journal saved", formatDate(new Date()), "success");
    }

    function handleListClick(event) {
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const item = event.target.closest("[data-id]");
        const action = button.dataset.action;

        if (item?.closest("#countdownList")) {
            const timer = state.countdowns.find((entry) => entry.id === item.dataset.id);
            if (!timer) return;
            if (action === "countdown-toggle") {
                if (timer.running) {
                    timer.remainingMs = Math.max(0, timer.endAt - Date.now());
                    timer.running = false;
                    timer.endAt = null;
                } else {
                    timer.running = true;
                    timer.endAt = Date.now() + timer.remainingMs;
                }
            }
            if (action === "countdown-reset") {
                timer.completed = false;
                timer.running = false;
                timer.remainingMs = timer.durationMs;
                timer.endAt = null;
            }
            if (action === "countdown-delete") state.countdowns = state.countdowns.filter((entry) => entry.id !== timer.id);
            saveState();
            renderCountdowns();
            return;
        }

        if (item?.closest("#alarmList")) {
            const alarm = state.alarms.find((entry) => entry.id === item.dataset.id);
            if (!alarm) return;
            if (action === "alarm-toggle") alarm.enabled = !alarm.enabled;
            if (action === "alarm-delete") state.alarms = state.alarms.filter((entry) => entry.id !== alarm.id);
            saveState();
            renderAlarms();
            return;
        }

        if (item?.closest("#taskList")) {
            const task = state.tasks.find((entry) => entry.id === item.dataset.id);
            if (!task) return;
            if (action === "task-toggle") task.completed = !task.completed;
            if (action === "task-delete") state.tasks = state.tasks.filter((entry) => entry.id !== task.id);
            state.tasks.forEach((entry, index) => { entry.order = index + 1; });
            saveState();
            renderAll();
            return;
        }

        if (item?.closest("#habitList")) {
            const habit = state.habits.find((entry) => entry.id === item.dataset.id);
            if (!habit) return;
            if (action === "habit-toggle") toggleHabitToday(habit);
            if (action === "habit-delete") state.habits = state.habits.filter((entry) => entry.id !== habit.id);
            saveState();
            renderAll();
            return;
        }

        if (item?.closest("#goalList")) {
            const goal = state.goals.find((entry) => entry.id === item.dataset.id);
            if (!goal) return;
            if (action === "goal-progress") goal.progress = Math.min(goal.target, goal.progress + 1);
            if (action === "goal-delete") state.goals = state.goals.filter((entry) => entry.id !== goal.id);
            saveState();
            renderGoals();
            return;
        }

        if (item?.closest("#journalList") && action === "journal-load") {
            const entry = state.journal[item.dataset.id];
            if (!entry) return;
            dom.journalReflection.value = entry.reflection || "";
            dom.journalSummary.value = entry.summary || "";
            dom.journalNotes.value = entry.notes || "";
            toast("Journal loaded", formatDate(item.dataset.id));
        }
    }

    function handleTaskDragStart(event) {
        const item = event.target.closest("[data-id]");
        if (!item) return;
        event.dataTransfer.setData("text/plain", item.dataset.id);
        item.classList.add("dragging");
    }

    function handleTaskDrop(event) {
        event.preventDefault();
        const id = event.dataTransfer.getData("text/plain");
        const dragged = state.tasks.find((task) => task.id === id);
        if (!dragged) return;
        const target = event.target.closest("[data-id]");
        state.tasks = state.tasks.filter((task) => task.id !== id);
        const targetIndex = target ? state.tasks.findIndex((task) => task.id === target.dataset.id) : state.tasks.length;
        state.tasks.splice(targetIndex < 0 ? state.tasks.length : targetIndex, 0, dragged);
        state.tasks.forEach((task, index) => { task.order = index + 1; });
        saveState();
        renderTasks();
    }

    function handleShortcuts(event) {
        const active = document.activeElement?.tagName;
        const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(active);
        if ((event.key === "/" && !typing) || (event.shiftKey && event.key === "?")) {
            event.preventDefault();
            dom.searchInput.focus();
            return;
        }
        if (event.key === "Escape") {
            dom.shortcutsModal.classList.add("hidden");
            dom.alarmModal.classList.add("hidden");
            alarmSession = null;
            return;
        }
        if (typing) return;
        if (event.key === " ") {
            event.preventDefault();
            toggleStopwatch();
        }
        if (event.key.toLowerCase() === "l") recordLap();
        if (event.key.toLowerCase() === "r") resetStopwatch();
        if (event.key.toLowerCase() === "p") togglePomodoro();
        if (event.key.toLowerCase() === "f") toggleFocusMode();
    }

    function toggleHabitToday(habit) {
        if (habit.history?.[todayKey()]) {
            delete habit.history[todayKey()];
        } else {
            habit.history[todayKey()] = true;
            habit.completions = (habit.completions || 0) + 1;
            habit.streak = computeHabitStreak(habit);
            addXP(8);
        }
    }

    function buildInsights() {
        const insights = [];
        const bestHour = bestWorkingHour();
        if (bestHour !== null) insights.push(`Your strongest focus window appears around ${formatHour(bestHour)}.`);
        if (state.pomodoro.sessionsToday >= 3) insights.push(`Nice momentum: ${state.pomodoro.sessionsToday} Pomodoro sessions today.`);
        if (state.stopwatch.laps.length) insights.push(`You have ${state.stopwatch.laps.length} laps stored. Export them as CSV if you need a work log.`);
        if (state.habits.length && completionRate() < 60) insights.push("Tip: keep habits small and check them before lunch to improve consistency.");
        if (!insights.length) insights.push("Start one focused session and the dashboard will generate personalized suggestions.");
        return insights.slice(0, 4);
    }

    function weeklyChart() {
        const days = Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            const key = dateKey(date);
            const minutes = focusMinutesForDate(key) + (state.pomodoro.history[key] || 0) * 25;
            return { label: shortDay(date.getDay()), value: minutes };
        });
        const max = Math.max(1, ...days.map((day) => day.value));
        return days.map((day) => `
            <div class="bar">
                <div class="track"><div class="fill" style="height:${Math.round(day.value / max * 100)}%"></div></div>
                <span>${day.label}<br>${day.value}m</span>
            </div>
        `).join("");
    }

    function categoryChart() {
        const grouped = groupBy(state.focusSessions, (session) => session.category);
        const items = Object.entries(grouped).map(([label, sessions]) => ({ label, value: sessions.reduce((sum, session) => sum + session.duration, 0) }));
        if (!items.length) return placeholderBars(5, "No data yet");
        const max = Math.max(...items.map((item) => item.value));
        return items.slice(0, 5).map((item) => `
            <div class="bar">
                <div class="track"><div class="fill" style="height:${Math.round(item.value / max * 100)}%; background: linear-gradient(180deg, var(--accent-2), transparent);"></div></div>
                <span>${escapeHtml(item.label)}<br>${item.value}m</span>
            </div>
        `).join("");
    }

    function hourChart() {
        const buckets = Array.from({ length: 24 }, () => 0);
        state.focusSessions.forEach((session) => { buckets[new Date(session.date).getHours()] += session.duration; });
        const items = buckets.map((value, hour) => ({ hour, value })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value).slice(0, 5);
        if (!items.length) return placeholderBars(5, "No sessions yet");
        const max = Math.max(...items.map((item) => item.value));
        return items.map((item) => `
            <div class="bar">
                <div class="track"><div class="fill" style="height:${Math.round(item.value / max * 100)}%; background: linear-gradient(180deg, var(--success), transparent);"></div></div>
                <span>${formatHour(item.hour)}<br>${item.value}m</span>
            </div>
        `).join("");
    }

    function placeholderBars(count, label) {
        return Array.from({ length: count }, () => `
            <div class="bar">
                <div class="track"><div class="fill" style="height:10%; opacity:0.25"></div></div>
                <span>${label}</span>
            </div>
        `).join("");
    }

    function renderMiniStat(stat) {
        return `<div class="mini-stat"><span class="mini-stat-label">${stat.label}</span><strong class="mini-stat-value">${stat.value}</strong></div>`;
    }

    function sessionsToday() {
        return state.focusSessions.filter((session) => dateKey(new Date(session.date)) === todayKey());
    }

    function focusMinutesForDate(key) {
        return state.focusSessions.filter((session) => dateKey(new Date(session.date)) === key).reduce((total, session) => total + session.duration, 0);
    }

    function getFocusMinutesToday() {
        return focusMinutesForDate(todayKey());
    }

    function completionRate() {
        if (!state.habits.length) return 0;
        return Math.round(state.habits.filter((habit) => habit.history?.[todayKey()]).length / state.habits.length * 100);
    }

    function getHabitStreak() {
        const activeDays = new Set();
        state.habits.forEach((habit) => Object.keys(habit.history || {}).forEach((key) => activeDays.add(key)));
        state.focusSessions.forEach((session) => activeDays.add(dateKey(new Date(session.date))));
        const ordered = [...activeDays].sort();
        let streak = 0;
        for (let index = ordered.length - 1; index >= 0; index -= 1) {
            if (!streak) streak = 1;
            else if (daysBetween(ordered[index], ordered[index + 1]) === 1) streak += 1;
            else break;
        }
        return streak || 1;
    }

    function computeHabitStreak(habit) {
        const dates = Object.keys(habit.history || {}).sort();
        if (!dates.length) return 0;
        let streak = 1;
        for (let index = dates.length - 1; index > 0; index -= 1) {
            if (daysBetween(dates[index - 1], dates[index]) === 1) streak += 1;
            else break;
        }
        return streak;
    }

    function computeXP() {
        const taskXP = state.tasks.filter((task) => task.completed).length * 25;
        const habitXP = state.habits.reduce((total, habit) => total + Object.keys(habit.history || {}).length * 8, 0);
        const focusXP = state.focusSessions.reduce((total, session) => total + session.score, 0);
        const pomodoroXP = Object.values(state.pomodoro.history).reduce((total, count) => total + count * 20, 0);
        return taskXP + habitXP + focusXP + pomodoroXP;
    }

    function getRank(level) {
        if (level < 3) return { name: "Starter", hint: "Build a few sessions to rise." };
        if (level < 5) return { name: "Rising", hint: "Your routine is taking shape." };
        if (level < 8) return { name: "Focused", hint: "Consistent effort is paying off." };
        return { name: "Elite", hint: "You’re in the top tier of your flow." };
    }

    function nextBadge() {
        if (state.gamification.xp < 100) return { name: "First Sprint", progress: `${100 - state.gamification.xp} XP to unlock` };
        if (state.gamification.xp < 250) return { name: "Momentum Maker", progress: `${250 - state.gamification.xp} XP to unlock` };
        if (state.gamification.xp < 500) return { name: "Focus Architect", progress: `${500 - state.gamification.xp} XP to unlock` };
        return { name: "Pulse Legend", progress: "Highest badge unlocked" };
    }

    function renderTaskSelect() {
        dom.pomodoroTaskLink.innerHTML = [`<option value="">No linked task</option>`].concat(
            state.tasks.map((task) => `<option value="${task.id}" ${task.id === state.pomodoro.linkedTaskId ? "selected" : ""}>${escapeHtml(task.title)}</option>`)
        ).join("");
    }

    function getTaskTitle(id) {
        return state.tasks.find((task) => task.id === id)?.title || "";
    }

    function updateCountdownClock() {
        let changed = false;
        state.countdowns.forEach((timer) => {
            if (!timer.running || timer.completed) return;
            const remaining = Math.max(0, timer.endAt - Date.now());
            timer.remainingMs = remaining;
            if (remaining <= 0) {
                timer.running = false;
                timer.completed = true;
                changed = true;
                playTone("bright");
                toast("Countdown complete", timer.label, "success");
                notifyUser("Countdown complete", timer.label);
            }
        });
        if (changed) { saveState(); renderCountdowns(); }
    }

    function updateStopwatchClock() {
        if (state.stopwatch.running) renderStopwatch();
    }

    function updatePomodoroClock() {
        if (!state.pomodoro.running) return;
        const remaining = Math.max(0, state.pomodoro.endsAt - Date.now());
        state.pomodoro.remainingMs = remaining;
        if (remaining <= 0) {
            finishPomodoroCycle();
            return;
        }
        renderPomodoro();
    }

    function checkAlarms() {
        if (alarmSession) return;
        const now = new Date();
        const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const alarm = state.alarms.find((item) => item.enabled && item.time === current && (!item.repeatDays?.length || item.repeatDays.includes(now.getDay())) && item.lastTriggered !== `${dateKey(now)}${current}` && (!item.snoozedUntil || item.snoozedUntil <= Date.now()));
        if (!alarm) return;
        alarm.lastTriggered = `${dateKey(now)}${current}`;
        alarmSession = alarm;
        dom.alarmModalText.textContent = `${alarm.label} at ${alarm.time}`;
        dom.alarmModal.classList.remove("hidden");
        playTone(alarm.sound || "soft");
        notifyUser("Alarm ringing", alarm.label);
        toast("Alarm ringing", alarm.label, "warning");
        saveState();
    }

    function dismissAlarm() {
        alarmSession = null;
        dom.alarmModal.classList.add("hidden");
    }

    function snoozeAlarm() {
        if (!alarmSession) return;
        const label = alarmSession.label;
        alarmSession.snoozedUntil = Date.now() + 10 * 60 * 1000;
        dismissAlarm();
        saveState();
        toast("Alarm snoozed", `${label} will ring again in 10 minutes.`);
    }

    function handleTaskDragStart(event) {
        const item = event.target.closest("[data-id]");
        if (!item) return;
        event.dataTransfer.setData("text/plain", item.dataset.id);
        item.classList.add("dragging");
    }

    function handleTaskDrop(event) {
        event.preventDefault();
        const id = event.dataTransfer.getData("text/plain");
        const dragged = state.tasks.find((task) => task.id === id);
        if (!dragged) return;
        const target = event.target.closest("[data-id]");
        state.tasks = state.tasks.filter((task) => task.id !== id);
        const index = target ? state.tasks.findIndex((task) => task.id === target.dataset.id) : state.tasks.length;
        state.tasks.splice(index < 0 ? state.tasks.length : index, 0, dragged);
        state.tasks.forEach((task, position) => { task.order = position + 1; });
        saveState();
        renderTasks();
    }

    function toggleFocusMode() {
        document.body.classList.toggle("focus-mode");
        if (document.body.classList.contains("focus-mode") && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => undefined);
        }
        if (!document.body.classList.contains("focus-mode") && document.fullscreenElement) {
            document.exitFullscreen().catch(() => undefined);
        }
    }

    function requestNotifications() {
        if (!("Notification" in window)) {
            toast("Notifications unavailable", "This browser does not support notifications.");
            return;
        }
        Notification.requestPermission().then((permission) => {
            state.settings.notifications = permission === "granted";
            saveState();
            toast(permission === "granted" ? "Notifications enabled" : "Notifications blocked", "Alerts will stay in-app if denied.");
        });
    }

    function notifyUser(title, body) {
        if (state.settings.notifications && "Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body });
        }
    }

    function playTone(kind) {
        try {
            audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const frequency = { soft: 660, bright: 880, deep: 440 }[kind] || 700;
            oscillator.type = kind === "deep" ? "sine" : "triangle";
            oscillator.frequency.value = frequency;
            gain.gain.value = 0.0001;
            oscillator.connect(gain).connect(audioContext.destination);
            oscillator.start();
            gain.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
            oscillator.stop(audioContext.currentTime + 0.55);
        } catch {
            // Audio is optional.
        }
    }

    function toast(title, message, tone = "info") {
        const node = document.createElement("div");
        node.className = "toast";
        node.innerHTML = `<strong>${escapeHtml(title)}</strong><div>${escapeHtml(message || "")}</div>`;
        if (tone === "success") node.style.borderColor = "rgba(53, 208, 127, 0.38)";
        if (tone === "warning") node.style.borderColor = "rgba(255, 179, 107, 0.38)";
        dom.toastRegion.appendChild(node);
        setTimeout(() => { node.remove(); }, 2600);
    }

    function promptInstall() {
        if (!installPrompt) {
            toast("Install unavailable", "Open the site in a supported browser to install it.");
            return;
        }
        installPrompt.prompt();
        installPrompt.userChoice.then((choice) => {
            toast(choice.outcome === "accepted" ? "App installed" : "Install dismissed", "You can install later from the address bar.");
            installPrompt = null;
        });
    }

    function registerServiceWorker() {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("service-worker.js").catch(() => undefined);
        }
    }

    function exportData() {
        downloadFile("prodigy-pulse-backup.json", JSON.stringify(state, null, 2), "application/json");
    }

    function importData(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const imported = normalizeState(JSON.parse(String(reader.result)));
                Object.assign(state, imported);
                applyTheme();
                syncDerivedState();
                renderAll();
                toast("Data restored", "Your backup has been loaded.", "success");
            } catch {
                toast("Import failed", "The selected file is not a valid backup.", "warning");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    }

    function resetData() {
        if (!confirm("Reset all app data? This clears timers, logs, and analytics.")) return;
        localStorage.removeItem(STORAGE_KEY);
        Object.assign(state, structuredClone(defaultState));
        syncDerivedState();
        applyTheme();
        renderAll();
        toast("Data reset", "The workspace has been cleared.", "warning");
    }

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    function visibleItems(items, accessor) {
        const term = state.ui.search;
        if (!term) return items;
        return items.filter((item) => accessor(item).toLowerCase().includes(term));
    }

    function computeHabitStreak(habit) {
        const dates = Object.keys(habit.history || {}).sort();
        if (!dates.length) return 0;
        let streak = 1;
        for (let index = dates.length - 1; index > 0; index -= 1) {
            if (daysBetween(dates[index - 1], dates[index]) === 1) streak += 1;
            else break;
        }
        return streak;
    }

    function bestWorkingHour() {
        const buckets = new Map();
        state.focusSessions.forEach((session) => {
            const hour = new Date(session.date).getHours();
            buckets.set(hour, (buckets.get(hour) || 0) + session.duration);
        });
        let winner = null;
        buckets.forEach((value, hour) => { if (!winner || value > winner.value) winner = { hour, value }; });
        return winner?.hour ?? null;
    }

    function goalCompletionRate() {
        if (!state.goals.length) return 0;
        const total = state.goals.reduce((sum, goal) => sum + goal.target, 0);
        const progress = state.goals.reduce((sum, goal) => sum + goal.progress, 0);
        return total ? Math.round(progress / total * 100) : 0;
    }

    function computeFocusScore() {
        return Math.round(getFocusMinutesToday() + state.tasks.filter((task) => task.completed).length * 20 + state.habits.filter((habit) => habit.history?.[todayKey()]).length * 15);
    }

    function formatStopwatch(ms) {
        const total = Math.max(0, Math.floor(ms));
        const hours = Math.floor(total / 3600000);
        const minutes = Math.floor((total % 3600000) / 60000);
        const seconds = Math.floor((total % 60000) / 1000);
        const millis = total % 1000;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${String(millis).padStart(3, "0")}`;
    }

    function formatCountdown(ms) {
        const total = Math.max(0, Math.floor(ms));
        return `${pad(Math.floor(total / 60000))}:${pad(Math.floor((total % 60000) / 1000))}`;
    }

    function formatMinutes(value) {
        return `${value}m`;
    }

    function formatDate(value) {
        return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
    }

    function formatDateTime(value) {
        return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
    }

    function formatFriendlyDate(value) {
        return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(value);
    }

    function formatHour(hour) {
        return `${pad(hour % 24)}:00`;
    }

    function shortDay(index) {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index];
    }

    function shortWeekDay(day) {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
    }

    function capitalize(value) {
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
    }

    function priorityClass(priority) {
        if (priority === "high") return "danger";
        if (priority === "medium") return "warning";
        return "success";
    }

    function dateKey(date) {
        return new Date(date).toISOString().slice(0, 10);
    }

    function todayKey() {
        return dateKey(new Date());
    }

    function daysBetween(previous, next) {
        const previousDate = new Date(previous); previousDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(next); nextDate.setHours(0, 0, 0, 0);
        return Math.round((nextDate - previousDate) / DAY_MS);
    }

    function uid() {
        return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    }

    function clamp(value, min, max) {
        const number = Number(value);
        if (Number.isNaN(number)) return min;
        return Math.min(max, Math.max(min, number));
    }

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function toRgba(hex, alpha) {
        const value = hex.replace("#", "");
        const expanded = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
        const int = Number.parseInt(expanded, 16);
        return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
    }

    function escapeHtml(value) {
        return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
    }

    function groupBy(array, accessor) {
        return array.reduce((groups, item) => {
            const key = accessor(item);
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {});
    }

    function handleCalendarSelect() {}

    function computeOverallStreak() {
        const days = new Set();
        state.habits.forEach((habit) => Object.keys(habit.history || {}).forEach((key) => days.add(key)));
        state.focusSessions.forEach((session) => days.add(dateKey(session.date)));
        return days.size ? Math.max(1, days.size) : 1;
    }

    function computeXP() {
        const taskXP = state.tasks.filter((task) => task.completed).length * 25;
        const habitXP = state.habits.reduce((total, habit) => total + Object.keys(habit.history || {}).length * 8, 0);
        const focusXP = state.focusSessions.reduce((total, session) => total + session.score, 0);
        const pomodoroXP = Object.values(state.pomodoro.history).reduce((total, count) => total + count * 20, 0);
        return taskXP + habitXP + focusXP + pomodoroXP;
    }

    function addXP(amount) {
        state.gamification.xp += amount;
        state.gamification.level = Math.floor(state.gamification.xp / 250) + 1;
    }

    function bindPomodoroTaskLink() {}

    function toggleModal() {}
})();