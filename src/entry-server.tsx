import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from './lib/router';
import { App } from './app/App';
import { SeoCollector, SeoCollectorContext, headTags, serializeHead } from './app/seo';
import { content, loadAllLocales } from './app/content';
import { splitLocale } from './lib/routes';
import { createT } from './lib/content';
import './styles/index.css';

export { content, loadAllLocales };
export { allRoutes } from './lib/routes';
export { projectText, siteText } from './lib/content';

export function render(url: string) {
  const collector = new SeoCollector();
  const html = renderToString(
    <StrictMode>
      <SeoCollectorContext.Provider value={collector}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </SeoCollectorContext.Provider>
    </StrictMode>,
  );
  const codes = content.site.locales.map((l) => l.code);
  const { locale, path } = splitLocale(url, codes, content.site.defaultLocale);
  const t = createT(content, locale);
  const seo = collector.data ?? { description: t('meta.siteTitle') };
  const head = serializeHead(headTags(content, locale, path, seo, t('meta.siteTitle'), t('meta.titleTemplate')));
  return { html, head, locale };
}
