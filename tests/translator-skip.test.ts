import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';
import { traverseFields } from '../src/translate/traverseFields';
import type { ValueToTranslate } from '../src/translate/types';

const lexical = (text: string) => ({ root: { children: [{ children: [{ text }] }] } });
const child = { name: 'title', type: 'text', localized: true };

describe('translatorSkip at the field boundary', () => {
  it.each([
    [{ type: 'text' }, 'Source', 'Keep'],
    [{ type: 'number' }, 42, 0],
    [{ type: 'richText' }, lexical('Source'), lexical('Keep')],
    [{ type: 'richText' }, [{ children: [{ text: 'Source' }] }], [{ children: [{ text: 'Keep' }] }]],
    [{ type: 'group', fields: [child] }, { title: 'Source' }, { title: 'Keep' }],
    [{ type: 'array', fields: [child] }, [{ id: 'source', title: 'Source' }], [{ id: 'target', title: 'Keep' }]],
    [{ type: 'blocks', blocks: [{ slug: 'example', fields: [child] }] }, [{ blockType: 'example', title: 'Source' }], [{ blockType: 'example', title: 'Keep' }]],
  ])('does not copy or send skipped %j content to a resolver', (field, source, existing) => {
    const target = { value: structuredClone(existing), sibling: '' };
    const original = structuredClone(target.value);
    const values: ValueToTranslate[] = [];
    traverseFields({
      fields: [{ ...field, name: 'value', localized: true, custom: { translatorSkip: true } }, { name: 'sibling', type: 'text', localized: true }] as Field[],
      dataFrom: { value: source, sibling: 'Translate sibling' }, translatedData: target, valuesToTranslate: values,
    });
    expect(target.value).toEqual(original);
    expect(values.map(({ value }) => value)).toEqual(['Translate sibling']);
    values[0].onTranslate('Translated sibling');
    expect(target.sibling).toBe('Translated sibling');
  });

  it('skips descendants of a layout field', () => {
    const target = { title: 'Keep' };
    const values: ValueToTranslate[] = [];
    traverseFields({ fields: [{ type: 'row', fields: [child], custom: { translatorSkip: true } }] as Field[], dataFrom: { title: 'Source' }, translatedData: target, valuesToTranslate: values });
    expect(values).toEqual([]);
    expect(target.title).toBe('Keep');
  });

  it('still translates rich text when the flag is false', () => {
    const target: Record<string, unknown> = {};
    const values: ValueToTranslate[] = [];
    traverseFields({ fields: [{ name: 'content', type: 'richText', localized: true, custom: { translatorSkip: false } }] as Field[], dataFrom: { content: lexical('Source') }, translatedData: target, valuesToTranslate: values });
    expect(values.map(({ value }) => value)).toEqual(['Source']);
    values[0].onTranslate('Translated');
    expect(target.content).toEqual(lexical('Translated'));
  });
});
