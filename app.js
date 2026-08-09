const scene = document.querySelector('.scene');
const continueButton = document.querySelector('.bottom-button');
const welcomeView = document.querySelector('.welcome-view');
const welcomeDateElement = document.querySelector('#welcome-date');
const welcomeTimeElement = document.querySelector('#welcome-time');
const desktopView = document.querySelector('.desktop-view');
const windowLayer = document.querySelector('.window-layer');
const taskbarButtons = [...document.querySelectorAll('.taskbar-app')];
const clockElement = document.querySelector('#clock');

const windows = new Map();
let topZ = 20;

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
    showWelcome();
  }
});

updateClock();
setInterval(updateClock, 1000);

taskbarButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showDesktop();
    openApp(button.dataset.app);
  });
});

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

  showDesktop();
  windowEntry.element.hidden = false;
  windowEntry.element.classList.add('open');
  windowEntry.element.dataset.state = 'windowed';
  restoreWindowState(windowEntry.element, config);
  focusWindow(windowEntry.element);
  markTaskbarActive(appId, true);

  if (appId === 'weather') {
    loadWeatherApp(windowEntry.element);
  }

  if (appId === 'camera') {
    startCameraApp(windowEntry.element);
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
  element.classList.remove('open');
  element.hidden = true;
  element.dataset.state = 'closed';
  markTaskbarActive(appId, false);
  stopCameraApp(element);
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
      </div>
      <div class="photos-grid" aria-label="Photo library"></div>
    </div>
  `;

  const heroImage = shell.querySelector('.photos-image');
  const photoGrid = shell.querySelector('.photos-grid');

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
