import type { DeepLClient } from 'deepl-node';
import { GlossaryEntries } from 'deepl-node';
import type { CollectionSlug, PayloadRequest } from 'payload';
import { APIError } from 'payload';

import type { GlossaryConfig } from '../glossary';
import { validateGlossaryEntries } from '../glossary';
import { getGlossaryEntriesSlug } from '../glossaryCollection';
import { translatorT } from '../i18n-translations';

type Options = {
  glossary: GlossaryConfig;
  glossaryId?: string;
  req: PayloadRequest;
  sourceLocaleMap?: Record<string, string>;
  targetLocaleMap?: Record<string, string>;
};

const language = (locale: string) => locale.toLowerCase().split('-')[0];

const requireAccess = async ({ glossary, req }: Options, write = false) => {
  if (
    (await glossary.access.read({ req })) !== true ||
    (write && (await glossary.access.update({ req })) !== true)
  ) {
    throw new APIError(translatorT(req.t, 'glossary_accessDenied'), 403, undefined, true);
  }
};

// An omitted target translation does not require a DeepL dictionary.
export const getDeepLGlossaryId = async (options: { targetLocale: string } & Options) => {
  await requireAccess(options);
  const { glossary, glossaryId, req, targetLocale } = options;

  const result = await req.payload.find({
    collection: getGlossaryEntriesSlug(glossary) as CollectionSlug,
    depth: 0,
    limit: 1,
    overrideAccess: false,
    req,
    select: { [targetLocale]: true },
    where: {
      and: [{ [targetLocale]: { exists: true } }, { [targetLocale]: { not_equals: '' } }],
    },
  });

  if (!result.docs.length) return undefined;
  if (!glossaryId)
    throw new APIError(translatorT(req.t, 'glossary_missingID'), 400, undefined, true);

  return glossaryId;
};

// Entry saves merge one item. Only the manual action reads and replaces full dictionaries.
export const syncDeepLGlossary = async (
  options: { client: DeepLClient; entry?: Record<string, string> } & Options,
): Promise<void> => {
  await requireAccess(options, true);
  const { client, entry, glossary, glossaryId, req } = options;

  if (!glossaryId)
    throw new APIError(translatorT(req.t, 'glossary_missingID'), 400, undefined, true);

  const sourceLangCode = language(
    options.sourceLocaleMap?.[glossary.sourceLocale] ?? glossary.sourceLocale,
  );

  const dictionaries = glossary.targetLocales.map((locale) => ({
    entries: new GlossaryEntries(),
    locale,
    sourceLangCode,
    targetLangCode: language(options.targetLocaleMap?.[locale] ?? locale),
  }));

  if (new Set(dictionaries.map((item) => item.targetLangCode)).size !== dictionaries.length) {
    throw new APIError(translatorT(req.t, 'glossary_distinctLanguages'), 400, undefined, true);
  }
  let bytes = 0;

  const add = (doc: Record<string, string>) => {
    const validation = validateGlossaryEntries([doc], glossary, req.t);

    if (validation !== true) throw new APIError(validation, 400, undefined, true);
    const source = doc[glossary.sourceLocale].trim();

    for (const dictionary of dictionaries) {
      const target = doc[dictionary.locale]?.trim();

      if (!target) continue;
      bytes += Buffer.byteLength(`${source}\t${target}\n`, 'utf8');
      if (bytes > 10 * 1024 * 1024)
        throw new APIError(translatorT(req.t, 'glossary_tooLarge'), 400, undefined, true);
      dictionary.entries.add(source, target);
    }
  };

  if (entry) {
    add(entry);
    for (const dictionary of dictionaries) {
      if (Object.keys(dictionary.entries.entries()).length) {
        await client.updateMultilingualGlossaryDictionary(glossaryId, dictionary);
      }
    }

    return;
  }

  for (let page = 1; ; page++) {
    const result = await req.payload.find({
      collection: getGlossaryEntriesSlug(glossary) as CollectionSlug,
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      page,
      req,
      select: Object.fromEntries(
        [glossary.sourceLocale, ...glossary.targetLocales].map((locale) => [locale, true]),
      ),
      sort: 'sourceKey',
    });

    for (const doc of result.docs) add(doc as unknown as Record<string, string>);
    if (!result.hasNextPage) break;
  }

  const remote = await client.getMultilingualGlossary(glossaryId);

  for (const dictionary of dictionaries) {
    if (Object.keys(dictionary.entries.entries()).length) {
      await client.replaceMultilingualGlossaryDictionary(glossaryId, dictionary);
    } else if (
      remote.dictionaries.some(
        (item) =>
          language(item.sourceLangCode) === sourceLangCode &&
          language(item.targetLangCode) === dictionary.targetLangCode,
      )
    ) {
      await client.deleteMultilingualGlossaryDictionary(
        glossaryId,
        sourceLangCode,
        dictionary.targetLangCode,
      );
    }
  }
};
