/// <reference types="vite/client" />
declare const __BUILD_DATE__: string;
declare module 'virtual:content' {
  const content: import('./lib/validate').ParsedContent;
  export default content;
}
declare module 'virtual:content-loaders' {
  const loaders: Record<string, () => Promise<{ default: { text: import('./lib/validate').ParsedContent['locales'][string]; ui: Record<string, string>; countries: Record<string, string> } }>>;
  export default loaders;
}
