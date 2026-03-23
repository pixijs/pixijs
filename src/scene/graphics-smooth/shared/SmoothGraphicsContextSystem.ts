import { ExtensionType } from '../../../extensions/Extensions';
import { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { AbstractGraphicsContextSystem } from '../../graphics/shared/AbstractGraphicsContextSystem';
import { SmoothBatcher } from './batcher/SmoothBatcher';
import { buildSmoothContextData } from './builders/buildSmoothContextData';
import { GpuSmoothGraphicsContext } from './GpuSmoothGraphicsContext';

import type { Renderer } from '../../../rendering/renderers/types';
import type { GraphicsContext } from '../../graphics/shared/GraphicsContext';

/**
 * Render data for a non-batchable smooth graphics context.
 * Owns a private SmoothBatcher used to build draw batches from local-space geometry.
 * @category rendering
 * @internal
 */
export class SmoothGraphicsContextRenderData
{
    public batcher: SmoothBatcher;
    public instructions = new InstructionSet();

    public init(options: { maxTextures: number })
    {
        const maxTextures = options.maxTextures;

        this.batcher ? this.batcher._updateMaxTextures(maxTextures) : this.batcher = new SmoothBatcher({ maxTextures });
        this.instructions.reset();
    }

    public destroy()
    {
        this.batcher.destroy();
        this.instructions.destroy();

        this.batcher = null;
        this.instructions = null;
    }
}

/**
 * System that manages building HHAA geometry from GraphicsContext instructions
 * for smooth graphics rendering.
 * @category rendering
 * @advanced
 */
export class SmoothGraphicsContextSystem
    extends AbstractGraphicsContextSystem<GpuSmoothGraphicsContext, SmoothGraphicsContextRenderData>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'smoothGraphicsContext'
    } as const;

    constructor(renderer: Renderer)
    {
        super(renderer, 'smoothGraphicsContext');
    }

    protected _createGpuContext(): GpuSmoothGraphicsContext
    {
        return new GpuSmoothGraphicsContext();
    }

    protected _buildContextData(context: GraphicsContext, gpuContext: GpuSmoothGraphicsContext): void
    {
        buildSmoothContextData(context, gpuContext);
    }

    protected _getVertexAndIndexCounts(gpuContext: GpuSmoothGraphicsContext): { vertices: number; indices: number }
    {
        let vertices = 0;
        let indices = 0;

        for (let i = 0; i < gpuContext.batches.length; i++)
        {
            vertices += gpuContext.batches[i].attributeSize;
            indices += gpuContext.batches[i].indexSize;
        }

        return { vertices, indices };
    }

    protected _createRenderData(maxTextures: number): SmoothGraphicsContextRenderData
    {
        return BigPool.get(SmoothGraphicsContextRenderData, { maxTextures });
    }
}
