import './style.css';
import { finalizarInicializacaoAndroid, prepararExperienciaAndroid } from './android-native.js';

const LARGURA_LOGICA = 320;
const ALTURA_LOGICA = 180;
const quantidadeDePartes = 5;
const carregando = document.querySelector('#carregando');
const tela = document.querySelector('#jogo');
const moldura = document.querySelector('#moldura');
let escalaAtual = 0;

function areaVisual() {
  const viewport = window.visualViewport;
  return {
    largura: Math.floor(viewport?.width || window.innerWidth),
    altura: Math.floor(viewport?.height || window.innerHeight),
  };
}

function aplicarEscalaPixelPerfect(forcar = false) {
  const { largura, altura } = areaVisual();
  const nativo = document.documentElement.classList.contains('capacitor-nativo');
  const margemX = nativo ? 12 : 24;
  const margemY = nativo ? 12 : 92;
  const disponivelX = Math.max(LARGURA_LOGICA, largura - margemX);
  const disponivelY = Math.max(ALTURA_LOGICA, altura - margemY);
  const escala = Math.max(1, Math.min(6, Math.floor(Math.min(
    disponivelX / LARGURA_LOGICA,
    disponivelY / ALTURA_LOGICA,
  ))));

  if (!forcar && escala === escalaAtual) return;
  escalaAtual = escala;

  const larguraFisica = LARGURA_LOGICA * escala;
  const alturaFisica = ALTURA_LOGICA * escala;
  tela.width = larguraFisica;
  tela.height = alturaFisica;
  tela.style.width = `${larguraFisica}px`;
  tela.style.height = `${alturaFisica}px`;
  moldura.style.width = `${larguraFisica}px`;
  moldura.style.height = `${alturaFisica}px`;
  moldura.dataset.escala = `${escala}x`;

  const contexto = tela.getContext('2d', { alpha: false });
  contexto.imageSmoothingEnabled = false;
  contexto.setTransform(escala, 0, 0, escala, 0, 0);
}

await prepararExperienciaAndroid();

try {
  const partes = await Promise.all(
    Array.from({ length: quantidadeDePartes }, (_, indice) =>
      fetch(new URL(`duna/parte-${indice + 1}.txt`, document.baseURI)).then((resposta) => {
        if (!resposta.ok) throw new Error(`Parte ${indice + 1} não carregou: ${resposta.status}`);
        return resposta.text();
      }),
    ),
  );

  const pacote = partes.join('');
  const bytes = Uint8Array.from(atob(pacote), (caractere) => caractere.charCodeAt(0));
  if (!('DecompressionStream' in window)) throw new Error('Navegador sem suporte a descompactação');
  const fluxo = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const codigo = await new Response(fluxo).text();

  Function(`'use strict';\n${codigo}`)();
  aplicarEscalaPixelPerfect(true);
  await finalizarInicializacaoAndroid();
} catch (erro) {
  console.error(erro);
  if (carregando) carregando.textContent = 'A DUNA NÃO CARREGOU. REABRA O JOGO.';
  await finalizarInicializacaoAndroid();
}

let ajustePendente = 0;
function agendarAjuste() {
  cancelAnimationFrame(ajustePendente);
  ajustePendente = requestAnimationFrame(() => aplicarEscalaPixelPerfect());
}

window.addEventListener('resize', agendarAjuste);
window.visualViewport?.addEventListener('resize', agendarAjuste);
window.addEventListener('orientationchange', () => setTimeout(() => aplicarEscalaPixelPerfect(true), 140));
