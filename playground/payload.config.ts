import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { en } from '@payloadcms/translations/languages/en';
import { de } from '@payloadcms/translations/languages/de';
import { buildConfig } from 'payload';
import { copyResolver, translator } from '@extravirgin/payload-enchants-translator';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: { importMap: { baseDir: dirname } },
  secret: process.env.PAYLOAD_SECRET || randomBytes(32).toString('hex'),
  db: mongooseAdapter({ url: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/translator-playground' }),
  editor: lexicalEditor(),
  collections: [
    { slug: 'users', auth: true, fields: [] },
    {
      slug: 'posts',
      versions: { drafts: true },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'count', type: 'number', localized: true },
        { name: 'enabled', type: 'checkbox', localized: true },
        { name: 'content', type: 'richText', localized: true },
        { name: 'skip', type: 'text', localized: true, custom: { translatorSkip: true } },
      ],
    },
  ],
  globals: [{ slug: 'settings', fields: [{ name: 'title', type: 'text', localized: true }] }],
  localization: { defaultLocale: 'en', locales: ['en', 'de'], fallback: false },
  i18n: { supportedLanguages: { en, de } },
  plugins: [translator({ collections: ['posts'], globals: ['settings'], resolvers: [copyResolver()] })],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
});
