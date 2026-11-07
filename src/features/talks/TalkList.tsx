import { useSite } from '../../app/SiteContext';
import { formatYm, getProject, projectText, talkText, visibleTalks } from '../../lib/content';
import { projectPath } from '../../lib/routes';
import { ExternalLink, L } from '../../components/Links';
import { Img } from '../../components/Media';
import { Reveal } from '../../components/Reveal';
import { Icon } from '../../components/Icon';

export function TalkList({ limit, compact = false }: { limit?: number; compact?: boolean }) {
  const { content, locale, tag, t } = useSite();
  const talks = visibleTalks(content).slice(0, limit);
  return (
    <ol role="list" className={`talks ${compact ? 'talks--compact' : ''}`}>
      {talks.map((talk, i) => {
        const text = talkText(content, locale, talk.id);
        const media = talk.media[0];
        const date = formatYm(talk.date, tag, true) + (talk.endDate ? ` – ${formatYm(talk.endDate, tag)}` : '');
        const links = Object.entries(talk.links).filter(([, v]) => v) as [string, string][];
        return (
          <Reveal as="li" key={talk.id} className={`talk ${media ? 'talk--media' : ''}`} delay={(i % 3) * 70}>
            {media && (
              <figure className="talk__media">
                <Img src={media.src} alt={text.mediaAlt?.[0] ?? ''} width={media.width} height={media.height} />
                {!compact && talk.media.length > 1 && (
                  <div className="talk__thumbs">
                    {talk.media.slice(1).map((m2, j) => (
                      <Img key={m2.src} src={m2.src} alt={text.mediaAlt?.[j + 1] ?? ''} width={m2.width} height={m2.height} />
                    ))}
                  </div>
                )}
              </figure>
            )}
            <div className="talk__body">
              <p className="talk__meta label">
                <span className="talk__kind">{t(`talks.kind.${talk.kind}`)}</span>
                <time dateTime={talk.date}>{date}</time>
              </p>
              <h3 className="talk__title">{text.title}</h3>
              <p className="talk__event">
                {talk.event}
                {talk.organizer && <span className="muted"> · {t('talks.organizer', { organizer: talk.organizer })}</span>}
                {talk.location && <span className="muted"> · {talk.location}</span>}
              </p>
              {!compact && text.description && <p className="talk__desc muted">{text.description}</p>}
              {!compact && (links.length > 0 || talk.projects.length > 0) && (
                <p className="talk__links">
                  {links.map(([k, href]) => (
                    <ExternalLink key={k} href={href} className="link-arrow">
                      {t(`links.${k}`)}
                    </ExternalLink>
                  ))}
                  {talk.projects
                    .map((id) => getProject(content, id))
                    .filter(Boolean)
                    .map((p) => (
                      <L key={p!.id} to={projectPath(p!.id)} className="link-arrow">
                        {projectText(content, locale, p!.id).title} <Icon name="arrow-right" size={14} />
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
