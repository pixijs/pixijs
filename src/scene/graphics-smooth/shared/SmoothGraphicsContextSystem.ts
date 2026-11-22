import { ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';
import {
    AbstractGpuGraphicsContext,
    AbstractGraphicsContextRenderData,
    AbstractGraphicsContextSystem,
} from '../../graphics/shared/AbstractGraphicsContextSystem';
import { SmoothBatcher, SmoothTexturedBatcher } from './batcher/SmoothBatcher';
import { buildSmoothContextData } from './builders/buildSmoothContextData';

import type { Renderer } from '../../../rendering/renderers/types';
import type { GraphicsContext } from '../../graphics/shared/GraphicsContext';
import type { BatchableSmoothGraphics } from './BatchableSmoothGraphics';

/**
 * Render data of a smooth graphics context that isn't batched. Its batcher uses the textured
 * vertex format when an element of the context has a texture.
 * @category rendering
 * @internal
 */
export class SmoothGraphicsContextRenderData extends AbstractGraphicsContextRenderData<SmoothBatcher>
{
    /** Whether the batcher uses the textured vertex format */
    public textured = false;

    public override init(options: { maxTextures: number; textured?: boolean }): void
    {
        const textured = !!options.textured;

        if (this.batcher && this.textured !== textured)
        {
            this.batcher.destroy();
            this.batcher = null;
        }

        this.textured = textured;
        super.init(options);
    }

    protected _createBatcher(maxTextures: number): SmoothBatcher
    {
        return this.textured ? new SmoothTexturedBatcher({ maxTextures }) : new SmoothBatcher({ maxTextures });
    }
}

/**
 * The batches built from a GraphicsContext for {@link SmoothGraphics}, for one renderer.
 * @category rendering
 * @internal
 */
export class GpuSmoothGraphicsContext
    extends AbstractGpuGraphicsContext<BatchableSmoothGraphics, SmoothGraphicsContextRenderData>
{}

/**
 * Builds the anti-aliased geometry of the GraphicsContexts drawn by {@link SmoothGraphics}.
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
        buildSmoothContextData(context, gpuContext.batches);
    }

    protected _getGeometrySize(gpuContext: GpuSmoothGraphicsContext): { attributes: number; indices: number }
    {
        let attributes = 0;
        let indices = 0;

        for (let i = 0; i < gpuContext.batches.length; i++)
        {
            attributes += gpuContext.batches[i].attributeSize;
            indices += gpuContext.batches[i].indexSize;
        }

        return { attributes, indices };
    }

    protected _getRenderData(maxTextures: number, gpuContext: GpuSmoothGraphicsContext): SmoothGraphicsContextRenderData
    {
        const textured = gpuContext.batches.some((batch) => batch.batcherName === 'smoothTextured');

        return BigPool.get(SmoothGraphicsContextRenderData, { maxTextures, textured });
    }
}
