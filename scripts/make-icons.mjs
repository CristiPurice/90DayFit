// Generează icoanele PWA din public/icons/icon.svg. Rulează: npm run icons
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.join(here, '..', 'public', 'icons')
const svg = await readFile(path.join(iconsDir, 'icon.svg'))

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon-180.png', size: 180 },
]

for (const t of targets) {
  await sharp(svg).resize(t.size, t.size).png().toFile(path.join(iconsDir, t.file))
  console.log('scris', t.file)
}

// Maskable: conținutul în zona sigură (80%), fundal plin.
const inner = await sharp(svg).resize(410, 410).png().toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#1b3fd6' } })
  .composite([{ input: inner, left: 51, top: 51 }])
  .png()
  .toFile(path.join(iconsDir, 'maskable-512.png'))
console.log('scris maskable-512.png')
