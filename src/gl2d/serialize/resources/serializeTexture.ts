import { type Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { type ToGL2DOptions } from '../../GL2D';
import { type PixiGL2DTexture } from '../../spec/extensions/resources';
import { type GL2DTexture } from '../../spec/resources';
import { isSpritesheetTexture } from '../../utils/isSpritesheetTexture';

/**
 * Serializes the texture to a gl2D-compatible format.
 * @param instance - The texture instance to serialize.
 * @param options - The serialization options.
 * @internal
 */
export async function serializeTexture(instance: Texture, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const { gl2D } = options;
    // see if the texture already exists in the resource cache
    const textureData = gl2D.resources.find((res) =>
    {
        const tex = res as GL2DTexture;

        return tex.uid === `texture_${instance.uid}`;
    });

    if (textureData)
    {
        return options;
    }

    // if not, create a new entry
    await instance.source.serialize(options);
    const spritesheetSource = isSpritesheetTexture(instance.source);

    let sourceIndex: number;

    if (spritesheetSource)
    {
        // find the spritesheet resource
        sourceIndex = gl2D.resources.findIndex((res) => res.uid === `spritesheet_${spritesheetSource.uid}`);
    }
    else
    {
        sourceIndex = gl2D.resources.findIndex((res) => res.uid === `texture_source_${instance.source.uid}`);
    }

    const newTextureData: PixiGL2DTexture = {
        type: 'texture',
        uid: `texture_${instance.uid}`,
        name: instance.label,
        frame: instance.frame
            ? [instance.frame.x, instance.frame.y, instance.frame.width, instance.frame.height]
            : undefined,
        source: sourceIndex,
        extensions: {
            pixi_texture_resource: {
                orig: instance.orig
                    ? [instance.orig.x, instance.orig.y, instance.orig.width, instance.orig.height]
                    : null,
                trim: instance.trim
                    ? [instance.trim.x, instance.trim.y, instance.trim.width, instance.trim.height]
                    : null,
                defaultAnchor: instance.defaultAnchor
                    ? [instance.defaultAnchor.x, instance.defaultAnchor.y]
                    : undefined,
                defaultBorders: instance.defaultBorders
                    ? [
                        instance.defaultBorders.left,
                        instance.defaultBorders.top,
                        instance.defaultBorders.right,
                        instance.defaultBorders.bottom,
                    ]
                    : undefined,
                rotate: instance.rotate,
                dynamic: instance.dynamic,
            },
        },
    };

    gl2D.resources.push(newTextureData);
    gl2D.extensionsUsed.push('pixi_texture_resource');

    return options;
}

/**
 * Mixin for serializing a texture to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeTextureMixin
{
    /**
     * Serializes the texture to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeTextureMixin: Partial<Texture> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeTexture(this, gl2DOptions);
    },
} as Texture;
