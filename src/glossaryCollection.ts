import { createHash } from 'node:crypto';

import type { CollectionConfig, PayloadRequest } from 'payload';
import { APIError } from 'payload';

import type { GlossaryConfig } from './glossary';
import { getGlossarySlug, validateGlossaryConfig, validateGlossaryEntries } from './glossary';
import { translations, translatorT } from './i18n-translations';

// Keep the collection slug distinct from the legacy global's entries array table.
export const getGlossaryEntriesSlug = (config: GlossaryConfig) =>
  `${getGlossarySlug(config)}-records`;

const sourceKey = (source: string) =>
  createHash('sha256').update(source.trim().normalize('NFC').toLowerCase()).digest('hex');

export const createGlossaryEntriesCollection = (
  config: GlossaryConfig,
  basePath: string,
  sync: (req: PayloadRequest, entry: Record<string, string>) => Promise<void>,
): CollectionConfig => {
  validateGlossaryConfig(config);
  const locales = [config.sourceLocale, ...config.targetLocales];

  return {
    access: {
      create: config.access.update,
      delete: config.access.update,
      read: config.access.read,
      update: config.access.update,
    },
    admin: {
      components: {
        views: {
          list: {
            actions: [
              {
                clientProps: { basePath },
                path: '@extravirgin/payload-enchants-translator/client#GlossaryControls',
              },
            ],
          },
        },
      },
      defaultColumns: locales,
      useAsTitle: config.sourceLocale,
    },
    fields: [
      ...Array.from({ length: Math.ceil(locales.length / 2) }, (_, index) => ({
        fields: locales.slice(index * 2, index * 2 + 2).map((locale) => ({
          admin: { width: '50%' },
          label: config.localeLabels?.[locale] ?? locale.toUpperCase(),
          name: locale,
          required: locale === config.sourceLocale,
          type: 'text' as const,
        })),
        type: 'row' as const,
      })),
      { admin: { hidden: true }, name: 'sourceKey', required: true, type: 'text', unique: true },
    ],
    hooks: {
      afterChange: [
        async ({ doc, req }) => {
          try {
            await sync(req, doc);
          } catch (error) {
            req.payload.logger.error(error);
            throw new APIError(translatorT(req.t, 'glossary_saveError'), 502, undefined, true);
          }

          return doc;
        },
      ],
      beforeValidate: [
        ({ data, originalDoc, req }) => {
          const entry = { ...originalDoc, ...data };

          const validation = validateGlossaryEntries([entry], config, req.t);

          if (validation !== true) throw new APIError(validation, 400, undefined, true);

          return {
            ...data,
            ...Object.fromEntries(locales.map((locale) => [locale, entry[locale]?.trim() ?? ''])),
            sourceKey: sourceKey(entry[config.sourceLocale]),
          };
        },
      ],
    },
    labels: {
      plural: config.label ?? {
        de: translations.de['plugin-translator'].glossary_plural,
        en: translations.en['plugin-translator'].glossary_plural,
      },
      singular: {
        de: translations.de['plugin-translator'].glossary_singular,
        en: translations.en['plugin-translator'].glossary_singular,
      },
    },
    slug: getGlossaryEntriesSlug(config),
    versions: { maxPerDoc: 10 },
  };
};
