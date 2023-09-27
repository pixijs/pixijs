import { TexturePool } from '../../../../rendering/renderers/shared/texture/TexturePool';
import { Bounds } from '../../../container/bounds/Bounds';

import type { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import type { ICanvas } from '../../../../settings/adapter/ICanvas';

const tempBounds = new Bounds();

/**
 * Takes an image and creates a texture from it, using a power of 2 texture from the texture pool.
 * Remember to return the texture when you don't need it any more!
 * @param image - The image to create a texture from
 * @param resolution - The resolution of the texture
 * @returns - The texture
 */
export function getPo2TextureFromSource(image: HTMLImageElement | HTMLCanvasElement | ICanvas, resolution: number): Texture
{
    const bounds = tempBounds;

    bounds.minX = 0;
    bounds.minY = 0;

    bounds.maxX = (image.width / resolution) | 0;
    bounds.maxY = (image.height / resolution) | 0;

    const texture = TexturePool.getOptimalTexture(
        bounds.width,
        bounds.height,
        resolution,
        false
    );

    texture.source.uploadMethodId = 'image';
    texture.source.resource = image;
    texture.source.alphaMode = 'premultiply-alpha-on-upload';

    texture.frameWidth = image.width / resolution;
    texture.frameHeight = image.height / resolution;

    texture.source.update();
    texture.layout.updateUvs();

    return texture;
}
