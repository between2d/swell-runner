# Maré Limpa JP

Jogo 2D em pixel art sobre surfe, lixo e poluição nas praias e rios urbanos de João Pessoa.

## Direção atual

A versão pública foi reconstruída como um jogo lateral em baixa resolução, com arte original feita diretamente no Canvas 2D. A versão anterior em Three.js está preservada na branch `arquivo-versao-3d`.

Referências de linguagem e ritmo: jogos clássicos de surfe em visão lateral e jogos modernos feitos com PICO-8. Nenhum sprite ou código dessas referências foi copiado.

## Como jogar

- **Esquerda / direita:** mover na onda
- **Espaço / seta para cima:** pular
- **E:** denunciar um ponto de esgoto quando estiver na borda segura
- **P / Esc:** pausar

No celular, use os botões na tela.

## Estrutura

- Rodadas de 30 segundos
- Três poderes aleatórios ao fim de cada rodada
- Lixo recolhido rende pontos e combo
- Pontos de esgoto podem ser denunciados
- Obstáculos e contato com esgoto removem vidas
- Cenário inspirado de forma estilizada na orla de João Pessoa
- Interface e textos integralmente em português

## Referência ambiental

O jogo toma o Movimento Esgotei como referência local de mobilização e linguagem. É um projeto independente e não representa parceria oficial. Para decidir sobre banho de mar, consulte sempre os boletins oficiais de balneabilidade.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Produção

```bash
npm run build
```

GitHub Pages é publicado automaticamente pela workflow em `.github/workflows/deploy.yml`.
