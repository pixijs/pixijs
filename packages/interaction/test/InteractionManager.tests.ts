import { MockPointer } from './MockPointer';
import { Container } from '@pixi/display';
import { Ticker } from '@pixi/ticker';
import { Graphics } from '@pixi/graphics';
import { Point, Rectangle } from '@pixi/math';
import { InteractionManager } from '@pixi/interaction';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
import { Sprite } from '@pixi/sprite';

import '@pixi/canvas-display';
import { extensions, Texture } from '@pixi/core';

describe('InteractionManager', () =>
{
    beforeAll(() => extensions.add(
        InteractionManager,
        CanvasGraphicsRenderer,
        CanvasSpriteRenderer
    ));

    afterAll(() => extensions.remove(
        InteractionManager,
        CanvasGraphicsRenderer,
        CanvasSpriteRenderer
    ));

    let pointer: MockPointer;

    afterEach(() =>
    {
        // if we made a MockPointer for the test, clean it up
        if (pointer)
        {
            pointer.cleanup();
            pointer = null;
        }
    });

    describe('event basics', () =>
    {
        it('should call mousedown handler', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mousedown', eventSpy);

            pointer.mousedown(10, 10);

            expect(eventSpy).toHaveBeenCalledOnce();
        });

        it('should call mouseup handler', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseup', eventSpy);

            pointer.click(10, 10);

            expect(eventSpy).toBeCalled();
        });

        it('should call mouseupoutside handler', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseupoutside', eventSpy);

            pointer.mousedown(10, 10);
            pointer.mouseup(60, 60);

            expect(eventSpy).toBeCalled();
        });

        it('should call mouseupoutside handler on mouseup on different elements', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseupoutside', eventSpy);

            pointer.mousedown(10, 10);
            pointer.mouseup(10, 10, false);

            expect(eventSpy).toBeCalled();
        });

        it('should call mouseover handler', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseover', eventSpy);

            pointer.mousemove(10, 10);

            expect(eventSpy).toBeCalled();
        });

        it('should call mouseout handler', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseout', eventSpy);

            pointer.mousemove(10, 10);
            pointer.mousemove(60, 60);

            expect(eventSpy).toBeCalled();
        });

        it('should always call mouseout before mouseover', () =>
        {
            const stage = new Container();
            const graphicsA = new Graphics();
            const graphicsB = new Graphics();

            const mouseOverSpyA = jest.fn();
            const mouseOutSpyA = jest.fn();

            const mouseOverSpyB = jest.fn();
            const mouseOutSpyB = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphicsA);
            graphicsA.beginFill(0xFFFFFF);
            graphicsA.drawRect(0, 0, 50, 50);
            graphicsA.interactive = true;

            graphicsA.on('mouseover', mouseOverSpyA);
            graphicsA.on('mouseout', mouseOutSpyA);

            stage.addChild(graphicsB);
            graphicsB.x = 25;
            graphicsB.beginFill(0xFFFFFF);
            graphicsB.drawRect(0, 0, 50, 50);
            graphicsB.interactive = true;

            graphicsB.on('mouseover', mouseOverSpyB);
            graphicsB.on('mouseout', mouseOutSpyB);

            pointer.mousemove(10, 10);

            expect(mouseOverSpyA).toBeCalled();

            pointer.mousemove(40, 10);

            expect(mouseOutSpyA.mock.invocationCallOrder[0]).toBeLessThan(mouseOverSpyB.mock.invocationCallOrder[0]);

            pointer.mousemove(10, 10);

            expect(mouseOutSpyB.mock.invocationCallOrder[0]).toBeLessThan(mouseOverSpyA.mock.invocationCallOrder[1]);
        });
    });

    describe('event propagation', () =>
    {
        it('should stop event propagation', () =>
        {
            const stage = new Container();
            const parent = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            const mouseDownChild = jest.fn((evt) => evt.stopPropagation());
            const mouseDownParent = jest.fn();

            stage.addChild(parent);
            parent.addChild(graphics);

            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            parent.interactive = true;

            graphics.on('mousedown', mouseDownChild);

            parent.on('mousedown', mouseDownParent);

            pointer.mousedown(10, 10);

            expect(mouseDownChild).toBeCalled();
            expect(mouseDownParent).not.toBeCalled();
        });

        it('should not stop events on the same object from happening', () =>
        {
            const stage = new Container();
            const parent = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            // Neither of these should stop the other from firing
            const mouseMoveChild = jest.fn((evt) => evt.stopPropagation());
            const mouseOverChild = jest.fn((evt) => evt.stopPropagation());

            const mouseMoveParent = jest.fn();
            const mouseOverParent = jest.fn();

            stage.addChild(parent);
            parent.addChild(graphics);

            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            parent.interactive = true;

            graphics.on('mousemove', mouseMoveChild);
            graphics.on('mouseover', mouseOverChild);

            parent.on('mousemove', mouseMoveParent);
            parent.on('mouseover', mouseOverParent);

            pointer.mousemove(10, 10);

            expect(mouseOverChild).toBeCalled();
            expect(mouseMoveChild).toBeCalled();

            expect(mouseOverParent).not.toBeCalled();
            expect(mouseMoveParent).not.toBeCalled();
        });

        it('should not stop events on children of an object from happening', () =>
        {
            const stage = new Container();
            const parent = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            const mouseMoveChild = jest.fn();
            const mouseMoveParent = jest.fn((evt) => evt.stopPropagation());

            const mouseOverChild = jest.fn();
            const mouseOverParent = jest.fn();

            stage.addChild(parent);
            parent.addChild(graphics);

            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            parent.interactive = true;

            graphics.on('mousemove', mouseMoveChild);
            graphics.on('mouseover', mouseOverChild);

            parent.on('mousemove', mouseMoveParent);
            parent.on('mouseover', mouseOverParent);

            pointer.mousemove(10, 10);

            expect(mouseMoveChild).toBeCalled();
            expect(mouseOverChild).toBeCalled();

            expect(mouseMoveParent).toBeCalled();
            expect(mouseOverParent).toBeCalled();
        });
    });

    describe('touch vs pointer', () =>
    {
        it('should call touchstart and pointerdown when touch event and pointer supported', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const touchSpy = jest.fn(function touchListen() { /* noop */ });
            const pointerSpy = jest.fn(function pointerListen() { /* noop */ });

            pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('touchstart', touchSpy);
            graphics.on('pointerdown', pointerSpy);

            pointer.touchstart(10, 10);

            expect(touchSpy).toHaveBeenCalledOnce();
            expect(pointerSpy).toHaveBeenCalledOnce();
        });

        it('should not call touchstart or pointerdown when pointer event and touch supported', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const touchSpy = jest.fn(function touchListen() { /* noop */ });
            const pointerSpy = jest.fn(function pointerListen() { /* noop */ });

            pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('touchstart', touchSpy);
            graphics.on('pointerdown', pointerSpy);

            pointer.touchstart(10, 10, 0, true);

            expect(touchSpy).not.toBeCalled();
            expect(pointerSpy).not.toBeCalled();
        });

        it('should call touchstart and pointerdown when touch event and pointer not supported', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const touchSpy = jest.fn(function touchListen() { /* noop */ });
            const pointerSpy = jest.fn(function pointerListen() { /* noop */ });

            pointer = new MockPointer(stage, null, null, false);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('touchstart', touchSpy);
            graphics.on('pointerdown', pointerSpy);

            pointer.touchstart(10, 10);

            expect(touchSpy).toHaveBeenCalledOnce();
            expect(pointerSpy).toHaveBeenCalledOnce();
        });

        it('should call touchstart and pointerdown when pointer event and touch not supported', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const touchSpy = jest.fn(function touchListen() { /* noop */ });
            const pointerSpy = jest.fn(function pointerListen() { /* noop */ });

            pointer = new MockPointer(stage, null, null, true);

            pointer.interaction.supportsTouchEvents = false;

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('touchstart', touchSpy);
            graphics.on('pointerdown', pointerSpy);

            pointer.touchstart(10, 10, 0, true);

            expect(touchSpy).toHaveBeenCalledOnce();
            expect(pointerSpy).toHaveBeenCalledOnce();
        });
    });

    describe('add/remove events and ticker', () =>
    {
        let stub: jest.SpyInstance;

        beforeAll(() =>
        {
            stub = jest.spyOn(InteractionManager.prototype, 'setTargetElement');
        });

        afterAll(() =>
        {
            stub.mockClear();
        });

        it('should add and remove pointer events to document', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const addSpy = jest.spyOn(window.document, 'addEventListener');
            const removeSpy = jest.spyOn(window.document, 'removeEventListener');

            addSpy.mockReset();
            removeSpy.mockReset();

            manager['interactionDOMElement'] = {
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            } as unknown as HTMLElement;
            // @ts-expect-error - overriding readonly prop
            manager['supportsPointerEvents'] = true;

            manager['addEvents']();

            expect(addSpy).toHaveBeenCalledOnce();
            expect(addSpy.mock.calls[0][0]).toEqual('pointermove');

            manager['removeEvents']();

            expect(removeSpy).toHaveBeenCalledOnce();
            expect(removeSpy.mock.calls[0][0]).toEqual('pointermove');

            addSpy.mockClear();
            removeSpy.mockClear();
        });

        it('should add and remove pointer events to window', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const addSpy = jest.spyOn(window, 'addEventListener');
            const removeSpy = jest.spyOn(window, 'removeEventListener');

            addSpy.mockReset();
            removeSpy.mockReset();

            manager['interactionDOMElement'] = {
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            } as unknown as HTMLElement;
            // @ts-expect-error - overriding readonly prop
            manager['supportsPointerEvents'] = true;

            manager['addEvents']();

            expect(addSpy).toBeCalledTimes(2);
            expect(addSpy.mock.calls[0][0]).toEqual('pointercancel');
            expect(addSpy.mock.calls[1][0]).toEqual('pointerup');

            manager['removeEvents']();

            expect(removeSpy).toBeCalledTimes(2);
            expect(removeSpy.mock.calls[0][0]).toEqual('pointercancel');
            expect(removeSpy.mock.calls[1][0]).toEqual('pointerup');

            addSpy.mockClear();
            removeSpy.mockClear();
        });

        it('should add and remove pointer events to element seven times when touch events are supported', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const element = {
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };

            manager['interactionDOMElement'] = element as unknown as HTMLElement;
            // @ts-expect-error - overriding readonly prop
            manager['supportsPointerEvents'] = true;
            // @ts-expect-error - overriding readonly prop
            manager['supportsTouchEvents'] = true;

            manager['addEvents']();

            expect(element.addEventListener).toBeCalledTimes(7);
            expect(element.addEventListener.mock.calls[0][0]).toEqual('pointerdown');
            expect(element.addEventListener.mock.calls[1][0]).toEqual('pointerleave');
            expect(element.addEventListener.mock.calls[2][0]).toEqual('pointerover');

            expect(element.addEventListener.mock.calls[3][0]).toEqual('touchstart');
            expect(element.addEventListener.mock.calls[4][0]).toEqual('touchcancel');
            expect(element.addEventListener.mock.calls[5][0]).toEqual('touchend');
            expect(element.addEventListener.mock.calls[6][0]).toEqual('touchmove');

            manager['removeEvents']();

            expect(element.removeEventListener).toBeCalledTimes(7);
            expect(element.removeEventListener.mock.calls[0][0]).toEqual('pointerdown');
            expect(element.removeEventListener.mock.calls[1][0]).toEqual('pointerleave');
            expect(element.removeEventListener.mock.calls[2][0]).toEqual('pointerover');

            expect(element.removeEventListener.mock.calls[3][0]).toEqual('touchstart');
            expect(element.removeEventListener.mock.calls[4][0]).toEqual('touchcancel');
            expect(element.removeEventListener.mock.calls[5][0]).toEqual('touchend');
            expect(element.removeEventListener.mock.calls[6][0]).toEqual('touchmove');
        });

        it('should add and remove pointer events to element three times when touch events are not supported', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const element = {
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };

            manager['interactionDOMElement'] = element as unknown as HTMLElement;
            // @ts-expect-error - overriding readonly prop
            manager['supportsPointerEvents'] = true;
            // @ts-expect-error - overriding readonly prop
            manager['supportsTouchEvents'] = false;

            manager['addEvents']();

            expect(element.addEventListener).toBeCalledTimes(3);
            expect(element.addEventListener.mock.calls[0][0]).toEqual('pointerdown');
            expect(element.addEventListener.mock.calls[1][0]).toEqual('pointerleave');
            expect(element.addEventListener.mock.calls[2][0]).toEqual('pointerover');

            manager['removeEvents']();

            expect(element.removeEventListener).toBeCalledTimes(3);
            expect(element.removeEventListener.mock.calls[0][0]).toEqual('pointerdown');
            expect(element.removeEventListener.mock.calls[1][0]).toEqual('pointerleave');
            expect(element.removeEventListener.mock.calls[2][0]).toEqual('pointerover');
        });

        it('should add and remove mouse events to document', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const addSpy = jest.spyOn(window.document, 'addEventListener');
            const removeSpy = jest.spyOn(window.document, 'removeEventListener');

            addSpy.mockReset();
            removeSpy.mockReset();

            manager['interactionDOMElement'] = {
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            } as unknown as HTMLElement;
            // @ts-expect-error - overriding readonly prop
            manager['supportsPointerEvents'] = false;

            manager['addEvents']();

            expect(addSpy).toHaveBeenCalledOnce();
            expect(addSpy.mock.calls[0][0]).toEqual('mousemove');

            manager['removeEvents']();

            expect(removeSpy).toHaveBeenCalledOnce();
            expect(removeSpy.mock.calls[0][0]).toEqual('mousemove');

            addSpy.mockClear();
            removeSpy.mockClear();
        });

        it('should add and remove mouse events to window', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const addSpy = jest.spyOn(window, 'addEventListener');
            const removeSpy = jest.spyOn(window, 'removeEventListener');

            addSpy.mockReset();
            removeSpy.mockReset();

            manager['interactionDOMElement'] = {
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            } as unknown as HTMLElement;
            // @ts-expect-error - overriding readonly prop
            manager['supportsPointerEvents'] = false;

            manager['addEvents']();

            expect(addSpy).toHaveBeenCalledOnce();
            expect(addSpy.mock.calls[0][0]).toEqual('mouseup');

            manager['removeEvents']();

            expect(removeSpy).toHaveBeenCalledOnce();
            expect(removeSpy.mock.calls[0][0]).toEqual('mouseup');

            addSpy.mockClear();
            removeSpy.mockClear();
        });

        it('should add and remove mouse events to element', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const element = {
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };

            manager['interactionDOMElement'] = element as unknown as HTMLElement;
            // @ts-expect-error - overriding readonly prop
            manager['supportsPointerEvents'] = false;
            // @ts-expect-error - overriding readonly prop
            manager['supportsTouchEvents'] = false;

            manager['addEvents']();

            expect(element.addEventListener).toBeCalledTimes(3);
            expect(element.addEventListener.mock.calls[0][0]).toEqual('mousedown');
            expect(element.addEventListener.mock.calls[1][0]).toEqual('mouseout');
            expect(element.addEventListener.mock.calls[2][0]).toEqual('mouseover');

            manager['removeEvents']();

            expect(element.removeEventListener).toBeCalledTimes(3);
            expect(element.removeEventListener.mock.calls[0][0]).toEqual('mousedown');
            expect(element.removeEventListener.mock.calls[1][0]).toEqual('mouseout');
            expect(element.removeEventListener.mock.calls[2][0]).toEqual('mouseover');
        });

        it('should add and remove touch events to element without pointer events', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const element = {
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };

            manager['interactionDOMElement'] = element as unknown as HTMLElement;
            // @ts-expect-error - overriding readonly prop
            manager['supportsPointerEvents'] = false;
            // @ts-expect-error - overriding readonly prop
            manager['supportsTouchEvents'] = true;

            manager['addEvents']();

            expect(element.addEventListener.mock.calls[3][0]).toEqual('touchstart');
            expect(element.addEventListener.mock.calls[4][0]).toEqual('touchcancel');
            expect(element.addEventListener.mock.calls[5][0]).toEqual('touchend');
            expect(element.addEventListener.mock.calls[6][0]).toEqual('touchmove');

            manager['removeEvents']();

            expect(element.removeEventListener.mock.calls[3][0]).toEqual('touchstart');
            expect(element.removeEventListener.mock.calls[4][0]).toEqual('touchcancel');
            expect(element.removeEventListener.mock.calls[5][0]).toEqual('touchend');
            expect(element.removeEventListener.mock.calls[6][0]).toEqual('touchmove');
        });

        it('should add and remove touch events to element with pointer events', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const element = {
                style: {},
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };

            manager['interactionDOMElement'] = element as unknown as HTMLElement;
            // @ts-expect-error - overriding readonly prop
            manager['supportsPointerEvents'] = true;
            // @ts-expect-error - overriding readonly prop
            manager['supportsTouchEvents'] = true;

            manager['addEvents']();

            expect(element.addEventListener.mock.calls[3][0]).toEqual('touchstart');
            expect(element.addEventListener.mock.calls[4][0]).toEqual('touchcancel');
            expect(element.addEventListener.mock.calls[5][0]).toEqual('touchend');
            expect(element.addEventListener.mock.calls[6][0]).toEqual('touchmove');

            manager['removeEvents']();

            expect(element.removeEventListener.mock.calls[3][0]).toEqual('touchstart');
            expect(element.removeEventListener.mock.calls[4][0]).toEqual('touchcancel');
            expect(element.removeEventListener.mock.calls[5][0]).toEqual('touchend');
            expect(element.removeEventListener.mock.calls[6][0]).toEqual('touchmove');
        });

        it('should add and remove Ticker.system listener', () =>
        {
            const manager = new InteractionManager(jest.fn() as any);
            const element = {};

            manager['interactionDOMElement'] = element as unknown as HTMLElement;

            const listenerCount = Ticker.system.count;

            manager['addTickerListener']();

            expect(Ticker.system.count).toEqual(listenerCount + 1);

            manager.useSystemTicker = false;

            expect(Ticker.system.count).toEqual(listenerCount);

            manager.useSystemTicker = true;

            expect(Ticker.system.count).toEqual(listenerCount + 1);

            manager['removeTickerListener']();

            expect(Ticker.system.count).toEqual(listenerCount);

            manager.useSystemTicker = false;

            expect(Ticker.system.count).toEqual(listenerCount);

            manager['addTickerListener']();

            expect(Ticker.system.count).toEqual(listenerCount);
        });
    });

    describe('onClick', () =>
    {
        it('should call handler when inside', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('click', clickSpy);

            pointer.click(10, 10);

            expect(clickSpy).toHaveBeenCalledOnce();
        });

        it('should not call handler when outside', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('click', clickSpy);

            pointer.click(60, 60);

            expect(clickSpy).not.toBeCalled();
        });

        it('should not call handler when mousedown not received', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = jest.fn();
            const pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('click', clickSpy);

            pointer.mouseup(10, 10);

            expect(clickSpy).not.toBeCalled();

            // test again, just because it was a bug that was reported
            pointer.mouseup(20, 20);

            expect(clickSpy).not.toBeCalled();
        });
    });

    describe('onTap', () =>
    {
        it('should call handler when inside', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('tap', clickSpy);

            pointer.tap(10, 10);

            expect(clickSpy).toHaveBeenCalledOnce();
        });

        it('should not call handler when outside', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('tap', clickSpy);

            pointer.tap(60, 60);

            expect(clickSpy).not.toBeCalled();
        });

        it('should not call handler when moved to other sprite', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const graphics2 = new Graphics();
            const clickSpy = jest.fn();
            const overSpy = jest.fn();
            const endSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            stage.addChild(graphics2);
            graphics2.beginFill(0xFFFFFF);
            graphics2.drawRect(75, 75, 50, 50);
            graphics2.interactive = true;
            graphics2.on('tap', clickSpy);
            graphics2.on('touchmove', overSpy);
            graphics2.on('touchend', endSpy);

            pointer.touchstart(25, 25, 3);
            pointer.touchmove(60, 60, 3);
            pointer.touchmove(80, 80, 3);
            pointer.touchend(80, 80, 3);

            expect(overSpy).toBeCalled();
            expect(endSpy).toBeCalled();
            expect(clickSpy).not.toBeCalled();
        });
    });

    describe('pointertap', () =>
    {
        it('should call handler when inside', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('pointertap', clickSpy);

            pointer.click(10, 10, true);

            expect(clickSpy).toHaveBeenCalledOnce();
        });

        it('should not call handler when outside', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('pointertap', clickSpy);

            pointer.click(60, 60, true);

            expect(clickSpy).not.toBeCalled();
        });

        it('with mouse events, should not call handler when moved to other sprite', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const graphics2 = new Graphics();
            const overSpy = jest.fn();
            const upSpy = jest.fn();
            const clickSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            stage.addChild(graphics2);
            graphics2.beginFill(0xFFFFFF);
            graphics2.drawRect(75, 75, 50, 50);
            graphics2.interactive = true;
            graphics2.on('pointertap', clickSpy);
            graphics2.on('pointerover', overSpy);
            graphics2.on('pointerup', upSpy);

            pointer.mousedown(25, 25);
            pointer.mousemove(60, 60);
            pointer.mousemove(80, 80);
            pointer.mouseup(80, 80);

            expect(overSpy).toBeCalled();
            expect(upSpy).toBeCalled();
            expect(clickSpy).not.toBeCalled();
        });

        it('with pointer events, should not call handler when moved to other sprite', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const graphics2 = new Graphics();
            const overSpy = jest.fn();
            const upSpy = jest.fn();
            const clickSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            stage.addChild(graphics2);
            graphics2.beginFill(0xFFFFFF);
            graphics2.drawRect(75, 75, 50, 50);
            graphics2.interactive = true;
            graphics2.on('pointertap', clickSpy);
            graphics2.on('pointerover', overSpy);
            graphics2.on('pointerup', upSpy);

            pointer.mousedown(25, 25, true);
            pointer.mousemove(60, 60, true);
            pointer.mousemove(80, 80, true);
            pointer.mouseup(80, 80, true);

            expect(overSpy).toBeCalled();
            expect(upSpy).toBeCalled();
            expect(clickSpy).not.toBeCalled();
        });

        it('with touch events, should not call handler when moved to other sprite', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const graphics2 = new Graphics();
            const moveSpy = jest.fn();
            const upSpy = jest.fn();
            const clickSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            stage.addChild(graphics2);
            graphics2.beginFill(0xFFFFFF);
            graphics2.drawRect(75, 75, 50, 50);
            graphics2.interactive = true;
            graphics2.on('pointertap', clickSpy);
            graphics2.on('pointermove', moveSpy);
            graphics2.on('pointerup', upSpy);

            pointer.touchstart(25, 25, true);
            pointer.touchmove(60, 60, true);
            pointer.touchmove(80, 80, true);
            pointer.touchend(80, 80, true);

            expect(moveSpy).toBeCalled();
            expect(upSpy).toBeCalled();
            expect(clickSpy).not.toBeCalled();
        });
    });

    describe('overlapping children', () =>
    {
        function getScene(callbackEventName: string, splitParents?: boolean)
        {
            const behindChild = new Graphics();
            const frontChild = new Graphics();
            const parent = new Container();
            const behindChildCallback = jest.fn(function behindSpy() { /* no op*/ });
            const frontChildCallback = jest.fn(function frontSpy() { /* no op*/ });
            const parentCallback = jest.fn(function parentSpy() { /* no op*/ });
            let behindParent: Container;
            let frontParent: Container;
            let behindParentCallback: jest.Mock;
            let frontParentCallback: jest.Mock;

            behindChild.beginFill(0xFF);
            behindChild.drawRect(0, 0, 50, 50);
            behindChild.on(callbackEventName, behindChildCallback);

            frontChild.beginFill(0x00FF);
            frontChild.drawRect(0, 0, 50, 50);
            frontChild.on(callbackEventName, frontChildCallback);

            if (splitParents)
            {
                behindParent = new Container();
                frontParent = new Container();
                behindParentCallback = jest.fn(function behindParentSpy() { /* no op*/ });
                frontParentCallback = jest.fn(function frontParentSpy() { /* no op*/ });
                behindParent.on(callbackEventName, behindParentCallback);
                frontParent.on(callbackEventName, frontParentCallback);

                parent.addChild(behindParent, frontParent);
                behindParent.addChild(behindChild);
                frontParent.addChild(frontChild);
            }
            else
            {
                parent.addChild(behindChild, frontChild);
            }
            parent.on(callbackEventName, parentCallback);

            return {
                behindChild,
                frontChild,
                behindParent,
                frontParent,
                parent,
                behindChildCallback,
                frontChildCallback,
                behindParentCallback,
                frontParentCallback,
                parentCallback,
            };
        }

        describe('when parent is non-interactive', () =>
        {
            describe('when both children are interactive', () =>
            {
                it('should callback front child when clicking front child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).not.toBeCalled();
                });

                it('should callback front child when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).not.toBeCalled();
                });

                it('should callback behind child when clicking behind child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.behindChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).not.toBeCalled();
                });

                it('should callback front child of different non-interactive parents when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click', true);

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).not.toBeCalled();
                    expect(scene.behindParentCallback).not.toBeCalled();
                    expect(scene.frontParentCallback).not.toBeCalled();
                });

                it('should callback front child of different interactive parents when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click', true);

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.behindParent.interactive = true;
                    scene.frontParent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).not.toBeCalled();
                    expect(scene.behindParentCallback).not.toBeCalled();
                    expect(scene.frontParentCallback).toHaveBeenCalledOnce();
                });
            });

            describe('when front child is non-interactive', () =>
            {
                it('should not callback when clicking front child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.parentCallback).not.toBeCalled();
                });

                it('should callback behind child when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).toHaveBeenCalledOnce();
                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.parentCallback).not.toBeCalled();
                });

                it('should callback behind child when clicking behind child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.behindChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).not.toBeCalled();
                });
            });

            describe('when behind child is non-interactive', () =>
            {
                it('should callback front child when clicking front child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).not.toBeCalled();
                });

                it('should callback front child when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).not.toBeCalled();
                });

                it('should not callback when clicking behind child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.parentCallback).not.toBeCalled();
                });
            });
        });

        describe('when parent is interactive', () =>
        {
            describe('when both children are interactive', () =>
            {
                it('should callback parent and front child when clicking front child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                });

                it('should callback parent and front child when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                });

                it('should callback parent and behind child when clicking behind child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.behindChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                });

                it('should callback front child of different non-interactive parents when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click', true);

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                    expect(scene.behindParentCallback).not.toBeCalled();
                    expect(scene.frontParentCallback).not.toBeCalled();
                });

                it('should callback front child of different interactive parents when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click', true);

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;
                    scene.behindParent.interactive = true;
                    scene.frontParent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                    expect(scene.behindParentCallback).not.toBeCalled();
                    expect(scene.frontParentCallback).toHaveBeenCalledOnce();
                });
            });

            describe('when front child is non-interactive', () =>
            {
                it('should callback parent when clicking front child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                });

                it('should callback parent and behind child when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).toHaveBeenCalledOnce();
                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                });

                it('should callback parent and behind child when clicking behind child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.behindChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                });
            });

            describe('when behind child is non-interactive', () =>
            {
                it('should callback parent and front child when clicking front child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                });

                it('should callback parent and front child when clicking overlap', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.frontChildCallback).toHaveBeenCalledOnce();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                });

                it('should callback parent when clicking behind child', () =>
                {
                    const stage = new Container();

                    pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).not.toBeCalled();
                    expect(scene.behindChildCallback).not.toBeCalled();
                    expect(scene.parentCallback).toHaveBeenCalledOnce();
                });
            });
        });

        it('Semi-complicated nesting with overlap, should not call behind callback', () =>
        {
            const stage = new Container();
            const frontParent = new Container();
            const frontChild = new Graphics();
            const behindParent = new Container();
            const subParent = new Container();
            const behindChild = new Graphics();
            const behindCallback = jest.fn(function behindSpy() { /* no op*/ });
            const frontCallback = jest.fn(function frontSpy() { /* no op*/ });

            behindChild.beginFill(0xFF);
            behindChild.drawRect(0, 0, 50, 50);
            subParent.on('click', behindCallback);

            frontChild.beginFill(0x00FF);
            frontChild.drawRect(0, 0, 50, 50);
            frontParent.on('click', frontCallback);
            pointer = new MockPointer(stage);

            behindParent.x = 25;
            subParent.interactive = true;
            frontParent.interactive = true;

            behindParent.addChild(subParent);
            subParent.addChild(behindChild);
            stage.addChild(behindParent);
            frontParent.addChild(frontChild);
            stage.addChild(frontParent);

            pointer.click(40, 10);

            expect(behindCallback).not.toBeCalled();
            expect(frontCallback).toHaveBeenCalledOnce();
        });
    });

    describe('masks', () =>
    {
        it('should trigger interaction callback when no mask present', () =>
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.beginFill();
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = mask;

            pointer.click(10, 10);

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should trigger interaction callback when mask uses beginFill', () =>
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.beginFill();
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = mask;

            pointer.click(10, 10);

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should trigger interaction callback on child when inside of parents mask', () =>
        {
            const stage = new Container();
            const parent = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(parent);
            parent.addChild(graphics);
            mask.beginFill();
            mask.drawRect(0, 0, 25, 25);
            parent.mask = mask;

            pointer.click(10, 10);

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should not trigger interaction callback on child when outside of parents mask', () =>
        {
            const stage = new Container();
            const parent = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(parent);
            parent.addChild(graphics);
            mask.beginFill();
            mask.drawRect(0, 0, 25, 25);
            parent.mask = mask;

            pointer.click(30, 30);

            expect(spy).not.toBeCalledTimes(1);
        });

        it('should not trigger interaction callback when mask doesn\'t use beginFill', () =>
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = mask;

            pointer.click(10, 10);

            expect(spy).not.toBeCalled();
        });

        it('should trigger interaction callback when mask doesn\'t use beginFill but hitArea is defined', () =>
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.hitArea = new Rectangle(0, 0, 50, 50);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = mask;

            pointer.click(10, 10);

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should trigger interaction callback when mask is a sprite', () =>
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = new Sprite(mask.generateCanvasTexture() as Texture);

            pointer.click(10, 10);

            expect(spy).toHaveBeenCalledOnce();
        });
    });

    describe('hitArea', () =>
    {
        it('should trigger interaction callback when within hitArea', () =>
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            graphics.hitArea = new Rectangle(0, 0, 25, 25);

            pointer.click(10, 10);

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should not trigger interaction callback when not within hitArea', () =>
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            graphics.hitArea = new Rectangle(0, 0, 25, 25);

            pointer.click(30, 30);

            expect(spy).not.toBeCalledTimes(1);
        });

        it('should trigger interaction callback on child when inside of parents hitArea', () =>
        {
            const stage = new Container();
            const parent = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(parent);
            parent.addChild(graphics);
            parent.hitArea = new Rectangle(0, 0, 25, 25);

            pointer.click(10, 10);

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should not trigger interaction callback on child when outside of parents hitArea', () =>
        {
            const stage = new Container();
            const parent = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const spy = jest.fn();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(parent);
            parent.addChild(graphics);
            parent.hitArea = new Rectangle(0, 0, 25, 25);

            pointer.click(30, 30);

            expect(spy).not.toBeCalledTimes(1);
        });
    });

    describe('cursor changes', () =>
    {
        it('cursor should be the cursor of interactive item', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = 'help';

            pointer.mousemove(10, 10);

            expect(pointer.renderer.view.style.cursor).toEqual('help');
        });

        it('should return cursor to default on mouseout', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = 'help';

            pointer.mousemove(10, 10);
            pointer.mousemove(60, 60);

            expect(pointer.renderer.view.style.cursor).toEqual(pointer.interaction.cursorStyles.default);
        });

        it('should still be the over cursor after a click', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = 'help';

            pointer.mousemove(10, 10);
            pointer.click(10, 10);

            expect(pointer.renderer.view.style.cursor).toEqual('help');
        });

        it('should return cursor to default when mouse leaves renderer', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = 'help';

            pointer.mousemove(10, 10);
            pointer.mousemove(-10, 60);

            expect(pointer.renderer.view.style.cursor).toEqual(pointer.interaction.cursorStyles.default);
        });

        it('cursor callback should be called', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const overSpy = jest.fn();
            const defaultSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = overSpy;
            pointer.interaction.cursorStyles.default = defaultSpy;

            pointer.mousemove(10, 10);
            pointer.mousemove(60, 60);

            expect(overSpy).toBeCalled();
            expect(defaultSpy).toBeCalled();
        });

        it('cursor callback should only be called if the cursor actually changed', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const defaultSpy = jest.fn();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = null;
            pointer.interaction.cursorStyles.default = defaultSpy;

            pointer.mousemove(10, 10);
            pointer.mousemove(20, 20);

            expect(defaultSpy).toHaveBeenCalledOnce();
        });

        it('cursor style object should be fully applied', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = {
                cursor: 'none',
                display: 'none',
            };

            pointer.mousemove(10, 10);

            expect(pointer.renderer.view.style.cursor).toEqual('none');
            expect(pointer.renderer.view.style.display).toEqual('none');
        });

        it('should not change cursor style if null cursor style provided', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'pointer';
            pointer.interaction.cursorStyles.pointer = null;
            pointer.interaction.cursorStyles.default = null;

            pointer.mousemove(10, 10);
            expect(pointer.renderer.view.style.cursor).toEqual('');

            pointer.mousemove(60, 60);
            expect(pointer.renderer.view.style.cursor).toEqual('');
        });

        it('should use cursor property as css if no style entry', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'text';

            pointer.mousemove(10, 10);
            expect(pointer.renderer.view.style.cursor).toEqual('text');
        });
    });

    describe('recursive hitTesting', () =>
    {
        function getScene()
        {
            const stage = new Container();
            const behindChild = new Graphics();
            const middleChild = new Graphics();
            const frontChild = new Graphics();

            behindChild.beginFill(0xFF);
            behindChild.drawRect(0, 0, 50, 50);

            middleChild.beginFill(0xFF00);
            middleChild.drawRect(0, 0, 50, 50);

            frontChild.beginFill(0xFF0000);
            frontChild.drawRect(0, 0, 50, 50);

            stage.addChild(behindChild, middleChild, frontChild);

            return {
                behindChild,
                middleChild,
                frontChild,
                stage,
            };
        }

        describe('when frontChild is interactive', () =>
        {
            it('should stop hitTesting after first hit', () =>
            {
                const scene = getScene();

                pointer = new MockPointer(scene.stage);
                const frontHitTest = jest.spyOn(scene.frontChild, 'containsPoint');
                const middleHitTest = jest.spyOn(scene.middleChild, 'containsPoint');
                const behindHitTest = jest.spyOn(scene.behindChild, 'containsPoint');

                scene.frontChild.interactive = true;
                scene.middleChild.interactive = true;
                scene.behindChild.interactive = true;

                pointer.mousedown(25, 25);

                expect(frontHitTest).toHaveBeenCalledOnce();
                expect(middleHitTest).not.toBeCalled();
                expect(behindHitTest).not.toBeCalled();
            });
        });

        describe('when frontChild is not interactive', () =>
        {
            it('should stop hitTesting after first hit', () =>
            {
                const scene = getScene();

                pointer = new MockPointer(scene.stage);
                const frontHitTest = jest.spyOn(scene.frontChild, 'containsPoint');
                const middleHitTest = jest.spyOn(scene.middleChild, 'containsPoint');
                const behindHitTest = jest.spyOn(scene.behindChild, 'containsPoint');

                scene.frontChild.interactive = false;
                scene.middleChild.interactive = true;
                scene.behindChild.interactive = true;

                pointer.mousedown(25, 25);

                expect(frontHitTest).not.toBeCalled();
                expect(middleHitTest).toHaveBeenCalledOnce();
                expect(behindHitTest).not.toBeCalled();
            });
        });
    });

    describe('pointer handling', () =>
    {
        it('pointer event from mouse should use single mouse data', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage, 100, 100, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.mousemove(20, 10, true);

            expect(pointer.interaction.mouse.global.x).toEqual(20);
            expect(pointer.interaction.mouse.global.y).toEqual(10);
        });
    });

    describe('data cleanup', () =>
    {
        it('touchleave after touchout should not orphan data', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.touchstart(10, 10, 42);
            expect(pointer.interaction.activeInteractionData[42]).toBeDefined();
            pointer.touchend(10, 10, 42);
            expect(pointer.interaction.activeInteractionData[42]).toBeUndefined();
            pointer.touchleave(10, 10, 42);
            expect(pointer.interaction.activeInteractionData[42]).toBeUndefined();
        });
    });

    describe('hitTest()', () =>
    {
        it('should return hit', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new Point(10, 10));

            expect(hit).toEqual(graphics);
        });

        it('should return null if not hit', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new Point(60, 60));

            expect(hit).toBeNull();
        });

        it('should return top thing that was hit', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const behind = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(behind);
            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            behind.beginFill(0xFFFFFF);
            behind.drawRect(0, 0, 50, 50);
            behind.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new Point(10, 10));

            expect(hit).toEqual(graphics);
        });

        it('should return hit when passing in root', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const behind = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(behind);
            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            behind.beginFill(0xFFFFFF);
            behind.drawRect(0, 0, 50, 50);
            behind.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new Point(10, 10), behind);

            expect(hit).toEqual(behind);
        });
    });

    describe('InteractionData properties', () =>
    {
        it('isPrimary should be set for first touch only', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();

            pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.touchstart(10, 10, 1);
            expect(pointer.interaction.activeInteractionData[1]).toBeDefined();
            // 'first touch should be primary on touch start'
            expect(pointer.interaction.activeInteractionData[1].isPrimary).toBe(true);
            pointer.touchstart(13, 9, 2);
            // 'second touch should not be primary'
            expect(pointer.interaction.activeInteractionData[2].isPrimary).toBe(false);
            pointer.touchmove(10, 20, 1);
            // 'first touch should still be primary after move'
            expect(pointer.interaction.activeInteractionData[1].isPrimary).toBe(true);
            pointer.touchend(10, 10, 1);
            pointer.touchmove(13, 29, 2);
            'second touch should still not be primary after first is done';
            expect(pointer.interaction.activeInteractionData[2].isPrimary).toBe(false);
        });
    });

    describe('mouse events from pens', () =>
    {
        it('should call mousedown handler', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = jest.fn();

            pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mousedown', eventSpy);

            pointer.pendown(10, 10);

            expect(eventSpy).toHaveBeenCalledOnce();
        });

        it('should call mousemove handler', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = jest.fn();

            pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mousemove', eventSpy);

            pointer.penmove(10, 10);

            expect(eventSpy).toHaveBeenCalledOnce();
        });

        it('should call mouseup handler', () =>
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = jest.fn();

            pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseup', eventSpy);

            pointer.penup(10, 10);

            expect(eventSpy).toHaveBeenCalledOnce();
        });
    });
});
