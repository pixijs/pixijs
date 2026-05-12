import { GCManagedHash } from '../../../utils/data/GCManagedHash';
import { buildRenderDataFromBatches } from './utils/buildRenderDataFromBatches';

import type { Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { System } from '../../../rendering/renderers/shared/system/System';
import type { Renderer } from '../../../rendering/renderers/types';
import type { AbstractGpuGraphicsContext } from './AbstractGpuGraphicsContext';
import type { GraphicsContext } from './GraphicsContext';

/**
 * Abstract base for GraphicsContextSystem and SmoothGraphicsContextSystem.
 * Houses shared lifecycle (get / update / init / destroy) and delegates to
 * four subclass hooks for the parts that differ.
 * @category rendering
 * @internal
 */
export abstract class AbstractGraphicsContextSystem<
    TGpuContext extends AbstractGpuGraphicsContext<any, TRenderData>,
    TRenderData extends { batcher: Batcher; instructions: InstructionSet }
> implements System
{
    private readonly _renderer: Renderer;
    private readonly _managedContexts: GCManagedHash<GraphicsContext>;

    constructor(renderer: Renderer, name: string)
    {
        this._renderer = renderer;
        this._managedContexts = new GCManagedHash({ renderer, type: 'resource', name });
    }

    protected abstract _createGpuContext(): TGpuContext;
    protected abstract _buildContextData(context: GraphicsContext, gpuContext: TGpuContext): void;
    protected abstract _getVertexAndIndexCounts(gpuContext: TGpuContext): { vertices: number; indices: number };
    protected abstract _createRenderData(maxTextures: number): TRenderData;

    /**
     * Returns the render data for a given GraphicsContext.
     * @param context - The GraphicsContext to get the render data for.
     * @internal
     */
    public getContextRenderData(context: GraphicsContext): TRenderData
    {
        return this._getGpuData(context)[this._renderer.uid].graphicsData || this._initContextRenderData(context);
    }

    /**
     * Updates the GPU context for a given GraphicsContext.
     * If the context is dirty, it will rebuild the batches and geometry data.
     * @param context - The GraphicsContext to update.
     * @returns The updated GPU context.
     * @internal
     */
    public updateGpuContext(context: GraphicsContext): TGpuContext
    {
        const gpuData = this._getGpuData(context);
        const hasContext = !!gpuData[this._renderer.uid];
        const gpuContext: TGpuContext = gpuData[this._renderer.uid] || this._initContext(context);

        if (context.dirty || !hasContext)
        {
            if (hasContext)
            {
                gpuContext.reset();
            }

            gpuContext.context = context;
            this._buildContextData(context, gpuContext);

            const batchMode = context.batchMode;

            if (context.customShader || batchMode === 'no-batch')
            {
                gpuContext.isBatchable = false;
            }
            else if (batchMode === 'auto')
            {
                const { vertices } = this._getVertexAndIndexCounts(gpuContext);

                gpuContext.isBatchable = (vertices < 400);
            }
            else
            {
                gpuContext.isBatchable = true;
            }

            context.dirty = false;
        }

        return gpuContext;
    }

    /**
     * Returns the GPU context for a given GraphicsContext.
     * If it does not exist, it will initialize a new one.
     * @param context - The GraphicsContext to get the GPU context for.
     * @returns The GPU context for the given GraphicsContext.
     * @internal
     */
    public getGpuContext(context: GraphicsContext): TGpuContext
    {
        return this._getGpuData(context)[this._renderer.uid] || this._initContext(context);
    }

    /** @ignore */
    public destroy()
    {
        this._managedContexts.destroy();
        (this._renderer as null) = null;
    }

    private _getGpuData(context: GraphicsContext): Record<number | string, TGpuContext>
    {
        return context._gpuData as unknown as Record<number | string, TGpuContext>;
    }

    private _initContextRenderData(context: GraphicsContext): TRenderData
    {
        const maxTextures = this._renderer.limits.maxBatchableTextures;
        const graphicsData = this._createRenderData(maxTextures);

        const gpuContext = this._getGpuData(context)[this._renderer.uid];
        const { batches } = gpuContext;

        gpuContext.graphicsData = graphicsData;

        const { vertices, indices } = this._getVertexAndIndexCounts(gpuContext);

        buildRenderDataFromBatches(
            graphicsData.batcher,
            graphicsData.instructions,
            batches,
            vertices,
            indices,
            maxTextures,
        );

        return graphicsData;
    }

    private _initContext(context: GraphicsContext): TGpuContext
    {
        const gpuContext = this._createGpuContext();

        gpuContext.context = context;

        this._getGpuData(context)[this._renderer.uid] = gpuContext;

        this._managedContexts.add(context);

        return gpuContext;
    }
}
