# Content audit & migration notes (Nov 2026 redesign)

## Sources used

| Source | What came from it |
| --- | --- |
| Previous site (`legacy-cra-v1`, `src/data/constants.js`) | Bio, social links (incl. Facebook/WhatsApp, now disabled), skills list, 4 jobs, 4 education entries, hero photo (Campus Party 2023 stage photo) |
| Résumé PDF supplied in the repo root (`cv-ricardo-ribeiro-english.docx-2.pdf`) | Wave Group bullet points, **Murilo Vilaverde consulting** (not on LinkedIn), Mindsight/Agile/IPQ/CIMATEC achievements, skills with levels, spoken languages (incl. Japanese) — published as `public/resumes/ricardo-ribeiro-resume-en.pdf` |
| LinkedIn profile (read on 2026-11-07) | Current title and dates (newer than the PDF), About text, certifications with credential IDs/links, education grades, MBA thesis topic, UNIPDS dates, Griffith College, talk posts (NodeBR #63, Campus Party workshop, DevFest Cerrado 2024), profile photo, talk photos |
| GitHub repositories (public + the owner's private ones, read-only) | Project selection, stacks confirmed from manifests, architecture details, commit counts, live demos; screenshots captured from the live SmokeTrack and ClanManager deployments |

Where the PDF and LinkedIn disagreed, **LinkedIn (more recent) won**:

- Wave workflows "50% up to >99%" (PDF) → "more than 70%" (LinkedIn).
- MBA Nov 2023–Jul 2025 (PDF) → Oct 2023–Aug 2025 (LinkedIn).
- Vanderbilt Jan–Mar 2026 (PDF) → Feb–Apr 2026 (LinkedIn).
- UNIPDS Feb–Apr 2026 (PDF) → Jan 2026–Mar 2027, in progress (LinkedIn).
- Company name "Wave Group" (PDF) → "Group Wave Enterprise" (LinkedIn).

## ⚠ Please verify / complete

1. **Résumé PDF is outdated.** It also includes your phone number. Replace
   `public/resumes/ricardo-ribeiro-resume-en.pdf` with an updated, ATS-friendly version.
   You can add `pt` and `es` PDFs in `site.json` → `resume`.
2. **Availability line is off.** LinkedIn "Open to work" is *recruiters-only*, so the site
   doesn't say you are looking. Set `site.json` → `availability.open: true` if you want it shown.
3. **Wave Group website**: `https://groupwave.global` was inferred from your e-mail domain.
4. **ErosAI (MV)** (previously "Murilo Vilaverde" on the PDF résumé): renamed at your request. Employment type is `consulting`.
5. **Skill "since" years** are estimates from the earliest evidence (jobs and repositories).
   Adjust them in `skills.json`.
6. **Talks**:
   - Campus Party 2023: the city and edition are unknown (`location: null`).
     Date taken from the slide timestamp, 26/07/2023.
   - Campus Party 2018 (HoloLens showcase): date from the repo (May 2018); city unknown.
   - Campus Party AR talk (Unity + Vuforia): year assumed **2018** (same period as the AR internship) — confirm year/edition.
   - DevFest Cerrado 2024: the exact day is unknown (month only).
   - Hacking.Rio 2021: no location or placement info.
   - NodeBR #63 slides link: taken from the TinderGPT README. Confirm it's the right deck.
7. **Journey**: only places with evidence are listed (Salvador, Cork, Argentina, São Paulo,
   Goiânia). The city in Argentina is unknown. **Add the countries you've visited**
   (`journey.json`).
8. **Startups**: no reliable story was available, so they are not invented.
   `selltime` is included but `enabled: false`. Fill in `ending`/`lessons` and enable it,
   or add others (Kilig, Ânima, etc.) the same way.
9. **Private projects shown without source links**: Trama de Expedições, República dos
   Bilhões, Punk Records, Travel Buddy Finder, MBA research and the Hacking.Rio prototype.
   Disable any you'd rather not mention.
10. **Woo Nomad Woo as CS capstone** is inferred from the repo (dates and the "changes during the
    presentation" commit).
11. **HSK level** isn't stated anywhere, so Chinese shows as "Elementary".
12. **Portuguese and Spanish copy** was translated from the English source. Give it a quick
    read in your own voice.

## Deliberately not migrated

- Remote hot-linked logos from the old site (several URLs were dead, and mixed logo styles
  clash with the design). Monograms are used instead, and `logo` is supported per entry.
- Old Facebook and WhatsApp links are kept in `social.json` but disabled.
- `qrgenerator` (client work for a third party) and `skills_wave` (employer-internal) are not
  featured.

## 🔐 Security finding (outside this repo)

While reading your private repositories:

- `qrgenerator` has a committed Google OAuth client secret (`client_secret_…json` at the root).
- `punk-records` has a committed `.env`.

Rotate those credentials and purge them from git history.
