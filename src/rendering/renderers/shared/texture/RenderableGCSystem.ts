import { ExtensionType } from '../../../../extensions/Extensions';
import { type RenderGroup } from '../../../../scene/container/RenderGroup';
import { cleanArray, cleanHash } from '../../../../utils/data/clean';
import { type RenderOptions } from '../system/AbstractRenderer';

import type { Container } from '../../../../scene/container/Container';
import type { Renderer } from '../../types';
import type { RenderPipe } from '../instructions/RenderPipe';
import type { Renderable } from '../Renderable';
import type { System } from '../system/System';

let renderableGCTick = 0;

/**
 * Options for the {@link RenderableGCSystem}.
 * @memberof rendering
 * @property {boolean} [renderableGCActive=true] - If set to true, this will enable the garbage collector on the renderables.
 * @property {number} [renderableGCAMaxIdle=60000] -
 * The maximum idle frames before a texture is destroyed by garbage collection.
 * @property {number} [renderableGCCheckCountMax=60000] - time between two garbage collections.
 */
export interface RenderableGCSystemOptions
{
    /**
     * If set to true, this will enable the garbage collector on the GPU.
     * @default true
     * @memberof rendering.SharedRendererOptions
     */
    renderableGCActive: boolean;
    /**
     * The maximum idle frames before a texture is destroyed by garbage collection.
     * @default 60 * 60
     * @memberof rendering.SharedRendererOptions
     */
    renderableGCMaxUnusedTime: number;
    /**
     * Frames between two garbage collections.
     * @default 600
     * @memberof rendering.SharedRendererOptions
     */
    renderableGCFrequency: number;
}

/**
 * The RenderableGCSystem is responsible for cleaning up GPU resources that are no longer being used.
 *
 * When rendering objects like sprites, text, etc - GPU resources are created and managed by the renderer.
 * If these objects are no longer needed but not properly destroyed (via sprite.destroy()), their GPU resources
 * would normally leak. This system prevents that by automatically cleaning up unused GPU resources.
 *
 * Key features:
 * - Runs every 30 seconds by default to check for unused resources
 * - Cleans up resources not rendered for over 1 minute
 * - Works independently of rendering - will clean up even when not actively rendering
 * - When cleaned up resources are needed again, new GPU objects are quickly assigned from a pool
 * - Can be disabled with renderableGCActive:false for manual control
 *
 * Best practices:
 * - Always call destroy() explicitly when done with renderables (e.g. sprite.destroy())
 * - This system is a safety net, not a replacement for proper cleanup
 * - Adjust frequency and timeouts via options if needed
 *
 * Example:
 * ```js
 * // Sprite created but reference lost without destroy
 * let sprite = new Sprite(texture);
 *
 * // internally the renderer will assign a resource to the sprite
 * renderer.render(sprite);
 *
 * sprite = null; // Reference lost but GPU resources still exist
 *
 * // After 1 minute of not being rendered:
 * // - RenderableGC will clean up the sprite's GPU resources
 * // - JS garbage collector can then clean up the sprite itself
 * ```
 * @implements {System<RenderableGCSystemOptions>}
 */
