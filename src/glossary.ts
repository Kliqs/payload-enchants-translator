import type { TFunction } from '@payloadcms/translations';
import type { Access, CollectionConfig } from 'payload';

import { translatorT } from './i18n-translations';

export type GlossaryConfig = {
  access: { read: Access; update: Access };
  label?: NonNullable<CollectionConfig['labels']>['plural'];
  localeLabels?: Record<string, Record<string, string> | string>;
  slug?: string;
  sourceLocale: string;
  targetLocales: string[];
};

export const getGlossarySlug = (config: GlossaryConfig) => config.slug ?? 'translation-glossary';

export const validateGlossaryEntries = (
  value: unknown,
  config: GlossaryConfig,
  t?: TFunction,
): string | true => {
  if (!Array.isArray(value) || !value.length) return translatorT(t, 'glossary_empty');

  const locales = [config.sourceLocale, ...config.targetLocales];

  const sources = new Set<string>();

  for (const entry of value) {
    for (const locale of locales) {
      const term = entry?.[locale];

      if (
        locale !== config.sourceLocale &&
        (term == null || (typeof term === 'string' && !term.trim()))
      ) {
        continue;
      }
      if (typeof term !== 'string' || !term.trim() || /[\t\r\n]/.test(term)) {
        return translatorT(t, 'glossary_invalidTerm', {
          locale: config.sourceLocale.toUpperCase(),
        });
      }
      if (Buffer.byteLength(term.trim(), 'utf8') > 1024) {
        return translatorT(t, 'glossary_termTooLong');
      }
    }

    const source = entry[config.sourceLocale].trim().normalize('NFC').toLowerCase();

    if (sources.has(source)) return translatorT(t, 'glossary_duplicateSource');
    sources.add(source);
  }

  return true;
};

export const validateGlossaryConfig = (config: GlossaryConfig): void => {
  const locales = [config.sourceLocale, ...config.targetLocales];

  if (!config.targetLocales.length || new Set(locales).size !== locales.length) {
    throw new Error('The glossary requires distinct source and target locales.');
  }
  if (
    locales.some(
      (locale) =>
        !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(locale) ||
        [
          '__proto__',
          'constructor',
          'createdAt',
          'id',
          'prototype',
          'sourceKey',
          'updatedAt',
        ].includes(locale),
    )
  ) {
    throw new Error(
      'Use valid Payload field names for glossary locales and map provider language codes in the resolver.',
    );
  }
};
