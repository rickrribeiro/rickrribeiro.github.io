# Content guide

All content is JSON. Run `npm run dev` while you edit: the page reloads on save, and
if something is invalid you get a precise error overlay (also `npm run validate`).

**Rules of thumb**

- **Ids** are kebab-case (`my-project`). An id ties the technical data
  (`src/content/*.json`) to its text (`src/content/locales/<lang>/*.json`).
- **Dates** are `"YYYY-MM"` (or `"YYYY-MM-DD"`). Use `null` for an end date that
  means "present".
- **English is the fallback.** Missing Portuguese or Spanish text shows the English
  version, and `npm run validate` lists what is missing.
- **Local files** go in `public/` and are referenced from `/`, for example
  `"/images/projects/x/cover.webp"`. A missing file fails validation.
- To hide something without deleting it, set `"enabled": false`.

---

## Projects

### Add a project

1. Add an entry to `src/content/projects.json` → `items`:

```json
{
  "id": "my-project",
  "enabled": true,
  "featured": false,
  "lab": false,
  "status": "shipped",
  "type": "personal",
  "categories": ["fullstack", "ai"],
  "technologies": ["react", "typescript", "node"],
  "period": { "start": "2026-01", "end": null },
  "source": "public",
  "links": {
    "github": "https://github.com/rickrribeiro/my-project",
    "demo": "https://my-project.app"
  },
  "cover": { "kind": "type" },
  "accent": "#8ED1FF"
}
```

2. Add its text to `src/content/locales/en/projects.json` (`title` and `summary` are required):

```json
"my-project": {
  "title": "My Project",
  "tagline": "One line that makes people click.",
  "summary": "Two sentences for cards and link previews.",
  "role": "Solo — design and development",
  "overview": "…",
  "problem": "…",
  "approach": "…",
  "architecture": "Caption for the diagram",
  "challenges": ["…", "…"],
  "outcomes": ["…"],
  "lessons": ["…"],
  "ending": "Why it ended (for discontinued projects / startups)",
  "note": "Shown as a boxed note, e.g. confidentiality",
  "captions": { "home": "Caption for the gallery item whose caption key is 'home'" }
}
```

3. Optionally add the same keys to `locales/pt/projects.json` and `locales/es/projects.json`.

The case-study page is generated at `/work/my-project/` (and `/pt/…`, `/es/…`).
Sections without text are skipped, so a small project can have a short page.

### Field reference

| Field | Values | Notes |
| --- | --- | --- |
| `status` | `shipped` `in-progress` `experimental` `archived` | Coloured badge |
| `type` | `professional` `consulting` `personal` `startup` `academic` `hackathon` `open-source` | `professional` and `consulting` both appear under the "Professional" filter |
| `categories` | `ai` `fullstack` `backend` `cloud` `games` `mobile` `startup` `experiments` `devtools` `automation` | One or more |
| `technologies` | skill ids from `skills.json` → `catalog` | Add new technologies to the catalog first |
| `source` | `public` `private` `confidential` | Private and confidential projects show a lock note instead of a GitHub button |
| `experience` | an id from `experience.json` | Links the project to the job ("Built at") |
| `talks`, `related` | ids | Talks appear on the case study |
| `links` | `github` `demo` `website` `slides` `docs` `video` (+ `extra: [{ "id", "url" }]`) | An empty or missing link renders no button |
| `accent` | hex colour | Tints the cover, diagram and case-study headings |

### Covers: image, video, diagram or typographic

```json
"cover": { "kind": "image", "src": "/images/projects/x/home.webp", "width": 1800, "height": 1125, "frame": "browser" }
"cover": { "kind": "image", "src": "/images/projects/x/app.webp", "width": 1170, "height": 2532, "frame": "phone" }
"cover": { "kind": "video", "src": "/videos/x.mp4", "poster": "/images/projects/x/poster.webp", "width": 1920, "height": 1080 }
"cover": { "kind": "diagram" }
"cover": { "kind": "type" }
```

- `frame`: `browser`, `phone` or `none`. Real screenshots get a device frame.
- `diagram` renders the project's `diagram` (below) as an animated blueprint. Use it for
  backend or confidential work where there is nothing honest to screenshot.
- `type` is the generative typographic fallback, so a project without media still looks intentional.

### Architecture diagrams

```json
"diagram": {
  "nodes": [
    { "id": "web", "label": "React app", "kind": "client", "x": 10, "y": 30 },
    { "id": "api", "label": "NestJS API", "kind": "service", "x": 45, "y": 30 },
    { "id": "db", "label": "PostgreSQL", "kind": "data", "x": 80, "y": 30 }
  ],
  "edges": [
    { "from": "web", "to": "api" },
    { "from": "api", "to": "db", "label": "SQL" },
    { "from": "api", "to": "web", "dashed": true }
  ]
}
```