export class RenderableGCSystem implements System<RenderableGCSystemOptions>
{
    /**
     * Extension metadata for registering this system with the renderer.
     * @ignore
     */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'renderableGC',
        priority: 0
    } as const;

    /**
     * Default configuration options for the garbage collection system.
     * These can be overridden when initializing the renderer.
     */
    public static defaultOptions: RenderableGCSystemOptions = {
        /** Enable/disable the garbage collector */
        renderableGCActive: true,
        /** Time in ms before an unused resource is collected (default 1 minute) */
        renderableGCMaxUnusedTime: 60000,
        /** How often to run garbage collection in ms (default 30 seconds) */
        renderableGCFrequency: 30000,
    };

    /** Maximum time in ms a resource can be unused before being garbage collected */
    public maxUnusedTime: number;

    /** Reference to the renderer this system belongs to */
    private _renderer: Renderer;

    /** Array of renderables being tracked for garbage collection */
    private readonly _managedRenderables: Renderable[] = [];
    /** ID of the main GC scheduler handler */
    private _handler: number;
    /** How frequently GC runs in ms */
    private _frequency: number;
    /** Current timestamp used for age calculations */
    private _now: number;

    /** Array of hash objects being tracked for cleanup */
    private readonly _managedHashes: {context: any, hash: string}[] = [];
    /** ID of the hash cleanup scheduler handler */
    private _hashHandler: number;

    /** Array of arrays being tracked for cleanup */
    private readonly _managedArrays: {context: any, hash: string}[] = [];
    /** ID of the array cleanup scheduler handler */
    private _arrayHandler: number;

    /**
     * Creates a new RenderableGCSystem instance.
     * @param renderer - The renderer this garbage collection system works for
     */
    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    /**
     * Initializes the garbage collection system with the provided options.
     * @param options - Configuration options for the renderer
     */
    public init(options: RenderableGCSystemOptions): void
    {
        options = { ...RenderableGCSystem.defaultOptions, ...options };

        this.maxUnusedTime = options.renderableGCMaxUnusedTime;
        this._frequency = options.renderableGCFrequency;

        this.enabled = options.renderableGCActive;
    }

    /**
     * Gets whether the garbage collection system is currently enabled.
     * @returns True if GC is enabled, false otherwise
     */
    get enabled(): boolean
    {
        return !!this._handler;
    }

    /**
     * Enables or disables the garbage collection system.
     * When enabled, schedules periodic cleanup of resources.
     * When disabled, cancels all scheduled cleanups.
     */
    set enabled(value: boolean)
    {
        if (this.enabled === value) return;

        if (value)
        {
            // Schedule periodic garbage collection
            this._handler = this._renderer.scheduler.repeat(
                () => this.run(),
                this._frequency,
                false
            );

            // Schedule periodic hash table cleanup
            this._hashHandler = this._renderer.scheduler.repeat(
                () =>
                {
                    for (const hash of this._managedHashes)
                    {
                        hash.context[hash.hash] = cleanHash(hash.context[hash.hash]);
                    }
                },
                this._frequency
            );

            // Schedule periodic array cleanup
            this._arrayHandler = this._renderer.scheduler.repeat(
                () =>
                {
                    for (const array of this._managedArrays)
                    {
                        cleanArray(array.context[array.hash]);
                    }
                },
                this._frequency
            );
        }
        else
        {
            // Cancel all scheduled cleanups
            this._renderer.scheduler.cancel(this._handler);
            this._renderer.scheduler.cancel(this._hashHandler);
            this._renderer.scheduler.cancel(this._arrayHandler);
        }
    }

    /**
     * Adds a hash table to be managed by the garbage collector.
     * @param context - The object containing the hash table
     * @param hash - The property name of the hash table
     */
    public addManagedHash<T>(context: T, hash: string): void
    {
        this._managedHashes.push({ context, hash: hash as string });
    }

    /**
     * Adds an array to be managed by the garbage collector.
     * @param context - The object containing the array
     * @param hash - The property name of the array
     */
    public addManagedArray<T>(context: T, hash: string): void
    {
        this._managedArrays.push({ context, hash: hash as string });
    }

    /**
     * Updates the GC timestamp and tracking before rendering.
     * @param options - The render options
     * @param options.container - The container to render
     */
    public prerender({
        container
    }: RenderOptions): void
    {
        this._now = performance.now();

        // The gcTick is a monotonically increasing counter that tracks render cycles
        // Each time we render, we increment the global renderableGCTick counter
        // and assign the new tick value to the render group being rendered.
        // This lets us know which render groups were rendered in the current frame
        // versus ones that haven't been rendered recently.
        // The instruction set also gets updated with this tick value to track
        // when its renderables were last used.
        container.renderGroup.gcTick = renderableGCTick++;

        this._updateInstructionGCTick(container.renderGroup, container.renderGroup.gcTick);
    }

    /**
     * Starts tracking a renderable for garbage collection.
     * @param renderable - The renderable to track
     */
    public addRenderable(renderable: Renderable): void
    {
        if (!this.enabled) return;

        if (renderable._lastUsed === -1)
        {
            this._managedRenderables.push(renderable);
            renderable.once('destroyed', this._removeRenderable, this);
        }

        renderable._lastUsed = this._now;
    }

    /**
     * Performs garbage collection by cleaning up unused renderables.
     * Removes renderables that haven't been used for longer than maxUnusedTime.
     */
    public run(): void
    {
        const now = this._now;
        const managedRenderables = this._managedRenderables;
        const renderPipes = this._renderer.renderPipes;
        let offset = 0;

        for (let i = 0; i < managedRenderables.length; i++)
        {
            const renderable = managedRenderables[i];

            if (renderable === null)
            {
                offset++;
                continue;
            }

            const renderGroup = renderable.renderGroup ?? renderable.parentRenderGroup;
            const currentTick = renderGroup?.instructionSet?.gcTick ?? -1;

            // Update last used time if the renderable's group was rendered this tick
            if ((renderGroup?.gcTick ?? 0) === currentTick)
            {
                renderable._lastUsed = now;
            }

            // Clean up if unused for too long
            if (now - renderable._lastUsed > this.maxUnusedTime)
            {
                if (!renderable.destroyed)
                {
                    const rp = renderPipes as unknown as Record<string, RenderPipe>;

                    if (renderGroup)renderGroup.structureDidChange = true;

                    rp[renderable.renderPipeId].destroyRenderable(renderable);
                }

                renderable._lastUsed = -1;
                offset++;
                renderable.off('destroyed', this._removeRenderable, this);
            }
            else
            {
                managedRenderables[i - (offset)] = renderable;
            }
        }

        managedRenderables.length -= offset;
    }

    /** Cleans up the garbage collection system. Disables GC and removes all tracked resources. */
    public destroy(): void
    {
        this.enabled = false;
        this._renderer = null as any as Renderer;
        this._managedRenderables.length = 0;
        this._managedHashes.length = 0;
        this._managedArrays.length = 0;
    }

    /**
     * Removes a renderable from being tracked when it's destroyed.
     * @param renderable - The renderable to stop tracking
     */
    private _removeRenderable(renderable: Container): void
    {
        const index = this._managedRenderables.indexOf(renderable as Renderable);

        if (index >= 0)
        {
            renderable.off('destroyed', this._removeRenderable, this);
            this._managedRenderables[index] = null;
        }
    }

    /**
     * Updates the GC tick counter for a render group and its children.
     * @param renderGroup - The render group to update
     * @param gcTick - The new tick value
     */
    private _updateInstructionGCTick(renderGroup: RenderGroup, gcTick: number): void
    {
        renderGroup.instructionSet.gcTick = gcTick;

        for (const child of renderGroup.renderGroupChildren)
        {
            this._updateInstructionGCTick(child, gcTick);
        }
    }
}
