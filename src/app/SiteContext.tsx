import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ParsedContent } from '../lib/validate';
import { createT, localeTag, siteText, type TFunction } from '../lib/content';
import { localizePath } from '../lib/routes';
import type { LocaleSite } from '../lib/schema';
import { content, ensureLocale, isLocaleLoaded } from './content';

export interface SiteContextValue {
  content: ParsedContent;
  locale: string;
  tag: string;
  t: TFunction;
  text: LocaleSite;
  /** Localizes an un-prefixed path ("/work/") for the current locale. */
  href: (path: string) => string;
  /** Path of the current page without locale prefix. */
  path: string;
}

const Ctx = createContext<SiteContextValue | null>(null);

export function SiteProvider({ locale, path, children }: { locale: string; path: string; children: ReactNode }) {
  // Language chunks load on demand; re-render once the requested one arrives.
  const [loaded, setLoaded] = useState(0);
  const ready = isLocaleLoaded(locale);
  useEffect(() => {
    if (!ready) ensureLocale(locale).then(() => setLoaded((n) => n + 1));
  }, [locale, ready]);
  const value = useMemo<SiteContextValue>(
    () => ({
      content,
      locale,
      tag: localeTag(content, locale),
      t: createT(content, locale),
      text: siteText(content, locale),
      href: (p: string) => localizePath(p, locale, content.site.defaultLocale),
      path,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, path, loaded, ready],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite(): SiteContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSite must be used inside <SiteProvider>');
  return v;
}
