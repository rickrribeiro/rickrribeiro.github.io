/**
 * Runtime schemas for every JSON file in src/content.
 * They are the single source of truth for the content model: TypeScript types
 * are inferred from them, and `npm run validate` / the test-suite use them to
 * produce readable errors before anything reaches the browser.
 */
import { z } from 'zod';

const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])(-\d{2})?$/, 'Use "YYYY-MM" or "YYYY-MM-DD"');
/** Talks may only know the year: "YYYY", "YYYY-MM" or "YYYY-MM-DD". */
const yearOrYm = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2])(-\d{2})?)?$/, 'Use "YYYY", "YYYY-MM" or "YYYY-MM-DD"');
const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'Ids must be kebab-case (a-z, 0-9, -)');
const url = z.url();
const localPath = z.string().startsWith('/', 'Local assets must start with "/" (relative to /public)');
const assetRef = z.union([localPath, url]);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour');

// ── site.json ────────────────────────────────────────────────────────────
export const localeDef = z.object({
  code: z.string().regex(/^[a-z]{2}$/),
  label: z.string(),
  short: z.string(),
  tag: z.string(),
  ogLocale: z.string(),
});

export const siteSchema = z.object({
  name: z.string().min(1),
  handle: z.string(),
  url: url,
  email: z.email(),
  defaultLocale: z.string(),
  locales: z.array(localeDef).min(1),
  portrait: localPath,
  resume: z.record(z.string(), localPath),
  currentRole: z.object({ experience: id }).optional(),
  availability: z.looseObject({ open: z.boolean() }),
  careerStart: yearMonth,
  stats: z.array(z.object({ id, value: z.string(), experience: id.nullable() })).default([]),
});

// ── sections.json ────────────────────────────────────────────────────────
export const homeSectionIds = [
  'featuredProjects',
  'intro',
  'experience',
  'moreProjects',
  'skills',
  'experiments',
  'talks',
  'journey',
  'contact',
] as const;
export const aboutSectionIds = ['experience', 'skills', 'education', 'certifications', 'languages'] as const;
export const pageIds = ['work', 'about', 'lab', 'talks', 'journey', 'contact'] as const;

export const sectionsSchema = z.object({
  sections: z.record(z.string(), z.boolean()),
  homeOrder: z.array(z.enum(homeSectionIds)),
  aboutOrder: z.array(z.enum(aboutSectionIds)),
  navigation: z.array(z.enum(pageIds)),
  homeLimits: z.record(z.string(), z.number().int().positive()).default({}),
});

// ── theme.json ───────────────────────────────────────────────────────────
export const themeSchema = z.object({
  colors: z.object({
    bg: color,
    bgElevated: color,
    surface: color,
    line: color,
    text: color,
    muted: color,
    accent: color,
    accentInk: color,
    signal: color,
  }),
  fonts: z.object({ display: z.string(), serif: z.string(), mono: z.string() }),
});

// ── social.json ──────────────────────────────────────────────────────────
export const socialIds = ['email', 'linkedin', 'github', 'medium', 'instagram', 'facebook', 'whatsapp', 'x', 'youtube', 'website'] as const;
export const socialSchema = z.object({
  links: z.array(
    z.object({
      id: z.enum(socialIds),
      enabled: z.boolean(),
      url: z.string().min(1),
      label: z.string(),
      placements: z.array(z.enum(['hero', 'contact', 'footer', 'journey'])),
    }),
  ),
});

// ── skills.json ──────────────────────────────────────────────────────────
export const skillSchema = z.object({
  name: z.string(),
  since: z.number().int().min(1990).max(2100).optional(),
  core: z.boolean().optional(),
});
export const skillsSchema = z.object({
  groups: z.array(z.object({ id, skills: z.array(id) })),
  catalog: z.record(id, skillSchema),
});

// ── experience.json ──────────────────────────────────────────────────────
export const employmentTypes = ['full-time', 'part-time', 'contract', 'consulting', 'freelance', 'internship', 'volunteer'] as const;
export const experienceSchema = z.object({
  items: z.array(
    z.object({
      id,
      enabled: z.boolean(),
      company: z.string(),
      website: url.nullable().optional(),
      logo: assetRef.nullable().optional(),
      workplace: z.enum(['remote', 'onsite', 'hybrid']),
      location: z.string().nullable().optional(),
      roles: z
        .array(
          z.object({
            id,
            employmentType: z.enum(employmentTypes),
            start: yearMonth,
            end: yearMonth.nullable(),
          }),
        )
        .min(1),
      skills: z.array(id).default([]),
      projects: z.array(id).default([]),
      highlight: z.boolean().default(true),
    }),
  ),
});

