import type { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';

import type { GlossaryConfig } from '../glossary';
import { chunkArray } from '../utils/chunkArray';
import type { TranslateResolver } from './types';

export type DeepLResolverConfig = {
  apiKey: string;
  chunkLength?: number;
  glossary?: GlossaryConfig;
  glossaryId?: string;
  sourceLocaleMap?: Record<string, string>;
  targetLocaleMap?: Record<string, string>;
};

const hasSpecialUnicodeCharacters = (text: string) => /[\u0300-\u036f\u0336]/.test(text);

export const deeplResolver = ({
  apiKey,
  chunkLength = 100,
  glossary,
  glossaryId: configuredGlossaryId,
  sourceLocaleMap = {},
  targetLocaleMap = {},
}: DeepLResolverConfig): TranslateResolver => {
  if (!Number.isInteger(chunkLength) || chunkLength < 1) {
    throw new Error('DeepL chunkLength must be a positive integer.');
  }

  const glossaryId = configuredGlossaryId?.trim() || undefined;

  if (glossaryId && !glossary) {
    throw new Error('DeepL glossary options require glossary configuration.');
  }

  return {
    ...(glossary
      ? {
          glossary: {
            sync: async (req, entry) => {
              const { DeepLClient } = await import('deepl-node');

              const { syncDeepLGlossary } = await import('./deeplGlossary');

              return syncDeepLGlossary({
                client: new DeepLClient(apiKey, { maxRetries: 0, minTimeout: 60000 }),
                entry,
                glossary,
                glossaryId,
                req,
                sourceLocaleMap,
                targetLocaleMap,
              });
            },
          },
        }
      : {}),
    key: 'deepl',
    resolve: async ({ localeFrom, localeTo, req, texts }) => {
      if (!texts.some((text) => text.trim())) {
        return { success: true, translatedTexts: texts.map(() => '') };
      }

      // Optional peer dependency: other resolvers do not load the DeepL SDK.
      const { DeepLClient } = await import('deepl-node');

      const client = new DeepLClient(apiKey);

      const sourceLang = (sourceLocaleMap[localeFrom] ?? localeFrom) as SourceLanguageCode;

      const targetLang = (targetLocaleMap[localeTo] ?? localeTo) as TargetLanguageCode;

      let translationGlossaryId: string | undefined;

      if (
        glossary &&
        localeFrom === glossary.sourceLocale &&
        glossary.targetLocales.includes(localeTo)
      ) {
        const { getDeepLGlossaryId } = await import('./deeplGlossary');

        translationGlossaryId = await getDeepLGlossaryId({
          glossary,
          glossaryId,
          req,
          sourceLocaleMap,
          targetLocale: localeTo,
          targetLocaleMap,
        });
      }

      const translatedTexts: string[] = [];

      for (const batch of chunkArray(texts, chunkLength)) {
        const context = batch.filter((text) => !hasSpecialUnicodeCharacters(text)).join(' ');

        // Settle the batch before returning a result or propagating an error.
        const results = await Promise.allSettled(
          batch.map((text) =>
            text.trim()
              ? client.translateText(text, sourceLang, targetLang, {
                  context,
                  glossary: translationGlossaryId,
                  modelType: hasSpecialUnicodeCharacters(text)
                    ? 'latency_optimized'
                    : 'prefer_quality_optimized',
                  tagHandling: 'html',
                })
              : Promise.resolve({ text: '' }),
          ),
        );

        for (const result of results) {
          if (result.status === 'rejected') throw result.reason;
          translatedTexts.push(result.value.text);
        }
      }

      return { success: true, translatedTexts };
    },
  };
};
