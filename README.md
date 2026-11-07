# rickrribeiro.github.io

The personal portfolio of **Ricardo Ribeiro**, senior software engineer:
projects and case studies, the full résumé, talks, a Lab and a personal journey,
in English, Portuguese and Spanish.

Live site: <https://rickrribeiro.github.io>

The site is static and configuration-first. Every piece of content lives in JSON
under `src/content` and `src/i18n`. You don't need to touch a React component to
add a project, a job or a talk. **See [CONTENT_GUIDE.md](./CONTENT_GUIDE.md).**

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173 — hot-reloads when JSON changes
npm test           # unit + rendering tests (Vitest)
npm run validate   # check all content (also runs automatically on build)
npm run build      # production build into dist/ (prerendered)
npm run preview    # serve dist/ locally
npm run images     # convert new .jpg/.png in public/images to .webp
npm run sync:nomads       # refresh src/content/trips.json from nomads.com
npm run sources:snapshot  # nomads + LinkedIn (via local Chrome) + GitHub → .cache/sources/
```

### Keeping it up to date

In Claude Code, ask *"atualiza o portfólio"* (or run `/update-portfolio`). The project skill in
`.claude/skills/update-portfolio/` snapshots LinkedIn, nomads.com and GitHub, diffs them against the JSON,
updates all three languages, then validates, tests and builds. It asks before anything is pushed.
To read LinkedIn, it needs Chrome running with `--remote-debugging-port=9333` and you logged in.

You need Node 20 or newer; CI uses Node 24.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| UI | React 19 + TypeScript | Typed components, SSR-capable |
| Build | Vite 8 | Fast dev server; a client build plus an SSR build used for prerendering |
| Content validation | Zod 4 (**build time only**) | Readable errors; the browser never downloads the validator |
| Routing | ~100-line router (`src/lib/router.tsx`) | The site only needs history navigation and 8 routes, so a full routing library would be dead weight |
| Styling | Plain CSS + design tokens (`src/styles`) | No runtime cost; brand colours and fonts come from `theme.json` |
| Motion | CSS animations, `requestAnimationFrame` and SVG SMIL | Every effect respects `prefers-reduced-motion`, and there is no animation library in the bundle |
| 3D | Canvas 2D projection (hero constellation, journey globe) | Real 3D feel with no WebGL, so there is no fallback path to maintain. Rendering pauses when off-screen |
| Fonts | Bricolage Grotesque, Instrument Serif, JetBrains Mono (self-hosted via Fontsource) | No third-party font requests |
| Tests | Vitest + Testing Library | Covers config parsing, translations, filtering, visibility, routes and rendering |

## Architecture

```text
src/
  content/               ← the CMS: edit these
    site.json              name, email, URL, languages, résumé files, hero stats
    sections.json          enable/disable/reorder homepage + résumé sections, navigation
    theme.json             brand colours and font stacks
    social.json            contact + social links (with enable flags and placements)
    projects.json          every project, case study and Lab experiment (technical metadata)
    experience.json        jobs (companies → roles), skills used, related projects
    education.json         degrees and courses
    skills.json            skill catalog (name, year first used) + display groups
    certifications.json    certifications, courses, exams, awards
    languages.json         spoken languages and levels
    talks.json             talks, workshops, hackathons, community roles
    journey.json           places on the "Beyond the code" globe
    locales/<lang>/        translatable text, keyed by the same ids
      site.json  projects.json  resume.json  talks.json
  i18n/<lang>.json       interface strings (buttons, labels, headings)
  lib/
    schema.ts            Zod schemas = the content model (types are inferred from them)
    validate.ts          cross-file checks: ids, relations, assets, translations
    content.ts           pure selectors (filtering, ordering, fallback, dates)
    routes.ts            URL scheme, localized paths, list of all routes
    router.tsx           tiny client/static router
  app/                   App shell, site context (locale + t()), SEO, theme injection
  layouts/               Header, mobile menu, footer
  pages/                 Home, Work, Project (case study), About, Lab, Talks, Journey, Contact, 404
  features/              hero, projects (plates, index, cards, covers, diagrams), resume, talks, journey, palette
  components/            Links, Icon, Reveal, Media/DeviceFrame, small UI primitives
  styles/                tokens.css (design system) + feature stylesheets
  test/                  Vitest suites
