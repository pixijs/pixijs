import { ExtensionType } from '../../../../extensions/Extensions';
import { deprecation } from '../../../../utils/logging/deprecation';

import type { Renderer } from '../../types';
import type { Renderable } from '../Renderable';
import type { System } from '../system/System';

/**
 * Options for the {@link RenderableGCSystem}.
 * @category rendering
 * @property {boolean} [renderableGCActive=true] - If set to true, this will enable the garbage collector on the renderables.
 * @property {number} [renderableGCAMaxIdle=60000] -
 * The maximum idle frames before a texture is destroyed by garbage collection.
 * @property {number} [renderableGCCheckCountMax=60000] - time between two garbage collections.
 * @advanced
 * @deprecated since 8.15.0
 */
export interface RenderableGCSystemOptions
{
    /**
     * If set to true, this will enable the garbage collector on the GPU.
     * @default true
     */
    renderableGCActive: boolean;
    /**
     * The maximum idle frames before a texture is destroyed by garbage collection.
     * @default 60 * 60
     */
    renderableGCMaxUnusedTime: number;
    /**
     * Frames between two garbage collections.
     * @default 600
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
 * @example
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
 * @category rendering
 * @advanced
 * @deprecated since 8.15.0
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
            ExtensionType.CanvasSystem,
        ],
        name: 'renderableGC',
        priority: 0
    } as const;

    /**
     * Default configuration options for the garbage collection system.
     * These can be overridden when initializing the renderer.
     * @deprecated since 8.15.0
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
    }

    /**
     * Gets whether the garbage collection system is currently enabled.
     * @returns True if GC is enabled, false otherwise
     */
    get enabled(): boolean
    {
        // #if _DEBUG
        deprecation('8.15.0', 'RenderableGCSystem.enabled is deprecated, please use the GCSystem.enabled instead.');
        // #endif

        return this._renderer.gc.enabled;
    }

    /**
     * Enables or disables the garbage collection system.
     * When enabled, schedules periodic cleanup of resources.
     * When disabled, cancels all scheduled cleanups.
     */
    set enabled(value: boolean)
    {
        // #if _DEBUG
        deprecation('8.15.0', 'RenderableGCSystem.enabled is deprecated, please use the GCSystem.enabled instead.');
        // #endif
        this._renderer.gc.enabled = value;
    }

    /**
     * Adds a hash table to be managed by the garbage collector.
     * @param context - The object containing the hash table
     * @param hash - The property name of the hash table
     */
    public addManagedHash<T>(context: T, hash: string): void
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation('8.15.0', 'RenderableGCSystem.addManagedHash is deprecated, please use the GCSystem.addCollection instead.');
        // #endif
        this._renderer.gc.addCollection(context, hash, 'hash');
    }

    /**
     * Adds an array to be managed by the garbage collector.
     * @param context - The object containing the array
     * @param hash - The property name of the array
     */
    public addManagedArray<T>(context: T, hash: string): void
    {
        // #if _DEBUG
        // eslint-disable-next-line max-len
        deprecation('8.15.0', 'RenderableGCSystem.addManagedArray is deprecated, please use the GCSystem.addCollection instead.');
        // #endif
        this._renderer.gc.addCollection(context, hash, 'array');
    }

    /**
     * Starts tracking a renderable for garbage collection.
     * @param _renderable - The renderable to track
     * @deprecated since 8.15.0
     */
    public addRenderable(_renderable: Renderable): void
    {
        // #if _DEBUG
        deprecation('8.15.0', 'RenderableGCSystem.addRenderable is deprecated, please use the GCSystem instead.');
        // #endif
        this._renderer.gc.addResource(_renderable, 'renderable');
    }

    /**
     * Performs garbage collection by cleaning up unused renderables.
     * Removes renderables that haven't been used for longer than maxUnusedTime.
     */
    public run(): void
    {
        // #if _DEBUG
        deprecation('8.15.0', 'RenderableGCSystem.run is deprecated, please use the GCSystem instead.');
        // #endif
        this._renderer.gc.run();
    }

    /** Cleans up the garbage collection system. Disables GC and removes all tracked resources. */
    public destroy(): void
    {
        this._renderer = null as any as Renderer;
    }
}
