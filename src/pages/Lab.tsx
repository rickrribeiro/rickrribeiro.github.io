import { useSite } from '../app/SiteContext';
import { Seo } from '../app/seo';
import { labProjects } from '../lib/content';
import { PageHeader } from '../components/ui';
import { Reveal } from '../components/Reveal';
import { ProjectCard } from '../features/projects/ProjectCard';

export function LabPage() {
  const { content, t, text } = useSite();
  const items = labProjects(content);
  return (
    <>
      <Seo title={t('lab.title')} description={text.seo?.lab ?? ''} />
      <PageHeader kicker={t('lab.kicker')} title={<>{t('lab.title')}<span className="accent">.</span></>} intro={t('lab.intro')} />
      <section className="section section--tight container section--lab">
        <div className="pcard-grid pcard-grid--lab">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 70}>
              <ProjectCard project={p} index={i + 1} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
