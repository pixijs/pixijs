import { ExtensionType } from '../../../extensions/Extensions';
import { type RenderGroup } from '../../../scene/container/RenderGroup';
import { cleanArray, cleanHash } from '../../../utils/data/clean';
import { type GPUDataOwner, type Renderer } from '../types';
import { type Renderable } from './Renderable';
import { type RenderOptions } from './system/AbstractRenderer';

import type EventEmitter from 'eventemitter3';
import type { System } from './system/System';

/**
 * Data stored on a GC-managed resource.
 * @category rendering
 * @advanced
 */
export interface GCData
{
    /** Index in the managed resources array */
    index?: number;
    /** Type of the resource */
    type: 'resource' | 'renderable';
}

/**
 * Interface for resources that can be garbage collected.
 * @category rendering
 * @advanced
 */
export interface GCable extends GPUDataOwner
{
    /** Timestamp of last use */
    _gcLastUsed: number;
    /** GC tracking data, null if not being tracked */
    _gcData?: GCData | null;
    /** If set to true, the resource will be garbage collected automatically when it is not used. */
    autoGarbageCollect?: boolean;
    /** An optional callback for when an item is touched */
    _onTouch?(now: number): void;
}

type GCableEventEmitter = GCable & Pick<EventEmitter, 'once' | 'off'>;

interface GCResourceHashEntry
{
    context: any;
    hash: string;
    type: GCData['type'];
    priority: number;
}

/**
 * Options for the {@link GCSystem}.
 * @category rendering
 * @advanced
 */
export interface GCSystemOptions
{
    /**
     * If set to true, this will enable the garbage collector.
     * @default true
     */
    gcActive: boolean;
    /**
     * The maximum time in milliseconds a resource can be unused before being garbage collected.
     * @default 60000
     */
    gcMaxUnusedTime: number;
    /**
     * How frequently to run garbage collection in milliseconds.
     * @default 30000
     */
    gcFrequency: number;
}

/**
 * A unified garbage collection system for managing GPU resources.
 * Resources register themselves with a cleanup callback and are automatically
 * cleaned up when they haven't been used for a specified amount of time.
 * @example
 * ```ts
 * // Register a resource for GC
 * gc.addResource(myResource, () => {
 *     // cleanup logic here
 *     myResource.unload();
 * });
 *
 * // Touch the resource when used (resets idle timer)
 * gc.touch(myResource);
 *
 * // Remove from GC tracking (e.g., on manual destroy)
 * gc.removeResource(myResource);
 * ```
 * @category rendering
 * @advanced
 */
