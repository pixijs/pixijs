import { Renderer } from '@pixi/core';
import { CanvasRenderer } from './CanvasRenderer';

import type { IRendererOptionsAuto } from '@pixi/core';
import { IRenderer } from 'packages/core/src/IRenderer';

// Reference to Renderer.create static function
const parentCreate = Renderer.create;

/**
 * Override the Renderer.create to fallback to use CanvasRenderer.
 * Also supports forceCanvas option with Application or autoDetectRenderer.
 * @private
 */
Renderer.create = function create(options: IRendererOptionsAuto): IRenderer
{
    const forceCanvas = options && options.forceCanvas;

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
