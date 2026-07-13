# Swell Runner: João Pessoa

A compact arcade surfing game built with Three.js and Vite, set along a deliberately stylized João Pessoa shoreline. Procedural scenery includes a beachfront skyline, palms, kiosks, a circular Hotel Tambaú-inspired silhouette, Cabo Branco red cliffs and lighthouse, floating garbage, sewage slicks, foam, sky, and synthesized audio. No external art assets are required.

## Play

- **A / D** or **Left / Right**: carve
- **W / S** or **Up / Down**: speed up or slow down
- **Space**: jump
- **Left / Right while airborne**: spin
- **Shift**: spend Flow for a speed boost
- **P / Escape**: pause
- Touchscreen controls are included

Chain clean carves, collect sun rings, land full spins, and avoid rocks and buoys. Floating trash and sewage slicks break combos, drain Flow, subtract points, and slow the surfer. A failed landing or hard collision costs a life.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The optimized site is written to `dist/`.

## GitHub Pages

The included workflow in `.github/workflows/deploy.yml` builds and deploys the game on every push to `main`. In the repository settings, set **Pages → Source** to **GitHub Actions** if GitHub does not select it automatically.

## Tech

- Three.js
- GLSL vertex and fragment shaders
- Vite
- Web Audio API
- Keyboard and touch input

## License

MIT
