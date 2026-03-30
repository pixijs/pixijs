import { PIXI_TEXT_NODE_DEFAULTS, TEXT_NODE_DEFAULTS } from '../../defaults';
import { type Gl2dRef } from '../../types/Gl2dTypes';
import { type Gl2dPixiTextNode } from '../../types/pixi/PixiGl2dNodes';
import { gl2dUtils } from '../../utils';
import { serializeWebFont } from '../resources/text/serializeWebFont';
import { serializeTextureStyleFields } from '../resources/textures/serializeTextureSource';
import { serializeCoreNodeProperties } from '../serializeCoreNodeProperties';
import { applyMask, serializeContainerExtensions } from './serializeContainer';

import type { Text } from '../../../scene/text/Text';
import type { Gl2dSerializeContext } from '../../serializeContext';

interface TextSetup
{
    node: Gl2dPixiTextNode;
    index: Gl2dRef;
}

function setupTextNode(
    text: Text,
    styleRef: Gl2dRef,
    ctx: Gl2dSerializeContext,
): TextSetup | Gl2dRef
{
    const existing = ctx.nodeMap.get(text);

    if (existing !== undefined) return existing;

    const core = serializeCoreNodeProperties(text, ctx, 'text');

    const webFontRef = serializeWebFont(text._style.fontFamily, ctx);

    const node: Gl2dPixiTextNode = {
        ...core,
        text: text.text,
        style: styleRef,
    };

    if (!text._autoResolution && text._resolution !== null)
    {
        const resolution = gl2dUtils.checkValue(text._resolution, TEXT_NODE_DEFAULTS.resolution);

        // eslint-disable-next-line no-eq-null, eqeqeq
        if (resolution != null)
        {
            node.resolution = resolution;
        }
    }

    if (webFontRef !== undefined)
    {
        node.webFont = webFontRef;
    }

    serializeContainerExtensions(text, node, ctx);
    serializeTextExtensions(text, node, ctx);

    const index = ctx.gl2d.nodes.length;

    ctx.gl2d.nodes.push(node);
    ctx.nodeMap.set(text, index);

    return { node, index };
}

function serializeTextExtensions(
    text: Text,
    node: Gl2dPixiTextNode,
    ctx: Gl2dSerializeContext,
): void
{
    const ext: Record<string, unknown> = {};

    if (text.textureStyle)
    {
        const textureStyleObj = serializeTextureStyleFields(text.textureStyle);

        if (Object.keys(textureStyleObj).length > 0)
        {
            ext.textureStyle = textureStyleObj;
        }
    }

    const autoMipmaps = gl2dUtils.checkValue(
        text.autoGenerateMipmaps ?? false,
        PIXI_TEXT_NODE_DEFAULTS.autoGenerateMipmaps,
    );

    // eslint-disable-next-line no-eq-null, eqeqeq
    if (autoMipmaps != null)
    {
        ext.autoGenerateMipmaps = autoMipmaps;
    }

    if (Object.keys(ext).length > 0)
    {
        node.extensions = { ...node.extensions, pixi_text_node: ext };
        ctx.gl2d.extensionsUsed.add('pixi_text_node');
    }
}

/**
 * Serializes a Text into a gl2d node (sync).
 * @param text - The text to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.nodes
 * @category gl2d
 * @standard
 */
export function serializeText(text: Text, ctx: Gl2dSerializeContext): Gl2dRef
{
    const styleRef = text._style.toGl2d(ctx);
    const result = setupTextNode(text, styleRef, ctx);

    if (typeof result !== 'object') return result;

    const { node, index } = result;

    applyMask(node, text, ctx);

    return index;
}
