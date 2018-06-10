import { Mesh2d } from '@pixi/mesh-extras';
import { settings } from './settings';

// IMPORTANT: Please do NOT use this as a precedent to use `settings` after the object is created
// this was merely created to completely decouple canvas from the base Mesh class and we are
// unable to add `canvasPadding` in the constructor anymore, as the case was for PixiJS v4.

/**
 * Internal variable for `canvasPadding`.
 *
 * @private
 * @memberof PIXI.Mesh2d
 * @member {number}
 * @default null
 */
Mesh2d.prototype._canvasPadding = null;

/**
 * Triangles in canvas mode are automatically antialiased, use this value to force triangles
 * to overlap a bit with each other. To set the global default, set {@link PIXI.settings.MESH_CANVAS_PADDING}
 *
 * @see PIXI.settings.MESH_CANVAS_PADDING
 * @member {number} canvasPadding
 * @memberof PIXI.Mesh2d#
 * @default 0
 */
Object.defineProperty(Mesh2d.prototype, 'canvasPadding', {
    get()
    {
        return this._canvasPadding !== null ? this._canvasPadding : settings.MESH_CANVAS_PADDING;
    },
    set(value)
    {
        this._canvasPadding = value;
    },
});
