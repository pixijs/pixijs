import { PIXI_TILING_SPRITE_NODE_DEFAULTS, TILING_SPRITE_NODE_DEFAULTS } from '../../defaults';
import { type Gl2dRef, type Gl2dSerializerInput } from '../../types/Gl2dTypes';
import {
    type Gl2dPixiTilingSpriteNode,
    type Gl2dPixiTilingSpriteNodeExtension,
} from '../../types/pixi/PixiGl2dNodes';
import { gl2dUtils } from '../../utils';
import { serializeCoreNodeProperties } from '../serializeCoreNodeProperties';
import { applyMask, serializeContainerExtensions } from './serializeContainer';

import type { TilingSprite } from '../../../scene/sprite-tiling/TilingSprite';
import type { Gl2dSerializeContext } from '../../serializeContext';

interface TilingSpriteSetup
{
    node: Gl2dPixiTilingSpriteNode;
    index: Gl2dRef;
}

function serializeTilingSpriteExtensions(
    ts: TilingSprite,
    node: Gl2dPixiTilingSpriteNode,
    ctx: Gl2dSerializeContext,
)
{
    const input: Gl2dSerializerInput<Gl2dPixiTilingSpriteNodeExtension> = {
        applyAnchorToTexture: gl2dUtils.checkValue(
            ts.applyAnchorToTexture,
            PIXI_TILING_SPRITE_NODE_DEFAULTS.applyAnchorToTexture,
        ),
        clampMargin: gl2dUtils.checkValue(
            ts.clampMargin,
            PIXI_TILING_SPRITE_NODE_DEFAULTS.clampMargin,
        ),
    };

    const ext = gl2dUtils.compact(input);

    if (Object.keys(ext).length > 0)
    {
        node.extensions = { ...node.extensions, pixi_tiling_sprite_node: ext };
        ctx.gl2d.extensionsUsed.add('pixi_tiling_sprite_node');
    }
}

function setupTilingSpriteNode(
    ts: TilingSprite,
    textureRef: Gl2dRef,
    ctx: Gl2dSerializeContext,
): TilingSpriteSetup | Gl2dRef
{
    const existing = ctx.nodeMap.get(ts);

    if (existing !== undefined) return existing;

    const core = serializeCoreNodeProperties(ts, ctx, 'tiling_sprite');
    const node: Gl2dPixiTilingSpriteNode = gl2dUtils.compact({
        ...core,
        texture: textureRef,
        width: ts.width,
        height: ts.height,
        tilePosition: gl2dUtils.checkObservablePoint(
            ts._tileTransform.position as any,
            TILING_SPRITE_NODE_DEFAULTS.tilePosition,
        ),
        tileScale: gl2dUtils.checkObservablePoint(
            ts._tileTransform.scale as any,
            TILING_SPRITE_NODE_DEFAULTS.tileScale,
        ),
        tileRotation: gl2dUtils.checkValue(
            ts._tileTransform.rotation,
            TILING_SPRITE_NODE_DEFAULTS.tileRotation,
        ),
    });

    serializeContainerExtensions(ts, node, ctx);
    serializeTilingSpriteExtensions(ts, node, ctx);

    const index = ctx.gl2d.nodes.length;

    ctx.gl2d.nodes.push(node);
    ctx.nodeMap.set(ts, index);

    return { node, index };
}

/**
 * Serializes a TilingSprite into a gl2d node (sync).
 * @param ts - The tiling sprite to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.nodes
 * @category gl2d
 * @standard
 */
export function serializeTilingSprite(ts: TilingSprite, ctx: Gl2dSerializeContext): Gl2dRef
{
    const textureRef = ts.texture.toGl2d(ctx);
    const result = setupTilingSpriteNode(ts, textureRef, ctx);

    if (typeof result !== 'object') return result;

    const { node, index } = result;

    applyMask(node, ts, ctx);

    return index;
}
