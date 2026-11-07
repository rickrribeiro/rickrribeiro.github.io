/** Node-side loader (no Vite): reads the same files from disk for validation and prerendering scripts. */
import fs from 'node:fs';
import path from 'node:path';
import type { RawContent, RawLocale } from "../src/lib/validate";

export const root = path.resolve(import.meta.dirname, '..');
const contentDir = path.join(root, 'src/content');

export function readJson(file: string): unknown {
  const text = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON in ${path.relative(root, file)}: ${(e as Error).message}`);
  }
}

export function loadRawContent(): RawContent {
  const c = (name: string) => readJson(path.join(contentDir, `${name}.json`));
  const locales: Record<string, RawLocale> = {};
  for (const code of fs.readdirSync(path.join(contentDir, 'locales'))) {
    const dir = path.join(contentDir, 'locales', code);
    if (!fs.statSync(dir).isDirectory()) continue;
    locales[code] = {};
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      locales[code][f.replace(/\.json$/, '') as keyof RawLocale] = readJson(path.join(dir, f));
    }
  }
  const ui: Record<string, unknown> = {};
  for (const f of fs.readdirSync(path.join(root, 'src/i18n')).filter((f) => f.endsWith('.json'))) {
    ui[f.replace(/\.json$/, '')] = readJson(path.join(root, 'src/i18n', f));
  }
  return {
    site: c('site'),
    sections: c('sections'),
    theme: c('theme'),
    social: c('social'),
    skills: c('skills'),
    experience: c('experience'),
    education: c('education'),
    certifications: c('certifications'),
    languages: c('languages'),
    projects: c('projects'),
    talks: c('talks'),
    journey: c('journey'),
    trips: fs.existsSync(path.join(contentDir, 'trips.json')) ? c('trips') : undefined,
    locales,
    ui,
  };
}

export const publicAssetExists = (p: string) => fs.existsSync(path.join(root, 'public', decodeURI(p.split(/[?#]/)[0])));
