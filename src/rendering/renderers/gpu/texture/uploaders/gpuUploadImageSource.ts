import type { CanvasSource } from '../../../shared/texture/sources/CanvasSource';
import type { ImageSource } from '../../../shared/texture/sources/ImageSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

export const gpuUploadImageResource = {

    type: 'image',

    upload(source: ImageSource | CanvasSource, gpuTexture: GPUTexture, gpu: GPU)
    {
        const resource = source.resource as ImageBitmap | HTMLCanvasElement | OffscreenCanvas;

        if (!resource) return;

        const width = source.getResourceWidth() || source.pixelWidth;
        const height = source.getResourceHeight() || source.pixelHeight;

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

