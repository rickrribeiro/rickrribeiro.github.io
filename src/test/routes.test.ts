import { describe, expect, it } from 'vitest';
import { parsed } from './helpers';
import { allRoutes, localizePath, splitLocale, switchLocalePath } from '../lib/routes';
import { matchPath } from '../lib/router';

describe('routes', () => {
  const codes = ['en', 'pt', 'es'];
  it('keeps English un-prefixed and prefixes other locales', () => {
    expect(localizePath('/work/', 'en', 'en')).toBe('/work/');
    expect(localizePath('/work/', 'pt', 'en')).toBe('/pt/work/');
  });

  it('splits the locale prefix from a pathname', () => {
    expect(splitLocale('/pt/work/rickos/', codes, 'en')).toEqual({ locale: 'pt', path: '/work/rickos/' });
    expect(splitLocale('/es', codes, 'en')).toEqual({ locale: 'es', path: '/' });
    expect(splitLocale('/work/', codes, 'en')).toEqual({ locale: 'en', path: '/work/' });
    expect(splitLocale('/xx/work/', codes, 'en')).toEqual({ locale: 'en', path: '/xx/work/' });
  });

  it('switches language while preserving the page', () => {
    const c = parsed();
    expect(switchLocalePath('/pt/work/rickos/', 'es', c)).toBe('/es/work/rickos/');
    expect(switchLocalePath('/es/about/', 'en', c)).toBe('/about/');
  });

  it('generates every page × locale and skips disabled pages', () => {
    const c = parsed();
    const routes = allRoutes(c);
    const perLocale = routes.filter((r) => r.locale === 'en');
    expect(routes).toHaveLength(perLocale.length * c.site.locales.length);
    expect(routes.map((r) => r.url)).toContain('/pt/work/tindergpt/');
    expect(routes.map((r) => r.url)).not.toContain('/work/selltime/');
    c.sections.sections.talks = false;
    expect(allRoutes(c).some((r) => r.path === '/talks/')).toBe(false);
  });

  it('matches route patterns with params', () => {
    expect(matchPath('/work/:id/', '/work/rickos/')).toEqual({ id: 'rickos' });
    expect(matchPath('/work/:id/', '/work/rickos')).toEqual({ id: 'rickos' });
    expect(matchPath('/work/', '/work/rickos/')).toBeNull();
    expect(matchPath('/', '/')).toEqual({});
  });
});
