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
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {boolean} [asPointer] - if it should be a PointerEvent from a mouse
     */
    mousemove(x, y, asPointer)
    {
        let mouseEvent;

        if (asPointer)
        {
            mouseEvent = new PointerEvent('pointermove', {
                pointerType: 'mouse',
                clientX: x,
                clientY: y,
                preventDefault: sinon.stub(),
            });
        }
        else
        {
            mouseEvent = new MouseEvent('mousemove', {
                clientX: x,
                clientY: y,
                preventDefault: sinon.stub(),
            });
        }

        Object.defineProperty(mouseEvent, 'target', { value: this.renderer.view });
        this.setPosition(x, y);
        this.render();
        // mouseOverRenderer state should be correct, so mouse position to view rect
        const rect = new PIXI.Rectangle(0, 0, this.renderer.width, this.renderer.height);

        if (rect.contains(x, y))
        {
            if (!this.interaction.mouseOverRenderer)
            {
                this.interaction.onPointerOver(new MouseEvent('mouseover', {
                    clientX: x,
                    clientY: y,
                    preventDefault: sinon.stub(),
                }));
            }
            this.interaction.onPointerMove(mouseEvent);
        }
        else
        {
            this.interaction.onPointerOut(new MouseEvent('mouseout', {
                clientX: x,
                clientY: y,
                preventDefault: sinon.stub(),
            }));
        }
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     */
    click(x, y)
    {
        this.mousedown(x, y);
        this.mouseup(x, y);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     */
    mousedown(x, y)
    {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: x,
            clientY: y,
            preventDefault: sinon.stub(),
        });

        Object.defineProperty(mouseEvent, 'target', { value: this.renderer.view });

        this.setPosition(x, y);
        this.render();
        this.interaction.onPointerDown(mouseEvent);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {boolean} [onCanvas=true] - if the event happend on the Canvas element or not
     */
    mouseup(x, y, onCanvas = true)
    {
        const mouseEvent = new MouseEvent('mouseup', {
            clientX: x,
            clientY: y,
            preventDefault: sinon.stub(),
        });

        if (onCanvas)
        {
            Object.defineProperty(mouseEvent, 'target', { value: this.renderer.view });
        }

        this.setPosition(x, y);
        this.render();
        this.interaction.onPointerUp(mouseEvent);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    tap(x, y, identifier)
    {
        this.touchstart(x, y, identifier);
        this.touchend(x, y, identifier);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    touchstart(x, y, identifier)
    {
        const touchEvent = new TouchEvent('touchstart', {
            preventDefault: sinon.stub(),
            changedTouches: [
                new Touch({ identifier: identifier || 0, target: this.renderer.view }),
            ],
        });

        Object.defineProperty(touchEvent, 'target', { value: this.renderer.view });

        this.setPosition(x, y);
        this.render();
        this.interaction.onPointerDown(touchEvent);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    touchend(x, y, identifier)
    {
        const touchEvent = new TouchEvent('touchend', {
            preventDefault: sinon.stub(),
            changedTouches: [
                new Touch({ identifier: identifier || 0, target: this.renderer.view }),
            ],
        });

        Object.defineProperty(touchEvent, 'target', { value: this.renderer.view });

        this.setPosition(x, y);
        this.render();
        this.interaction.onPointerUp(touchEvent);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     * @param {number} [identifier] - pointer id
     */
    touchleave(x, y, identifier)
    {
        const touchEvent = new TouchEvent('touchleave', {
            preventDefault: sinon.stub(),
            changedTouches: [
                new Touch({ identifier: identifier || 0, target: this.renderer.view }),
            ],
        });

        Object.defineProperty(touchEvent, 'target', { value: this.renderer.view });

        this.setPosition(x, y);
        this.render();
        this.interaction.onPointerOut(touchEvent);
    }
}

module.exports = MockPointer;
