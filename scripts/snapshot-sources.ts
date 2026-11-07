/**
 * `npm run sources:snapshot` — collects fresh data from the places the portfolio is built from,
 * into .cache/sources/ (git-ignored), so a review (the `/update-portfolio` Claude Code skill)
 * can diff it against src/content.
 *
 *  - nomads.com   → also regenerates src/content/trips.json (public page, no login)
 *  - LinkedIn     → text of the profile detail pages, read from YOUR logged-in Chrome over the
 *                   DevTools protocol. Start Chrome with:  --remote-debugging-port=9333
 *                   (override with CHROME_CDP=http://127.0.0.1:PORT). Skipped if unavailable.
 *  - GitHub       → repository list + recent activity via the `gh` CLI. Skipped if unavailable.
 *
 * Only reads your own accounts. Nothing is posted anywhere.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root } from './load-content-fs';

const out = path.join(root, '.cache/sources');
fs.mkdirSync(out, { recursive: true });
const cdp = process.env.CHROME_CDP ?? 'http://127.0.0.1:9333';
const linkedinUser = process.env.LINKEDIN_USER ?? 'rickrribeiro';
const githubUser = process.env.GITHUB_USER ?? 'rickrribeiro';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const report: string[] = [];

// ── nomads.com ───────────────────────────────────────────────────────────
try {
  execFileSync('npx', ['tsx', path.join(root, 'scripts/sync-nomads.ts')], { stdio: 'inherit' });
  report.push('nomads: trips.json regenerated');
} catch (e) {
  report.push(`nomads: FAILED (${(e as Error).message.split('\n')[0]})`);
}

// ── LinkedIn via the local Chrome DevTools endpoint ──────────────────────
async function linkedin() {
  const version = await fetch(`${cdp}/json/version`).catch(() => null);
  if (!version?.ok) return report.push(`linkedin: skipped — no Chrome DevTools at ${cdp}`);
  const tab = (await (await fetch(`${cdp}/json/new?about:blank`, { method: 'PUT' })).json()) as { id: string; webSocketDebuggerUrl: string };
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map<number, (v: any) => void>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)!(m);
      pending.delete(m.id);
    }
  };
  const send = (method: string, params: object = {}) =>
    new Promise<any>((r) => {
      const i = ++id;
      pending.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const base = `https://www.linkedin.com/in/${linkedinUser}/`;
  const pages: Record<string, string> = {
    profile: base,
    experience: `${base}details/experience/`,
    education: `${base}details/education/`,
    certifications: `${base}details/certifications/`,
    languages: `${base}details/languages/`,
    skills: `${base}details/skills/`,
    courses: `${base}details/courses/`,
    honors: `${base}details/honors/`,
    projects: `${base}details/projects/`,
    posts: `${base}recent-activity/all/`,
  };
  for (const [name, url] of Object.entries(pages)) {
    await send('Page.navigate', { url });
    await sleep(6000);
    for (let k = 0; k < 6; k++) {
      await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 2000)' });
      await sleep(700);
    }
    const r = await send('Runtime.evaluate', {
      expression: `(document.querySelector('main')||document.body).innerText.replace(/\\n{2,}/g,'\\n')`,
      returnByValue: true,
    });
    fs.writeFileSync(path.join(out, `linkedin-${name}.txt`), r.result?.result?.value ?? '');
  }
  ws.close();
  await fetch(`${cdp}/json/close/${tab.id}`);
  report.push(`linkedin: ${Object.keys(pages).length} pages saved`);
}
await linkedin().catch((e) => report.push(`linkedin: FAILED (${(e as Error).message})`));

// ── GitHub via gh ────────────────────────────────────────────────────────
try {
  const repos = execFileSync(
    'gh',
    ['repo', 'list', githubUser, '--limit', '200', '--json', 'name,description,primaryLanguage,stargazerCount,isFork,isPrivate,pushedAt,createdAt,homepageUrl,url'],
    { encoding: 'utf8' },
  );
  fs.writeFileSync(path.join(out, 'github-repos.json'), repos);
  report.push(`github: ${JSON.parse(repos).length} repositories saved`);
} catch {
  report.push('github: skipped — `gh` not installed or not logged in');
}

fs.writeFileSync(path.join(out, 'snapshot.json'), JSON.stringify({ takenAt: new Date().toISOString(), report }, null, 2));
console.log(`\nSources snapshot → .cache/sources/\n  ${report.join('\n  ')}`);
