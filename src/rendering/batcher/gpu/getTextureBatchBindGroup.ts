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

    const cachedGroupFitsBatch = ((): boolean =>
    {
        if (!cachedGroup)
        {
            return false;
        }

        const resources = cachedGroup.resources;

        if (!resources[(maxTextures * 2) - 1])
        {
            return false;
        }

        for (let i = 0; i < size; i++)
        {
            if (resources[i * 2] === textures[i].source)
            {
                continue;
            }

            return false;
        }

        return true;
    })();

    if (cachedGroupFitsBatch)
    {
        return cachedGroup;
    }

    return generateTextureBatchBindGroup(textures, size, uid, maxTextures);
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

