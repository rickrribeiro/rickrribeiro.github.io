/**
 * Minimal router for a static site (≈2 KB instead of a full routing library):
 * History API navigation, link interception, a static variant for prerendering,
 * and simple pattern matching with `:params`.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

export interface Location {
  pathname: string;
  search: string;
  hash: string;
}
interface RouterValue {
  location: Location;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
}

const RouterCtx = createContext<RouterValue>({ location: { pathname: '/', search: '', hash: '' }, navigate: () => {} });
const ParamsCtx = createContext<Record<string, string>>({});

export function parseUrl(url: string): Location {
  const u = new URL(url, 'http://x');
  return { pathname: u.pathname, search: u.search, hash: u.hash };
}

const current = (): Location => ({ pathname: window.location.pathname, search: window.location.search, hash: window.location.hash });

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>(current);
  useEffect(() => {
    const onPop = () => setLocation(current());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    const next = parseUrl(new URL(to, window.location.href).href);
    const href = next.pathname + next.search + next.hash;
    if (opts?.replace) window.history.replaceState(null, '', href);
    else window.history.pushState(null, '', href);
    setLocation(next);
  }, []);
  const value = useMemo(() => ({ location, navigate }), [location, navigate]);
  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>;
}

export function StaticRouter({ location, children }: { location: string; children: ReactNode }) {
  const value = useMemo(() => ({ location: parseUrl(location), navigate: () => {} }), [location]);
  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>;
}

export const useLocation = () => useContext(RouterCtx).location;
export const useNavigate = () => useContext(RouterCtx).navigate;
export const useParams = <T extends Record<string, string>>() => useContext(ParamsCtx) as Partial<T>;

/** Matches "/work/:id/" style patterns. Returns params or null. */
export function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);
  const a = norm(pattern).split('/');
  const b = norm(pathname).split('/');
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) {
      if (!b[i]) return null;
      params[a[i].slice(1)] = decodeURIComponent(b[i]);
    } else if (a[i] !== b[i]) return null;
  }
  return params;
}

export function Switch({ pathname, routes, fallback }: { pathname: string; routes: [string, () => ReactNode][]; fallback: () => ReactNode }) {
  for (const [pattern, render] of routes) {
    const params = matchPath(pattern, pathname);
    if (params) return <ParamsCtx.Provider value={params}>{render()}</ParamsCtx.Provider>;
  }
  return <>{fallback()}</>;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string; replace?: boolean };

export function Link({ to, replace, onClick, target, ...rest }: LinkProps) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      target={target}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (target && target !== '_self')) return;
        e.preventDefault();
        navigate(to, { replace });
      }}
      {...rest}
    />
  );
}

export function NavLink({ to, className, end, ...rest }: Omit<LinkProps, 'className'> & { className: (s: { isActive: boolean }) => string; end?: boolean }) {
  const { pathname } = useLocation();
  const isActive = end ? pathname === to : pathname.startsWith(to);
  return <Link to={to} className={className({ isActive })} aria-current={isActive ? 'page' : undefined} {...rest} />;
}
