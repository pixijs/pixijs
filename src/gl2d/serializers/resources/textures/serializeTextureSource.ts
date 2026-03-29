import { type TextureStyle } from '../../../../rendering/renderers/shared/texture/TextureStyle';
import { warn } from '../../../../utils/logging/warn';
import { IMAGE_SOURCE_DEFAULTS, PIXI_TEXTURE_SOURCE_DEFAULTS } from '../../../defaults';
import { type Gl2dWrapMode } from '../../../types/Gl2DResources';
import { type Gl2dRef, type Gl2dSerializerInput } from '../../../types/Gl2dTypes';
import {
    type Gl2dPixiGenericTextureSourceResource,
    type Gl2dPixiTextureSourceResource,
    type Gl2dPixiTextureSourceResourceExtension,
} from '../../../types/pixi/PixiGl2dResources';
import { gl2dUtils } from '../../../utils';

import type { TextureSource } from '../../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Gl2dSerializeContext } from '../../../serializeContext';

function getTextureSourceUri(source: TextureSource): string | undefined
{
    if (source.uri) return source.uri;
    if (source._sourceOrigin) return source._sourceOrigin;

    const resource = source.resource;

    if (resource && typeof (resource as any).src === 'string')
    {
        return (resource as any).src;
    }

    return undefined;
}

function extractDataUri(source: TextureSource): string | undefined
{
    const resource = source.resource;

    if (resource && typeof (resource as any).toDataURL === 'function')
    {
        return (resource as any).toDataURL();
    }

    if (ArrayBuffer.isView(resource) || resource instanceof ArrayBuffer)
    {
        return 'buffer://raw';
    }

    return undefined;
}

function serializeTextureSourceExtensions<TType extends string>(
    source: TextureSource,
    resource: Gl2dPixiTextureSourceResource<TType>,
    ctx: Gl2dSerializeContext,
): void
{
    const input: Gl2dSerializerInput<Gl2dPixiTextureSourceResourceExtension> = {
        dimensions: gl2dUtils.checkValue(source.dimension, PIXI_TEXTURE_SOURCE_DEFAULTS.dimensions),
        mipLevelCount: gl2dUtils.checkValue(source.mipLevelCount, PIXI_TEXTURE_SOURCE_DEFAULTS.mipLevelCount),
        autoGenerateMipmaps: gl2dUtils.checkValue(
            source.autoGenerateMipmaps,
            PIXI_TEXTURE_SOURCE_DEFAULTS.autoGenerateMipmaps,
        ),
        autoGarbageCollect: gl2dUtils.checkValue(
            source.autoGarbageCollect,
            PIXI_TEXTURE_SOURCE_DEFAULTS.autoGarbageCollect,
        ),
        compare: source.style?.compare,
        maxAnisotropy: gl2dUtils.checkValue(source.style?.maxAnisotropy, PIXI_TEXTURE_SOURCE_DEFAULTS.maxAnisotropy),
        addressModeU: gl2dUtils.checkValue(source.style?.addressModeU, PIXI_TEXTURE_SOURCE_DEFAULTS.addressModeU),
        addressModeV: gl2dUtils.checkValue(source.style?.addressModeV, PIXI_TEXTURE_SOURCE_DEFAULTS.addressModeV),
        addressModeW: gl2dUtils.checkValue(source.style?.addressModeW, PIXI_TEXTURE_SOURCE_DEFAULTS.addressModeW),
        magFilter: gl2dUtils.checkValue(source.style?.magFilter, PIXI_TEXTURE_SOURCE_DEFAULTS.magFilter),
        minFilter: gl2dUtils.checkValue(source.style?.minFilter, PIXI_TEXTURE_SOURCE_DEFAULTS.minFilter),
        mipmapFilter: gl2dUtils.checkValue(source.style?.mipmapFilter, PIXI_TEXTURE_SOURCE_DEFAULTS.mipmapFilter),
        lodMinClamp: gl2dUtils.checkValue(source.style?.lodMinClamp, PIXI_TEXTURE_SOURCE_DEFAULTS.lodMinClamp),
        lodMaxClamp: gl2dUtils.checkValue(source.style?.lodMaxClamp, PIXI_TEXTURE_SOURCE_DEFAULTS.lodMaxClamp),
    };

    const ext = gl2dUtils.compact(input);

    if (Object.keys(ext).length > 0)
    {
        resource.extensions = { pixi_texture_source_resource: ext };
        ctx.gl2d.extensionsUsed.add('pixi_texture_source_resource');
    }
}

/**
 * Serializes the core properties of a TextureSource into a texture_source resource.
 * @param source - The TextureSource to serialize
 * @param ctx - The serialization context
 * @returns The serialized texture_source resource
 * @category gl2d
 * @internal
 */
export function serializeCoreTextureSource(
    source: TextureSource,
    ctx: Gl2dSerializeContext,
): Gl2dPixiGenericTextureSourceResource
{
    let uri = getTextureSourceUri(source);

    if (!uri)
    {
        uri = extractDataUri(source);
    }

    if (!uri)
    {
        warn('[gl2d] TextureSource has no URI and no canvas resource; using empty URI');
    }

    const wrapModeMap: Record<TextureStyle['addressMode'], Gl2dWrapMode> = {
        'clamp-to-edge': 'clamp',
        repeat: 'repeat',
        'mirror-repeat': 'mirror',
    };

    const resource = gl2dUtils.compact<Gl2dPixiGenericTextureSourceResource>({
        type: 'texture_source',
        uid: `texture_source_${String(source.uid)}`,
        name: source.label,
        uri,
        width: gl2dUtils.checkValue(source.width, IMAGE_SOURCE_DEFAULTS.width),
        height: gl2dUtils.checkValue(source.height, IMAGE_SOURCE_DEFAULTS.height),
        resolution: gl2dUtils.checkValue(source._resolution, IMAGE_SOURCE_DEFAULTS.resolution),
        format: gl2dUtils.checkValue(source.format, IMAGE_SOURCE_DEFAULTS.format),
        antialias: gl2dUtils.checkValue(source.antialias, IMAGE_SOURCE_DEFAULTS.antialias),
        alphaMode: gl2dUtils.checkValue(source.alphaMode, IMAGE_SOURCE_DEFAULTS.alphaMode),
        addressMode: gl2dUtils.checkValue(
            wrapModeMap[source.style?.addressMode],
            IMAGE_SOURCE_DEFAULTS.addressMode,
        ),
        scaleMode: gl2dUtils.checkValue(source.style?.scaleMode, IMAGE_SOURCE_DEFAULTS.scaleMode),
        extensions: undefined,
    });

    serializeTextureSourceExtensions(source, resource, ctx);

    return resource;
}

/**
 * Serializes a TextureSource into an image_source resource (sync).
 * @param source - The TextureSource to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.resources
 * @category gl2d
 * @internal
 */
export function serializeTextureSource(
    source: TextureSource,
    ctx: Gl2dSerializeContext,
): Gl2dRef
{
    const existing = ctx.resourceMap.get(source);

    if (existing !== undefined) return existing;

    let uri = getTextureSourceUri(source);

    if (!uri)
    {
        uri = extractDataUri(source);
    }

    if (!uri)
    {
        warn('[gl2d] TextureSource has no URI and no canvas resource; using empty URI');
    }

    const resource = serializeCoreTextureSource(source, ctx);
    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(resource);
    ctx.resourceMap.set(source, index);

    return index;
}
