import { NINE_SLICE_SPRITE_NODE_DEFAULTS } from '../../defaults';
import { type Gl2dRef } from '../../types/Gl2dTypes';
import { type Gl2dPixiNineSliceSpriteNode } from '../../types/pixi/PixiGl2dNodes';
import { gl2dUtils } from '../../utils';
import { serializeCoreNodeProperties } from '../serializeCoreNodeProperties';
import { applyMask, serializeContainerExtensions } from './serializeContainer';

import type { NineSliceSprite } from '../../../scene/sprite-nine-slice/NineSliceSprite';
import type { Gl2dSerializeContext } from '../../serializeContext';

interface NineSliceSpriteSetup
{
    node: Gl2dPixiNineSliceSpriteNode;
    index: Gl2dRef;
}

function setupNineSliceSpriteNode(
    nss: NineSliceSprite,
    textureRef: Gl2dRef,
    ctx: Gl2dSerializeContext,
): NineSliceSpriteSetup | Gl2dRef
{
    const existing = ctx.nodeMap.get(nss);

    if (existing !== undefined) return existing;

    const core = serializeCoreNodeProperties(nss, ctx, 'nine_slice_sprite');
    const node: Gl2dPixiNineSliceSpriteNode = gl2dUtils.compact({
        ...core,
        texture: textureRef,
        width: nss.width,
        height: nss.height,
        leftWidth: gl2dUtils.checkValue(
            nss.leftWidth,
            NINE_SLICE_SPRITE_NODE_DEFAULTS.leftWidth,
        ),
        topHeight: gl2dUtils.checkValue(
            nss.topHeight,
            NINE_SLICE_SPRITE_NODE_DEFAULTS.topHeight,
        ),
        rightWidth: gl2dUtils.checkValue(
            nss.rightWidth,
            NINE_SLICE_SPRITE_NODE_DEFAULTS.rightWidth,
        ),
        bottomHeight: gl2dUtils.checkValue(
            nss.bottomHeight,
            NINE_SLICE_SPRITE_NODE_DEFAULTS.bottomHeight,
        ),
    });

    serializeContainerExtensions(nss, node, ctx);

    const index = ctx.gl2d.nodes.length;

    ctx.gl2d.nodes.push(node);
    ctx.nodeMap.set(nss, index);

    return { node, index };
}

/**
 * Serializes a NineSliceSprite into a gl2d node (sync).
 * @param nss - The nine-slice sprite to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.nodes
 * @category gl2d
 * @standard
 */
export function serializeNineSliceSprite(nss: NineSliceSprite, ctx: Gl2dSerializeContext): Gl2dRef
{
    const textureRef = nss.texture.toGl2d(ctx);
    const result = setupNineSliceSpriteNode(nss, textureRef, ctx);

    if (typeof result !== 'object') return result;

    const { node, index } = result;

    applyMask(node, nss, ctx);

    return index;
}
