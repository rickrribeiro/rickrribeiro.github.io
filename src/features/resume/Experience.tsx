import { useSite } from '../../app/SiteContext';
import type { Experience } from '../../lib/schema';
import { experienceSpan, formatDuration, formatRange, monthsBetween, projectText, resumeText, skillName, visibleExperience, getProject } from '../../lib/content';
import { projectPath } from '../../lib/routes';
import { ExternalLink, L } from '../../components/Links';
import { Reveal } from '../../components/Reveal';
import { Chips, Monogram } from '../../components/ui';
import { Icon } from '../../components/Icon';

function workplace(e: Experience, t: (k: string) => string) {
  return [e.location, t(`experience.${e.workplace}`)].filter(Boolean).join(' · ');
}

/** Compact career list for the homepage. */
export function ExperienceHighlights({ limit }: { limit: number }) {
  const { content, locale, tag, t } = useSite();
  const resume = resumeText(content, locale);
  const items = visibleExperience(content).filter((e) => e.highlight).slice(0, limit);
  return (
    <ol role="list" className="xp-list">
      {items.map((e, i) => {
        const span = experienceSpan(e);
        const role = e.roles[0];
        const r = resume.experience?.[e.id];
        const first = r?.roles?.[role.id]?.achievements?.[0];
        return (
          <Reveal as="li" key={e.id} className="xp-row" delay={i * 60}>
            <span className="xp-row__years mono">
              {span.start.slice(0, 4)}
              <span aria-hidden="true">—</span>
              {span.end ? span.end.slice(0, 4) : t('project.present')}
            </span>
            <div className="xp-row__main">
              <h3 className="xp-row__company">{e.company}</h3>
              <p className="xp-row__role">{r?.roles?.[role.id]?.title}</p>
              {first && <p className="xp-row__achievement">{first}</p>}
            </div>
            <div className="xp-row__side">
              <span className="label">{formatRange(span.start, span.end, tag, t('project.present'))}</span>
              <span className="label">{formatDuration(monthsBetween(span.start, span.end), t, tag)}</span>
              <span className="label">{workplace(e, t)}</span>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}

/** Full timeline for the About / Résumé page. */
export function ExperienceTimeline() {
  const { content, locale, tag, t } = useSite();
  const resume = resumeText(content, locale);
  return (
    <ol role="list" className="timeline">
      {visibleExperience(content).map((e) => {
        const span = experienceSpan(e);
        const r = resume.experience?.[e.id];
        const projects = e.projects.map((id) => getProject(content, id)).filter(Boolean);
        return (
          <li key={e.id} className="timeline__item">
            <Reveal className="timeline__card">
              <header className="timeline__head">
                <Monogram name={e.company} logo={e.logo} />
                <div>
                  <h3 className="timeline__company">
                    {e.website ? (
                      <ExternalLink href={e.website} icon>
                        {e.company}
                      </ExternalLink>
                    ) : (
                      e.company
                    )}
                  </h3>
                  {r?.summary && <p className="timeline__summary muted">{r.summary}</p>}
                </div>
                <p className="timeline__when label">
                  {formatRange(span.start, span.end, tag, t('project.present'))}
                  <br />
                  {formatDuration(monthsBetween(span.start, span.end), t, tag)} · {workplace(e, t)}
                </p>
              </header>

              {e.roles.map((role) => {
                const rt = r?.roles?.[role.id];
                return (
                  <section key={role.id} className="timeline__role">
                    <h4 className="timeline__title">
                      {rt?.title}
                      <span className="label">
                        {t(`experience.employment.${role.employmentType}`)} · {formatRange(role.start, role.end, tag, t('project.present'))}
                      </span>
                    </h4>
                    {rt?.description && <p className="prose">{rt.description}</p>}
                    {!!rt?.achievements?.length && (
                      <ul className="timeline__achievements">
                        {rt.achievements.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}

              <footer className="timeline__foot">
                <Chips items={e.skills.map((s) => skillName(content, s))} />
                {projects.length > 0 && (
                  <p className="timeline__projects">
                    <span className="label">{t('about.relatedProjects')}</span>
                    {projects.map((p) => (
                      <L key={p!.id} to={projectPath(p!.id)} className="link-arrow">
                        {projectText(content, locale, p!.id).title} <Icon name="arrow-right" size={14} />
                      </L>
                    ))}
                  </p>
                )}
              </footer>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
