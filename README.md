# GeorgeOS

A feature-rich web-based desktop operating system that runs entirely in the browser. No installation, no backend — just open `index.html` and boot into a full desktop experience with a lock screen, window manager, taskbar, and a dock full of apps.

## ✨ Features

- **Lock screen** — live date/time clock with an "Enter" button to unlock and boot into the desktop
- **Window manager** — draggable, resizable, focusable, closable apps with titlebars and fullscreen support
- **Multi-workspace** — 4 switchable workspaces accessible via the overview grid and keyboard shortcuts
- **Apps (dock)**
  - 🧮 **Calculator**
  - 🖼 **Photos** — browse an image gallery
  - 🎨 **Paint** — draw with brush/eraser, clear, and save
  - ☀️ **Weather** — live weather via Open-Meteo API
  - 📷 **Camera** — real webcam capture, photo, and video recording
  - ✉️ **Mail**, 🗂 **Projects**, 🎵 **Holy Moly**, 💼 **LinkedIn**
  - 📺 **YouTube**, 📸 **Instagram**, 🃏 **System Breach**
  - 🎛 **Customization** — switch desktop themes
- **Todoist widget** — pinned task viewer on the desktop (refreshable)
- **Theming** — macOS, Windows 11, and Windows XP visual themes (preference persisted)
- **Sounds** — synthesized Web Audio sound effects for unlocking, opening, and closing apps (mutable)

## 🎨 Themes

Switch between three visual themes from the Customization app:

| Theme        | ID          |
| ------------ | ----------- |
| macOS        | `macos`     |
| Windows 11   | `windows11` |
| Windows XP   | `windowsxp` |

Your selection is saved in `localStorage` under `georgeos-theme`.

## 🖱 Controls

| Action                 | How to do it                     |
| ---------------------- | -------------------------------- |
| Unlock                 | Click the **Enter** button       |
| Open an app            | Click a taskbar icon             |
| Close an app           | Click the **✕** in the titlebar  |
| Drag / resize a window | Titlebar / bottom-right handle   |
| Workspace overview     | Click the **1/4** pill at the top |
| Return to lock screen  | Press **Escape**                 |

### Workspace shortcuts
Hold **Ctrl + Alt** and press `1`–`4` to jump to a workspace, or `← / → / ↑ / ↓` to move between them. **Meta** or **F2** toggles the overview.

## 🔊 Sound

GeorgeOS generates its sound effects live with the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — no audio files or external requests. To mute globally, call `__georgeosToggleMute()` from the console (state persists to `localStorage`).

## 🚀 Getting Started

GeorgeOS is a static site — there are no dependencies and no build step.

```bash
# Option A: open directly
open index.html

# Option B: run a local server (recommended for camera/API features)
python3 -m http.server 8000
# then visit http://localhost:8000
```

> When served over `http://` or `file://`, some features (webcam, live weather) may require a local server or HTTPS to work in the browser.

## 📁 Project Structure

```
GeorgeOS/
├── index.html          # Shell / lock & desktop screens
├── styles.css          # All styling & themes
├── app.js              # App logic, window manager, configs
├── icons/              # Taskbar app icons
└── *.jpg / *.png /*.svg # Wallpapers, avatars & assets
```

## 🛠 Tech

- Plain **HTML / CSS / JavaScript** — no frameworks
- **Web Audio API** for synthesized sound effects
- **Open-Meteo API** for live weather
- **Local Storage** for theme & sound preferences