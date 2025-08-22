import { type ImageSource } from '../../../rendering/renderers/shared/texture/sources/ImageSource';
import { serializeTextureSource } from './serializeTextureSource';

import type { ToGL2DOptions } from '../../GL2D';
import type { PixiGL2DImageSource } from '../../spec/extensions/resources';
/**
 * Serializes the image source to a gl2D-compatible format.
 * @param instance - The image instance to serialize.
 * @param options - The serialization options.
 * @internal
 */
export async function serializeImageSource(instance: ImageSource, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    await serializeTextureSource(instance, options);
    const { gl2D } = options;

    // find the resource
    const source = gl2D.resources.find(
        (texture) => texture.uid === `texture_source_${instance.uid}`) as PixiGL2DImageSource;

    if (!source)
    {
        throw new Error(`ImageSource: Texture source with uid ${instance.uid} not found.`);
    }

    source.type = 'image_source';

    return options;
}
/**
 * Mixin for serializing a image source to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeImageSourceMixin
{
    /**
     * Serializes the image source to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeImageSourceMixin: Partial<ImageSource> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeImageSource(this, gl2DOptions);
    },
} as ImageSource;
