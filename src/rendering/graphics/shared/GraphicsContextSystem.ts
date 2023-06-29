import { ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { BatchGeometry } from '../../batcher/gpu/BatchGeometry';
import { getTextureBatchBindGroup } from '../../batcher/gpu/getTextureBatchBindGroup';
import { Batcher } from '../../batcher/shared/Batcher';
import { buildContextBatches } from './utils/buildContextBatches';

import type { PoolItem } from '../../../utils/pool/Pool';
import type { Batch } from '../../batcher/shared/Batcher';
import type { System } from '../../renderers/shared/system/System';
import type { BatchableGraphics } from './BatchableGraphics';
import type { GraphicsContext } from './GraphicsContext';

export class GpuGraphicsContext
{
    isBatchable: boolean;
    batches: BatchableGraphics[];
}

export class GraphicsContextRenderData
{
    geometry = new BatchGeometry();
    batches: Batch[] = [];

    init()
    {
        this.batches.length = 0;
        this.geometry.reset();
    }
}

export class GraphicsContextSystem implements System
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'graphicsContext'
    } as const;

    // the root context batches, used to either make a batch or geometry
    // all graphics use this as a base

    activeBatchers: Batcher[] = [];

    gpuContextHash: Record<number, GpuGraphicsContext> = {};

    // used for non-batchable graphics
    graphicsDataContextHash: Record<number, GraphicsContextRenderData> = {};

    private _needsContextNeedsRebuild: GraphicsContext[] = [];

    prerender()
    {
        this.returnActiveBatchers();
    }

    getContextRenderData(context: GraphicsContext): GraphicsContextRenderData
    {
        return this.graphicsDataContextHash[context.uid] || this.initContextRenderData(context);
    }

    // Context management functions
    updateGpuContext(context: GraphicsContext)
    {
        let gpuContext: GpuGraphicsContext = this.gpuContextHash[context.uid]

        || this.initContext(context);

        if (context.dirty)
        {
            if (gpuContext)
            {
                this.cleanGraphicsContextData(context);
            }
            else
            {
                gpuContext = this.initContext(context);
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

                    if (size > 100)
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

            gpuContext = this.gpuContextHash[context.uid] = {
                isBatchable,
                batches: contextBatches,
            };

            context.dirty = false;
        }

        return gpuContext;
    }

    getGpuContext(context: GraphicsContext): GpuGraphicsContext
    {
        return this.gpuContextHash[context.uid] || this.initContext(context);
    }

    private returnActiveBatchers()
    {
        for (let i = 0; i < this.activeBatchers.length; i++)
        {
            BigPool.return(this.activeBatchers[i] as PoolItem);
        }

        this.activeBatchers.length = 0;
    }

    private initContextRenderData(context: GraphicsContext): GraphicsContextRenderData
    {
        const graphicsData: GraphicsContextRenderData = BigPool.get(GraphicsContextRenderData);// ();

        const batches = this.gpuContextHash[context.uid].batches;

        let vertexSize = 0;
        let indexSize = 0;

        batches.forEach((batch) =>
        {
            batch.applyTransform = false;
            vertexSize += batch.geometryData.vertices.length;
            indexSize += batch.geometryData.indices.length;
        });

        const batcher = BigPool.get(Batcher);

        this.activeBatchers.push(batcher);

        batcher.ensureAttributeBuffer(vertexSize);
        batcher.ensureIndexBuffer(indexSize);

        batcher.begin();

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batcher.add(batch);
        }

        batcher.finish();

        const geometry = graphicsData.geometry;

        geometry.indexBuffer.data = batcher.indexBuffer;

        // not to self - this works as we are assigning the batchers array buffer
        // once its up loaded - this buffer is then put back in the pool to be reused.
        // this mean we don't have to creating new Batchers for each graphics items
        geometry.buffers[0].data = batcher.attributeBuffer.float32View;

        const drawBatches = batcher.batches;

        for (let i = 0; i < drawBatches.length; i++)
        {
            const batch = drawBatches[i];

            batch.textures.bindGroup = getTextureBatchBindGroup(batch.textures.textures);
        }

        this.graphicsDataContextHash[context.uid] = graphicsData;

        graphicsData.batches = drawBatches;

        return graphicsData;
    }

    private initContext(context: GraphicsContext): GpuGraphicsContext
    {
        const gpuContext = new GpuGraphicsContext();

        this.gpuContextHash[context.uid] = gpuContext;

        context.on('update', this.onGraphicsContextUpdate, this);
        context.on('destroy', this.onGraphicsContextDestroy, this);

        return this.gpuContextHash[context.uid];
    }

    protected onGraphicsContextUpdate(context: GraphicsContext)
    {
        this._needsContextNeedsRebuild.push(context);
    }

    protected onGraphicsContextDestroy(context: GraphicsContext)
    {
        this.cleanGraphicsContextData(context);
        this.gpuContextHash[context.uid] = null;
    }

    private cleanGraphicsContextData(context: GraphicsContext)
    {
        const gpuContext: GpuGraphicsContext = this.gpuContextHash[context.uid];

        if (!gpuContext.isBatchable)
        {
            if (this.graphicsDataContextHash[context.uid])
            {
                BigPool.return(this.getContextRenderData(context) as PoolItem);

                // we will rebuild this...
                this.graphicsDataContextHash[context.uid] = null;
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

    destroy()
    {
        // boom!
    }
}
