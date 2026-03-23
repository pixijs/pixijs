import { ExtensionType } from '../../../extensions/Extensions';
import { type BatcherOptions } from '../../../rendering/batcher/shared/Batcher';
import { DefaultBatcher } from '../../../rendering/batcher/shared/DefaultBatcher';
import { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import { deprecation, v8_3_4 } from '../../../utils/logging/deprecation';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { AbstractGpuGraphicsContext } from './AbstractGpuGraphicsContext';
import { AbstractGraphicsContextSystem } from './AbstractGraphicsContextSystem';
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
export class GpuGraphicsContext extends AbstractGpuGraphicsContext<BatchableGraphics, GraphicsContextRenderData>
{
    public geometryData: GeometryData = {
        vertices: [],
        uvs: [],
        indices: [],
    };

    public override reset()
    {
        super.reset();

        this.geometryData.indices.length = 0;
        this.geometryData.vertices.length = 0;
        this.geometryData.uvs.length = 0;
    }

    public override destroy()
    {
        super.destroy();
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
export class GraphicsContextSystem
    extends AbstractGraphicsContextSystem<GpuGraphicsContext, GraphicsContextRenderData>
    implements System<GraphicsContextSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
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

    constructor(renderer: Renderer)
    {
        super(renderer, 'graphicsContext');
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

    protected _createGpuContext(): GpuGraphicsContext
    {
        return new GpuGraphicsContext();
    }

    protected _buildContextData(context: GraphicsContext, gpuContext: GpuGraphicsContext): void
    {
        buildContextBatches(context, gpuContext);
    }

    protected _getVertexAndIndexCounts(gpuContext: GpuGraphicsContext): { vertices: number; indices: number }
    {
        return {
            vertices: gpuContext.geometryData.vertices.length,
            indices: gpuContext.geometryData.indices.length,
        };
    }

    protected _createRenderData(maxTextures: number): GraphicsContextRenderData
    {
        return BigPool.get(GraphicsContextRenderData, { maxTextures });
    }
}
