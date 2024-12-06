import { setTimeout } from 'timers/promises';
import '~/scene/graphics/init';
import { EventSystem } from '../EventSystem';
import '../init';
import { getApp, getWebGLRenderer } from '@test-utils';
import { Rectangle } from '~/maths';
import { Container, Graphics } from '~/scene';

import type { RendererOptions } from '~/rendering';

async function createRenderer(
    canvas?: HTMLCanvasElement,
    supportsPointerEvents?: boolean,
    rendererOptions: Partial<RendererOptions> = {}
)
{
    const renderer = await getWebGLRenderer({
        width: 100,
        height: 100,
        canvas,
        ...rendererOptions,
    });

    if (supportsPointerEvents === false)
    {
        // todo: keep these props
        renderer.events['_removeEvents']();
        (renderer.events as any).supportsPointerEvents = false;
        renderer.events.setTargetElement(renderer.canvas);
    }

    (renderer.events as any).supportsTouchEvents = true;

    return renderer; // todo: case with eventMode
}

function createScene(nested = true)
{
    const stage = new Container();
    const graphics = stage.addChild(
        new Graphics()
            .beginPath()
            .rect(0, 0, 50, 50)
            .fill(0xFFFFFF)
            .closePath()
    );

    if (nested)
    {
        const a = new Graphics()
            .beginPath()
            .rect(0, 0, 50, 50)
            .fill(0xFFFFFF)
            .closePath();
        const b = new Graphics()
            .beginPath()
            .rect(0, 0, 50, 50)
            .fill(0xFFFFFF)
            .closePath();
        const c = new Graphics()
            .beginPath()
            .rect(0, 0, 50, 50)
            .fill(0xFFFFFF)
            .closePath();
        const d = new Graphics()
            .beginPath()
            .rect(0, 0, 50, 50)
            .fill(0xFFFFFF)
            .closePath();
        const e = new Graphics()
            .beginPath()
            .rect(0, 0, 50, 50)
            .fill(0xFFFFFF)
            .closePath();

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
        // eslint-disable-next-line jest/expect-expect
        super();

        // eslint-disable-next-line jest/expect-expect
        const shadowRoot = this.attachShadow({ mode: 'closed' });

        shadowRoot.appendChild(this.view);
    }

    connectedCallback()
    {
        this.style.display = 'block';
        this.style.margin = '50px';
    }
}

