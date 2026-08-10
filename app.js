const scene = document.querySelector('.scene');
const continueButton = document.querySelector('.bottom-button');
const welcomeView = document.querySelector('.welcome-view');
const welcomeDateElement = document.querySelector('#welcome-date');
const welcomeTimeElement = document.querySelector('#welcome-time');
const desktopView = document.querySelector('.desktop-view');
const windowLayer = document.querySelector('.window-layer');
const taskbarButtons = [...document.querySelectorAll('.taskbar-app')];
const clockElement = document.querySelector('#clock');
const overviewElement = document.querySelector('.overview');
const overviewGrid = document.querySelector('.overview-grid');
const overviewCloseButton = document.querySelector('.overview-close');
const workspacePill = document.querySelector('.workspace-pill');
const workspacePillDots = document.querySelector('.workspace-pill-dots');
const workspacePillLabel = document.querySelector('.workspace-pill-label');
const desktopWallpaperElement = document.querySelector('.desktop-wallpaper');

const WORKSPACE_COUNT = 4;
const WORKSPACE_COLUMNS = 2;

const windows = new Map();
let topZ = 20;
let currentWorkspace = 0;
let overviewOpen = false;

const weatherCodeMap = new Map([
  [0, { label: 'Clear', icon: '☀' }],
  [1, { label: 'Mostly clear', icon: '🌤' }],
  [2, { label: 'Partly cloudy', icon: '⛅' }],
  [3, { label: 'Cloudy', icon: '☁' }],
  [45, { label: 'Fog', icon: '🌫' }],
  [48, { label: 'Fog', icon: '🌫' }],
  [51, { label: 'Light drizzle', icon: '🌦' }],
  [53, { label: 'Drizzle', icon: '🌦' }],
  [55, { label: 'Heavy drizzle', icon: '🌧' }],
  [61, { label: 'Light rain', icon: '🌦' }],
  [63, { label: 'Rain', icon: '🌧' }],
  [65, { label: 'Heavy rain', icon: '🌧' }],
  [71, { label: 'Light snow', icon: '🌨' }],
  [73, { label: 'Snow', icon: '🌨' }],
  [75, { label: 'Heavy snow', icon: '❄' }],
  [80, { label: 'Rain showers', icon: '🌦' }],
  [81, { label: 'Rain showers', icon: '🌧' }],
  [82, { label: 'Heavy rain showers', icon: '⛈' }],
  [95, { label: 'Thunderstorm', icon: '⛈' }],
  [96, { label: 'Thunderstorm', icon: '⛈' }],
  [99, { label: 'Thunderstorm', icon: '⛈' }],
]);

const photoLibrary = [
  { src: 'IMG_9084.jpg', title: 'Photo 1' },
  { src: 'IMG_7691.jpg', title: 'Photo 2' },
  { src: 'IMG_8713.jpg', title: 'Photo 3' },
  { src: 'IMG_8025.jpg', title: 'Photo 4' },
  { src: 'IMG_7942.jpg', title: 'Photo 5' },
  { src: 'IMG_7477.jpg', title: 'Photo 6' },
];

const capturedPhotos = [];

const appConfigs = {
  calculator: {
    title: 'Calculator',
    x: 'calc(50% - 170px)',
    y: 'calc(50% - 170px)',
    width: '340px',
    height: '420px',
    build: buildCalculatorApp,
  },
  photos: {
    title: 'Photos',
    x: 'calc(50% - 260px)',
    y: 'calc(50% - 190px)',
    width: '520px',
    height: '420px',
    build: buildPhotosApp,
  },
  paint: {
    title: 'Paint',
    x: 'calc(50% - 280px)',
    y: 'calc(50% - 210px)',
    width: '560px',
    height: '460px',
    build: buildPaintApp,
  },
  weather: {
    title: 'Weather',
    x: 'calc(50% - 210px)',
    y: 'calc(50% - 170px)',
    width: '420px',
    height: '320px',
    build: buildWeatherApp,
  },
  camera: {
    title: 'Camera',
    x: 'calc(50% - 220px)',
    y: 'calc(50% - 180px)',
    width: '440px',
    height: '360px',
    build: buildCameraApp,
  },
  mail: {
    title: 'Mail',
    x: 'calc(50% - 230px)',
    y: 'calc(50% - 210px)',
    width: '460px',
    height: '440px',
    build: buildMailApp,
  },
  projects: {
    title: 'Projects',
    x: 'calc(50% - 250px)',
    y: 'calc(50% - 220px)',
    width: '500px',
    height: '480px',
    build: buildProjectsApp,
  },
  'holy-moly': {
    title: 'Holy Moly',
    x: 'calc(50% - 220px)',
    y: 'calc(50% - 170px)',
    width: '440px',
    height: '340px',
    build: buildHolyMolyApp,
  },
  linkedin: {
    title: 'LinkedIn',
    x: 'calc(50% - 220px)',
    y: 'calc(50% - 170px)',
    width: '440px',
    height: '340px',
    build: buildLinkedinApp,
  },
  youtube: {
    title: 'YouTube',
    x: 'calc(50% - 220px)',
    y: 'calc(50% - 170px)',
    width: '440px',
    height: '340px',
    build: buildYoutubeApp,
  },
  instagram: {
    title: 'Instagram',
    x: 'calc(50% - 220px)',
    y: 'calc(50% - 170px)',
    width: '440px',
    height: '340px',
    build: buildInstagramApp,
  },
  'system-breach': {
    title: 'System Breach',
    x: 'calc(50% - 220px)',
    y: 'calc(50% - 180px)',
    width: '440px',
    height: '360px',
    build: buildSystemBreachApp,
  },
};

function showDesktop() {
  scene.dataset.view = 'desktop';
  welcomeView.hidden = true;
  desktopView.hidden = false;
}

function showWelcome() {
  windows.forEach((windowEntry) => {
    if (windowEntry.element.dataset.app === 'camera') {
      stopCameraApp(windowEntry.element);
    }
  });

  scene.dataset.view = 'welcome';
  desktopView.hidden = true;
  welcomeView.hidden = false;
}

continueButton.addEventListener('click', showDesktop);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && scene.dataset.view === 'desktop') {
    if (overviewOpen) {
      closeOverview();
    } else {
      showWelcome();
    }
    return;
  }

  if (isWorkspaceShortcut(event)) {
    event.preventDefault();
    const target = workspaceForShortcut(event.key);
    if (event.key === 'Meta' || event.key === 'F2') {
      toggleOverview();
    } else {
      if (overviewOpen) {
        closeOverview();
      }
      switchWorkspace(target);
    }
  }
});

