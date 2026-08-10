# AGENTS.md

## Quick Start

```bash
npm install --cache /tmp/npm-cache-new   # npm cache has permission issues
npm start                                 # or: npm run dev
npm run build:mac                         # builds .dmg + .zip
```

## Architecture

Electron app. Three renderer windows, one main process.

```
main.js              ← entry point, IPC handlers, window lifecycle
preload.js           ← bridges main↔renderer, exposes window.electronAPI
config.js            ← provider templates, model lists, window sizes
store.js             ← electron-store wrapper, all persistent data
renderer/
  pet.html           ← desktop pet window (128x128 transparent)
  chat.html          ← AI chat window
  settings.html      ← settings window (tab-based)
  calendar-service.js ← CalDAV/ICS fetch, event parsing
  reminder-manager.js ← reminder scheduling, persistent bubble IPC
  pet-animator.js    ← Canvas-based pixel art animation
  sprite-generator.js ← character pixel data + palette system
  mood-system.js     ← mood value (0-100), affects dialogue
  dialogue-manager.js ← timed dialogue bubbles
docs/                ← PRD, plans, project status (not shipped)
```

## IPC Pattern

All IPC follows this flow:
1. `main.js`: `ipcMain.handle('channel-name', handler)`
2. `preload.js`: expose function in `contextBridge.exposeInMainWorld('electronAPI', {...})`
3. Renderer: `await window.electronAPI.methodName()`

For events pushed from main→renderer:
1. `main.js`: `petWindow.webContents.send('channel-name', data)`
2. `preload.js`: `ipcRenderer.on('channel-name', callback)`
3. Renderer: register listener in script block

## Data Storage

User config persists at `~/Library/Application Support/Yuns桌面助手/yuns-desktop-pet-config.json` (macOS). This is outside the repo — cloning fresh does NOT reset user settings.

Key stores: `apiConfigs[]`, `calendarConfig`, `petMood`, `darkMode`, `mcpServers[]`

## Calendar Reminder System

- `calendar-service.js`: fetches events via CalDAV (`tsdav`) or ICS (`node-ical`), caches in memory
- `reminder-manager.js`: checks every 1 min if any event is in reminder window (reminderTime → eventEnd), sends IPC to show persistent bubble
- Persistent bubble: HTML overlay in pet.html, window resizes from 128×128 to 300×280 when shown
- Refresh: default 5 min, configurable 1-60 min, also triggers `checkReminders()` immediately after each refresh
- `getUpcomingEvents()` filters `eventEnd >= now` (includes in-progress events, not just future starts)

## Model Config

`config.js` → `providerTemplates` defines all supported AI providers. Each provider has `models[]` with `id`, `description`, `contextLength`, `supportsVision`, etc. Models were last updated 2026-08 against https://models.dev/api.json.

Auth types: `bearer` (most), `query` (Gemini), `anthropic` (Claude custom header).

## Known Quirks

- **npm cache**: `~/.npm` has root-owned files. Always use `npm install --cache /tmp/npm-cache-new` or fix with `sudo chown -R $(id -u) ~/.npm`
- **Electron postinstall**: blocked by default. Run `npm install-scripts approve electron` then `node node_modules/electron/install.js`
- **GPG signing**: git commits are GPG-signed. Program at `/usr/local/bin/gpg`. If signing fails, tell user rather than committing unsigned
- **GitHub push**: may need proxy enabled. Clone acceleration via `gh-proxy.com` prefix
- **Pet window size**: dynamically resizes (128→300 width, 128→280 height) when calendar bubble shows. CSS uses `position: fixed; top: 10px` for bubble
- **No test suite**: no test framework configured. Verify by running `npm start`
- **No linter/formatter**: no eslint, prettier, or similar configured

## Docs Convention

- `docs/PRD.md`: product requirements (overwritten per feature)
- `docs/PROJECT_STATUS.md`: operation history log, append with auto-incrementing index
- `CHANGELOG.md`: Keep a Changelog format, bilingual
- `README.md`: bilingual (Chinese/English)
