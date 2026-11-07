import { useSite } from '../../app/SiteContext';
import type { Project } from '../../lib/schema';
import { projectText, skillName, yearOf } from '../../lib/content';
import { projectPath } from '../../lib/routes';
import { L } from '../../components/Links';
import { Icon } from '../../components/Icon';
import { StatusBadge } from '../../components/ui';
import { ProjectCover } from './ProjectCover';

/** Card used in the Lab grid. The whole card is one link (title is the accessible name). */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { content, locale, t } = useSite();
  const text = projectText(content, locale, project.id);
  return (
    <article className="pcard">
      <ProjectCover project={project} text={text} index={String(index).padStart(2, '0')} variant="card" />
      <div className="pcard__body">
        <div className="pcard__meta">
          <StatusBadge status={project.status} />
          <span className="label">{yearOf(project.period.start)}</span>
        </div>
        <h3 className="pcard__title">
          <L to={projectPath(project.id)} className="pcard__link">
            {text.title}
          </L>
        </h3>
        {text.tagline && <p className="pcard__tagline">{text.tagline}</p>}
        <p className="pcard__stack mono">
          {project.technologies
            .slice(0, 4)
            .map((s) => skillName(content, s))
            .join(' · ')}
        </p>
        <span className="pcard__go" aria-hidden="true">
          {t('project.caseStudy')} <Icon name="arrow-right" size={14} />
        </span>
      </div>
    </article>
  );
}
