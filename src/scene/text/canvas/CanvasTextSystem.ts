import { ExtensionType } from '../../../extensions/Extensions';
import { AbstractTextSystem } from '../shared/AbstractTextSystem';

import type { Renderer } from '../../../rendering/renderers/types';

/**
 * System plugin to the renderer to manage canvas text for Canvas2D.
 * @category rendering
 * @advanced
 */
export class CanvasRendererTextSystem extends AbstractTextSystem
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasSystem,
        ],
        name: 'canvasText',
    } as const;

    constructor(renderer: Renderer)
    {
        super(renderer, true);
    }
}
