import './style.css';

const LARGURA_LOGICA = 320;
const ALTURA_LOGICA = 180;
const quantidadeDePartes = 10;

const tela = document.querySelector('#jogo');
const moldura = document.querySelector('#moldura');
const carregando = document.querySelector('#carregando');

let escalaAtual = 0;

function espacoDisponivel() {
  const controlePorToque = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900;
  const paisagemCompacta = controlePorToque && window.innerWidth > window.innerHeight && window.innerHeight <= 560;

  if (paisagemCompacta) {
    return {
      largura: Math.max(LARGURA_LOGICA, window.innerWidth * 0.76),
      altura: Math.max(ALTURA_LOGICA, window.innerHeight - 16),
    };
  }

  return {
    largura: Math.max(LARGURA_LOGICA, window.innerWidth - (controlePorToque ? 16 : 32)),
    altura: Math.max(ALTURA_LOGICA, window.innerHeight - (controlePorToque ? 190 : 90)),
  };
}

function prepararContexto(escala) {
  const contexto = tela.getContext('2d', { alpha: false });
  contexto.imageSmoothingEnabled = false;
  contexto.setTransform(escala, 0, 0, escala, 0, 0);
}

function aplicarEscalaInteira(forcar = false) {
  const espaco = espacoDisponivel();
  const escala = Math.max(
    1,
    Math.min(6, Math.floor(Math.min(
      espaco.largura / LARGURA_LOGICA,
      espaco.altura / ALTURA_LOGICA,
    ))),
  );

  if (!forcar && escala === escalaAtual) return;
  escalaAtual = escala;

  const larguraFisica = LARGURA_LOGICA * escala;
  const alturaFisica = ALTURA_LOGICA * escala;

  // O backing store e o tamanho CSS são idênticos. O navegador não precisa
  // esticar o bitmap e cada pixel lógico ocupa um quadrado perfeito.
  tela.width = larguraFisica;
  tela.height = alturaFisica;
  tela.style.width = `${larguraFisica}px`;
  tela.style.height = `${alturaFisica}px`;
  moldura.style.width = `${larguraFisica}px`;
  moldura.style.height = `${alturaFisica}px`;
  moldura.dataset.escala = `${escala}x`;

  prepararContexto(escala);
}

try {
  const partes = await Promise.all(
    Array.from({ length: quantidadeDePartes }, (_, indice) =>
      fetch(new URL(`pacote/parte-${indice + 1}.txt`, document.baseURI)).then((resposta) => {
        if (!resposta.ok) throw new Error(`Pacote ${indice + 1} não carregou: ${resposta.status}`);
        return resposta.text();
      }),
    ),
  );

  const pacote = partes.join('');
  const bytes = Uint8Array.from(atob(pacote), (caractere) => caractere.charCodeAt(0));

  if (!('DecompressionStream' in window)) {
    throw new Error('Navegador sem suporte a descompactação');
  }

  const fluxo = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const codigo = await new Response(fluxo).text();

  // O runtime sempre nasce na grade lógica declarada no HTML. Só depois de
  // ele criar seus estados e contexto ampliamos o backing store para 2x, 3x…
  Function(`'use strict';\n${codigo}`)();
  aplicarEscalaInteira(true);
} catch (erro) {
  console.error(erro);
  if (carregando) carregando.textContent = 'A MARÉ NÃO CARREGOU. ATUALIZE O NAVEGADOR.';
}

let ajustePendente = 0;
function agendarAjuste() {
  cancelAnimationFrame(ajustePendente);
  ajustePendente = requestAnimationFrame(() => aplicarEscalaInteira());
}

window.addEventListener('resize', agendarAjuste);
window.addEventListener('orientationchange', () => setTimeout(() => aplicarEscalaInteira(true), 120));