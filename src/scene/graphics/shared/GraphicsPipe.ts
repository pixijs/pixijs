import { ExtensionType } from '../../../extensions/Extensions';
import { AbstractGraphicsGpuData, AbstractGraphicsPipe } from './AbstractGraphicsPipe';
import { BatchableGraphics } from './BatchableGraphics';

import type { Renderer } from '../../../rendering/renderers/types';
import type { AbstractGraphicsContextSystem } from './AbstractGraphicsContextSystem';
import type { Graphics } from './Graphics';
import type { GraphicsAdaptor } from './GraphicsAdaptorTypes';
import type { GpuGraphicsContext, GraphicsContextSystem } from './GraphicsContextSystem';

export type { GraphicsAdaptor, GraphicsPipeLike } from './GraphicsAdaptorTypes';

/** @internal */
export class GraphicsGpuData extends AbstractGraphicsGpuData<BatchableGraphics>
{
    public batched = false;
}

/** @internal */
export class GraphicsPipe extends AbstractGraphicsPipe<Graphics, BatchableGraphics, GpuGraphicsContext, GraphicsGpuData>
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

    protected _getContextSystem(): AbstractGraphicsContextSystem<GpuGraphicsContext, any>
    {
        return this.renderer.graphicsContext as GraphicsContextSystem;
    }

    protected _createGpuData(): GraphicsGpuData
    {
        return new GraphicsGpuData();
    }
}
