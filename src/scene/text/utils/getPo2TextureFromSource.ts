import { TexturePool } from '../../../rendering/renderers/shared/texture/TexturePool';
import { Bounds } from '../../container/bounds/Bounds';

import type { ICanvas } from '../../../environment/canvas/ICanvas';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';

const tempBounds = new Bounds();

/**
 * Takes an image and creates a texture from it, using a power of 2 texture from the texture pool.
 * Remember to return the texture when you don't need it any more!
 * @param image - The image to create a texture from
 * @param width - the frame width of the texture
 * @param height - the frame height of the texture
 * @param resolution - The resolution of the texture
 * @returns - The texture
 */
export function getPo2TextureFromSource(
    image: HTMLImageElement | HTMLCanvasElement | ICanvas,
    width: number,
    height: number,
    resolution: number
): Texture
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

    texture.frame.width = width / resolution;
    texture.frame.height = height / resolution;

    // We want to update the resource on the GPU,
    // but we do not want to resize the texture.
    // calling `texture.source.update` will fit the resource to the texture
    // causing a resize of the texture on the GPU.
    // which is not what we want!
    texture.source.emit('update', texture.source);

    texture.updateUvs();

    return texture;
}
