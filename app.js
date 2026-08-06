const scene = document.querySelector('.scene');
const continueButton = document.querySelector('.bottom-button');
const welcomeView = document.querySelector('.welcome-view');
const desktopView = document.querySelector('.desktop-view');

function showDesktop() {
  scene.dataset.view = 'desktop';
  welcomeView.hidden = true;
  desktopView.hidden = false;
}

continueButton.addEventListener('click', showDesktop);