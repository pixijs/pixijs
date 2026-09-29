import { GlobalResourceRegistry } from '../../../utils/pool/GlobalResourceRegistry';
import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { Texture } from '../../renderers/shared/texture/Texture';

import type { BindResource } from '../../renderers/gpu/shader/BindResource';
import type { GCable, GCSystem } from '../../renderers/shared/GCSystem';
import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';

const cache: { groups: Record<number, TextureBatchBindGroup> } = { groups: Object.create(null) };

/**
 * A cached bind group for one texture batch
 *
 * It listens for `change` only on the batch's textures. The padding slots hold `Texture.EMPTY`
 * without a listener of their own; one module level listener re-keys every group instead.
 * @internal
 */
class TextureBatchBindGroup extends BindGroup implements GCable
{
    public _gcLastUsed = -1;
    public readonly autoGarbageCollect = true;
    /** Part of the {@link GCable} contract; a cached bind group owns no per-renderer GPU data */
    public readonly _gpuData: GCable['_gpuData'] = null;

    private readonly _cacheKey: number;
    private readonly _textureCount: number;
    private readonly _maxTextures: number;

    constructor(textures: TextureSource[], textureCount: number, maxTextures: number, cacheKey: number)
    {
        super();

        this._cacheKey = cacheKey;
        this._textureCount = textureCount;
        this._maxTextures = maxTextures;

        let bindIndex = 0;

        for (let i = 0; i < textureCount; i++)
        {
            const texture = textures[i];

            this.setResource(texture, bindIndex++);

            // a destroyed texture has no style, and BindGroupSystem reports it when the group is drawn
            if (texture.style) this.setResource(texture.style, bindIndex);

            bindIndex++;
        }

        // one module level listener covers the padding slots, so they take none of their own
        const resources = this.resources;
        const pad = Texture.EMPTY.source;

        for (let i = textureCount; i < maxTextures; i++)
        {
            resources[bindIndex++] = pad;
            resources[bindIndex++] = pad.style;
        }
    }

    /**
     * Whether this group still binds exactly these textures in these slots
     * @param textures - The texture sources of a batch.
     * @param textureCount - How many of `textures` the batch uses.
     * @param maxTextures - The slot count of the batch shader.
     * @returns True when every slot up to `textureCount` holds the matching source.
     */
    public binds(textures: TextureSource[], textureCount: number, maxTextures: number): boolean
    {
        const resources = this.resources;

        if (!resources || this._textureCount !== textureCount || this._maxTextures !== maxTextures) return false;

        for (let i = 0; i < textureCount; i++)
        {
            if (resources[i * 2] !== textures[i]) return false;
        }

        return true;
    }

    /**
     * Passes a change on the shared pad texture to this group
     * @param resource - The pad texture source or its style.
     */
    public padChanged(resource: BindResource): void
    {
        this.onResourceChange(resource);
    }

    public override _touch(now: number): void
    {
        this._gcLastUsed = now;

        const resources = this.resources;
        const bound = this._textureCount * 2;

        // the GC never collects the padding slots, so only the bound textures and styles need a stamp
        for (let i = 0; i < bound; i++)
        {
            const resource = resources[i] as BindResource & GCable;

            if (resource) resource._gcLastUsed = now;
        }
    }

    /** The renderer GC calls this for an idle group; the next lookup builds a new one */
    public unload(): void
    {
        this.destroy();
    }

    /** Releases the listeners on the bound textures and removes the group from the cache */
    public override destroy(): void
    {
        if (!this.resources) return;

        super.destroy();

        if (cache.groups[this._cacheKey] === this) cache.groups[this._cacheKey] = null;
    }

    protected override onResourceChange(resource: BindResource): void
    {
        // the next lookup rebuilds the group, so a destroyed texture releases it instead of warning
        if (resource.destroyed)
        {
            this.destroy();
        }
        else
        {
            super.onResourceChange(resource);
        }
    }
}

function onPadChange(resource: BindResource): void
{
    const groups = cache.groups;

    for (const key in groups)
    {
        groups[key]?.padChanged(resource);
    }
}

// the pad slots hold no listener of their own, so one listener on the shared pad texture
// re-keys every cached group instead
Texture.EMPTY.source.on('change', onPadChange);
Texture.EMPTY.source.style.on('change', onPadChange);

GlobalResourceRegistry.register({
    clear: () =>
    {
        const groups = cache.groups;

        for (const key in groups)
        {
            groups[key]?.destroy();
        }

        cache.groups = Object.create(null);
    },
});

/**
 * Registers the cache with a renderer GC, which destroys groups idle for longer than the GC's maxUnusedTime
 * @param gc - The GC system of the renderer.
 * @internal
 */
export function collectTextureBatchBindGroups(gc: GCSystem): void
{
    gc.addResourceHash(cache, 'groups', 'resource');
    gc.addCollection(cache, 'groups', 'hash');
}

/**
 * Returns the cached bind group for a texture batch, building one when no live group binds these textures
 * @param textures - The texture sources of the batch.
 * @param size - How many of `textures` the batch uses.
 * @param maxTextures - The slot count of the batch shader.
 * @returns The group that binds `textures`, padded with `Texture.EMPTY` up to `maxTextures` slots.
 * @internal
 */
export function getTextureBatchBindGroup(textures: TextureSource[], size: number, maxTextures: number): BindGroup
{
    let uid = 2166136261; // FNV-1a 32-bit offset basis

    for (let i = 0; i < size; i++)
    {
        uid ^= textures[i].uid;
        uid = Math.imul(uid, 16777619);
        uid >>>= 0;
    }

    // a group holds maxTextures slots, so the slot count is part of the key
    uid = Math.imul(uid ^ maxTextures, 16777619) >>> 0;

    const group = cache.groups[uid];

    // the key is a 32 bit hash, so a different texture set can share it
    if (group?.binds(textures, size, maxTextures)) return group;

    group?.destroy();

    return (cache.groups[uid] = new TextureBatchBindGroup(textures, size, maxTextures, uid));
}
