/**
 * Validated content (see scripts/vite-plugin-content.ts). The core data is bundled;
 * each language's text is a separate chunk loaded on demand.
 */
import core from 'virtual:content';
import loaders from 'virtual:content-loaders';
import type { ParsedContent } from '../lib/validate';

export const content: ParsedContent = core;

const pending = new Map<string, Promise<void>>();

export const isLocaleLoaded = (code: string) => code in content.ui;

/** Loads a language's text (and the default language, used as fallback). */
export function ensureLocale(code: string): Promise<void> {
  const codes = [...new Set([content.site.defaultLocale, code])].filter((c) => c in loaders && !isLocaleLoaded(c));
  return Promise.all(
    codes.map((c) => {
      if (!pending.has(c)) {
        pending.set(
          c,
          loaders[c]().then((m) => {
            content.locales[c] = m.default.text;
            content.ui[c] = m.default.ui;
            (content.countries ??= {})[c] = m.default.countries;
          }),
        );
      }
      return pending.get(c)!;
    }),
  ).then(() => undefined);
}

export const loadAllLocales = () => Promise.all(Object.keys(loaders).map(ensureLocale)).then(() => undefined);
