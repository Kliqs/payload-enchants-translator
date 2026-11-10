import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';
import { traverseFields } from '../src/translate/traverseFields';
import type { ValueToTranslate } from '../src/translate/types';

const fields: Field[] = [
  { name: 'downloadFile', type: 'upload', relationTo: 'media', localized: true, custom: { translatorSkip: true } },
  { name: 'title', type: 'text', localized: true },
];

describe('localized document PDFs', () => {
  it.each([false, true])('keeps the FR file or empty value when copying DE to FR (emptyOnly=%s)', (emptyOnly) => {
    for (const existing of [202, 'fr-file-id', { id: 202, filename: 'fr-example.pdf' }, null, undefined]) {
      const destination: Record<string, unknown> = { downloadFile: structuredClone(existing), title: '' };
      const before = structuredClone(destination.downloadFile);
      const values: ValueToTranslate[] = [];
      traverseFields({ fields, dataFrom: { downloadFile: 101, title: 'Document title' }, translatedData: destination, valuesToTranslate: values, emptyOnly });
      expect(destination.downloadFile).toEqual(before);
      expect(values.map(({ value }) => value)).toEqual(['Document title']);
      values[0].onTranslate('Titre du document');
      expect(destination.title).toBe('Titre du document');
      expect(destination.downloadFile).toEqual(before);
    }
  });

  it('does not create an absent target file field', () => {
    const destination = {};
    traverseFields({ fields, dataFrom: { downloadFile: 101 }, translatedData: destination, valuesToTranslate: [] });
    expect(destination).not.toHaveProperty('downloadFile');
  });

  it('retains normal upload copying when skip is not enabled', () => {
    const destination = { downloadFile: 202 };
    traverseFields({ fields: [{ name: 'downloadFile', type: 'upload', relationTo: 'media', localized: true }], dataFrom: { downloadFile: 101 }, translatedData: destination, valuesToTranslate: [] });
    expect(destination.downloadFile).toBe(101);
  });
});
