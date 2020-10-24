/*!
 * @pixi/canvas-display - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/canvas-display is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Container, DisplayObject } from '@pixi/display';

/**
 * To be overridden by the subclass
 * @method _renderCanvas
 * @memberof PIXI.Container#
 * @protected
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
Container.prototype._renderCanvas = function _renderCanvas(_renderer) {
    // this is where content itself gets rendered...
};
/**
 * Renders the object using the Canvas renderer
 * @method renderCanvas
 * @memberof PIXI.Container#
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
Container.prototype.renderCanvas = function renderCanvas(renderer) {
    // if not visible or the alpha is 0 then no need to render this
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
        return;
    }
    if (this._mask) {
        renderer.maskManager.pushMask(this._mask);
    }
    this._renderCanvas(renderer);
    for (var i = 0, j = this.children.length; i < j; ++i) {
        this.children[i].renderCanvas(renderer);
    }
    if (this._mask) {
        renderer.maskManager.popMask(renderer);
    }
};

/**
 * Renders the object using the Canvas renderer
 * @method renderCanvas
 * @memberof PIXI.Container#
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
DisplayObject.prototype.renderCanvas = function renderCanvas(_renderer) {
    // OVERWRITE;
};
//# sourceMappingURL=canvas-display.es.js.map
