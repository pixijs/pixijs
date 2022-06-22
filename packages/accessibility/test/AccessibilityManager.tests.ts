import { AccessibilityManager } from '@pixi/accessibility';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { DisplayObject, Container } from '@pixi/display';
import { extensions, Renderer } from '@pixi/core';
import { isMobile } from '@pixi/utils';

describe('AccessibilityManager', () =>
{
    beforeAll(() =>
    {
        extensions.add(AccessibilityManager);
    });

    it('should exist', () =>
    {
        expect(AccessibilityManager).toBeDefined();
    });

    it('should create new manager', () =>
    {
        const manager = new AccessibilityManager(undefined);

        expect(manager).toBeInstanceOf(AccessibilityManager);
        manager.destroy();
    });

    it('should be plugin for renderer', () =>
    {
        extensions.add(AccessibilityManager);

        const renderer = new CanvasRenderer();

        expect(renderer.plugins.accessibility).toBeInstanceOf(AccessibilityManager);
        renderer.destroy();

        extensions.remove(AccessibilityManager);
    });

    it('should remove touch hook when destroyed', () =>
    {
        const phone = isMobile.phone;

        isMobile.phone = true;
        const manager = new AccessibilityManager(undefined);
        const hookDiv = manager['_hookDiv'];

        expect(hookDiv).toBeInstanceOf(HTMLElement);
        expect(document.body.contains(hookDiv)).toBe(true);
        manager.destroy();
        expect(document.body.contains(hookDiv)).toBe(false);
        isMobile.phone = phone;
    });

    it('should activate when tab is pressed and deactivate when mouse moved', () =>
    {
        const renderer = new Renderer();
        const manager = new AccessibilityManager(renderer);

        globalThis.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));
        setTimeout(() =>
        {
            expect(manager.isActive).toBe(true);
            globalThis.document.dispatchEvent(new MouseEvent('mousemove', { movementX: 10, movementY: 10 }));
            expect(manager.isActive).toBe(false);
        }, 0);
    });

    it('should not crash when scene graph contains DisplayObjects without children', () =>
    {
        // @ts-expect-error - mock DisplayObject
        class CompleteDisplayObject extends DisplayObject
        {
            calculateBounds() { /* noop */ }
            render() { /* noop */ }
        }

        const renderer = new Renderer();
        const stage = new Container().addChild(new CompleteDisplayObject());
        const manager = new AccessibilityManager(renderer);

        globalThis.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));

        expect(() => renderer.render(stage)).not.toThrowError();
        setTimeout(() =>
        {
            expect(manager.isActive).toBe(true);
        }, 0);
    });
});
