import type { ImageSource } from '../../../shared/texture/sources/ImageSource';
import type { VideoSource } from '../../../shared/texture/sources/VideoSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

export const gpuUploadVideoResource = {

    type: 'video',

    upload(source: VideoSource, gpuTexture: GPUTexture, gpu: GPU)
    {
        const resource = source.resource as HTMLVideoElement;

        if (!resource || !source.isValid)
        {
            return;
        }

        const width = source.resource?.videoWidth || source.pixelWidth;
        const height = source.resource?.videoHeight || source.pixelHeight;

        gpu.device.queue.copyExternalImageToTexture(
            { source: resource },
            { texture: gpuTexture },
            {
                width,
                height,
            }
        );
    }
} as GpuTextureUploader<ImageSource>;

