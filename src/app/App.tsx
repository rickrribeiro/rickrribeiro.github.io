import { useEffect, useRef } from 'react';
import { Switch, useLocation, useNavigate } from '../lib/router';
import { content } from './content';
import { SiteProvider } from './SiteContext';
import { splitLocale, localizePath } from '../lib/routes';
import { isPageEnabled } from '../lib/content';
import { ThemeStyle } from './ThemeStyle';
import { Layout } from '../layouts/Layout';
import { HomePage } from '../pages/Home';
import { WorkPage } from '../pages/Work';
import { ProjectPage } from '../pages/Project';
import { AboutPage } from '../pages/About';
import { LabPage } from '../pages/Lab';
import { TalksPage } from '../pages/Talks';
import { ContactPage } from '../pages/Contact';
import { NotFoundPage } from '../pages/NotFound';
import { readStoredLocale } from '../hooks/useStoredLocale';

import { JourneyPage } from '../pages/Journey';

const codes = content.site.locales.map((l) => l.code);

function ScrollManager({ pathname, hash }: { pathname: string; hash: string }) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!hash) return;
    }
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
    // Move focus to the new page so screen-reader and keyboard users land on its content.
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, hash]);
  return null;
}

/** On a first visit to an un-prefixed URL, honour a language the visitor explicitly chose before. */
function StoredLocaleRedirect({ locale, path, search, hash }: { locale: string; path: string; search: string; hash: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    const stored = readStoredLocale();
    if (locale === content.site.defaultLocale && stored && stored !== locale && codes.includes(stored)) {
      navigate(localizePath(path, stored, content.site.defaultLocale) + search + hash, { replace: true });
    }
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function App() {
  const location = useLocation();
  const { locale, path } = splitLocale(location.pathname, codes, content.site.defaultLocale);
  const page = (id: Parameters<typeof isPageEnabled>[1], el: React.ReactNode) =>
    isPageEnabled(content, id) ? el : <NotFoundPage />;

  return (
    <SiteProvider locale={locale} path={path}>
      <ThemeStyle />
          <ScrollManager pathname={location.pathname} hash={location.hash} />
          <StoredLocaleRedirect locale={locale} path={path} search={location.search} hash={location.hash} />
          <Layout>
            <Switch
              pathname={path}
              fallback={() => <NotFoundPage />}
              routes={[
                ['/', () => <HomePage />],
                ['/work/', () => <WorkPage />],
                ['/work/:id/', () => <ProjectPage />],
                ['/about/', () => <AboutPage />],
                ['/lab/', () => page('lab', <LabPage />)],
                ['/talks/', () => page('talks', <TalksPage />)],
                ['/journey/', () => page('journey', <JourneyPage />)],
                ['/contact/', () => page('contact', <ContactPage />)],
              ]}
            />
          </Layout>
    </SiteProvider>
  );
}
