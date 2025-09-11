import { AccessibilitySystem } from '../AccessibilitySystem';
import '../init';
import { getWebGLRenderer } from '@test-utils';
import { Container } from '~/scene';

describe('AccessibilitySystem', () =>
{
    it('should be plugin for renderer', async () =>
    {
        const renderer = await getWebGLRenderer();

        expect(renderer.accessibility).toBeInstanceOf(AccessibilitySystem);
        renderer.destroy();
    });

    it('should remove touch hook when destroyed', async () =>
    {
        const renderer = await getWebGLRenderer();
        const system = new AccessibilitySystem(renderer, {
            phone: true,
        } as any);

        system.init({});
        const hookDiv = system.hookDiv;

        expect(hookDiv).toBeInstanceOf(HTMLElement);
        expect(document.body.contains(hookDiv)).toBe(true);
        system.destroy();
        expect(document.body.contains(hookDiv)).toBe(false);
        renderer.destroy();
    });

    it('should respect activation configuration options', async () =>
    {
        const renderer = await getWebGLRenderer();
        const system = new AccessibilitySystem(renderer);

        system.init({
            accessibilityOptions: {
                enabledByDefault: true,
                activateOnTab: false,
            },
        });

        expect(system.isActive).toBe(true);

        // Tab press should not activate when activateOnTab is false
        system.setAccessibilityEnabled(false);
        system['_onKeyDown'](new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));
        expect(system.isActive).toBe(false);

        renderer.destroy();
    });

    it('should activate when tab is pressed by default', async () =>
    {
        const renderer = await getWebGLRenderer();
        const system = new AccessibilitySystem(renderer);

        system.init();

        system['_onKeyDown'](new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));
        expect(system.isActive).toBe(true);

        system['_onMouseMove'](new MouseEvent('mousemove', { movementX: 10, movementY: 10 }));
        expect(system.isActive).toBe(false);

        renderer.destroy();
    });

    it('should not crash when scene graph contains Containers without children', async () =>
    {
        class CompleteContainer extends Container
        {
            calculateBounds() { /* noop */ }
            render() { /* noop */ }
        }

        const renderer = await getWebGLRenderer();
        const stage = new Container().addChild(new CompleteContainer());
        const system = new AccessibilitySystem(renderer);

        system.init();

        system['_onKeyDown'](new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));

        expect(() => renderer.render(stage)).not.toThrow();
        expect(system.isActive).toBe(true);
    });

    it('should allow programmatic control of accessibility', async () =>
    {
        const renderer = await getWebGLRenderer();
        const system = new AccessibilitySystem(renderer);

        system.init();

        system.setAccessibilityEnabled(true);
        expect(system.isActive).toBe(true);

        system.setAccessibilityEnabled(false);
        expect(system.isActive).toBe(false);

        renderer.destroy();
    });

    it('should render the correct type, title and tabIndex metadata in the debug div', async () =>
    {
        const renderer = await getWebGLRenderer();
        const system = new AccessibilitySystem(renderer);

        system.init({
            accessibilityOptions: {
                enabledByDefault: true,
                debug: true
            }
        });

        const container = new Container();

        container.accessibleType = 'button';
        container.accessibleTitle = 'myCustomTitle';
        container.accessibleHint = 'myCustomHint';
        container.interactive = true;
        container.tabIndex = 2;

        system['_addChild'](container);

        const expectedInnerHTML = `type: button<br> title : myCustomTitle<br> tabIndex: 2`;

        expect(container._accessibleDiv.innerHTML).toBe(expectedInnerHTML);

        renderer.destroy();
    });

    it('should apply the correct accessibility properties to the debug div', async () =>
    {
        const renderer = await getWebGLRenderer();
        const system = new AccessibilitySystem(renderer);

        system.init({
            accessibilityOptions: {
                enabledByDefault: true,
                debug: true
            }
        });

        const container = new Container();

        container.accessibleType = 'button';
        container.accessibleTitle = 'myCustomTitle';
        container.accessibleHint = 'myCustomHint';
        container.interactive = true;
        container.tabIndex = 2;

        system['_addChild'](container);

        expect(container._accessibleDiv.tabIndex).toBe(2);
        expect(container._accessibleDiv.type).toBe('button');
        expect(container._accessibleDiv.title).toBe('myCustomTitle');
        expect(container._accessibleDiv.getAttribute('aria-label')).toBe('myCustomHint');

        renderer.destroy();
    });
});
