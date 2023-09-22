import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

export const gpuUploadImageResource = {

    type: 'image',

    upload(source: TextureSource, gpuTexture: GPUTexture, gpu: GPU)
    {
        const resource = source.resource as ImageBitmap | HTMLCanvasElement | OffscreenCanvas;

        if (!resource) return;

        const width = source.resource?.width || source.pixelWidth;
        const height = source.resource?.height || source.pixelHeight;
        const premultipliedAlpha = source.alphaMode === 'premultiply-alpha-on-upload';

        gpu.device.queue.copyExternalImageToTexture(
            { source: resource },
            { texture: gpuTexture, premultipliedAlpha },
            {
                width,
                height,
            }
        );
    }
} as GpuTextureUploader<TextureSource>;

