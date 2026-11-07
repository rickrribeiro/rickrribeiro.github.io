import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSite } from '../app/SiteContext';
import { Seo } from '../app/seo';
import { formatRange, formatYm } from '../lib/content';
import { PageHeader } from '../components/ui';
import { ExternalLink } from '../components/Links';
import { Img } from '../components/Media';
import { Reveal } from '../components/Reveal';
import { SpokenLanguages } from '../features/resume/Education';

// The globe is decorative + interactive; load it only in the browser, after first paint.
const Globe = lazy(() => import('../features/journey/Globe').then((m) => ({ default: m.Globe })));

const fmtCoord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}°${v >= 0 ? pos : neg}`;

export function JourneyPage() {
  const { content, tag, t, text } = useSite();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const places = useMemo(() => content.journey.places.filter((p) => p.enabled), [content]);
  const region = (code: string) => new Intl.DisplayNames([tag], { type: 'region' }).of(code) ?? code;
  const instagram = content.social.links.find((l) => l.enabled && l.placements.includes('journey'));

  return (
    <>
      <Seo title={text.journey?.title ?? t('nav.journey')} description={text.seo?.journey ?? ''} />
      <PageHeader kicker={t('journey.kicker')} title={text.journey?.title ?? ''} intro={text.journey?.intro} />

      <section className="section section--tight container journey">
        <div className="journey__globe">
          {mounted ? (
            <Suspense fallback={<div className="globe globe--placeholder" />}>
              <Globe places={places} label={t('a11y.globe')} names={Object.fromEntries(places.map((p) => [p.id, p.city ?? region(p.country)]))} />
            </Suspense>
          ) : (
            <div className="globe globe--placeholder" />
          )}
        </div>
        <div className="journey__places">
          <h2 className="label">{t('journey.places')}</h2>
          <ol role="list" className="places">
            {places.map((p) => (
              <Reveal as="li" key={p.id} className={`place place--${p.kind}`}>
                <span className="place__kind label">{t(`journey.kind.${p.kind}`)}</span>
                <h3 className="place__name">
                  {p.city ? `${p.city}, ` : ''}
                  {region(p.country)}
                </h3>
                <p className="place__coords mono">
                  {fmtCoord(p.lat, 'N', 'S')} {fmtCoord(p.lon, 'E', 'W')}
                  {p.start && <> · {p.end || p.kind === 'home' || p.kind === 'lived' ? formatRange(p.start, p.end, tag, t('project.present')) : formatYm(p.start, tag)}</>}
                  {p.durationMonths && <> · {t('journey.months', { n: p.durationMonths })}</>}
                </p>
                {text.journey?.places?.[p.id] && <p className="place__note muted">{text.journey.places[p.id]}</p>}
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container journey__more">
        <Reveal className="journey__languages">
          <h2 className="journey__h">{t('journey.languagesTitle')}</h2>
          <SpokenLanguages />
        </Reveal>
        <Reveal className="journey__outro" delay={100}>
          {content.journey.photos[0] && (
            <figure className="portrait portrait--tilt">
              <Img src={content.journey.photos[0].src} alt={content.site.name} width={content.journey.photos[0].width} height={content.journey.photos[0].height} />
            </figure>
          )}
          <p className="serif journey__outro-text">{text.journey?.outro}</p>
          {instagram && (
            <ExternalLink href={instagram.url} className="link-arrow">
              {t('journey.follow')}
            </ExternalLink>
          )}
        </Reveal>
      </section>
    </>
  );
}
