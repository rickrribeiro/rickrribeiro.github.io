import { useEffect, useRef, useState } from 'react';
import { useSite } from '../../app/SiteContext';
import type { Project } from '../../lib/schema';
import { availableFilters, filterProjects, isWorkProject, projectText, yearOf } from '../../lib/content';
import { projectPath } from '../../lib/routes';
import { L } from '../../components/Links';
import { Icon } from '../../components/Icon';
import { StatusBadge } from '../../components/ui';
import { ProjectCover } from './ProjectCover';

/**
 * Typographic index of projects with filter chips (synced to ?filter= for shareable URLs)
 * and, on fine pointers, a cover preview that follows the cursor.
 */
export function ProjectIndex({ projects, withFilters = true, startIndex = 1 }: { projects: Project[]; withFilters?: boolean; startIndex?: number }) {
  const { content, locale, t } = useSite();
  const [filter, setFilter] = useState('all');
  const [hovered, setHovered] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null); // last hovered, kept during fade-out
  const [finePointer, setFinePointer] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  // Cursor-following preview: a lerp loop that only runs while the pointer is over the list.
  const follow = () => {
    pos.current.x += (target.current.x - pos.current.x) * 0.18;
    pos.current.y += (target.current.y - pos.current.y) * 0.18;
    if (previewRef.current) previewRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
    raf.current = requestAnimationFrame(follow);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => {
    if (hovered) setShown(hovered);
  }, [hovered]);

  const filters = withFilters ? availableFilters(content, projects) : [];
  const visible = filterProjects(projects, filter);

  useEffect(() => {
    setFinePointer(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    if (!withFilters) return;
    const f = new URLSearchParams(window.location.search).get('filter');
    if (f && filters.includes(f)) setFilter(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (f: string) => {
    setFilter(f);
    const url = new URL(window.location.href);
    if (f === 'all') url.searchParams.delete('filter');
    else url.searchParams.set('filter', f);
    window.history.replaceState(window.history.state, '', url);
  };

  const label = (f: string) => (f === 'all' || f === 'featured' || f === 'lab' ? t(`filter.${f}`) : f === 'professional' || f === 'personal' ? t(`type.${f}`) : t(`category.${f}`));
  const shownProject = visible.find((p) => p.id === shown);

  return (
    <div className="pindex">
      {withFilters && filters.length > 1 && (
        <div className="filters" role="group" aria-label={t('filter.label')}>
          {filters.map((f) => (
            <button key={f} type="button" className="filter" aria-pressed={filter === f} onClick={() => choose(f)}>
              {label(f)}
              <span className="filter__count">{filterProjects(projects, f).length}</span>
            </button>
          ))}
          <p className="visually-hidden" aria-live="polite">
            {t('filter.count', { count: visible.length })}
          </p>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="muted">{t('filter.empty')}</p>
      ) : (
        <ol
          role="list"
          className="pindex__list"
          onPointerEnter={(e) => {
            if (!finePointer) return;
            target.current = pos.current = { x: e.clientX, y: e.clientY };
            cancelAnimationFrame(raf.current);
            raf.current = requestAnimationFrame(follow);
          }}
          onPointerMove={(e) => {
            target.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerLeave={() => {
            setHovered(null);
            setTimeout(() => cancelAnimationFrame(raf.current), 300);
          }}
        >
          {visible.map((p, i) => {
            const text = projectText(content, locale, p.id);
            const origin = isWorkProject(p) ? 'work' : 'personal';
            return (
              <li key={p.id} className="pindex__row" onPointerEnter={() => setHovered(p.id)}>
                <L to={projectPath(p.id)} className="pindex__link" onFocus={() => setHovered(null)}>
                  <span className="pindex__num mono">{String(i + startIndex).padStart(2, '0')}</span>
                  <span className="pindex__main">
                    <span className="pindex__title">
                      {text.title}
                      <span className={`origin-badge origin-badge--${origin}`}>{t(`project.origin.${origin}`)}</span>
                    </span>
                    {text.tagline && <span className="pindex__tagline">{text.tagline}</span>}
                  </span>
                  <span className="pindex__cats label">{p.categories.slice(0, 2).map((c) => t(`category.${c}`)).join(' · ')}</span>
                  <span className="pindex__year mono">{yearOf(p.period.start)}</span>
                  <span className="pindex__status">
                    <StatusBadge status={p.status} />
                  </span>
                  <Icon name="arrow-up-right" size={20} className="pindex__arrow" />
                </L>
              </li>
            );
          })}
        </ol>
      )}

      {finePointer && shownProject && (
        <div ref={previewRef} className={`pindex__preview ${hovered ? 'is-visible' : ''}`} aria-hidden="true">
          <div className="pindex__preview-inner">
            <ProjectCover project={shownProject} text={projectText(content, locale, shownProject.id)} variant="card" />
          </div>
        </div>
      )}
    </div>
  );
}
