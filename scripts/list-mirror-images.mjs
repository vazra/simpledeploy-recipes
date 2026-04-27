#!/usr/bin/env node
// Emit one image per line for every image referenced by any recipe's compose.yml.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const out = new Set();
for (const entry of readdirSync('recipes')) {
  const dir = join('recipes', entry);
  if (!statSync(dir).isDirectory()) continue;
  const compose = yaml.load(readFileSync(join(dir, 'compose.yml'), 'utf8'));
  for (const svc of Object.values(compose?.services || {})) {
    if (typeof svc?.image === 'string' && !svc.image.includes('${')) out.add(svc.image);
  }
}
for (const img of [...out].sort()) console.log(img);
