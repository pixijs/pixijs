import { getTextureBatchBindGroup } from '../../../rendering/batcher/gpu/getTextureBatchBindGroup';
import { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import { GCManagedHash } from '../../../utils/data/GCManagedHash';
import { BigPool } from '../../../utils/pool/PoolGroup';

import type { Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { System } from '../../../rendering/renderers/shared/system/System';
import type { Renderer } from '../../../rendering/renderers/types';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { GPUData } from '../../view/ViewContainer';
import type { AbstractBatchableGraphics } from './AbstractBatchableGraphics';
import type { GraphicsContext } from './GraphicsContext';

/**
 * A batcher whose shader can be updated for a new number of textures.
 * @ignore
 */
type GraphicsBatcher = Batcher & { _updateMaxTextures(maxTextures: number): void };

/**
 * Render data of a context that is too big to be batched: the context is drawn
 * from its own geometry, built by a batcher owned by this object.
 * @category rendering
 * @ignore
 */
export abstract class AbstractGraphicsContextRenderData<TBatcher extends GraphicsBatcher = GraphicsBatcher>
{
    public batcher: TBatcher;
    public instructions = new InstructionSet();

    public init(options: { maxTextures: number })
    {
        const maxTextures = options.maxTextures;

        this.batcher ? this.batcher._updateMaxTextures(maxTextures) : this.batcher = this._createBatcher(maxTextures);
        this.instructions.reset();
    }

    public destroy()
    {
        this.batcher.destroy();
        this.instructions.destroy();

        this.batcher = null;
        this.instructions = null;
    }

    protected abstract _createBatcher(maxTextures: number): TBatcher;
}

/**
 * The batches built from a GraphicsContext for one renderer.
 * @category rendering
 * @ignore
 */
export class AbstractGpuGraphicsContext<
    TBatch extends AbstractBatchableGraphics = AbstractBatchableGraphics,
    TRenderData extends AbstractGraphicsContextRenderData = AbstractGraphicsContextRenderData,
> implements GPUData
{
    public isBatchable: boolean;
    public context: GraphicsContext;

    public batches: TBatch[] = [];
    public graphicsData: TRenderData;

    public reset()
    {
        if (this.batches)
        {
            this.batches.forEach((batch) =>
            {
                BigPool.return(batch as PoolItem);
            });
        }
        if (this.graphicsData)
        {
            BigPool.return(this.graphicsData as unknown as PoolItem);
        }

        this.isBatchable = false;
        this.context = null;

        this.batches.length = 0;

        this.graphicsData = null;
    }

    public destroy()
    {
        this.reset();
        this.batches = null;
    }
}

/**
 * Builds and caches the batches of GraphicsContexts, shared by the graphics and smooth graphics systems.
 * Subclasses build the batches, and create the render data of contexts that are too big to be batched.
 * @category rendering
 * @internal
 */
export abstract class AbstractGraphicsContextSystem<
    TGpuContext extends AbstractGpuGraphicsContext<AbstractBatchableGraphics, TRenderData>,
    TRenderData extends AbstractGraphicsContextRenderData,
> implements System
{
    protected readonly _renderer: Renderer;
    private readonly _managedContexts: GCManagedHash<GraphicsContext>;

    /**
     * @param renderer - The renderer this system works for
     * @param name - Name of the managed contexts, for the garbage collector
     */
    constructor(renderer: Renderer, name: string)
    {
        this._renderer = renderer;
        this._managedContexts = new GCManagedHash({ renderer, type: 'resource', name });
    }

    /** Creates the empty GPU data of a context. */
    protected abstract _createGpuContext(): TGpuContext;
    /** Builds the batches of a context into its GPU data. */
    protected abstract _buildContextData(context: GraphicsContext, gpuContext: TGpuContext): void;
    /**
     * The geometry sizes of a context: `attributes` decides if the context is batched,
     * and both are hints for the buffer sizes of contexts that aren't.
     */
    protected abstract _getGeometrySize(gpuContext: TGpuContext): { attributes: number; indices: number };
    /** Gets the pooled render data of a context that isn't batched. */
    protected abstract _getRenderData(maxTextures: number, gpuContext: TGpuContext): TRenderData;

    /**
     * Returns the render data for a given GraphicsContext.
     * @param context - The GraphicsContext to get the render data for.
     * @internal
     */
    public getContextRenderData(context: GraphicsContext): TRenderData
    {
        return this._getGpuData(context).graphicsData || this._initContextRenderData(context);
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
        const hasContext = !!this._getGpuData(context);
        const gpuContext = this._getGpuData(context) || this._initContext(context);

        if (context.dirty || !hasContext)
        {
            if (hasContext)
            {
                gpuContext.reset();
                gpuContext.context = context;
            }

            this._buildContextData(context, gpuContext);

            const batchMode = context.batchMode;

            if (context.customShader || batchMode === 'no-batch')
            {
                gpuContext.isBatchable = false;
            }
            else if (batchMode === 'auto')
            {
                gpuContext.isBatchable = (this._getGeometrySize(gpuContext).attributes < 400);
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
        return this._getGpuData(context) || this._initContext(context);
    }

    private _getGpuData(context: GraphicsContext): TGpuContext
    {
        return context._gpuData[this._renderer.uid] as GPUData as TGpuContext;
    }

    private _initContextRenderData(context: GraphicsContext): TRenderData
    {
        const maxTextures = this._renderer.limits.maxBatchableTextures;
        const gpuContext = this._getGpuData(context);
        const graphicsData = this._getRenderData(maxTextures, gpuContext);
        const { batches } = gpuContext;

        gpuContext.graphicsData = graphicsData;

        const { attributes, indices } = this._getGeometrySize(gpuContext);

        for (let i = 0; i < batches.length; i++)
        {
            batches[i].applyTransform = false;
        }

        const batcher = graphicsData.batcher;

        // TODO we can pool buffers here eventually..
        batcher.ensureAttributeBuffer(attributes);
        batcher.ensureIndexBuffer(indices);

        batcher.begin();

        for (let i = 0; i < batches.length; i++)
        {
            batcher.add(batches[i]);
        }

        batcher.finish(graphicsData.instructions);

        const geometry = batcher.geometry;

        // not to self - this works as we are assigning the batchers array buffer
        // once its up loaded - this buffer is then put back in the pool to be reused.
        // this mean we don't have to creating new Batchers for each graphics items
        geometry.indexBuffer.setDataWithSize(batcher.indexBuffer, batcher.indexSize, true);
        geometry.buffers[0].setDataWithSize(batcher.attributeBuffer.float32View, batcher.attributeSize, true);

        const drawBatches = batcher.batches;

        for (let i = 0; i < batcher.batchIndex; i++)
        {
            const batch = drawBatches[i];

            batch.bindGroup = getTextureBatchBindGroup(
                batch.textures.textures,
                batch.textures.count,
                maxTextures
            );
        }

        return graphicsData;
    }

    private _initContext(context: GraphicsContext): TGpuContext
    {
        const gpuContext = this._createGpuContext();

        gpuContext.context = context;

        (context._gpuData as Record<number, GPUData>)[this._renderer.uid] = gpuContext;

        this._managedContexts.add(context);

        return gpuContext;
    }

    public destroy()
    {
        this._managedContexts.destroy();
        (this._renderer as null) = null;
    }
}
