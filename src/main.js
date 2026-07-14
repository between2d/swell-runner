import './style.css';

const carregando = document.querySelector('#carregando');
const quantidadeDePartes = 10;

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
  Function(`'use strict';\n${codigo}`)();
} catch (erro) {
  console.error(erro);
  if (carregando) carregando.textContent = 'A MARÉ NÃO CARREGOU. ATUALIZE O NAVEGADOR.';
}
