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
 * @memberof rendering
 */
export class BindGroup
{
    /** The resources that are bound together for use by a shader. */
    public resources: Record<string, BindResource> = Object.create(null);
    /**
     * a key used internally to match it up to a WebGPU Bindgroup
     * @internal
     * @ignore
     */
    public _key: string;
    private _dirty = true;

    /**
     * Create a new instance eof the Bind Group.
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

        this._updateKey();
    }

    /**
     * Updates the key if its flagged as dirty. This is used internally to
     * match this bind group to a WebGPU BindGroup.
     * @internal
     * @ignore
     */
    public _updateKey(): void
    {
        if (!this._dirty) return;

        this._dirty = false;

        const keyParts = [];
        let index = 0;

        // TODO - lets use big ints instead of strings...
        for (const i in this.resources)
        {
            // TODO make this consistent...
            keyParts[index++] = this.resources[i]._resourceId;
        }

        this._key = keyParts.join('|');
    }

    /**
     * Set a resource at a given index. this function will
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
            resource.off?.('change', this.onResourceChange, this);
        }

        resource.on?.('change', this.onResourceChange, this);

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
     * @param tick - The current tick.
     * @internal
     * @ignore
     */
    public _touch(tick: number)
    {
        const resources = this.resources;

        for (const i in resources)
        {
            resources[i]._touched = tick;
        }
    }

    /** Destroys this bind group and removes all listeners. */
    public destroy()
    {
        const resources = this.resources;

        for (const i in resources)
        {
            const resource = resources[i];

            resource.off?.('change', this.onResourceChange, this);
        }

        this.resources = null;
    }

    protected onResourceChange(resource: BindResource)
    {
        this._dirty = true;

        // check if a resource has been destroyed, if it has then we need to destroy this bind group
        // using this bind group with a destroyed resource will cause the renderer to explode :)
        if (resource.destroyed)
        {
            // free up the resource
            const resources = this.resources;

            for (const i in resources)
            {
                if (resources[i] === resource)
                {
                    resources[i] = null;
                }
            }
        }
        else
        {
            this._updateKey();
        }
    }
}
