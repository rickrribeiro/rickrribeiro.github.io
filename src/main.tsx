import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from './lib/router';
import { splitLocale } from './lib/routes';
import { App } from './app/App';
import { content, ensureLocale } from './app/content';
import './styles/index.css';

const root = document.getElementById('root')!;
const { locale } = splitLocale(window.location.pathname, content.site.locales.map((l) => l.code), content.site.defaultLocale);

// Text for the current language must be present before hydration so markup matches.
ensureLocale(locale).then(() => {
  const app = (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
  // Hydrate only when the prerendered HTML is for this exact path (404.html is served for any URL).
  if (root.hasChildNodes() && root.dataset.path === window.location.pathname) hydrateRoot(root, app);
  else {
    root.textContent = '';
    createRoot(root).render(app);
  }
});
