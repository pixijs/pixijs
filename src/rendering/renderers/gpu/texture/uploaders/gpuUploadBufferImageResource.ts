import type { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

export const gpuUploadBufferImageResource = {

    type: 'image',

    upload(source: BufferImageSource, gpuTexture: GPUTexture, gpu: GPU)
    {
        const resource = source.resource;

        const total = (source.pixelWidth | 0) * (source.pixelHeight | 0);

        const bytesPerPixel = resource.byteLength / total;

        gpu.device.queue.writeTexture(
            { texture: gpuTexture },
            resource,
            {
                offset: 0,
                rowsPerImage: source.pixelHeight,
                bytesPerRow: source.pixelHeight * bytesPerPixel,
            },
            {
                width: source.pixelWidth,
                height: source.pixelHeight,
                depthOrArrayLayers: 1,
            }
        );
    }
} as GpuTextureUploader<BufferImageSource>;

