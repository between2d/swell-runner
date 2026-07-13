# Swell Runner: João Pessoa

A cartoon Three.js surfing game about collecting ocean garbage and avoiding sewage along a fictionalized João Pessoa coast.

## Current game loop

- Surf timed 35-second rounds.
- Collect bottles, cans, bags, tyres and Styrofoam for points, Flow and ECO bonuses.
- Avoid rocks, buoys and sewage slicks.
- After each round, choose one of three permanent absurd upgrades.
- Stack upgrades across the run: cleanup seagulls, trash magnets, giant boards, coconut cannons, shields and other nonsense.
- Read a short local pollution-awareness fact between rounds.

The game is educational fiction, not a live balneability map. Players should use official beach-quality reports when deciding whether to swim.

## Controls

### Desktop

- **A / D** or **Left / Right:** carve
- **W / S** or **Up / Down:** speed
- **Space:** jump and spin
- **Shift:** Flow boost
- **P / Escape:** pause

### Mobile

- Drag the left thumb pad to steer and control speed.
- Tap **JUMP** to jump.
- Hold **FLOW** to boost.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

GitHub Pages deploys automatically from `main` through `.github/workflows/deploy.yml`.

## Tech

Three.js, GLSL, Vite, Web Audio API, touch, keyboard and gamepad input.

## License

MIT
