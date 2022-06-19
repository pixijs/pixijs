import { BatchRenderer, extensions, Renderer } from '@pixi/core';
import { Container } from '@pixi/display';
import { EventSystem } from '@pixi/events';
import { Graphics } from '@pixi/graphics';
import sinon from 'sinon';
import { expect } from 'chai';

function createRenderer(view?: HTMLCanvasElement, supportsPointerEvents?: boolean)
{
    // TODO: event emitter types do not appear in tests
    interface EERenderer extends Renderer
    {
        events: any
    }

    const renderer = Renderer.create({
        width: 100,
        height: 100,
        view,
    }) as EERenderer;

    if (!renderer['events'])
    {
        renderer.addSystem(EventSystem, 'events');
    }

    if (supportsPointerEvents === false)
    {
        renderer['events'].removeEvents();
        renderer['events'].supportsPointerEvents = false;
        renderer['events'].setTargetElement(renderer.view);
    }

    renderer['events'].supportsTouchEvents = true;

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
    beforeAll(() => extensions.add(BatchRenderer));
    afterAll(() => extensions.remove(BatchRenderer));

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
                                target: renderer.view,
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

                renderer['events'][handler](event);

                expect(eventSpy).to.have.been.calledOnce;
            });
        });
    });

    it('should manage the CSS cursor', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();

        renderer.render(stage);
        graphics.cursor = 'copy';

        renderer['events'].onPointerMove(
            new PointerEvent('pointermove', {
                clientX: 40,
                clientY: 40,
                pointerType: 'mouse',
            })
        );

        expect(renderer.view.style.cursor).toEqual('copy');

        const eventSpy = jest.fn();

        graphics.on('mousemove', eventSpy);
        renderer['events'].onPointerMove(
            new PointerEvent('pointermove', {
                clientX: 60,
                clientY: 60,
                pointerType: 'mouse',
            })
        );

        expect(eventSpy).to.not.have.been.called;
        expect(renderer.view.style.cursor).toEqual('inherit');
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
        graphics.on('pointerout', () =>
        {
            expect(callCount).toEqual(2);
            primaryOutSpy();
            ++callCount;
        });

        const secondaryOverSpy = jest.fn();
        const secondaryOutSpy = jest.fn();
        const secondaryMoveSpy = jest.fn();

        second.on('pointerover', () =>
        {
            expect(callCount).toEqual(3);
            secondaryOverSpy();
            ++callCount;
        });
        second.on('pointerout', secondaryOutSpy);
        second.on('pointermove', () =>
        {
            expect(callCount).toEqual(4);
            secondaryMoveSpy();
            ++callCount;
        });

        renderer['events'].onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryOverSpy).to.have.been.calledOnce;
        expect(primaryMoveSpy).to.have.been.calledOnce;

        renderer['events'].onPointerMove(
            new PointerEvent('pointermove', { clientX: 125, clientY: 25 })
        );
        expect(primaryOutSpy).to.have.been.calledOnce;
        expect(secondaryOverSpy).to.have.been.calledOnce;
        expect(secondaryMoveSpy).to.have.been.calledOnce;
        expect(secondaryOutSpy).to.not.have.been.calledOnce;
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

        renderer['events'].onPointerDown(
            new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
        );
        const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

        // so it isn't a pointerupoutside
        Object.defineProperty(e, 'target', {
            writable: false,
            value: renderer.view
        });
        renderer['events'].onPointerUp(e);

        expect(eventSpy).to.have.been.calledOnce;
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
            renderer['events'].onPointerDown(
                new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
            );
            const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

            // so it isn't a pointerupoutside
            Object.defineProperty(e, 'target', {
                writable: false,
                value: renderer.view
            });
            renderer['events'].onPointerUp(e);
        }

        expect(eventSpy).to.have.been.calledThrice;

        graphics.removeAllListeners();

        const newSpy = jest.fn();

        graphics.addEventListener('pointertap', (e) =>
        {
            expect((e as PointerEvent).detail).toEqual(1);
            newSpy();
        });

        setTimeout(() =>
        {
            renderer['events'].onPointerDown(
                new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
            );
            const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

            // so it isn't a pointerupoutside
            Object.defineProperty(e, 'target', {
                writable: false,
                value: renderer.view
            });
            renderer['events'].onPointerUp(e);

            expect(newSpy).to.have.been.calledOnce;
            done();
        }, 800);
    });
});
