import { ExtensionType } from '../../../extensions/Extensions';
import { AbstractTextSystem } from './AbstractTextSystem';

import type { Renderer } from '../../../rendering/renderers/types';

/**
 * System plugin to the renderer to manage canvas text for GPU renderers.
 * @category rendering
 * @advanced
 */
export class CanvasTextSystem extends AbstractTextSystem
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'canvasText',
    } as const;

    constructor(renderer: Renderer)
    {
        super(renderer, false);
    }
}
