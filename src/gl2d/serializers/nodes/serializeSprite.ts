import { type Gl2dRef } from '../../types/Gl2dTypes';
import { type Gl2dPixiSpriteNode } from '../../types/pixi/PixiGl2dNodes';
import { serializeCoreNodeProperties } from '../serializeCoreNodeProperties';
import { applyMask, serializeContainerExtensions } from './serializeContainer';

import type { Sprite } from '../../../scene/sprite/Sprite';
import type { Gl2dSerializeContext } from '../../serializeContext';

interface SpriteSetup
{
    node: Gl2dPixiSpriteNode;
    index: Gl2dRef;
}

function setupSpriteNode(
    sprite: Sprite,
    textureRef: Gl2dRef,
    ctx: Gl2dSerializeContext,
): SpriteSetup | Gl2dRef
{
    const existing = ctx.nodeMap.get(sprite);

    if (existing !== undefined) return existing;

    const core = serializeCoreNodeProperties(sprite, ctx, 'sprite');
    const node: Gl2dPixiSpriteNode = { ...core, texture: textureRef };

    serializeContainerExtensions(sprite, node, ctx);
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

    applyMask(node, sprite, ctx);

    return index;
}
