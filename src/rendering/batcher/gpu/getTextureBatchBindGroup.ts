import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { Texture } from '../../renderers/shared/texture/Texture';

import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';

const cachedGroups: Record<number, BindGroup> = {};

/**
 * @param textures
 * @param size
 * @param maxTextures
 * @internal
 */
export function getTextureBatchBindGroup(textures: TextureSource[], size: number, maxTextures: number)
{
    let uid = 2166136261; // FNV-1a 32-bit offset basis

    for (let i = 0; i < size; i++)
    {
        uid ^= textures[i].uid;
        uid = Math.imul(uid, 16777619);
        uid >>>= 0;
    }

    const cachedGroup = cachedGroups[uid];

    if (matchesTextureBatch(cachedGroup, textures, size, maxTextures))
    {
        return cachedGroup;
    }

    return generateTextureBatchBindGroup(textures, size, uid, maxTextures);
}

function matchesTextureBatch(
    group: BindGroup,
    textures: TextureSource[],
    size: number,
    maxTextures: number,
): boolean
{
    const resources = group?.resources;

    if (!resources || Object.keys(resources).length !== maxTextures * 2)
    {
        return false;
    }

    for (let i = 0; i < maxTextures; i++)
    {
        const texture = i < size ? textures[i] : Texture.EMPTY.source;

        if (resources[i * 2] !== texture.source || resources[(i * 2) + 1] !== texture.style)
        {
            return false;
        }
    }

    return true;
}

function generateTextureBatchBindGroup(textures: TextureSource[], size: number, key: number, maxTextures: number): BindGroup
{
    const bindGroupResources: Record<string, any> = {};

    let bindIndex = 0;

    for (let i = 0; i < maxTextures; i++)
    {
        const texture = i < size ? textures[i] : Texture.EMPTY.source;

        bindGroupResources[bindIndex++] = texture.source;
        bindGroupResources[bindIndex++] = texture.style;
    }

    // pad out with empty textures
    const bindGroup = new BindGroup(bindGroupResources);

    cachedGroups[key] = bindGroup;

    return bindGroup;
}
