import { type Spritesheet } from '../../../spritesheet/Spritesheet';
import { type Gl2dRef, type Gl2dSpritesheetResource } from '../../Gl2dSchema';
import { type Gl2dSerializeContext } from '../../serializeContext';
import { gl2dUtils } from '../../utils';

function buildSpritesheetResource(
    spritesheet: Spritesheet,
    sourceRef: Gl2dRef,
    ctx: Gl2dSerializeContext,
): Gl2dSpritesheetResource
{
    const node: Required<Gl2dSpritesheetResource> = gl2dUtils.removeUndefinedOrNull(
        {
            type: 'spritesheet',
            name: undefined,
            uid: `spritesheet_resource_${String(spritesheet.uid)}`,
            uri: spritesheet.uri,
            source: sourceRef,
            extensions: undefined,
        },
        1,
    );

    if (spritesheet.cachePrefix)
    {
        node.extensions = {
            pixi_spritesheet: { cachePrefix: spritesheet.cachePrefix },
        };
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
export function serializeSpritesheet(spritesheet: Spritesheet, ctx: Gl2dSerializeContext): Gl2dRef
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
