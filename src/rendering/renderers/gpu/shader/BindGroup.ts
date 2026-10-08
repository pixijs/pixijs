import { warn } from '../../../../utils/logging/warn';
import { type GCable } from '../../shared/GCSystem';

import type { GpuBindGroupEntry } from '../BindGroupSystem';
import type { BindResource } from './BindResource';

// The key is two 32-bit halves. Each binding contributes one mix of (binding number, resource id) to
// each half, and the bindings are combined with XOR, so re-pointing one binding takes its old mix out
// and puts the new one in without visiting the others. The two mixes are independent: the pair behaves
// as one 64-bit hash, and BindGroupSystem compares both halves.

function mixLow(binding: number, id: number): number
{
    let h = Math.imul(id + 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(binding + 1, 0xC2B2AE35);

    h ^= h >>> 16;
    h = Math.imul(h, 0x7FEB352D);
    h ^= h >>> 15;
    h = Math.imul(h, 0x846CA68B);

    return h ^ (h >>> 16);
}

function mixHigh(binding: number, id: number): number
{
    let h = Math.imul(id + 0x7F4A7C15, 0x27D4EB2F) ^ Math.imul(binding + 0x165667B1, 0x9E3779B1);

    h ^= h >>> 15;
    h = Math.imul(h, 0x2C1B3C6D);
    h ^= h >>> 12;
    h = Math.imul(h, 0x297A2D39);

    return h ^ (h >>> 15);
}

/**
 * The binding number of each resource in a {@link BindGroup}, by name: the same shape as one group of
 * {@link GpuProgram#layout}.
 * @category rendering
 * @advanced
 */
export type BindGroupLayout = Record<string, number>;

/**
 * A bind group is a collection of resources that are bound together for use by a shader.
 * They are essentially a wrapper for the WebGPU BindGroup class. But with the added bonus
 * that WebGL can also work with them.
 * @see https://gpuweb.github.io/gpuweb/#dictdef-gpubindgroupdescriptor
 * @example
 * // Create a bind group with a single texture and sampler
 * const bindGroup = new BindGroup({
 *    uTexture: texture.source,
 *    uSampler: texture.style,
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
 * Keyed by name, as above, the group knows which binding each name is, and the renderers match a
 * shader's bindings to the group's resources by name. The shader's own binding numbers then don't
 * matter, so shaders that number the same bindings differently, or declare only some of them, can
 * share one group. Declare every binding the group will ever hold; `null` marks one to be set later:
 * @example
 * const global = new BindGroup({ camera, lights, shadowMap, shadowSampler, instances: null });
 *
 * global.setResource(batchInstances, 'instances');
 *
 * The names must be the ones the shader declares its bindings with. A name the shader doesn't
 * declare is ignored, and a shader binding the group has no name for gets no resource: WebGPU
 * throws, and WebGL draws without it.
 *
 * On WebGL, set a binding declared `null` before a shader first draws with the group, or declare it
 * with a placeholder resource. WebGL works out what to bind the first time a program is used, and a
 * binding still empty then is never bound, even once it is set.
 *
 * Keyed by number, the group has no layout and a shader reads binding `n` from the group's binding `n`.
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
     * The binding numbers {@link BindGroup#_touch} stamps: every binding but the samplers. The GC
     * never collects a `TextureStyle` (`GpuTextureSystem` caches one `GPUSampler` per style id, outside
     * the GC), so stamping one does nothing, and a group of texture and sampler pairs would stamp twice
     * as many resources as it needs. Rebuilt when a binding is added or changes type.
     */
    private _touchKeysValue: number[] = null;

    /**
     * One half of the key used internally to match this group up to a WebGPU BindGroup: a hash of
     * every binding number and the id of the resource bound there, kept up to date as resources
     * are set and as they change. Two groups holding the same resources at the same bindings have
     * the same key, and share one WebGPU BindGroup.
     * @internal
     */
    public _keyLow = 0;
    /**
     * The other half of the key, see {@link BindGroup#_keyLow}.
     * @internal
     */
    public _keyHigh = 0;

    /**
     * The cache entry {@link BindGroupSystem} last resolved this group to, so binding a group that
     * has not changed skips the cache lookup. Cleared whenever the key moves.
     * @internal
     */
    public _gpuEntry: GpuBindGroupEntry | null = null;
    /**
     * The program layout and group index {@link BindGroup#_gpuEntry} was resolved for.
     * @internal
     */
    public _gpuEntryLayoutKey = -1;

    /**
     * The resource id each binding is in the key with, by binding number. A resource's id can move
     * before this group hears about it, so the mix taken out is this one, never the resource's own.
     */
    private readonly _keyedIds: number[] = [];

    /**
     * The binding number of each resource by name, in the order the constructor was given them, or
     * `null` for a group keyed by number. With a layout, a shader's bindings are matched to this
     * group's resources by name, whatever numbers the shader gives them.
     *
     * WebGL generates its sync code once per program from the first shader bound with it, so every
     * shader on one program must bring groups of one kind, keyed in one order, at each group index.
     * @readonly
     */
    public readonly layout: BindGroupLayout | null = null;

    /**
     * Create a new instance of the Bind Group.
     * @param resources - The resources that are bound together for use by a shader, keyed by binding
     * name or by binding number. Don't mix the two: the first key decides which the group is. Either
     * way they take binding numbers `0, 1, 2...` in order. By name, the keys are the shader's binding
     * names, and a `null` declares a binding to be set later with {@link BindGroup#setResource}.
     */
    constructor(resources?: Record<string, BindResource | null>)
    {
        let index = 0;

        for (const i in resources)
        {
            // a shader binding name can't start with a digit, so a first key that does means the
            // group is keyed by number
            if (index === 0 && !(/^\d/).test(i)) this.layout = {};

            if (this.layout) this.layout[i] = index;

            const resource = resources[i];

            if (resource) this.setResource(resource, index);

            index++;
        }
    }

    /**
     * Set a resource at a given index. This function will
     * ensure that listeners will be removed from the current resource
     * and added to the new resource.
     * @param resource - The resource to set.
     * @param index - The binding number to set the resource at, or its name in a group keyed by name.
     */
    public setResource(resource: BindResource, index: number | string): void
    {
        if (typeof index === 'string') index = this._bindingOf(index);

        const currentResource = this.resources[index];

        if (resource === currentResource) return;

        if (currentResource)
        {
            currentResource.off?.('change', this.onResourceChange, this);
        }

        resource.on?.('change', this.onResourceChange, this);

        this.setResourceUnwatched(resource, index);
    }

    /**
     * Sets a resource at a given index without listening for its changes. For a subclass that already
     * watches its resources and re-points them often enough for the listeners to cost more than the
     * binds: it must pass every change of a resource it holds to {@link BindGroup#onResourceChange}.
     * @param resource - The resource to set.
     * @param index - The index to set the resource at.
     */
    protected setResourceUnwatched(resource: BindResource, index: number): void
    {
        const currentResource = this.resources[index];

        if (resource === currentResource) return;

        const id = resource._resourceId;

        if (currentResource?._resourceType !== resource._resourceType) this._touchKeysValue = null;

        // a destroyed resource leaves null, not undefined, so this is only true for a new binding
        if (currentResource === undefined)
        {
            this._resourceKeysValue = null;
            this._keyLow ^= mixLow(index, id);
            this._keyHigh ^= mixHigh(index, id);
            this._keyedIds[index] = id;
            this._gpuEntry = null;
        }
        // Two resources with one id resolve to the same GPU object: two `TextureStyle`s with equal
        // settings share a `GPUSampler`. The key, and the WebGPU bind group it names, stay as they are.
        else if (this._keyedIds[index] !== id)
        {
            this._rekey(index, id);
        }

        this.resources[index] = resource;
    }

    /**
     * Swaps the id a binding is in the key with.
     * @param index - The binding number.
     * @param id - The id of the resource now bound there, -1 for a destroyed resource's null slot.
     */
    private _rekey(index: number, id: number): void
    {
        const keyedId = this._keyedIds[index];

        this._keyLow ^= mixLow(index, keyedId) ^ mixLow(index, id);
        this._keyHigh ^= mixHigh(index, keyedId) ^ mixHigh(index, id);
        this._keyedIds[index] = id;
        this._gpuEntry = null;
    }

    /**
     * Returns the resource at the current specified index.
     * @param index - The binding number of the resource to get, or its name in a group keyed by name.
     * @returns - The resource at the specified index.
     */
    public getResource(index: number | string): BindResource
    {
        return this.resources[typeof index === 'string' ? this._bindingOf(index) : index];
    }

    /**
     * The binding number a name has in this group's layout. A name the group doesn't have is a
     * mistake, and this is the only moment it is visible: by number nothing checks.
     * @param name - The binding name.
     */
    private _bindingOf(name: string): number
    {
        const index = this.layout?.[name];

        if (index === undefined)
        {
            throw new Error(`[BindGroup] no binding named '${name}' in this group`);
        }

        return index;
    }

    /**
     * Used internally to 'touch' each resource but the samplers, so the GC knows this bind group still
     * uses them. See {@link BindGroup#_touchKeysValue}.
     * @param now - The current time in milliseconds.
     * @internal
     */
    public _touch(now: number): void
    {
        const resources = this.resources;
        const keys = this._touchKeys;

        for (let i = 0; i < keys.length; i++)
        {
            const resource = resources[keys[i]] as BindResource & GCable;

            if (!resource) continue;

            resource._gcLastUsed = now;
        }
    }

    /** The binding numbers {@link BindGroup#_touch} stamps, see {@link BindGroup#_touchKeysValue}. */
    private get _touchKeys(): number[]
    {
        this._touchKeysValue ??= this._resourceKeys.filter((index) =>
            this.resources[index]?._resourceType !== 'textureSampler');

        return this._touchKeysValue;
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
        this._touchKeysValue = null;
        this._gpuEntry = null;
    }

    protected onResourceChange(resource: BindResource)
    {
        const resources = this.resources;

        // a destroyed group has let go of its resources; only an unwatched one can still be told
        if (!resources) return;

        const keys = this._resourceKeys;
        const destroyed = resource.destroyed;

        for (let i = 0; i < keys.length; i++)
        {
            const index = keys[i];

            if (resources[index] !== resource) continue;

            // A destroyed resource must not stay bound — null the slot. Consumers tolerate the
            // null; actually rendering with it raises a clear error in BindGroupSystem.
            if (destroyed) resources[index] = null;

            this._rekey(index, destroyed ? -1 : resource._resourceId);
        }

        if (destroyed)
        {
            // #if _DEBUG
            warn(`[BindGroup] a '${resource._resourceType}' was destroyed while still bound to a shader. `
                + 'Remove it from the shader before destroying it.');
            // #endif
        }
    }
}