scripts/
  vite-plugin-content.ts validates content and serves it as `virtual:content` (one chunk per language)
  validate-content.ts    `npm run validate`
  prerender.ts           static HTML for every route × language, sitemap, robots, OG images
  optimize-images.ts     `npm run images`
public/                  images, résumé PDFs, favicon (served as-is)
```

### How content flows

1. `scripts/vite-plugin-content.ts` reads every JSON file, validates it against
   `src/lib/schema.ts` and runs the cross-file checks in `src/lib/validate.ts`.
   If anything is wrong, the dev server shows an overlay and the build fails,
   with messages like `[projects.json] project "rickos" references unknown skill "nextjs"`.
2. The parsed content is exposed to the app as `virtual:content` (core data) and
   one chunk per language (`virtual:content-locale/<lang>`), so a page only
   downloads its own language plus English as the fallback.
3. Text lookups use English when a translation is missing. Interface strings
   fall back key by key, and content falls back field by field.

### URLs, languages and SEO

- English is the default and has no prefix: `/`, `/work/`, `/work/<id>/`, `/about/`,
  `/lab/`, `/talks/`, `/journey/`, `/contact/`.
- Portuguese and Spanish are prefixed: `/pt/…`, `/es/…`. The language switcher
  keeps you on the same page, and an explicit choice is remembered in `localStorage`.
- `npm run build` **prerenders every route in every language** to static HTML
  (`dist/<path>/index.html`). Crawlers, link previews and visitors without JavaScript
  get the real content; React hydrates on top. Each page gets:
  - a localized `<title>` and description,
  - a canonical URL and `hreflang` alternates,
  - Open Graph and Twitter tags,
  - JSON-LD (`Person`, plus `SoftwareSourceCode` or `CreativeWork` for projects).
- The build also writes `sitemap.xml` (with hreflang alternates), `robots.txt`, a
  `404.html`, and a 1200×630 Open Graph image per project (`/og/work/<id>.png`).

## Deployment (GitHub Pages)

`.github/workflows/build-and-deploy.yml` runs on every push to `main`:
`npm ci` → `npm test` → `npm run build` → publish `dist/` to the **`gh-pages`**
branch. Pull requests run the same build and tests but don't deploy.

The repository's Pages settings stay as they are (*Deploy from a branch → gh-pages / root*).
This is a user site (`rickrribeiro.github.io`), so the base path is `/`. Every route is
a real `index.html`, so deep links and refreshes work without SPA redirect hacks, and
unknown URLs get the prerendered `404.html`.

To deploy manually, run `npm run build` and push `dist/` to `gh-pages`.

## Design system

The tokens live in `src/styles/tokens.css`. The brand palette and font stacks come
from `src/content/theme.json` and are injected as CSS custom properties. Tokens cover:

- a fluid type scale (`--step--2` … `--step-6`, `--step-hero`),
- fluid spacing (`--space-3xs` … `--space-3xl`),
- radii, hairlines and shadows,
- motion durations and easings (all of them collapse to 0 under reduced motion),
- semantic and status colours,
- z-layers,
- breakpoints, documented in the file header (40/60/80/100rem).

To change the look, edit `theme.json` first. For example, change `colors.accent`
to re-skin every highlight, glow, status dot and diagram.

## Restoring the previous version

The Create React App site from before this redesign is tagged **`legacy-cra-v1`**
(`git checkout legacy-cra-v1`). The redesign was built on the branch
`redesign/architect-of-tomorrow`.
