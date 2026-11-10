import type { PayloadRequest } from 'payload';
import { describe, expect, it, vi } from 'vitest';
import { translateOperation } from '../src/translate/operation';

const setup = (denyRead = false) => {
  const resolve = vi.fn(({ texts }) => ({ success: true, translatedTexts: texts }));
  const read = vi.fn(async ({ overrideAccess }) => {
    if (denyRead && overrideAccess === false) throw new Error('Read denied');
    return { id: 'example', title: 'Source' };
  });
  const entity = { slug: 'posts', fields: [{ name: 'title', type: 'text', localized: true }] };
  const req = { payload: {
    config: { collections: [entity], globals: [{ ...entity, slug: 'settings' }], custom: { translator: { resolvers: [{ key: 'copy', resolve }] } } },
    findByID: read,
    findGlobal: read,
  } } as unknown as PayloadRequest;
  return { req, read, resolve };
};

describe('source read access', () => {
  it.each([{ collectionSlug: 'posts', id: 'example' }, { globalSlug: 'settings' }])(
    'rejects a denied source before invoking the resolver for %j', async (entity) => {
      const { req, resolve } = setup(true);
      await expect(translateOperation({ ...entity, req, localeFrom: 'en', locale: 'de', resolver: 'copy', data: {}, overrideAccess: false })).rejects.toThrow('Read denied');
      expect(resolve).not.toHaveBeenCalled();
    },
  );

  it.each([false, true, undefined])('preserves explicit/default access mode %s for allowed reads', async (overrideAccess) => {
    const { req, read } = setup();
    const result = await translateOperation({ req, collectionSlug: 'posts', id: 'example', localeFrom: 'en', locale: 'de', resolver: 'copy', data: {}, overrideAccess });
    expect(result).toEqual({ success: true, translatedData: { title: 'Source' } });
    expect(read).toHaveBeenCalledWith(expect.objectContaining({ locale: 'en', overrideAccess, req }));
  });
});
