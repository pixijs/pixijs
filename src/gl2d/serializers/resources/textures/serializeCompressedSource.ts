import { type CompressedSource } from '../../../../rendering/renderers/shared/texture/sources/CompressedSource';
import { type Gl2dSerializeContext } from '../../../serializeContext';
import { type Gl2dRef } from '../../../types/Gl2dTypes';
import { type Gl2dPixiCompressedSourceResource } from '../../../types/pixi/PixiGl2dResources';
import { serializeCoreTextureSource } from './serializeTextureSource';

/** @internal */
export type SerializeCompressedSource = () => void;

/**
 * Serializes a CompressedSource into a compressed_source resource (sync).
 * @param source - The CompressedSource to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.resources
 * @category gl2d
 * @internal
 */
export function serializeCompressedSource(source: CompressedSource, ctx: Gl2dSerializeContext): Gl2dRef
{
    const existing = ctx.resourceMap.get(source);

    if (existing !== undefined) return existing;

    const resource = serializeCoreTextureSource(source, ctx);
    const compressedResource: Gl2dPixiCompressedSourceResource = {
        ...resource,
        type: 'compressed_source',
        uid: `compressed_source_${String(source.uid)}`,
    };
    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(compressedResource);
    ctx.resourceMap.set(source, index);

    return index;
}
