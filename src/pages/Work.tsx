import { useSite } from '../app/SiteContext';
import { Seo } from '../app/seo';
import { featuredProjects, workProjects } from '../lib/content';
import { PageHeader } from '../components/ui';
import { ProjectIndex } from '../features/projects/ProjectIndex';

export function WorkPage() {
  const { content, t, text } = useSite();
  const featured = featuredProjects(content);
  const rest = workProjects(content).filter((p) => !p.featured);
  return (
    <>
      <Seo title={t('work.title')} description={text.seo?.work ?? ''} />
      <PageHeader kicker={t('work.kicker')} title={
          <>
            {t('work.title')} <span className="page-header__note">{t('work.note')}</span>
          </>
        }
        intro={t('work.intro')} />
      <section className="section section--tight container" aria-label={t('work.title')}>
        <ProjectIndex projects={[...featured, ...rest]} />
      </section>
    </>
  );
}
