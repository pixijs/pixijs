import { warn } from '../../../../utils/logging/warn';
import { type GCable } from '../../shared/GCSystem';

import type { BindResource } from './BindResource';

/**
 * A bind group is a collection of resources that are bound together for use by a shader.
 * They are essentially a wrapper for the WebGPU BindGroup class. But with the added bonus
 * that WebGL can also work with them.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpubindgroupdescriptor
 * @example
 * // Create a bind group with a single texture and sampler
 * const bindGroup = new BindGroup({
 *    uTexture: texture.source,
 *    uTexture: texture.style,
 * });
 *
 * Bind groups resources must implement the {@link BindResource} interface.
 * The following resources are supported:
 * - {@link TextureSource}
 * - {@link TextureStyle}
 * - {@link Buffer}
 * - {@link BufferResource}
 * - {@link UniformGroup}
 *
 * The keys in the bind group must correspond to the names of the resources in the GPU program.
 *
 * This bind group class will also watch for changes in its resources ensuring that the changes
 * are reflected in the WebGPU BindGroup.
 * @category rendering
 * @advanced
 */
export class BindGroup
{
    /** The resources that are bound together for use by a shader. */
    public resources: Record<string, BindResource> = Object.create(null);

    /**
     * A cached array of the keys in `resources`, lazily rebuilt when the map changes.
     * The GPU encoder iterates this instead of the null-prototype map itself, since
     * enumerating that map with `for-in` allocates a fresh key list on every draw call.
     * @internal
     */
    public get _resourceKeys(): string[]
    {
        if (!this._resourceKeysCache)
        {
            this._resourceKeysCache = Object.keys(this.resources ?? {});
        }

        return this._resourceKeysCache;
    }

    private _resourceKeysCache: string[] | null = null;

    /**
     * A key used internally to match it up to a WebGPU BindGroup.
     * Lazily rebuilt from resource IDs when dirty.
     * @internal
     */
    public get _key(): string
    {
        if (this._dirty)
        {
            this._dirty = false;

            const keyParts = [];
            const keys = this._resourceKeys;

            for (let i = 0; i < keys.length; i++)
            {
                // -1 marks a destroyed buffer-like resource's null slot
                const resource = this.resources[keys[i]];

                keyParts[i] = resource ? resource._resourceId : -1;
            }

            this._keyValue = keyParts.join('|');
        }

        return this._keyValue;
    }

    private _keyValue: string;
    private _dirty = true;

    /**
     * Create a new instance of the Bind Group.
     * @param resources - The resources that are bound together for use by a shader.
     */
    constructor(resources?: Record<string, BindResource>)
    {
        let index = 0;

        for (const i in resources)
        {
            const resource: BindResource = resources[i];

            this.setResource(resource, index++);
        }
    }

    /**
     * Set a resource at a given index. This function will
     * ensure that listeners will be removed from the current resource
     * and added to the new resource.
     * @param resource - The resource to set.
     * @param index - The index to set the resource at.
     */
    public setResource(resource: BindResource, index: number): void
    {
        const currentResource = this.resources[index];

        if (resource === currentResource) return;

        if (currentResource)
        {
            currentResource.off?.('change', this.onResourceChange, this);
        }

        resource.on?.('change', this.onResourceChange, this);

        this.resources[index] = resource;
        this._dirty = true;
        this._resourceKeysCache = null;
    }

    /**
     * Returns the resource at the current specified index.
     * @param index - The index of the resource to get.
     * @returns - The resource at the specified index.
     */
    public getResource(index: number): BindResource
    {
        return this.resources[index];
    }

    /**
     * Used internally to 'touch' each resource, to ensure that the GC
     * knows that all resources in this bind group are still being used.
     * @param now - The current time in milliseconds.
     * @param tick - The current tick.
     * @internal
     */
    public _touch(now: number, tick: number): void
    {
        const resources = this.resources;
        const keys = this._resourceKeys;

        for (let i = 0; i < keys.length; i++)
        {
            const resource = resources[keys[i]] as BindResource & GCable;

            if (!resource) continue;

            resource._gcLastUsed = now;
            resource._touched = tick;
        }
    }

    /** Destroys this bind group and removes all listeners. */
    public destroy()
    {
        const resources = this.resources;

        for (const i in resources)
        {
            const resource = resources[i];

            resource?.off?.('change', this.onResourceChange, this);
        }

        this.resources = null;
        this._resourceKeysCache = null;
    }

    protected onResourceChange(resource: BindResource)
    {
        this._dirty = true;

        // A destroyed resource must not stay bound — null the slot. Consumers tolerate the
        // null; actually rendering with it raises a clear error in BindGroupSystem.
        if (resource.destroyed)
        {
            const resources = this.resources;
            const keys = this._resourceKeys;

            for (let i = 0; i < keys.length; i++)
            {
                if (resources[keys[i]] === resource)
                {
                    resources[keys[i]] = null;
                }
            }

            this._resourceKeysCache = null;

            // #if _DEBUG
            warn(`[BindGroup] a '${resource._resourceType}' was destroyed while still bound to a shader. `
                + 'Remove it from the shader before destroying it.');
            // #endif
        }
    }
}
