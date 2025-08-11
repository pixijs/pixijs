import { TextureSource } from './sources/TextureSource';
import { Texture } from './Texture';

import type { TextureSourceOptions } from './sources/TextureSource';

const typeSymbol = Symbol.for('pixijs.RenderTexture');

/**
 * A render texture, extends `Texture`.
 * @see {@link Texture}
 * @category rendering
 * @advanced
 */
export class RenderTexture extends Texture
{
    /**
     * Type symbol used to identify instances of RenderTexture.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a RenderTexture.
     * @param obj - The object to check.
     * @returns True if the object is a RenderTexture, false otherwise.
     */
    public static isRenderTexture(obj: any): obj is RenderTexture
    {
        return !!obj && !!obj[typeSymbol];
    }

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
