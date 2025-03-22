import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { Texture } from '../../renderers/shared/texture/Texture';
import { getMaxTexturesPerBatch } from '../gl/utils/maxRecommendedTextures';

import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';

const cachedGroups: Record<number, BindGroup> = {};

export function getTextureBatchBindGroup(textures: TextureSource[], size: number)
{
    let uid = 2166136261; // FNV-1a 32-bit offset basis

    for (let i = 0; i < size; i++)
    {
        uid ^= textures[i].uid;
        uid = Math.imul(uid, 16777619);
        uid >>>= 0;
    }

    return cachedGroups[uid] || generateTextureBatchBindGroup(textures, size, uid);
}

let maxTextures = 0;

function generateTextureBatchBindGroup(textures: TextureSource[], size: number, key: number): BindGroup
{
    const bindGroupResources: Record<string, any> = {};
    let emptySource: TextureSource = size > 1 ? null : Texture.EMPTY.source;

    let bindIndex = 0;

    if (!maxTextures)maxTextures = getMaxTexturesPerBatch();

    for (let i = 0; i < maxTextures; i++)
    {
        const texture = i < size ? textures[i] : emptySource;

        bindGroupResources[bindIndex++] = texture.source;
        bindGroupResources[bindIndex++] = texture.style;

        if (!emptySource)
        {
            emptySource = textures[i].source.viewDimension === '2d-array'
                ? Texture.EMPTY_2DARRAY.source
                : Texture.EMPTY.source;
        }
    }

    // pad out with empty textures
    const bindGroup = new BindGroup(bindGroupResources);

    cachedGroups[key] = bindGroup;

    return bindGroup;
}

