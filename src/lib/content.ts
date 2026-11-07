/**
 * Pure selectors over the parsed content + locale-aware text helpers.
 * Nothing here touches React, so everything is unit-testable.
 */
import type { ParsedContent } from './validate';
import type {
  AboutSectionId,
  Experience,
  HomeSectionId,
  PageId,
  Project,
  ProjectText,
  Talk,
  LocaleSite,
} from './schema';

// ── generic helpers ──────────────────────────────────────────────────────
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

/** Deep merge used for translation fallback: `over` wins, arrays are replaced, missing keys come from `base`. */
export function deepMerge<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return (over === undefined || over === null || over === '' ? base : over) as T;
  const out: Obj = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = deepMerge((base as Obj)[k], v);
  return out as T;
}

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

// ── translation ──────────────────────────────────────────────────────────
export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

export function createT(content: ParsedContent, locale: string): TFunction {
  const own = content.ui[locale] ?? {};
  const fallback = content.ui[content.site.defaultLocale] ?? {};
  return (key, vars) => interpolate(own[key] ?? fallback[key] ?? key, vars);
}

export function resolveLocale(content: ParsedContent, code: string | undefined): string {
  return content.site.locales.some((l) => l.code === code) ? (code as string) : content.site.defaultLocale;
}

export function localeTag(content: ParsedContent, locale: string): string {
  return content.site.locales.find((l) => l.code === locale)?.tag ?? 'en-US';
}

function localized<K extends 'projects' | 'resume' | 'talks' | 'site'>(content: ParsedContent, locale: string, part: K) {
  const base = content.locales[content.site.defaultLocale]?.[part];
  const own = content.locales[locale]?.[part];
  return deepMerge(base, own) as ParsedContent['locales'][string][K];
}

export function siteText(content: ParsedContent, locale: string): LocaleSite {
  return localized(content, locale, 'site') ?? {};
}

export function projectText(content: ParsedContent, locale: string, id: string): ProjectText {
  const all = localized(content, locale, 'projects') ?? {};
  return { title: id, ...(all[id] ?? {}) } as ProjectText;
}

export function resumeText(content: ParsedContent, locale: string) {
  return localized(content, locale, 'resume') ?? {};
}

export function talkText(content: ParsedContent, locale: string, id: string) {
  return (localized(content, locale, 'talks') ?? {})[id] ?? {};
}

