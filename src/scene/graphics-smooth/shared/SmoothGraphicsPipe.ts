import { ExtensionType } from '../../../extensions/Extensions';
import { AbstractGraphicsGpuData, AbstractGraphicsPipe } from '../../graphics/shared/AbstractGraphicsPipe';
import { BatchableSmoothGraphics } from './BatchableSmoothGraphics';

import type { Renderer } from '../../../rendering/renderers/types';
import type { AbstractGraphicsContextSystem } from '../../graphics/shared/AbstractGraphicsContextSystem';
import type { GraphicsAdaptor } from '../../graphics/shared/GraphicsAdaptorTypes';
import type { GpuSmoothGraphicsContext } from './GpuSmoothGraphicsContext';
import type { SmoothGraphics } from './SmoothGraphics';
import type { SmoothGraphicsContextSystem } from './SmoothGraphicsContextSystem';

/** @internal */
export type SmoothGraphicsGpuData = AbstractGraphicsGpuData<BatchableSmoothGraphics>;

/**
 * Render pipe for smooth HHAA graphics.
 * Handles both batchable (small geometry) and non-batchable (large geometry) paths.
 * @category rendering
 * @internal
 */
export class SmoothGraphicsPipe
    extends AbstractGraphicsPipe<SmoothGraphics, BatchableSmoothGraphics, GpuSmoothGraphicsContext>
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

    protected _getContextSystem(): AbstractGraphicsContextSystem<GpuSmoothGraphicsContext, any>
    {
        return this.renderer.smoothGraphicsContext as SmoothGraphicsContextSystem;
    }

    protected _createGpuData(): AbstractGraphicsGpuData<BatchableSmoothGraphics>
    {
        return new AbstractGraphicsGpuData();
    }
}
