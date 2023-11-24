import { AccessibilitySystem } from '../../src/accessibility/AccessibilitySystem';
import { Container } from '../../src/scene/container/Container';
import { getRenderer } from '../utils/getRenderer';

describe('AccessibilitySystem', () =>
{
    it('should be plugin for renderer', async () =>
    {
        const renderer = await getRenderer();

        expect(renderer.accessibility).toBeInstanceOf(AccessibilitySystem);
        renderer.destroy();
    });

    it('should remove touch hook when destroyed', async () =>
    {
        const renderer = await getRenderer();
        const system = new AccessibilitySystem(renderer, {
            phone: true,
        } as any);
        const hookDiv = system.hookDiv;

        expect(hookDiv).toBeInstanceOf(HTMLElement);
        expect(document.body.contains(hookDiv)).toBe(true);
        system.destroy();
        expect(document.body.contains(hookDiv)).toBe(false);
        renderer.destroy();
    });

    it('should activate when tab is pressed and deactivate when mouse moved', async () =>
    {
        const renderer = await getRenderer();
        const system = new AccessibilitySystem(renderer);

        system['_onKeyDown'](new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));
        expect(system.isActive).toBe(true);

        system['_onMouseMove'](new MouseEvent('mousemove', { movementX: 10, movementY: 10 }));
        expect(system.isActive).toBe(false);
    });

    it('should not crash when scene graph contains Containers without children', async () =>
    {
        class CompleteContainer extends Container
        {
            calculateBounds() { /* noop */ }
            render() { /* noop */ }
        }

        const renderer = await getRenderer();
        const stage = new Container().addChild(new CompleteContainer());
        const system = new AccessibilitySystem(renderer);

        system['_onKeyDown'](new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));

        expect(() => renderer.render(stage)).not.toThrow();
        expect(system.isActive).toBe(true);
    });
});
