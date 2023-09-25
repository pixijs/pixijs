import { AccessibilitySystem } from '../../src/accessibility/AccessibilitySystem';
import { Container } from '../../src/rendering/scene/Container';
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

    it('should activate when tab is pressed and deactivate when mouse moved', async (done) =>
    {
        const renderer = await getRenderer();
        const system = new AccessibilitySystem(renderer);

        globalThis.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));
        setTimeout(() =>
        {
            expect(system.isActive).toBe(true);
            globalThis.document.dispatchEvent(new MouseEvent('mousemove', { movementX: 10, movementY: 10 }));
            expect(system.isActive).toBe(false);
            done();
        }, 0);
    });

    it('should not crash when scene graph contains DisplayObjects without children', async (done) =>
    {
        class CompleteDisplayObject extends Container
        {
            calculateBounds() { /* noop */ }
            render() { /* noop */ }
        }

        const renderer = await getRenderer();
        const stage = new Container().addChild(new CompleteDisplayObject());
        const system = new AccessibilitySystem(renderer);

        globalThis.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));

        expect(() => renderer.render(stage)).not.toThrowError();
        setTimeout(() =>
        {
            expect(system.isActive).toBe(true);
            done();
        }, 0);
    });
});
