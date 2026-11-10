import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { generateImportMap, type Config, type SanitizedConfig } from 'payload';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { translator } from '../src';

const buttonPath = '@extravirgin/payload-enchants-translator/client#CustomButtonWithTranslator';
const existingPath = 'existing-admin-component#Existing';
let root: string;

const config = (): Config => ({
  admin: {
    dependencies: { existing: { path: existingPath, type: 'component' } },
    importMap: { baseDir: root },
  },
  collections: [{ slug: 'posts', fields: [] }],
  globals: [{ slug: 'settings', fields: [] }],
  localization: { defaultLocale: 'en', locales: ['en', 'de'] },
  routes: { admin: '/admin' },
});

const generate = async (value: Config) => {
  await generateImportMap(value as SanitizedConfig, { force: true, log: false });
  return readFile(path.join(root, 'src/app/(payload)/admin/importMap.js'), 'utf8');
};

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'translator-import-map-'));
  await mkdir(path.join(root, 'src/app/(payload)/admin'), { recursive: true });
  vi.stubEnv('ROOT_DIR', root);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(root, { recursive: true, force: true });
});

describe('import-map generation while the plugin is installed', () => {
  it.each(['disabled', 'no localization', 'one locale', 'no selected entities'])(
    'retains the component with %s while leaving entity buttons unchanged',
    async (reason) => {
      const base = config();
      if (reason === 'no localization') base.localization = false;
      if (reason === 'one locale') base.localization = { defaultLocale: 'en', locales: ['en'] };
      const result = await translator({
        collections: reason === 'no selected entities' ? [] : ['posts'],
        globals: reason === 'no selected entities' ? [] : ['settings'],
        disabled: reason === 'disabled',
        resolvers: [],
      })(base);

      const output = await generate(result);
      expect(output).toContain(`"${buttonPath}":`);
      expect(output).toContain(`"${existingPath}":`);
      expect(result.collections?.[0].admin?.components?.edit?.SaveButton).toBeUndefined();
      expect(result.globals?.[0].admin?.components?.elements?.SaveButton).toBeUndefined();
      if (reason !== 'no selected entities') {
        expect(result.endpoints?.some((endpoint) => endpoint.path === '/translator/translate')).not.toBe(true);
      }
    },
  );

  it('keeps a single entry when enabled buttons also reference the component', async () => {
    const result = await translator({ collections: ['posts'], globals: ['settings'], resolvers: [] })(config());
    const output = await generate(result);
    expect(output.split(`"${buttonPath}":`)).toHaveLength(2);
    expect(result.collections?.[0].admin?.components?.edit?.SaveButton).toBeDefined();
    expect(result.globals?.[0].admin?.components?.elements?.SaveButton).toBeDefined();
  });

  it('removes the entry on regeneration after the plugin is removed', async () => {
    const disabled = await translator({ collections: ['posts'], globals: [], disabled: true, resolvers: [] })(config());
    expect(await generate(disabled)).toContain(buttonPath);
    const output = await generate(config());
    expect(output).not.toContain(buttonPath);
    expect(output).toContain(`"${existingPath}":`);
  });
});
