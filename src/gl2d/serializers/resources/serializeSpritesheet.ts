import { type Spritesheet } from '../../../spritesheet/Spritesheet';
import { type Gl2dSerializeContext } from '../../serializeContext';
import { type Gl2dRef, type Gl2dSerializerInput } from '../../types/Gl2dTypes';
import { type Gl2dPixiSpritesheetExtension, type Gl2dPixiSpritesheetResource } from '../../types/pixi/PixiGl2dResources';
import { gl2dUtils } from '../../utils';

function buildSpritesheetResource(
    spritesheet: Spritesheet,
    sourceRef: Gl2dRef,
    ctx: Gl2dSerializeContext,
): Gl2dPixiSpritesheetResource
{
    const node = gl2dUtils.compact<Gl2dPixiSpritesheetResource>({
        type: 'spritesheet',
        uid: `spritesheet_${String(spritesheet.uid)}`,
        uri: spritesheet.uri,
        source: sourceRef,
        name: undefined,
    });

    const extInput: Gl2dSerializerInput<Gl2dPixiSpritesheetExtension> = {
        cachePrefix: gl2dUtils.checkValue(spritesheet.cachePrefix, ''),
    };

    const ext = gl2dUtils.compact(extInput);

    if (Object.keys(ext).length > 0)
    {
        node.extensions = { pixi_spritesheet: ext };
        ctx.gl2d.extensionsUsed.add('pixi_spritesheet');
    }

    return node;
}

/**
 * Serializes a Spritesheet into a gl2d spritesheet resource (sync).
 * @param spritesheet - The Spritesheet to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.resources
 * @category gl2d
 * @standard
 */
export function serializeSpritesheet(
    spritesheet: Spritesheet,
    ctx: Gl2dSerializeContext,
): Gl2dRef
{
    const existing = ctx.resourceMap.get(spritesheet);

    if (existing !== undefined) return existing;

    const sourceRef = spritesheet.textureSource.toGl2d(ctx);

    const resource = buildSpritesheetResource(spritesheet, sourceRef, ctx);

    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(resource);
    ctx.resourceMap.set(spritesheet, index);

    return index;
}
