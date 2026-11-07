import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from '../../lib/router';
import { useSite } from '../../app/SiteContext';
import { navItems, projectText, resumeUrl, visibleProjects } from '../../lib/content';
import { pagePaths, projectPath, switchLocalePath } from '../../lib/routes';
import { storeLocale } from '../../hooks/useStoredLocale';
import { Icon } from '../../components/Icon';

interface Item {
  id: string;
  group: 'pages' | 'projects' | 'actions';
  label: string;
  hint?: string;
  run: () => void;
}

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** ⌘K / Ctrl+K quick navigation — the recruiter fast path to any page, project or action. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { content, locale, t, href } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const items = useMemo<Item[]>(() => {
    const go = (p: string) => () => navigate(href(p));
    const pages: Item[] = [
      { id: 'home', group: 'pages', label: t('nav.home'), run: go('/') },
      ...navItems(content).map((p) => ({ id: p, group: 'pages' as const, label: t(`nav.${p}`), run: go(pagePaths[p]) })),
      { id: 'experience', group: 'pages', label: t('about.experience'), hint: t('nav.about'), run: go('/about/#experience') },
      { id: 'skills', group: 'pages', label: t('about.skills'), hint: t('nav.about'), run: go('/about/#skills') },
      { id: 'education', group: 'pages', label: t('about.education'), hint: t('nav.about'), run: go('/about/#education') },
    ];
    const projects: Item[] = visibleProjects(content).map((p) => ({
      id: `p-${p.id}`,
      group: 'projects',
      label: projectText(content, locale, p.id).title,
      hint: t(`type.${p.type}`),
      run: go(projectPath(p.id)),
    }));
    const actions: Item[] = [
      {
        id: 'resume',
        group: 'actions',
        label: t('fastTrack.resume'),
        run: () => window.open(resumeUrl(content, locale), '_blank', 'noopener'),
      },
      {
        id: 'email',
        group: 'actions',
        label: t('palette.copyEmail'),
        hint: content.site.email,
        run: () => navigator.clipboard?.writeText(content.site.email),
      },
      ...content.site.locales
        .filter((l) => l.code !== locale)
        .map((l) => ({
          id: `lang-${l.code}`,
          group: 'actions' as const,
          label: t('palette.switchLanguage', { lang: l.label }),
          run: () => {
            storeLocale(l.code);
            navigate(switchLocalePath(location.pathname, l.code, content) + location.search + location.hash);
          },
        })),
    ];
    return [...pages, ...projects, ...actions];
  }, [content, locale, t, href, navigate, location]);

  const filtered = useMemo(() => {
    const n = normalize(q.trim());
    return n ? items.filter((i) => normalize(`${i.label} ${i.hint ?? ''}`).includes(n)) : items;
  }, [items, q]);

  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement as HTMLElement;
      setQ('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.documentElement.classList.add('no-scroll');
    } else {
      document.documentElement.classList.remove('no-scroll');
      restoreRef.current?.focus?.();
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  const runItem = (i: Item) => {
    onClose();
    i.run();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' && filtered[active]) {
      e.preventDefault();
      runItem(filtered[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // keep focus inside the dialog
    }
  };

  useEffect(() => {
    document.getElementById(`cmd-${filtered[active]?.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, filtered]);

  const groups = (['pages', 'projects', 'actions'] as const).filter((g) => filtered.some((i) => i.group === g));

  return (
    <>
      {open && (
        <div className="palette-backdrop" onMouseDown={onClose}>
          <div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label={t('a11y.commandPalette')}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKey}
          >
            <div className="palette__search">
              <Icon name="search" size={18} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('palette.placeholder')}
                aria-label={t('palette.placeholder')}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={filtered[active] ? `cmd-${filtered[active].id}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd>esc</kbd>
            </div>
            <div className="palette__list" id="palette-list" role="listbox" aria-label={t('a11y.commandPalette')}>
              {filtered.length === 0 && <p className="palette__empty muted">{t('palette.empty')}</p>}
              {groups.map((g) => (
                <div key={g} role="group" aria-label={t(`palette.${g}`)}>
                  <p className="palette__group label" aria-hidden="true">
                    {t(`palette.${g}`)}
                  </p>
                  {filtered
                    .filter((i) => i.group === g)
                    .map((i) => {
                      const idx = filtered.indexOf(i);
                      return (
                        <div
                          key={i.id}
                          id={`cmd-${i.id}`}
                          role="option"
                          aria-selected={idx === active}
                          className="palette__item"
                          onMouseMove={() => setActive(idx)}
                          onClick={() => runItem(i)}
                        >
                          <span>{i.label}</span>
                          {i.hint && <span className="palette__hint mono">{i.hint}</span>}
                          <Icon name="arrow-right" size={14} className="palette__go" />
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
