import { type BufferImageSource } from '../../../../rendering/renderers/shared/texture/sources/BufferImageSource';
import { type Gl2dSerializeContext } from '../../../serializeContext';
import { type Gl2dRef } from '../../../types/Gl2dTypes';
import { type Gl2dPixiBufferImageSourceResource } from '../../../types/pixi/PixiGl2dResources';
import { serializeCoreTextureSource } from './serializeTextureSource';

/** @internal */
export type SerializeBufferImageSource = () => void;

/**
 * Serializes a BufferImageSource into a buffer_image_source resource (sync).
 * @param source - The BufferImageSource to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.resources
 * @category gl2d
 * @internal
 */
export function serializeBufferImageSource(source: BufferImageSource, ctx: Gl2dSerializeContext): Gl2dRef
{
    const existing = ctx.resourceMap.get(source);

    if (existing !== undefined) return existing;

    const resource = serializeCoreTextureSource(source, ctx);
    const bufferResource: Gl2dPixiBufferImageSourceResource = {
        ...resource,
        type: 'buffer_image_source',
        uid: `buffer_image_source_${String(source.uid)}`,
        uri: Array.from(source.resource as ArrayLike<number>),
    };
    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(bufferResource);
    ctx.resourceMap.set(source, index);

    return index;
}
