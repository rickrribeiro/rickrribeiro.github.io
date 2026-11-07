import { useState } from 'react';
import { useSite } from '../../app/SiteContext';
import { skillGroups, skillsByYear, visibleExperience, type SkillView } from '../../lib/content';
import { Reveal } from '../../components/Reveal';

function useCompanyNames() {
  const { content } = useSite();
  const map = new Map(visibleExperience(content).map((e) => [e.id, e.company]));
  return (ids: string[]) => ids.map((id) => map.get(id) ?? id);
}

function SkillRow({ s, showUsage }: { s: SkillView; showUsage: boolean }) {
  const { t } = useSite();
  const names = useCompanyNames();
  return (
    <li className={`skill ${s.core ? 'skill--core' : ''}`}>
      <span className="skill__name">
        {s.core && (
          <span className="skill__core" title={t('skills.core')}>
            <span className="visually-hidden">{t('skills.core')}: </span>
          </span>
        )}
        {s.name}
      </span>
      {s.since && <span className="skill__since mono">{t('skills.since', { year: s.since })}</span>}
      {showUsage && (
        <span className="skill__usage">
          {s.usedAt.length ? names(s.usedAt).join(' · ') : <span className="faint">{t('skills.personal')}</span>}
        </span>
      )}
    </li>
  );
}

/** Homepage version: a few groups, names + year only. */
export function SkillsCompact({ groups: only }: { groups?: string[] }) {
  const { content, t } = useSite();
  const groups = skillGroups(content).filter((g) => !only || only.includes(g.id));
  return (
    <div className="skills-grid">
      {groups.map((g, i) => (
        <Reveal key={g.id} className="skills-group" delay={(i % 4) * 60}>
          <h3 className="skills-group__title label">
            <span className="mono accent">{String(i + 1).padStart(2, '0')}</span> {t(`skills.groups.${g.id}`)}
          </h3>
          <ul role="list" className="skills-group__list">
            {g.skills.map((s) => (
              <SkillRow key={s.id} s={s} showUsage={false} />
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}

/** Résumé version: toggle between "by area" (with where each skill was used) and "by year acquired". */
export function SkillsFull() {
  const { content, t } = useSite();
  const [view, setView] = useState<'group' | 'year'>('group');
  return (
    <div className="skills-full">
      <div className="skills-full__bar">
        <p className="muted skills-full__intro">{t('skills.intro')}</p>
        <div className="segmented" role="group" aria-label={t('about.skills')}>
          <button type="button" aria-pressed={view === 'group'} onClick={() => setView('group')}>
            {t('skills.viewByGroup')}
          </button>
          <button type="button" aria-pressed={view === 'year'} onClick={() => setView('year')}>
            {t('skills.viewByYear')}
          </button>
        </div>
      </div>
      {view === 'group' ? (
        <div className="skills-grid skills-grid--full">
          {skillGroups(content).map((g) => (
            <section key={g.id} className="skills-group" aria-labelledby={`sg-${g.id}`}>
              <h3 className="skills-group__title label" id={`sg-${g.id}`}>
                {t(`skills.groups.${g.id}`)}
              </h3>
              <ul role="list" className="skills-group__list">
                {g.skills.map((s) => (
                  <SkillRow key={s.id} s={s} showUsage />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ol role="list" className="skills-years">
          {skillsByYear(content).map(({ year, skills }) => (
            <li key={year} className="skills-year">
              <h3 className="skills-year__year">{year}</h3>
              <ul role="list" className="skills-year__list">
                {skills.map((s) => (
                  <li key={s.id} className={`chip ${s.core ? 'chip--accent' : ''}`}>
                    {s.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
