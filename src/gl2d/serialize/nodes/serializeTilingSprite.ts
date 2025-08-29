import { type TilingSprite } from '../../../scene/sprite-tiling/TilingSprite';
import { type PixiGL2DContainer, type PixiGL2DTilingSprite } from '../../spec/extensions/nodes';
import { serializeContainer } from './serializeContainer';

import type { ToGL2DOptions } from '../../GL2D';

/**
 * Serializes the tiling sprite into a gl2D-compatible format.
 * @param instance - The tiling sprite instance to serialize.
 * @param options - The gl2D serialization context and options.
 * @returns The updated gl2D serialization context.
 * @internal
 */
export async function serializeTilingSprite(instance: TilingSprite, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const { gl2D } = options;

    await serializeContainer(instance, options);
    const sprite = gl2D.nodes.find((node) => node.uid === `${instance.uid}`) as PixiGL2DContainer;

    if (!sprite)
    {
        throw new Error(`TilingSprite with uid ${instance.uid} not found in GL2D nodes.`);
    }

    await instance.texture.serialize(options);
    const textureIndex = options.gl2D.resources.findIndex((res) => res.uid === `texture_${instance.texture.uid}`);

    const fullSprite: PixiGL2DTilingSprite = {
        ...sprite,
        type: 'tiling_sprite',
        texture: textureIndex,
        tileScale: [instance.tileScale.x, instance.tileScale.y],
        tilePosition: [instance.tilePosition.x, instance.tilePosition.y],
        tileRotation: instance.tileRotation,
        width: instance.width,
        height: instance.height,
        extensions: {
            pixi_container_node: {
                ...sprite.extensions.pixi_container_node,
                anchor: [instance.anchor.x, instance.anchor.y]
            },
            pixi_tiling_sprite_node: {
                roundPixels: instance.roundPixels,
                applyAnchorToTexture: instance.applyAnchorToTexture
            }
        }
    };

    // Assign the full sprite back to the original sprite
    Object.assign(sprite, fullSprite);

    gl2D.extensionsUsed.push('pixi_tiling_sprite_node');

    return options;
}

/**
 * Mixin for serializing a tilingSprite to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeTilingSpriteMixin
{
    /**
     * Serializes the tilingSprite to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeTilingSpriteMixin: Partial<TilingSprite> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeTilingSprite(this, gl2DOptions);
    },
} as TilingSprite;
