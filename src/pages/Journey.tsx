import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSite } from '../app/SiteContext';
import { Seo } from '../app/seo';
import { atLeast, countryName, countryStats, formatDays, formatRange, formatYm, journeyTotals, pastTrips } from '../lib/content';
import type { PlaceKind } from '../lib/schema';
import { PageHeader } from '../components/ui';
import { ExternalLink } from '../components/Links';
import { Img } from '../components/Media';
import { Reveal } from '../components/Reveal';
import { SpokenLanguages } from '../features/resume/Education';

// The globe is decorative + interactive; load it only in the browser, after first paint.
const Globe = lazy(() => import('../features/journey/Globe').then((m) => ({ default: m.Globe })));

const fmtCoord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}°${v >= 0 ? pos : neg}`;
const highlightKinds: PlaceKind[] = ['studied', 'spoke', 'lived', 'home'];

export function KindBadges({ kinds }: { kinds: PlaceKind[] }) {
  const { t } = useSite();
  const shown = highlightKinds.filter((k) => kinds.includes(k));
  if (!shown.length) return null;
  return (
    <span className="kind-badges">
      {shown.map((k) => (
        <span key={k} className={`kind-badge kind-badge--${k}`}>
          {t(`journey.kind.${k}`)}
        </span>
      ))}
    </span>
  );
}

export function JourneyPage() {
  const { content, locale, tag, t, text } = useSite();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const places = useMemo(() => content.journey.places.filter((p) => p.enabled), [content]);
  const trips = useMemo(() => pastTrips(content), [content]);
  const stats = useMemo(() => countryStats(content), [content]);
  const totals = useMemo(() => journeyTotals(content), [content]);
  const region = (code: string) => countryName(content, locale, code);
  const number = (n: number) => new Intl.NumberFormat(tag).format(n);
  const maxDays = Math.max(1, ...stats.map((s) => s.days));
  const instagram = content.social.links.find((l) => l.enabled && l.placements.includes('journey'));
  const names = useMemo(() => Object.fromEntries(places.map((p) => [p.id, p.city ?? region(p.country)])), [places]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Seo title={text.journey?.title ?? t('nav.journey')} description={text.seo?.journey ?? ''} />
      <PageHeader kicker={t('journey.kicker')} title={text.journey?.title ?? ''} intro={text.journey?.intro} />

      {trips.length > 0 && (
        <section className="container journey-stats" aria-label={t('journey.statsLabel')}>
          <dl>
            <div>
              <dt className="label">{t('journey.stats.countries')}</dt>
              <dd>{totals.countries}</dd>
            </div>
            <div>
              <dt className="label">{t('journey.stats.cities')}</dt>
              <dd>{atLeast(totals.cities)}</dd>
            </div>
            <div>
              <dt className="label">{t('journey.stats.trips')}</dt>
              <dd>{totals.trips}</dd>
            </div>
            <div>
              <dt className="label">{t('journey.stats.km')}</dt>
              <dd>≈{number(totals.km)}</dd>
            </div>
            {totals.nomadSince && (
              <div>
                <dt className="label">{t('journey.stats.nomadSince')}</dt>
                <dd>{formatYm(totals.nomadSince, tag)}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="section section--tight container journey">
        <div className="journey__globe">
          {mounted ? (
            <Suspense fallback={<div className="globe globe--placeholder" />}>
              <Globe places={places} trips={trips} label={t('a11y.globe')} names={names} />
            </Suspense>
          ) : (
            <div className="globe globe--placeholder" />
          )}
          <p className="journey__legend label">
            <span className="legend-dot legend-dot--home" /> {t('journey.kind.home')}
            <span className="legend-dot legend-dot--highlight" /> {t('journey.legendHighlight')}
            <span className="legend-dot legend-dot--trip" /> {t('journey.legendTrip')}
          </p>
        </div>
        <div className="journey__places">
          <h2 className="label">{t('journey.highlights')}</h2>
          <ol role="list" className="places">
            {places.map((p) => (
              <Reveal as="li" key={p.id} className={`place place--${p.kinds[0]}`}>
                <KindBadges kinds={p.kinds} />
                <h3 className="place__name">
                  {p.city ? `${p.city}, ` : ''}
                  {region(p.country)}
                </h3>
                <p className="place__coords mono">
                  {fmtCoord(p.lat, 'N', 'S')} {fmtCoord(p.lon, 'E', 'W')}
                  {p.start && <> · {p.end || p.kinds.includes('home') || p.kinds.includes('lived') ? formatRange(p.start, p.end, tag, t('project.present')) : formatYm(p.start, tag)}</>}
                  {p.durationMonths && <> · {t('journey.months', { n: p.durationMonths })}</>}
                </p>
                {text.journey?.places?.[p.id] && <p className="place__note muted">{text.journey.places[p.id]}</p>}
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="section container" aria-labelledby="countries-title">
          <header className="countries__head">
            <h2 className="journey__h" id="countries-title">
              {t('journey.countriesTitle')}
            </h2>
            <p className="muted">{t('journey.countriesIntro')}</p>
          </header>
          <ol role="list" className="countries">
            {stats.map((c, i) => {
              const highlighted = c.kinds.some((k) => k !== 'visited');
              return (
                <li key={c.country} className={`country ${highlighted ? 'country--highlight' : ''}`}>
                  <details>
                    <summary className="country__summary">
                      <span className="country__rank mono">{String(i + 1).padStart(2, '0')}</span>
                      <span className="country__name">
                        {region(c.country)}
                        <KindBadges kinds={c.kinds} />
                      </span>
                      <span className="country__bar" aria-hidden="true">
                        <span style={{ width: `${Math.max(2, (c.days / maxDays) * 100)}%` }} />
                      </span>
                      <span className="country__time">{c.days > 0 ? formatDays(c.days, t, tag) : t('journey.passingThrough')}</span>
                      <span className="country__cities label">{t(`journey.cities_${new Intl.PluralRules(tag).select(c.cities.length)}`, { n: c.cities.length })}</span>
                    </summary>
                    <ul role="list" className="country__list">
                      {c.cities.map((city) => (
                        <li key={city.city}>
                          <span className="country__city">{city.city}</span>
                          <span className="mono muted">
                            {city.visits
                              .map((v) => (v.start.slice(0, 7) === v.end.slice(0, 7) ? formatYm(v.start.slice(0, 7), tag) : formatRange(v.start.slice(0, 7), v.end.slice(0, 7), tag, '')))
                              .join(' · ')}
                          </span>
                          <span className="mono">{city.days > 0 ? formatDays(city.days, t, tag) : t('journey.passingThrough')}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ol>
          <p className="countries__source label">
            {t('journey.source', { date: content.trips.syncedAt })}{' '}
            <ExternalLink href={content.trips.source}>nomads.com</ExternalLink>
          </p>
        </section>
      )}

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
