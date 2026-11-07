import type { AnchorHTMLAttributes } from 'react';
import { Link, NavLink } from '../lib/router';
import type { ReactNode } from 'react';
import { useSite } from '../app/SiteContext';
import { Icon } from './Icon';

/** Internal link: takes an un-prefixed path and localizes it for the current language. */
export function L({ to, ...rest }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }) {
  const { href } = useSite();
  const [p, hash] = to.split('#');
  return <Link to={href(p) + (hash ? `#${hash}` : '')} {...rest} />;
}

export function NavL({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  const { href } = useSite();
  return (
    <NavLink to={href(to)} className={({ isActive }) => `${className ?? ''}${isActive ? ' is-active' : ''}`} end={to === '/'}>
      {children}
    </NavLink>
  );
}

/** External link that always opens in a new tab and announces it. */
export function ExternalLink({ href, children, className, icon = true, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { icon?: boolean }) {
  const { t } = useSite();
  const mailto = href?.startsWith('mailto:');
  return (
    <a href={href} className={className} {...(mailto ? {} : { target: '_blank', rel: 'noopener noreferrer' })} {...rest}>
      {children}
      {icon && !mailto && <Icon name="arrow-up-right" size={14} className="ext-icon" />}
      {!mailto && <span className="visually-hidden"> {t('a11y.external')}</span>}
    </a>
  );
}
