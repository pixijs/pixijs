import { createTexture } from '../../assets/loader/parsers/textures/utils/createTexture';
import { Rectangle } from '../../maths/shapes/Rectangle';
import { CompressedSource } from '../../rendering/renderers/shared/texture/sources/CompressedSource';
import { blockDataMap } from '../../rendering/renderers/shared/texture/utils/compressedBlockData';
import { getResolutionOfUrl } from '../../utils/network/getResolutionOfUrl';

import type { Loader } from '../../assets/loader/Loader';
import type { ResolvedAsset } from '../../assets/types';
import type { TextureSourceOptions } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { BlockData } from '../../rendering/renderers/shared/texture/utils/compressedBlockData';

/**
 * Creates a texture from a parsed compressed texture file, at `asset.data.resolution` or the url's `@2x` suffix
 *
 * It pads a size that isn't whole blocks up to whole blocks and frames the texture to the image.
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
    const { width, height } = options;
    const blockData = blockDataMap[options.format];
    // WebGPU only creates compressed textures whose size is whole blocks
    const paddedWidth = blockData ? Math.ceil(width / blockData.blockWidth) * blockData.blockWidth : width;
    const paddedHeight = blockData ? Math.ceil(height / blockData.blockHeight) * blockData.blockHeight : height;
    const padded = paddedWidth !== width || paddedHeight !== height;

    // the constructor multiplies width and height by resolution, even TextureSource.defaultOptions.resolution, but
    // the parsed size is already in pixels: build at 1, then set the real resolution
    const source = new CompressedSource({
        ...(padded ? {
            ...options,
            width: paddedWidth,
            height: paddedHeight,
            resource: padLevels(options.resource, blockData, width, height, paddedWidth, paddedHeight),
        } : options),
        resolution: 1,
    });
    const resolution = asset.data?.resolution || getResolutionOfUrl(url);

    source.resolution = resolution;

    const frame = padded ? new Rectangle(0, 0, width / resolution, height / resolution) : undefined;

    return createTexture(source, loader, url, frame);
}

/**
 * Returns the levels with the block counts of the padded size's mip chain
 *
 * Most levels already have them. A level that's a block row or column short gets a copy with its last row and
 * column of blocks repeated.
 * @param levels - the image's mip levels
 * @param blockData - the format's block footprint and byte size
 * @param width - the image width in pixels
 * @param height - the image height in pixels
 * @param paddedWidth - the width rounded up to whole blocks
 * @param paddedHeight - the height rounded up to whole blocks
 */
function padLevels(
    levels: Uint8Array[],
    blockData: BlockData,
    width: number,
    height: number,
    paddedWidth: number,
    paddedHeight: number,
): Uint8Array[]
{
    const { blockBytes, blockWidth, blockHeight } = blockData;

    return levels.map((level, i) =>
    {
        const blocksX = Math.ceil(Math.max(width >> i, 1) / blockWidth);
        const blocksY = Math.ceil(Math.max(height >> i, 1) / blockHeight);
        const paddedBlocksX = Math.ceil(Math.max(paddedWidth >> i, 1) / blockWidth);
        const paddedBlocksY = Math.ceil(Math.max(paddedHeight >> i, 1) / blockHeight);

        if (blocksX === paddedBlocksX && blocksY === paddedBlocksY) return level;

        const rowBytes = blocksX * blockBytes;
        const paddedRowBytes = paddedBlocksX * blockBytes;
        const padded = new Uint8Array(paddedRowBytes * paddedBlocksY);

        for (let y = 0; y < paddedBlocksY; y++)
        {
            const sourceRow = Math.min(y, blocksY - 1) * rowBytes;
            const rowStart = y * paddedRowBytes;

            padded.set(level.subarray(sourceRow, sourceRow + rowBytes), rowStart);

            for (let x = blocksX; x < paddedBlocksX; x++)
            {
                padded.copyWithin(rowStart + (x * blockBytes), rowStart + rowBytes - blockBytes, rowStart + rowBytes);
            }
        }

        return padded;
    });
}
