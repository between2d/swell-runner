# Swell Runner: João Pessoa

A cartoon Three.js surfing game about collecting ocean garbage, documenting sewage points and avoiding contamination along a fictionalized João Pessoa coast.

## Current game loop

- Surf timed 35-second rounds.
- Collect bottles, cans, bags, tyres and Styrofoam for points, Flow and action bonuses.
- Approach the safe edge of sewage patches and register reports for extra points.
- Avoid rocks, buoys and direct contact with sewage.
- After each round, choose one of three permanent absurd upgrades.
- Stack upgrades across the run: cleanup seagulls, trash magnets, giant boards, coconut cannons, shields and other nonsense.
- Read a short local pollution-awareness message between rounds.

The game is educational fiction, not a live balneability map. Players should use official beach-quality reports when deciding whether to swim.

## Movimento Esgotei reference

The awareness language and protest-banner styling are inspired by **Movimento Esgotei**, a citizen environmental initiative from Paraíba focused on sewage, urban rivers, beaches, public reporting and collective action.

- Instagram: **@movimentoesgotei**
- Recurring ideas used in the game: “Eu esgotei. Nós esgotamos.”, “Denúncia + ação ambiental” and “Transforme indignação em atitude.”

This is an independent game prototype and does not claim an official partnership, endorsement or institutional affiliation with Movimento Esgotei.

## Controls

### Desktop

- **A / D** or **Left / Right:** carve
- **W / S** or **Up / Down:** speed
- **Space:** jump and spin
- **Shift:** Flow boost
- **E:** register a nearby sewage report
- **P / Escape:** pause

### Mobile

- Drag the left thumb pad to steer and control speed.
- Tap **JUMP** to jump.
- Hold **FLOW** to boost.
- Tap **DENÚNCIA** when the button lights up near a sewage patch.

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
