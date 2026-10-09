import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp shield + heartbeat/safety icon SVG
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e102d" />
      <stop offset="50%" stop-color="#130b20" />
      <stop offset="100%" stop-color="#0a0512" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3366" />
      <stop offset="50%" stop-color="#e94560" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#e94560" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer Pulse Ring -->
  <circle cx="256" cy="240" r="190" fill="none" stroke="#ff3366" stroke-width="4" stroke-opacity="0.25" stroke-dasharray="12 12" />

  <!-- Shield Shape -->
  <path d="M256 90 L390 145 C390 275 320 370 256 410 C192 370 122 275 122 145 Z"
        fill="url(#shieldGrad)"
        filter="url(#shadow)" />

  <!-- Inner Shield Highlight -->
  <path d="M256 102 L375 152 C375 268 312 354 256 392 C200 354 137 268 137 152 Z"
        fill="none"
        stroke="url(#glowGrad)"
        stroke-width="5" />

  <!-- Emergency / Life Beacon: Heart + SOS Cross / Pulse -->
  <path d="M256 195 C256 195 242 165 210 165 C175 165 155 195 155 228 C155 285 240 335 256 345 C272 335 357 285 357 228 C357 195 337 165 302 165 C270 165 256 195 256 195 Z"
        fill="#ffffff" />
  
  <!-- Pulse Line cutout -->
  <path d="M195 240 L225 240 L242 215 L256 265 L272 230 L285 245 L317 245"
        fill="none"
        stroke="#e94560"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round" />
</svg>`;

// Maskable icon with 15% safe padding
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e102d" />
      <stop offset="50%" stop-color="#130b20" />
      <stop offset="100%" stop-color="#0a0512" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3366" />
      <stop offset="50%" stop-color="#e94560" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bgGrad)" />
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Shield -->
    <path d="M256 90 L390 145 C390 275 320 370 256 410 C192 370 122 275 122 145 Z" fill="url(#shieldGrad)" />
    <!-- Heart + SOS -->
    <path d="M256 195 C256 195 242 165 210 165 C175 165 155 195 155 228 C155 285 240 335 256 345 C272 335 357 285 357 228 C357 195 337 165 302 165 C270 165 256 195 256 195 Z" fill="#ffffff" />
    <path d="M195 240 L225 240 L242 215 L256 265 L272 230 L285 245 L317 245" fill="none" stroke="#e94560" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

async function run() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

  const svgBuffer = Buffer.from(svgIcon);
  const maskableBuffer = Buffer.from(maskableSvg);

  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(maskableBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Successfully generated all PWA Android icons!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
