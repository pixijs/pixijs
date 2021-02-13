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

describe('PIXI.EventSystem', function ()
{
    // Share WebGL context for performance
    const view = document.createElement('canvas');

    // Test each event(s) and ensure they are emitted at the event target.
    const staticPointerEventTests = [
        /* pointer- events */
        { type: 'pointerdown' },
        [
            { type: 'pointerdown' },
            { type: 'pointermove' },
        ],
        [
            { type: 'pointerdown' },
            // pointerupoutside b/c the canvas isn't the event target, regardless of the
            // hit testing.
            { type: 'pointerupoutside', native: 'pointerup' },
        ],
        { type: 'pointerover' },
        [
            { type: 'pointerover' },
            { type: 'pointerleave', clientX: 150, clientY: 150 },
        ]
    ];

    // Maps native event types to their listeners on EventSystem.
    const handlers = {
        pointerdown: 'onPointerDown',
        pointermove: 'onPointerMove',
        pointerup: 'onPointerUp',
        pointerover: 'onPointerOverOut',
        pointerleave: 'onPointerOverOut',
    };

    staticPointerEventTests.forEach((event) =>
    {
        const events = Array.isArray(event) ? event : [event];

        it(`should fire ${events[events.length - 1].type}`, function ()
        {
            const renderer = createRenderer(view);
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

                renderer.events[handler](
                    new PointerEvent(native || type, { clientX, clientY })
                );

                expect(eventSpy).to.have.been.calledOnce;
            });
        });
    });
});
