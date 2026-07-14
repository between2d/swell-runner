# Maré Limpa JP

Jogo 2D em pixel art sobre surfe, lixo, óleo e esgoto nas praias e rios urbanos de João Pessoa.

## Jogabilidade atual

O jogador não anda livremente sobre um chão azul. O direcional escolhe para onde a prancha tenta apontar, mas ela gira gradualmente e conserva velocidade e inércia.

- **Direcional / WASD:** orientar a prancha em quatro direções
- **Shift / CURVA:** fazer curva mais fechada, perdendo velocidade
- **Espaço / PULAR:** saltar ao alcançar a crista com embalo
- **F / FLOW:** gastar Flow para acelerar
- **E / DENÚNCIA:** registrar óleo ou esgoto pela borda segura
- **P / Esc:** pausar

Descer a parede da onda aumenta a velocidade. Subir consome embalo. A espuma, o tubo e as curvas perto da parte quebrando dão mais pontos, mas aumentam o risco. O jogo detecta cutbacks, 360 graus, saltos, giros no ar, pousos e tempo no tubo.

## Estrutura

- Rodadas de 40 segundos
- Missões de lixo recolhido e pontos aéreos
- Três poderes aleatórios após cada rodada
- Flow, combo, barra de Ação e bônus temporários
- Manchas e eventos de óleo e esgoto
- Lixo, nadadores, pedras e tubarões desenhados com silhuetas e rótulos legíveis
- Poderes herdados da versão anterior: gaivotas, tubarão reciclador, drone, rede, prancha pipoca, saco sem fundo, bloco, ímã, escudo, mutirão e outros
- Interface e textos integralmente em português

## Renderização pixel-perfect

A lógica do jogo continua usando uma grade de 320×180, mas o canvas é criado diretamente no maior múltiplo inteiro que cabe na tela: 320×180, 640×360, 960×540 e assim por diante. O tamanho interno e o tamanho exibido são idênticos, evitando interpolação, pixels desiguais e texto borrado. Espaço excedente vira moldura escura em vez de deformar a imagem.

## Referência ambiental

O jogo toma o Movimento Esgotei como referência local de mobilização e linguagem. É um projeto independente e não representa parceria oficial. Para decidir sobre banho de mar, consulte sempre os boletins oficiais de balneabilidade.

A versão pixel anterior está preservada na branch `arquivo-pixel-v1`. A versão Three.js está na branch `arquivo-versao-3d`.

## Desenvolvimento

```bash
npm install
npm run dev
```

```bash
npm run build
```