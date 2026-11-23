import { loadTextureFile } from './swatches';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../../types';
import type { TextureFile } from './textureFiles';
import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

/** Textures in each resolution test; `compressed-res-<key>@2x` and `@0.5x` assets hold the same files */
export const textures: Record<string, TextureFile> = {
    bc1: { format: 'bc1-rgba-unorm', width: 16, height: 16 },
    astc: { format: 'astc-6x6-unorm', width: 16, height: 16 },
    bc3: { format: 'bc3-rgba-unorm', width: 10, height: 6, levels: 1, container: 'dds' },
    rgba8: { format: 'rgba8unorm', width: 16, height: 16, container: 'dds' },
};

/** Resolutions, from `data.resolution` or the url's suffix, by column */
export const columns = [
    { x: 2, resolution: 1 },
    { x: 21, resolution: 2, data: true },
    { x: 32, resolution: 0.5, data: true },
    { x: 67, resolution: 2, url: '@2x' },
    { x: 78, resolution: 0.5, url: '@0.5x' },
];

/**
 * The asset name a url column loads
 * @param key - the key of the texture
 * @param suffix - `@2x` or `@0.5x`
 */
export function assetName(key: string, suffix: string): string
{
    return `compressed-res-${key}${suffix}.${(textures[key].container ?? 'ktx') === 'ktx' ? 'ktx' : 'dds'}`;
}

export const scene: TestScene = {
    it: 'should draw compressed textures at their pixel size divided by their resolution',
    excludeRenderers: ['canvas'],
    options: { width: 112, height: 146 },
    create: async (scene: Container) =>
    {
        const keys = Object.keys(textures);

        for (let row = 0; row < keys.length; row++)
        {
            for (const column of columns)
            {
                const texture = column.url
                    ? await Assets.load<Texture>(assetName(keys[row], column.url))
                    : await loadTextureFile(textures[keys[row]], column.data && { resolution: column.resolution });
                // no size set: the sprite takes the texture's size
                const sprite = new Sprite(texture);

                sprite.position.set(column.x, 2 + (row * 36));
                scene.addChild(sprite);
            }
        }
    },
};
