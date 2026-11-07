import { useSite } from '../app/SiteContext';
import { Seo } from '../app/seo';
import { L } from '../components/Links';
import { Icon } from '../components/Icon';

export function NotFoundPage() {
  const { t } = useSite();
  return (
    <>
      <Seo title="404" description={t('notFound.title')} noindex />
      <section className="not-found container">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1 className="not-found__title">{t('notFound.title')}</h1>
        <p className="muted">{t('notFound.body')}</p>
        <div className="not-found__actions">
          <L to="/work/" className="button button--primary">
            {t('nav.work')} <Icon name="arrow-right" size={16} />
          </L>
          <L to="/" className="button button--ghost">
            {t('notFound.home')}
          </L>
        </div>
      </section>
    </>
  );
}
