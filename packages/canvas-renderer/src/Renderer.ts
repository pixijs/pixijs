import { Renderer } from '@pixi/core';
import { CanvasRenderer } from './CanvasRenderer';

import type { IRenderer, IRendererOptionsAuto } from '@pixi/core';

// Reference to Renderer.create static function
const parentCreate = Renderer.create;

/**
 * Override the Renderer.create to fallback to use CanvasRenderer.
 * Also supports forceCanvas option with Application or autoDetectRenderer.
 * @param options
 * @private
 */
Renderer.create = function create(options: IRendererOptionsAuto): IRenderer
{
    const forceCanvas = options?.forceCanvas;

    if (!forceCanvas)
    {
        try
        {
            return parentCreate(options);
        }
        catch (err)
        {
            // swallow WebGL-unsupported error
        }
    }

    //    return parentCreate(options);
    return new CanvasRenderer(options);
};
