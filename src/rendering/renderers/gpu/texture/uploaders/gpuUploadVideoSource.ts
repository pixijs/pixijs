import { gpuUploadImageResource } from './gpuUploadImageSource';

import type { VideoSource } from '../../../shared/texture/sources/VideoSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

export const gpuUploadVideoResource = {

    type: 'video',

    upload(source: VideoSource, gpuTexture: GPUTexture, gpu: GPU)
    {
        gpuUploadImageResource.upload(source, gpuTexture, gpu);
    }
} as GpuTextureUploader<VideoSource>;

