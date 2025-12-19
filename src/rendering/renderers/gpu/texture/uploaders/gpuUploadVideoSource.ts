import { gpuUploadImageResource } from './gpuUploadImageSource';

import type { VideoSource } from '../../../shared/texture/sources/VideoSource';
import type { GPU } from '../../GpuDeviceSystem';
import type { GpuTextureUploader } from './GpuTextureUploader';

/** @internal */
export const gpuUploadVideoResource = {

    type: 'video',

    upload(source: VideoSource, gpuTexture: GPUTexture, gpu: GPU, originZOverride?: number)
    {
        gpuUploadImageResource.upload(source, gpuTexture, gpu, originZOverride);
    }
} as GpuTextureUploader<VideoSource>;