// ── education.json ───────────────────────────────────────────────────────
export const educationSchema = z.object({
  items: z.array(
    z.object({
      id,
      enabled: z.boolean(),
      institution: z.string(),
      website: url.nullable().optional(),
      location: z.string().nullable().optional(),
      start: yearMonth,
      end: yearMonth.nullable(),
      status: z.enum(['completed', 'in-progress', 'transferred']),
      grade: z.string().optional(),
      skills: z.array(id).default([]),
      projects: z.array(id).default([]),
      certifications: z.array(id).default([]),
    }),
  ),
});

// ── certifications.json ──────────────────────────────────────────────────
export const certificationSchema = z.object({
  items: z.array(
    z.object({
      id,
      enabled: z.boolean(),
      kind: z.enum(['certification', 'course', 'workshop', 'award', 'exam']),
      name: z.string(),
      issuer: z.string(),
      date: yearMonth,
      credentialId: z.string().nullable().optional(),
      url: url.nullable().optional(),
      inProgress: z.boolean().optional(),
    }),
  ),
});

// ── languages.json ───────────────────────────────────────────────────────
export const languageLevels = ['native', 'fluent', 'advanced', 'intermediate', 'elementary', 'learning'] as const;
export const languagesSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().regex(/^[a-z]{2,3}$/),
      enabled: z.boolean(),
      level: z.enum(languageLevels),
      cefr: z.string().optional(),
      evidence: id.nullable().optional(),
    }),
  ),
});

// ── projects.json ────────────────────────────────────────────────────────
export const projectStatuses = ['shipped', 'in-progress', 'experimental', 'archived'] as const;
export const projectTypes = ['professional', 'consulting', 'personal', 'startup', 'academic', 'hackathon', 'open-source'] as const;
export const projectCategories = [
  'ai',
  'fullstack',
  'backend',
  'cloud',
  'games',
  'mobile',
  'startup',
  'experiments',
  'devtools',
  'automation',
] as const;
export const nodeKinds = ['client', 'service', 'data', 'queue', 'external', 'ai', 'infra'] as const;
export const frames = ['browser', 'phone', 'none'] as const;

const mediaItem = z.object({
  src: assetRef,
  kind: z.enum(['image', 'video']).default('image'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  poster: assetRef.optional(),
  frame: z.enum(frames).optional(),
  caption: z.string().optional(),
});

export const projectSchema = z.object({
  id,
  enabled: z.boolean(),
  featured: z.boolean().default(false),
  featuredOrder: z.number().int().positive().optional(),
  order: z.number().int().optional(),
  lab: z.boolean().default(false),
  status: z.enum(projectStatuses),
  type: z.enum(projectTypes),
  categories: z.array(z.enum(projectCategories)).min(1),
  technologies: z.array(id).default([]),
  period: z.object({ start: yearMonth, end: yearMonth.nullable() }),
  source: z.enum(['public', 'private', 'confidential']),
  experience: id.optional(),
  talks: z.array(id).default([]),
  related: z.array(id).default([]),
  links: z
    .object({
      github: url.optional(),
      demo: url.optional(),
      website: url.optional(),
      slides: url.optional(),
      docs: url.optional(),
      video: url.optional(),
      extra: z.array(z.object({ id, url })).optional(),
    })
    .default({}),
  cover: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('image'), src: assetRef, width: z.number(), height: z.number(), frame: z.enum(frames).optional() }),
    z.object({ kind: z.literal('video'), src: assetRef, poster: assetRef, width: z.number(), height: z.number() }),
    z.object({ kind: z.literal('diagram') }),
    z.object({ kind: z.literal('type') }),
  ]),
  accent: color.optional(),
  gallery: z.array(mediaItem).default([]),
  diagram: z
    .object({
      nodes: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          kind: z.enum(nodeKinds),
          x: z.number().min(0).max(100),
          y: z.number().min(0).max(60),
        }),
      ),
      edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional(), dashed: z.boolean().optional() })),
    })
    .optional(),
});

export const projectsSchema = z.object({
  filters: z.array(z.string()),
  items: z.array(projectSchema),
});

