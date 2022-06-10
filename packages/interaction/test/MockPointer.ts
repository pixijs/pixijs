/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { Ticker } from '@pixi/ticker';
import { Point, Rectangle } from '@pixi/math';
import { Container } from '@pixi/display';

const { system } = Ticker;

/**
 * Use this to mock mouse/touch/pointer events
 * @class
 */
class MockPointer
{
    public createdPointerEvent: any;
    public activeTouches: any[];
    public stage: Container;
    public renderer: CanvasRenderer;
    public interaction: any;
    /**
     * @param {PIXI.Container} stage - The root of the scene tree
     * @param {number} [width=100] - Width of the renderer
     * @param {number} [height=100] - Height of the renderer
     * @param {boolean} [ensurePointerEvents=false] - If we should make sure that PointerEvents are 'supported'
     */
    constructor(stage?: Container, width?: number, height?: number, ensurePointerEvents?: boolean)
    {
        // fake PointerEvent existing
        if (ensurePointerEvents && !window.PointerEvent)
        {
            (window as any).PointerEvent = class PointerEvent extends MouseEvent
            {
                public pointerType: string;
                // eslint-disable-next-line
                constructor(type: string, opts: any)
                {
                    super(type, opts);
                    this.pointerType = opts.pointerType;
                }
            };
            this.createdPointerEvent = true;
        }

        this.activeTouches = [];
        this.stage = stage;
        this.renderer = new CanvasRenderer({
            width: width || 100,
            height: height || 100,
        });
        // @ts-expect-error ---
        this.renderer.sayHello = () => { /* empty */ };
        this.interaction = this.renderer.plugins.interaction;
        this.interaction.supportsTouchEvents = true;
        system.remove(this.interaction.update, this.interaction);
    }

    /** Cleans up after tests */
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
    setPosition(x: number, y: number)
    {
        this.renderer.plugins.interaction.mapPositionToPoint = (point: Point) =>
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
     * @param {string} eventType - `type` of event
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id for touch events
     * @param {boolean} [asPointer] -  If it should be a PointerEvent from a mouse or touch
     * @param {boolean} [onCanvas=true] - If the event should be on the canvas (as opposed to a different element)
     * @returns {Event} Generated MouseEvent, TouchEvent, or PointerEvent
     */
    createEvent(
        eventType: string,
        x: number,
        y: number,
        identifier?: number | boolean,
        asPointer?: boolean,
        onCanvas = true
    ): Event
    {
        let event: PointerEvent | MouseEvent | TouchEvent;

        if (eventType.startsWith('mouse'))
        {
            if (asPointer)
            {
                event = new PointerEvent(eventType.replace('mouse', 'pointer'), {
                    pointerType: 'mouse',
                    clientX: x,
                    clientY: y,
                });
            }
            else
            {
                event = new MouseEvent(eventType, {
                    clientX: x,
                    clientY: y,
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
                    pointerId: identifier as number || 0,
                    clientX: x,
                    clientY: y,
                });
                Object.defineProperty(event, 'target', { value: this.renderer.view });
            }
            else
            {
                const touch = new Touch({ identifier: identifier as number || 0, target: this.renderer.view });

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
                pointerId: identifier as number || 0,
                clientX: x,
                clientY: y,
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
    mousemove(x: number, y: number, asPointer?: boolean)
    {
        // mouseOverRenderer state should be correct, so mouse position to view rect
        const rect = new Rectangle(0, 0, this.renderer.width, this.renderer.height);

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
    click(x: number, y: number, asPointer?: boolean)
    {
        this.mousedown(x, y, asPointer);
        this.mouseup(x, y, asPointer);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a mouse
     */
    mousedown(x: number, y: number, asPointer?: boolean)
    {
        this.interaction.onPointerDown(this.createEvent('mousedown', x, y, null, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {boolean} [onCanvas=true] - if the event happened on the Canvas element or not
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a mouse
     */
    mouseup(x: number, y: number, onCanvas = true, asPointer = false)
    {
        this.interaction.onPointerUp(this.createEvent('mouseup', x, y, null, asPointer, onCanvas));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a touch
     */
    tap(x: number, y: number, identifier?: undefined, asPointer?: undefined)
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
    touchstart(x: number, y: number, identifier?: number | boolean, asPointer?: boolean)
    {
        this.interaction.onPointerDown(this.createEvent('touchstart', x, y, identifier, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a touch
     */
    touchmove(x: number, y: number, identifier?: number | boolean, asPointer?: boolean)
    {
        this.interaction.onPointerMove(this.createEvent('touchmove', x, y, identifier, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a touch
     */
    touchend(x: number, y: number, identifier?: number | boolean, asPointer?: boolean)
    {
        this.interaction.onPointerUp(this.createEvent('touchend', x, y, identifier, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a touch
     */
    touchleave(x: number, y: number, identifier?: number | boolean, asPointer?: boolean)
    {
        this.interaction.onPointerOut(this.createEvent('touchleave', x, y, identifier, asPointer));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    pendown(x: number, y: number, identifier?: number)
    {
        this.interaction.onPointerDown(this.createEvent('pointerdown', x, y, identifier, true));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    penmove(x: number, y: number, identifier?: number)
    {
        this.interaction.onPointerMove(this.createEvent('pointermove', x, y, identifier, true));
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    penup(x: number, y: number, identifier?: number)
    {
        this.interaction.onPointerUp(this.createEvent('pointerup', x, y, identifier, true));
    }
}

export { MockPointer };
