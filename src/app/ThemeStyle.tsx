import { content } from './content';

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** Turns theme.json into CSS custom properties. Rendered on the server too, so there is no flash. */
export function themeCss(): string {
  const { colors, fonts } = content.theme;
  const vars = [
    ...Object.entries(colors).map(([k, v]) => `--color-${kebab(k)}:${v}`),
    ...Object.entries(fonts).map(([k, v]) => `--font-${k}:${v}`),
  ];
  return `:root{${vars.join(';')}}`;
}

export function ThemeStyle() {
  return <style dangerouslySetInnerHTML={{ __html: themeCss() }} />;
}
