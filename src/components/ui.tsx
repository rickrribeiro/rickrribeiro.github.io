import type { ReactNode } from 'react';
import { useSite } from '../app/SiteContext';
import type { ProjectStatus } from '../lib/schema';
import { L } from './Links';
import { Icon } from './Icon';
import { Reveal } from './Reveal';

export function SectionHeader({
  index,
  kicker,
  title,
  action,
  id,
  as: H = 'h2',
}: {
  index?: string;
  kicker: string;
  title?: ReactNode;
  action?: { to: string; label: string };
  id?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <Reveal as="header" className="section-header">
      <p className="section-header__kicker label">
        {index && <span className="section-header__index">{index}</span>}
        {kicker}
      </p>
      {title && (
        <H className="section-header__title" id={id}>
          {title}
        </H>
      )}
      {action && (
        <L to={action.to} className="link-arrow section-header__action">
          {action.label} <Icon name="arrow-right" size={16} />
        </L>
      )}
    </Reveal>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useSite();
  return (
    <span className={`status status--${status}`}>
      <span className="status__dot" aria-hidden="true" />
      {t(`status.${status}`)}
    </span>
  );
}

export function Chips({ items, className = '' }: { items: string[]; className?: string }) {
  if (!items.length) return null;
  return (
    <ul role="list" className={`chips ${className}`}>
      {items.map((i) => (
        <li key={i} className="chip">
          {i}
        </li>
      ))}
    </ul>
  );
}

/** Company / institution mark: the logo if configured, otherwise a typographic monogram. */
export function Monogram({ name, logo, size = 44 }: { name: string; logo?: string | null; size?: number }) {
  if (logo) return <img className="monogram monogram--logo" src={logo} alt="" width={size} height={size} loading="lazy" />;
  const letters = name
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter((w) => /^[A-ZÀ-Ý]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return (
    <span className="monogram" style={{ width: size, height: size }} aria-hidden="true">
      {letters || name[0]}
    </span>
  );
}

export function PageHeader({ kicker, title, intro, children }: { kicker: string; title: ReactNode; intro?: string; children?: ReactNode }) {
  return (
    <header className="page-header container">
      <p className="label page-header__kicker">{kicker}</p>
      <h1 className="page-header__title">{title}</h1>
      {intro && <p className="page-header__intro">{intro}</p>}
      {children}
    </header>
  );
}
