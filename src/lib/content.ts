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
  PlaceKind,
  Trip,
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
/**
 * "Now" for anything date-relative (ongoing stays, "present" durations). Pinned to the
 * build so prerendered HTML and the hydrated app always agree; rebuilds refresh it.
 */
export function buildNow(): Date {
  return typeof __BUILD_DATE__ !== 'undefined' ? new Date(__BUILD_DATE__) : new Date();
}

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
export function monthsBetween(start: string, end: string | null, now: Date = buildNow()): number {
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

/**
 * Projects for the Work page: everything except Lab experiments that aren't featured —
 * unless the Lab is turned off (sections.json → experiments: false), then they live in Work too.
 */
export function workProjects(content: ParsedContent): Project[] {
  if (!isPageEnabled(content, 'lab')) return visibleProjects(content);
  return visibleProjects(content).filter((p) => !p.lab || p.featured);
}

export function labProjects(content: ParsedContent): Project[] {
  if (!isPageEnabled(content, 'lab')) return [];
  return visibleProjects(content).filter((p) => p.lab && !p.featured);
}

/** Done for an employer or client (professional, consulting) vs. on Ricardo's own (everything else). */
export function isWorkProject(p: Project): boolean {
  return p.type === 'professional' || p.type === 'consulting';
}

export function matchesFilter(p: Project, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'featured') return p.featured;
  if (filter === 'lab') return p.lab;
  if (filter === 'professional') return isWorkProject(p);
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

export function yearsOfExperience(content: ParsedContent, now: Date = buildNow()): number {
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

// ── journey ──────────────────────────────────────────────────────────────
const DAY = 86_400_000;

/** Trips that have already started; an ongoing stay counts up to `now`. */
export function pastTrips(content: ParsedContent, now: Date = buildNow()): Trip[] {
  const today = now.toISOString().slice(0, 10);
  const cityCountry = content.journey.overrides?.cityCountry ?? {};
  return content.trips.trips
    .filter((t) => t.start <= today)
    .map((t) => (cityCountry[t.city] ? { ...t, country: cityCountry[t.city] } : t))
    .map((t) => (t.end > today ? { ...t, end: today, days: Math.max(0, Math.round((Date.parse(today) - Date.parse(t.start)) / DAY)) } : t));
}

export interface CityStat {
  city: string;
  days: number;
  visits: { start: string; end: string; days: number }[];
}
export interface CountryStat {
  country: string;
  days: number;
  trips: number;
  first: string;
  last: string;
  cities: CityStat[];
  /** Kinds from curated places in this country (studied, spoke, …) — used for highlights. */
  kinds: PlaceKind[];
}

/** Countries ordered by total time spent there (then by most recent visit). */
export function countryStats(content: ParsedContent, now: Date = buildNow()): CountryStat[] {
  const map = new Map<string, CountryStat>();
  for (const t of pastTrips(content, now)) {
    const c = map.get(t.country) ?? { country: t.country, days: 0, trips: 0, first: t.start, last: t.end, cities: [], kinds: [] };
    c.days += t.days;
    c.trips += 1;
    if (t.start < c.first) c.first = t.start;
    if (t.end > c.last) c.last = t.end;
    let city = c.cities.find((x) => x.city === t.city);
    if (!city) c.cities.push((city = { city: t.city, days: 0, visits: [] }));
    city.days += t.days;
    city.visits.push({ start: t.start, end: t.end, days: t.days });
    map.set(t.country, c);
  }
  for (const p of content.journey.places.filter((x) => x.enabled)) {
    const c = map.get(p.country) ?? { country: p.country, days: 0, trips: 0, first: '', last: '', cities: [], kinds: [] };
    for (const k of p.kinds) if (!c.kinds.includes(k)) c.kinds.push(k);
    map.set(p.country, c);
  }
  for (const [code, days] of Object.entries(content.journey.overrides?.countryDays ?? {})) {
    const c = map.get(code);
    if (c) c.days = days; // nomads.com dates are sometimes off; the curated total wins
  }
  for (const c of map.values()) c.cities.sort((a, b) => b.days - a.days || a.city.localeCompare(b.city));
  // Home country first, then by time spent.
  const home = (c: CountryStat) => (c.kinds.includes('home') ? 1 : 0);
  return [...map.values()].sort((a, b) => home(b) - home(a) || b.days - a.days || b.last.localeCompare(a.last));
}

const haversineKm = (a: Trip, b: Trip) => {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

export function journeyTotals(content: ParsedContent, now: Date = buildNow()) {
  const trips = pastTrips(content, now);
  let km = 0;
  for (let i = 1; i < trips.length; i++) km += haversineKm(trips[i - 1], trips[i]);
  return {
    countries: new Set(trips.map((t) => t.country)).size,
    cities: new Set(trips.map((t) => `${t.city}|${t.country}`)).size,
    trips: trips.length,
    km: Math.round(km),
    nomadSince: content.trips.nomadSince,
  };
}

/** Human duration for a number of days: "2 yrs 3 mos" / "3 wks" / "5 days". */
export function formatDays(days: number, t: TFunction, tag: string): string {
  const rule = (n: number) => new Intl.PluralRules(tag).select(n);
  if (days >= 30) {
    // A month or more is shown in months; a fraction above .5 rounds up.
    const m = days / 30.44;
    const months = Math.max(1, Math.floor(m) + (m - Math.floor(m) > 0.5 ? 1 : 0));
    return formatDuration(months, t, tag);
  }
  const weeks = Math.round(days / 7);
  if (weeks >= 4) return formatDuration(1, t, tag); // "4 weeks" reads better as a month
  if (days >= 14) return t(`journey.duration.weeks_${rule(weeks)}`, { n: weeks });
  return t(`journey.duration.days_${rule(Math.max(1, days))}`, { n: Math.max(1, days) });
}

/** Country display name, resolved at build time (see vite-plugin-content); falls back to the code. */
export function countryName(content: ParsedContent, locale: string, code: string): string {
  return content.countries?.[locale]?.[code] ?? content.countries?.[content.site.defaultLocale]?.[code] ?? code;
}

/** Lower-bound display for counts that are probably incomplete: 53 → "50+", 7 → "7". */
export function atLeast(n: number): string {
  return n >= 20 ? `${Math.floor(n / 10) * 10}+` : String(n);
}

/** Custom label replacing the time spent for a country (journey.json → overrides.countryLabel). */
export function countryLabel(content: ParsedContent, locale: string, code: string): string | undefined {
  const l = content.journey.overrides?.countryLabel?.[code];
  return l ? (l[locale] ?? l[content.site.defaultLocale]) : undefined;
}
