import Container from './display/Container';
import Application from './Application';
import Graphics from './graphics/Graphics';
import Rectangle from './math/shapes/Rectangle';
import { UPDATE_PRIORITY } from './const';

/**
 * Adds visual tools for debugging the {@link PIXI.Application}.
 * This should not be using in a production environment.
 * @example
 * const app = new PIXI.DebugApplication();
 * app.showBounds = true;
 * @class
 * @extends PIXI.Application
 * @memberof PIXI
 */
export default class DebugApplication extends Application
{
    // eslint-disable-next-line valid-jsdoc
    /**
     * @param {Object} [options] See {@link PIXI.Application} for options.
     */
    constructor(options, arg2, arg3, arg4, arg5)
    {
        super(options, arg2, arg3, arg4, arg5);

        /**
         * Graphics to render the bounds
         * @member {PIXI.Graphics}
         * @private
         */
        this._bounds = null;

        /**
         * Local variable for `showBounds`
         * @member {boolean}
         * @private
         */
        this._showBounds = true;

        /**
         * `true` to show the bounds around all display objects.
         * @member {boolean}
         * @default true
         */
        this.showBounds = true;
    }

    set showBounds(showBounds) // eslint-disable-line require-jsdoc
    {
        const stage = this.stage;
        let bounds = this._bounds;

        this._ticker.remove(this._drawBounds, this);
        if (stage.children.indexOf(bounds) >= 0)
        {
            stage.removeChild(bounds);
            bounds.destroy();
        }

        this._bounds = null;
        this._showBounds = showBounds;

        if (showBounds)
        {
            bounds = this._bounds = new Graphics(true);

            // Render bounds immediately before the renderer is called
            this._ticker.add(this._drawBounds, this, UPDATE_PRIORITY.LOW);
        }
    }
    get showBounds() // eslint-disable-line require-jsdoc
    {
        return this._showBounds;
    }

    /**
     * Render the bounds
     * @private
     */
    _drawBounds()
    {
        // Reset bounds drawing
        this._bounds.clear().lineStyle(1, 0xff0000);

        // Always on top
        this.stage.addChild(this._bounds);

        // Render the bounds
        this._drawBoundsChild(this.stage, new Rectangle(), true);
    }

    /**
     * Recursively draw the bounds
     * @private
     * @param {PIXI.DisplayObject} child - Child to render
     * @param {PIXI.Rectangle} rect - Cached rectangle
     * @param {Boolean} [skipChild=false] - Force skip drawing if `true`
     */
    _drawBoundsChild(child, rect, skipChild = false)
    {
        child.getBounds(true, rect);

        if (rect.width && rect.height && child.renderable && !skipChild)
        {
            this._bounds.drawRect(
                rect.x,
                rect.y,
                rect.width,
                rect.height
            );
        }

        // Process children for containers
        if (child instanceof Container)
        {
            const children = child.children;

            for (let i = 0; i < children.length; i++)
            {
                this._drawBoundsChild(children[i], rect);
            }
        }
    }

    /**
     * Destroy and don't use after this.
     * @param {Boolean} [removeView=false] Automatically remove canvas from DOM.
     */
    destroy(removeView)
    {
        this.showBounds = false;
        super.destroy(removeView);
    }
}
