#!/usr/bin/env node
// Validate one recipe directory or all of them.
// Usage:
//   node scripts/validate.mjs                   # validate all recipes/*
//   node scripts/validate.mjs recipes/<slug>    # validate one recipe
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const recipeSchema = JSON.parse(readFileSync('schema/recipe.schema.json', 'utf8'));
const validateRecipe = ajv.compile(recipeSchema);

function fail(msg) { console.error(`FAIL: ${msg}`); process.exitCode = 1; }
function ok(msg) { console.log(`OK:   ${msg}`); }

function validateDir(dir) {
  const slug = basename(dir);
  const recipePath = join(dir, 'recipe.yml');
  const composePath = join(dir, 'compose.yml');
  const readmePath = join(dir, 'README.md');

  for (const p of [recipePath, composePath, readmePath]) {
    if (!existsSync(p)) { fail(`${slug}: missing ${p}`); return; }
  }
  let recipe;
  try { recipe = yaml.load(readFileSync(recipePath, 'utf8')); }
  catch (e) { fail(`${slug}: recipe.yml parse error: ${e.message}`); return; }

  if (!validateRecipe(recipe)) {
    for (const err of validateRecipe.errors) fail(`${slug}: recipe.yml ${err.instancePath} ${err.message}`);
    return;
  }
  if (recipe.id !== slug) { fail(`${slug}: recipe.id (${recipe.id}) must match folder name`); return; }

  let compose;
  try { compose = yaml.load(readFileSync(composePath, 'utf8')); }
  catch (e) { fail(`${slug}: compose.yml parse error: ${e.message}`); return; }
  if (!compose?.services || typeof compose.services !== 'object') {
    fail(`${slug}: compose.yml has no services`); return;
  }
  ok(slug);
}

const target = process.argv[2];
if (target) {
  validateDir(target);
} else {
  if (!existsSync('recipes')) { console.log('no recipes/ directory yet'); process.exit(0); }
  for (const entry of readdirSync('recipes')) {
    const full = join('recipes', entry);
    if (statSync(full).isDirectory()) validateDir(full);
  }
}
