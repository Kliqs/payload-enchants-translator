import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';
import { traverseFields } from '../src/translate/traverseFields';

const copy = (type: string, source: unknown, destination: unknown, emptyOnly = true) => {
  const target = { value: destination };
  traverseFields({ fields: [{ name: 'value', type, localized: true }] as Field[], dataFrom: { value: source }, translatedData: target, valuesToTranslate: [], emptyOnly });
  return target.value;
};

describe('empty-only scalar copying', () => {
  it.each([
    ['number', 42, 99], ['number', 42, 0], ['checkbox', true, false],
    ['date', '2026-01-01', '2025-01-01'], ['email', 'source@example.test', 'target@example.test'],
    ['code', 'source', 'target'], ['radio', 'source', 'target'], ['select', ['source'], ['target']],
    ['relationship', 'source-id', 'target-id'], ['upload', 'source-id', 'target-id'],
    ['point', [1, 2], [0, 0]], ['json', { source: true }, { target: true }],
  ])('preserves populated %s values including valid zero/false', (type, source, destination) => {
    expect(copy(type as string, source, destination)).toEqual(destination);
  });

  it.each([
    ['number', 42, null], ['number', 42, undefined], ['date', '2026-01-01', ''],
    ['checkbox', true, null], ['relationship', ['source-id'], []], ['json', { source: true }, {}],
  ])('fills empty %s values', (type, source, destination) => {
    expect(copy(type as string, source, destination)).toEqual(source);
  });

  it('still replaces populated values in full-copy mode', () => {
    expect(copy('number', 42, 99, false)).toBe(42);
    expect(copy('checkbox', true, false, false)).toBe(true);
  });
});
