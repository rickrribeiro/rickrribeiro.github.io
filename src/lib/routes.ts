/**
 * URL scheme (static-hosting friendly, trailing slashes):
 *   /                       English (default locale, no prefix)
 *   /work/  /work/<id>/  /about/  /lab/  /talks/  /journey/  /contact/
 *   /pt/…  /es/…            other locales use a prefix
 */
import type { ParsedContent } from './validate';
import type { PageId } from './schema';
import { isPageEnabled, labProjects, workProjects } from './content';

export const pagePaths: Record<PageId | 'home', string> = {
  home: '/',
  work: '/work/',
  about: '/about/',
  lab: '/lab/',
  talks: '/talks/',
  journey: '/journey/',
  contact: '/contact/',
};

export const projectPath = (id: string) => `/work/${id}/`;

export function localizePath(path: string, locale: string, defaultLocale: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === defaultLocale ? clean : `/${locale}${clean}`;
}

/** Splits "/pt/work/x/" into { locale: "pt", path: "/work/x/" }. Unknown prefixes are treated as paths. */
export function splitLocale(pathname: string, locales: string[], defaultLocale: string): { locale: string; path: string } {
  const m = pathname.match(/^\/([a-z]{2})(\/.*|$)/);
  if (m && locales.includes(m[1]) && m[1] !== defaultLocale) return { locale: m[1], path: m[2] || '/' };
  return { locale: defaultLocale, path: pathname || '/' };
}

export function switchLocalePath(pathname: string, to: string, content: ParsedContent): string {
  const codes = content.site.locales.map((l) => l.code);
  const { path } = splitLocale(pathname, codes, content.site.defaultLocale);
  return localizePath(path, to, content.site.defaultLocale);
}

export interface RouteEntry {
  locale: string;
  path: string; // un-prefixed path
  url: string; // localized path
  page: PageId | 'home' | 'project';
  projectId?: string;
}

/** Every indexable URL of the site, for prerendering and the sitemap. */
export function allRoutes(content: ParsedContent): RouteEntry[] {
  const { defaultLocale } = content.site;
  const out: RouteEntry[] = [];
  const projects = [...workProjects(content), ...labProjects(content)];
  for (const { code } of content.site.locales) {
    const add = (path: string, page: RouteEntry['page'], projectId?: string) =>
      out.push({ locale: code, path, url: localizePath(path, code, defaultLocale), page, projectId });
    add('/', 'home');
    for (const page of Object.keys(pagePaths) as (PageId | 'home')[]) {
      if (page !== 'home' && isPageEnabled(content, page)) add(pagePaths[page], page);
    }
    for (const p of projects) add(projectPath(p.id), 'project', p.id);
  }
  return out;
}