function isWorkspaceShortcut(event) {
  const isModifier = event.ctrlKey && event.altKey;
  if (isModifier) {
    return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '1', '2', '3', '4'].includes(event.key);
  }
  return event.key === 'Meta' || event.key === 'F2';
}

function workspaceForShortcut(key) {
  if (key === 'Meta' || key === 'F2') {
    return -1;
  }

  if (key === '1' || key === '2' || key === '3' || key === '4') {
    return Number(key) - 1;
  }

  const rows = Math.ceil(WORKSPACE_COUNT / WORKSPACE_COLUMNS);
  const row = Math.floor(currentWorkspace / WORKSPACE_COLUMNS);
  const col = currentWorkspace % WORKSPACE_COLUMNS;

  switch (key) {
    case 'ArrowUp':
      return (row - 1 + rows) % rows * WORKSPACE_COLUMNS + col;
    case 'ArrowDown':
      return (row + 1) % rows * WORKSPACE_COLUMNS + col;
    case 'ArrowLeft':
      return row * WORKSPACE_COLUMNS + (col - 1 + WORKSPACE_COLUMNS) % WORKSPACE_COLUMNS;
    case 'ArrowRight':
      return row * WORKSPACE_COLUMNS + (col + 1) % WORKSPACE_COLUMNS;
    default:
      return -1;
  }
}

updateClock();
setInterval(updateClock, 1000);

taskbarButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showDesktop();
    openApp(button.dataset.app);
  });
});

workspacePill.addEventListener('click', () => {
  showDesktop();
  toggleOverview();
});

overviewCloseButton.addEventListener('click', closeOverview);

for (let index = 0; index < WORKSPACE_COUNT; index += 1) {
  const dot = document.createElement('span');
  workspacePillDots.append(dot);
}

syncWorkspaceUI();

function openApp(appId) {
  const config = appConfigs[appId];
  if (!config) {
    return;
  }

  let windowEntry = windows.get(appId);
  if (!windowEntry) {
    const windowElement = createWindowShell(appId, config.title, config);
    const contentElement = config.build(windowElement);
    windowElement.querySelector('.window-content').append(contentElement);
    windowLayer.append(windowElement);
    windowEntry = { element: windowElement, appId };
    windows.set(appId, windowEntry);
  }

  const element = windowEntry.element;
  showDesktop();

  if (element.dataset.state === 'closed' || !element.dataset.state) {
    element.dataset.workspace = String(currentWorkspace);
    element.classList.add('open');
    element.dataset.state = 'windowed';
    restoreWindowState(element, config);
  }

  const windowWorkspace = Number(element.dataset.workspace) || 0;
  if (overviewOpen) {
    closeOverview();
  }
  if (windowWorkspace !== currentWorkspace) {
    switchWorkspace(windowWorkspace);
  } else {
    updateWindowVisibility();
  }

  focusWindow(element);
  markTaskbarActive(appId, true);

  if (appId === 'weather') {
    loadWeatherApp(element);
  }

  if (appId === 'camera') {
    startCameraApp(element);
  }
}

function createWindowShell(appId, title, config) {
  const element = document.createElement('section');
  element.className = 'app-window open';
  element.dataset.app = appId;
  element.style.left = config.x;
  element.style.top = config.y;
  element.style.width = config.width;
  element.style.height = config.height;
  element.style.zIndex = String(++topZ);

  const titlebar = document.createElement('header');
  titlebar.className = 'window-titlebar';
  titlebar.innerHTML = `
    <div class="window-controls">
      <button class="window-control close" type="button" aria-label="Close ${title}"></button>
      <button class="window-control fullscreen" type="button" aria-label="Fullscreen ${title}"></button>
    </div>
    <div class="window-title">${title}</div>
    <div aria-hidden="true" style="width: 48px;"></div>
  `;

  const content = document.createElement('div');
  content.className = 'window-content';

  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize-handle';

  element.append(titlebar, content, resizeHandle);

  const closeButton = titlebar.querySelector('.close');
  const fullscreenButton = titlebar.querySelector('.fullscreen');

  titlebar.addEventListener('pointerdown', (event) => beginDrag(event, element, titlebar));
  element.addEventListener('pointerdown', () => focusWindow(element));
  resizeHandle.addEventListener('pointerdown', (event) => beginResize(event, element));
  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    closeWindow(element);
  });
  fullscreenButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleFullscreen(element, config);
  });

  return element;
}

function focusWindow(element) {
  element.style.zIndex = String(++topZ);
}

function closeWindow(element) {
  const appId = element.dataset.app;
  element.dataset.state = 'closed';
  element.hidden = true;
  markTaskbarActive(appId, false);
  stopCameraApp(element);
  updateWindowVisibility();
}

function restoreWindowState(element, config) {
  if (element.dataset.state === 'fullscreen') {
    element.style.left = '0';
    element.style.top = '0';
    element.style.width = '100%';
    element.style.height = '100%';
    element.classList.add('maximized');
    return;
  }

  element.classList.remove('maximized');
  element.style.left = config.x;
  element.style.top = config.y;
  element.style.width = config.width;
  element.style.height = config.height;
}

function toggleFullscreen(element, config) {
  if (element.dataset.state === 'fullscreen') {
    element.dataset.state = 'windowed';
    restoreWindowState(element, config);
    focusWindow(element);
    return;
  }

  element.dataset.state = 'fullscreen';
  element.classList.add('maximized');
  element.style.left = '0';
  element.style.top = '0';
  element.style.width = '100%';
  element.style.height = '100%';
  focusWindow(element);
}

