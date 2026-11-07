import { Fragment, type ReactNode } from 'react';
import { useSite } from '../app/SiteContext';
import { Seo, personJsonLd } from '../app/seo';
import {
  atLeast,
  countryName,
  countryStats,
  formatDays,
  journeyTotals,
  featuredProjects,
  homeLimit,
  homeSections,
  isPageEnabled,
  labProjects,
  resumeUrl,
  workProjects,
} from '../lib/content';
import type { HomeSectionId } from '../lib/schema';
import { Hero } from '../features/hero/Hero';
import { FeaturedProject } from '../features/projects/FeaturedProject';
import { ProjectIndex } from '../features/projects/ProjectIndex';
import { ProjectCard } from '../features/projects/ProjectCard';
import { ExperienceHighlights } from '../features/resume/Experience';
import { SkillsCompact } from '../features/resume/Skills';
import { TalkList } from '../features/talks/TalkList';
import { SectionHeader } from '../components/ui';
import { Reveal } from '../components/Reveal';
import { Img } from '../components/Media';
import { L } from '../components/Links';
import { Icon } from '../components/Icon';
import { ContactBlock } from './Contact';
import { KindBadges } from './Journey';

export function HomePage() {
  const { content, locale, tag, t, text } = useSite();
  const region = (code: string) => countryName(content, locale, code);
  const order = homeSections(content);
  const num = (id: HomeSectionId) => String(order.indexOf(id) + 1).padStart(2, '0');

  const featured = featuredProjects(content).slice(0, homeLimit(content, 'featuredProjects', 5));
  const featuredIds = new Set(featured.map((p) => p.id));
  const more = workProjects(content)
    .filter((p) => !featuredIds.has(p.id))
    .slice(0, homeLimit(content, 'moreProjects', 8));
  const topCountries = countryStats(content).slice(0, 5);
  const totals = journeyTotals(content);
  const lab = labProjects(content).slice(0, homeLimit(content, 'experiments', 3));

  const sections: Record<HomeSectionId, () => ReactNode> = {
    featuredProjects: () =>
      featured.length > 0 && (
        <section className="section section--work" id="work" aria-labelledby="h-featured">
          <div className="container">
            <SectionHeader index={num('featuredProjects')} kicker={t('home.featured.kicker')} title={t('home.featured.title')} id="h-featured" action={{ to: '/work/', label: t('home.featured.all') }} />
            <div className="plates">
              {featured.map((p, i) => (
                <FeaturedProject key={p.id} project={p} index={i} total={featured.length} />
              ))}
            </div>
          </div>
        </section>
      ),
    intro: () => (
      <section className="section section--intro" aria-labelledby="h-intro">
        <div className="container intro">
          <Reveal className="intro__portrait">
            <figure className="portrait">
              <Img src={content.site.portrait} alt={content.site.name} width={800} height={800} />
              <figcaption className="label portrait__caption">
                {content.site.name} · {text.role}
              </figcaption>
            </figure>
          </Reveal>
          <div className="intro__text">
            <SectionHeader index={num('intro')} kicker={t('nav.about')} title={text.intro?.title} id="h-intro" />
            <Reveal className="prose intro__prose" delay={100}>
              {text.intro?.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
            </Reveal>
            <Reveal className="intro__actions" delay={160}>
              <L to="/about/" className="button button--ghost">
                {t('home.experience.all')} <Icon name="arrow-right" size={16} />
              </L>
              <a href={resumeUrl(content, locale)} className="link-arrow" download>
                <Icon name="download" size={16} /> {t('fastTrack.resume')}
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    ),
    experience: () => (
      <section className="section" aria-labelledby="h-xp">
        <div className="container">
          <SectionHeader index={num('experience')} kicker={t('home.experience.kicker')} title={t('home.experience.title')} id="h-xp" action={{ to: '/about/#experience', label: t('home.experience.all') }} />
          <ExperienceHighlights limit={homeLimit(content, 'experience', 4)} />
        </div>
      </section>
    ),
    moreProjects: () =>
      more.length > 0 && (
        <section className="section" aria-labelledby="h-more">
          <div className="container">
            <SectionHeader index={num('moreProjects')} kicker={t('home.more.kicker')} title={t('home.more.title')} id="h-more" action={{ to: '/work/', label: t('home.more.all') }} />
            <ProjectIndex projects={more} withFilters={false} startIndex={featured.length + 1} />
          </div>
        </section>
      ),
    skills: () => (
      <section className="section" aria-labelledby="h-skills">
        <div className="container">
          <SectionHeader index={num('skills')} kicker={t('home.skills.kicker')} title={t('home.skills.title')} id="h-skills" action={{ to: '/about/#skills', label: t('home.skills.all') }} />
          <SkillsCompact groups={['languages', 'backend', 'cloud', 'ai', 'messaging', 'data', 'frontend', 'architecture']} />
        </div>
      </section>
    ),
    experiments: () =>
      isPageEnabled(content, 'lab') &&
      lab.length > 0 && (
        <section className="section section--lab" aria-labelledby="h-lab">
          <div className="container">
            <SectionHeader index={num('experiments')} kicker={t('home.lab.kicker')} title={t('home.lab.title')} id="h-lab" action={{ to: '/lab/', label: t('home.lab.all') }} />
            <div className="pcard-grid">
              {lab.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProjectCard project={p} index={i + 1} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ),
    talks: () =>
      isPageEnabled(content, 'talks') && (
        <section className="section" aria-labelledby="h-talks">
          <div className="container">
            <SectionHeader index={num('talks')} kicker={t('home.talks.kicker')} title={t('home.talks.title')} id="h-talks" action={{ to: '/talks/', label: t('home.talks.all') }} />
            <TalkList limit={homeLimit(content, 'talks', 3)} compact />
          </div>
        </section>
      ),
    journey: () =>
      isPageEnabled(content, 'journey') && (
        <section className="section section--journey" aria-labelledby="h-journey">
          <div className="container journey-teaser">
            <SectionHeader index={num('journey')} kicker={t('home.journey.kicker')} title={text.journey?.title} id="h-journey" />
            <Reveal className="journey-teaser__body" delay={80}>
              <p className="journey-teaser__lead serif">{text.journey?.intro}</p>
              <div className="journey-teaser__side">
                <p className="label">
                  {t('journey.teaserTotals', { countries: totals.countries, cities: atLeast(totals.cities) })}
                </p>
                <ol role="list" className="journey-teaser__places">
                  {topCountries.map((c) => (
                    <li key={c.country}>
                      <span className="mono">{c.country}</span> {region(c.country)}
                      <KindBadges kinds={c.kinds} />
                      <span className="label">{c.days > 0 ? formatDays(c.days, t, tag) : ''}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <L to="/journey/" className="link-arrow">
                {t('home.journey.all')} <Icon name="arrow-right" size={16} />
              </L>
            </Reveal>
          </div>
        </section>
      ),
    contact: () =>
      isPageEnabled(content, 'contact') && (
        <section className="section section--contact" aria-labelledby="h-contact">
          <ContactBlock headingId="h-contact" />
        </section>
      ),
  };

  return (
    <>
      <Seo description={text.seo?.home ?? ''} type="profile" jsonLd={[personJsonLd(content, text.role ?? '')]} />
      <Hero />
      {order.map((id) => (
        <Fragment key={id}>{sections[id]()}</Fragment>
      ))}
    </>
  );
}
