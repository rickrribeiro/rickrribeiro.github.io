/**
 * Static-site generation for GitHub Pages:
 *  - renders every route × locale to dist/<path>/index.html (real HTML for crawlers,
 *    link previews and no-JS visitors; React hydrates on top),
 *  - writes 404.html, sitemap.xml (with hreflang alternates) and robots.txt,
 *  - generates Open Graph images (1200×630) for the site and every project.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { root } from './load-content-fs';

const dist = path.join(root, 'dist');
const ssrEntry = path.join(root, 'dist-ssr/entry-server.js');
const mod = await import(pathToFileURL(ssrEntry).href);
const { render, allRoutes, content, projectText, siteText, loadAllLocales } = mod;
await loadAllLocales();

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

function page(url: string) {
  const { html, head, locale } = render(url);
  return template
    .replace('<html lang="en" class="no-js">', `<html lang="${locale}" class="no-js">`)
    .replace('<!--app-head-->', head)
    .replace('<div id="root"><!--app-html--></div>', `<div id="root" data-path="${url}">${html}</div>`);
}

function write(file: string, data: string | Buffer) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

// ── HTML ─────────────────────────────────────────────────────────────────
const routes = allRoutes(content) as { url: string; path: string; locale: string; page: string; projectId?: string }[];
for (const r of routes) {
  const out = path.join(dist, r.url, 'index.html');
  write(out, page(r.url));
}
write(path.join(dist, '404.html'), page('/404/'));
console.log(`✔ Prerendered ${routes.length} pages (+404)`);

// ── sitemap + robots ─────────────────────────────────────────────────────
const base = content.site.url.replace(/\/$/, '');
const byPath = new Map<string, typeof routes>();
for (const r of routes) byPath.set(r.path, [...(byPath.get(r.path) ?? []), r]);
const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .map((r) => {
    const alts = (byPath.get(r.path) ?? [])
      .map((a) => {
        const tag = content.site.locales.find((l: { code: string }) => l.code === a.locale)?.tag;
        return `    <xhtml:link rel="alternate" hreflang="${tag}" href="${base}${a.url}"/>`;
      })
      .join('\n');
    const priority = r.page === 'home' ? '1.0' : r.page === 'project' || r.page === 'work' ? '0.8' : '0.6';
    return `  <url>\n    <loc>${base}${r.url}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${r.path}"/>\n  </url>`;
  })
  .join('\n');
write(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
);
write(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
console.log('✔ sitemap.xml, robots.txt');

// ── Open Graph images ────────────────────────────────────────────────────
const { colors } = content.theme;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else line += ' ' + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}
async function og(file: string, kicker: string, title: string, sub: string, accent: string) {
  const titleLines = wrap(title, 22).slice(0, 3);
  const subLines = wrap(sub, 60).slice(0, 2);
  const size = titleLines.length > 2 ? 76 : 92;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="g" cx="85%" cy="0%" r="80%"><stop offset="0" stop-color="${accent}" stop-opacity=".35"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="${colors.bg}"/>
  <rect width="1200" height="630" fill="url(#p)"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <path d="M60 60h28M60 60v28M1140 570h-28M1140 570v-28" stroke="${accent}" stroke-width="2"/>
  <text x="80" y="130" font-family="DejaVu Sans Mono, Menlo, monospace" font-size="22" letter-spacing="3" fill="${colors.muted}">${esc(kicker.toUpperCase())}</text>
  ${titleLines.map((l, i) => `<text x="80" y="${250 + i * (size + 4)}" font-family="Helvetica Neue, Helvetica, Arial, DejaVu Sans, sans-serif" font-weight="700" font-size="${size}" letter-spacing="-3" fill="${colors.text}">${esc(l)}</text>`).join('\n  ')}
  ${subLines.map((l, i) => `<text x="80" y="${270 + titleLines.length * (size + 4) + i * 38}" font-family="Helvetica Neue, Helvetica, Arial, DejaVu Sans, sans-serif" font-size="28" fill="${colors.muted}">${esc(l)}</text>`).join('\n  ')}
  <text x="80" y="560" font-family="DejaVu Sans Mono, Menlo, monospace" font-size="22" font-weight="700" fill="${colors.text}">R<tspan fill="${colors.accent}">/</tspan>R  <tspan fill="${colors.muted}" font-weight="400">${esc(content.site.url.replace(/^https?:\/\//, ''))}</tspan></text>
</svg>`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file);
}

const def = content.site.defaultLocale;
const st = siteText(content, def);
await og(path.join(dist, 'og/default.png'), st.role ?? '', content.site.name, (st.hero?.headline ?? []).join(' ') + ' ' + (st.hero?.headlineAccent ?? ''), colors.accent);
let n = 1;
for (const r of routes.filter((x) => x.page === 'project' && x.locale === def)) {
  const p = content.projects.find((x: { id: string }) => x.id === r.projectId);
  const t = projectText(content, def, r.projectId);
  await og(path.join(dist, `og/work/${r.projectId}.png`), `${content.site.name} · case study`, t.title, t.tagline ?? t.summary ?? '', p?.accent ?? colors.accent);
  n++;
}
console.log(`✔ ${n} Open Graph images`);

fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