function beginDrag(event, element, handle) {
  if (event.target.closest('button')) {
    return;
  }

  if (element.dataset.state === 'fullscreen') {
    return;
  }

  const startRect = element.getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;
  const moveBounds = getDesktopBounds();

  focusWindow(element);
  handle.setPointerCapture(event.pointerId);

  const onPointerMove = (moveEvent) => {
    const nextLeft = startRect.left + (moveEvent.clientX - startX) - moveBounds.left;
    const nextTop = startRect.top + (moveEvent.clientY - startY) - moveBounds.top;
    element.style.left = `${Math.max(0, nextLeft)}px`;
    element.style.top = `${Math.max(0, nextTop)}px`;
  };

  const onPointerUp = () => {
    handle.releasePointerCapture(event.pointerId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp, { once: true });
}

function beginResize(event, element) {
  if (element.dataset.state === 'fullscreen') {
    return;
  }

  event.preventDefault();
  const handle = event.currentTarget;
  const startRect = element.getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;

  focusWindow(element);
  handle.setPointerCapture(event.pointerId);

  const onPointerMove = (moveEvent) => {
    const nextWidth = Math.max(280, startRect.width + (moveEvent.clientX - startX));
    const nextHeight = Math.max(220, startRect.height + (moveEvent.clientY - startY));
    element.style.width = `${nextWidth}px`;
    element.style.height = `${nextHeight}px`;
  };

  const onPointerUp = () => {
    handle.releasePointerCapture(event.pointerId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp, { once: true });
}

function getDesktopBounds() {
  const screen = desktopView.querySelector('.screen');
  return screen.getBoundingClientRect();
}

function markTaskbarActive(appId, isActive) {
  const button = taskbarButtons.find((entry) => entry.dataset.app === appId);
  if (!button) {
    return;
  }

  button.classList.toggle('active', isActive);
}

function updateWindowVisibility() {
  windows.forEach(({ element }) => {
    const isOpen = element.dataset.state !== 'closed';
    const isHere = Number(element.dataset.workspace) === currentWorkspace;
    if (isOpen && isHere) {
      element.hidden = false;
      element.classList.add('open');
    } else {
      element.hidden = true;
      element.classList.remove('open');
    }
  });
}

function switchWorkspace(nextWorkspace) {
  const from = currentWorkspace;
  const target = Math.max(0, Math.min(WORKSPACE_COUNT - 1, nextWorkspace));
  if (target === from) {
    return;
  }

  currentWorkspace = target;
  updateWindowVisibility();
  animateWorkspaceSlide(from, target);
  syncWorkspaceUI();
}

function animateWorkspaceSlide(from, to) {
  const fromRow = Math.floor(from / WORKSPACE_COLUMNS);
  const fromCol = from % WORKSPACE_COLUMNS;
  const toRow = Math.floor(to / WORKSPACE_COLUMNS);
  const toCol = to % WORKSPACE_COLUMNS;
  const horizontal = toCol !== fromCol;
  const distance = horizontal ? 54 : 38;
  const offset = horizontal
    ? (toCol - fromCol > 0 ? distance : -distance)
    : (toRow - fromRow > 0 ? distance : -distance);

  windowLayer.style.transition = 'none';
  windowLayer.style.transform = `translate3d(${horizontal ? offset : 0}px, ${horizontal ? 0 : offset}px, 0)`;
  windowLayer.getBoundingClientRect();
  windowLayer.style.transition = 'transform 300ms cubic-bezier(0.16, 0.84, 0.28, 1)';
  windowLayer.style.transform = 'translate3d(0, 0, 0)';

  window.clearTimeout(windowLayer._slideTimer);
  windowLayer._slideTimer = window.setTimeout(() => {
    windowLayer.style.transition = '';
  }, 320);
}

function syncWorkspaceUI() {
  workspacePillLabel.textContent = `${currentWorkspace + 1}/${WORKSPACE_COUNT}`;
  workspacePillDots.querySelectorAll('span').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentWorkspace);
  });
}

function toggleOverview() {
  if (overviewOpen) {
    closeOverview();
  } else {
    openOverview();
  }
}

function openOverview() {
  overviewOpen = true;
  overviewElement.hidden = false;
  renderOverview();
}

function closeOverview() {
  overviewOpen = false;
  overviewElement.hidden = true;
  overviewGrid.textContent = '';
}

function getScreenSize() {
  const screen = desktopView.querySelector('.screen');
  const rect = screen.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function renderOverview() {
  overviewGrid.textContent = '';
  const { width: screenWidth, height: screenHeight } = getScreenSize();

  for (let index = 0; index < WORKSPACE_COUNT; index += 1) {
    const cell = document.createElement('div');
    cell.className = `workspace-cell${index === currentWorkspace ? ' current' : ''}`;
    cell.dataset.workspace = String(index);
    cell.setAttribute('aria-label', `Desktop ${index + 1}`);
    cell.tabIndex = 0;

    const preview = document.createElement('div');
    preview.className = 'workspace-preview';

    const inner = document.createElement('div');
    inner.className = 'workspace-preview-inner';
    inner.style.width = `${screenWidth}px`;
    inner.style.height = `${screenHeight}px`;
    inner.style.transform = `scale(var(--preview-scale, 1))`;
    preview.style.setProperty('--preview-scale', '1');

    const wallpaper = document.createElement('div');
    wallpaper.className = 'workspace-preview-wallpaper';
    const wallpaperSrc = desktopWallpaperElement.style.backgroundImage || 'url("IMG_9084.jpg")';
    wallpaper.style.backgroundImage = wallpaperSrc;
    inner.append(wallpaper);

    windows.forEach(({ element }) => {
      if (element.dataset.state === 'closed' || Number(element.dataset.workspace) !== index) {
        return;
      }
      inner.append(buildPreviewWindow(element));
    });

    const name = document.createElement('div');
    name.className = 'workspace-cell-name';
    name.textContent = `Desktop ${index + 1}`;

    preview.append(inner);
    cell.append(preview, name);
    cell.addEventListener('click', () => selectWorkspaceFromOverview(index));
    overviewGrid.append(cell);

    window.requestAnimationFrame(() => {
      const cellRect = cell.getBoundingClientRect();
      const availWidth = cellRect.width;
      const availHeight = Math.max(40, cellRect.height - 34);
      const scale = Math.min(availWidth / screenWidth, availHeight / screenHeight, 1);
      inner.style.transform = `scale(${scale})`;
      preview.style.width = `${screenWidth * scale}px`;
      preview.style.height = `${screenHeight * scale}px`;
    });
  }
}

function buildPreviewWindow(element) {
  const clone = element.cloneNode(true);
  clone.classList.add('preview-window');
  clone.classList.remove('open', 'maximized');
  clone.dataset.state = 'preview';

  const titlebar = clone.querySelector('.window-titlebar');
  if (titlebar) {
    titlebar.classList.add('preview-window-titlebar');
    titlebar.style.cursor = 'grab';
  }

  const content = clone.querySelector('.window-content');
  if (content) {
    content.classList.add('preview-window-body');
  }

  const resizeHandle = clone.querySelector('.resize-handle');
  if (resizeHandle) {
    resizeHandle.remove();
  }

  const appId = clone.dataset.app;
  clone.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    beginPreviewDrag(event, clone, Number(element.dataset.workspace), appId, element);
  });

  return clone;
}

