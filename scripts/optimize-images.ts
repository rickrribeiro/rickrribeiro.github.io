/**
 * `npm run images` — converts every .jpg/.jpeg/.png under public/images into an
 * optimized .webp next to it (max 2000px wide) and prints the width/height to
 * paste into the JSON. Originals are left untouched; delete them once the .webp
 * is referenced.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { root } from './load-content-fs';

const dir = path.join(root, 'public/images');
const walk = (d: string): string[] =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

for (const file of walk(dir).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const out = file.replace(/\.(jpe?g|png)$/i, '.webp');
  if (fs.existsSync(out)) continue;
  const info = await sharp(file).resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
  console.log(`${path.relative(root, out)}  →  "width": ${info.width}, "height": ${info.height}  (${Math.round(info.size / 1024)} KB)`);
}