// ── talks.json ───────────────────────────────────────────────────────────
export const talkKinds = ['talk', 'workshop', 'showcase', 'hackathon', 'community'] as const;
export const talksSchema = z.object({
  items: z.array(
    z.object({
      id,
      enabled: z.boolean(),
      kind: z.enum(talkKinds),
      date: yearOrYm,
      endDate: yearOrYm.optional(),
      event: z.string(),
      organizer: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      media: z.array(z.object({ src: assetRef, width: z.number(), height: z.number() })).default([]),
      links: z
        .object({ slides: url.optional(), video: url.optional(), code: url.optional(), event: url.optional() })
        .default({}),
      projects: z.array(id).default([]),
    }),
  ),
});

// ── journey.json ─────────────────────────────────────────────────────────
export const journeySchema = z.object({
  places: z.array(
    z.object({
      id,
      enabled: z.boolean(),
      kind: z.enum(['home', 'lived', 'studied', 'spoke', 'visited']),
      city: z.string().nullable(),
      country: z.string().length(2),
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
      start: yearMonth.nullable(),
      end: yearMonth.nullable(),
      durationMonths: z.number().optional(),
    }),
  ),
  photos: z.array(z.object({ src: assetRef, width: z.number(), height: z.number(), alt: z.string() })).default([]),
});

// ── locale files ─────────────────────────────────────────────────────────
const textList = z.array(z.string());
export const projectTextSchema = z
  .object({
    title: z.string(),
    tagline: z.string().optional(),
    summary: z.string().optional(),
    role: z.string().optional(),
    overview: z.string().optional(),
    problem: z.string().optional(),
    approach: z.string().optional(),
    architecture: z.string().optional(),
    challenges: textList.optional(),
    outcomes: textList.optional(),
    lessons: textList.optional(),
    ending: z.string().optional(),
    note: z.string().optional(),
    captions: z.record(z.string(), z.string()).optional(),
    extraLinks: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const localeProjectsSchema = z.record(z.string(), projectTextSchema.partial());

export const localeResumeSchema = z.object({
  experience: z.record(
    z.string(),
    z.object({
      summary: z.string().optional(),
      roles: z.record(z.string(), z.object({ title: z.string(), description: z.string().optional(), achievements: textList.optional() }).partial()),
    }).partial(),
  ),
  education: z.record(
    z.string(),
    z.object({ degree: z.string(), field: z.string(), description: z.string(), activities: textList }).partial(),
  ),
  certifications: z.record(z.string(), z.object({ name: z.string(), note: z.string() }).partial()).default({}),
  languages: z.record(z.string(), z.string()),
}).partial();

export const localeTalksSchema = z.record(
  z.string(),
  z.object({ title: z.string(), description: z.string(), mediaAlt: textList }).partial(),
);

export const localeSiteSchema = z.object({
  role: z.string(),
  location: z.string(),
  hero: z.object({ eyebrow: z.string(), headline: textList, headlineAccent: z.string(), lead: z.string() }).partial(),
  stats: z.record(z.string(), z.string()),
  availability: z.string(),
  intro: z.object({ title: z.string(), paragraphs: textList }).partial(),
  journey: z
    .object({ title: z.string(), intro: z.string(), outro: z.string(), places: z.record(z.string(), z.string()) })
    .partial(),
  contact: z.object({ title: textList, lead: z.string() }).partial(),
  seo: z.record(z.string(), z.string()),
}).partial();

export type Site = z.infer<typeof siteSchema>;
export type Sections = z.infer<typeof sectionsSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Social = z.infer<typeof socialSchema>;
export type SocialLink = Social['links'][number];
export type Skills = z.infer<typeof skillsSchema>;
export type Experience = z.infer<typeof experienceSchema>['items'][number];
export type Education = z.infer<typeof educationSchema>['items'][number];
export type Certification = z.infer<typeof certificationSchema>['items'][number];
export type SpokenLanguage = z.infer<typeof languagesSchema>['items'][number];
export type Project = z.infer<typeof projectSchema>;
export type ProjectText = z.infer<typeof projectTextSchema>;
export type Talk = z.infer<typeof talksSchema>['items'][number];
export type Journey = z.infer<typeof journeySchema>;
export type Place = Journey['places'][number];
export type LocaleSite = z.infer<typeof localeSiteSchema>;
export type LocaleResume = z.infer<typeof localeResumeSchema>;
export type LocaleTalks = z.infer<typeof localeTalksSchema>;
export type LocaleProjects = z.infer<typeof localeProjectsSchema>;
export type ProjectStatus = (typeof projectStatuses)[number];
export type ProjectCategory = (typeof projectCategories)[number];
export type HomeSectionId = (typeof homeSectionIds)[number];
export type AboutSectionId = (typeof aboutSectionIds)[number];
export type PageId = (typeof pageIds)[number];
