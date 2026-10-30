import { createIdFromString } from '../createIdFromString';

describe('createIdFromString', () =>
{
    it('should return the same ID for the same value and group', () =>
    {
        const id = createIdFromString('stable-value', 'create-id-stable');

        expect(id).toBe(1);
        expect(createIdFromString('stable-value', 'create-id-stable')).toBe(id);
    });

    it('should keep program attribute IDs distinct after an empty shader override', () =>
    {
        createIdFromString('', 'shader-overrides');

        const empty = createIdFromString('', 'programAttributes');
        const zero = createIdFromString('0', 'programAttributes');
        const one = createIdFromString('1', 'programAttributes');

        expect(new Set([empty, zero, one]).size).toBe(3);
        expect(createIdFromString('', 'programAttributes')).toBe(empty);
    });

    it('should allocate shared values independently in each group', () =>
    {
        createIdFromString('source-only-value', 'create-id-source');
        const source = createIdFromString('shared-group-value', 'create-id-source');
        const shared = createIdFromString('shared-group-value', 'create-id-target');
        const next = createIdFromString('target-only-value', 'create-id-target');

        expect(source).toBe(2);
        expect(shared).toBe(1);
        expect(next).toBe(2);
        expect(next).not.toBe(shared);
        expect(createIdFromString('shared-group-value', 'create-id-target')).toBe(shared);
    });
});
