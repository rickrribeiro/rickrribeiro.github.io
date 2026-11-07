/**
 * Vite plugin: validates src/content + src/i18n on the server side and exposes the
 * parsed result as `virtual:content`. The browser bundle therefore ships plain JSON
 * — no schema library — and invalid content fails dev/build with readable errors.
 */
import path from 'node:path';
import type { Plugin } from 'vite';
import { loadRawContent, publicAssetExists, root } from './load-content-fs';
import { validateContent, formatIssues } from '../src/lib/validate';

const ID = 'virtual:content';
const LOCALE_PREFIX = 'virtual:content-locale/';
const LOADERS = 'virtual:content-loaders';
const watched = [path.join(root, 'src/content'), path.join(root, 'src/i18n')];

export function contentPlugin(): Plugin {
  let lastWarnings = '';
  return {
    name: 'portfolio-content',
    resolveId(id) {
      if (id === ID || id === LOADERS || id.startsWith(LOCALE_PREFIX)) return '\0' + id;
      return null;
    },
    load(id) {
      if (!id.startsWith('\0virtual:content')) return null;
      const { content, issues } = validateContent(loadRawContent(), publicAssetExists);
      const errors = issues.filter((i) => i.level === 'error');
      if (errors.length || !content) this.error(`Invalid portfolio content:\n${formatIssues(errors)}`);
      const warnings = formatIssues(issues.filter((i) => i.level === 'warning'));
      if (warnings && warnings !== lastWarnings) {
        lastWarnings = warnings;
        this.warn(`content warnings:\n${warnings}`);
      }
      // Text is split per locale so a page only downloads its own language (+ the default as fallback).
      if (id === '\0' + LOADERS) {
        const entries = Object.keys(content!.locales).map((c) => `${JSON.stringify(c)}: () => import(${JSON.stringify(LOCALE_PREFIX + c)})`);
        return `export default { ${entries.join(', ')} };`;
      }
      if (id.startsWith('\0' + LOCALE_PREFIX)) {
        const code = id.slice(('\0' + LOCALE_PREFIX).length);
        // Country names are resolved here, once, so prerendered HTML and the browser
        // (which may ship a different ICU version) always show identical text.
        const tag = content!.site.locales.find((l) => l.code === code)?.tag ?? code;
        const display = new Intl.DisplayNames([tag], { type: 'region' });
        const shortNames: Record<string, string> = { HK: 'Hong Kong', MO: 'Macau' };
        const { cityCountry, regions } = content!.journey.overrides;
        const codes = new Set([...content!.trips.trips.map((t) => cityCountry[t.city] ?? t.country), ...content!.journey.places.map((p) => p.country)]);
        const countries = Object.fromEntries(
          [...codes].map((c) => [c, regions[c]?.[code] ?? regions[c]?.en ?? shortNames[c] ?? (display.of(c) ?? c).replace(/ SAR China$| \(.*\)$/, '')]),
        );
        return `export default ${JSON.stringify({ text: content!.locales[code] ?? {}, ui: content!.ui[code] ?? {}, countries })};`;
      }
      return `export default ${JSON.stringify({ ...content!, locales: {}, ui: {} })};`;
    },
    configureServer(server) {
      server.watcher.add(watched);
      const onChange = (file: string) => {
        if (!watched.some((d) => file.startsWith(d)) || !file.endsWith('.json')) return;
        for (const mod of server.moduleGraph.idToModuleMap.values()) {
          if (mod.id?.startsWith('\0virtual:content')) server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}
