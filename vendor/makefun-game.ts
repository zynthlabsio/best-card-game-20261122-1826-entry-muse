// SPDX-License-Identifier: MIT
// Minimal dossier builder for the Embercrown entry: lists the game files and
// screenshots copied into the output directory, with sizes and SHA-256
// hashes, honouring the caps passed by main.ts. Returns the JSON text.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function walk(dir, base, acc) {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path, base, acc);
    else {
      const bytes = readFileSync(path);
      acc.push({
        path: relative(base, path),
        bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      });
    }
  }
  return acc;
}

export function buildDossier(outDir, caps) {
  const gameFiles = walk(join(outDir, 'game'), outDir, []);
  const shots = walk(join(outDir, 'screenshots'), outDir, []);
  const dossier = {
    game: 'Embercrown',
    competition: 'best-card-game-20261122-1826',
    caps,
    game_files: gameFiles,
    game_total_bytes: gameFiles.reduce((sum, f) => sum + f.bytes, 0),
    screenshots: shots,
  };
  return JSON.stringify(dossier, null, 2) + '\n';
}
