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

    it('uses the correct HTMLElement type when recycling divs from the pool', async () =>
    {
        const renderer = await getWebGLRenderer();

        const system = new AccessibilitySystem(renderer);

        system.init({
            accessibilityOptions: {
                enabledByDefault: true,
                debug: true
            }
        });

        system['_isRunningTests'] = true;

        const stage = new Container();

        // Create an accessible button
        const myButton = new Container();

        myButton.accessible = true;
        myButton.accessibleType = 'button';
        myButton.accessibleTitle = 'myButtonTitle';
        myButton.accessibleHint = 'myButtonHint';
        myButton.interactive = true;
        myButton.tabIndex = 2;
        stage.addChild(myButton);

        renderer.render(stage);
        system.postrender();

        expect(myButton._accessibleDiv.tagName).toBe('BUTTON');
        expect(myButton._accessibleDiv.type).toBe('button');
        expect(myButton._accessibleDiv.tabIndex).toBe(2);
        expect(myButton._accessibleDiv.getAttribute('aria-label')).toBe('myButtonHint');

        // Disable the button's accessibility behaviour
        myButton.accessible = false;
        renderer.render(stage);
        system.postrender();

        // Create a H1 accessible element in a later frame
        const myHeading = new Container();

        myHeading.accessible = true;
        myHeading.accessibleType = 'h1';
        myHeading.interactive = false;
        stage.addChild(myHeading);

        renderer.render(stage);
        system.postrender();

        // Assert that it did not reuse the <button> and instead created a <h1>
        expect(myHeading._accessibleDiv.tagName).toBe('H1');
        expect(myHeading._accessibleDiv.type).toBe('h1');
        expect(myHeading._accessibleDiv.tabIndex).toBe(0);
        expect(myHeading._accessibleDiv.hasAttribute('aria-label')).toBe(false);

        renderer.destroy();
    });

    it('recycled divs do not carry over metadata from the last use', async () =>
    {
        const renderer = await getWebGLRenderer();

        const system = new AccessibilitySystem(renderer);

        system.init({
            accessibilityOptions: {
                enabledByDefault: true,
                debug: true
            }
        });

        system['_isRunningTests'] = true;

        const stage = new Container();

        // Create an accessible button
        const myButton1 = new Container();

        myButton1.accessible = true;
        myButton1.accessibleType = 'button';
        myButton1.accessibleTitle = 'myButton1Title';
        myButton1.accessibleHint = 'myButton1Hint';
        myButton1.interactive = true;
        myButton1.tabIndex = 2;
        stage.addChild(myButton1);

        renderer.render(stage);
        system.postrender();

        expect(myButton1._accessibleDiv.tabIndex).toBe(2);
        expect(myButton1._accessibleDiv.getAttribute('title')).toBe('myButton1Title');
        expect(myButton1._accessibleDiv.getAttribute('aria-label')).toBe('myButton1Hint');

        // Disable the button's accessibility behaviour
        myButton1.accessible = false;
        renderer.render(stage);
        system.postrender();

        // Create a new accessible button with different metadata
        const myButton2 = new Container();

        myButton2.accessible = true;
        myButton2.accessibleType = 'button';
        myButton2.interactive = false; // Don't make this one interactive
        // This time don't set accessibleTitle, accessibleHint or tabIndex
        stage.addChild(myButton2);

        renderer.render(stage);
        system.postrender();

        // Assert that we don't carry over metadata from myButton1
        // It was possible to end up with:
        // - the old tabIndex if container.interactive is false
        // - the old aria-label if container.accessibleHint is not set
        expect(myButton2._accessibleDiv.tabIndex).toBe(0);
        expect(myButton2._accessibleDiv.title).toBe('container 0');
        expect(myButton2._accessibleDiv.hasAttribute('aria-label')).toBe(false);

        renderer.destroy();
    });
});
