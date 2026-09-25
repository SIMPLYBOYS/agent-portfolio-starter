// Optional asset preparation. Does not modify the source game project.
// Usage: node import-films.mjs /absolute/path/to/kiyochika-pixel
import { copyFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { films } from './public/films.js';

const source = process.argv[2];
if (!source) throw new Error('Provide the local kiyochika-pixel directory.');
const publicRoot = fileURLToPath(new URL('./public/', import.meta.url));
await mkdir(resolve(publicRoot, 'assets/films'), { recursive: true });
for (const film of films) {
  if (film.id === 'kiyochika-70') continue; // Existing unmodified clip and poster.
  const input = resolve(source, film.sourceFile);
  await copyFile(input, resolve(publicRoot, '.' + film.video));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '2', '-i', input, '-frames:v', '1', '-q:v', '3', resolve(publicRoot, '.' + film.poster)]);
  console.log(film.id, film.title);
}
