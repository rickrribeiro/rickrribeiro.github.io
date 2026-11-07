import { useSite } from '../app/SiteContext';
import { navItems } from '../lib/content';
import { pagePaths } from '../lib/routes';
import { L, ExternalLink } from '../components/Links';
import { Icon } from '../components/Icon';


export function Footer() {
  const { content, tag, t } = useSite();
  const links = content.social.links.filter((l) => l.enabled && l.placements.includes('footer'));
  const built = typeof __BUILD_DATE__ !== 'undefined' ? new Intl.DateTimeFormat(tag, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(__BUILD_DATE__)) : '';
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <nav aria-label={t('a11y.mainNav')}>
            <ul role="list" className="site-footer__nav">
              {navItems(content).map((p) => (
                <li key={p}>
                  <L to={pagePaths[p]}>{t(`nav.${p}`)}</L>
                </li>
              ))}
            </ul>
          </nav>
          <ul role="list" className="site-footer__social">
            {links.map((l) => (
              <li key={l.id}>
                <ExternalLink href={l.url} icon={false} className="site-footer__social-link">
                  <Icon name={l.id === 'email' ? 'mail' : l.id} size={16} />
                  {l.id === 'email' ? content.site.email : l.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
          <p className="site-footer__built muted">
            {t('footer.built')}
            {built && (
              <>
                <br />
                <span className="mono">{t('footer.updated', { date: built })}</span>
              </>
            )}
          </p>
        </div>
        <p className="site-footer__wordmark" aria-hidden="true">
          {content.site.name}
        </p>
        <div className="site-footer__bottom">
          <span className="label">© {new Date(typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : Date.now()).getUTCFullYear()} {content.site.name}</span>
          <a href="#main" className="label site-footer__top">
            {t('footer.top')} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
