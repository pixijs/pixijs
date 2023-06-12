import { ExtensionType } from '../../../../extensions/Extensions';
import { BindGroup } from '../shader/BindGroup';
import { gpuUploadBufferImageResource } from './uploaders/gpuUploadBufferImageResource';
import { gpuUploadImageResource } from './uploaders/gpuUploadImageSource';
import { GpuMipmapGenerator } from './utils/GpuMipmapGenerator';

import type { ExtensionMetadata } from '../../../../extensions/Extensions';
import type { ISystem } from '../../shared/system/ISystem';
import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { BindableTexture, Texture } from '../../shared/texture/Texture';
import type { TextureStyle } from '../../shared/texture/TextureStyle';
import type { GPU } from '../GpuDeviceSystem';
import type { WebGPURenderer } from '../WebGPURenderer';
import type { GpuTextureUploader } from './uploaders/GpuTextureUploader';

export class GpuTextureSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGPURendererSystem,
        ],
        name: 'texture',
    };

    readonly renderer: WebGPURenderer;
    protected CONTEXT_UID: number;
    gpuSources: Record<number, GPUTexture> = {};
    gpuSamplers: Record<string, GPUSampler> = {};
    bindGroupHash: Record<string, BindGroup> = {};
    textureViewHash: Record<string, GPUTextureView> = {};

    managedTextureSources: Record<number, TextureSource> = {};

    uploads: Record<string, GpuTextureUploader> = {
        image: gpuUploadImageResource,
        buffer: gpuUploadBufferImageResource
    };

    gpu: GPU;
    mipmapGenerator?: GpuMipmapGenerator;

    protected contextChange(gpu: GPU): void
    {
        this.gpu = gpu;
    }

    public initSource(source: TextureSource): GPUTexture
    {
        if (source.autoGenerateMipmaps)
        {
            const biggestDimension = Math.max(source.pixelWidth, source.pixelHeight);

            source.mipLevelCount = Math.floor(Math.log2(biggestDimension)) + 1;
        }

        const textureDescriptor = {
            size: { width: source.pixelWidth, height: source.pixelHeight },
            format: source.format,
            sampleCount: source.sampleCount,
            mipLevelCount: source.mipLevelCount,
            dimension: source.dimension,
            usage: GPUTextureUsage.TEXTURE_BINDING
                | GPUTextureUsage.COPY_DST
                | GPUTextureUsage.RENDER_ATTACHMENT
                | GPUTextureUsage.COPY_SRC,
        };

        const gpuTexture = this.gpu.device.createTexture(textureDescriptor);

        this.gpuSources[source.uid] = gpuTexture;

        this.managedTextureSources[source.uid] = source;

        source.on('update', this.onSourceUpdate, this);
        source.on('destroy', this.onSourceDestroy, this);
        source.on('resize', this.onSourceResize, this);

        this.onSourceUpdate(source);

        return gpuTexture;
    }

    onSourceUpdate(source: TextureSource): void
    {
        const gpuTexture = this.gpuSources[source.uid];

        // destroyed!
        if (!gpuTexture) return;

        if (this.uploads[source.type])
        {
            this.uploads[source.type].upload(source, gpuTexture, this.gpu);
        }

        if (source.autoGenerateMipmaps && source.mipLevelCount > 1)
        {
            if (!this.mipmapGenerator)
            {
                this.mipmapGenerator = new GpuMipmapGenerator(this.gpu.device);
            }

            this.mipmapGenerator.generateMipmap(gpuTexture);
        }
    }

    onSourceDestroy(source: TextureSource): void
    {
        source.off('update', this.onSourceUpdate, this);
        source.off('destroy', this.onSourceDestroy, this);
        source.off('resize', this.onSourceResize, this);

        const gpuTexture = this.gpuSources[source.uid];

        delete this.gpuSources[source.uid];

        gpuTexture.destroy();
    }

    onSourceResize(source: TextureSource): void
    {
        const gpuTexture = this.gpuSources[source.uid];

        if (gpuTexture.width !== source.pixelWidth || gpuTexture.height !== source.pixelHeight)
        {
            this.gpuSources[source.uid].destroy();
            this.gpuSources[source.uid] = null;
            this.initSource(source);
        }
    }

    initSampler(sampler: TextureStyle): GPUSampler
    {
        this.gpuSamplers[sampler.resourceId] = this.gpu.device.createSampler(sampler);

        return this.gpuSamplers[sampler.resourceId];
    }

    getGpuSampler(sampler: TextureStyle): GPUSampler
    {
        return this.gpuSamplers[sampler.resourceId] || this.initSampler(sampler);
    }

    getGpuSource(source: TextureSource): GPUTexture
    {
        return this.gpuSources[source.uid] || this.initSource(source);
    }

    getTextureBindGroup(texture: Texture)
    {
        return this.bindGroupHash[texture.id] ?? this.createTextureBindGroup(texture);
    }

    createTextureBindGroup(texture: Texture)
    {
        const bindGroupId = texture.id;

        this.bindGroupHash[bindGroupId] = new BindGroup({
            0: texture.source,
            1: texture.style,
        });

        return this.bindGroupHash[bindGroupId];
    }

    getTextureView(texture: BindableTexture)
    {
        const source = texture.source;

        return this.textureViewHash[source.uid] ?? this.createTextureView(source);
    }

    createTextureView(texture: TextureSource)
    {
        this.textureViewHash[texture.uid] = this.getGpuSource(texture).createView();

        return this.textureViewHash[texture.uid];
    }

    destroy(): void
    {
        throw new Error('Method not implemented.');
    }
}
