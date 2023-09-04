import { ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { BatchGeometry } from '../../batcher/gpu/BatchGeometry';
import { getTextureBatchBindGroup } from '../../batcher/gpu/getTextureBatchBindGroup';
import { Batcher } from '../../batcher/shared/Batcher';
import { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import { buildContextBatches } from './utils/buildContextBatches';

import type { PoolItem } from '../../../utils/pool/Pool';
import type { System } from '../../renderers/shared/system/System';
import type { BatchableGraphics } from './BatchableGraphics';
import type { GraphicsContext } from './GraphicsContext';

export class GpuGraphicsContext
{
    public isBatchable: boolean;
    public batches: BatchableGraphics[];
}

export class GraphicsContextRenderData
{
    public geometry = new BatchGeometry();
    public instructions = new InstructionSet();

    public init()
    {
        this.geometry.reset();
        this.instructions.reset();
    }
}

export class GraphicsContextSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'graphicsContext'
    } as const;

    // the root context batches, used to either make a batch or geometry
    // all graphics use this as a base
    private readonly _activeBatchers: Batcher[] = [];
    private _gpuContextHash: Record<number, GpuGraphicsContext> = {};
    // used for non-batchable graphics
    private _graphicsDataContextHash: Record<number, GraphicsContextRenderData> = Object.create(null);
    private readonly _needsContextNeedsRebuild: GraphicsContext[] = [];

    protected prerender()
    {
        this._returnActiveBatchers();
    }

    public getContextRenderData(context: GraphicsContext): GraphicsContextRenderData
    {
        return this._graphicsDataContextHash[context.uid] || this._initContextRenderData(context);
    }

    // Context management functions
    public updateGpuContext(context: GraphicsContext)
    {
        let gpuContext: GpuGraphicsContext = this._gpuContextHash[context.uid]

        || this._initContext(context);

        if (context.dirty)
        {
            if (gpuContext)
            {
                this._cleanGraphicsContextData(context);
            }
            else
            {
                gpuContext = this._initContext(context);
            }

            const contextBatches = buildContextBatches(context);

            let size = 0;

            const batchMode = context.batchMode;

            let isBatchable = true;
            // check the size...

            if (batchMode === 'auto')
            {
                for (let i = 0; i < contextBatches.length; i++)
                {
                    size += contextBatches[i].vertexSize;

                    if (size > 400)
                    {
                        isBatchable = false;
                        break;
                    }
                }
            }
            else if (batchMode === 'no-batch')
            {
                isBatchable = false;
            }

            gpuContext = this._gpuContextHash[context.uid] = {
                isBatchable,
                batches: contextBatches,
            };

            context.dirty = false;
        }

        return gpuContext;
    }

    public getGpuContext(context: GraphicsContext): GpuGraphicsContext
    {
        return this._gpuContextHash[context.uid] || this._initContext(context);
    }

    private _returnActiveBatchers()
    {
        for (let i = 0; i < this._activeBatchers.length; i++)
        {
            BigPool.return(this._activeBatchers[i] as PoolItem);
        }

        this._activeBatchers.length = 0;
    }

    private _initContextRenderData(context: GraphicsContext): GraphicsContextRenderData
    {
        const graphicsData: GraphicsContextRenderData = BigPool.get(GraphicsContextRenderData);// ();

        const batches = this._gpuContextHash[context.uid].batches;

        let vertexSize = 0;
        let indexSize = 0;

        batches.forEach((batch) =>
        {
            batch.applyTransform = false;
            vertexSize += batch.geometryData.vertices.length;
            indexSize += batch.geometryData.indices.length;
        });

        const batcher = BigPool.get(Batcher);

        this._activeBatchers.push(batcher);

        batcher.ensureAttributeBuffer(vertexSize);
        batcher.ensureIndexBuffer(indexSize);

        batcher.begin();

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batcher.add(batch);
        }

        batcher.finish(graphicsData.instructions);

        const geometry = graphicsData.geometry;

        geometry.indexBuffer.data = batcher.indexBuffer;

        // not to self - this works as we are assigning the batchers array buffer
        // once its up loaded - this buffer is then put back in the pool to be reused.
        // this mean we don't have to creating new Batchers for each graphics items
        geometry.buffers[0].data = batcher.attributeBuffer.float32View;

        geometry.indexBuffer.update(batcher.indexSize * 4);
        geometry.buffers[0].update(batcher.attributeSize * 4);

        const drawBatches = batcher.batches;

        for (let i = 0; i < drawBatches.length; i++)
        {
            const batch = drawBatches[i];

            batch.bindGroup = getTextureBatchBindGroup(batch.textures.textures, batch.textures.count);
        }

        this._graphicsDataContextHash[context.uid] = graphicsData;

        return graphicsData;
    }

    private _initContext(context: GraphicsContext): GpuGraphicsContext
    {
        const gpuContext = new GpuGraphicsContext();

        this._gpuContextHash[context.uid] = gpuContext;

        context.on('update', this.onGraphicsContextUpdate, this);
        context.on('destroy', this.onGraphicsContextDestroy, this);

        return this._gpuContextHash[context.uid];
    }

    protected onGraphicsContextUpdate(context: GraphicsContext)
    {
        this._needsContextNeedsRebuild.push(context);
    }

    protected onGraphicsContextDestroy(context: GraphicsContext)
    {
        this._cleanGraphicsContextData(context);
        this._gpuContextHash[context.uid] = null;
    }

    private _cleanGraphicsContextData(context: GraphicsContext)
    {
        const gpuContext: GpuGraphicsContext = this._gpuContextHash[context.uid];

        if (!gpuContext.isBatchable)
        {
            if (this._graphicsDataContextHash[context.uid])
            {
                BigPool.return(this.getContextRenderData(context) as PoolItem);

                // we will rebuild this...
                this._graphicsDataContextHash[context.uid] = null;
            }
        }

        if (gpuContext.batches)
        {
            gpuContext.batches.forEach((batch) =>
            {
                BigPool.return(batch as PoolItem);
            });
        }
    }

    public destroy()
    {
        // boom!
    }
}