function beginPreviewDrag(event, previewWindow, sourceWorkspace, appId, realElement) {
  previewWindow.classList.add('dragging');
  const startX = event.clientX;
  const startY = event.clientY;
  const startedFromWorkspace = sourceWorkspace;
  let moved = false;
  let dropTarget = null;

  const onMove = (moveEvent) => {
    if (!moved && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 8) {
      moved = true;
    }

    const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest('.workspace-cell');
    const nextTarget = target && Number(target.dataset.workspace) !== startedFromWorkspace ? target : null;
    if (nextTarget !== dropTarget) {
      if (dropTarget) {
        dropTarget.classList.remove('drop-target');
      }
      dropTarget = nextTarget;
      if (dropTarget) {
        dropTarget.classList.add('drop-target');
      }
    }
  };

  const onUp = (upEvent) => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    previewWindow.classList.remove('dragging');

    const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest('.workspace-cell');

    if (dropTarget) {
      dropTarget.classList.remove('drop-target');
    }

    if (moved && target && Number(target.dataset.workspace) !== startedFromWorkspace) {
      moveWindowToWorkspace(appId, Number(target.dataset.workspace));
      renderOverview();
      return;
    }

    if (!moved) {
      selectWorkspaceFromOverview(startedFromWorkspace, true);
      focusWindow(realElement);
    }
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp, { once: true });
}

function moveWindowToWorkspace(appId, workspace) {
  const entry = windows.get(appId);
  if (!entry) {
    return;
  }
  entry.element.dataset.workspace = String(workspace);
  if (!overviewOpen) {
    updateWindowVisibility();
  }
}

function selectWorkspaceFromOverview(workspace, focusWindow = false) {
  closeOverview();
  switchWorkspace(workspace);
}

function updateClock() {
  const now = new Date();

  if (clockElement) {
    clockElement.textContent = new Intl.DateTimeFormat([], {
      hour: 'numeric',
      minute: '2-digit',
    }).format(now);
  }

  if (!welcomeDateElement || !welcomeTimeElement) {
    return;
  }

  welcomeDateElement.textContent = new Intl.DateTimeFormat([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now);

  const welcomeTime = new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .formatToParts(now)
    .filter((part) => part.type !== 'dayPeriod')
    .map((part) => part.value)
    .join('')
    .trim();

  welcomeTimeElement.textContent = welcomeTime;
}

function buildCalculatorApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'app-shell';

  const display = document.createElement('div');
  display.className = 'calculator-display';
  display.textContent = '0';

  const grid = document.createElement('div');
  grid.className = 'calculator-grid';

  const keys = [
    { label: 'AC', action: 'clear' },
    { label: '+/-', action: 'invert' },
    { label: '%', action: 'percent' },
    { label: '÷', action: 'operator', value: '/' },
    { label: '7', action: 'digit', value: '7' },
    { label: '8', action: 'digit', value: '8' },
    { label: '9', action: 'digit', value: '9' },
    { label: '×', action: 'operator', value: '*' },
    { label: '4', action: 'digit', value: '4' },
    { label: '5', action: 'digit', value: '5' },
    { label: '6', action: 'digit', value: '6' },
    { label: '−', action: 'operator', value: '-' },
    { label: '1', action: 'digit', value: '1' },
    { label: '2', action: 'digit', value: '2' },
    { label: '3', action: 'digit', value: '3' },
    { label: '+', action: 'operator', value: '+' },
    { label: '0', action: 'digit', value: '0' },
    { label: '.', action: 'digit', value: '.' },
    { label: '=', action: 'equals' },
  ];

  let currentValue = '0';
  let previousValue = null;
  let pendingOperator = null;
  let waitingForOperand = false;

  const syncDisplay = () => {
    display.textContent = currentValue;
  };

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      currentValue = digit === '.' ? '0.' : digit;
      waitingForOperand = false;
      syncDisplay();
      return;
    }

    if (digit === '.' && currentValue.includes('.')) {
      return;
    }

    currentValue = currentValue === '0' && digit !== '.' ? digit : `${currentValue}${digit}`;
    syncDisplay();
  };

  const handleOperator = (operator) => {
    const value = Number.parseFloat(currentValue);

    if (previousValue === null) {
      previousValue = value;
    } else if (pendingOperator) {
      previousValue = operate(previousValue, value, pendingOperator);
      currentValue = formatNumber(previousValue);
      syncDisplay();
    }

    pendingOperator = operator;
    waitingForOperand = true;
  };

  const reset = () => {
    currentValue = '0';
    previousValue = null;
    pendingOperator = null;
    waitingForOperand = false;
    syncDisplay();
  };

  const invert = () => {
    currentValue = formatNumber(Number.parseFloat(currentValue) * -1);
    syncDisplay();
  };

  const percent = () => {
    currentValue = formatNumber(Number.parseFloat(currentValue) / 100);
    syncDisplay();
  };

  const calculate = () => {
    if (pendingOperator === null || previousValue === null) {
      return;
    }

    const nextValue = Number.parseFloat(currentValue);
    currentValue = formatNumber(operate(previousValue, nextValue, pendingOperator));
    previousValue = null;
    pendingOperator = null;
    waitingForOperand = true;
    syncDisplay();
  };

  keys.forEach((key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = key.label;
    if (key.action === 'operator') {
      button.classList.add('operator');
    }
    if (key.action === 'equals') {
      button.classList.add('equals');
    }

    button.addEventListener('click', () => {
      switch (key.action) {
        case 'digit':
          inputDigit(key.value);
          break;
        case 'operator':
          handleOperator(key.value);
          break;
        case 'equals':
          calculate();
          break;
        case 'clear':
          reset();
          break;
        case 'invert':
          invert();
          break;
        case 'percent':
          percent();
          break;
        default:
          break;
      }
    });

    grid.append(button);
  });

  shell.append(display, grid);
  syncDisplay();
  return shell;
}

function buildPhotosApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'photos-shell';
  const initialPhoto = photoLibrary[0];
  shell.innerHTML = `
    <div class="photos-sidebar">
      <div class="photos-sidebar-title">Library</div>
      <button type="button" class="photos-album active">All Photos <span>${photoLibrary.length}</span></button>
    </div>
    <div class="photos-main">
      <div class="photos-hero">
        <img class="photos-image" src="${initialPhoto.src}" alt="Photo" />
        <button type="button" class="photos-wallpaper-btn">Set as Background</button>
      </div>
      <div class="photos-grid" aria-label="Photo library"></div>
    </div>
  `;

  const heroImage = shell.querySelector('.photos-image');
  const photoGrid = shell.querySelector('.photos-grid');
  const wallpaperBtn = shell.querySelector('.photos-wallpaper-btn');
  const wallpaperElement = document.querySelector('.desktop-wallpaper');

  photoLibrary.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `photos-thumb${index === 0 ? ' active' : ''}`;
    button.setAttribute('aria-label', `Photo ${index + 1}`);
    button.innerHTML = `
      <img src="${photo.src}" alt="Photo" />
    `;

    button.addEventListener('click', () => {
      heroImage.src = photo.src;
      heroImage.alt = 'Photo';
      shell.querySelectorAll('.photos-thumb').forEach((thumb) => thumb.classList.remove('active'));
      button.classList.add('active');
    });

    photoGrid.append(button);
  });

  wallpaperBtn.addEventListener('click', () => {
    wallpaperElement.style.backgroundImage = `url("${heroImage.src}")`;
  });

  return shell;
}

function buildPaintApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'paint-shell';
  shell.innerHTML = `
    <div class="paint-toolbar">
      <label class="paint-field">
        <span class="paint-field-label">Color</span>
        <input type="color" class="paint-color" value="#ff5f57" aria-label="Brush color" />
      </label>
      <label class="paint-field">
        <span class="paint-field-label">Size</span>
        <input type="range" class="paint-size" min="1" max="40" value="8" aria-label="Brush size" />
      </label>
      <button type="button" class="paint-tool paint-brush active">Brush</button>
      <button type="button" class="paint-tool paint-eraser">Eraser</button>
      <button type="button" class="paint-tool paint-clear">Clear</button>
      <button type="button" class="paint-save">Save</button>
    </div>
    <div class="paint-body">
      <div class="paint-gallery">
        <p class="paint-gallery-title">Photos</p>
        <div class="paint-sources">Loading photos…</div>
      </div>
      <div class="paint-stage">
        <canvas class="paint-canvas-back"></canvas>
        <canvas class="paint-canvas"></canvas>
        <p class="paint-empty">Pick a photo from the library to start painting.</p>
      </div>
    </div>
  `;

  const gallery = shell.querySelector('.paint-sources');
  const stage = shell.querySelector('.paint-stage');
  const backCanvas = shell.querySelector('.paint-canvas-back');
  const foreCanvas = shell.querySelector('.paint-canvas');
  const emptyNote = shell.querySelector('.paint-empty');
  const colorInput = shell.querySelector('.paint-color');
  const sizeInput = shell.querySelector('.paint-size');
  const brushButton = shell.querySelector('.paint-brush');
  const eraserButton = shell.querySelector('.paint-eraser');
  const clearButton = shell.querySelector('.paint-clear');
  const saveButton = shell.querySelector('.paint-save');

  const backContext = backCanvas.getContext('2d');
  const foreContext = foreCanvas.getContext('2d');
  let isEraser = false;
  let painting = false;
  let lastPoint = null;
  let activeThumb = null;

  function resizeCanvas(canvas, context) {
    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      const snapshot = context.getImageData ? context.getImageData(0, 0, canvas.width, canvas.height) : null;
      canvas.width = width;
      canvas.height = height;
      if (snapshot && snapshot.width > 0) {
        context.putImageData(snapshot, 0, 0);
      }
    }
    return { width, height };
  }

  function drawCover(context, image, width, height) {
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    context.drawImage(image, x, y, drawWidth, drawHeight);
  }

  function drawSource(src) {
    const image = new Image();
    image.onload = () => {
      const { width, height } = resizeCanvas(backCanvas, backContext);
      resizeCanvas(foreCanvas, foreContext);
      backContext.clearRect(0, 0, backCanvas.width, backCanvas.height);
      drawCover(backContext, image, width, height);
      foreContext.clearRect(0, 0, foreCanvas.width, foreCanvas.height);
      emptyNote.hidden = true;
      stage.hidden = false;
    };
    image.onerror = () => {
      emptyNote.textContent = 'Could not load that photo.';
      emptyNote.hidden = false;
    };
    image.src = src;
  }

  function sourceImage(photo, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `paint-source${index === 0 ? ' active' : ''}`;
    button.setAttribute('aria-label', photo.title);
    button.innerHTML = `<img src="${photo.src}" alt="${photo.title}" />`;
    button.addEventListener('click', () => {
      if (activeThumb) {
        activeThumb.classList.remove('active');
      }
      button.classList.add('active');
      activeThumb = button;
      drawSource(photo.src);
    });
    return button;
  }

  function renderGallery() {
    gallery.textContent = '';
    const allPhotos = [...photoLibrary, ...capturedPhotos];
    if (!allPhotos.length) {
      gallery.textContent = 'No photos yet.';
      return;
    }
    allPhotos.forEach((photo, index) => {
      gallery.append(sourceImage(photo, index));
    });
  }

  brushButton.addEventListener('click', () => {
    isEraser = false;
    brushButton.classList.add('active');
    eraserButton.classList.remove('active');
  });

  eraserButton.addEventListener('click', () => {
    isEraser = true;
    eraserButton.classList.add('active');
    brushButton.classList.remove('active');
  });

  clearButton.addEventListener('click', () => {
    foreContext.clearRect(0, 0, foreCanvas.width, foreCanvas.height);
  });

  saveButton.addEventListener('click', () => {
    if (emptyNote.hidden === false) {
      return;
    }
    const combined = document.createElement('canvas');
    combined.width = backCanvas.width;
    combined.height = backCanvas.height;
    const context = combined.getContext('2d');
    context.drawImage(backCanvas, 0, 0);
    context.drawImage(foreCanvas, 0, 0);
    combined.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const fileName = `georgeos-painting-${Date.now()}.png`;
      addDownload(windowElement, blob, fileName, 'Painting saved');
    }, 'image/png');
  });

  function pointFromEvent(event) {
    const rect = foreCanvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * foreCanvas.width,
      y: ((event.clientY - rect.top) / rect.height) * foreCanvas.height,
    };
  }

  function strokeTo(point) {
    foreContext.lineCap = 'round';
    foreContext.lineJoin = 'round';
    foreContext.strokeStyle = isEraser ? 'rgba(0, 0, 0, 1)' : colorInput.value;
    foreContext.lineWidth = Number(sizeInput.value) * (foreCanvas.width / rectWidthFactor());
    foreContext.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';

    const { x, y } = point;
    if (lastPoint) {
      foreContext.beginPath();
      foreContext.moveTo(lastPoint.x, lastPoint.y);
      foreContext.lineTo(x, y);
      foreContext.stroke();
    } else {
      foreContext.beginPath();
      foreContext.arc(x, y, foreContext.lineWidth / 2, 0, Math.PI * 2);
      foreContext.fillStyle = foreContext.strokeStyle;
      foreContext.fill();
    }
    lastPoint = point;
  }

  function rectWidthFactor() {
    return foreCanvas.getBoundingClientRect().width;
  }

  foreCanvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    painting = true;
    lastPoint = null;
    strokeTo(pointFromEvent(event));
    foreCanvas.setPointerCapture(event.pointerId);
  });

  foreCanvas.addEventListener('pointermove', (event) => {
    if (!painting) {
      return;
    }
    event.preventDefault();
    strokeTo(pointFromEvent(event));
  });

  foreCanvas.addEventListener('pointerup', (event) => {
    painting = false;
    lastPoint = null;
  });

  foreCanvas.addEventListener('pointercancel', () => {
    painting = false;
    lastPoint = null;
  });

  renderGallery();
  const initialPhoto = [...photoLibrary, ...capturedPhotos][0];
  if (initialPhoto) {
    drawSource(initialPhoto.src);
  }

  return shell;
}