- The canvas is 100 × 60. `x` and `y` are each node's centre, and boxes are kept inside the canvas.
- `kind` sets the colour: `client` `service` (project accent) `data` `queue` `ai` `external` (dashed) `infra`.
- Animated "packets" travel along solid edges, and dashed edges show secondary or observability links.
- A project can have a diagram *and* an image cover. The diagram then appears in the case study's Architecture section.

### Gallery

```json
"gallery": [
  { "src": "/images/projects/x/desktop.webp", "kind": "image", "width": 1800, "height": 1125, "frame": "browser", "caption": "desktop" },
  { "src": "/videos/x-demo.mp4", "kind": "video", "poster": "/images/projects/x/poster.webp", "width": 1920, "height": 1080, "caption": "demo" }
]
```

Caption text goes in `locales/<lang>/projects.json` → `my-project.captions.desktop`.

### Feature, reorder or hide a project

| I want to… | Do this |
| --- | --- |
| Feature it on the homepage | `"featured": true, "featuredOrder": 3` (orders must be unique) |
| Change the featured order | Edit the `featuredOrder` numbers |
| Limit how many are featured on the homepage | `sections.json` → `homeLimits.featuredProjects` |
| Order non-featured projects | They sort by most recent `period`. Add `"order": -1` to push one up (lower comes first) |
| Hide it | `"enabled": false`. It disappears from lists, search and the sitemap, and its URL returns the 404 |
| Put it in the Lab | `"lab": true` |
| Promote a Lab experiment | Keep `"lab": true` and add `"featured": true, "featuredOrder": n`. It moves to the featured list and the Work page |
| Mark a failed or ended startup | `"type": "startup"`, `"status": "archived"`, and write the story in `ending` / `lessons` |

---

## Professional experience

`src/content/experience.json`. Entries display in file order (newest first).

```json
{
  "id": "acme",
  "enabled": true,
  "company": "Acme Corp",
  "website": "https://acme.com",
  "logo": null,
  "workplace": "remote",
  "location": "Lisbon, Portugal",
  "roles": [
    { "id": "senior", "employmentType": "full-time", "start": "2027-01", "end": null }
  ],
  "skills": ["node", "aws", "kubernetes"],
  "projects": ["acme-platform"],
  "highlight": true
}
```

- `workplace`: `remote`, `onsite` or `hybrid`.
- `employmentType`: `full-time`, `part-time`, `contract`, `consulting`, `freelance`, `internship` or `volunteer`.
- Several roles at one company go in `roles` (see `cimatec`).
- `skills` lists skill ids. **This is where "used at" on the Skills section comes from**, so you never repeat it.
- `highlight: false` keeps the job on the résumé page but off the homepage list.
- `logo` is optional. Without one, a typographic monogram is shown (on purpose, for consistency).
  To use a logo, add `/images/logos/acme.svg`.

Text goes in `locales/en/resume.json` → `experience`:

```json
"acme": {
  "summary": "One line about the company / product.",
  "roles": {
    "senior": {
      "title": "Senior Software Engineer",
      "description": "Optional paragraph.",
      "achievements": ["Concrete result with a number if you have one.", "…"]
    }
  }
}
```

To update a date, edit `start` or `end` on the role. To mark a job as finished, replace `null` with `"YYYY-MM"`.
`site.json` → `currentRole.experience` chooses the job shown as "Now" in the hero.

## Education

`src/content/education.json`, plus text in `locales/<lang>/resume.json` → `education.<id>`
(`degree`, `field`, `description`, `activities[]`).
`status` is `completed`, `in-progress` or `transferred`. An in-progress degree with an end date shows "(expected)".
Link projects (`projects`) and certifications (`certifications`) by id.

## Skills

`src/content/skills.json`:

- `catalog` lists every technology: `{ "name": "Kubernetes", "since": 2026, "core": true }`.
  - `since` is the year you first used it. It drives the "By year" view.
  - `core` marks a daily driver (accent dot). Keep this list short.
- `groups` defines what the Skills section shows, in order:
  `{ "id": "cloud", "skills": ["aws", "kubernetes"] }`. Group titles are UI strings
  (`i18n/<lang>.json` → `skills.groups.<id>`).
- Reorder skills by reordering the arrays. Remove a skill from a group to hide it
  from the section while keeping it usable as a project or job tag.

There are no percentage bars on purpose. The evidence is the year and the jobs.

## Spoken languages

`src/content/languages.json`: `{ "id": "fr", "enabled": true, "level": "intermediate", "cefr": "B2" }`.
Levels are `native`, `fluent`, `advanced`, `intermediate`, `elementary` and `learning`. Put the language name in
`locales/<lang>/resume.json` → `languages.fr`.
These are **your** languages, not the website's interface languages.

## Certifications, courses, awards

`src/content/certifications.json`: `kind` is `certification`, `course`, `workshop`, `award` or `exam`.
`url` and `credentialId` are optional. `inProgress: true` shows "In progress" instead of a date.

## Talks & community

