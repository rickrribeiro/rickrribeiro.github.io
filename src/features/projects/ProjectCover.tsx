import type { CSSProperties } from 'react';
import type { Project, ProjectText } from '../../lib/schema';
import { useSite } from '../../app/SiteContext';
import { skillName } from '../../lib/content';
import { DeviceFrame, Img } from '../../components/Media';
import { Diagram } from './Diagram';

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Generative fallback: concentric orbits seeded by the project id + oversized typography. */
function TypeCover({ project, text, index }: { project: Project; text: ProjectText; index?: string }) {
  const { content } = useSite();
  const h = hash(project.id);
  const rings = 5 + (h % 4);
  const cx = 62 + (h % 25);
  const cy = 30 + ((h >> 3) % 25);
  const word = text.title.split(/\s+/)[0];
  return (
    <div className="cover-type" aria-hidden="true">
      <svg className="cover-type__orbits" viewBox="0 0 100 62.5" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: rings }, (_, i) => (
          <circle key={i} cx={cx} cy={cy} r={6 + i * (7 + (h % 3))} className="cover-type__ring" style={{ animationDelay: `${i * -1.3}s` }} />
        ))}
        <circle cx={cx} cy={cy} r="1.2" className="cover-type__core" />
      </svg>
      <span className="cover-type__word">{word}</span>
      {index && <span className="cover-type__index">{index}</span>}
      <span className="cover-type__stack mono">
        {project.technologies
          .slice(0, 5)
          .map((t) => skillName(content, t))
          .join(' / ')}
      </span>
    </div>
  );
}

export function ProjectCover({
  project,
  text,
  index,
  eager = false,
  variant = 'card',
}: {
  project: Project;
  text: ProjectText;
  index?: string;
  eager?: boolean;
  variant?: 'card' | 'feature' | 'hero';
}) {
  const { t } = useSite();
  const style = { '--p-accent': project.accent ?? 'var(--accent)' } as CSSProperties;
  const { cover } = project;
  let inner;
  if (cover.kind === 'image') {
    inner = (
      <div className={`cover-media cover-media--${cover.frame ?? 'none'}`}>
        <DeviceFrame kind={cover.frame} label={project.links.demo?.replace(/^https?:\/\//, '')}>
          <Img src={cover.src} alt={`${text.title} — screenshot`} width={cover.width} height={cover.height} eager={eager} />
        </DeviceFrame>
      </div>
    );
  } else if (cover.kind === 'video') {
    inner = (
      <video className="cover-video" src={cover.src} poster={cover.poster} muted loop playsInline autoPlay preload="none" width={cover.width} height={cover.height} aria-label={text.title} />
    );
  } else if (cover.kind === 'diagram' && project.diagram) {
    inner = <Diagram data={project.diagram} title={t('a11y.diagram', { title: text.title })} />;
  } else {
    inner = <TypeCover project={project} text={text} index={index} />;
  }

  return (
    <div className={`cover cover--${cover.kind} cover--${variant}`} style={style}>
      <span className="cover__crop cover__crop--tl" aria-hidden="true" />
      <span className="cover__crop cover__crop--br" aria-hidden="true" />
      {inner}
      {cover.kind === 'diagram' && (
        <span className="cover__caption label" aria-hidden="true">
          fig. {index ?? '—'} · {t('project.architecture').toLowerCase()}
        </span>
      )}
    </div>
  );
}