export class GCSystem implements System<GCSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'gc',
        priority: 0,
    } as const;

    /** Default options for the GCSystem */
    public static defaultOptions: GCSystemOptions = {
        /** Enable/disable the garbage collector */
        gcActive: true,
        /** Time in ms before an unused resource is collected (default 1 minute) */
        gcMaxUnusedTime: 60000,
        /** How often to run garbage collection in ms (default 30 seconds) */
        gcFrequency: 30000,
    };

    /** Maximum time in ms a resource can be unused before being garbage collected */
    public maxUnusedTime: number;

    /** Reference to the renderer this system belongs to */
    private _renderer: Renderer;

    /** Array of resources being tracked for garbage collection */
    private readonly _managedResources: GCableEventEmitter[] = [];
    private readonly _managedResourceHashes: GCResourceHashEntry[] = [];
    private readonly _managedCollections: {context: any, collection: string, type: 'hash' | 'array'}[] = [];

    /** ID of the GC scheduler handler */
    private _handler: number;
    private _collectionsHandler: number;

    /** How frequently GC runs in ms */
    private _frequency: number;

    /** Current timestamp used for age calculations */
    public now: number;

    private _ready = false;

    /**
     * Creates a new GCSystem instance.
     * @param renderer - The renderer this garbage collection system works for
     */
    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    /**
     * Initializes the garbage collection system with the provided options.
     * @param options - Configuration options
     */
    public init(options: GCSystemOptions): void
    {
        options = { ...GCSystem.defaultOptions, ...options };

        this.maxUnusedTime = options.gcMaxUnusedTime;
        this._frequency = options.gcFrequency;

        this.enabled = options.gcActive;
        this.now = performance.now();
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
            this._handler = this._renderer.scheduler.repeat(
                () =>
                {
                    this._ready = true;
                },
                this._frequency,
                false
            );
            // Schedule periodic hash table cleanup
            this._collectionsHandler = this._renderer.scheduler.repeat(
                () =>
                {
                    for (const hash of this._managedCollections)
                    {
                        const { context, collection, type } = hash;

                        if (type === 'hash')
                        {
                            context[collection] = cleanHash(context[collection]);
                        }
                        else
                        {
                            context[collection] = cleanArray(context[collection]);
                        }
                    }
                },
                this._frequency
            );
        }
        else
        {
            this._renderer.scheduler.cancel(this._handler);
            this._renderer.scheduler.cancel(this._collectionsHandler);
            this._handler = 0;
            this._collectionsHandler = 0;
        }
    }

    /**
     * Called before rendering. Updates the current timestamp.
     * @param options - The render options
     * @param options.container - The container to render
     */
    protected prerender({ container }: RenderOptions): void
    {
        this.now = performance.now();
        container.renderGroup.gcTick = this._renderer.tick++;

        this._updateInstructionGCTick(container.renderGroup, container.renderGroup.gcTick);
    }

    /** Performs garbage collection after rendering. */
    protected postrender(): void
    {
        if (!this._ready || !this.enabled) return;

        this.run();
        this._ready = false;
    }

    /**
     * Updates the GC tick counter for a render group and its children.
     * @param renderGroup - The render group to update
     * @param gcTick - The new tick value
     */
    private _updateInstructionGCTick(renderGroup: RenderGroup, gcTick: number): void
    {
        renderGroup.instructionSet.gcTick = gcTick;
        renderGroup.gcTick = gcTick;

        for (const child of renderGroup.renderGroupChildren)
        {
            this._updateInstructionGCTick(child, gcTick);
        }
    }

    /**
     * Registers a collection for garbage collection tracking.
     * @param context - The object containing the collection
     * @param collection - The property name on context that holds the collection
     * @param type - The type of collection to track ('hash' or 'array')
     */
    public addCollection(context: any, collection: string, type: 'hash' | 'array'): void
    {
        this._managedCollections.push({
            context,
            collection,
            type,
        });
    }

    /**
     * Registers a resource for garbage collection tracking.
     * @param resource - The resource to track
     * @param type - The type of resource to track
     */
    public addResource(resource: GCableEventEmitter, type: GCData['type']): void
    {
        // Already being tracked
        if (resource._gcLastUsed !== -1)
        {
            resource._gcLastUsed = this.now;
            resource._onTouch?.(this.now);

            return;
        }

        const index = this._managedResources.length;

        resource._gcData = {
            index,
            type,
        };
        resource._gcLastUsed = this.now;
        resource._onTouch?.(this.now);
        resource.once('unload', this.removeResource, this);

        this._managedResources.push(resource);
    }

    /**
     * Removes a resource from garbage collection tracking.
     * Call this when manually destroying a resource.
     * @param resource - The resource to stop tracking
     */
    public removeResource(resource: GCable): void
    {
        const gcData = resource._gcData;

        if (!gcData) return;

        const index = gcData.index;
        const last = this._managedResources.length - 1;

        // Swap with last element for O(1) removal
        if (index !== last)
        {
            const lastResource = this._managedResources[last];

            this._managedResources[index] = lastResource;
            lastResource._gcData.index = index;
        }

        this._managedResources.length--;
        resource._gcData = null;
        resource._gcLastUsed = -1;
    }

    /**
     * Registers a hash-based resource collection for garbage collection tracking.
     * Resources in the hash will be automatically tracked and cleaned up when unused.
     * @param context - The object containing the hash property
     * @param hash - The property name on context that holds the resource hash
     * @param type - The type of resources in the hash ('resource' or 'renderable')
     * @param priority - Processing priority (lower values are processed first)
     */
    public addResourceHash(context: any, hash: string, type: GCData['type'], priority: number = 0): void
    {
        this._managedResourceHashes.push({
            context,
            hash,
            type,
            priority,
        });

        this._managedResourceHashes.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Performs garbage collection by cleaning up unused resources.
     * Removes resources that haven't been used for longer than maxUnusedTime.
     */
    public run(): void
    {
        const now = performance.now();
        const managedResourceHashes = this._managedResourceHashes;

        for (const hashEntry of managedResourceHashes)
        {
            this.runOnHash(hashEntry, now);
        }

        let writeIndex = 0;

        for (let i = 0; i < this._managedResources.length; i++)
        {
            const resource = this._managedResources[i];

            writeIndex = this.runOnResource(resource, now, writeIndex);
        }

        this._managedResources.length = writeIndex;
    }

    protected updateRenderableGCTick(renderable: Renderable & GCable, now: number): void
    {
        const renderGroup = renderable.renderGroup ?? renderable.parentRenderGroup;
        const currentTick = renderGroup?.instructionSet?.gcTick ?? -1;

        // Update last used time if the renderable's group was rendered this tick
        if ((renderGroup?.gcTick ?? 0) === currentTick)
        {
            renderable._gcLastUsed = now;
            renderable._onTouch?.(now);
        }
    }

    protected runOnResource(resource: GCableEventEmitter, now: number, writeIndex: number): number
    {
        const gcData = resource._gcData;

        // special case for renderables as we do not check every frame if they are being used
        if (gcData.type === 'renderable')
        {
            this.updateRenderableGCTick(resource as Renderable, now);
        }

        const isRecentlyUsed = now - resource._gcLastUsed < this.maxUnusedTime;

        if (isRecentlyUsed || !resource.autoGarbageCollect)
        {
            this._managedResources[writeIndex] = resource;
            gcData.index = writeIndex;
            writeIndex++;
        }
        else
        {
            // Call the cleanup function
            resource.unload();
            resource._gcData = null;
            resource._gcLastUsed = -1;
            resource.off('unload', this.removeResource, this);
        }

        return writeIndex;
    }

    /**
     * Creates a clone of the hash, copying all non-null entries up to (but not including) the stop key.
     * @param hashValue - The original hash to clone from
     * @param stopKey - The key to stop at (exclusive)
     * @returns A new hash object with copied entries
     */
    private _createHashClone(hashValue: Record<string, GCable>, stopKey: string): Record<string, GCable>
    {
        const hashClone: Record<string, GCable> = Object.create(null);

        for (const k in hashValue)
        {
            if (k === stopKey) break;
            if (hashValue[k] !== null) hashClone[k] = hashValue[k];
        }

        return hashClone;
    }

    protected runOnHash(hashEntry: GCResourceHashEntry, now: number): void
    {
        const { context, hash, type } = hashEntry;

        const hashValue = context[hash] as Record<string, GCable>;
        let hashClone: Record<string, GCable> | null = null;
        let nullCount = 0;

        for (const key in hashValue)
        {
            const resource = hashValue[key];

            // check if the value is null
            if (resource === null)
            {
                nullCount++;

                // Lazily create the clone to clean up null entries when threshold is reached
                if (nullCount === 10000 && !hashClone)
                {
                    hashClone = this._createHashClone(hashValue, key);
                }

                continue;
            }

            // If no GC data, then the resource has been added since the last garbage collection
            if (resource._gcLastUsed === -1)
            {
                resource._gcLastUsed = now;
                resource._onTouch?.(now);

                if (hashClone) hashClone[key] = resource;

                continue;
            }

            // special case for renderables as we do not check every frame if they are being used
            if (type === 'renderable')
            {
                this.updateRenderableGCTick(resource as Renderable, now);
            }

            const isRecentlyUsed = now - resource._gcLastUsed < this.maxUnusedTime;

            if (!isRecentlyUsed && resource.autoGarbageCollect)
            {
                // Lazily create the clone only when we need to remove something
                if (!hashClone)
                {
                    // we can set the value to null here to avoid having to create a new hash object
                    // only when it crosses the 10000 threshold do we need to create a new hash object
                    if (nullCount + 1 !== 10000)
                    {
                        hashValue[key] = null;
                        nullCount++;
                    }
                    else
                    {
                        hashClone = this._createHashClone(hashValue, key);
                    }
                }

                if (type === 'renderable')
                {
                    const res = resource as Renderable;
                    const renderGroup = res.renderGroup ?? res.parentRenderGroup;

                    if (renderGroup) renderGroup.structureDidChange = true;
                }

                // Call the cleanup function
                resource.unload();
                resource._gcData = null;
                resource._gcLastUsed = -1;
            }
            else if (hashClone)
            {
                hashClone[key] = resource;
            }
        }

        // Only replace the hash if something was removed
        if (hashClone)
        {
            context[hash] = hashClone;
        }
    }

    /** Cleans up the garbage collection system. Disables GC and removes all tracked resources. */
    public destroy(): void
    {
        this.enabled = false;

        this._managedResources.forEach((resource) =>
        {
            resource.off('unload', this.removeResource, this);
        });
        this._managedResources.length = 0;
        this._managedResourceHashes.length = 0;
        this._managedCollections.length = 0;
        this._renderer = null as any as Renderer;
    }
}
