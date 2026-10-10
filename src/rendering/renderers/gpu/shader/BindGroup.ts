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

        this.setResourceUnwatched(resource, index);
    }

    /**
     * Sets a resource at a given index without listening for its changes.
     *
     * {@link BindGroup#setResource} adds a `change` listener to every resource it holds, so the group
     * re-keys when the resource changes or is destroyed. That listener costs more than the bind for a
     * slot that is re-pointed on every draw, such as a pass that binds this frame's pooled texture,
     * draws, and puts a placeholder back. Use this form for such a slot, and re-point it before the
     * resource changes or is destroyed. A subclass that watches its own resources can instead pass
     * every change of a resource it holds to `onResourceChange`.
     * @param resource - The resource to set.
     * @param index - The index to set the resource at.
     */
    public setResourceUnwatched(resource: BindResource, index: number): void
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
     * @param index - The index of the resource to get.
     * @returns - The resource at the specified index.
     */
    public getResource(index: number): BindResource
    {
        return this.resources[index];
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
