import { type Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { PIXI_TEXTURE_DEFAULTS } from '../../../defaults';
import { type Gl2dRectangle, type Gl2dRef, type Gl2dSerializerInput } from '../../../types/Gl2dTypes';
import { type Gl2dPixiTextureResource, type Gl2dPixiTextureResourceExtension } from '../../../types/pixi/PixiGl2dResources';
import { gl2dUtils } from '../../../utils';
import { findFrameName, findSpritesheetForSource } from '../utils/spritesheetUtils';

import type { Gl2dSerializeContext } from '../../../serializeContext';

function serializeTextureExtensions(
    texture: Texture,
    resource: Gl2dPixiTextureResource,
    ctx: Gl2dSerializeContext,
): void
{
    const input: Gl2dSerializerInput<Gl2dPixiTextureResourceExtension> = {
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

    const ext = gl2dUtils.removeUndefinedOrNull(input, 1);

    if (Object.keys(ext).length > 0)
    {
        resource.extensions = { pixi_texture_resource: ext };
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
    const frameName = spritesheetResult ? findFrameName(spritesheetResult.spritesheet, texture) : undefined;
    const base = {
        type: 'texture' as const,
        uid: `texture_resource_${String(texture.uid)}` as `texture_resource_${string}`,
        name: texture.label,
    };
    const { frame, source } = texture;
    const isFullFrame
        = frame.x === 0 && frame.y === 0 && frame.width === source.width && frame.height === source.height;
    let frameRect: Gl2dRectangle | never;

    if (!isFullFrame && !(spritesheetResult && frameName))
    {
        frameRect = [frame.x, frame.y, frame.width, frame.height];
    }
    const resource: Gl2dPixiTextureResource = spritesheetResult && frameName
        ? { ...base, source: spritesheetResult.spritesheet.toGl2d(ctx), frameName }
        : { ...base, source: texture.source.toGl2d(ctx) as Gl2dRef, frame: frameRect };

    serializeTextureExtensions(texture, resource, ctx);

    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(resource);
    ctx.resourceMap.set(texture, index);

    return index;
}
