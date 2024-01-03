import { Rectangle, Renderer } from '@pixi/core';
import { Container } from '@pixi/display';
// eslint-disable-next-line import/no-duplicates
import { EventSystem } from '@pixi/events';
import { Graphics } from '@pixi/graphics';
// eslint-disable-next-line import/no-duplicates
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

function createScene(nested = true)
{
    const stage = new Container();
    const graphics = stage.addChild(
        new Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, 50, 50)
    );

    if (nested)
    {
        const a = new Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, 50, 50);
        const b = new Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, 50, 50);
        const c = new Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, 50, 50);
        const d = new Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, 50, 50);
        const e = new Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, 50, 50);

        a.addChild(b);
        b.addChild(c);
        c.addChild(d);
        c.addChild(e);

        a.position.set(50, 50);
        b.position.set(50, 50);
        c.position.set(50, 50);
        d.position.set(50, 50);
        e.position.set(110, 50);

        graphics.addChild(a);
        graphics.interactive = a.interactive = b.interactive = c.interactive = d.interactive = e.interactive = true;

        return [stage, graphics, a, b, c, d, e];
    }

    graphics.interactive = true;

    return [stage, graphics];
}
class CustomElement extends HTMLElement
{
    static tagName = 'custom-element';
    view = document.createElement('canvas');
    constructor()
    {
        super();

        const shadowRoot = this.attachShadow({ mode: 'closed' });

        this.style.display = 'block';
        this.style.margin = '50px';

        shadowRoot.appendChild(this.view);
    }
}

