/** `npm run validate` — fails the build on content errors, prints warnings. */
import { loadRawContent, publicAssetExists } from './load-content-fs';
import { validateContent, formatIssues } from '../src/lib/validate';

let raw;
try {
  raw = loadRawContent();
} catch (e) {
  console.error(`✖ ${(e as Error).message}`);
  process.exit(1);
}
const { issues } = validateContent(raw, publicAssetExists);
const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');
if (warnings.length) console.warn(`\nContent warnings (${warnings.length}):\n${formatIssues(warnings)}\n`);
if (errors.length) {
  console.error(`\nContent errors (${errors.length}):\n${formatIssues(errors)}\n`);
  process.exit(1);
}
console.log(`✔ Content valid${warnings.length ? ` with ${warnings.length} warning(s)` : ''}.`);
