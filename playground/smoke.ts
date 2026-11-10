import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getPayload } from 'payload';
import { translateOperation } from '@extravirgin/payload-enchants-translator';

const database = await MongoMemoryServer.create();
process.env.MONGODB_URI = database.getUri('translator-smoke');
let payload: Awaited<ReturnType<typeof getPayload>> | undefined;
try {
  const { default: config } = await import('./payload.config');
  payload = await getPayload({ config });
  const post = await payload.create({ collection: 'posts', locale: 'en', data: { title: 'Example', skip: 'Excluded' } });
  await payload.update({ collection: 'posts', id: post.id, locale: 'de', data: { title: 'Existing', skip: 'Keep' } });
  const args = { payload, collectionSlug: 'posts', id: post.id, localeFrom: 'en', locale: 'de', resolver: 'copy', update: true };
  await translateOperation({ ...args, emptyOnly: true });
  let translated = await payload.findByID({ collection: 'posts', id: post.id, locale: 'de', fallbackLocale: false });
  assert.equal(translated.title, 'Existing');
  await translateOperation(args);
  translated = await payload.findByID({ collection: 'posts', id: post.id, locale: 'de', fallbackLocale: false });
  assert.equal(translated.title, 'Example');
  assert.equal(translated.skip, 'Keep');
  await payload.updateGlobal({ slug: 'settings', locale: 'en', data: { title: 'Settings example' } });
  await translateOperation({ payload, globalSlug: 'settings', localeFrom: 'en', locale: 'de', resolver: 'copy', update: true });
  const settings = await payload.findGlobal({ slug: 'settings', locale: 'de', fallbackLocale: false });
  assert.equal(settings.title, 'Settings example');
  console.log('Packed plugin: collection, global, empty-only and excluded fields passed.');
} finally {
  await payload?.db.destroy?.();
  await database.stop();
}
