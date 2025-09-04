import { type Sprite } from '../../../scene/sprite/Sprite';
import { type PixiGL2DSprite } from '../../spec/extensions/nodes';
import { serializeContainer } from './serializeContainer';

import type { ToGL2DOptions } from '../../GL2D';

/**
 * Serializes the sprite into a gl2D-compatible format.
 * @param instance - The sprite instance to serialize.
 * @param options - The gl2D serialization context and options.
 * @returns The updated gl2D serialization context.
 * @internal
 */
export async function serializeSprite(instance: Sprite, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const { gl2D } = options;

    await serializeContainer(instance, options);
    const sprite = gl2D.nodes.find((node) => node.uid === `${instance.uid}`);

    if (!sprite)
    {
        throw new Error(`Sprite with uid ${instance.uid} not found in GL2D nodes.`);
    }

    await instance.texture.serialize(options);
    const textureIndex = options.gl2D.resources.findIndex((res) => res.uid === `texture_${instance.texture.uid}`);

    const fullSprite: PixiGL2DSprite = {
        ...sprite,
        type: 'sprite',
        texture: textureIndex,
        extensions: {
            pixi_container_node: {
                ...sprite.extensions.pixi_container_node,
                anchor: [instance.anchor.x, instance.anchor.y],
            },
            pixi_sprite_node: {
                roundPixels: instance.roundPixels,
            },
        },
    };

    // Assign the full sprite back to the original sprite
    Object.assign(sprite, fullSprite);

    gl2D.extensionsUsed.push('pixi_sprite_node');

    return options;
}

/**
 * Mixin for serializing a sprite to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeSpriteMixin
{
    /**
     * Serializes the sprite to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeSpriteMixin: Partial<Sprite> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeSprite(this, gl2DOptions);
    },
} as Sprite;
