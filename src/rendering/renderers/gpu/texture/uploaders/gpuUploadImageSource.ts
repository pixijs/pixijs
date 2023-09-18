import type { ImageSource } from '../../../shared/texture/sources/ImageSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

export const gpuUploadImageResource = {

    type: 'image',

    upload(source: ImageSource, gpuTexture: GPUTexture, gpu: GPU)
    {
        const resource = source.resource as ImageBitmap | HTMLCanvasElement | OffscreenCanvas | HTMLVideoElement;

        if (!resource) return;

        const width = source.resource?.width || source.pixelWidth;
        const height = source.resource?.height || source.pixelHeight;

        gpu.device.queue.copyExternalImageToTexture(
            { source: resource },
            { texture: gpuTexture, premultipliedAlpha: true },
            {
                width,
                height,
            }
        );
    }
} as GpuTextureUploader<ImageSource>;

