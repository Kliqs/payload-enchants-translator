import { describe, expect, it } from 'vitest';
import { validateGlossaryEntries, type GlossaryConfig } from '../src/glossary';
import { traverseFields } from '../src/translate/traverseFields';
import type { ValueToTranslate } from '../src/translate/types';

const glossary: GlossaryConfig = {
  access: { read: () => true, update: () => true },
  sourceLocale: 'en',
  targetLocales: ['de'],
};

describe('standalone translator regression checks', () => {
  it('accepts glossary entries and rejects duplicate source terms', () => {
    expect(validateGlossaryEntries([{ en: 'Apple', de: 'Apfel' }], glossary)).toBe(true);
    expect(validateGlossaryEntries([{ en: 'Apple', de: '' }], glossary)).toBe(true);
    expect(validateGlossaryEntries([{ en: 'Apple' }, { en: ' apple ' }], glossary)).not.toBe(true);
  });

  it('preserves populated and excluded fields when translating only empty fields', () => {
    const destination = { title: 'Existing', description: '', skip: 'Keep' };
    const values: ValueToTranslate[] = [];
    traverseFields({
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'text', localized: true },
        { name: 'skip', type: 'text', localized: true, custom: { translatorSkip: true } },
      ],
      dataFrom: { title: 'Source title', description: 'Source description', skip: 'Excluded' },
      translatedData: destination,
      emptyOnly: true,
      valuesToTranslate: values,
    });
    expect(values.map(({ value }) => value)).toEqual(['Source description']);
    values[0].onTranslate('Translated');
    expect(destination).toEqual({ title: 'Existing', description: 'Translated', skip: 'Keep' });
  });
});
