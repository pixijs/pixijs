import { ExtensionType } from '../../../extensions/Extensions';
import { getTextureBatchBindGroup } from '../../../rendering/batcher/gpu/getTextureBatchBindGroup';
import { DefaultBatcher } from '../../../rendering/batcher/shared/DefaultBatcher';
import { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import { deprecation, v8_3_4 } from '../../../utils/logging/deprecation';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { buildContextBatches } from './utils/buildContextBatches';

import type { Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { System } from '../../../rendering/renderers/shared/system/System';
import type { Renderer } from '../../../rendering/renderers/types';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { BatchableGraphics } from './BatchableGraphics';
import type { GraphicsContext } from './GraphicsContext';

interface GeometryData
{
    vertices: number[];
    uvs: number[];
    indices: number[];
}

/**
 * A class that holds batchable graphics data for a GraphicsContext.
 * @memberof rendering
 * @ignore
 */
export class GpuGraphicsContext
{
    public isBatchable: boolean;
    public context: GraphicsContext;

    public batches: BatchableGraphics[] = [];
    public geometryData: GeometryData = {
        vertices: [],
        uvs: [],
        indices: [],
    };
    public graphicsData: GraphicsContextRenderData;
}

/**
 * A class that holds the render data for a GraphicsContext.
 * @memberof rendering
 * @ignore
 */
export class GraphicsContextRenderData
{
    public batcher: Batcher = new DefaultBatcher();
    public instructions = new InstructionSet();

    public init()
    {
        this.instructions.reset();
    }

    /**
     * @deprecated since version 8.0.0
     * Use `batcher.geometry` instead.
     * @see {Batcher#geometry}
     */
    get geometry()
    {
        // #if _DEBUG
        deprecation(v8_3_4, 'GraphicsContextRenderData#geometry is deprecated, please use batcher.geometry instead.');
        // #endif

        return this.batcher.geometry;
    }
}

/**
 * Options for the GraphicsContextSystem.
 * @memberof rendering
 */
export interface GraphicsContextSystemOptions
{
    /** A value from 0 to 1 that controls the smoothness of bezier curves (the higher the smoother) */
    bezierSmoothness?: number;
}

/**
 * A system that manages the rendering of GraphicsContexts.
 * @memberof rendering
 */
export class GraphicsContextSystem implements System<GraphicsContextSystemOptions>
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

    /** The default options for the GraphicsContextSystem. */
    public static readonly defaultOptions: GraphicsContextSystemOptions = {
        /**
         * A value from 0 to 1 that controls the smoothness of bezier curves (the higher the smoother)
         * @default 0.5
         */
        bezierSmoothness: 0.5,
    };

    // the root context batches, used to either make a batch or geometry
    // all graphics use this as a base
    private _gpuContextHash: Record<number, GpuGraphicsContext> = {};
    // used for non-batchable graphics
    private _graphicsDataContextHash: Record<number, GraphicsContextRenderData> = Object.create(null);

    constructor(renderer: Renderer)
    {
        renderer.renderableGC.addManagedHash(this, '_gpuContextHash');
        renderer.renderableGC.addManagedHash(this, '_graphicsDataContextHash');
    }

    /**
     * Runner init called, update the default options
     * @ignore
     */
    public init(options?: GraphicsContextSystemOptions)
    {
        GraphicsContextSystem.defaultOptions.bezierSmoothness = options?.bezierSmoothness
            ?? GraphicsContextSystem.defaultOptions.bezierSmoothness;
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

            buildContextBatches(context, gpuContext);

            const batchMode = context.batchMode;

            if (context.customShader || batchMode === 'no-batch')
            {
                gpuContext.isBatchable = false;
            }
            else if (batchMode === 'auto')
            {
                gpuContext.isBatchable = (gpuContext.geometryData.vertices.length < 400);
            }

            context.dirty = false;
        }

        return gpuContext;
    }

    public getGpuContext(context: GraphicsContext): GpuGraphicsContext
    {
        return this._gpuContextHash[context.uid] || this._initContext(context);
    }

    private _initContextRenderData(context: GraphicsContext): GraphicsContextRenderData
    {
        const graphicsData: GraphicsContextRenderData = BigPool.get(GraphicsContextRenderData);// ();

        const { batches, geometryData } = this._gpuContextHash[context.uid];

        const vertexSize = geometryData.vertices.length;
        const indexSize = geometryData.indices.length;

        for (let i = 0; i < batches.length; i++)
        {
            batches[i].applyTransform = false;
        }

        const batcher = graphicsData.batcher;

        // TODO we can pool buffers here eventually..
        batcher.ensureAttributeBuffer(vertexSize);
        batcher.ensureIndexBuffer(indexSize);

        batcher.begin();

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batcher.add(batch);
        }

        batcher.finish(graphicsData.instructions);

        const geometry = batcher.geometry;

        // not to self - this works as we are assigning the batchers array buffer
        // once its up loaded - this buffer is then put back in the pool to be reused.
        // this mean we don't have to creating new Batchers for each graphics items
        geometry.indexBuffer.setDataWithSize(batcher.indexBuffer, batcher.indexSize, true);
        geometry.buffers[0].setDataWithSize(batcher.attributeBuffer.float32View, batcher.attributeSize, true);

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

        gpuContext.context = context;

        this._gpuContextHash[context.uid] = gpuContext;

        context.on('destroy', this.onGraphicsContextDestroy, this);

        return this._gpuContextHash[context.uid];
    }

    protected onGraphicsContextDestroy(context: GraphicsContext)
    {
        this._cleanGraphicsContextData(context);

        context.off('destroy', this.onGraphicsContextDestroy, this);

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
        // Clean up all graphics contexts

        for (const i in this._gpuContextHash)
        {
            if (this._gpuContextHash[i])
            {
                this.onGraphicsContextDestroy(this._gpuContextHash[i].context);
            }
        }
    }
}
