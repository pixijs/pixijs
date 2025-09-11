/* eslint-disable dot-notation */
import { Rectangle } from '../../../maths/shapes/Rectangle';
import { type TextureSource } from '../../../rendering/renderers/shared/texture/sources/TextureSource';
import { type Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { type ToGL2DOptions } from '../../GL2D';
import { type PixiGL2DSpritesheetSource, type PixiGL2DTextureSource } from '../../spec/extensions/resources';
import { isSpritesheetTexture } from '../../utils/isSpritesheetTexture';

/**
 * Serializes the texture source to a gl2D-compatible format.
 * @param instance - The texture instance to serialize.
 * @param options - The serialization options.
 * @internal
 */
export async function serializeTextureSource(instance: TextureSource, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const { gl2D, renderer } = options;
    // check if the source is already serialized
    const sourceIndex = gl2D.resources.findIndex(
        (texture) => texture.uid === `texture_source_${instance.uid}`);

    if (sourceIndex !== -1)
    {
        return options;
    }

    // If not serialized, add it to the GL2D instance
    const data: PixiGL2DTextureSource<'texture_source'> = {
        uid: `texture_source_${instance.uid}`,
        type: 'texture_source',
        // TODO: fix ugly type hack
        uri: instance.uri
                ?? (await renderer.extract.base64({
                    isTexture: true,
                    source: instance,
                    frame: new Rectangle(0, 0, instance.width, instance.height),
                } as unknown as Texture)),
        width: instance.pixelWidth,
        height: instance.pixelHeight,
        resolution: instance._resolution,
        format: instance.format,
        antialias: instance.antialias,
        alphaMode: instance.alphaMode,
        addressModeU: instance['_style'].addressModeU,
        addressModeV: instance['_style'].addressModeV,
        addressModeW: instance['_style'].addressModeW,
        magFilter: instance['_style'].magFilter,
        minFilter: instance['_style'].minFilter,
        mipmapFilter: instance['_style'].mipmapFilter,
        lodMinClamp: instance['_style'].lodMinClamp,
        lodMaxClamp: instance['_style'].lodMaxClamp,
        extensions: {
            pixi_texture_source_resource: {
                autoGarbageCollect: instance.autoGarbageCollect,
                mipLevelCount: instance.mipLevelCount,
                maxAnisotropy: instance['_style'].maxAnisotropy,
                dimensions: instance.dimension,
                compare: instance['_style'].compare,
                autoGenerateMipmaps: instance.autoGenerateMipmaps,
            }
        }
    };

    gl2D.resources.push(data);
    gl2D.extensionsUsed.push('pixi_texture_source_resource');

    // we need to know if this source is part of a spritesheet
    const spritesheetSource = isSpritesheetTexture(instance);

    if (spritesheetSource)
    {
        const spritesheetResource: PixiGL2DSpritesheetSource = {
            uid: `spritesheet_${spritesheetSource.uid}`,
            type: 'spritesheet',
            uri: spritesheetSource.uri,
            source: gl2D.resources.length - 1,
            extensions: {
                pixi_spritesheet_resource: {
                    cachePrefix: spritesheetSource.cachePrefix
                }
            }
        };

        gl2D.extensionsUsed.push('pixi_spritesheet_resource');
        gl2D.resources.push(spritesheetResource);
    }

    return options;
}

/**
 * Mixin for serializing a texture source to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeTextureSourceMixin
{
    /**
     * Serializes the texture source to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeTextureSourceMixin: Partial<TextureSource> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeTextureSource(this, gl2DOptions);
    },
} as TextureSource;
