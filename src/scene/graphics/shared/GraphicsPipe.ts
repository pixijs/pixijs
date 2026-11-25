import { ExtensionType } from '../../../extensions/Extensions';
import { AbstractGraphicsPipe } from './AbstractGraphicsPipe';
import { BatchableGraphics } from './BatchableGraphics';

import type { Renderer } from '../../../rendering/renderers/types';
import type { GraphicsAdaptor } from './AbstractGraphicsPipe';
import type { GraphicsContextSystem } from './GraphicsContextSystem';

/** @internal */
export class GraphicsPipe extends AbstractGraphicsPipe<BatchableGraphics>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
        ],
        name: 'graphics',
    } as const;

    protected readonly _batchableClass = BatchableGraphics;

    constructor(renderer: Renderer, adaptor: GraphicsAdaptor)
    {
        super(renderer, adaptor, 'graphics');
    }

    protected get _contextSystem(): GraphicsContextSystem
    {
        return this.renderer.graphicsContext as GraphicsContextSystem;
    }
}
