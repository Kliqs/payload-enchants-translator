import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createLocalReq, getPayload } from 'payload';
import { translateOperation } from '@extravirgin/payload-enchants-translator';

const database = await MongoMemoryServer.create();
process.env.MONGODB_URI = database.getUri('translator-smoke');
const richText = (text: string) => ({ root: {
  type: 'root', version: 1, format: '' as const, indent: 0, direction: null,
  children: [{ type: 'paragraph', version: 1, format: '', indent: 0, direction: null, textFormat: 0, textStyle: '',
    children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] }],
} });
let payload: Awaited<ReturnType<typeof getPayload>> | undefined;
try {
  const { default: config } = await import('./payload.config');
  payload = await getPayload({ config });
  const post = await payload.create({ collection: 'posts', locale: 'en', data: { title: 'Example', skip: 'Excluded', count: 42, enabled: true, content: richText('Translate body'), skippedContent: richText('Excluded body') } });
  await payload.update({ collection: 'posts', id: post.id, locale: 'de', data: { title: 'Existing', skip: 'Keep', count: 0, enabled: false, skippedContent: richText('Keep body') } });
  const originalDestination = await payload.findByID({ collection: 'posts', id: post.id, locale: 'de', fallbackLocale: false });
  const args = { payload, collectionSlug: 'posts', id: post.id, localeFrom: 'en', locale: 'de', resolver: 'copy', update: true };
  await translateOperation({ ...args, emptyOnly: true });
  let translated = await payload.findByID({ collection: 'posts', id: post.id, locale: 'de', fallbackLocale: false });
  assert.equal(translated.title, 'Existing');
  assert.equal(translated.count, 0);
  assert.equal(translated.enabled, false);
  await translateOperation(args);
  translated = await payload.findByID({ collection: 'posts', id: post.id, locale: 'de', fallbackLocale: false });
  assert.equal(translated.title, 'Example');
  assert.equal(translated.count, 42);
  assert.equal(translated.enabled, true);
  assert.equal(translated.skip, 'Keep');
  assert.deepEqual(translated.skippedContent, originalDestination.skippedContent);
  assert.deepEqual(translated.content, post.content);
  await payload.updateGlobal({ slug: 'settings', locale: 'en', data: { title: 'Settings example' } });
  await translateOperation({ payload, globalSlug: 'settings', localeFrom: 'en', locale: 'de', resolver: 'copy', update: true });
  const settings = await payload.findGlobal({ slug: 'settings', locale: 'de', fallbackLocale: false });
  assert.equal(settings.title, 'Settings example');
  const req = await createLocalReq({ locale: 'de' }, payload);
  const restrictedArgs = { req, collectionSlug: 'posts', id: post.id, localeFrom: 'en', locale: 'de', resolver: 'copy', data: {}, overrideAccess: false };
  const postsConfig = payload.collections.posts.config;
  const originalRead = postsConfig.access.read;
  postsConfig.access.read = () => false;
  try {
    await assert.rejects(() => translateOperation(restrictedArgs));
    await assert.rejects(() => translateOperation({ ...restrictedArgs, data: undefined }));
    req.json = async () => ({ collectionSlug: 'posts', id: post.id, localeFrom: 'en', locale: 'de', resolver: 'copy', data: {} });
    const endpoint = payload.config.endpoints.find((item) => item.path === '/translator/translate');
    assert.ok(endpoint);
    await assert.rejects(async () => endpoint.handler(req));
    const privileged = await translateOperation({ ...restrictedArgs, overrideAccess: true });
    assert.ok(privileged.success);
    assert.equal(privileged.translatedData.title, 'Example');
  } finally {
    postsConfig.access.read = originalRead;
  }
  const titleField = postsConfig.fields.find((field) => 'name' in field && field.name === 'title');
  assert.ok(titleField && 'access' in titleField);
  const originalFieldAccess = titleField.access;
  postsConfig.access.read = () => true;
  const allowed = await translateOperation(restrictedArgs);
  assert.ok(allowed.success);
  assert.equal(allowed.translatedData.title, 'Example');
  titleField.access = { ...originalFieldAccess, read: () => false };
  try {
    const restrictedField = await translateOperation({ ...restrictedArgs, data: {} });
    assert.ok(restrictedField.success);
    assert.equal(restrictedField.translatedData.title, undefined);
  } finally {
    titleField.access = originalFieldAccess;
    postsConfig.access.read = originalRead;
  }
  const settingsConfig = payload.config.globals.find((global) => global.slug === 'settings');
  assert.ok(settingsConfig);
  const originalGlobalRead = settingsConfig.access.read;
  settingsConfig.access.read = () => false;
  try {
    await assert.rejects(() => translateOperation({ req, globalSlug: 'settings', localeFrom: 'en', locale: 'de', resolver: 'copy', data: {}, overrideAccess: false }));
  } finally {
    settingsConfig.access.read = originalGlobalRead;
  }
  console.log('Access controls passed: collection, global, field, endpoint and explicit privileged calls.');
  console.log('Packed plugin: collection, global, empty-only and excluded fields passed.');
} finally {
  await payload?.db.destroy?.();
  await database.stop();
}
