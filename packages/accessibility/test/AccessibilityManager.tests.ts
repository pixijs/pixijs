import { AccessibilityManager } from '@pixi/accessibility';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { DisplayObject, Container } from '@pixi/display';
import { Renderer } from '@pixi/core';
import { isMobile } from '@pixi/utils';
import { expect } from 'chai';

describe('AccessibilityManager', function ()
{
    it('should exist', function ()
    {
        expect(AccessibilityManager).to.be.not.undefined;
    });

    it('should create new manager', function ()
    {
        const manager = new AccessibilityManager();

        expect(manager).to.be.instanceof(AccessibilityManager);
        manager.destroy();
    });

    it('should be plugin for renderer', function ()
    {
        CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);

        const renderer = new CanvasRenderer();

        expect(renderer.plugins.accessibility).to.be.instanceof(AccessibilityManager);
        renderer.destroy();
    });

    it('should remove touch hook when destroyed', function ()
    {
        const phone = isMobile.phone;

        isMobile.phone = true;
        const manager = new AccessibilityManager();
        const hookDiv = manager._hookDiv;

        expect(hookDiv).to.be.instanceof(HTMLElement);
        expect(document.body.contains(hookDiv)).to.be.true;
        manager.destroy();
        expect(document.body.contains(hookDiv)).to.be.false;
        isMobile.phone = phone;
    });

    it('should activate when tab is pressed and deactivate when mouse moved', function ()
    {
        const renderer = new Renderer();
        const manager = new AccessibilityManager(renderer);

        globalThis.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));
        expect(manager.isActive).to.be.true;
        globalThis.document.dispatchEvent(new MouseEvent('mousemove', { movementX: 10, movementY: 10 }));
        expect(manager.isActive).to.be.false;
    });

    it('should not crash when scene graph contains DisplayObjects without children', function ()
    {
        class CompleteDisplayObject extends DisplayObject
        {
            calculateBounds() { /* noop */ }
            render() { /* noop */ }
        }

        const renderer = new Renderer();
        const stage = new Container().addChild(new CompleteDisplayObject());
        const manager = new AccessibilityManager(renderer);

        globalThis.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, key: 'tab' }));

        expect(() => renderer.render(stage)).not.to.throw();
        expect(manager.isActive).to.be.true;
    });
});
