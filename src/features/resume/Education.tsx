import { useSite } from '../../app/SiteContext';
import { formatRange, formatYm, getProject, projectText, resumeText } from '../../lib/content';
import { projectPath } from '../../lib/routes';
import { ExternalLink, L } from '../../components/Links';
import { Monogram } from '../../components/ui';
import { Reveal } from '../../components/Reveal';

export function EducationList() {
  const { content, locale, tag, t } = useSite();
  const resume = resumeText(content, locale);
  return (
    <ol role="list" className="edu-list">
      {content.education
        .filter((e) => e.enabled)
        .map((e, i) => {
          const text = resume.education?.[e.id];
          const ongoing = e.status === 'in-progress';
          const range = formatRange(e.start, e.end, tag, t('project.present')) + (ongoing && e.end ? ` (${t('education.expected')})` : '');
          return (
            <Reveal as="li" key={e.id} className="edu" delay={(i % 3) * 60}>
              <Monogram name={e.institution} size={40} />
              <div className="edu__main">
                <p className="label">
                  {range}
                  {e.status !== 'completed' && <span className={`edu__status edu__status--${e.status}`}>{t(`education.status.${e.status}`)}</span>}
                </p>
                <h3 className="edu__degree">
                  {text?.degree}
                  {text?.field && text.field !== text.degree && <span className="serif"> — {text.field}</span>}
                </h3>
                <p className="edu__institution">
                  {e.website ? <ExternalLink href={e.website}>{e.institution}</ExternalLink> : e.institution}
                  {e.location && <span className="muted"> · {e.location}</span>}
                  {e.grade && <span className="muted"> · {t('about.grade', { grade: e.grade })}</span>}
                </p>
                {text?.description && <p className="edu__desc muted">{text.description}</p>}
                {!!text?.activities?.length && (
                  <ul className="edu__activities">
                    {text.activities.map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                )}
                {e.projects.length > 0 && (
                  <p className="edu__projects">
                    {e.projects
                      .map((id) => getProject(content, id))
                      .filter(Boolean)
                      .map((p) => (
                        <L key={p!.id} to={projectPath(p!.id)} className="chip chip--link">
                          {projectText(content, locale, p!.id).title}
                        </L>
                      ))}
                  </p>
                )}
              </div>
            </Reveal>
          );
        })}
    </ol>
  );
}

export function CertificationList() {
  const { content, locale, tag, t } = useSite();
  const resume = resumeText(content, locale);
  return (
    <ul role="list" className="cert-list">
      {content.certifications
        .filter((c) => c.enabled)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((c) => {
          const name = resume.certifications?.[c.id]?.name ?? c.name;
          return (
            <li key={c.id} className="cert">
              <span className="label cert__kind">{t(`certifications.kind.${c.kind}`)}</span>
              <h3 className="cert__name">{c.url ? <ExternalLink href={c.url}>{name}</ExternalLink> : name}</h3>
              <p className="cert__issuer muted">
                {c.issuer} · {c.inProgress ? t('certifications.inProgress') : formatYm(c.date, tag)}
              </p>
              {c.credentialId && <p className="cert__id mono faint">{t('certifications.id', { id: c.credentialId })}</p>}
            </li>
          );
        })}
    </ul>
  );
}

const levelRank: Record<string, number> = { native: 5, fluent: 4, advanced: 4, intermediate: 3, elementary: 2, learning: 1 };

export function SpokenLanguages() {
  const { content, locale, t } = useSite();
  const resume = resumeText(content, locale);
  return (
    <ul role="list" className="lang-list">
      {content.languages
        .filter((l) => l.enabled)
        .map((l) => (
          <li key={l.id} className="lang">
            <span className="lang__code mono" aria-hidden="true">
              {l.id.toUpperCase()}
            </span>
            <span className="lang__name">{resume.languages?.[l.id] ?? l.id}</span>
            <span className="lang__level">
              <span className="lang__bars" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={n <= (levelRank[l.level] ?? 0) ? 'is-on' : ''} />
                ))}
              </span>
              <span className="label">
                {t(`languages.level.${l.level}`)}
                {l.cefr ? ` · ${l.cefr}` : ''}
              </span>
            </span>
          </li>
        ))}
    </ul>
  );
}