function operate(left, right, operator) {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return right === 0 ? 0 : left / right;
    default:
      return right;
  }
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const formatted = Number(value.toFixed(8)).toString();
  return formatted;
}

function buildWeatherApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'weather-shell';
  shell.innerHTML = `
    <div class="weather-status">
      <div class="weather-city">Getting your location...</div>
      <div class="weather-temp">--°</div>
      <div class="weather-meta">Opening weather data for your current place.</div>
      <div class="weather-message">Allow location access to load live weather.</div>
    </div>
    <div class="weather-controls">
      <button type="button" class="refresh-weather">Refresh</button>
    </div>
  `;

  shell.querySelector('.refresh-weather').addEventListener('click', () => {
    loadWeatherApp(windowElement);
  });

  return shell;
}

async function loadWeatherApp(windowElement) {
  const status = windowElement.querySelector('.weather-status');
  if (!status) {
    return;
  }

  const cityNode = status.querySelector('.weather-city');
  const tempNode = status.querySelector('.weather-temp');
  const metaNode = status.querySelector('.weather-meta');
  const messageNode = status.querySelector('.weather-message');

  cityNode.textContent = 'Getting your location...';
  tempNode.textContent = '--°';
  metaNode.textContent = 'Opening weather data for your current place.';
  messageNode.textContent = 'Allow location access to load live weather.';

  if (!navigator.geolocation) {
    messageNode.textContent = 'Geolocation is not available in this browser.';
    return;
  }

  try {
    const locationResult = await getLocationCoordinates();
    const { latitude, longitude } = locationResult.coords;
    const [weatherResponse, reverseResponse] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`),
      fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&count=1`),
    ]);

    if (!weatherResponse.ok) {
      throw new Error('Weather request failed');
    }

    const weatherData = await weatherResponse.json();
    const reverseData = reverseResponse.ok ? await reverseResponse.json() : null;
    const location = reverseData?.results?.[0];
    const city = location
      ? [location.name, location.admin1].filter(Boolean).join(', ')
      : locationResult.label || `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`;
    const weatherCode = weatherData.current?.weather_code ?? 0;
    const weatherInfo = weatherCodeMap.get(weatherCode) ?? { label: 'Weather', icon: '◌' };
    const temp = Math.round(weatherData.current?.temperature_2m ?? 0);

    cityNode.textContent = city;
    tempNode.textContent = `${temp}° ${weatherInfo.icon}`;
    metaNode.textContent = weatherInfo.label;
    messageNode.textContent = locationResult.source === 'ip'
      ? 'Live weather using your approximate IP location.'
      : 'Live weather pulled from your current location.';
  } catch (error) {
    cityNode.textContent = 'Location unavailable';
    metaNode.textContent = 'Could not load weather right now.';
    messageNode.textContent = error?.message || 'Check location permissions and try again.';
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

async function getLocationCoordinates() {
  try {
    const coords = await Promise.race([
      getCurrentPosition(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Location lookup timed out.')), 1800);
      }),
    ]);
    return { coords, source: 'device', label: '' };
  } catch (error) {
    const fallbackResponse = await fetch('https://ipwho.is/');
    if (!fallbackResponse.ok) {
      throw error;
    }

    const fallbackData = await fallbackResponse.json();
    if (!fallbackData?.success || typeof fallbackData.latitude !== 'number' || typeof fallbackData.longitude !== 'number') {
      throw error;
    }

    const labelParts = [fallbackData.city, fallbackData.region, fallbackData.country].filter(Boolean);
    return {
      coords: { latitude: fallbackData.latitude, longitude: fallbackData.longitude },
      source: 'ip',
      label: labelParts.join(', '),
    };
  }
}

function buildCameraApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'camera-shell';
  shell.innerHTML = `
    <h2>Camera</h2>
    <div class="camera-preview">
      <video class="camera-view" autoplay playsinline muted></video>
      <canvas class="camera-canvas" hidden></canvas>
    </div>
    <div class="camera-status">Click start to request access to your camera.</div>
    <div class="camera-actions">
      <button type="button" class="start-camera">Start Camera</button>
      <button type="button" class="stop-camera">Stop Camera</button>
      <button type="button" class="capture-photo">Take Photo</button>
      <button type="button" class="record-video">Record Video</button>
      <button type="button" class="stop-recording" disabled>Stop Recording</button>
    </div>
    <div class="download-panel">
      <h3>Downloads</h3>
      <div class="download-list"></div>
    </div>
  `;

  shell.querySelector('.start-camera').addEventListener('click', () => {
    startCameraApp(windowElement);
  });
  shell.querySelector('.stop-camera').addEventListener('click', () => {
    stopCameraApp(windowElement);
  });
  shell.querySelector('.capture-photo').addEventListener('click', () => {
    capturePhoto(windowElement);
  });
  shell.querySelector('.record-video').addEventListener('click', () => {
    startRecording(windowElement);
  });
  shell.querySelector('.stop-recording').addEventListener('click', () => {
    stopRecording(windowElement);
  });

  return shell;
}

async function startCameraApp(windowElement) {
  const video = windowElement.querySelector('.camera-view');
  const message = windowElement.querySelector('.camera-status');
  if (!video || !message) {
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    message.textContent = 'Camera access is not available in this browser.';
    return;
  }

  try {
    stopCameraApp(windowElement);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    windowElement._cameraStream = stream;
    video.srcObject = stream;
    await video.play();
    message.textContent = 'Camera live.';
  } catch (error) {
    message.textContent = error?.message || 'Camera permission was denied.';
  }
}

function stopCameraApp(windowElement) {
  const video = windowElement.querySelector('.camera-view');
  const message = windowElement.querySelector('.camera-status');
  const stream = windowElement._cameraStream;

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    windowElement._cameraStream = null;
  }

  if (windowElement._mediaRecorder && windowElement._mediaRecorder.state !== 'inactive') {
    windowElement._mediaRecorder.stop();
  }

  windowElement._mediaRecorder = null;
  windowElement._recordChunks = [];

  if (video) {
    video.srcObject = null;
  }

  if (message) {
    message.textContent = 'Camera stopped.';
  }

  updateRecordingButtons(windowElement, false);
}

