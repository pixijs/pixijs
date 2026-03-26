import { type ImageSource } from '../../../../rendering/renderers/shared/texture/sources/ImageSource';
import { type Gl2dImageSourceResource, type Gl2dRef } from '../../../Gl2dSchema';
import { type Gl2dSerializeContext } from '../../../serializeContext';
import { serializeCoreTextureSource } from './serializeTextureSource';

/** @internal */
export type SerializeImageSource = () => void;

/**
 * Serializes a ImageSource into an image_source resource (sync).
 * @param source - The ImageSource to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.resources
 * @category gl2d
 * @internal
 */
export function serializeImageSource(source: ImageSource, ctx: Gl2dSerializeContext): Gl2dRef
{
    const existing = ctx.resourceMap.get(source);

    if (existing !== undefined) return existing;

    const resource = serializeCoreTextureSource(source, ctx);
    const imageResource = { ...resource, type: 'image_source' } as Gl2dImageSourceResource;
    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(imageResource);
    ctx.resourceMap.set(source, index);

    return index;
}
