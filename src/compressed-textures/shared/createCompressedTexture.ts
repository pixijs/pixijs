import { createTexture } from '../../assets/loader/parsers/textures/utils/createTexture';
import { CompressedSource } from '../../rendering/renderers/shared/texture/sources/CompressedSource';
import { getResolutionOfUrl } from '../../utils/network/getResolutionOfUrl';

import type { Loader } from '../../assets/loader/Loader';
import type { ResolvedAsset } from '../../assets/types';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';

/**
 * Creates a texture from a parsed compressed texture file, at `asset.data.resolution` or the url's `@2x` suffix
 * @param options - the parsed texture, with its width and height in pixels
 * @param url - the url the texture was loaded from
 * @param asset - the resolved asset
 * @param loader - the loader that loaded the file
 * @internal
 */
export function createCompressedTexture(
    options: TextureSourceOptions<Uint8Array[]>,
    url: string,
    asset: ResolvedAsset,
    loader: Loader,
): Texture
{
    // the constructor multiplies width and height by resolution, even TextureSource.defaultOptions.resolution, but
    // the parsed size is already in pixels: build at 1, then set the real resolution
    const source = new CompressedSource({ ...options, resolution: 1 });

    source.resolution = asset.data?.resolution || getResolutionOfUrl(url);

    return createTexture(source, loader, url);
}
