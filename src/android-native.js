import { Capacitor, SystemBars } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { SplashScreen } from '@capacitor/splash-screen';
import { TextZoom } from '@capacitor/text-zoom';

const nativo = Capacitor.isNativePlatform();
let ultimoVoltar = 0;
let listenersInstalados = false;

function teclaVirtual(codigo) {
  window.dispatchEvent(new KeyboardEvent('keydown', { code: codigo, bubbles: true }));
  requestAnimationFrame(() => {
    window.dispatchEvent(new KeyboardEvent('keyup', { code: codigo, bubbles: true }));
  });
}

async function imersaoTotal() {
  if (!nativo) return;
  await Promise.allSettled([
    ScreenOrientation.lock({ orientation: 'landscape' }),
    SystemBars.hide(),
    TextZoom.set({ value: 1 }),
  ]);
}

function mostrarRetomada(mostrar) {
  document.body.classList.toggle('android-suspenso', mostrar);
  const camada = document.querySelector('#retomar-android');
  if (camada) camada.setAttribute('aria-hidden', mostrar ? 'false' : 'true');
}

function instalarHaptica() {
  const intensidade = {
    curva: ImpactStyle.Light,
    vento: ImpactStyle.Medium,
    pular: ImpactStyle.Heavy,
    cima: ImpactStyle.Light,
    baixo: ImpactStyle.Light,
    esquerda: ImpactStyle.Light,
    direita: ImpactStyle.Light,
  };

  for (const botao of document.querySelectorAll('[data-acao]')) {
    botao.addEventListener('pointerdown', () => {
      if (!nativo) return;
      Haptics.impact({ style: intensidade[botao.dataset.acao] || ImpactStyle.Light }).catch(() => {});
    }, { passive: true });
  }

  document.querySelector('#botao-som')?.addEventListener('click', () => {
    if (nativo) Haptics.selectionChanged().catch(() => {});
  });
}

function instalarGestosSeguros() {
  document.addEventListener('contextmenu', (evento) => evento.preventDefault());
  document.addEventListener('dragstart', (evento) => evento.preventDefault());
  document.addEventListener('selectstart', (evento) => evento.preventDefault());

  let ultimoToque = 0;
  document.addEventListener('touchend', (evento) => {
    const agora = performance.now();
    if (agora - ultimoToque < 280) evento.preventDefault();
    ultimoToque = agora;
  }, { passive: false });
}

function instalarCicloDoAplicativo() {
  if (!nativo || listenersInstalados) return;
  listenersInstalados = true;

  App.addListener('appStateChange', async ({ isActive }) => {
    if (!isActive) {
      mostrarRetomada(true);
      window.dispatchEvent(new Event('blur'));
      return;
    }
    await imersaoTotal();
    mostrarRetomada(true);
  });

  App.addListener('backButton', () => {
    const agora = Date.now();
    if (agora - ultimoVoltar < 1500) {
      App.exitApp();
      return;
    }
    ultimoVoltar = agora;
    teclaVirtual('Escape');
    mostrarRetomada(true);
    const aviso = document.querySelector('#aviso-voltar');
    if (aviso) aviso.textContent = 'APERTE VOLTAR DE NOVO PARA SAIR';
    Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
  });
}

export async function prepararExperienciaAndroid() {
  document.documentElement.classList.toggle('capacitor-nativo', nativo);
  document.documentElement.classList.toggle('android-nativo', Capacitor.getPlatform() === 'android');
  document.documentElement.classList.toggle('controle-toque', matchMedia('(pointer: coarse)').matches);

  instalarGestosSeguros();
  instalarHaptica();
  instalarCicloDoAplicativo();

  const camada = document.querySelector('#retomar-android');
  camada?.addEventListener('pointerdown', async () => {
    await imersaoTotal();
    mostrarRetomada(false);
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
  });

  await imersaoTotal();
}

export async function finalizarInicializacaoAndroid() {
  if (!nativo) return;
  await imersaoTotal();
  await SplashScreen.hide({ fadeOutDuration: 220 }).catch(() => {});
}
