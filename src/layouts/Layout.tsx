import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from '../lib/router';
import { useSite } from '../app/SiteContext';
import { navItems, resumeUrl } from '../lib/content';
import { pagePaths, switchLocalePath } from '../lib/routes';
import { storeLocale } from '../hooks/useStoredLocale';
import { L, NavL } from '../components/Links';
import { Icon } from '../components/Icon';
import { CommandPalette } from '../features/palette/CommandPalette';
import { Footer } from './Footer';

function LanguageSwitcher({ onSwitch }: { onSwitch?: () => void }) {
  const { content, locale, t } = useSite();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="lang-switch" role="group" aria-label={t('a11y.language')}>
      {content.site.locales.map((l) => {
        const to = switchLocalePath(location.pathname, l.code, content) + location.search + location.hash;
        return (
          <a
            key={l.code}
            href={to}
            hrefLang={l.tag}
            lang={l.tag}
            aria-current={l.code === locale ? 'true' : undefined}
            className="lang-switch__item"
            onClick={(e) => {
              e.preventDefault();
              storeLocale(l.code);
              onSwitch?.();
              navigate(to);
            }}
          >
            <span aria-hidden="true">{l.short}</span>
            <span className="visually-hidden">{l.label}</span>
          </a>
        );
      })}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { content, locale, t, path } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const pages = navItems(content);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => setMenuOpen(false), [path, locale]);
  useEffect(() => {
    document.documentElement.classList.toggle('no-scroll', menuOpen);
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main">
        {t('a11y.skip')}
      </a>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-menu-open' : ''}`}>
        <div className="site-header__inner container">
          <L to="/" className="brand">
            <span className="brand__mark" aria-hidden="true">
              R<span>/</span>R
            </span>
            <span className="brand__name">{content.site.name}</span>
          </L>

          <nav className="site-nav" aria-label={t('a11y.mainNav')}>
            <ul role="list">
              {pages.map((p) => (
                <li key={p}>
                  <NavL to={pagePaths[p]} className="site-nav__link">
                    {t(`nav.${p}`)}
                  </NavL>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__tools">
            <LanguageSwitcher />
            <button type="button" className="kbd-button" onClick={() => setPaletteOpen(true)} aria-haspopup="dialog" title={t('nav.quick')}>
              <span className="visually-hidden">{t('nav.quick')} </span>
              <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
              <kbd>K</kbd>
            </button>
            <a className="button button--primary button--small" href={resumeUrl(content, locale)} download>
              <Icon name="download" size={15} />
              {t('nav.resume')}
            </a>
            <button
              type="button"
              className="menu-button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="menu-button__bars" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
          <div id="mobile-menu" className="mobile-menu">
            <nav aria-label={t('a11y.mainNav')} className="mobile-menu__nav container">
              <ul role="list">
                {['home' as const, ...pages].map((p, i) => (
                  <li key={p} style={{ ['--i' as string]: i }}>
                    <NavL to={pagePaths[p]} className="mobile-menu__link">
                      <span className="mono">{String(i).padStart(2, '0')}</span>
                      {t(`nav.${p}`)}
                    </NavL>
                  </li>
                ))}
              </ul>
              <div className="mobile-menu__foot">
                <LanguageSwitcher onSwitch={() => setMenuOpen(false)} />
                <a className="button button--primary" href={resumeUrl(content, locale)} download>
                  <Icon name="download" size={16} /> {t('fastTrack.resume')}
                </a>
              </div>
            </nav>
          </div>
        )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <main id="main" tabIndex={-1} key={path} className="page-enter">
        {children}
      </main>
      <Footer />
    </>
  );
}
