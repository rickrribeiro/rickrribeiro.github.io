import { useSite } from '../../app/SiteContext';
import type { Project } from '../../lib/schema';
import { formatRange, projectText, skillName } from '../../lib/content';
import { projectPath } from '../../lib/routes';
import { L } from '../../components/Links';
import { Icon } from '../../components/Icon';
import { Reveal } from '../../components/Reveal';
import { StatusBadge } from '../../components/ui';
import { ProjectCover } from './ProjectCover';

/** One large editorial "plate" per featured project. Alternates sides on desktop. */
export function FeaturedProject({ project, index, total }: { project: Project; index: number; total: number }) {
  const { content, locale, tag, t } = useSite();
  const text = projectText(content, locale, project.id);
  const num = String(index + 1).padStart(2, '0');
  const highlight = text.outcomes?.[0];
  const titleId = `fp-${project.id}`;

  return (
    <article className={`plate ${index % 2 ? 'plate--flip' : ''}`} aria-labelledby={titleId}>
      <Reveal className="plate__rail">
        <span className="plate__num">{num}</span>
        <span className="label">/ {String(total).padStart(2, '0')}</span>
        <span className="plate__rail-line" aria-hidden="true" />
        <span className="label plate__rail-meta">
          {t(`type.${project.type}`)} · {formatRange(project.period.start, project.period.end, tag, t('project.present'))}
        </span>
      </Reveal>

      <Reveal className="plate__media" delay={80}>
        <L to={projectPath(project.id)} className="plate__media-link" tabIndex={-1} aria-hidden="true">
          <ProjectCover project={project} text={text} index={num} variant="feature" />
        </L>
      </Reveal>

      <Reveal className="plate__body" delay={140}>
        <div className="plate__badges">
          <StatusBadge status={project.status} />
          {project.categories.slice(0, 3).map((c) => (
            <span key={c} className="label">
              {t(`category.${c}`)}
            </span>
          ))}
        </div>
        <h3 className="plate__title" id={titleId}>
          <L to={projectPath(project.id)} className="plate__title-link">
            {text.title}
          </L>
        </h3>
        {text.tagline && <p className="plate__tagline serif">{text.tagline}</p>}
        {text.summary && <p className="plate__summary">{text.summary}</p>}
        {highlight && (
          <p className="plate__highlight">
            <span className="plate__highlight-mark" aria-hidden="true">
              ↳
            </span>
            {highlight}
          </p>
        )}
        <p className="plate__stack mono">
          {project.technologies
            .slice(0, 7)
            .map((s) => skillName(content, s))
            .join('  ·  ')}
        </p>
        <L to={projectPath(project.id)} className="button button--ghost plate__cta">
          {t('project.viewCase')} <Icon name="arrow-right" size={16} />
          <span className="visually-hidden">: {text.title}</span>
        </L>
      </Reveal>
    </article>
  );
}
