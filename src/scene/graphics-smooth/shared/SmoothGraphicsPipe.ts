import { ExtensionType } from '../../../extensions/Extensions';
import { AbstractGraphicsPipe } from '../../graphics/shared/AbstractGraphicsPipe';
import { BatchableSmoothGraphics } from './BatchableSmoothGraphics';

import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';
import type { Renderer } from '../../../rendering/renderers/types';
import type { GraphicsAdaptor } from '../../graphics/shared/AbstractGraphicsPipe';
import type { SmoothGraphicsContextSystem } from './SmoothGraphicsContextSystem';

/**
 * Render pipe of {@link SmoothGraphics}.
 * @category rendering
 * @internal
 */
export class SmoothGraphicsPipe extends AbstractGraphicsPipe<BatchableSmoothGraphics>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
        ],
        name: 'smoothGraphics',
    } as const;

    protected readonly _batchableClass = BatchableSmoothGraphics;

    constructor(renderer: Renderer, adaptor: GraphicsAdaptor)
    {
        super(renderer, adaptor, 'smoothGraphics');
    }

    protected get _contextSystem(): SmoothGraphicsContextSystem
    {
        return (this.renderer as WebGLRenderer).smoothGraphicsContext;
    }
}
