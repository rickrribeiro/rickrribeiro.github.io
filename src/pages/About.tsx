import type { ReactNode } from 'react';
import { useSite } from '../app/SiteContext';
import { Seo, personJsonLd } from '../app/seo';
import { aboutSections } from '../lib/content';
import type { AboutSectionId } from '../lib/schema';
import { PageHeader, SectionHeader } from '../components/ui';
import { Img } from '../components/Media';
import { Icon } from '../components/Icon';
import { ExperienceTimeline } from '../features/resume/Experience';
import { SkillsFull } from '../features/resume/Skills';
import { CertificationList, EducationList, SpokenLanguages } from '../features/resume/Education';

export function AboutPage() {
  const { content, t, text } = useSite();
  const order = aboutSections(content);
  const titles: Record<AboutSectionId, string> = {
    experience: t('about.experience'),
    skills: t('about.skills'),
    education: t('about.education'),
    certifications: t('about.certifications'),
    languages: t('about.languages'),
  };
  const bodies: Record<AboutSectionId, () => ReactNode> = {
    experience: () => <ExperienceTimeline />,
    skills: () => <SkillsFull />,
    education: () => <EducationList />,
    certifications: () => <CertificationList />,
    languages: () => <SpokenLanguages />,
  };

  return (
    <>
      <Seo title={t('about.title')} description={text.seo?.about ?? ''} type="profile" jsonLd={[personJsonLd(content, text.role ?? '')]} />
      <PageHeader kicker={t('about.kicker')} title={content.site.name}>
        <div className="about-intro">
          <figure className="portrait portrait--small">
            <Img src={content.site.portrait} alt={content.site.name} width={800} height={800} eager />
          </figure>
          <div className="about-intro__text">
            <p className="about-intro__role">
              {text.role} <span className="muted">· {text.location}</span>
            </p>
            <div className="prose">{text.intro?.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}</div>
            {content.site.availability.open && text.availability && (
              <p className="availability">
                <span className="hero__now-dot" aria-hidden="true" /> {text.availability}
              </p>
            )}
            <div className="about-intro__downloads">
              {content.site.locales.map((l) => {
                const file = content.site.resume[l.code];
                if (!file) return null;
                return (
                  <a key={l.code} href={file} className="button button--primary" download hrefLang={l.tag}>
                    <Icon name="download" size={16} /> {t('about.download')} <span className="mono">{l.short}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </PageHeader>

      <nav className="about-nav container" aria-label={t('about.title')}>
        <ul role="list">
          {order.map((id, i) => (
            <li key={id}>
              <a href={`#${id}`}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span> {titles[id]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {order.map((id, i) => (
        <section key={id} className="section section--about" aria-labelledby={`about-${id}`}>
          <span id={id} className="anchor" />
          <div className="container">
            <SectionHeader index={String(i + 1).padStart(2, '0')} kicker={t('about.kicker')} title={titles[id]} id={`about-${id}`} />
            {bodies[id]()}
          </div>
        </section>
      ))}
    </>
  );
}
