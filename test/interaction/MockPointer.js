'use strict';

/**
 * Use this to mock mouse/touch/pointer events
 *
 * @class
 */
class MockPointer
{
    /**
     * @param {PIXI.Container} stage - The root of the scene tree
     * @param {number} [width=100] - Width of the renderer
     * @param {number} [height=100] - Height of the renderer
     * @param {boolean} [ensurePointerEvents=false] - If we should make sure that PointerEvents are 'supported'
     */
    constructor(stage, width, height, ensurePointerEvents)
    {
        // fake PointerEvent existing
        if (ensurePointerEvents && !window.PointerEvent)
        {
            window.PointerEvent = class PointerEvent extends MouseEvent
            {
                //eslint-disable-next-line
                constructor(type, opts)
                {
                    super(type, opts);
                    this.pointerType = opts.pointerType;
                }
            };
            this.createdPointerEvent = true;
        }

        this.activeTouches = [];
        this.stage = stage;
        this.renderer = new PIXI.CanvasRenderer(width || 100, height || 100);
        this.renderer.sayHello = () => { /* empty */ };
        this.interaction = this.renderer.plugins.interaction;
        this.interaction.supportsTouchEvents = true;
        PIXI.ticker.shared.remove(this.interaction.update, this.interaction);
    }

    /**
     * Cleans up after tests
     */
    cleanup()
    {
        if (this.createdPointerEvent)
        {
            delete window.PointerEvent;
        }
        this.renderer.destroy();
    }

    /**
     * @private
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     */
    setPosition(x, y)
    {
        this.renderer.plugins.interaction.mapPositionToPoint = (point) =>
        {
            point.x = x;
            point.y = y;
        };
    }

    /**
     * @private
     */
    render()
    {
        this.renderer.render(this.stage);
    }

    /**
     * [createEvent description]
     * @param  {string} eventType  `type` of event
     * @param  {number} x          pointer x position
     * @param  {number} y          pointer y position
     * @param  {number} [identifier] pointer id for touch events
     * @param  {boolean} [asPointer]  If it should be a PointerEvent from a mouse or touch
     * @param  {boolean} [onCanvas=true] If the event should be on the canvas (as opposed to a different element)
     * @return {Event} Generated MouseEvent, TouchEvent, or PointerEvent
     */
    createEvent(eventType, x, y, identifier, asPointer, onCanvas = true)
    {
        let event;

        if (eventType.startsWith('mouse'))
        {
            if (asPointer)
            {
                event = new PointerEvent(eventType.replace('mouse', 'pointer'), {
                    pointerType: 'mouse',
                    clientX: x,
                    clientY: y,
                    preventDefault: sinon.stub(),
                });
            }
            else
            {
                event = new MouseEvent(eventType, {
                    clientX: x,
                    clientY: y,
                    preventDefault: sinon.stub(),
                });
            }
            if (onCanvas)
            {
                Object.defineProperty(event, 'target', { value: this.renderer.view });
            }
        }
        else if (eventType.startsWith('touch'))
        {
            if (asPointer)
            {
                eventType = eventType.replace('touch', 'pointer').replace('start', 'down').replace('end', 'up');
                event = new PointerEvent(eventType, {
                    pointerType: 'touch',
                    pointerId: identifier || 0,
                    clientX: x,
                    clientY: y,
                    preventDefault: sinon.stub(),
                });
                Object.defineProperty(event, 'target', { value: this.renderer.view });
            }
            else
            {
                const touch = new Touch({ identifier: identifier || 0, target: this.renderer.view });

                if (eventType.endsWith('start'))
                {
                    this.activeTouches.push(touch);
                }
                else if (eventType.endsWith('end') || eventType.endsWith('leave'))
                {
                    for (let i = 0; i < this.activeTouches.length; ++i)
                    {
                        if (this.activeTouches[i].identifier === touch.identifier)
                        {
                            this.activeTouches.splice(i, 1);
                            break;
                        }
                    }
                }
                event = new TouchEvent(eventType, {
                    preventDefault: sinon.stub(),
                    changedTouches: [touch],
                    touches: this.activeTouches,
                });

                Object.defineProperty(event, 'target', { value: this.renderer.view });
            }
        }
        else
        {
            event = new PointerEvent(eventType, {
                pointerType: 'pen',
                pointerId: identifier || 0,
                clientX: x,
                clientY: y,
                preventDefault: sinon.stub(),
            });
            Object.defineProperty(event, 'target', { value: this.renderer.view });
        }

        this.setPosition(x, y);
        this.render();

        return event;
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a mouse
     */
    mousemove(x, y, asPointer)
    {
        // mouseOverRenderer state should be correct, so mouse position to view rect
        const rect = new PIXI.Rectangle(0, 0, this.renderer.width, this.renderer.height);

        if (rect.contains(x, y))
        {
            if (!this.interaction.mouseOverRenderer)
            {
                this.interaction.onPointerOver(this.createEvent('mouseover', x, y, null, asPointer));
            }
            this.interaction.onPointerMove(this.createEvent('mousemove', x, y, null, asPointer));
        }
        else
        {
            this.interaction.onPointerOut(this.createEvent('mouseout', x, y, null, asPointer));
        }
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a mouse
     */
    click(x, y, asPointer)
    {
        this.mousedown(x, y, asPointer);
        this.mouseup(x, y, asPointer);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a mouse
     */
    mousedown(x, y, asPointer)
    {
        this.interaction.onPointerDown(this.createEvent('mousedown', x, y, null, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {boolean} [onCanvas=true] - if the event happend on the Canvas element or not
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a mouse
     */
    mouseup(x, y, onCanvas = true, asPointer = false)
    {
        this.interaction.onPointerUp(this.createEvent('mouseup', x, y, null, asPointer, onCanvas));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a touch
     */
    tap(x, y, identifier, asPointer)
    {
        this.touchstart(x, y, identifier, asPointer);
        this.touchend(x, y, identifier, asPointer);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a touch
     */
    touchstart(x, y, identifier, asPointer)
    {
        this.interaction.onPointerDown(this.createEvent('touchstart', x, y, identifier, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a touch
     */
    touchmove(x, y, identifier, asPointer)
    {
        this.interaction.onPointerMove(this.createEvent('touchmove', x, y, identifier, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a touch
     */
    touchend(x, y, identifier, asPointer)
    {
        this.interaction.onPointerUp(this.createEvent('touchend', x, y, identifier, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a touch
     */
    touchleave(x, y, identifier, asPointer)
    {
        this.interaction.onPointerOut(this.createEvent('touchleave', x, y, identifier, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    pendown(x, y, identifier)
    {
        this.interaction.onPointerDown(this.createEvent('pointerdown', x, y, identifier, true));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    penmove(x, y, identifier)
    {
        this.interaction.onPointerMove(this.createEvent('pointermove', x, y, identifier, true));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    penup(x, y, identifier)
    {
        this.interaction.onPointerUp(this.createEvent('pointerup', x, y, identifier, true));
    }
}

module.exports = MockPointer;
