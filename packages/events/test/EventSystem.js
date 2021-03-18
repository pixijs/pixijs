const { Renderer } = require('../../core');
const { Container } = require('@pixi/display');
const { EventSystem } = require('../');
const { Graphics } = require('../../graphics');
const { expect } = require('chai');

function createRenderer(view, supportsPointerEvents)
{
    const renderer = Renderer.create({
        width: 100,
        height: 100,
        view,
    });

    if (!renderer.events)
    {
        renderer.addSystem(EventSystem, 'events');
    }

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

describe('PIXI.EventSystem', function ()
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
    ];

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

        it(`should fire ${events[events.length - 1].type}`, function ()
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

                const eventSpy = sinon.spy();
                const handler = handlers[native || type];

                graphics.on(type, function testEvent(e)
                {
                    expect(e.nativeEvent.clientX).to.equal(clientX);
                    expect(e.nativeEvent.clientY).to.equal(clientY);
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
                                isPrimary: true,
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

                expect(eventSpy).to.have.been.calledOnce;
            });
        });
    });

    it('should manage the CSS cursor', function ()
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

        expect(renderer.view.style.cursor).to.equal('copy');

        const eventSpy = sinon.spy();

        graphics.on('mousemove', eventSpy);
        renderer.events.onPointerMove(
            new PointerEvent('pointermove', {
                clientX: 60,
                clientY: 60,
                pointerType: 'mouse',
            })
        );

        expect(eventSpy).to.not.have.been.called;
        expect(renderer.view.style.cursor).to.equal('inherit');
    });

    it('should dispatch synthetic over/out events on pointermove', function ()
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

        const primaryOverSpy = sinon.spy();
        const primaryOutSpy = sinon.spy();
        const primaryMoveSpy = sinon.spy();

        let callCount = 0;

        graphics.on('pointerover', function ()
        {
            expect(callCount).to.equal(0);
            primaryOverSpy();
            ++callCount;
        });
        graphics.on('pointermove', function ()
        {
            expect(callCount).to.equal(1);
            primaryMoveSpy();
            ++callCount;
        });
        graphics.on('pointerout', function ()
        {
            expect(callCount).to.equal(2);
            primaryOutSpy();
            ++callCount;
        });

        const secondaryOverSpy = sinon.spy();
        const secondaryOutSpy = sinon.spy();
        const secondaryMoveSpy = sinon.spy();

        second.on('pointerover', function ()
        {
            expect(callCount).to.equal(3);
            secondaryOverSpy();
            ++callCount;
        });
        second.on('pointerout', secondaryOutSpy);
        second.on('pointermove', function ()
        {
            expect(callCount).to.equal(4);
            secondaryMoveSpy();
            ++callCount;
        });

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 25, clientY: 25 })
        );
        expect(primaryOverSpy).to.have.been.calledOnce;
        expect(primaryMoveSpy).to.have.been.calledOnce;

        renderer.events.onPointerMove(
            new PointerEvent('pointermove', { clientX: 125, clientY: 25 })
        );
        expect(primaryOutSpy).to.have.been.calledOnce;
        expect(secondaryOverSpy).to.have.been.calledOnce;
        expect(secondaryMoveSpy).to.have.been.calledOnce;
        expect(secondaryOutSpy).to.not.have.been.calledOnce;
    });

    it('should dispatch click events', function ()
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = sinon.spy();

        renderer.render(stage);

        graphics.addEventListener('pointertap', function (e)
        {
            expect(e.type).to.equal('click');
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

        expect(eventSpy).to.have.been.calledOnce;
    });

    it('should set the detail of click events to the click count', function (done)
    {
        const renderer = createRenderer();
        const [stage, graphics] = createScene();
        const eventSpy = sinon.spy();
        let clickCount = 0;

        renderer.render(stage);

        graphics.addEventListener('pointertap', function (e)
        {
            ++clickCount;
            expect(e.detail).to.equal(clickCount);
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

        expect(eventSpy).to.have.been.calledThrice;

        graphics.removeAllListeners();

        const newSpy = sinon.spy();

        graphics.addEventListener('pointertap', function (e)
        {
            expect(e.detail).to.equal(1);
            newSpy();
        });

        setTimeout(function ()
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

            expect(newSpy).to.have.been.calledOnce;
            done();
        }, 800);
    });
});
