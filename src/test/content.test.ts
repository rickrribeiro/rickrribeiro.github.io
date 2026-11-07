import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readJson } from '../../scripts/load-content-fs';
import { errors, raw, validateWith } from './helpers';
import { validateContent } from '../lib/validate';

describe('content validation', () => {
  it('accepts the real content with no errors', () => {
    const res = validateContent(raw(), () => true);
    expect(errors(res)).toEqual([]);
    expect(res.content).not.toBeNull();
  });

  it('reports invalid JSON with the file name', () => {
    const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cv-')), 'broken.json');
    fs.writeFileSync(f, '{ "a": 1, }');
    expect(() => readJson(f)).toThrow(/Invalid JSON in .*broken\.json/);
  });

  it('detects duplicate project ids', () => {
    const res = validateWith((r) => r.projects.items.push({ ...r.projects.items[0] }));
    expect(errors(res).join()).toMatch(/Duplicate id "wave-platform"/);
  });

  it('detects missing required fields', () => {
    const res = validateWith((r) => delete r.projects.items[0].status);
    expect(errors(res).join()).toMatch(/projects\.json: items\.0\.status/);
  });

  it('detects broken local asset references', () => {
    const res = validateWith((r) => (r.projects.items.find((p: any) => p.id === 'smoketrack').cover.src = '/images/nope.webp'));
    expect(errors(res).join()).toMatch(/Missing asset "public\/images\/nope\.webp"/);
  });

  it('detects invalid relationships', () => {
    const res = validateWith((r) => {
      r.projects.items[0].experience = 'ghost-company';
      r.projects.items[0].technologies.push('cobol-2099');
      r.experience.items[0].projects.push('no-such-project');
    });
    const e = errors(res).join('\n');
    expect(e).toMatch(/unknown experience "ghost-company"/);
    expect(e).toMatch(/unknown skill .*"cobol-2099"/);
    expect(e).toMatch(/unknown project "no-such-project"/);
  });

  it('detects diagram edges pointing to unknown nodes', () => {
    const res = validateWith((r) => r.projects.items[0].diagram.edges.push({ from: 'web', to: 'mars' }));
    expect(errors(res).join()).toMatch(/edge to unknown node "mars"/);
  });

  it('detects invalid ordering values', () => {
    const res = validateWith((r) => {
      r.projects.items[1].featuredOrder = r.projects.items[0].featuredOrder;
      r.sections.homeOrder.push('intro');
    });
    const e = errors(res).join('\n');
    expect(e).toMatch(/share featuredOrder/);
    expect(e).toMatch(/homeOrder lists "intro" twice/);
  });

  it('requires default-locale text for every enabled project', () => {
    const res = validateWith((r) => delete r.locales.en.projects.rickos.title);
    expect(errors(res).join()).toMatch(/Project "rickos" needs a title/);
  });

  it('flags UI keys that exist only in a translation (typos) and warns about missing ones', () => {
    const res = validateWith((r) => {
      r.ui.pt = { nav: { wrok: 'Trabalho' } };
    });
    expect(errors(res).join()).toMatch(/Unknown UI key "nav\.wrok"/);
    expect(res.issues.some((i) => i.level === 'warning' && /fall back to en/.test(i.message))).toBe(true);
  });

  it('rejects malformed dates and ids', () => {
    const res = validateWith((r) => {
      r.experience.items[0].roles[0].start = 'March 2026';
      r.talks.items[0].id = 'Not Kebab';
    });
    const e = errors(res).join('\n');
    expect(e).toMatch(/YYYY-MM/);
    expect(e).toMatch(/kebab-case/);
  });
});
