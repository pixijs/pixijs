import { settings, utils } from '@pixi/core';
import { Mesh } from '@pixi/mesh';

Object.defineProperties(settings, {
    /**
     * Default `canvasPadding` for canvas-based Mesh rendering.
     * @see PIXI.Mesh.defaultCanvasPadding
     * @deprecated since 7.1.0
     * @static
     * @memberof PIXI.settings
     * @member {number}
     */
    MESH_CANVAS_PADDING: {
        get()
        {
            return Mesh.defaultCanvasPadding;
        },
        set(value: number)
        {
            if (process.env.DEBUG)
            {
                utils.deprecation('7.1.0', 'settings.MESH_CANVAS_PADDING is deprecated, use Mesh.defaultCanvasPadding');
            }
            Mesh.defaultCanvasPadding = value;
        },
    },
});

export { settings };
