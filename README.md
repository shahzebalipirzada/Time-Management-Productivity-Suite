# Prodigy Pulse

Prodigy Pulse is a productivity and time-management dashboard built with vanilla HTML, CSS, and JavaScript. It turns a basic stopwatch into a polished single-page productivity OS with timers, task planning, habit tracking, analytics, journaling, and local persistence.

## Highlights

- Advanced stopwatch with laps, fastest/slowest split tracking, exports, keyboard shortcuts, and focus mode.
- Pomodoro timer with configurable work and break durations, automatic cycle switching, and session history.
- Multiple countdown timers and recurring alarms with snooze support.
- Task manager with priorities, due dates, progress controls, and drag-and-drop ordering.
- Habit tracker with streaks and a monthly calendar view.
- Focus session logging, goals, productivity insights, analytics charts, and gamified XP/levels.
- Dark and light themes, accent customization, responsive layout, localStorage persistence, import/export, and offline-ready PWA support.

## Run locally

Because this is a static app, run it through any local web server:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Keyboard Shortcuts

- `Space`: Start or pause the stopwatch
- `L`: Record a lap
- `R`: Reset the stopwatch
- `P`: Toggle Pomodoro
- `F`: Toggle focus mode
- `/`: Focus the search box
- `?`: Open the shortcuts modal
- `Escape`: Close modals

## Data Management

- Use the top bar actions to export or import your full backup as JSON.
- Lap history can be exported as CSV.
- Data is stored in `localStorage` and can be reset from the top bar.

## Project Structure

- `index.html` - App shell and metadata
- `style.css` - Full dashboard styling
- `script.js` - Application state, rendering, and interactions
- `manifest.json` - PWA manifest
- `service-worker.js` - Offline caching
- `icon.svg` - App icon
