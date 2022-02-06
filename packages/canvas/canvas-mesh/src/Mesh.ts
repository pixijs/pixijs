import { Mesh } from '@pixi/mesh';
import { settings } from './settings';

import type { CanvasRenderer } from '@pixi/canvas-renderer';

let warned = false;

/**
 * Cached tint value so we can tell when the tint is changed.
 * @memberof PIXI.Mesh#
 * @member {number} _cachedTint
 * @protected
 */
Mesh.prototype._cachedTint = 0xFFFFFF;

/**
 * Cached tinted texture.
 * @memberof PIXI.Mesh#
 * @member {HTMLCanvasElement} _tintedCanvas
 * @protected
 */
Mesh.prototype._tintedCanvas = null;

/**
 * The cache texture is used to generate `_tintedCanvas`.
 * @memberof PIXI.Mesh#
 * @member {PIXI.Texture} _cachedTexture
 * @protected
 */
Mesh.prototype._cachedTexture = null;

/**
 * Renders the object using the Canvas renderer
 *
 * @private
 * @method _renderCanvas
 * @memberof PIXI.Mesh#
 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
 */
Mesh.prototype._renderCanvas = function _renderCanvas(renderer: CanvasRenderer): void
{
    if (this.shader.uvMatrix)
    {
        this.shader.uvMatrix.update();
        this.calculateUvs();
    }

    if (this.material._renderCanvas)
    {
        this.material._renderCanvas(renderer, this);
    }
    else if (!warned)
    {
        warned = true;
        if (globalThis.console)
        {
            console.warn('Mesh with custom shaders are not supported in CanvasRenderer.');
        }
    }
};

// IMPORTANT: Please do NOT use this as a precedent to use `settings` after the object is created
// this was merely created to completely decouple canvas from the base Mesh class and we are
// unable to add `canvasPadding` in the constructor anymore, as the case was for PixiJS v4.

/**
 * Internal variable for `canvasPadding`.
 *
 * @private
 * @memberof PIXI.Mesh
 * @member {number}
 * @default null
 */
Mesh.prototype._canvasPadding = null;

/**
 * Triangles in canvas mode are automatically antialiased, use this value to force triangles
 * to overlap a bit with each other. To set the global default, set {@link PIXI.settings.MESH_CANVAS_PADDING}
 *
 * @see PIXI.settings.MESH_CANVAS_PADDING
 * @member {number} canvasPadding
 * @memberof PIXI.SimpleMesh#
 * @default 0
 */
Object.defineProperty(Mesh.prototype, 'canvasPadding', {
    get()
    {
        return this._canvasPadding !== null ? this._canvasPadding : settings.MESH_CANVAS_PADDING;
    },
    set(value)
    {
        this._canvasPadding = value;
    },
});
