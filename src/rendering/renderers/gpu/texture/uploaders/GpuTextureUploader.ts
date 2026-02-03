import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GPU } from '../../GpuDeviceSystem';

/** @internal */
export interface GpuTextureUploader<T extends TextureSource = TextureSource>
{
    type: string;
    /**
     * Uploads a texture source to the given GPU texture.
     * @param {T} source - The source to upload.
     * @param {GPUTexture} gpuTexture - The destination GPU texture.
     * @param {GPU} gpu - The GPU device wrapper.
     * @param {number} originZOverride - Optional destination array-layer (z) override (e.g. cube face index).
     * Defaults to 0.
     */
    upload(source: T, gpuTexture: GPUTexture, gpu: GPU, originZOverride?: number): void;
}
