import { Container } from '@pixi/display';

/**
 * To be overridden by the subclass
 *
 * @private
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
Container.prototype._renderCanvas = function _renderCanvas(renderer) // eslint-disable-line no-unused-vars
{
    // this is where content itself gets rendered...
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
Container.prototype.renderCanvas = function renderCanvas(renderer)
{
    // if not visible or the alpha is 0 then no need to render this
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    if (this._mask)
    {
        renderer.maskManager.pushMask(this._mask);
    }

    this._renderCanvas(renderer);
    for (let i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].renderCanvas(renderer);
    }

    if (this._mask)
    {
        renderer.maskManager.popMask(renderer);
    }
};
