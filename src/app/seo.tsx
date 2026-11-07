/**
 * Page metadata. Pages render <Seo …/>; during prerender the data is collected
 * into a context and serialized into <head>; in the browser the same tag list
 * is applied to document.head after navigation.
 */
import { createContext, useContext, useEffect } from 'react';
import type { ParsedContent } from '../lib/validate';
import { localizePath } from '../lib/routes';
import { useSite } from './SiteContext';

export interface SeoData {
  /** Page title without the site suffix. Omit on the homepage. */
  title?: string;
  description: string;
  /** Absolute or root-relative image (1200×630). */
  image?: string;
  type?: 'website' | 'article' | 'profile';
  jsonLd?: Record<string, unknown>[];
  noindex?: boolean;
}

export interface HeadTag {
  tag: 'title' | 'meta' | 'link' | 'script';
  attrs: Record<string, string>;
  text?: string;
}

export class SeoCollector {
  data: SeoData | null = null;
}

export const SeoCollectorContext = createContext<SeoCollector | null>(null);

const abs = (base: string, p: string) => (/^https?:/.test(p) ? p : `${base.replace(/\/$/, '')}${p}`);

export function headTags(content: ParsedContent, locale: string, path: string, seo: SeoData, siteTitle: string, titleTemplate: string): HeadTag[] {
  const { site } = content;
  const title = seo.title ? titleTemplate.replace('{title}', seo.title) : siteTitle;
  const url = abs(site.url, localizePath(path, locale, site.defaultLocale));
  const image = abs(site.url, seo.image ?? '/og/default.png');
  const og = site.locales.find((l) => l.code === locale)?.ogLocale ?? 'en_US';
  const tags: HeadTag[] = [
    { tag: 'title', attrs: {}, text: title },
    { tag: 'meta', attrs: { name: 'description', content: seo.description } },
    { tag: 'link', attrs: { rel: 'canonical', href: url } },
    { tag: 'meta', attrs: { property: 'og:type', content: seo.type ?? 'website' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: site.name } },
    { tag: 'meta', attrs: { property: 'og:title', content: title } },
    { tag: 'meta', attrs: { property: 'og:description', content: seo.description } },
    { tag: 'meta', attrs: { property: 'og:url', content: url } },
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
    { tag: 'meta', attrs: { property: 'og:locale', content: og } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: seo.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
  ];
  for (const l of site.locales) {
    if (l.code !== locale) tags.push({ tag: 'meta', attrs: { property: 'og:locale:alternate', content: l.ogLocale } });
    tags.push({ tag: 'link', attrs: { rel: 'alternate', hreflang: l.tag, href: abs(site.url, localizePath(path, l.code, site.defaultLocale)) } });
  }
  tags.push({ tag: 'link', attrs: { rel: 'alternate', hreflang: 'x-default', href: abs(site.url, localizePath(path, site.defaultLocale, site.defaultLocale)) } });
  if (seo.noindex) tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } });
  for (const ld of seo.jsonLd ?? []) {
    tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, text: JSON.stringify(ld).replace(/</g, '\\u003c') });
  }
  return tags;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function serializeHead(tags: HeadTag[]): string {
  return tags
    .map(({ tag, attrs, text }) => {
      const a = Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${esc(v)}"`)
        .join('');
      if (tag === 'title') return `<title>${esc(text ?? '')}</title>`;
      if (tag === 'script') return `<script${a} data-seo>${text ?? ''}</script>`;
      return `<${tag}${a} data-seo>`;
    })
    .join('\n    ');
}

function applyHead(tags: HeadTag[]) {
  document.head.querySelectorAll('[data-seo]').forEach((n) => n.remove());
  for (const { tag, attrs, text } of tags) {
    if (tag === 'title') {
      document.title = text ?? '';
      continue;
    }
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.setAttribute('data-seo', '');
    if (text) el.textContent = text;
    document.head.appendChild(el);
  }
}

export function Seo(props: SeoData) {
  const { content, locale, path, t } = useSite();
  const collector = useContext(SeoCollectorContext);
  if (collector) collector.data = props; // server: collected synchronously during render

  const key = JSON.stringify(props);
  useEffect(() => {
    applyHead(headTags(content, locale, path, props, t('meta.siteTitle'), t('meta.titleTemplate')));
    document.documentElement.lang = locale;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, locale, path]);
  return null;
}

// ── structured data helpers ──────────────────────────────────────────────
export function personJsonLd(content: ParsedContent, role: string): Record<string, unknown> {
  const { site, social } = content;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    image: abs(site.url, site.portrait),
    jobTitle: role,
    email: `mailto:${site.email}`,
    sameAs: social.links.filter((l) => l.enabled && /^https?:/.test(l.url)).map((l) => l.url),
    alumniOf: content.education.filter((e) => e.enabled).map((e) => ({ '@type': 'EducationalOrganization', name: e.institution })),
    knowsLanguage: content.languages.filter((l) => l.enabled).map((l) => l.id),
  };
}