`src/content/talks.json` (newest first by `date`):

```json
{
  "id": "conf-2027",
  "enabled": true,
  "kind": "talk",
  "date": "2027-05-12",
  "event": "Some Conf 2027",
  "organizer": "Some Org",
  "location": "Berlin, Germany",
  "media": [{ "src": "/images/talks/conf-2027.webp", "width": 1600, "height": 1067 }],
  "links": { "slides": "https://…", "video": "https://…", "event": "https://…" },
  "projects": ["my-project"]
}
```

`kind` is `talk`, `workshop`, `showcase`, `hackathon` or `community`. Text goes in `locales/<lang>/talks.json`
(`title`, `description`, `mediaAlt[]`, with one alt text per media item).

## Beyond the code (journey)

Two sources:

1. **Every trip** comes from your public nomads.com log. Run `npm run sync:nomads`; it regenerates
   `src/content/trips.json`. **Don't edit that file by hand.** The page ranks countries by total time
   spent (future trips are ignored, and an ongoing stay counts up to the build date) and lists each
   city with its dates. It also shows the totals (countries, cities, trips, km, "nomad since") and
   every stop on the globe.
2. **Places with a story** are curated in `src/content/journey.json` → `places`:
   `{ "id": "tokyo-talk", "enabled": true, "kinds": ["spoke"], "city": "Tokyo", "country": "JP", "lat": 35.68, "lon": 139.69, "start": "2027-04", "end": null }`.
   `kinds` can be `home`, `lived`, `studied`, `spoke` or `visited`; the first one is primary. They become
   badges on the place *and* on its country in the ranking (studied and spoke are highlighted).
   Notes go in `locales/<lang>/site.json` → `journey.places.<id>`.

## Homepage, navigation and sections

`src/content/sections.json`:

- `sections`: set any of `featuredProjects`, `intro`, `experience`, `moreProjects`, `skills`,
  `education`, `languages`, `certifications`, `experiments`, `talks`, `journey`, `contact` to
  `false` to remove it. Turning off `experiments`, `talks`, `journey` or `contact` also
  removes that page, its navigation item and its URLs.
- `homeOrder` and `aboutOrder` set the section order on the homepage and the résumé page.
- `navigation` sets the menu items and their order.
- `homeLimits` sets how many items each homepage section shows.

Hero copy, intro paragraphs, contact text and SEO descriptions are in `locales/<lang>/site.json`.
Hero stats are in `site.json` → `stats` (value + optional job id). Their labels are in `locales/<lang>/site.json` → `stats`.

## Contact & social links

`src/content/social.json`. Each link has `enabled` and `placements`
(`hero`, `contact`, `footer`, `journey`). Supported ids are `email`, `linkedin`, `github`, `medium`,
`instagram`, `facebook`, `whatsapp`, `x`, `youtube` and `website`.
The site has no contact form on purpose, because GitHub Pages has no backend and no secrets
belong in frontend code.

## Résumé (PDF)

Put files in `public/resumes/` and map them in `site.json`:

```json
"resume": {
  "en": "/resumes/ricardo-ribeiro-resume-en.pdf",
  "pt": "/resumes/ricardo-ribeiro-curriculo-pt.pdf"
}
```

A language without its own file falls back to English. Use an ATS-friendly PDF
(plain layout, real text, no tables or images for key data).

## Images

1. Drop a `.jpg` or `.png` into `public/images/...`.
2. Run `npm run images`. It writes an optimized `.webp` next to it and prints the
   `width` and `height` to paste into the JSON.
3. Reference the `.webp`, then delete the original.

To replace the portrait, overwrite `public/images/portrait/ricardo-ribeiro.webp` (square, about 800×800)
or point `site.json` → `portrait` at a new file.

## Translations

- Interface strings are in `src/i18n/en.json`, `pt.json` and `es.json` (same keys).
- Content text is in `src/content/locales/<lang>/` (same ids and keys as `en`).
- `npm run validate` warns about every string that falls back to English and
  **fails** on keys that only exist in a translation (usually typos).

### Add a new language (e.g. French)

1. `site.json` → `locales`: add `{ "code": "fr", "label": "Français", "short": "FR", "tag": "fr-FR", "ogLocale": "fr_FR" }`.
2. Create `src/i18n/fr.json` (copy `en.json` and translate).
3. Create `src/content/locales/fr/` with any of `site.json`, `projects.json`, `resume.json`
   and `talks.json` (partial is fine, because missing text falls back to English).

Routes (`/fr/…`), the switcher, hreflang, the sitemap and prerendering pick it up automatically.

## Theme

`src/content/theme.json` holds the colours (`bg`, `bgElevated`, `surface`, `line`, `text`, `muted`,
`accent`, `accentInk`, `signal`) and the font stacks. Everything in `src/styles/tokens.css`
derives from them. If you change fonts, also change the `@import`s at the top of
`src/styles/index.css`.
