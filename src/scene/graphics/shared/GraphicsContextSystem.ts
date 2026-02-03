import { ExtensionType } from '../../../extensions/Extensions';
import { getTextureBatchBindGroup } from '../../../rendering/batcher/gpu/getTextureBatchBindGroup';
import { type BatcherOptions } from '../../../rendering/batcher/shared/Batcher';
import { DefaultBatcher } from '../../../rendering/batcher/shared/DefaultBatcher';
import { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import { GCManagedHash } from '../../../utils/data/GCManagedHash';
import { deprecation, v8_3_4 } from '../../../utils/logging/deprecation';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { type GPUData } from '../../view/ViewContainer';
import { buildContextBatches } from './utils/buildContextBatches';

import type { System } from '../../../rendering/renderers/shared/system/System';
import type { Renderer } from '../../../rendering/renderers/types';
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
 * @category rendering
 * @ignore
 */
export class GpuGraphicsContext implements GPUData
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

    public reset()
    {
        if (this.batches)
        {
            this.batches.forEach((batch) =>
            {
                BigPool.return(batch);
            });
        }
        if (this.graphicsData)
        {
            BigPool.return(this.graphicsData);
        }

        this.isBatchable = false;
        this.context = null;

        this.batches.length = 0;
        this.geometryData.indices.length = 0;
        this.geometryData.vertices.length = 0;
        this.geometryData.uvs.length = 0;

        this.graphicsData = null;
    }

    public destroy()
    {
        this.reset();
        this.batches = null;
        this.geometryData = null;
    }
}

/**
 * A class that holds the render data for a GraphicsContext.
 * @category rendering
 * @ignore
 */
export class GraphicsContextRenderData
{
    public batcher: DefaultBatcher;
    public instructions = new InstructionSet();

    public init(options: BatcherOptions)
    {
        const maxTextures = options.maxTextures;

        this.batcher ? this.batcher._updateMaxTextures(maxTextures) : this.batcher = new DefaultBatcher({ maxTextures });
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

    public destroy()
    {
        this.batcher.destroy();
        this.instructions.destroy();

        this.batcher = null;
        this.instructions = null;
    }
}

/**
 * Options for the GraphicsContextSystem.
 * @category rendering
 * @advanced
 */
export interface GraphicsContextSystemOptions
{
    /** A value from 0 to 1 that controls the smoothness of bezier curves (the higher the smoother) */
    bezierSmoothness?: number;
}

/**
 * A system that manages the rendering of GraphicsContexts.
 * @category rendering
 * @advanced
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

    private readonly _renderer: Renderer;
    private readonly _managedContexts: GCManagedHash<GraphicsContext>;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        this._managedContexts = new GCManagedHash({ renderer, type: 'resource', name: 'graphicsContext' });
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

    /**
     * Returns the render data for a given GraphicsContext.
     * @param context - The GraphicsContext to get the render data for.
     * @internal
     */
    public getContextRenderData(context: GraphicsContext): GraphicsContextRenderData
    {
        return context._gpuData[this._renderer.uid].graphicsData || this._initContextRenderData(context);
    }

    /**
     * Updates the GPU context for a given GraphicsContext.
     * If the context is dirty, it will rebuild the batches and geometry data.
     * @param context - The GraphicsContext to update.
     * @returns The updated GpuGraphicsContext.
     * @internal
     */
    public updateGpuContext(context: GraphicsContext)
    {
        const hasContext = !!context._gpuData[this._renderer.uid];
        const gpuContext: GpuGraphicsContext = context._gpuData[this._renderer.uid] || this._initContext(context);

        if (context.dirty || !hasContext)
        {
            if (hasContext)
            {
                gpuContext.reset();
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
            else
            {
                gpuContext.isBatchable = true;
            }

            context.dirty = false;
        }

        return gpuContext;
    }

    /**
     * Returns the GpuGraphicsContext for a given GraphicsContext.
     * If it does not exist, it will initialize a new one.
     * @param context - The GraphicsContext to get the GpuGraphicsContext for.
     * @returns The GpuGraphicsContext for the given GraphicsContext.
     * @internal
     */
    public getGpuContext(context: GraphicsContext): GpuGraphicsContext
    {
        return context._gpuData[this._renderer.uid] || this._initContext(context);
    }

    private _initContextRenderData(context: GraphicsContext): GraphicsContextRenderData
    {
        const graphicsData: GraphicsContextRenderData = BigPool.get(GraphicsContextRenderData, {
            maxTextures: this._renderer.limits.maxBatchableTextures,
        });

        const gpuContext = context._gpuData[this._renderer.uid];
        const { batches, geometryData } = gpuContext;

        gpuContext.graphicsData = graphicsData;

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

            batch.bindGroup = getTextureBatchBindGroup(
                batch.textures.textures,
                batch.textures.count,
                this._renderer.limits.maxBatchableTextures
            );
        }

        return graphicsData;
    }

    private _initContext(context: GraphicsContext): GpuGraphicsContext
    {
        const gpuContext = new GpuGraphicsContext();

        gpuContext.context = context;

        context._gpuData[this._renderer.uid] = gpuContext;

        this._managedContexts.add(context);

        return gpuContext;
    }

    public destroy()
    {
        this._managedContexts.destroy();
        (this._renderer as null) = null;
    }
}
