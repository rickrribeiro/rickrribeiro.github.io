import { loadRawContent, publicAssetExists } from '../../scripts/load-content-fs';
import { validateContent, type RawContent } from '../lib/validate';

export const raw = () => structuredClone(loadRawContent());

export function parsed() {
  const r = validateContent(raw(), publicAssetExists);
  if (!r.content) throw new Error(r.issues.map((i) => i.message).join('\n'));
  return r.content;
}

/** Applies a mutation to a fresh copy of the real content and validates it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateWith(mutate: (r: any) => void) {
  const r = raw() as RawContent;
  mutate(r);
  return validateContent(r, publicAssetExists);
}

export const errors = (res: ReturnType<typeof validateContent>) => res.issues.filter((i) => i.level === 'error').map((i) => `${i.file}: ${i.message}`);
