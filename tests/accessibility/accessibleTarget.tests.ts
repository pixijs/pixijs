import { AccessibilitySystem } from '../../src/accessibility/AccessibilitySystem';
import { Container } from '../../src/scene/container/Container';
import { getWebGLRenderer } from '../utils/getRenderer';
import '../../src/accessibility/init';

describe('accessibleTarget', () =>
{
    it('should have target public properties', async () =>
    {
        const renderer = await getWebGLRenderer();

        // eslint-disable-next-line no-new
        new AccessibilitySystem(renderer, {
            phone: true,
        } as any);
        const obj = new Container();

        expect(obj.accessible).toBeBoolean();
        expect(obj.accessible).toBe(false);
        expect(obj.accessibleTitle).toBeNull();
        expect(obj.accessibleHint).toBeNull();
        expect(obj.tabIndex).toEqual(0);
    });
});
