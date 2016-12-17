'use strict';

/**
 * Use this to mock mouse/touch/pointer events
 *
 * @class
 */
class MockPointer {
    /**
     * @param {PIXI.Container} stage - The root of the scene tree
     * @param {number} [width=100] - Width of the renderer
     * @param {number} [height=100] - Height of the renderer
     */
    constructor(stage, width, height)
    {
        this.stage = stage;
        this.renderer = new PIXI.CanvasRenderer(width || 100, height || 100);
        this.renderer.sayHello = () => { /* empty */ };
        this.interaction = this.renderer.plugins.interaction;
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
        this.setPosition(x, y);
        this.render();
        this.interaction.onMouseDown({ clientX: 0, clientY: 0, preventDefault: sinon.stub() });
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     */
    mouseup(x, y)
    {
        this.setPosition(x, y);
        this.render();
        this.interaction.onMouseUp({ clientX: 0, clientY: 0, preventDefault: sinon.stub() });
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     */
    tap(x, y)
    {
        this.touchstart(x, y);
        this.touchend(x, y);
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     */
    touchstart(x, y)
    {
        this.setPosition(x, y);
        this.render();
        this.interaction.onTouchStart({
            preventDefault: sinon.stub(),
            changedTouches: [new Touch({ identifier: 0, target: this.renderer.view })],
        });
    }

    /**
     * @param {number} x - pointer x position
     * @param {number} y - pointer y position
     */
    touchend(x, y)
    {
        this.setPosition(x, y);
        this.render();
        this.interaction.onTouchEnd({
            preventDefault: sinon.stub(),
            changedTouches: [new Touch({ identifier: 0, target: this.renderer.view })],
        });
    }
}

module.exports = MockPointer;
