import type { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

/** @internal */
export const gpuUploadBufferImageResource = {

    type: 'image',

    upload(source: BufferImageSource, gpuTexture: GPUTexture, gpu: GPU, originZOverride = 0)
    {
        const resource = source.resource;

        const total = (source.pixelWidth | 0) * (source.pixelHeight | 0);

        const bytesPerPixel = resource.byteLength / total;

        gpu.device.queue.writeTexture(
            { texture: gpuTexture, origin: { x: 0, y: 0, z: originZOverride } },
            resource as ArrayBuffer,
            {
                offset: 0,
                rowsPerImage: source.pixelHeight,
                bytesPerRow: source.pixelWidth * bytesPerPixel,
            },
            {
                width: source.pixelWidth,
                height: source.pixelHeight,
                depthOrArrayLayers: 1,
            }
        );
    }
} as GpuTextureUploader<BufferImageSource>;

