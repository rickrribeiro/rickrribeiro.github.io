import { describe, expect, it } from 'vitest';
import { parsed } from './helpers';
import {
  createT,
  deepMerge,
  featuredProjects,
  filterProjects,
  formatRange,
  homeSections,
  isPageEnabled,
  labProjects,
  monthsBetween,
  navItems,
  projectText,
  resumeUrl,
  skillsByYear,
  skillUsage,
  visibleProjects,
  workProjects,
} from '../lib/content';

describe('translation fallback', () => {
  it('falls back to English for missing UI strings, then to the key', () => {
    const c = parsed();
    c.ui.pt = { 'nav.work': 'Trabalho' };
    const t = createT(c, 'pt');
    expect(t('nav.work')).toBe('Trabalho');
    expect(t('nav.about')).toBe('About');
    expect(t('does.not.exist')).toBe('does.not.exist');
    expect(t('filter.count', { count: 3 })).toBe('3 projects');
  });

  it('merges localized content over English field by field', () => {
    const c = parsed();
    c.locales.es = { ...c.locales.es, projects: { rickos: { tagline: 'Un sistema operativo personal' } } };
    const text = projectText(c, 'es', 'rickos');
    expect(text.tagline).toBe('Un sistema operativo personal');
    expect(text.title).toBe('RickOS'); // missing → English
  });

  it('deepMerge replaces arrays and ignores empty strings', () => {
    expect(deepMerge({ a: [1, 2], b: 'x', c: { d: 1 } }, { a: [3], b: '', c: { e: 2 } })).toEqual({ a: [3], b: 'x', c: { d: 1, e: 2 } });
  });

  it('formats dates with the locale and uses the "present" label', () => {
    expect(formatRange('2022-03', '2024-05', 'en-US', 'present')).toBe('Mar 2022 – May 2024');
    expect(formatRange('2026-03', null, 'pt-BR', 'atual')).toMatch(/mar\.? de 2026 – atual/);
    expect(monthsBetween('2022-03', '2024-05')).toBe(27);
  });

  it('falls back to the English résumé file', () => {
    const c = parsed();
    expect(resumeUrl(c, 'es')).toBe(c.site.resume.en);
  });
});

describe('projects', () => {
  it('hides disabled projects everywhere', () => {
    const c = parsed();
    expect(c.projects.find((p) => p.id === 'selltime')?.enabled).toBe(false);
    expect(visibleProjects(c).map((p) => p.id)).not.toContain('selltime');
  });

  it('orders featured projects by featuredOrder', () => {
    const c = parsed();
    const f = featuredProjects(c);
    expect(f.map((p) => p.featuredOrder)).toEqual([...f.map((p) => p.featuredOrder)].sort((a, b) => a! - b!));
    expect(f[0].id).toBe('wave-platform');
  });

  it('keeps Lab experiments out of Work unless promoted to featured', () => {
    const c = parsed();
    c.sections.sections.experiments = true;
    expect(workProjects(c).some((p) => p.lab)).toBe(false);
    const lab = labProjects(c)[0];
    lab.featured = true;
    lab.featuredOrder = 99;
    expect(workProjects(c).map((p) => p.id)).toContain(lab.id);
    expect(labProjects(c).map((p) => p.id)).not.toContain(lab.id);
    expect(featuredProjects(c).at(-1)!.id).toBe(lab.id);
  });

  it('folds Lab experiments into Work when the Lab is turned off', () => {
    const c = parsed();
    c.sections.sections.experiments = false;
    expect(labProjects(c)).toEqual([]);
    expect(workProjects(c).some((p) => p.lab)).toBe(true);
    expect(navItems(c)).not.toContain('lab');
  });

  it('filters by featured, type and category', () => {
    const c = parsed();
    const all = workProjects(c);
    expect(filterProjects(all, 'all')).toHaveLength(all.length);
    expect(filterProjects(all, 'featured').every((p) => p.featured)).toBe(true);
    expect(filterProjects(all, 'professional').every((p) => ['professional', 'consulting'].includes(p.type))).toBe(true);
    expect(filterProjects(all, 'ai').every((p) => p.categories.includes('ai'))).toBe(true);
  });
});

describe('skills', () => {
  it('derives where each skill was used from experience.json', () => {
    const usage = skillUsage(parsed());
    expect(usage.kafka).toEqual(['ipq']);
    expect(usage.django).toEqual(expect.arrayContaining(['mindsight', 'ipq']));
  });

  it('buckets skills by year, newest first', () => {
    const years = skillsByYear(parsed()).map((y) => y.year);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });
});

describe('section visibility', () => {
  it('removes disabled sections from the homepage and navigation', () => {
    const c = parsed();
    c.sections.sections.talks = false;
    c.sections.sections.journey = false;
    expect(homeSections(c)).not.toContain('talks');
    expect(isPageEnabled(c, 'talks')).toBe(false);
    expect(navItems(c)).not.toContain('talks');
    expect(navItems(c)).not.toContain('journey');
    expect(navItems(c)).toContain('work');
  });

  it('follows the configured order', () => {
    const c = parsed();
    c.sections.homeOrder = ['contact', 'featuredProjects'];
    expect(homeSections(c)).toEqual(['contact', 'featuredProjects']);
  });
});