function capturePhoto(windowElement) {
  const video = windowElement.querySelector('.camera-view');
  const canvas = windowElement.querySelector('.camera-canvas');
  const message = windowElement.querySelector('.camera-status');

  if (!video || !canvas || !windowElement._cameraStream) {
    if (message) {
      message.textContent = 'Start the camera first.';
    }
    return;
  }

  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  canvas.hidden = false;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.drawImage(video, 0, 0, width, height);
  canvas.toBlob((blob) => {
    if (!blob) {
      if (message) {
        message.textContent = 'Could not capture photo.';
      }
      return;
    }

    const fileName = `georgeos-photo-${Date.now()}.png`;
    addDownload(windowElement, blob, fileName, 'Photo captured');
    capturedPhotos.push({ src: URL.createObjectURL(blob), title: `Captured ${capturedPhotos.length + 1}` });
    if (message) {
      message.textContent = 'Photo captured and ready to download.';
    }
  }, 'image/png');
}

function startRecording(windowElement) {
  const video = windowElement.querySelector('.camera-view');
  const message = windowElement.querySelector('.camera-status');

  if (!windowElement._cameraStream || !video) {
    if (message) {
      message.textContent = 'Start the camera first.';
    }
    return;
  }

  if (!window.MediaRecorder) {
    if (message) {
      message.textContent = 'Video recording is not supported in this browser.';
    }
    return;
  }

  if (windowElement._mediaRecorder && windowElement._mediaRecorder.state === 'recording') {
    return;
  }

  const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? { mimeType: 'video/webm;codecs=vp9' }
    : MediaRecorder.isTypeSupported('video/webm')
      ? { mimeType: 'video/webm' }
      : {};

  const recorder = new MediaRecorder(windowElement._cameraStream, options);
  windowElement._recordChunks = [];
  windowElement._mediaRecorder = recorder;
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      windowElement._recordChunks.push(event.data);
    }
  };
  recorder.onstop = () => {
    const chunks = windowElement._recordChunks || [];
    if (!chunks.length) {
      return;
    }

    const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
    const fileName = `georgeos-video-${Date.now()}.webm`;
    addDownload(windowElement, blob, fileName, 'Video recorded');
    if (message) {
      message.textContent = 'Video recorded and ready to download.';
    }
  };

  recorder.start();
  updateRecordingButtons(windowElement, true);
  if (message) {
    message.textContent = 'Recording...';
  }
}

function stopRecording(windowElement) {
  const recorder = windowElement._mediaRecorder;
  if (!recorder || recorder.state !== 'recording') {
    return;
  }

  recorder.stop();
  updateRecordingButtons(windowElement, false);
}

function updateRecordingButtons(windowElement, isRecording) {
  const recordButton = windowElement.querySelector('.record-video');
  const stopButton = windowElement.querySelector('.stop-recording');

  if (recordButton) {
    recordButton.disabled = isRecording;
  }
  if (stopButton) {
    stopButton.disabled = !isRecording;
  }
}

function addDownload(windowElement, blob, fileName, label) {
  const list = windowElement.querySelector('.download-list');
  if (!list) {
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.textContent = `${label} - ${fileName}`;
  link.addEventListener('click', () => {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, { once: true });
  list.prepend(link);
}

const mailDestination = 'curious.george71511@gmail.com';

function buildMailApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'mail-shell';
  shell.innerHTML = `
    <div class="mail-to">
      <span class="mail-to-label">To</span>
      <span class="mail-to-address">${mailDestination}</span>
    </div>
    <label class="mail-field">
      <span>Your name</span>
      <input type="text" class="mail-name" placeholder="George" maxlength="60" />
    </label>
    <label class="mail-field">
      <span>Subject</span>
      <input type="text" class="mail-subject" placeholder="What's this about?" maxlength="120" />
    </label>
    <label class="mail-field">
      <span>Message</span>
      <textarea class="mail-body" rows="6" maxlength="5000" placeholder="Write your message..."></textarea>
    </label>
    <button type="button" class="mail-send">Send Message</button>
    <p class="mail-hint">Your message is delivered straight to curious.george71511@gmail.com by an automated system.</p>
    <p class="mail-status" hidden></p>
  `;

  const nameInput = shell.querySelector('.mail-name');
  const subjectInput = shell.querySelector('.mail-subject');
  const bodyInput = shell.querySelector('.mail-body');
  const sendButton = shell.querySelector('.mail-send');
  const status = shell.querySelector('.mail-status');

  function markStatus(message, isError) {
    status.hidden = false;
    status.textContent = message;
    status.classList.toggle('error', isError);
  }

  async function sendMessage() {
    const name = nameInput.value.trim();
    const subject = subjectInput.value.trim();
    const body = bodyInput.value.trim();

    if (!name) {
      markStatus('Please enter your name.', true);
      nameInput.focus();
      return;
    }

    if (!body) {
      markStatus('Please write a message.', true);
      bodyInput.focus();
      return;
    }

    sendButton.disabled = true;
    sendButton.textContent = 'Sending…';
    markStatus('Sending your message…');

    const payload = {
      name,
      subject: subject || `Message from ${name}`,
      message: body,
      _subject: subject || `Mail from ${name} (GeorgeOS)`,
      _template: 'table',
    };

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${mailDestination}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      const success = result?.success === 'true' || response.ok;

      if (success) {
        markStatus('Message sent! Thank you for getting in touch.');
        nameInput.value = '';
        subjectInput.value = '';
        bodyInput.value = '';
      } else {
        markStatus(result?.message || 'Could not send the message. Try again shortly.', true);
      }
    } catch (error) {
      markStatus('Network error — your message was not sent. Check your connection and retry.', true);
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = 'Send Message';
    }
  }

  sendButton.addEventListener('click', sendMessage);

  return shell;
}

const githubUser = 'Geofoods';

const holyMolyUrl = 'https://bryanjietang-boop.itch.io/holy-moly';
let holyMolyOpenedOnce = false;

function buildHolyMolyApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'holymoly-shell';
  shell.innerHTML = `
    <img class="holymoly-banner" src="icons/holy-moly-icon.png" alt="" aria-hidden="true" />
    <h2>Holy Moly</h2>
    <p class="holymoly-description">
      An itch.io game — Holy Moly! Click below to play it in a new tab.
    </p>
    <button type="button" class="holymoly-launch">Play Holy Moly</button>
  `;

  shell.querySelector('.holymoly-launch').addEventListener('click', () => {
    launchHolyMoly(windowElement);
  });

  if (!holyMolyOpenedOnce) {
    holyMolyOpenedOnce = true;
    setTimeout(() => launchHolyMoly(windowElement), 300);
  }

  return shell;
}

