/**
 * Content validation. Pure — it receives the raw JSON and (optionally) a
 * function that checks whether a local asset exists, so it can run in the
 * build script, in tests and in the dev server alike.
 */
import { z } from 'zod';
import * as S from './schema';

export interface RawLocale {
  projects?: unknown;
  resume?: unknown;
  talks?: unknown;
  site?: unknown;
}

export interface RawContent {
  site: unknown;
  sections: unknown;
  theme: unknown;
  social: unknown;
  skills: unknown;
  experience: unknown;
  education: unknown;
  certifications: unknown;
  languages: unknown;
  projects: unknown;
  talks: unknown;
  journey: unknown;
  trips?: unknown;
  locales: Record<string, RawLocale>;
  ui: Record<string, unknown>;
}

export interface ParsedContent {
  site: S.Site;
  sections: S.Sections;
  theme: S.Theme;
  social: S.Social;
  skills: S.Skills;
  experience: S.Experience[];
  education: S.Education[];
  certifications: S.Certification[];
  languages: S.SpokenLanguage[];
  projects: S.Project[];
  projectFilters: string[];
  talks: S.Talk[];
  journey: S.Journey;
  trips: S.Trips;
  /** locale → ISO country code → display name (filled per language at load time). */
  countries?: Record<string, Record<string, string>>;
  locales: Record<
    string,
    { projects: S.LocaleProjects; resume: S.LocaleResume; talks: S.LocaleTalks; site: S.LocaleSite }
  >;
  ui: Record<string, Record<string, string>>;
}

export interface Issue {
  level: 'error' | 'warning';
  file: string;
  message: string;
}

export interface ValidationResult {
  content: ParsedContent | null;
  issues: Issue[];
}

/** Flattens nested UI-string objects into dot keys: {nav:{work:"Work"}} → {"nav.work":"Work"}. */
export function flatten(obj: unknown, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k.startsWith('$')) continue;
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  } else if (typeof obj === 'string') {
    out[prefix] = obj;
  }
  return out;
}

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string, issues: Issue[]): T | null {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  for (const e of r.error.issues) {
    issues.push({ level: 'error', file, message: `${e.path.join('.') || '(root)'}: ${e.message}` });
  }
  return null;
}

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const i of ids) (seen.has(i) ? dup : seen).add(i);
  return [...dup];
}

