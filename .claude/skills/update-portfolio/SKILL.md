---
name: update-portfolio
description: Periodic refresh of the portfolio from Ricardo's live sources (LinkedIn, nomads.com, GitHub, résumé). Use when the user asks to update/sync/refresh the portfolio or site content ("atualiza o portfólio", "olha o LinkedIn e atualiza o site").
---

# Update the portfolio from its sources

The site's content is JSON in `src/content` + `src/i18n` (see `CONTENT_GUIDE.md`). This routine
collects fresh data, diffs it against that JSON, applies **only verifiable** changes in all three
languages, and verifies the build. Never invent facts; when a source is ambiguous, ask.

## 0. Prepare

- Work on a branch: `git switch -c content/update-$(date +%Y-%m-%d)` (or continue the user's branch).
- Read `docs/CONTENT_AUDIT.md` — open questions from previous runs may now be answerable.

## 1. Snapshot the sources

```bash
npm run sources:snapshot
```

- **nomads.com** → regenerates `src/content/trips.json` automatically (public page, no login).
- **LinkedIn** → needs the user's Chrome running with `--remote-debugging-port=9333` and logged in.
  If the report says *skipped*, ask the user to start it, e.g.
  `open -a "Google Chrome" --args --remote-debugging-port=9333`, then rerun.
  Output: `.cache/sources/linkedin-*.txt`.
- **GitHub** → `.cache/sources/github-repos.json` via `gh`.

## 2. Compare & update (each source → its files)

| Source | Look for | Update |
| --- | --- | --- |
| `linkedin-experience.txt` | new job, title change, end dates, new bullet points | `experience.json` (+ `site.json` → `currentRole`), `locales/*/resume.json` |
| `linkedin-education.txt` | new degree/course, finished in-progress items, grades | `education.json`, `locales/*/resume.json` |
| `linkedin-certifications.txt` / `-courses.txt` / `-honors.txt` | new credentials (keep credential id + URL) | `certifications.json` |
| `linkedin-languages.txt` | level changes | `languages.json` |
| `linkedin-skills.txt` | skills tied to a new job | `skills.json` (catalog + `since`), the job's `skills` |
| `linkedin-posts.txt` / `-profile.txt` | talks, workshops, events, launches, About text | `talks.json` (+ photos), `locales/*/site.json` intro |
| `github-repos.json` | new or recently pushed repos, stars, live demos | candidates for `projects.json` — **propose to the user before adding**; private repos never get a source link |
| `trips.json` diff (`git diff src/content/trips.json`) | new countries/cities; talks/studies abroad | if he spoke/studied somewhere new, add a curated place to `journey.json` with `kinds` |
| Résumé | ask if there's a new PDF | `public/resumes/*`, `site.json` → `resume` |

Rules:
- LinkedIn is usually the most recent source; the PDF résumé may lag. Note conflicts in `docs/CONTENT_AUDIT.md`.
- Every text change goes into `en`, `pt` **and** `es` (natural wording, same facts).
- Images: download into `public/images/...` (only the user's own photos), run `npm run images`, use the printed width/height.
- Keep confidentiality: no client/employer internals beyond what's on the public profile.

## 3. Verify

```bash
npm run validate && npm test && npm run build && npm run preview
```

Spot-check the changed pages in a browser (desktop + ~390px mobile) and the 3 languages.

## 4. Report & ship

- Summarize to the user (in Portuguese): what changed, from which source, and anything that needs their confirmation.
- Update `docs/CONTENT_AUDIT.md` with new open questions / resolved ones.
- Commit on the branch. **Ask before pushing** — merging to `main` deploys the site.