function launchHolyMoly(windowElement) {
  window.open(holyMolyUrl, '_blank', 'noopener,noreferrer');

  const status = windowElement.querySelector('.holymoly-description');
  if (status) {
    status.textContent = 'Holy Moly opened in a new tab. Have fun!';
  }
}

const linkedinUrl = 'https://www.linkedin.com/in/george-sun-54647b2a7/';
let linkedinOpenedOnce = false;

function buildLinkedinApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'linkedin-shell';
  shell.innerHTML = `
    <img class="linkedin-banner" src="icons/linkedin-icon.webp" alt="" aria-hidden="true" />
    <h2>LinkedIn</h2>
    <p class="linkedin-description">
      My LinkedIn
    </p>
    <button type="button" class="linkedin-launch">Open LinkedIn</button>
  `;

  shell.querySelector('.linkedin-launch').addEventListener('click', () => {
    launchLinkedin(windowElement);
  });

  if (!linkedinOpenedOnce) {
    linkedinOpenedOnce = true;
    setTimeout(() => launchLinkedin(windowElement), 300);
  }

  return shell;
}

function launchLinkedin(windowElement) {
  window.open(linkedinUrl, '_blank', 'noopener,noreferrer');

  const status = windowElement.querySelector('.linkedin-description');
  if (status) {
    status.textContent = 'LinkedIn opened in a new tab.';
  }
}

const youtubeUrl = 'https://www.youtube.com/@GeorgesAttireOfficial';
let youtubeOpenedOnce = false;

function buildYoutubeApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'youtube-shell';
  shell.innerHTML = `
    <img class="youtube-banner" src="icons/R (5).png" alt="" aria-hidden="true" />
    <h2>YouTube</h2>
    <p class="youtube-description">
      Georges Attire Official — click below to open it in a new tab.
    </p>
    <button type="button" class="youtube-launch">Open YouTube</button>
  `;

  shell.querySelector('.youtube-launch').addEventListener('click', () => {
    launchYoutube(windowElement);
  });

  if (!youtubeOpenedOnce) {
    youtubeOpenedOnce = true;
    setTimeout(() => launchYoutube(windowElement), 300);
  }

  return shell;
}

function launchYoutube(windowElement) {
  window.open(youtubeUrl, '_blank', 'noopener,noreferrer');

  const status = windowElement.querySelector('.youtube-description');
  if (status) {
    status.textContent = 'YouTube opened in a new tab.';
  }
}

const instagramUrl = 'https://www.instagram.com/georgesunreal/';

function buildInstagramApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'instagram-shell';
  shell.innerHTML = `
    <img class="instagram-banner" src="icons/OIP.jpg" alt="" aria-hidden="true" />
    <h2>Instagram</h2>
    <p class="instagram-description">
      @georgesunreal
    </p>
    <button type="button" class="instagram-launch">Open Instagram</button>
  `;

  shell.querySelector('.instagram-launch').addEventListener('click', () => {
    launchInstagram(windowElement);
  });

  return shell;
}

function launchInstagram(windowElement) {
  window.open(instagramUrl, '_blank', 'noopener,noreferrer');

  const status = windowElement.querySelector('.instagram-description');
  if (status) {
    status.textContent = 'Instagram opened in a new tab.';
  }
}

function buildProjectsApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'projects-shell';
  shell.innerHTML = `
    <div class="projects-header">
      <div class="projects-profile">
        <img class="projects-avatar" alt="User avatar" />
        <div>
          <h2 class="projects-name">@Geofoods</h2>
          <p class="projects-sub">GitHub repositories</p>
        </div>
      </div>
      <button type="button" class="projects-refresh">Refresh</button>
    </div>
    <div class="projects-status">Loading repositories…</div>
    <div class="projects-list"></div>
  `;

  const avatarImg = shell.querySelector('.projects-avatar');
  const statusNode = shell.querySelector('.projects-status');
  const listNode = shell.querySelector('.projects-list');

  function renderList(repos) {
    listNode.textContent = '';
    repos.forEach((repo) => {
      const item = document.createElement('a');
      item.className = 'projects-item';
      item.href = repo.html_url;
      item.target = '_blank';
      item.rel = 'noopener noreferrer';

      const meta = [
        repo.language,
        repo.stargazers_count > 0 ? `★ ${repo.stargazers_count}` : '',
        repo.forks_count > 0 ? `⑂ ${repo.forks_count}` : '',
      ]
        .filter(Boolean)
        .join(' · ');

      item.innerHTML = `
        <div class="projects-item-top">
          <span class="projects-item-name">${repo.name}</span>
          ${repo.fork ? '<span class="projects-fork">fork</span>' : ''}
        </div>
        <p class="projects-item-desc">${repo.description || 'No description provided.'}</p>
        ${meta ? `<div class="projects-item-meta">${meta}</div>` : ''}
      `;

      listNode.append(item);
    });
  }

  async function loadProjects() {
    statusNode.hidden = false;
    statusNode.textContent = 'Loading repositories…';
    listNode.textContent = '';

    try {
      const response = await fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=100`);
      if (response.status === 404) {
        throw new Error('User not found on GitHub.');
      }
      if (!response.ok) {
        throw new Error('Could not load repositories.');
      }

      const repos = await response.json();
      avatarImg.src = repos[0]?.owner?.avatar_url || 'avatar.svg';
      renderList(repos);
      statusNode.hidden = true;
    } catch (error) {
      statusNode.textContent = error?.message || 'Could not load repositories.';
    }
  }

  shell.querySelector('.projects-refresh').addEventListener('click', loadProjects);

  loadProjects();
  return shell;
}

const systemBreachUrl = 'https://georgecodes.itch.io/system-breach';

function buildSystemBreachApp(windowElement) {
  const shell = document.createElement('div');
  shell.className = 'breach-shell';
  shell.innerHTML = `
    <img class="breach-icon" src="icons/system-breach-icon.png" alt="" aria-hidden="true" />
    <h2 class="breach-title">System Breach</h2>
    <p class="breach-desc">An itch.io game — Holy Moly! Click below to play it in a new tab.</p>
    <button type="button" class="breach-launch">Play System Breach</button>
    <p class="breach-hint">Opens the game page in a new tab.</p>
  `;

  shell.querySelector('.breach-launch').addEventListener('click', () => {
    window.open(systemBreachUrl, '_blank', 'noopener,noreferrer');
  });

  return shell;
}
