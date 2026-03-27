import { type Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { PIXI_TEXTURE_DEFAULTS } from '../../../defaults';
import { type Gl2dRef, type Gl2dSerializerInput } from '../../../types/Gl2dTypes';
import { type Gl2dPixiTextureResource } from '../../../types/pixi/PixiGl2dResources';
import { gl2dUtils } from '../../../utils';
import { findFrameName, findSpritesheetForSource } from '../utils/spritesheetUtils';

import type { Gl2dSerializeContext } from '../../../serializeContext';

function serializeTextureExtensions(
    texture: Texture,
    resource: Gl2dPixiTextureResource,
    ctx: Gl2dSerializeContext,
): void
{
    const input: Gl2dSerializerInput<Gl2dPixiTextureResource['extensions']['pixi_texture_resource']> = {
        orig: gl2dUtils.checkRectangle(texture.orig, [0, 0, texture.source.width, texture.source.height]),
        trim: gl2dUtils.checkRectangle(texture.trim, [0, 0, texture.source.width, texture.source.height]),
        defaultAnchor: texture.defaultAnchor ? [texture.defaultAnchor.x, texture.defaultAnchor.y] : undefined,
        defaultBorders: texture.defaultBorders
            ? [
                texture.defaultBorders.left,
                texture.defaultBorders.top,
                texture.defaultBorders.right,
                texture.defaultBorders.bottom,
            ]
            : undefined,
        rotate: gl2dUtils.checkValue(texture.rotate, PIXI_TEXTURE_DEFAULTS.rotate),
        dynamic: gl2dUtils.checkValue(texture.dynamic, PIXI_TEXTURE_DEFAULTS.dynamic),
    };

    const ext = gl2dUtils.removeUndefinedOrNull(input, 1) as Required<
        Gl2dPixiTextureResource['extensions']['pixi_texture_resource']
    >;

    if (Object.keys(ext).length > 0)
    {
        resource.extensions = {
            ...resource.extensions,
            pixi_texture_resource: ext,
        };
        ctx.gl2d.extensionsUsed.add('pixi_texture_resource');
    }
}

/**
 * Serializes a Texture into a gl2d texture resource (sync).
 * @param texture - The Texture to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.resources
 * @category gl2d
 * @standard
 */
export function serializeTexture(texture: Texture, ctx: Gl2dSerializeContext): Gl2dRef
{
    const existing = ctx.resourceMap.get(texture);

    if (existing !== undefined) return existing;

    const spritesheetResult = findSpritesheetForSource(texture.source);
    let sourceRef: Gl2dRef;

    if (spritesheetResult)
    {
        sourceRef = spritesheetResult.spritesheet.toGl2d(ctx);
    }
    else
    {
        sourceRef = texture.source.toGl2d(ctx);
    }

    const resource: Gl2dPixiTextureResource = {
        type: 'texture',
        uid: `texture_resource_${String(texture.uid)}`,
        name: texture.label,
        source: sourceRef,
        extensions: undefined,
    };

    if (spritesheetResult)
    {
        const frameName = findFrameName(spritesheetResult.spritesheet, texture);

        if (frameName) resource.frameName = frameName;
    }

    const { frame, source } = texture;
    const isFullFrame
        = frame.x === 0 && frame.y === 0 && frame.width === source.width && frame.height === source.height;

    if (!isFullFrame)
    {
        resource.frame = [frame.x, frame.y, frame.width, frame.height];
    }

    serializeTextureExtensions(texture, resource, ctx);

    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(resource);
    ctx.resourceMap.set(texture, index);

    return index;
}
