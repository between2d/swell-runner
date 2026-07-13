import './mobile.css';

const $ = (id) => document.getElementById(id);
const body = document.body;
const stick = $('stick-zone');
const knob = $('stick-knob');
const pauseButton = $('pause-button');
const fullscreenButton = $('fullscreen-button');
const touchControls = $('touch-controls');
const isTouchDevice = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;

body.classList.add('mobile-enhanced');
body.classList.toggle('touch-device', isTouchDevice);

const heldKeys = new Set();
const keyFor = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' };

function sendKey(code, down) {
  if (down === heldKeys.has(code)) return;
  if (down) heldKeys.add(code); else heldKeys.delete(code);
  window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {
    code,
    key: code,
    bubbles: true,
    cancelable: true,
  }));
}

function setDirection(x, y) {
  const deadZone = 0.18;
  sendKey(keyFor.left, x < -deadZone);
  sendKey(keyFor.right, x > deadZone);
  sendKey(keyFor.up, y < -deadZone);
  sendKey(keyFor.down, y > deadZone);
}

function releaseDirections() {
  Object.values(keyFor).forEach((code) => sendKey(code, false));
  if (knob) knob.style.transform = 'translate3d(0,0,0)';
  stick?.classList.remove('active');
}

if (stick && knob) {
  let pointerId = null;

  const moveStick = (event) => {
    if (pointerId !== event.pointerId) return;
    event.preventDefault();
    const rect = stick.getBoundingClientRect();
    const radius = rect.width * 0.34;
    let x = event.clientX - (rect.left + rect.width / 2);
    let y = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(x, y) || 1;
    const scale = Math.min(1, radius / distance);
    x *= scale;
    y *= scale;
    knob.style.transform = `translate3d(${x}px,${y}px,0)`;
    stick.classList.add('active');
    setDirection(x / radius, y / radius);
  };

  const stopStick = (event) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    releaseDirections();
  };

  stick.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerId = event.pointerId;
    stick.setPointerCapture?.(pointerId);
    navigator.vibrate?.(8);
    moveStick(event);
  }, { passive: false });
  stick.addEventListener('pointermove', moveStick, { passive: false });
  stick.addEventListener('pointerup', stopStick, { passive: false });
  stick.addEventListener('pointercancel', stopStick, { passive: false });
  stick.addEventListener('lostpointercapture', stopStick, { passive: false });
}

touchControls?.querySelectorAll('button').forEach((button) => {
  button.addEventListener('pointerdown', () => navigator.vibrate?.(button.dataset.action === 'jump' ? 18 : 10));
});

function tapKey(code) {
  window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }));
  requestAnimationFrame(() => window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true })));
}

pauseButton?.addEventListener('click', () => tapKey('KeyP'));

fullscreenButton?.addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  } catch {}
});

document.addEventListener('fullscreenchange', () => {
  if (fullscreenButton) fullscreenButton.textContent = document.fullscreenElement ? 'EXIT' : 'FULL';
});

let wakeLock = null;
async function keepAwake() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch {}
}

$('start-button')?.addEventListener('click', keepAwake);
$('restart-button')?.addEventListener('click', keepAwake);
$('resume-button')?.addEventListener('click', keepAwake);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) releaseDirections();
  else if (body.classList.contains('playing')) keepAwake();
});

function syncGameState() {
  const hudVisible = !$('hud')?.classList.contains('hidden');
  const menuOpen = $('menu')?.classList.contains('active');
  const gameOver = $('gameover-screen')?.classList.contains('active');
  const paused = $('pause-screen')?.classList.contains('active');
  body.classList.toggle('playing', Boolean(hudVisible && !menuOpen && !gameOver));
  body.classList.toggle('paused', Boolean(paused));
  if (!hudVisible || menuOpen || gameOver || paused) releaseDirections();
}

['hud', 'menu', 'pause-screen', 'gameover-screen'].forEach((id) => {
  const element = $(id);
  if (element) new MutationObserver(syncGameState).observe(element, { attributes: true, attributeFilter: ['class'] });
});
syncGameState();

function updateViewportHeight() {
  const height = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${height}px`);
}
window.visualViewport?.addEventListener('resize', updateViewportHeight);
window.addEventListener('orientationchange', () => setTimeout(updateViewportHeight, 150));
updateViewportHeight();

document.addEventListener('contextmenu', (event) => {
  if (event.target.closest('.touch-controls')) event.preventDefault();
});
