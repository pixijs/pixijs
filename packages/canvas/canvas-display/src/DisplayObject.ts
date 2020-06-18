import { DisplayObject } from '@pixi/display';
import type { CanvasRenderer } from '@pixi/canvas-renderer';

/**
 * Renders the object using the Canvas renderer
 * @method renderCanvas
 * @memberof PIXI.Container#
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
DisplayObject.prototype.renderCanvas = function renderCanvas(_renderer: CanvasRenderer): void
{
    // OVERWRITE;
};