// ── dates ────────────────────────────────────────────────────────────────
export function parseYm(ym: string): Date {
  const [y, m, d] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function formatYm(ym: string, tag: string, withDay = false): string {
  if (/^\d{4}$/.test(ym)) return ym;
  const hasDay = ym.split('-').length === 3;
  return new Intl.DateTimeFormat(tag, {
    month: 'short',
    year: 'numeric',
    ...(withDay && hasDay ? { day: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(parseYm(ym));
}

export function formatRange(start: string, end: string | null, tag: string, presentLabel: string): string {
  const s = formatYm(start, tag);
  if (end === null) return `${s} – ${presentLabel}`;
  const e = formatYm(end, tag);
  return s === e ? s : `${s} – ${e}`;
}

/** Inclusive month count between two YYYY-MM values (end null = `now`). */
export function monthsBetween(start: string, end: string | null, now: Date = new Date()): number {
  const s = parseYm(start);
  const e = end ? parseYm(end) : now;
  return Math.max(1, (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()) + 1);
}

export function formatDuration(months: number, t: TFunction, tag = 'en-US'): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const rule = (n: number) => new Intl.PluralRules(tag).select(n);
  return [
    y ? t(`experience.duration.years_${rule(y)}`, { n: y }).replace(/^experience\.duration\.years_\w+$/, t('experience.duration.years_other', { n: y })) : '',
    m ? t(`experience.duration.months_${rule(m)}`, { n: m }).replace(/^experience\.duration\.months_\w+$/, t('experience.duration.months_other', { n: m })) : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function yearOf(ym: string): number {
  return Number(ym.slice(0, 4));
}

// ── sections & navigation ────────────────────────────────────────────────
const pageSection: Record<PageId, string | null> = {
  work: null,
  about: null,
  lab: 'experiments',
  talks: 'talks',
  journey: 'journey',
  contact: 'contact',
};

export function isSectionEnabled(content: ParsedContent, id: string): boolean {
  return content.sections.sections[id] !== false;
}

export function isPageEnabled(content: ParsedContent, page: PageId): boolean {
  const section = pageSection[page];
  return section === null || isSectionEnabled(content, section);
}

export function navItems(content: ParsedContent): PageId[] {
  return content.sections.navigation.filter((p) => isPageEnabled(content, p));
}

export function homeSections(content: ParsedContent): HomeSectionId[] {
  return content.sections.homeOrder.filter((s) => isSectionEnabled(content, s));
}

export function aboutSections(content: ParsedContent): AboutSectionId[] {
  return content.sections.aboutOrder.filter((s) => isSectionEnabled(content, s));
}

export function homeLimit(content: ParsedContent, id: string, fallback: number): number {
  return content.sections.homeLimits[id] ?? fallback;
}

// ── projects ─────────────────────────────────────────────────────────────
const byRecency = (a: Project, b: Project) =>
  (a.order ?? 0) - (b.order ?? 0) ||
  (b.period.end ?? '9999').localeCompare(a.period.end ?? '9999') ||
  b.period.start.localeCompare(a.period.start);

export function visibleProjects(content: ParsedContent): Project[] {
  return content.projects.filter((p) => p.enabled).sort(byRecency);
}

export function featuredProjects(content: ParsedContent): Project[] {
  return visibleProjects(content)
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
}

/** Projects for the Work page: everything except pure Lab experiments that are not featured. */
export function workProjects(content: ParsedContent): Project[] {
  return visibleProjects(content).filter((p) => !p.lab || p.featured);
}

export function labProjects(content: ParsedContent): Project[] {
  return visibleProjects(content).filter((p) => p.lab && !p.featured);
}

export function matchesFilter(p: Project, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'featured') return p.featured;
  if (filter === 'lab') return p.lab;
  if (filter === 'professional') return p.type === 'professional' || p.type === 'consulting';
  return p.type === filter || (p.categories as string[]).includes(filter);
}

export function filterProjects(projects: Project[], filter: string): Project[] {
  return projects.filter((p) => matchesFilter(p, filter));
}

/** Filters that would show at least one project (so empty chips are never rendered). */
export function availableFilters(content: ParsedContent, projects: Project[]): string[] {
  return content.projectFilters.filter((f) => f === 'all' || projects.some((p) => matchesFilter(p, f)));
}

export function getProject(content: ParsedContent, id: string): Project | undefined {
  return content.projects.find((p) => p.id === id && p.enabled);
}

export function nextProject(content: ParsedContent, id: string): Project | undefined {
  const list = [...featuredProjects(content), ...workProjects(content).filter((p) => !p.featured)];
  const i = list.findIndex((p) => p.id === id);
  if (list.length < 2) return undefined;
  return list[(i + 1) % list.length];
}

export function skillName(content: ParsedContent, id: string): string {
  return content.skills.catalog[id]?.name ?? id;
}

// ── experience / skills ──────────────────────────────────────────────────
export function visibleExperience(content: ParsedContent): Experience[] {
  return content.experience.filter((e) => e.enabled);
}

export function experienceSpan(e: Experience): { start: string; end: string | null } {
  const starts = e.roles.map((r) => r.start).sort();
  const ends = e.roles.map((r) => r.end);
  return { start: starts[0], end: ends.includes(null) ? null : (ends as string[]).sort().at(-1)! };
}

/** skill id → ids of (enabled) experiences that list it. This is the "where did I use it" relation. */
export function skillUsage(content: ParsedContent): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const e of visibleExperience(content)) for (const s of e.skills) (out[s] ??= []).push(e.id);
  return out;
}

export interface SkillView {
  id: string;
  name: string;
  since?: number;
  core: boolean;
  usedAt: string[];
}

export function skillGroups(content: ParsedContent): { id: string; skills: SkillView[] }[] {
  const usage = skillUsage(content);
  return content.skills.groups.map((g) => ({
    id: g.id,
    skills: g.skills.map((id) => {
      const s = content.skills.catalog[id];
      return { id, name: s?.name ?? id, since: s?.since, core: !!s?.core, usedAt: usage[id] ?? [] };
    }),
  }));
}

/** Skills shown in groups, bucketed by the year they were first used (newest year first). */
export function skillsByYear(content: ParsedContent): { year: number; skills: SkillView[] }[] {
  const seen = new Set<string>();
  const all = skillGroups(content)
    .flatMap((g) => g.skills)
    .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
  const years = new Map<number, SkillView[]>();
  for (const s of all) if (s.since) (years.get(s.since) ?? years.set(s.since, []).get(s.since)!).push(s);
  return [...years.entries()].sort((a, b) => b[0] - a[0]).map(([year, skills]) => ({ year, skills }));
}

export function yearsOfExperience(content: ParsedContent, now: Date = new Date()): number {
  return Math.floor(monthsBetween(content.site.careerStart, null, now) / 12);
}

// ── talks ────────────────────────────────────────────────────────────────
export function visibleTalks(content: ParsedContent): Talk[] {
  return content.talks.filter((t) => t.enabled).sort((a, b) => b.date.localeCompare(a.date));
}

// ── resume ───────────────────────────────────────────────────────────────
export function resumeUrl(content: ParsedContent, locale: string): string {
  return content.site.resume[locale] ?? content.site.resume[content.site.defaultLocale];
}