describe('EventSystem', () =>
{
    // Share WebGL context for performance
    const view = document.createElement('canvas');

    customElements.define(CustomElement.tagName, CustomElement);
    const customElement = document.createElement(CustomElement.tagName) as CustomElement;

    document.body.appendChild(customElement);
    const viewInShadowDOM = customElement.view;

    const views = [view, viewInShadowDOM];

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

    const testStaticPointerEvents = (view: HTMLCanvasElement, index: number) =>
    {
        staticPointerEventTests.forEach((event) =>
        {
            const events = Array.isArray(event) ? event : [event];
            const isMouseEvent = events[0].type.startsWith('mouse');
            const isTouchEvent = events[0].type.startsWith('touch');

            it(`should fire ${events[events.length - 1].type}${index === 0 ? '' : ' inside shadowDOM'}`, () =>
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

        if (index === 1)
        {
            customElement.remove();
        }
    };

    views.forEach(testStaticPointerEvents);

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
                clientX: 600,
                clientY: 600,
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

    it('should dispatch synthetic over/out events on pointermove with hitArea', () =>
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

        graphics.hitArea = new Rectangle(0, 0, 50, 50);
        second.hitArea = new Rectangle(100, 0, 50, 50);
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

        graphics.eventMode = 'none';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.eventMode = 'auto';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.eventMode = 'passive';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.eventMode = 'dynamic';

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(2);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(2);

        graphics.eventMode = 'static';

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
        const [stage, graphics] = createScene(false);
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
            eventMode: 'dynamic'
        });

        expect(renderer.options.eventMode).toEqual('dynamic');
        expect(EventSystem.defaultEventMode).toEqual('dynamic');

        const graphics = new Graphics();

        expect(graphics.interactive).toEqual(true);
        expect(graphics.eventMode).toEqual('dynamic');
    });

    it('should use auto for the default interaction when undefined', () =>
    {
        const renderer = new Renderer({
            width: 100,
            height: 100,
        });

        expect(renderer.options.eventMode).toBeUndefined();
        expect(EventSystem.defaultEventMode).toEqual('auto');

        const graphics = new Graphics();

        expect(graphics.interactive).toEqual(false);
        expect(graphics.eventMode).toEqual('auto');
    });

    it('should provide the correct global pointer event', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();

        graphics.position.set(35, 35);
        renderer.render(stage);

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', {
                clientX: 40,
                clientY: 40,
                pointerType: 'mouse',
            })
        );

        const e = (renderer.events as EventSystem).pointer;

        expect(e.global.x).toEqual(40);
        expect(e.global.y).toEqual(40);
        expect(e.getLocalPosition(graphics).x).toEqual(5);
        expect(e.getLocalPosition(graphics).y).toEqual(5);
    });

    it('should not dispatch events if the feature is turned off', () =>
    {
        const renderer = createRenderer(undefined, undefined, {
            eventFeatures: {
                click: false,
                move: false,
                wheel: false,
                globalMove: false,
            }
        });
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        graphics.addEventListener('pointertap', () =>
        {
            eventSpy();
        });
        graphics.addEventListener('pointerup', () =>
        {
            eventSpy();
        });
        graphics.addEventListener('pointerupoutside', () =>
        {
            eventSpy();
        });
        graphics.addEventListener('pointerdown', () =>
        {
            eventSpy();
        });
        graphics.addEventListener('pointermove', () =>
        {
            eventSpy();
        });
        graphics.addEventListener('globalpointermove', () =>
        {
            eventSpy();
        });

        renderer.events.onPointerDown(
            new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
        );

        expect(eventSpy).not.toHaveBeenCalled();

        (renderer.events as EventSystem).features.move = true;

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(1);

        (renderer.events as EventSystem).features.globalMove = true;

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should dispatch global pointer move event with custom hitArea', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        graphics.hitArea = new Rectangle(0, 0, 100, 100);

        graphics.addEventListener('globalpointermove', () =>
        {
            eventSpy();
        });

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 250, clientY: 250 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    it('should dispatch global pointer over/out event with custom hitArea', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        graphics.hitArea = new Rectangle(0, 0, 50, 50);
        graphics.addEventListener('pointerover', () =>
        {
            eventSpy();
        });
        graphics.addEventListener('pointerout', () =>
        {
            eventSpy();
        });

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 75, clientY: 25 })
        );
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should dispatch global pointer over/out event with a mask', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        const mask = new Graphics().beginFill(0xffffff).drawRect(0, 0, 10, 10);

        stage.addChild(mask);
        graphics.interactive = true;
        graphics.mask = mask;
        graphics.on('pointerover', () => eventSpy());
        graphics.on('pointerout', () => eventSpy());

        // mask is 25x25, so this should not be inside
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 5 })
        );
        // this is inside
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 5, clientY: 5 })
        );
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 75, clientY: 5 })
        );
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 5, clientY: 5 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should dispatch pointer over/out event with a mask and hitArea', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        const mask = new Graphics().beginFill(0xffffff).drawRect(0, 0, 25, 25);

        graphics.hitArea = new Rectangle(10, 0, 50, 50);

        stage.addChild(mask);
        graphics.interactive = true;
        graphics.mask = mask;
        graphics.on('pointerover', () => eventSpy());
        graphics.on('pointerout', () => eventSpy());

        // this is inside the hitArea, but outside the mask so should not fire
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 26, clientY: 5 })
        );
        // this is inside the mask, but not the hitArea so should not fire
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 5, clientY: 5 })
        );
        // this is inside the mask and hitArea so should fire
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 15, clientY: 5 })
        );
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 75, clientY: 5 })
        );
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 15, clientY: 5 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should dispatch pointer over/out event with a mask and hitArea on its children', () =>
    {
        const renderer = createRenderer();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [stage, graphics, _a, _b, _c, _d, e] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        const mask = new Graphics().beginFill(0xffffff).drawRect(0, 0, 25, 25);

        graphics.hitArea = new Rectangle(10, 0, 50, 50);

        stage.addChild(mask);
        graphics.interactive = true;
        graphics.mask = mask;
        graphics.on('pointerover', () => eventSpy());
        graphics.on('pointerout', () => eventSpy());

        const position = e.parent.toGlobal(e.position);

        // this is inside the hitArea, but outside the mask so should not fire
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 26, clientY: 5 })
        );
        // this is outside the hitArea but over a child, so it still should not fire
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: position.x + 5, clientY: position.y + 5 })
        );
        // this is inside the mask, but not the hitArea so should not fire
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 5, clientY: 5 })
        );
        // this is inside the mask and hitArea so should fire
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 15, clientY: 5 })
        );
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 75, clientY: 5 })
        );
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 15, clientY: 5 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should dispatch global pointer move event with mask', () =>
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        const mask = new Graphics().beginFill(0xffffff).drawRect(0, 0, 10, 10);

        stage.addChild(mask);

        graphics.mask = mask;

        graphics.addEventListener('globalpointermove', () =>
        {
            eventSpy();
        });

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 250, clientY: 250 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(1);
    });
});
