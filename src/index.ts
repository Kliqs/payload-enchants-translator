import type { CollectionSlug, Config, GlobalSlug, PayloadRequest, Plugin } from 'payload';
import { APIError } from 'payload';
import { deepMerge } from 'payload/shared';

import { CustomButton } from './client/components/CustomButton';
import { createGlossaryEntriesCollection } from './glossaryCollection';
import { translations, translatorT } from './i18n-translations';
import { translateEndpoint } from './translate/endpoint';
import { translateOperation } from './translate/operation';
import type { TranslatorConfig } from './types';

export type { GlossaryConfig } from './glossary';

export { copyResolver } from './resolvers/copy';

export type { DeepLResolverConfig } from './resolvers/deepl';

export { deeplResolver } from './resolvers/deepl';

export { googleResolver } from './resolvers/google';

export { libreResolver } from './resolvers/libreTranslate';

export { openAIResolver } from './resolvers/openAI';
export * from './resolvers/types';

export { translateOperation };

export const translator: (pluginConfig: TranslatorConfig) => Plugin = (pluginConfig) => {
  return (config) => {
    config = {
      ...config,
      i18n: {
        ...config.i18n,
        translations: deepMerge(translations, config.i18n?.translations ?? {}),
      },
    };
    // Keep the opt-in glossary schema available even when translation is disabled.
    if (pluginConfig.glossary) {
      const sync = async (req: PayloadRequest, entry?: Record<string, string>) => {
        const resolver = pluginConfig.resolvers.find((item) => item.key === 'deepl');

        if (!resolver?.glossary)
          throw new APIError(translatorT(req.t, 'glossary_missingResolver'), 400, undefined, true);
        await resolver.glossary.sync(req, entry);
      };

      const entries = createGlossaryEntriesCollection(
        pluginConfig.glossary,
        pluginConfig.basePath ?? '',
        sync,
      );

      if (config.collections?.some((collection) => collection.slug === entries.slug)) {
        throw new Error(`A collection with the glossary slug "${entries.slug}" already exists.`);
      }
      config = {
        ...config,
        collections: [...(config.collections ?? []), entries],
        endpoints: [
          ...(config.endpoints ?? []),
          {
            handler: async (req: PayloadRequest) => {
              try {
                await sync(req);

                return Response.json({ success: true });
              } catch (error) {
                req.payload.logger.error(error);

                return Response.json(
                  {
                    error:
                      error instanceof APIError && error.isPublic
                        ? error.message
                        : translatorT(req.t, 'glossary_syncError'),
                  },
                  { status: 400 },
                );
              }
            },
            method: 'post',
            path: '/translator/glossary/sync',
          },
        ],
      };
    }
    if (pluginConfig.disabled || !config.localization || config.localization.locales.length < 2)
      return config;

    const updatedConfig: Config = {
      ...config,
      admin: {
        ...(config.admin ?? {}),
        custom: {
          ...(config.admin?.custom ?? {}),
          translator: {
            basePath: pluginConfig.basePath ?? '',
            resolvers: pluginConfig.resolvers.map(({ key }) => ({ key })),
          },
        },
      },
      collections:
        config.collections?.map((collection) => {
          if (!pluginConfig.collections.includes(collection.slug as CollectionSlug))
            return collection;

          return {
            ...collection,
            admin: {
              ...(collection.admin ?? {}),
              components: {
                ...(collection.admin?.components ?? {}),
                edit: {
                  ...(collection.admin?.components?.edit ?? {}),
                  PublishButton: CustomButton('publish', pluginConfig.disabledLocales ?? []),
                  SaveButton: CustomButton('save', pluginConfig.disabledLocales ?? []),
                },
              },
            },
          };
        }) ?? [],
      custom: {
        ...(config.custom ?? {}),
        translator: {
          basePath: pluginConfig.basePath ?? '',
          resolvers: pluginConfig.resolvers,
        },
      },
      endpoints: [
        ...(config.endpoints ?? []),
        {
          handler: translateEndpoint,
          method: 'post',
          path: '/translator/translate',
        },
      ],
      globals:
        config.globals?.map((global) => {
          if (!pluginConfig.globals.includes(global.slug as GlobalSlug)) return global;

          return {
            ...global,
            admin: {
              ...(global.admin ?? {}),
              components: {
                ...(global.admin?.components ?? {}),
                elements: {
                  ...(global.admin?.components?.elements ?? {}),
                  PublishButton: CustomButton('publish', pluginConfig.disabledLocales ?? []),
                  SaveButton: CustomButton('save', pluginConfig.disabledLocales ?? []),
                },
              },
            },
          };
        }) ?? [],
    };

    return updatedConfig;
  };
};
