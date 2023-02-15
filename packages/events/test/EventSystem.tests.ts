import { Renderer } from '@pixi/core';
import { Container } from '@pixi/display';
import { EventSystem } from '@pixi/events';
import { Graphics } from '@pixi/graphics';
// eslint-disable-next-line @typescript-eslint/no-duplicate-imports
import '@pixi/events';

import type { IRendererOptions } from '@pixi/core';

function createRenderer(
    view?: HTMLCanvasElement,
    supportsPointerEvents?: boolean,
    rendererOptions: Partial<IRendererOptions> = {}
)
{
    // TODO: event emitter types do not appear in tests
    interface EERenderer extends Renderer
    {
        events: any
    }

    const renderer = new Renderer({
        width: 100,
        height: 100,
        view,
        ...rendererOptions,
    }) as EERenderer;

    if (supportsPointerEvents === false)
    {
        renderer.events.removeEvents();
        renderer.events.supportsPointerEvents = false;
        renderer.events.setTargetElement(renderer.view);
    }

    renderer.events.supportsTouchEvents = true;

    return renderer;
}

function createScene()
{
    const stage = new Container();
    const graphics = stage.addChild(
        new Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, 50, 50)
    );

    graphics.interactive = true;

    return [stage, graphics];
}

describe('EventSystem', () =>
{
    // Share WebGL context for performance
    const view = document.createElement('canvas');

    // Test each event(s) and ensure they are emitted at the event target.
    const staticPointerEventTests = [
        /* pointer- events */
        { type: 'pointerdown' },
        { type: 'pointermove' },
        [
            { type: 'pointerdown' },
            // pointerupoutside b/c the canvas isn't the event target, regardless of the
            // hit testing.
            { type: 'pointerupoutside', native: 'pointerup' },
        ],
        { type: 'pointerover' },
        [
            { type: 'pointerover' },
            { type: 'pointerout', native: 'pointerleave', clientX: 150, clientY: 150 },
        ],
        /* mouse- events */
        { type: 'mousedown' },
        { type: 'mousemove' },
        [
            { type: 'mousedown' },
            { type: 'mouseupoutside', native: 'mouseup' }
        ],
        { type: 'mouseover' },
        [
            { type: 'mouseover' },
            { type: 'mouseout', clientX: 150, clientY: 150 },
        ],
        { type: 'touchstart' },
        { type: 'touchmove' },
        [
            { type: 'touchstart' },
            { type: 'touchendoutside', native: 'touchend' },
        ]
    ] as Array<{
        type: string;
        clientX?: number;
        clientY?: number;
        native?: string;
    }>;

    // Maps native event types to their listeners on EventSystem.
    const handlers = {
        pointerdown: 'onPointerDown',
        pointermove: 'onPointerMove',
        pointerup: 'onPointerUp',
        pointerover: 'onPointerOverOut',
        pointerleave: 'onPointerOverOut',
        mousedown: 'onPointerDown',
        mousemove: 'onPointerMove',
        mouseup: 'onPointerUp',
        mouseover: 'onPointerOverOut',
        mouseout: 'onPointerOverOut',
        touchstart: 'onPointerDown',
        touchmove: 'onPointerMove',
        touchend: 'onPointerUp',
    };

    staticPointerEventTests.forEach((event) =>
    {
        const events = Array.isArray(event) ? event : [event];
        const isMouseEvent = events[0].type.startsWith('mouse');
        const isTouchEvent = events[0].type.startsWith('touch');

        it(`should fire ${events[events.length - 1].type}`, () =>
        {
            const renderer = createRenderer(view, isMouseEvent);
            const stage = new Container();
            const graphics = new Graphics();

            stage.addChild(graphics);
            graphics
                .beginFill(0xFFFFFF)
                .drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            renderer.render(stage);

            events.forEach(({ native, type, clientX, clientY }) =>
            {
                clientX = clientX || 25;
                clientY = clientY || 25;

                const eventSpy = jest.fn();
                const handler = handlers[(native || type) as keyof typeof handlers];

                graphics.on(type, function testEvent(e)
                {
                    expect(e.nativeEvent.clientX).toEqual(clientX);
                    expect(e.nativeEvent.clientY).toEqual(clientY);
                    eventSpy();
                });

                let event;

                if (!isMouseEvent && !isTouchEvent)
                {
                    event = new PointerEvent(native || type, { clientX, clientY });
                }
                else if (isTouchEvent)
                {
                    event = new TouchEvent(native || type, {
                        changedTouches: [
                            new Touch({
                                identifier: 0,
                                target: renderer.view as EventTarget,
                                clientX,
                                clientY,
                            }),
                        ],
                    });
                }
                else
                {
                    event = new MouseEvent(native || type, { clientX, clientY });
                }

                renderer.events[handler](event);

                expect(eventSpy).toHaveBeenCalledOnce();
            });
        });
    });

    it('should manage the CSS cursor', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();

        renderer.render(stage);
        graphics.cursor = 'copy';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', {
                clientX: 40,
                clientY: 40,
                pointerType: 'mouse',
            })
        );

        expect(renderer.view.style.cursor).toEqual('copy');

        const eventSpy = jest.fn();

        graphics.on('mousemove', eventSpy);
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', {
                clientX: 60,
                clientY: 60,
                pointerType: 'mouse',
            })
        );

        expect(eventSpy).not.toBeCalled();
        expect(renderer.view.style.cursor).toEqual('inherit');
    });

    it('should provide the correct global position', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();

        graphics.position.set(35, 35);
        renderer.render(stage);

        graphics.on('pointermove', (e) =>
        {
            expect(e.global.x).toEqual(40);
            expect(e.global.y).toEqual(40);
            expect(e.getLocalPosition(graphics).x).toEqual(5);
            expect(e.getLocalPosition(graphics).y).toEqual(5);
        });

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', {
                clientX: 40,
                clientY: 40,
                pointerType: 'mouse',
            })
        );
    });

    it('should dispatch synthetic over/out events on pointermove', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const second = stage.addChild(
            new Graphics()
                .beginFill(0xFFFFFF)
                .drawRect(100, 0, 50, 50)
        );

        renderer.render(stage);
        second.interactive = true;

        const primaryOverSpy = jest.fn();
        const primaryOutSpy = jest.fn();
        const primaryMoveSpy = jest.fn();
        const primaryMoveGlobalSpy = jest.fn();

        let callCount = 0;

        graphics.on('pointerover', () =>
        {
            expect(callCount).toEqual(0);
            primaryOverSpy();
            ++callCount;
        });
        graphics.on('pointermove', () =>
        {
            expect(callCount).toEqual(1);
            primaryMoveSpy();
            ++callCount;
        });
        graphics.on('globalpointermove', () =>
        {
            expect([2, 7]).toContain(callCount);
            primaryMoveGlobalSpy();
            ++callCount;
        });
        graphics.on('pointerout', () =>
        {
            expect(callCount).toEqual(4);
            primaryOutSpy();
            ++callCount;
        });

        const secondaryOverSpy = jest.fn();
        const secondaryOutSpy = jest.fn();
        const secondaryMoveSpy = jest.fn();
        const secondaryMoveGlobalSpy = jest.fn();

        second.on('pointerover', () =>
        {
            expect(callCount).toEqual(5);
            secondaryOverSpy();
            ++callCount;
        });
        second.on('pointerout', secondaryOutSpy);
        second.on('pointermove', () =>
        {
            expect(callCount).toEqual(6);
            secondaryMoveSpy();
            ++callCount;
        });
        second.on('globalpointermove', () =>
        {
            expect([3, 8]).toContain(callCount);
            secondaryMoveGlobalSpy();
            ++callCount;
        });

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryOverSpy).toHaveBeenCalledOnce();
        expect(primaryMoveSpy).toHaveBeenCalledOnce();
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 125, clientY: 25 })
        );
        expect(primaryOutSpy).toHaveBeenCalledOnce();
        expect(secondaryOverSpy).toHaveBeenCalledOnce();
        expect(secondaryMoveSpy).toHaveBeenCalledOnce();
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(2);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(2);
        expect(secondaryOutSpy).not.toBeCalledTimes(1);
    });

    it('should not dispatch pointer events if not interactive', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();

        renderer.render(stage);

        const primaryMoveSpy = jest.fn();
        const primaryMoveGlobalSpy = jest.fn();

        graphics.interactive = false;

        graphics.on('pointermove', () =>
        {
            primaryMoveSpy();
        });
        graphics.on('globalpointermove', () =>
        {
            primaryMoveGlobalSpy();
        });

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).not.toHaveBeenCalled();
        expect(primaryMoveGlobalSpy).not.toHaveBeenCalled();

        graphics.interactive = true;

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.interactive = 'none';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.interactive = 'auto';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.interactive = 'passive';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.interactive = 'dynamic';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(2);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(2);

        graphics.interactive = 'static';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(3);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(3);

        // add a second graphics object
        const second = graphics.addChild(
            new Graphics()
                .beginFill(0xFFFFFF)
                .drawRect(0, 0, 50, 50)
        );

        // should be called
        second.interactive = true;
        // should not be called again
        graphics.interactive = false;

        const secondaryMoveSpy = jest.fn();
        const secondaryMoveGlobalSpy = jest.fn();

        second.on('pointermove', () =>
        {
            secondaryMoveSpy();
        });
        second.on('globalpointermove', () =>
        {
            secondaryMoveGlobalSpy();
        });

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(3);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(3);
        expect(secondaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        // nothing should be called again
        graphics.interactiveChildren = false;
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(3);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(3);
        expect(secondaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(1);
    });

    it('should dispatch click events', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        graphics.addEventListener('pointertap', (e) =>
        {
            expect(e.type).toEqual('click');
            eventSpy();
        });

        renderer.events.onPointerDown(
            new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
        );
        const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

        // so it isn't a pointerupoutside
        Object.defineProperty(e, 'target', {
            writable: false,
            value: renderer.view
        });
        renderer.events.onPointerUp(e);

        expect(eventSpy).toHaveBeenCalledOnce();
    });

    it('should set the detail of click events to the click count', (done) =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();
        let clickCount = 0;

        renderer.render(stage);

        graphics.addEventListener('pointertap', (e) =>
        {
            ++clickCount;
            expect((e as PointerEvent).detail).toEqual(clickCount);
            eventSpy();
        });

        for (let i = 0; i < 3; i++)
        {
            renderer.events.onPointerDown(
                new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
            );
            const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

            // so it isn't a pointerupoutside
            Object.defineProperty(e, 'target', {
                writable: false,
                value: renderer.view
            });
            renderer.events.onPointerUp(e);
        }

        expect(eventSpy).toBeCalledTimes(3);

        graphics.removeAllListeners();

        const newSpy = jest.fn();

        graphics.addEventListener('pointertap', (e) =>
        {
            expect((e as PointerEvent).detail).toEqual(1);
            newSpy();
        });

        setTimeout(() =>
        {
            renderer.events.onPointerDown(
                new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
            );
            const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

            // so it isn't a pointerupoutside
            Object.defineProperty(e, 'target', {
                writable: false,
                value: renderer.view
            });
            renderer.events.onPointerUp(e);

            expect(newSpy).toHaveBeenCalledOnce();
            done();
        }, 800);
    });

    it('should inherit resolution changes', () =>
    {
        const renderer = createRenderer();

        renderer.resolution = 2;

        expect(renderer.resolution).toEqual(2);
        expect(renderer.events.resolution).toEqual(2);

        renderer.resolution = 1;

        expect(renderer.resolution).toEqual(1);
        expect(renderer.events.resolution).toEqual(1);
    });

    it('should set the default interaction state', () =>
    {
        const renderer = new Renderer({
            width: 100,
            height: 100,
            defaultInteraction: 'dynamic'
        });

        expect(renderer.options.defaultInteraction).toEqual('dynamic');
        expect(EventSystem.defaultInteraction).toEqual('dynamic');

        const graphics = new Graphics();

        expect(graphics.interactive).toEqual('dynamic');
        expect(graphics._internalInteractive).toEqual('dynamic');
    });
});