/** Collects every leaf key path of a locale object, for translation coverage checks. */
function leafKeys(obj: unknown, prefix = ''): string[] {
  if (Array.isArray(obj)) return [prefix];
  if (obj && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      k.startsWith('$') ? [] : leafKeys(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

export function validateContent(raw: RawContent, assetExists?: (path: string) => boolean): ValidationResult {
  const issues: Issue[] = [];
  const err = (file: string, message: string) => issues.push({ level: 'error', file, message });
  const warn = (file: string, message: string) => issues.push({ level: 'warning', file, message });

  const site = parse(S.siteSchema, raw.site, 'site.json', issues);
  const sections = parse(S.sectionsSchema, raw.sections, 'sections.json', issues);
  const theme = parse(S.themeSchema, raw.theme, 'theme.json', issues);
  const social = parse(S.socialSchema, raw.social, 'social.json', issues);
  const skills = parse(S.skillsSchema, raw.skills, 'skills.json', issues);
  const experience = parse(S.experienceSchema, raw.experience, 'experience.json', issues);
  const education = parse(S.educationSchema, raw.education, 'education.json', issues);
  const certifications = parse(S.certificationSchema, raw.certifications, 'certifications.json', issues);
  const languages = parse(S.languagesSchema, raw.languages, 'languages.json', issues);
  const projects = parse(S.projectsSchema, raw.projects, 'projects.json', issues);
  const talks = parse(S.talksSchema, raw.talks, 'talks.json', issues);
  const journey = parse(S.journeySchema, raw.journey, 'journey.json', issues);
  const trips = parse(S.tripsSchema, raw.trips ?? { source: '', syncedAt: '1970-01-01', nomadSince: null, trips: [] }, 'trips.json', issues);

  if (!site || !sections || !theme || !social || !skills || !experience || !education || !certifications || !languages || !projects || !talks || !journey || !trips) {
    return { content: null, issues };
  }

  // ── duplicate ids ──────────────────────────────────────────────────────
  const collections: [string, { id: string }[]][] = [
    ['projects.json', projects.items],
    ['experience.json', experience.items],
    ['education.json', education.items],
    ['certifications.json', certifications.items],
    ['languages.json', languages.items],
    ['talks.json', talks.items],
    ['journey.json', journey.places],
    ['social.json', social.links],
  ];
  for (const [file, items] of collections) {
    for (const d of duplicates(items.map((i) => i.id))) err(file, `Duplicate id "${d}"`);
  }

  const projectIds = new Set(projects.items.map((p) => p.id));
  const expIds = new Set(experience.items.map((e) => e.id));
  const talkIds = new Set(talks.items.map((t) => t.id));
  const certIds = new Set(certifications.items.map((c) => c.id));
  const skillIds = new Set(Object.keys(skills.catalog));
  const ref = (file: string, owner: string, kind: string, value: string | null | undefined, pool: Set<string>) => {
    if (value && !pool.has(value)) err(file, `${owner} references unknown ${kind} "${value}"`);
  };

  // ── relationships ──────────────────────────────────────────────────────
  for (const p of projects.items) {
    const o = `project "${p.id}"`;
    ref('projects.json', o, 'experience', p.experience, expIds);
    p.talks.forEach((t) => ref('projects.json', o, 'talk', t, talkIds));
    p.related.forEach((r) => ref('projects.json', o, 'project', r, projectIds));
    p.technologies.forEach((t) => ref('projects.json', o, 'skill (skills.json catalog)', t, skillIds));
    if (p.featured && p.featuredOrder === undefined) err('projects.json', `${o} is featured but has no featuredOrder`);
    if (p.cover.kind === 'diagram' && !p.diagram) err('projects.json', `${o} uses a diagram cover but has no "diagram"`);
    if (p.diagram) {
      const nodes = new Set(p.diagram.nodes.map((n) => n.id));
      for (const d of duplicates(p.diagram.nodes.map((n) => n.id))) err('projects.json', `${o} diagram has duplicate node "${d}"`);
      for (const e of p.diagram.edges) {
        if (!nodes.has(e.from)) err('projects.json', `${o} diagram edge from unknown node "${e.from}"`);
        if (!nodes.has(e.to)) err('projects.json', `${o} diagram edge to unknown node "${e.to}"`);
      }
    }
    if (p.period.end && p.period.end < p.period.start) err('projects.json', `${o} ends before it starts`);
  }
  const featuredOrders = projects.items.filter((p) => p.enabled && p.featured).map((p) => String(p.featuredOrder));
  for (const d of duplicates(featuredOrders)) err('projects.json', `Two featured projects share featuredOrder ${d}`);
  for (const f of projects.filters) {
    const ok =
      ['all', 'featured', 'lab'].includes(f) ||
      (S.projectTypes as readonly string[]).includes(f) ||
      (S.projectCategories as readonly string[]).includes(f);
    if (!ok) err('projects.json', `Unknown filter "${f}" (use all, featured, lab, a type or a category)`);
  }

  for (const e of experience.items) {
    const o = `experience "${e.id}"`;
    e.skills.forEach((s) => ref('experience.json', o, 'skill', s, skillIds));
    e.projects.forEach((p) => ref('experience.json', o, 'project', p, projectIds));
    for (const d of duplicates(e.roles.map((r) => r.id))) err('experience.json', `${o} has duplicate role "${d}"`);
    for (const r of e.roles) if (r.end && r.end < r.start) err('experience.json', `${o} role "${r.id}" ends before it starts`);
  }
  for (const e of education.items) {
    const o = `education "${e.id}"`;
    e.skills.forEach((s) => ref('education.json', o, 'skill', s, skillIds));
    e.projects.forEach((p) => ref('education.json', o, 'project', p, projectIds));
    e.certifications.forEach((c) => ref('education.json', o, 'certification', c, certIds));
  }
  for (const t of talks.items) t.projects.forEach((p) => ref('talks.json', `talk "${t.id}"`, 'project', p, projectIds));
  for (const l of languages.items) ref('languages.json', `language "${l.id}"`, 'certification', l.evidence, certIds);
  for (const g of skills.groups) g.skills.forEach((s) => ref('skills.json', `group "${g.id}"`, 'skill', s, skillIds));
  for (const d of duplicates(skills.groups.map((g) => g.id))) err('skills.json', `Duplicate group "${d}"`);
  for (const d of duplicates(skills.groups.flatMap((g) => g.skills))) warn('skills.json', `Skill "${d}" appears in more than one group`);
  ref('site.json', 'currentRole', 'experience', site.currentRole?.experience, expIds);
  site.stats.forEach((s) => ref('site.json', `stat "${s.id}"`, 'experience', s.experience, expIds));
  for (const d of duplicates(sections.homeOrder)) err('sections.json', `homeOrder lists "${d}" twice`);
  for (const d of duplicates(sections.aboutOrder)) err('sections.json', `aboutOrder lists "${d}" twice`);
  for (const d of duplicates(sections.navigation)) err('sections.json', `navigation lists "${d}" twice`);

  // ── journey overrides ──────────────────────────────────────────────────
  const tripCities = new Set(trips.trips.map((t) => t.city));
  for (const [city, code] of Object.entries(journey.overrides.cityCountry)) {
    if (!tripCities.has(city)) warn('journey.json', `overrides.cityCountry: no trip in "${city}" (check the spelling in trips.json)`);
    if (code.length !== 2 && !journey.overrides.regions[code]) err('journey.json', `overrides.cityCountry maps "${city}" to "${code}" but overrides.regions has no names for it`);
  }

  // ── locales ────────────────────────────────────────────────────────────
  const codes = site.locales.map((l) => l.code);
  if (!codes.includes(site.defaultLocale)) err('site.json', `defaultLocale "${site.defaultLocale}" is not in locales`);
  if (!site.resume[site.defaultLocale]) err('site.json', `resume needs at least a "${site.defaultLocale}" file (used as fallback)`);
  for (const code of Object.keys(site.resume)) if (!codes.includes(code)) warn('site.json', `resume.${code} is not a configured locale`);

  const locales: ParsedContent['locales'] = {};
  const ui: ParsedContent['ui'] = {};
  for (const code of codes) {
    const l = raw.locales[code] ?? {};
    if (!raw.locales[code]) {
      if (code === site.defaultLocale) err(`locales/${code}`, `The default locale "${code}" needs a content folder`);
      else warn(`locales/${code}`, `Locale "${code}" has no content files yet — everything falls back to ${site.defaultLocale}`);
    }
    if (!raw.ui[code]) (code === site.defaultLocale ? err : warn)(`i18n/${code}.json`, `Locale "${code}" has no UI strings file`);
    const projectsText = parse(S.localeProjectsSchema, l.projects ?? {}, `locales/${code}/projects.json`, issues) ?? {};
    const resume = parse(S.localeResumeSchema, l.resume ?? {}, `locales/${code}/resume.json`, issues) ?? {};
    const talksText = parse(S.localeTalksSchema, l.talks ?? {}, `locales/${code}/talks.json`, issues) ?? {};
    const siteText = parse(S.localeSiteSchema, l.site ?? {}, `locales/${code}/site.json`, issues) ?? {};
    locales[code] = { projects: projectsText, resume, talks: talksText, site: siteText };
    ui[code] = flatten(raw.ui[code] ?? {});

    for (const id of Object.keys(projectsText)) if (!projectIds.has(id)) err(`locales/${code}/projects.json`, `Text for unknown project "${id}"`);
    for (const id of Object.keys(talksText)) if (!talkIds.has(id)) err(`locales/${code}/talks.json`, `Text for unknown talk "${id}"`);
    for (const id of Object.keys(resume.experience ?? {})) if (!expIds.has(id)) err(`locales/${code}/resume.json`, `Text for unknown experience "${id}"`);
  }

  // Required text in the default locale.
  const def = locales[site.defaultLocale];
  if (def) {
    const f = `locales/${site.defaultLocale}`;
    for (const p of projects.items.filter((x) => x.enabled)) {
      const t = def.projects[p.id];
      if (!t?.title) err(`${f}/projects.json`, `Project "${p.id}" needs a title`);
      if (!t?.summary) err(`${f}/projects.json`, `Project "${p.id}" needs a summary`);
      for (const g of p.gallery) if (g.caption && !t?.captions?.[g.caption]) warn(`${f}/projects.json`, `Project "${p.id}" has no caption text for "${g.caption}"`);
    }
    for (const e of experience.items.filter((x) => x.enabled)) {
      for (const r of e.roles) {
        if (!def.resume.experience?.[e.id]?.roles?.[r.id]?.title) err(`${f}/resume.json`, `Experience "${e.id}" role "${r.id}" needs a title`);
      }
    }
    for (const e of education.items.filter((x) => x.enabled)) {
      if (!def.resume.education?.[e.id]?.degree) err(`${f}/resume.json`, `Education "${e.id}" needs a degree`);
    }
    for (const t of talks.items.filter((x) => x.enabled)) {
      if (!def.talks[t.id]?.title) err(`${f}/talks.json`, `Talk "${t.id}" needs a title`);
    }
    for (const l of languages.items) {
      if (!def.resume.languages?.[l.id]) err(`${f}/resume.json`, `Spoken language "${l.id}" needs a name under "languages"`);
    }
  }

  // Translation coverage: keys present in the default locale but missing elsewhere fall back to English (warning);
  // UI keys that exist only in a translation are almost always typos (error).
  const defUi = ui[site.defaultLocale] ?? {};
  for (const code of codes.filter((c) => c !== site.defaultLocale)) {
    const strings = ui[code] ?? {};
    const missing = Object.keys(defUi).filter((k) => !(k in strings));
    if (missing.length) warn(`i18n/${code}.json`, `${missing.length} UI string(s) fall back to ${site.defaultLocale}: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`);
    for (const k of Object.keys(strings)) if (!(k in defUi)) err(`i18n/${code}.json`, `Unknown UI key "${k}" (not in ${site.defaultLocale}.json)`);

    for (const part of ['projects', 'resume', 'talks', 'site'] as const) {
      const base = new Set(leafKeys(raw.locales[site.defaultLocale]?.[part] ?? {}));
      const have = new Set(leafKeys(raw.locales[code]?.[part] ?? {}));
      const miss = [...base].filter((k) => !have.has(k));
      if (miss.length) warn(`locales/${code}/${part}.json`, `${miss.length} text(s) fall back to ${site.defaultLocale}: ${miss.slice(0, 6).join(', ')}${miss.length > 6 ? '…' : ''}`);
    }
  }

  // ── assets ─────────────────────────────────────────────────────────────
  if (assetExists) {
    const check = (file: string, path: string | null | undefined) => {
      if (path && path.startsWith('/') && !assetExists(path)) err(file, `Missing asset "public${path}"`);
    };
    check('site.json', site.portrait);
    Object.values(site.resume).forEach((p) => check('site.json', p));
    for (const p of projects.items) {
      if (p.cover.kind === 'image') check('projects.json', p.cover.src);
      if (p.cover.kind === 'video') {
        check('projects.json', p.cover.src);
        check('projects.json', p.cover.poster);
      }
      p.gallery.forEach((g) => {
        check('projects.json', g.src);
        check('projects.json', g.poster);
      });
    }
    talks.items.forEach((t) => t.media.forEach((m) => check('talks.json', m.src)));
    journey.photos.forEach((m) => check('journey.json', m.src));
    experience.items.forEach((e) => check('experience.json', e.logo));
  }

  const content: ParsedContent = {
    site,
    sections,
    theme,
    social,
    skills,
    experience: experience.items,
    education: education.items,
    certifications: certifications.items,
    languages: languages.items,
    projects: projects.items,
    projectFilters: projects.filters,
    talks: talks.items,
    journey,
    trips,
    locales,
    ui,
  };
  return { content: issues.some((i) => i.level === 'error') ? null : content, issues };
}

export function formatIssues(issues: Issue[]): string {
  return issues
    .map((i) => `${i.level === 'error' ? '✖' : '⚠'} [${i.file}] ${i.message}`)
    .join('\n');
}
