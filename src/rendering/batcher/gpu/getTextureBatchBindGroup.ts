import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { Texture } from '../../renderers/shared/texture/Texture';
import { MAX_TEXTURES } from '../shared/const';

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

function generateTextureBatchBindGroup(textures: TextureSource[], key: number): BindGroup
{
    const bindGroupResources: Record<string, any> = {};

    let bindIndex = 0;

    for (let i = 0; i < MAX_TEXTURES; i++)
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

