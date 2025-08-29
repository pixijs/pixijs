import { type NineSliceSprite } from '../../../scene/sprite-nine-slice/NineSliceSprite';
import { type PixiGL2DContainer, type PixiGL2DNineSliceSprite } from '../../spec/extensions/nodes';
import { serializeContainer } from './serializeContainer';

import type { ToGL2DOptions } from '../../GL2D';

/**
 * Serializes the tiling sprite into a gl2D-compatible format.
 * @param instance - The tiling sprite instance to serialize.
 * @param options - The gl2D serialization context and options.
 * @returns The updated gl2D serialization context.
 * @internal
 */
export async function serializeNineSliceSprite(
    instance: NineSliceSprite,
    options: ToGL2DOptions,
): Promise<ToGL2DOptions>
{
    const { gl2D } = options;

    await serializeContainer(instance, options);
    const sprite = gl2D.nodes.find((node) => node.uid === `${instance.uid}`) as PixiGL2DContainer;

    if (!sprite)
    {
        throw new Error(`NineSliceSprite with uid ${instance.uid} not found in GL2D nodes.`);
    }

    await instance.texture.serialize(options);
    const textureIndex = options.gl2D.resources.findIndex((res) => res.uid === `texture_${instance.texture.uid}`);

    const fullSprite: PixiGL2DNineSliceSprite = {
        ...sprite,
        type: 'nine_slice_sprite',
        texture: textureIndex,
        slice9: [instance.leftWidth, instance.rightWidth, instance.topHeight, instance.bottomHeight],
        width: instance.width,
        height: instance.height,
        extensions: {
            pixi_container_node: {
                ...sprite.extensions.pixi_container_node,
                anchor: [instance.anchor.x, instance.anchor.y],
            },
            pixi_nine_slice_sprite_node: {
                roundPixels: instance.roundPixels,
            },
        },
    };

    // Assign the full sprite back to the original sprite
    Object.assign(sprite, fullSprite);

    gl2D.extensionsUsed.push('pixi_nine_slice_sprite_node');

    return options;
}

/**
 * Mixin for serializing a nineSliceSprite to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeNineSliceSpriteMixin
{
    /**
     * Serializes the nineSliceSprite to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeNineSliceSpriteMixin: Partial<NineSliceSprite> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeNineSliceSprite(this, gl2DOptions);
    },
} as NineSliceSprite;
