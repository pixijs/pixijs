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
    /**
     * The resources that are bound together for use by a shader, keyed by binding number.
     *
     * Treat this as read-only and use {@link BindGroup#setResource} to add or replace a resource.
     * A direct write skips the bind group's change tracking: the GPU bind group is not rebuilt,
     * and the renderer never syncs the new resource's uniforms or marks it as in use.
     * @readonly
     */
    public resources: Record<string, BindResource> = Object.create(null);

    /**
     * The binding numbers in use in {@link BindGroup#resources}, ascending. Binding numbers can
     * have gaps, so per-draw loops index this list instead of running `for...in` over
     * `resources`, which builds a fresh key list on every call for integer keys.
     * @internal
     */
    public get _resourceKeys(): number[]
    {
        // built on first use after setResource adds a binding number, so the array is sized
        // exactly — growing it with push() reserves ~17 slots for a group that holds 1 to 4
        this._resourceKeysValue ??= Object.keys(this.resources).map(Number);

        return this._resourceKeysValue;
    }

    private _resourceKeysValue: number[] = null;

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
            let index = 0;

            for (const i in this.resources)
            {
                // -1 marks a destroyed buffer-like resource's null slot
                keyParts[index++] = this.resources[i] ? this.resources[i]._resourceId : -1;
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

        // a destroyed resource leaves null, not undefined, so this is only true for a new binding
        if (currentResource === undefined)
        {
            this._resourceKeysValue = null;
        }

        this.resources[index] = resource;
        this._dirty = true;
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
     * @internal
     */
    public _touch(now: number): void
    {
        const resources = this.resources;
        const keys = this._resourceKeys;

        for (let i = 0; i < keys.length; i++)
        {
            const resource = resources[keys[i]] as BindResource & GCable;

            if (!resource) continue;

            resource._gcLastUsed = now;
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
        this._resourceKeysValue = null;
    }

    protected onResourceChange(resource: BindResource)
    {
        this._dirty = true;

        // A destroyed resource must not stay bound — null the slot. Consumers tolerate the
        // null; actually rendering with it raises a clear error in BindGroupSystem.
        if (resource.destroyed)
        {
            const resources = this.resources;

            for (const i in resources)
            {
                if (resources[i] === resource)
                {
                    resources[i] = null;
                }
            }

            // #if _DEBUG
            warn(`[BindGroup] a '${resource._resourceType}' was destroyed while still bound to a shader. `
                + 'Remove it from the shader before destroying it.');
            // #endif
        }
    }
}
