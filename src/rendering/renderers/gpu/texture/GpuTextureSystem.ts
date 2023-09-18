import { ExtensionType } from '../../../../extensions/Extensions';
import { settings } from '../../../../settings/settings';
import { CanvasPool } from '../../shared/texture/CanvasPool';
import { BindGroup } from '../shader/BindGroup';
import { gpuUploadBufferImageResource } from './uploaders/gpuUploadBufferImageResource';
import { gpuUploadImageResource } from './uploaders/gpuUploadImageSource';
import { GpuMipmapGenerator } from './utils/GpuMipmapGenerator';

import type { ICanvas } from '../../../../settings/adapter/ICanvas';
import type { System } from '../../shared/system/System';
import type { CanvasGenerator, GetPixelsOutput } from '../../shared/texture/GenerateCanvas';
import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { BindableTexture, Texture } from '../../shared/texture/Texture';
import type { TextureStyle } from '../../shared/texture/TextureStyle';
import type { GPU } from '../GpuDeviceSystem';
import type { WebGPURenderer } from '../WebGPURenderer';
import type { GpuTextureUploader } from './uploaders/GpuTextureUploader';

export class GpuTextureSystem implements System, CanvasGenerator
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'texture',
    } as const;

    public readonly managedTextures: TextureSource[] = [];

    protected CONTEXT_UID: number;
    private _gpuSources: Record<number, GPUTexture> = Object.create(null);
    private _gpuSamplers: Record<string, GPUSampler> = Object.create(null);
    private _bindGroupHash: Record<string, BindGroup> = Object.create(null);
    private _textureViewHash: Record<string, GPUTextureView> = Object.create(null);

    private readonly _uploads: Record<string, GpuTextureUploader> = {
        image: gpuUploadImageResource,
        buffer: gpuUploadBufferImageResource
    };

    private _gpu: GPU;
    private _mipmapGenerator?: GpuMipmapGenerator;

    private readonly _renderer: WebGPURenderer;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
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

        const gpuTexture = this._gpu.device.createTexture(textureDescriptor);

        this._gpuSources[source.uid] = gpuTexture;

        source.on('update', this.onSourceUpdate, this);
        source.on('resize', this.onSourceResize, this);
        source.on('destroy', this.onSourceDestroy, this);
        source.on('unload', this.onSourceUnload, this);

        this.managedTextures.push(source);

        this.onSourceUpdate(source);

        return gpuTexture;
    }

    protected onSourceUpdate(source: TextureSource): void
    {
        const gpuTexture = this._gpuSources[source.uid];

        // destroyed!
        if (!gpuTexture) return;

        if (this._uploads[source.uploadMethodId])
        {
            this._uploads[source.uploadMethodId].upload(source, gpuTexture, this._gpu);
        }

        if (source.autoGenerateMipmaps && source.mipLevelCount > 1)
        {
            if (!this._mipmapGenerator)
            {
                this._mipmapGenerator = new GpuMipmapGenerator(this._gpu.device);
            }

            this._mipmapGenerator.generateMipmap(gpuTexture);
        }
    }

    protected onSourceUnload(source: TextureSource): void
    {
        const gpuTexture = this._gpuSources[source.uid];

        if (gpuTexture)
        {
            this._gpuSources[source.uid] = null;

            gpuTexture.destroy();
        }
    }

    protected onSourceDestroy(source: TextureSource): void
    {
        source.off('update', this.onSourceUpdate, this);
        source.off('unload', this.onSourceUnload, this);
        source.off('destroy', this.onSourceDestroy, this);
        source.off('resize', this.onSourceResize, this);

        this.managedTextures.splice(this.managedTextures.indexOf(source), 1);

        this.onSourceUnload(source);
    }

    protected onSourceResize(source: TextureSource): void
    {
        const gpuTexture = this._gpuSources[source.uid];

        if (gpuTexture.width !== source.pixelWidth || gpuTexture.height !== source.pixelHeight)
        {
            this.onSourceUnload(source);
            this.initSource(source);
        }
    }

    private _initSampler(sampler: TextureStyle): GPUSampler
    {
        this._gpuSamplers[sampler.resourceId] = this._gpu.device.createSampler(sampler);

        return this._gpuSamplers[sampler.resourceId];
    }

    public getGpuSampler(sampler: TextureStyle): GPUSampler
    {
        return this._gpuSamplers[sampler.resourceId] || this._initSampler(sampler);
    }

    public getGpuSource(source: TextureSource): GPUTexture
    {
        return this._gpuSources[source.uid] || this.initSource(source);
    }

    public getTextureBindGroup(texture: Texture)
    {
        return this._bindGroupHash[texture.id] ?? this._createTextureBindGroup(texture);
    }

    private _createTextureBindGroup(texture: Texture)
    {
        const bindGroupId = texture.id;

        this._bindGroupHash[bindGroupId] = new BindGroup({
            0: texture.source,
            1: texture.style,
        });

        return this._bindGroupHash[bindGroupId];
    }

    public getTextureView(texture: BindableTexture)
    {
        const source = texture.source;

        return this._textureViewHash[source.uid] ?? this._createTextureView(source);
    }

    private _createTextureView(texture: TextureSource)
    {
        this._textureViewHash[texture.uid] = this.getGpuSource(texture).createView();

        return this._textureViewHash[texture.uid];
    }

    public generateCanvas(texture: Texture): ICanvas
    {
        const renderer = this._renderer;

        const commandEncoder = renderer.gpu.device.createCommandEncoder();

        // create canvas
        const canvas = settings.ADAPTER.createCanvas();

        canvas.width = texture.source.pixelWidth;
        canvas.height = texture.source.pixelHeight;

        const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;

        context.configure({
            device: renderer.gpu.device,
            // eslint-disable-next-line max-len
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC,
            format: 'bgra8unorm',
            alphaMode: 'premultiplied',
        });

        commandEncoder.copyTextureToTexture({
            texture: renderer.texture.getGpuSource(texture.source),
            origin: {
                x: 0,
                y: 0,
            },
        }, {
            texture: context.getCurrentTexture(),
        }, {
            width: canvas.width,
            height: canvas.height,
        });

        renderer.gpu.device.queue.submit([commandEncoder.finish()]);

        return canvas;
    }

    public getPixels(texture: Texture): GetPixelsOutput
    {
        const webGPUCanvas = this.generateCanvas(texture);

        const canvasAndContext = CanvasPool.getOptimalCanvasAndContext(webGPUCanvas.width, webGPUCanvas.height);

        const context = canvasAndContext.context;

        context.drawImage(webGPUCanvas, 0, 0);

        const { width, height } = webGPUCanvas;

        const imageData = context.getImageData(0, 0, width, height);

        const pixels = new Uint8ClampedArray(imageData.data.buffer);

        CanvasPool.returnCanvasAndContext(canvasAndContext);

        return { pixels, width, height };
    }

    public destroy(): void
    {
        for (const k of Object.keys(this._gpuSources))
        {
            const key = Number(k);
            const gpuTexture = this._gpuSources[key];

            gpuTexture.destroy();
            this._gpuSources[key] = null;
        }

        for (const k of Object.keys(this._bindGroupHash))
        {
            const key = Number(k);
            const bindGroup = this._bindGroupHash[key];

            bindGroup.destroy();
            this._bindGroupHash[key] = null;
        }

        this._gpu = null;
        this._mipmapGenerator = null;
        this._gpuSources = null;
        this._bindGroupHash = null;
        this._textureViewHash = null;
        this._gpuSamplers = null;
    }
}
