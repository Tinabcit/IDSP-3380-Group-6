import { describe, expect, it } from 'vitest';
import { isUuid, newId } from './ids';

describe('newId', () => {
  it('makes a UUID', () => {
    expect(isUuid(newId())).toBe(true);
  });

  it('makes a different id each time', () => {
    expect(newId()).not.toBe(newId());
  });
});

describe('isUuid', () => {
  it('accepts a UUID', () => {
    expect(isUuid('3f2a9c1e-8b7d-4e6f-a1b2-c3d4e5f6a7b8')).toBe(true);
  });

  it('rejects the old prefixed ids and non-strings', () => {
    expect(isUuid('task-3f2a9c1e-8b7d-4e6f-a1b2-c3d4e5f6a7b8')).toBe(false);
    expect(isUuid('todo-logo')).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
});
