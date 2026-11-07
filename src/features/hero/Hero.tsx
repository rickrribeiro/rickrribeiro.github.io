import { useMemo } from 'react';
import { useSite } from '../../app/SiteContext';
import { resumeText, resumeUrl, skillGroups, visibleExperience } from '../../lib/content';
import { Icon } from '../../components/Icon';
import { L } from '../../components/Links';
import { Constellation } from './Constellation';

export function Hero() {
  const { content, locale, t, text } = useSite();
  const hero = text.hero ?? {};
  const resume = resumeText(content, locale);

  const current = useMemo(() => {
    const id = content.site.currentRole?.experience;
    const exp = visibleExperience(content).find((e) => e.id === id);
    if (!exp) return null;
    const role = exp.roles.find((r) => r.end === null) ?? exp.roles[0];
    return { company: exp.company, title: resume.experience?.[exp.id]?.roles?.[role.id]?.title ?? '' };
  }, [content, resume]);

  const { labels, accents } = useMemo(() => {
    const groups = skillGroups(content);
    const core = groups.flatMap((g) => g.skills.filter((s) => s.core).map((s) => s.name));
    const picks = groups
      .filter((g) => ['messaging', 'cloud', 'ai', 'architecture', 'data', 'games'].includes(g.id))
      .flatMap((g) => g.skills.slice(0, 3).map((s) => s.name));
    return { labels: [...new Set([...core, ...picks])], accents: core };
  }, [content]);

  const lines = [...(hero.headline ?? []), hero.headlineAccent ?? ''];

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__canvas" aria-hidden="false">
        <Constellation labels={labels} accentLabels={accents} ariaLabel={t('a11y.constellation')} />
      </div>
      <div className="container hero__inner">
        <div className="hero__meta">
          <p className="label hero__meta-item">
            <span className="hero__index">(R/R)</span> {content.site.name}
          </p>
          <p className="label hero__meta-item hero__meta-item--mid">{hero.eyebrow}</p>
          <p className="label hero__meta-item hero__meta-item--end">{text.location}</p>
        </div>

        <h1 className="hero__title" id="hero-title">
          <span className="visually-hidden">
            {content.site.name} — {text.role}.{' '}
          </span>
          {lines.map((line, i) => (
            <span key={i} className="hero__line" style={{ ['--i' as string]: i }}>
              <span className={`hero__line-inner ${i === lines.length - 1 ? 'hero__accent serif' : ''}`}>{line}</span>
            </span>
          ))}
        </h1>

        <div className="hero__bottom">
          <p className="hero__lead">{hero.lead}</p>
          {current && (
            <div className="hero__now">
              <span className="hero__now-dot" aria-hidden="true" />
              <span className="label">{t('hero.now')}</span>
              <span className="hero__now-text">
                {current.title} <span className="muted">{t('hero.at')}</span> {current.company}
              </span>
            </div>
          )}
        </div>


        <nav className="fast-track" aria-label={t('fastTrack.label')}>
          <span className="label fast-track__label">{t('fastTrack.label')}</span>
          <ul role="list" className="fast-track__list">
            <li>
              <a href="#work" className="fast-track__link">
                {t('fastTrack.work')} <Icon name="arrow-down" size={14} />
              </a>
            </li>
            <li>
              <L to="/about/#experience" className="fast-track__link">
                {t('fastTrack.experience')}
              </L>
            </li>
            <li>
              <L to="/about/#skills" className="fast-track__link">
                {t('fastTrack.stack')}
              </L>
            </li>
            <li>
              <a href={resumeUrl(content, locale)} className="fast-track__link fast-track__link--primary" download>
                <Icon name="download" size={14} /> {t('fastTrack.resume')}
              </a>
            </li>
            <li>
              <a href={`mailto:${content.site.email}`} className="fast-track__link">
                <Icon name="mail" size={14} /> {t('fastTrack.email')}
              </a>
            </li>
          </ul>
        </nav>
        <ul role="list" className="hero__stats">
          {content.site.stats.map((s) => (
            <li key={s.id} className="hero__stat">
              <span className="hero__stat-value">{s.value}</span>
              <span className="hero__stat-label">{text.stats?.[s.id]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
