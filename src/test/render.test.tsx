import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { StaticRouter } from '../lib/router';
import { App } from '../app/App';
import { content, loadAllLocales } from '../app/content';

beforeAll(async () => {
  await loadAllLocales();
  // jsdom lacks these browser APIs used by the canvas/observer components
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  globalThis.ResizeObserver ??= class {
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
});

const at = (url: string) =>
  render(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );

describe('rendering', () => {
  it('renders the homepage with featured projects first', () => {
    at('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(content.site.name);
    const work = document.getElementById('work')!;
    expect(within(work).getByRole('heading', { name: 'Wave Platform' })).toBeInTheDocument();
  });

  it('renders a case study with its outcomes and next-project link', () => {
    at('/work/tindergpt/');
    expect(screen.getByRole('heading', { level: 1, name: 'TinderGPT' })).toBeInTheDocument();
    expect(screen.getByText(/22 GitHub stars/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Source on GitHub/ })).toHaveAttribute('href', 'https://github.com/rickrribeiro/TinderGPT');
  });

  it('does not render buttons for empty project links', () => {
    at('/work/wave-platform/');
    expect(screen.queryByRole('link', { name: /Live demo/ })).toBeNull();
    expect(screen.getByText(/Confidential/)).toBeInTheDocument();
  });

  it('localizes navigation links and keeps the page when switching language', () => {
    at('/pt/work/rickos/');
    const nav = screen.getAllByRole('navigation')[0];
    expect(within(nav).getAllByRole('link').every((a) => a.getAttribute('href')!.startsWith('/pt/'))).toBe(true);
    const es = screen.getAllByRole('link', { name: /Español/ })[0];
    expect(es).toHaveAttribute('href', '/es/work/rickos/');
  });

  it('shows a 404 for unknown and disabled projects', () => {
    at('/work/selltime/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/doesn't exist yet|não existe|no existe/i);
  });

  it('lists each skill with where it was used', () => {
    at('/about/');
    const row = screen.getAllByText('Apache Kafka').map((el) => el.closest('li')).find((li) => li?.classList.contains('skill'));
    expect(row).toHaveTextContent('IPQ Tecnologia');
    expect(row).toHaveTextContent('since 2021');
  });
});
