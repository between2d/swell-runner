import './style.css';

const quantidadeDePartes = 5;
const carregando = document.querySelector('#carregando');

try {
  const partes = await Promise.all(
    Array.from({ length: quantidadeDePartes }, (_, indice) =>
      fetch(new URL(`pixel/parte-${indice + 1}.txt`, document.baseURI)).then((resposta) => {
        if (!resposta.ok) throw new Error(`Parte ${indice + 1} não carregou: ${resposta.status}`);
        return resposta.text();
      }),
    ),
  );

  Function(`'use strict';\n${partes.join('\n')}`)();
} catch (erro) {
  console.error(erro);
  if (carregando) carregando.textContent = 'A MARÉ NÃO CARREGOU. ATUALIZE A PÁGINA.';
}
