import { getTextureBatchBindGroup } from '../gpu/getTextureBatchBindGroup';
import { Texture } from '~/rendering';

import type { TextureSource } from '~/rendering';

function createTextureSource(uid: number): TextureSource
{
    const textureSource = { uid, style: {} } as unknown as TextureSource & { source: TextureSource };

    textureSource.source = textureSource;

    return textureSource;
}

describe('getTextureBatchBindGroup', () =>
{
    it('should not reuse a cached bind group with fewer slots than the max texture count', () =>
    {
        const textures = [Texture.WHITE.source];

        const smallBindGroup = getTextureBatchBindGroup(textures, 1, 8);
        const bindGroup = getTextureBatchBindGroup(textures, 1, 16);

        expect(bindGroup).not.toBe(smallBindGroup);
        expect(Object.keys(bindGroup.resources)).toHaveLength(16 * 2);
    });

    it('should reuse the bind group for the same textures and max texture count', () =>
    {
        const textures = [Texture.WHITE.source];

        const bindGroup = getTextureBatchBindGroup(textures, 1, 4);

        expect(getTextureBatchBindGroup(textures, 1, 4)).toBe(bindGroup);
    });

    it('should not reuse a bind group cached for other textures with the same key', () =>
    {
        // uid 17303 alone hashes to the same key as uids 13700 and 1
        const collidingBindGroup = getTextureBatchBindGroup([createTextureSource(17303)], 1, 4);
        const textures = [createTextureSource(13700), createTextureSource(1)];

        const bindGroup = getTextureBatchBindGroup(textures, 2, 4);

        expect(bindGroup).not.toBe(collidingBindGroup);
        expect(bindGroup.resources[0]).toBe(textures[0]);
        expect(bindGroup.resources[2]).toBe(textures[1]);
    });
});
