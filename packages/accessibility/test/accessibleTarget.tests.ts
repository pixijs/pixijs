import { DisplayObject } from '@pixi/display';
import '@pixi/accessibility';

describe('accessibleTarget', () =>
{
    it('should have target public properties', () =>
    {
        // @ts-expect-error ---
        const obj = new DisplayObject();

        expect(obj.accessible).toBeBoolean();
        expect(obj.accessible).toBe(false);
        expect(obj.accessibleTitle).toBeNull();
        expect(obj.accessibleHint).toBeNull();
        expect(obj.tabIndex).toEqual(0);
    });
});
