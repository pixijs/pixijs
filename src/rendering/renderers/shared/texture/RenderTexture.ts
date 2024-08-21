import { TextureSource } from './sources/TextureSource';
import { Texture } from './Texture';

import type { TextureSourceOptions } from './sources/TextureSource';

/**
 * A render texture, extends `Texture`.
 * @see {@link rendering.Texture}
 * @memberof rendering
 */
export class RenderTexture extends Texture
{
    public static create(options: TextureSourceOptions): RenderTexture
    {
        return new RenderTexture({
            source: new TextureSource(options)
        });
    }

    /**
     * Resizes the render texture.
     * @param width - The new width of the render texture.
     * @param height - The new height of the render texture.
     * @param resolution - The new resolution of the render texture.
     * @returns This texture.
     */
    public resize(width: number, height: number, resolution?: number): this
    {
        this.source.resize(width, height, resolution);

        return this;
    }
}
