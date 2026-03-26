import { applyMask, serializeContainerExtensions } from './serializeContainer';
import { serializeCoreNodeProperties } from './serializeCoreNodeProperties';

import type { Sprite } from '../../scene/sprite/Sprite';
import type { Gl2dContainerNode, Gl2dRef, Gl2dSpriteNode } from '../Gl2dSchema';
import type { Gl2dSerializeContext } from '../serializeContext';

interface SpriteSetup
{
    node: Gl2dSpriteNode;
    index: Gl2dRef;
}

function setupSpriteNode(sprite: Sprite, textureRef: Gl2dRef, ctx: Gl2dSerializeContext): SpriteSetup | Gl2dRef
{
    const existing = ctx.nodeMap.get(sprite);

    if (existing !== undefined) return existing;

    const core = serializeCoreNodeProperties(sprite, ctx);
    const node: Gl2dSpriteNode = { type: 'sprite', texture: textureRef, ...core };

    serializeContainerExtensions(sprite, node as unknown as Gl2dContainerNode, ctx);
    const index = ctx.gl2d.nodes.length;

    ctx.gl2d.nodes.push(node);
    ctx.nodeMap.set(sprite, index);

    return { node, index };
}

/**
 * Serializes a Sprite into a gl2d node (sync).
 * @param sprite - The sprite to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.nodes
 * @category gl2d
 * @standard
 */
export function serializeSprite(sprite: Sprite, ctx: Gl2dSerializeContext): Gl2dRef
{
    const textureRef = sprite.texture.toGl2d(ctx);
    const result = setupSpriteNode(sprite, textureRef, ctx);

    if (typeof result !== 'object') return result;

    const { node, index } = result;

    applyMask(node as unknown as Gl2dContainerNode, sprite, ctx);

    return index;
}
