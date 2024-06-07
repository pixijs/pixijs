import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { Texture } from '../../renderers/shared/texture/Texture';
import { getMaxTexturesPerBatch } from '../gl/utils/maxRecommendedTextures';

import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';

const cachedGroups: Record<number, BindGroup> = {};

export function getTextureBatchBindGroup(textures: TextureSource[], size: number)
{
    let uid = 0;

    for (let i = 0; i < size; i++)
    {
        uid = ((uid * 31) + textures[i].uid) >>> 0;
    }

    return cachedGroups[uid] || generateTextureBatchBindGroup(textures, uid);
}

let maxTextures = 0;

function generateTextureBatchBindGroup(textures: TextureSource[], key: number): BindGroup
{
    const bindGroupResources: Record<string, any> = {};

    let bindIndex = 0;

    if (!maxTextures)maxTextures = getMaxTexturesPerBatch();

    for (let i = 0; i < maxTextures; i++)
    {
        const texture = i < textures.length ? textures[i] : Texture.EMPTY.source;

        bindGroupResources[bindIndex++] = texture.source;
        bindGroupResources[bindIndex++] = texture.style;
    }

    // pad out with empty textures
    const bindGroup = new BindGroup(bindGroupResources);

    cachedGroups[key] = bindGroup;

    return bindGroup;
}

