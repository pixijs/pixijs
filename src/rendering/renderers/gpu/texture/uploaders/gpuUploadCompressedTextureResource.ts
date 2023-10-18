import type { CompressedSource } from '../../../shared/texture/sources/CompressedSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

export const blockDataMap: Record<string, {blockBytes: number, blockWidth: number, blockHeight: number}> = {
    'bc1-rgba-unorm': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'bc2-rgba-unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc3-rgba-unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc7-rgba-unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'etc1-rgb-unorm': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'etc2-rgba8unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'astc-4x4-unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
};

const defaultBlockData = { blockBytes: 4, blockWidth: 1, blockHeight: 1 };

export const gpuUploadCompressedTextureResource = {

    type: 'compressed',

    upload(source: CompressedSource, gpuTexture: GPUTexture, gpu: GPU)
    {
        let mipWidth = source.pixelWidth;
        let mipHeight = source.pixelHeight;

        const blockData = blockDataMap[source.format] || defaultBlockData;

        for (let i = 0; i < source.resource.length; i++)
        {
            const levelBuffer = source.resource[i];

            const bytesPerRow = Math.ceil(mipWidth / blockData.blockWidth) * blockData.blockBytes;

            gpu.device.queue.writeTexture(
                {
                    texture: gpuTexture,
                    mipLevel: i
                },
                levelBuffer,
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

