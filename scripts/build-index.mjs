#!/usr/bin/env node
// Walk recipes/, validate each, emit dist/index.json plus copy raw files
// to dist/recipes/<slug>/ for direct fetch from GitHub Pages.
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const BASE_URL = process.env.RECIPES_BASE_URL || 'https://vazra.github.io/simpledeploy-recipes';
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const recipeSchema = JSON.parse(readFileSync('schema/recipe.schema.json', 'utf8'));
const indexSchema = JSON.parse(readFileSync('schema/index.schema.json', 'utf8'));
const validateRecipe = ajv.compile(recipeSchema);
const validateIndex = ajv.compile(indexSchema);

function ensureDir(d) { if (!existsSync(d)) mkdirSync(d, { recursive: true }); }

ensureDir('dist/recipes');
const out = { schema_version: 1, generated_at: new Date().toISOString(), recipes: [] };

if (!existsSync('recipes')) {
  console.error('no recipes/ directory'); process.exit(1);
}

for (const entry of readdirSync('recipes')) {
  const dir = join('recipes', entry);
  if (!statSync(dir).isDirectory()) continue;
  const slug = basename(dir);
  const recipe = yaml.load(readFileSync(join(dir, 'recipe.yml'), 'utf8'));
  if (!validateRecipe(recipe)) {
    console.error(`recipe ${slug} failed schema:`, validateRecipe.errors); process.exit(1);
  }
  if (recipe.id !== slug) { console.error(`${slug}: id mismatch`); process.exit(1); }

  const distDir = join('dist/recipes', slug);
  ensureDir(distDir);
  for (const f of ['recipe.yml', 'compose.yml', 'README.md']) {
    copyFileSync(join(dir, f), join(distDir, f));
  }
  const screenshot = join(dir, 'screenshot.png');
  let screenshotUrl;
  if (existsSync(screenshot)) {
    copyFileSync(screenshot, join(distDir, 'screenshot.png'));
    screenshotUrl = `${BASE_URL}/recipes/${slug}/screenshot.png`;
  }

  out.recipes.push({
    id: recipe.id,
    name: recipe.name,
    icon: recipe.icon,
    category: recipe.category,
    description: recipe.description,
    tags: recipe.tags || [],
    author: recipe.author,
    homepage: recipe.homepage,
    schema_version: recipe.schema_version,
    min_simpledeploy_version: recipe.min_simpledeploy_version,
    compose_url: `${BASE_URL}/recipes/${slug}/compose.yml`,
    readme_url: `${BASE_URL}/recipes/${slug}/README.md`,
    ...(screenshotUrl ? { screenshot_url: screenshotUrl } : {}),
  });
}

out.recipes.sort((a, b) => a.id.localeCompare(b.id));

if (!validateIndex(out)) {
  console.error('generated index failed schema:', validateIndex.errors); process.exit(1);
}

writeFileSync('dist/index.json', JSON.stringify(out, null, 2));
console.log(`built dist/index.json with ${out.recipes.length} recipe(s)`);
