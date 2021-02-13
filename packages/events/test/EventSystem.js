const { Renderer } = require('@pixi/core');
const { Container } = require('@pixi/display');
const { EventSystem } = require('../');
const { Graphics } = require('@pixi/graphics');
const { expect } = require('chai');

function createRenderer(view, supportsPointerEvents)
{
    const renderer = Renderer.create({
        width: 100,
        height: 100,
        view,
    });

    renderer.addSystem(EventSystem, 'events');

    if (supportsPointerEvents === false)
    {
        renderer.events.removeEvents();
        renderer.events.supportsPointerEvents = false;
        renderer.events.setTargetElement(renderer.view);
    }

    return renderer;
}

describe.only('PIXI.EventSystem', function ()
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
        /* touch-even */
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
});
