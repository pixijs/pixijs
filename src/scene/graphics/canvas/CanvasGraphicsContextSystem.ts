import { ExtensionType } from '../../../extensions/Extensions';
import { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import { GCManagedHash } from '../../../utils/data/GCManagedHash';
import { type GPUData } from '../../view/ViewContainer';

import type { System } from '../../../rendering/renderers/shared/system/System';
import type { Renderer } from '../../../rendering/renderers/types';
import type { GraphicsContext } from '../shared/GraphicsContext';
import type { GraphicsContextSystemOptions } from '../shared/GraphicsContextSystem';

class CanvasGraphicsContext implements GPUData
{
    /**
     * Whether this context can be batched.
     * @advanced
     */
    public isBatchable = false;
    /**
     * The source GraphicsContext.
     * @advanced
     */
    public context: GraphicsContext;
    /**
     * Render data for this context.
     * @advanced
     */
    public graphicsData: CanvasGraphicsContextRenderData;

    /**
     * Reset cached canvas data.
     * @advanced
     */
    public reset()
    {
        this.isBatchable = false;
        this.context = null;

        if (this.graphicsData)
        {
            this.graphicsData.destroy();
            this.graphicsData = null;
        }
    }

    /**
     * Destroy the cached data.
     * @advanced
     */
    public destroy()
    {
        this.reset();
    }
}

class CanvasGraphicsContextRenderData
{
    /**
     * Instructions for canvas rendering.
     * @advanced
     */
    public instructions = new InstructionSet();

    /**
     * Initialize render data.
     * @advanced
     */
    public init(): void
    {
        this.instructions.reset();
    }

    /**
     * Destroy render data.
     * @advanced
     */
    public destroy(): void
    {
        this.instructions.destroy();
        (this.instructions as null) = null;
    }
}

/**
 * A system that manages the rendering of GraphicsContexts for Canvas2D.
 * @category rendering
 * @advanced
 */
export class CanvasGraphicsContextSystem implements System<GraphicsContextSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
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
        CanvasGraphicsContextSystem.defaultOptions.bezierSmoothness = options?.bezierSmoothness
            ?? CanvasGraphicsContextSystem.defaultOptions.bezierSmoothness;
    }

    /**
     * Returns the render data for a given GraphicsContext.
     * @param context - The GraphicsContext to get the render data for.
     * @internal
     */
    public getContextRenderData(context: GraphicsContext): CanvasGraphicsContextRenderData
    {
        const gpuContext = this.getGpuContext(context);

        return gpuContext.graphicsData || this._initContextRenderData(context);
    }

    /**
     * Updates the GPU context for a given GraphicsContext.
     * @param context - The GraphicsContext to update.
     * @returns The updated CanvasGraphicsContext.
     * @internal
     */
    public updateGpuContext(context: GraphicsContext)
    {
        const gpuData = context._gpuData as unknown as Record<number | string, CanvasGraphicsContext>;
        const hasContext = !!gpuData[this._renderer.uid];
        const gpuContext = gpuData[this._renderer.uid] || this._initContext(context);

        if (context.dirty || !hasContext)
        {
            if (hasContext)
            {
                gpuContext.reset();
            }

            gpuContext.isBatchable = false;
            context.dirty = false;
        }

        return gpuContext;
    }

    /**
     * Returns the CanvasGraphicsContext for a given GraphicsContext.
     * If it does not exist, it will initialize a new one.
     * @param context - The GraphicsContext to get the CanvasGraphicsContext for.
     * @returns The CanvasGraphicsContext for the given GraphicsContext.
     * @internal
     */
    public getGpuContext(context: GraphicsContext): CanvasGraphicsContext
    {
        const gpuData = context._gpuData as unknown as Record<number | string, CanvasGraphicsContext>;

        return gpuData[this._renderer.uid] || this._initContext(context);
    }

    private _initContextRenderData(context: GraphicsContext): CanvasGraphicsContextRenderData
    {
        const renderData = new CanvasGraphicsContextRenderData();
        const gpuContext = this.getGpuContext(context);

        gpuContext.graphicsData = renderData;

        renderData.init();

        return renderData;
    }

    private _initContext(context: GraphicsContext): CanvasGraphicsContext
    {
        const gpuContext = new CanvasGraphicsContext();

        gpuContext.context = context;
        (context._gpuData as unknown as Record<number | string, CanvasGraphicsContext>)[this._renderer.uid] = gpuContext;

        this._managedContexts.add(context);

        return gpuContext;
    }

    public destroy()
    {
        this._managedContexts.destroy();
        (this._renderer as null) = null;
    }
}
