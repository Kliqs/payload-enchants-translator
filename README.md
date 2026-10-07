# Translator plugin for Payload 3

## Install

```sh
pnpm add @extravirgin/payload-enchants-translator
```

When using the DeepL resolver, also install its optional peer dependency:

```sh
pnpm add deepl-node@^1.27.0
```

Use Payload 3 with localization enabled and at least two content locales. Register the collections and globals listed in the plugin options in your Payload config.

## Video

https://github.com/r1tsuu/payload-plugin-translator/assets/64744993/d39aeba4-bafc-4c3b-838e-9abc5cf1d64a

## Features:

1. A flexible structure with [resolvers](./src/resolvers) that allows you to apply any kind of transformation to your localized data.
2. Can be used not only from the admin panel, but within Local API as well. [Example of the hook](#example-of-the-hook-that-uses-local-operation-to-copy-the-doc-data-to-other-locales) that automatically fills the other locales data on create
3. Includes Copy, DeepL, Google Translate, LibreTranslate, and OpenAI resolvers, with support for custom resolvers.
4. Works with any nested document structure and 2 Rich Text editor adapters - Lexical and Slate.
5. You can omit fields from translation. [Documentation](#omitting-fields)
6. Optional DeepL glossary: synchronize individual entries on save and synchronize the full list manually.
7. English and German admin UI messages, following the current UI language.

## Usage

Enable the resolvers your project needs. The glossary is optional; the following configuration does not register a glossary collection or sync endpoint.

```ts
import { buildConfig } from 'payload';
import { en } from '@payloadcms/translations/languages/en';
import { de } from '@payloadcms/translations/languages/de';
import {
  translator,
  copyResolver,
  googleResolver,
  openAIResolver,
  libreResolver,
} from '@extravirgin/payload-enchants-translator';

export default buildConfig({
  localization: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  i18n: {
    supportedLanguages: { en, de },
  },
  plugins: [
    translator({
      // collections with the enabled translator in the admin UI
      collections: ['posts', 'small-posts'],
      // globals with the enabled translator in the admin UI
      globals: [],
      // add resolvers that you want to include, examples on how to write your own in ./plugin/src/resolvers
      resolvers: [
        copyResolver(),
        googleResolver({
          apiKey: process.env.GOOGLE_API_KEY!,
        }),
        openAIResolver({
          apiKey: process.env.OPENAI_KEY!,
        }),
        libreResolver({
          apiKey: process.env.LIBRE_KEY!,
        }),
      ],
    }),
  ],
});
```

## Resolvers

### DeepL without a glossary

For translation only, omit `glossary` from both `translator()` and `deeplResolver()`, and omit `glossaryId`. Only `DEEPL_API_KEY` is needed; `DEEPL_GLOSSARY_ID` is not required.

```ts
import { deeplResolver, translator } from '@extravirgin/payload-enchants-translator';

export const translatorPlugin = translator({
  collections: ['pages', 'news'],
  globals: ['global-settings'],
  resolvers: [
    deeplResolver({
      apiKey: process.env.DEEPL_API_KEY!,
      targetLocaleMap: { en: 'en-GB' },
    }),
  ],
});
```

Add `translatorPlugin` to your Payload `plugins` array. Normal translation works without registering glossary fields, collections, controls, or sync endpoints.

The DeepL resolver accepts:

```ts
export type DeepLResolverConfig = {
  apiKey: string;
  chunkLength?: number; // Concurrent text batch size; default: 100
  glossary?: GlossaryConfig;
  glossaryId?: string; // Existing DeepL multilingual glossary ID
  sourceLocaleMap?: Record<string, string>;
  targetLocaleMap?: Record<string, string>;
};
```

Locale maps convert CMS locale codes to provider codes. For example, `en: 'en-GB'` selects British English for text translation; glossary language pairs use the base language `en`.

### DeepL with an optional glossary

Configure `DEEPL_API_KEY` and `DEEPL_GLOSSARY_ID` on the server. The glossary ID must identify an existing DeepL multilingual glossary accessible with that API key. The plugin does not create one automatically.

Pass the same glossary configuration to the plugin and resolver:

```ts
import type { Access } from 'payload';
import type { GlossaryConfig } from '@extravirgin/payload-enchants-translator';
import { deeplResolver, translator } from '@extravirgin/payload-enchants-translator';

// Replace this example with your project's admin/editor access policy.
const authenticated: Access = ({ req }) => Boolean(req.user);

const glossary: GlossaryConfig = {
  slug: 'translation-glossary',
  sourceLocale: 'de',
  targetLocales: ['fr', 'it', 'en'],
  access: { read: authenticated, update: authenticated },
  localeLabels: {
    de: { en: 'German (source)', de: 'Deutsch (Quelle)' },
    fr: { en: 'French', de: 'Französisch' },
    it: { en: 'Italian', de: 'Italienisch' },
    en: { en: 'English', de: 'Englisch' },
  },
};

export const translatorPlugin = translator({
  collections: ['pages', 'news'],
  globals: ['global-settings'],
  glossary,
  resolvers: [
    deeplResolver({
      apiKey: process.env.DEEPL_API_KEY!,
      glossary,
      glossaryId: process.env.DEEPL_GLOSSARY_ID!,
      targetLocaleMap: { en: 'en-GB' },
    }),
  ],
});
```

Configure the corresponding content locales in Payload. After adding the plugin or changing its schema, run your project's Payload migration, type-generation, and import-map workflow.

#### Storage and validation

- Entries use a collection named `<slug>-records`, or `translation-glossary-records` with the default slug. There is no glossary global or sync-state collection.
- The source language is required. In the example, German is required and French, Italian, and English are optional.
- Terms are trimmed, must be single-line without tabs, and may contain at most 1,024 UTF-8 bytes.
- Source terms must be unique after trimming, Unicode normalization, and case normalization.
- `access.read` controls reading. `access.update` controls creating, editing, and deleting entries. Synchronization requires both callbacks to return `true`.

#### Saving an entry

Creating or editing an entry sends only that item's populated translations to DeepL. Blank target languages are skipped. Other Payload glossary entries are neither read nor uploaded.

Every save resends the item's populated translations, including unchanged ones. A German-only entry sends no dictionary updates. Saves wait for DeepL; synchronization errors are reported as save failures. There is no background worker, job queue, or automatic synchronization retry.

#### Manual full synchronization

The **Sync all to DeepL** button appears at the top-right of the glossary list. Its tooltip explains when full synchronization is needed.

| Action                                   | On save                                                          | After Sync all                            |
| ---------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------- |
| Add an item or edit a target translation | Merges that item's populated translations                        | Replaces the full configured dictionaries |
| Rename the source term                   | Adds the new term; the old term remains in DeepL                 | Removes the old term                      |
| Clear a target translation               | Skips the empty value; the previous translation remains in DeepL | Removes the previous translation          |
| Delete an item                           | No DeepL request                                                 | Removes the deleted item from DeepL       |

Full synchronization reads all saved entries in pages of 1,000, regardless of the list's current filters or page. It replaces each configured source/target dictionary and removes configured dictionaries that have no remaining entries. Unrelated language pairs in the same DeepL glossary are preserved. The uploaded glossary data is limited to 10 MiB.

The button is disabled while syncing, then displays a success or error notification. Avoid editing entries while full synchronization runs. DeepL updates are not atomic across languages: a failed operation may already have updated some dictionaries. Retry the item save or use Sync all to reconcile DeepL with the saved Payload entries.

The manual action uses `POST <basePath><apiRoute>/translator/glossary/sync`, where the default Payload API route is `/api`.

#### Using the glossary during translation

The resolver attaches the configured glossary when translating from its source locale to a configured target locale and at least one saved entry has a translation for that target. If there are no populated terms for that target, translation proceeds without a glossary. Other language directions also translate without it.

Translating content does not synchronize the glossary. Run Sync all once to upload existing entries, and again after source renames, cleared translations, or deletions. In the admin editor, translated content still needs to be saved; both “Translate all” and “Translate only empty fields” are available.

To omit the glossary feature entirely, remove `glossary` from both configurations and remove `glossaryId`. Setting `disabled: true` alone does not remove an explicitly configured glossary collection.

### Admin UI language

The plugin includes English and German labels, buttons, tooltips, validation messages, and user-facing errors. They follow the current admin UI language, independently of the document's content locale. Enable `en` and `de` under Payload's `i18n.supportedLanguages`, as shown above.

Project translations under `i18n.translations[language]['plugin-translator']` override the plugin defaults. Detailed provider failures are logged on the server; glossary controls display localized error messages.

### OpenAI

#### Config:

```ts
export type OpenAIResolverConfig = {
  apiKey: string; // API key
  baseUrl?: string; // Optional API base URL
  chunkLength?: number; // How many texts to include into 1 request, default: 100
  model?: string; // model, default: 'gpt-3.5-turbo'
  prompt?: OpenAIPrompt; // custom prompt
};
```

### Custom prompt:

```ts
export type OpenAIPrompt = (args: {
  localeFrom: string;
  localeTo: string;
  texts: string[];
}) => string;

// Default
const defaultPrompt: OpenAIPrompt = ({ localeFrom, localeTo, texts }) => {
  return `Translate me the following array: ${JSON.stringify(texts)} in locale=${localeFrom} to locale ${localeTo}, respond me with the same array structure`;
};
```

### Google

#### Config:

```ts
export type GoogleResolverConfig = {
  apiKey: string; // API key
  chunkLength?: number; // How many texts to include into 1 request, default: 100
};
```

### Writing your own

```ts
import { buildConfig } from 'payload';
import { en } from '@payloadcms/translations/languages/en';
import { translator } from '@extravirgin/payload-enchants-translator';
import type { TranslateResolver } from '@extravirgin/payload-enchants-translator/resolvers/types';

const myResolver: TranslateResolver = {
  key: 'my',
  resolve: async (args) => {
    const { localeFrom, localeTo, req, texts } = args;
    // here you can apply any kind of transformation to incoming texts, could be as well API call to a service.
    const transformed = texts.map((each) => `${each} translated to ${localeTo}`);

    return {
      success: true,
      translatedTexts: transformed,
    };
  },
};

export default buildConfig({
  plugins: [
    translator({
      collections: ['posts', 'small-posts'],
      globals: [],
      resolvers: [myResolver],
    }),
  ],
  // apply translations that will be used for your resolver in the admin UI
  i18n: {
    supportedLanguages: { en },
    translations: {
      en: {
        'plugin-translator': {
          resolver_my_buttonLabel: 'Custom translation',
          resolver_my_errorMessage: 'An error occurred when trying to translate the data',
          resolver_my_modalTitle: 'Choose the locale to translate from',
          resolver_my_submitButtonLabelEmpty: 'Translate only empty fields',
          resolver_my_submitButtonLabelFull: 'Translate all',
          resolver_my_successMessage: 'Successfully translated. Press "Save" to apply the changes.',
        },
      },
    },
  },
});
```

## Using the Local API

```ts
import { translateOperation } from '@extravirgin/payload-enchants-translator';

const translateResult = await translateOperation({
  collectionSlug: 'posts', // or globalSlug if globals,
  emptyOnly: false, // optional, should translate all the fields values or only fields that are empty, by default false.
  id: postDefaultLocale.id, // pass the doc id if it's a collection
  locale: 'de', // locale to translate to
  localeFrom: 'en', // locale to translate from
  req, // Prefer the current PayloadRequest to preserve user, UI language, and transaction context
  overrideAccess: false, //
  resolver: 'copy', // pass resolver key
  update: true, // optional, should update immediately or just return the translated result, default false
  // data: destinationFormData, // Optional destination data; the source is read from localeFrom
});
```

For calls without an existing request, `payload` can be passed instead of `req`. When using glossary access rules based on the current user, pass an authenticated `req`.

### Example of the hook that uses local operation to copy the doc data to other locales

```ts
import type { CollectionAfterChangeHook } from 'payload';
import { translateOperation } from '@extravirgin/payload-enchants-translator';

export const copyOtherLocales: CollectionAfterChangeHook = async ({
  collection,
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return;

  const locale = req.locale;

  if (!locale || !req.payload.config.localization) return;

  const otherLocales = req.payload.config.localization.locales.filter(
    (each) => each.code !== locale,
  );

  const { id } = doc;

  for (const { code } of otherLocales) {
    await translateOperation({
      collectionSlug: collection.slug,
      data: doc,
      id,
      locale: code,
      localeFrom: locale,
      req,
      resolver: 'copy',
      update: true,
    });
  }
};
```

### Omitting fields

To omit a specific field for translation, simply add `custom.translatorSkip = true` to the field's config.

```ts
const field = {
  custom: {
    translatorSkip: true,
  },
  localized: true,
  name: 'skip',
  type: 'text',
};
```
