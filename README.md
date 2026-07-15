# Duna Livre para Android

Versão Android da Duna Livre, criada com Capacitor 8 sobre o jogo 2D em pixel art.

## Experiência móvel

- funciona offline depois de instalado
- orientação paisagem travada em celulares
- tela cheia imersiva, incluindo barra de navegação
- suporte a recortes, câmeras frontais e áreas seguras
- controles grandes posicionados nas laterais para uso com os polegares
- vibração nativa diferente para curva, vento e salto
- tela mantida acordada durante a partida
- retomada protegida ao voltar de outro aplicativo
- botão Voltar pausa; apertar novamente em até 1,5 segundo fecha o jogo
- ampliação pixel-perfect em múltiplos inteiros
- ícone adaptativo e splash screen próprios

## Construir o APK no GitHub

A workflow `.github/workflows/android-apk.yml` compila automaticamente a branch `android-duna-livre`.

1. Abra a aba **Actions** do repositório.
2. Escolha **Construir APK Duna Livre**.
3. Abra a execução mais recente.
4. Baixe o artefato **Duna-Livre-Android-APK**.
5. Extraia o ZIP e instale `Duna-Livre-Android.apk` no celular.

O artefato também inclui um arquivo SHA-256 para verificar o download.

## Desenvolvimento local

Requisitos: Node.js 22+, Android Studio e Android SDK.

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Para atualizar o conteúdo web depois que o projeto Android já existir:

```bash
npm run android:sync
```

## Branches

- `main`: Maré Limpa JP
- `duna-livre`: versão web de areia
- `android-duna-livre`: APK e experiência Android
