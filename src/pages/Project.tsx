import { useParams } from '../lib/router';
import type { CSSProperties } from 'react';
import { useSite } from '../app/SiteContext';
import { Seo } from '../app/seo';
import { formatRange, getProject, nextProject, projectText, skillName, talkText, visibleExperience, formatYm } from '../lib/content';
import { projectPath } from '../lib/routes';
import { ExternalLink, L } from '../components/Links';
import { Icon } from '../components/Icon';
import { Chips, StatusBadge } from '../components/ui';
import { DeviceFrame, Img } from '../components/Media';
import { Reveal } from '../components/Reveal';
import { ProjectCover } from '../features/projects/ProjectCover';
import { Diagram } from '../features/projects/Diagram';
import { NotFoundPage } from './NotFound';

const linkOrder = ['demo', 'website', 'github', 'slides', 'docs', 'video'] as const;

export function ProjectPage() {
  const { id = '' } = useParams();
  const { content, locale, tag, t } = useSite();
  const project = getProject(content, id);
  if (!project) return <NotFoundPage />;

  const text = projectText(content, locale, project.id);
  const exp = visibleExperience(content).find((e) => e.id === project.experience);
  const next = nextProject(content, project.id);
  const nextText = next ? projectText(content, locale, next.id) : null;
  const talks = project.talks.map((tid) => content.talks.find((x) => x.id === tid && x.enabled)).filter(Boolean);
  const links = linkOrder.filter((k) => project.links[k]).map((k) => ({ k, href: project.links[k]! }));
  const extra = project.links.extra ?? [];

  const blocks = [
    { id: 'overview', title: t('project.overview'), body: text.overview },
    { id: 'problem', title: t('project.problem'), body: text.problem },
    { id: 'approach', title: t('project.approach'), body: text.approach },
  ].filter((b) => b.body);
  const lists = [
    { id: 'challenges', title: t('project.challenges'), items: text.challenges, ordered: true },
    { id: 'outcomes', title: t('project.outcomes'), items: text.outcomes, ordered: false },
    { id: 'lessons', title: t('project.lessons'), items: text.lessons, ordered: false },
  ].filter((l) => l.items?.length);
  const showArchitecture = !!project.diagram;
  const chapters = text.chapters ?? [];
  const gallery = project.gallery;
  const features = text.features ?? [];
  const toc = [
    ...(features.length ? [{ id: 'features', title: t('project.features') }] : []),
    ...blocks.map((b) => ({ id: b.id, title: b.title })),
    ...(showArchitecture ? [{ id: 'architecture', title: t('project.architecture') }] : []),
    ...chapters.map((c) => ({ id: c.id, title: c.title })),
    ...lists.map((l) => ({ id: l.id, title: l.title })),
    ...(text.ending ? [{ id: 'ending', title: t('project.ending') }] : []),
    ...(gallery.length ? [{ id: 'gallery', title: t('project.gallery') }] : []),
  ];
  const style = { '--p-accent': project.accent ?? 'var(--accent)' } as CSSProperties;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': project.links.github ? 'SoftwareSourceCode' : 'CreativeWork',
    name: text.title,
    description: text.summary,
    author: { '@type': 'Person', name: content.site.name, url: content.site.url },
    dateCreated: project.period.start,
    keywords: project.technologies.map((s) => skillName(content, s)).join(', '),
    ...(project.links.github ? { codeRepository: project.links.github } : {}),
    ...(project.links.demo ? { url: project.links.demo } : {}),
  };

  return (
    <article className="case" style={style}>
      <Seo title={text.title} description={text.summary ?? text.tagline ?? text.title} image={`/og/work/${project.id}.png`} type="article" jsonLd={[jsonLd]} />

      <header className="case__head container">
        <L to="/work/" className="case__back label">
          <Icon name="arrow-left" size={14} /> {t('project.back')}
        </L>
        <p className="case__kicker label">
          {t('project.caseStudy')} · {t(`type.${project.type}`)} · {project.categories.map((c) => t(`category.${c}`)).join(' / ')}
        </p>
        <h1 className="case__title">{text.title}</h1>
        {text.tagline && <p className="case__tagline serif">{text.tagline}</p>}

        <dl className="case__meta">
          {text.role && (
            <div>
              <dt className="label">{t('project.role')}</dt>
              <dd>{text.role}</dd>
            </div>
          )}
          <div>
            <dt className="label">{t('project.period')}</dt>
            <dd>{formatRange(project.period.start, project.period.end, tag, t('project.present'))}</dd>
          </div>
          <div>
            <dt className="label">{t('project.status')}</dt>
            <dd>
              <StatusBadge status={project.status} />
            </dd>
          </div>
          {exp && (
            <div>
              <dt className="label">{t('project.experience')}</dt>
              <dd>
                <L to="/about/#experience">{exp.company}</L>
              </dd>
            </div>
          )}
        </dl>

        <div className="case__links">
          {links.map(({ k, href }) => (
            <ExternalLink key={k} href={href} className={`button ${k === 'demo' ? 'button--primary' : 'button--ghost'}`}>
              {k === 'github' && <Icon name="github" size={16} />}
              {t(`links.${k}`)}
            </ExternalLink>
          ))}
          {extra.map((x) => (
            <ExternalLink key={x.id} href={x.url} className="button button--ghost">
              {text.extraLinks?.[x.id] ?? x.id}
            </ExternalLink>
          ))}
          {project.source !== 'public' && (
            <span className="case__source label">
              <Icon name="lock" size={14} /> {project.source === 'private' ? t('project.sourcePrivate') : t('project.sourceConfidential')}
            </span>
          )}
        </div>
      </header>

      <div className="case__cover container">
        {project.cover.kind === 'diagram' && project.diagram ? (
          <div className="cover cover--diagram cover--hero">
            <Diagram data={project.diagram} title={t('a11y.diagram', { title: text.title })} interactive />
          </div>
        ) : (
          <ProjectCover project={project} text={text} variant="hero" eager />
        )}
      </div>

      <div className="case__body container">
        <nav className="case__toc" aria-label={t('project.caseStudy')}>
          <ol role="list">
            {toc.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span> {s.title}
                </a>
              </li>
            ))}
          </ol>
          <Chips items={project.technologies.map((s) => skillName(content, s))} className="case__stack" />
        </nav>

        <div className="case__content">
          {text.note && <p className="case__note">{text.note}</p>}

          {features.length > 0 && (
            <Reveal as="section" className="case__section" aria-labelledby="h-features">
              <h2 className="case__h" id="h-features">
                <span id="features" className="case__anchor" />
                {t('project.features')}
              </h2>
              <div className="feature-tree">
                <p className="feature-tree__root mono">{text.title}</p>
                <ul className="feature-tree__branches">
                  {features.map((m) => (
                    <li key={m.module} className="feature-tree__module">
                      <span className="feature-tree__name">{m.module}</span>
                      <ul className="feature-tree__leaves">
                        {m.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {blocks.map((b) => (
            <Reveal as="section" key={b.id} className="case__section" aria-labelledby={`h-${b.id}`}>
              <h2 className="case__h" id={`h-${b.id}`}>
                <span id={b.id} className="case__anchor" />
                {b.title}
              </h2>
              <p className="case__text">{b.body}</p>
            </Reveal>
          ))}

          {showArchitecture && (
            <Reveal as="section" className="case__section" aria-labelledby="h-architecture">
              <h2 className="case__h" id="h-architecture">
                <span id="architecture" className="case__anchor" />
                {t('project.architecture')}
              </h2>
              {text.architecture && <p className="case__text">{text.architecture}</p>}
              {project.cover.kind !== 'diagram' && (
                <div className="cover cover--diagram case__diagram">
                  <Diagram data={project.diagram!} title={t('a11y.diagram', { title: text.title })} interactive />
                </div>
              )}
              <ul className="case__nodes" aria-label={t('a11y.diagram', { title: text.title })}>
                {project.diagram!.nodes.map((n) => (
                  <li key={n.id}>
                    <span className={`node-dot node-dot--${n.kind}`} aria-hidden="true" />
                    {n.label}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {chapters.map((c) => (
            <Reveal as="section" key={c.id} className={`case__section case__section--chapter`} aria-labelledby={`h-${c.id}`}>
              <h2 className="case__h" id={`h-${c.id}`}>
                <span id={c.id} className="case__anchor" />
                {c.title}
              </h2>
              {c.body && <p className="case__text">{c.body}</p>}
              {!!c.points?.length && (
                <ul className="case__list case__list--chapter">
                  {c.points.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}

          {lists.map((l) => {
            const Tag = l.ordered ? 'ol' : 'ul';
            return (
              <Reveal as="section" key={l.id} className={`case__section case__section--${l.id}`} aria-labelledby={`h-${l.id}`}>
                <h2 className="case__h" id={`h-${l.id}`}>
                  <span id={l.id} className="case__anchor" />
                  {l.title}
                </h2>
                <Tag className={`case__list case__list--${l.id}`}>
                  {l.items!.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </Tag>
              </Reveal>
            );
          })}

          {text.ending && (
            <Reveal as="section" className="case__section" aria-labelledby="h-ending">
              <h2 className="case__h" id="h-ending">
                <span id="ending" className="case__anchor" />
                {t('project.ending')}
              </h2>
              <p className="case__text">{text.ending}</p>
            </Reveal>
          )}

          {gallery.length > 0 && (
            <section className="case__section" aria-labelledby="h-gallery">
              <h2 className="case__h" id="h-gallery">
                <span id="gallery" className="case__anchor" />
                {t('project.gallery')}
              </h2>
              <div className="gallery">
                {gallery.map((g) => {
                  const caption = g.caption ? text.captions?.[g.caption] : undefined;
                  return (
                    <figure key={g.src} className={`gallery__item gallery__item--${g.frame ?? 'none'}`}>
                      {g.kind === 'video' ? (
                        <video src={g.src} poster={g.poster} controls preload="none" width={g.width} height={g.height} />
                      ) : (
                        <DeviceFrame kind={g.frame}>
                          <Img src={g.src} alt={caption ?? text.title} width={g.width} height={g.height} />
                        </DeviceFrame>
                      )}
                      {caption && <figcaption className="label">{caption}</figcaption>}
                    </figure>
                  );
                })}
              </div>
            </section>
          )}

          {talks.length > 0 && (
            <section className="case__section" aria-labelledby="h-talks">
              <h2 className="case__h" id="h-talks">
                {t('project.relatedTalks')}
              </h2>
              <ul role="list" className="case__talks">
                {talks.map((tk) => (
                  <li key={tk!.id}>
                    <L to="/talks/" className="link-arrow">
                      {talkText(content, locale, tk!.id).title}
                    </L>
                    <span className="label">
                      {tk!.event} · {formatYm(tk!.date, tag)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {next && nextText && (
        <L to={projectPath(next.id)} className="case__next">
          <span className="container case__next-inner">
            <span className="label">{t('project.next')}</span>
            <span className="case__next-title">
              {nextText.title} <Icon name="arrow-right" size={40} />
            </span>
          </span>
        </L>
      )}
    </article>
  );
}
