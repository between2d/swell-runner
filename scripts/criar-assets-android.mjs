import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('assets', { recursive: true });

const iconeCompleto = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="210" fill="#241720"/>
  <circle cx="735" cy="270" r="118" fill="#ffd166"/>
  <path d="M0 655C195 495 384 478 570 603c139 94 290 102 454 13v408H0Z" fill="#f18f3b"/>
  <path d="M0 750c205-122 392-112 562 30 137 114 291 116 462 18v226H0Z" fill="#d96f3d"/>
  <path d="M346 520h231l-39 25H318Z" fill="#52c7c8"/>
  <path d="M427 389h75v105h-75z" fill="#e65a7a"/>
  <path d="M441 329h52v61h-52z" fill="#f4aa73"/>
  <path d="M430 316h68v22h-68z" fill="#301925"/>
  <path d="M371 430h72v20h-72zM495 420h83v20h-83z" fill="#f4aa73"/>
  <path d="M400 490h33v66h-33zM500 488h33v67h-33z" fill="#301925"/>
  <path d="M265 664h490l-49 38H222Z" fill="#ffd166"/>
  <path d="M292 676h408l-39 12H267Z" fill="#e65a7a"/>
</svg>`;

const iconeFrente = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="735" cy="270" r="108" fill="#ffd166"/>
  <path d="M346 520h231l-39 25H318Z" fill="#52c7c8"/>
  <path d="M427 389h75v105h-75z" fill="#e65a7a"/>
  <path d="M441 329h52v61h-52z" fill="#f4aa73"/>
  <path d="M430 316h68v22h-68z" fill="#301925"/>
  <path d="M371 430h72v20h-72zM495 420h83v20h-83z" fill="#f4aa73"/>
  <path d="M400 490h33v66h-33zM500 488h33v67h-33z" fill="#301925"/>
  <path d="M265 664h490l-49 38H222Z" fill="#ffd166"/>
  <path d="M292 676h408l-39 12H267Z" fill="#e65a7a"/>
</svg>`;

const iconeFundo = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#241720"/>
  <path d="M0 655C195 495 384 478 570 603c139 94 290 102 454 13v408H0Z" fill="#f18f3b"/>
  <path d="M0 750c205-122 392-112 562 30 137 114 291 116 462 18v226H0Z" fill="#d96f3d"/>
</svg>`;

const splash = `
<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="#241720"/>
  <circle cx="2035" cy="710" r="320" fill="#ffd166"/>
  <path d="M0 1760c522-420 1034-454 1533-102 364 257 764 270 1199 38v1036H0Z" fill="#f18f3b"/>
  <path d="M0 2040c564-304 1070-255 1519 147 352 315 757 322 1213 78v467H0Z" fill="#d96f3d"/>
  <g transform="translate(696 850) scale(1.45)">
    <path d="M346 520h231l-39 25H318Z" fill="#52c7c8"/>
    <path d="M427 389h75v105h-75z" fill="#e65a7a"/>
    <path d="M441 329h52v61h-52z" fill="#f4aa73"/>
    <path d="M430 316h68v22h-68z" fill="#160d13"/>
    <path d="M371 430h72v20h-72zM495 420h83v20h-83z" fill="#f4aa73"/>
    <path d="M400 490h33v66h-33zM500 488h33v67h-33z" fill="#160d13"/>
    <path d="M265 664h490l-49 38H222Z" fill="#ffd166"/>
    <path d="M292 676h408l-39 12H267Z" fill="#e65a7a"/>
  </g>
  <text x="1366" y="730" text-anchor="middle" fill="#ffd166" font-family="monospace" font-size="250" font-weight="900">DUNA</text>
  <text x="1366" y="975" text-anchor="middle" fill="#e65a7a" font-family="monospace" font-size="220" font-weight="900">LIVRE</text>
  <text x="1366" y="2310" text-anchor="middle" fill="#fff2c9" font-family="monospace" font-size="72" font-weight="700">SAND SURF DO NORDESTE</text>
</svg>`;

await Promise.all([
  sharp(Buffer.from(iconeCompleto)).png().toFile('assets/icon-only.png'),
  sharp(Buffer.from(iconeFrente)).png().toFile('assets/icon-foreground.png'),
  sharp(Buffer.from(iconeFundo)).png().toFile('assets/icon-background.png'),
  sharp(Buffer.from(splash)).png().toFile('assets/splash.png'),
  sharp(Buffer.from(splash)).modulate({ brightness: 0.7, saturation: 0.9 }).png().toFile('assets/splash-dark.png'),
]);

console.log('Assets Android criados em assets/.');
