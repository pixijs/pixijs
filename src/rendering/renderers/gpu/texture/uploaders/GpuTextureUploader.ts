import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GPU } from '../../GpuDeviceSystem';

/** @internal */
export interface GpuTextureUploader<T extends TextureSource = TextureSource>
{
    type: string;
    upload(source: T, gpuTexture: GPUTexture, gpu: GPU): void;
}