describe('EventSystem', () =>
{
    beforeAll(async () =>
    {
        await getApp();
    });

    // Share WebGL context for performance
    const view = document.createElement('canvas');

    customElements.define(CustomElement.tagName, CustomElement);
    const customElement = document.createElement(CustomElement.tagName) as CustomElement;

    document.body.appendChild(customElement);
    const viewInShadowDOM = customElement.view;

    type ViewType = { view: HTMLCanvasElement, toString(): string };
    const views: ViewType[] = [
        { view, toString() { return 'view'; } },
        { view: viewInShadowDOM, toString() { return 'viewInShadowDOM'; } }
    ];

    // Test each event(s) and ensure they are emitted at the event target.
    type StaticPointerEventTest = {
        type: string;
        clientX?: number;
        clientY?: number;
        native?: string;
    } | Array<{
        type: string;
        clientX?: number;
        clientY?: number;
        native?: string;
    }>;

    const staticPointerEventTests: StaticPointerEventTest[] = [
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

    // add toString to each event for better test names
    staticPointerEventTests.forEach(
        // eslint-disable-next-line no-return-assign
        (event) => (event as any).toString
            = () => (Array.isArray(event)
                ? event.map((a) => a.type).join(',')
                : event.type)
    );

    // Maps native event types to their listeners on EventSystem.
    const handlers = {
        pointerdown: '_onPointerDown',
        pointermove: '_onPointerMove',
        pointerup: '_onPointerUp',
        pointerover: '_onPointerOverOut',
        pointerleave: '_onPointerOverOut',
        mousedown: '_onPointerDown',
        mousemove: '_onPointerMove',
        mouseup: '_onPointerUp',
        mouseover: '_onPointerOverOut',
        mouseout: '_onPointerOverOut',
        touchstart: '_onPointerDown',
        touchmove: '_onPointerMove',
        touchend: '_onPointerUp',
    };

    describe.each(views)('Static Pointer Event for %s', ({ view }) =>
    {
        afterAll(() =>
        {
            customElement.remove();
        });

        it.each(staticPointerEventTests)('Pointer Event %s', async (event) =>
        {
            const events = Array.isArray(event) ? event : [event];
            // eslint-disable-next-line jest/expect-expect
            const isMouseEvent = events[0].type.startsWith('mouse');
            // eslint-disable-next-line jest/expect-expect
            const isTouchEvent = events[0].type.startsWith('touch');

            const renderer = await createRenderer(view, isMouseEvent);
            const stage = new Container();
            const graphics = new Graphics();

            stage.addChild(graphics);
            graphics
                .beginPath()
                .rect(0, 0, 50, 50)
                .fill(0xFFFFFF)
                .closePath();
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
                                target: renderer.canvas as EventTarget,
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

                // eslint-disable-next-line jest/expect-expect
                (renderer.events as any)[handler](event);

                expect(eventSpy).toHaveBeenCalledOnce();
            });
        });
    });

    it('should manage the CSS cursor', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();

        renderer.render(stage);
        graphics.cursor = 'copy';

        renderer.events['_onPointerMove']( // <-- v8 equivalent?
            new PointerEvent('pointermove', {
                clientX: 40,
                clientY: 40,
                pointerType: 'mouse',
            })
        );

        expect(renderer.canvas.style.cursor).toEqual('copy');

        const eventSpy = jest.fn();

        graphics.on('mousemove', eventSpy);
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', {
                clientX: 600,
                clientY: 600,
                pointerType: 'mouse',
            })
        );

        expect(eventSpy).not.toHaveBeenCalled();
        expect(renderer.canvas.style.cursor).toEqual('inherit');
    });

    // eslint-disable-next-line jest/no-done-callback
    it('should provide the correct global position', async (done) =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();

        graphics.position.set(35, 35);
        renderer.render(stage);

        graphics.on('pointermove', (e) =>
        {
            expect(e.global.x).toEqual(40);
            expect(e.global.y).toEqual(40);
            expect(e.getLocalPosition(graphics).x).toEqual(5);
            expect(e.getLocalPosition(graphics).y).toEqual(5);

            done();
        });

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', {
                clientX: 40,
                clientY: 40,
                pointerType: 'mouse',
            })
        );
    });

    it('should dispatch synthetic over/out events on pointermove', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const second = stage.addChild(
            new Graphics()
                .beginPath()
                .rect(100, 0, 50, 50)
                .fill(0xFFFFFF)
                .closePath()
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

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryOverSpy).toHaveBeenCalledOnce();
        expect(primaryMoveSpy).toHaveBeenCalledOnce();
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 125, clientY: 25 })
        );
        expect(primaryOutSpy).toHaveBeenCalledOnce();
        expect(secondaryOverSpy).toHaveBeenCalledOnce();
        expect(secondaryMoveSpy).toHaveBeenCalledOnce();
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(2);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(2);
        expect(secondaryOutSpy).not.toHaveBeenCalledTimes(1);
    });

    it('should dispatch synthetic over/out events on pointermove with hitArea', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const second = stage.addChild(
            new Graphics()
                .beginPath()
                .rect(100, 0, 50, 50)
                .fill(0xFFFFFF)
                .closePath()
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

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryOverSpy).toHaveBeenCalledOnce();
        expect(primaryMoveSpy).toHaveBeenCalledOnce();
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 125, clientY: 25 })
        );
        expect(primaryOutSpy).toHaveBeenCalledOnce();
        expect(secondaryOverSpy).toHaveBeenCalledOnce();
        expect(secondaryMoveSpy).toHaveBeenCalledOnce();
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(2);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(2);
        expect(secondaryOutSpy).not.toHaveBeenCalledTimes(1);
    });

    it('should not dispatch pointer events if not interactive', async () =>
    {
        const renderer = await createRenderer();
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

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).not.toHaveBeenCalled();
        expect(primaryMoveGlobalSpy).not.toHaveBeenCalled();

        graphics.interactive = true;

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.eventMode = 'none';

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.eventMode = 'auto';

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.eventMode = 'passive';

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        graphics.eventMode = 'dynamic';

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(2);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(2);

        graphics.eventMode = 'static';

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(3);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(3);

        // add a second graphics object
        const second = graphics.addChild(
            new Graphics()
                .beginPath()
                .rect(0, 0, 50, 50)
                .fill(0xFFFFFF)
                .closePath()
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

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(3);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(3);
        expect(secondaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(1);

        // nothing should be called again
        graphics.interactiveChildren = false;
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryMoveSpy).toHaveBeenCalledTimes(3);
        expect(primaryMoveGlobalSpy).toHaveBeenCalledTimes(3);
        expect(secondaryMoveSpy).toHaveBeenCalledTimes(1);
        expect(secondaryMoveGlobalSpy).toHaveBeenCalledTimes(1);
    });

    it('should dispatch click events', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        graphics.addEventListener('pointertap', (e) =>
        {
            expect(e.type).toEqual('click');
            eventSpy();
        });

        renderer.events['_onPointerDown'](
            new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
        );
        const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

        // so it isn't a pointerupoutside
        Object.defineProperty(e, 'target', {
            writable: false,
            value: renderer.canvas
        });
        renderer.events['_onPointerUp'](e);

        expect(eventSpy).toHaveBeenCalledOnce();
    });

    // eslint-disable-next-line jest/no-done-callback
    it('should set the detail of click events to the click count', async (done) =>
    {
        const renderer = await createRenderer();
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
            renderer.events['_onPointerDown'](
                new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
            );
            const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

            // so it isn't a pointerupoutside
            Object.defineProperty(e, 'target', {
                writable: false,
                value: renderer.canvas
            });
            renderer.events['_onPointerUp'](e);
        }

        expect(eventSpy).toHaveBeenCalledTimes(3);

        graphics.removeAllListeners();

        const newSpy = jest.fn();

        graphics.addEventListener('pointertap', (e) =>
        {
            expect((e as PointerEvent).detail).toEqual(1);
            newSpy();
        });

        await setTimeout(800);

        renderer.events['_onPointerDown'](
            new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
        );
        const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

        // so it isn't a pointerupoutside
        Object.defineProperty(e, 'target', {
            writable: false,
            value: renderer.canvas
        });
        renderer.events['_onPointerUp'](e);

        expect(newSpy).toHaveBeenCalledOnce();
        done();
    });

    it('should inherit resolution changes', async () =>
    {
        const renderer = await createRenderer();

        renderer.resolution = 2;

        expect(renderer.resolution).toEqual(2);
        expect(renderer.events.resolution).toEqual(2);

        renderer.resolution = 1;

        expect(renderer.resolution).toEqual(1);
        expect(renderer.events.resolution).toEqual(1);
    });

    it('should set the default interaction state', async () =>
    {
        const renderer = await createRenderer(undefined, undefined, {
            width: 100,
            height: 100,
            eventMode: 'dynamic'
        });

        expect(renderer['_initOptions'].eventMode).toEqual('dynamic');
        expect(EventSystem.defaultEventMode).toEqual('dynamic');

        const graphics = new Graphics();

        expect(graphics.interactive).toEqual(true);
        expect(graphics.eventMode).toEqual('dynamic');
    });

    it('should use passive for the default interaction when undefined', async () =>
    {
        const renderer = await createRenderer(undefined, undefined, {
            width: 100,
            height: 100,
        });

        expect(renderer['_initOptions'].eventMode).toBeUndefined();
        expect(EventSystem.defaultEventMode).toEqual('passive');

        const graphics = new Graphics();

        expect(graphics.interactive).toEqual(false);
        expect(graphics.eventMode).toEqual('passive');
    });

    it('should provide the correct global pointer event', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();

        graphics.position.set(35, 35);
        renderer.render(stage);

        renderer.events['_onPointerMove'](
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

    it('should not dispatch events if the feature is turned off', async () =>
    {
        const renderer = await createRenderer(undefined, undefined, {
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

        graphics.addEventListener('pointertap', eventSpy);
        graphics.addEventListener('pointerup', eventSpy);
        graphics.addEventListener('pointerupoutside', eventSpy);
        graphics.addEventListener('pointerdown', eventSpy);
        graphics.addEventListener('pointermove', eventSpy);
        graphics.addEventListener('globalpointermove', eventSpy);

        renderer.events['_onPointerDown'](
            new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
        );

        expect(eventSpy).not.toHaveBeenCalled();

        (renderer.events as EventSystem).features.move = true;

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(1);

        (renderer.events as EventSystem).features.globalMove = true;

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should dispatch global pointer move event with custom hitArea', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        graphics.hitArea = new Rectangle(0, 0, 100, 100);

        graphics.addEventListener('globalpointermove', () =>
        {
            eventSpy();
        });

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 250, clientY: 250 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    it('should dispatch global pointer over/out event with custom hitArea', async () =>
    {
        const renderer = await createRenderer();
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

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 75, clientY: 25 })
        );
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should dispatch global pointer over/out event with a mask', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        const mask = new Graphics()
            .beginPath()
            .rect(0, 0, 10, 10)
            .fill(0xffffff)
            .closePath();

        stage.addChild(mask);
        graphics.interactive = true;
        graphics.mask = mask;
        graphics.on('pointerover', eventSpy);
        graphics.on('pointerout', eventSpy);

        // mask is 25x25, so this should not be inside
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 25, clientY: 5 })
        );
        // this is inside
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 5, clientY: 5 })
        );
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 75, clientY: 5 })
        );
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 5, clientY: 5 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should dispatch pointer over/out event with a mask and hitArea', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        const mask = new Graphics().beginPath().rect(0, 0, 25, 25).fill(0xffffff)
            .closePath();

        graphics.hitArea = new Rectangle(10, 0, 50, 50);

        stage.addChild(mask);
        graphics.interactive = true;
        graphics.mask = mask;
        graphics.on('pointerover', () => eventSpy());
        graphics.on('pointerout', () => eventSpy());

        // this is inside the hitArea, but outside the mask so should not fire
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 26, clientY: 5 })
        );
        // this is inside the mask, but not the hitArea so should not fire
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 5, clientY: 5 })
        );
        // this is inside the mask and hitArea so should fire
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 15, clientY: 5 })
        );
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 75, clientY: 5 })
        );
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 15, clientY: 5 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should inherit the resolution from renderer with resolution set', async () =>
    {
        const renderer = await createRenderer(undefined, undefined, {
            resolution: 0.5,
        });

        expect(renderer.resolution).toEqual(0.5);
        expect(renderer.events.resolution).toEqual(0.5);

        renderer.resolution = 2;

        expect(renderer.resolution).toEqual(2);
        expect(renderer.events.resolution).toEqual(2);
    });

    it('should inherit the resolution from renderer with resize', async () =>
    {
        const renderer = await createRenderer(undefined, undefined, {
            resolution: 0.5,
        });

        expect(renderer.resolution).toEqual(0.5);
        expect(renderer.events.resolution).toEqual(0.5);

        renderer.resize(100, 100, 2);

        expect(renderer.resolution).toEqual(2);
        expect(renderer.events.resolution).toEqual(2);
    });

    it('should dispatch pointer over/out event with a mask and hitArea on its children', async () =>
    {
        const renderer = await createRenderer();

        const [stage, graphics, _a, _b, _c, _d, e] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        const mask = new Graphics().beginPath().rect(0, 0, 25, 25).fill(0xffffff)
            .closePath();

        graphics.hitArea = new Rectangle(10, 0, 50, 50);

        stage.addChild(mask);
        graphics.interactive = true;
        graphics.mask = mask;
        graphics.on('pointerover', () => eventSpy());
        graphics.on('pointerout', () => eventSpy());

        const position = e.parent.toGlobal(e.position);

        // this is inside the hitArea, but outside the mask so should not fire
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 26, clientY: 5 })
        );
        // this is outside the hitArea but over a child, so it still should not fire
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: position.x + 5, clientY: position.y + 5 })
        );
        // this is inside the mask, but not the hitArea so should not fire
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 5, clientY: 5 })
        );
        // this is inside the mask and hitArea so should fire
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 15, clientY: 5 })
        );
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 75, clientY: 5 })
        );
        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 15, clientY: 5 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(3);
    });

    it('should dispatch global pointer move event with mask', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        const mask = new Graphics().beginPath().rect(0, 0, 10, 10).fill(0xffffff)
            .closePath();

        stage.addChild(mask);

        graphics.mask = mask;

        graphics.addEventListener('globalpointermove', () =>
        {
            eventSpy();
        });

        renderer.events['_onPointerMove'](
            new PointerEvent('pointermove', { clientX: 250, clientY: 250 })
        );

        expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    it('should respect \'once\' option', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);

        graphics.addEventListener('pointertap', (e) =>
        {
            expect(e.type).toEqual('click');
            eventSpy();
        }, { once: true });

        const click = () =>
        {
            renderer.events['_onPointerDown'](
                new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
            );
            const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

            // so it isn't a pointerupoutside
            Object.defineProperty(e, 'target', {
                writable: false,
                value: renderer.canvas
            });
            renderer.events['_onPointerUp'](e);
        };

        click(); // Once
        click(); // Twice

        expect(eventSpy).toHaveBeenCalledOnce();
    });

    it('should allow explicit removal of a listener even when the signal option is used', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);
        const controller = new AbortController();

        const listener = (e: Event) =>
        {
            expect(e.type).toEqual('click');
            eventSpy();
        };

        graphics.addEventListener('pointertap', listener, { signal: controller.signal });

        const click = () =>
        {
            renderer.events['_onPointerDown'](
                new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
            );
            const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

            // so it isn't a pointerupoutside
            Object.defineProperty(e, 'target', {
                writable: false,
                value: renderer.canvas
            });
            renderer.events['_onPointerUp'](e);
        };

        click(); // Once
        graphics.removeEventListener('pointertap', listener);
        click(); // Twice
        expect(eventSpy).toHaveBeenCalledOnce();
    });

    it('should respect AbortController signals', async () =>
    {
        const renderer = await createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = jest.fn();

        renderer.render(stage);
        const controller = new AbortController();
        let count = 0;

        graphics.addEventListener('pointertap', (e) =>
        {
            expect(e.type).toEqual('click');
            count += 1;
            if (count >= 2)
            {
                controller.abort();
            }

            eventSpy();
        }, { signal: controller.signal });

        const click = () =>
        {
            renderer.events['_onPointerDown'](
                new PointerEvent('pointerdown', { clientX: 25, clientY: 25 })
            );
            const e = new PointerEvent('pointerup', { clientX: 30, clientY: 20 });

            // so it isn't a pointerupoutside
            Object.defineProperty(e, 'target', {
                writable: false,
                value: renderer.canvas
            });
            renderer.events['_onPointerUp'](e);
        };

        click(); // Once
        click(); // Twice
        click(); // Three times

        expect(eventSpy).toHaveBeenCalledTimes(2);
    });
});
