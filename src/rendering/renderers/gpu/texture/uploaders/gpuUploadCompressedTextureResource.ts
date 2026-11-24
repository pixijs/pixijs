import { TEXTURE_FORMAT_BYTES_PER_PIXEL } from '../../../shared/texture/const';
import { blockDataMap } from '../../../shared/texture/utils/compressedBlockData';

import type { CompressedSource } from '../../../shared/texture/sources/CompressedSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

const defaultBlockData = { blockBytes: 4, blockWidth: 1, blockHeight: 1 };

/** @internal */
export const gpuUploadCompressedTextureResource = {

    type: 'compressed',

    upload(source: CompressedSource, gpuTexture: GPUTexture, gpu: GPU, originZOverride = 0)
    {
        let mipWidth = source.pixelWidth;
        let mipHeight = source.pixelHeight;

        const blockData = blockDataMap[source.format] || defaultBlockData;
        const bytesPerPixel = TEXTURE_FORMAT_BYTES_PER_PIXEL[source.format];

        for (let i = 0; i < source.resource.length; i++)
        {
            const levelBuffer = source.resource[i];

            // uncompressed levels are tightly packed rows of texels
            const bytesPerRow = bytesPerPixel
                ? mipWidth * bytesPerPixel
                : Math.ceil(mipWidth / blockData.blockWidth) * blockData.blockBytes;

            gpu.device.queue.writeTexture(
                {
                    texture: gpuTexture,
                    mipLevel: i,
                    origin: { x: 0, y: 0, z: originZOverride },
                },
                levelBuffer as BufferSource,
                {
                    offset: 0,
                    bytesPerRow,
                },
                {
                    width: Math.ceil(mipWidth / blockData.blockWidth) * blockData.blockWidth,
                    height: Math.ceil(mipHeight / blockData.blockHeight) * blockData.blockHeight,
                    depthOrArrayLayers: 1,
                }
            );

            mipWidth = Math.max(mipWidth >> 1, 1);
            mipHeight = Math.max(mipHeight >> 1, 1);
        }
    }
} as GpuTextureUploader<CompressedSource>;
