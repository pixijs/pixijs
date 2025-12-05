import { DOMAdapter } from '../../../../environment/adapter';
import { ExtensionType } from '../../../../extensions/Extensions';
import { type GPUData } from '../../../../scene/view/ViewContainer';
import { GCManagedHash } from '../../../../utils/data/GCManagedHash';
import { UniformGroup } from '../../shared/shader/UniformGroup';
import { CanvasPool } from '../../shared/texture/CanvasPool';
import { BindGroup } from '../shader/BindGroup';
import { gpuUploadBufferImageResource } from './uploaders/gpuUploadBufferImageResource';
import { blockDataMap, gpuUploadCompressedTextureResource } from './uploaders/gpuUploadCompressedTextureResource';
import { gpuUploadImageResource } from './uploaders/gpuUploadImageSource';
import { gpuUploadVideoResource } from './uploaders/gpuUploadVideoSource';
import { GpuMipmapGenerator } from './utils/GpuMipmapGenerator';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { System } from '../../shared/system/System';
import type { CanvasGenerator, GetPixelsOutput } from '../../shared/texture/GenerateCanvas';
import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { BindableTexture, Texture } from '../../shared/texture/Texture';
import type { TextureStyle } from '../../shared/texture/TextureStyle';
import type { GPU } from '../GpuDeviceSystem';
import type { WebGPURenderer } from '../WebGPURenderer';
import type { GpuTextureUploader } from './uploaders/GpuTextureUploader';

/**
 * Stores GPU-specific data for a Texture instance in WebGL context.
 * @internal
 */
export class GPUTextureGpuData implements GPUData
{
    public gpuTexture: GPUTexture;
    public textureView: GPUTextureView = null;

    constructor(gpuTexture: GPUTexture)
    {
        this.gpuTexture = gpuTexture;
    }

    /** Destroys this GPU data instance. */
    public destroy(): void
    {
        this.gpuTexture.destroy();
        this.textureView = null;
        this.gpuTexture = null;
    }
}

/**
 * The system that handles textures for the GPU.
 * @category rendering
 * @advanced
 */
export class GpuTextureSystem implements System, CanvasGenerator
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'texture',
    } as const;

    protected CONTEXT_UID: number;
    private _gpuSamplers: Record<string, GPUSampler> = Object.create(null);
    private _bindGroupHash: Record<string, BindGroup> = Object.create(null);

    private readonly _uploads: Record<string, GpuTextureUploader> = {
        image: gpuUploadImageResource,
        buffer: gpuUploadBufferImageResource,
        video: gpuUploadVideoResource,
        compressed: gpuUploadCompressedTextureResource
    };

    private _gpu: GPU;
    private _mipmapGenerator?: GpuMipmapGenerator;

    private readonly _renderer: WebGPURenderer;
    private readonly _managedTextures: GCManagedHash<TextureSource>;
    /**
     * @deprecated since 8.15.0
     */
    public get managedTextures(): Readonly<TextureSource[]> { return Object.values(this._managedTextures.items); }

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
        renderer.renderableGC.addManagedHash(this, '_bindGroupHash');
        this._managedTextures = new GCManagedHash({ renderer, type: 'resource', onUnload: this.onSourceUnload.bind(this) });
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
    }

    /**
     * Initializes a texture source, if it has already been initialized nothing will happen.
     * @param source - The texture source to initialize.
     * @returns The initialized texture source.
     */
    public initSource(source: TextureSource): GPUTexture
    {
        return (source._gpuData[this._renderer.uid] as GPUTextureGpuData)?.gpuTexture || this._initSource(source);
    }

    private _initSource(source: TextureSource): GPUTexture
    {
        if (source.autoGenerateMipmaps)
        {
            const biggestDimension = Math.max(source.pixelWidth, source.pixelHeight);

            source.mipLevelCount = Math.floor(Math.log2(biggestDimension)) + 1;
        }

        let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;

        if (source.uploadMethodId !== 'compressed')
        {
            usage |= GPUTextureUsage.RENDER_ATTACHMENT;
            usage |= GPUTextureUsage.COPY_SRC;
        }

        const blockData = blockDataMap[source.format] || { blockBytes: 4, blockWidth: 1, blockHeight: 1 };

        const width = Math.ceil(source.pixelWidth / blockData.blockWidth) * blockData.blockWidth;
        const height = Math.ceil(source.pixelHeight / blockData.blockHeight) * blockData.blockHeight;

        const textureDescriptor: GPUTextureDescriptor = {
            label: source.label,
            size: { width, height },
            format: source.format,
            sampleCount: source.sampleCount,
            mipLevelCount: source.mipLevelCount,
            dimension: source.dimension,
            usage
        };

        const gpuTexture = this._gpu.device.createTexture(textureDescriptor);

        source._gpuData[this._renderer.uid] = new GPUTextureGpuData(gpuTexture);

        const added = this._managedTextures.add(source);

        if (added)
        {
            source.on('update', this.onSourceUpdate, this);
            source.on('resize', this.onSourceResize, this);
            source.on('updateMipmaps', this.onUpdateMipmaps, this);
        }

        this.onSourceUpdate(source);

        return gpuTexture;
    }

    protected onSourceUpdate(source: TextureSource): void
    {
        const gpuTexture = this.getGpuSource(source);

        // destroyed!
        if (!gpuTexture) return;

        if (this._uploads[source.uploadMethodId])
        {
            this._uploads[source.uploadMethodId].upload(source, gpuTexture, this._gpu);
        }

        if (source.autoGenerateMipmaps && source.mipLevelCount > 1)
        {
            this.onUpdateMipmaps(source);
        }
    }

    protected onUpdateMipmaps(source: TextureSource): void
    {
        if (!this._mipmapGenerator)
        {
            this._mipmapGenerator = new GpuMipmapGenerator(this._gpu.device);
        }

        const gpuTexture = this.getGpuSource(source);

        this._mipmapGenerator.generateMipmap(gpuTexture);
    }

    protected onSourceUnload(source: TextureSource): void
    {
        source.off('update', this.onSourceUpdate, this);
        source.off('resize', this.onSourceResize, this);
        source.off('updateMipmaps', this.onUpdateMipmaps, this);
    }

    protected onSourceResize(source: TextureSource): void
    {
        source._gcLastUsed = this._renderer.gc.now;

        const gpuData = source._gpuData[this._renderer.uid] as GPUTextureGpuData;
        const gpuTexture = gpuData?.gpuTexture;

        if (!gpuTexture)
        {
            this.initSource(source);
        }
        else if (gpuTexture.width !== source.pixelWidth || gpuTexture.height !== source.pixelHeight)
        {
            gpuData.destroy();
            this._bindGroupHash[source.uid] = null;
            source._gpuData[this._renderer.uid] = null;
            this.initSource(source);
        }
    }

    private _initSampler(sampler: TextureStyle): GPUSampler
    {
        this._gpuSamplers[sampler._resourceId] = this._gpu.device.createSampler(sampler);

        return this._gpuSamplers[sampler._resourceId];
    }

    public getGpuSampler(sampler: TextureStyle): GPUSampler
    {
        return this._gpuSamplers[sampler._resourceId] || this._initSampler(sampler);
    }

    public getGpuSource(source: TextureSource): GPUTexture
    {
        source._gcLastUsed = this._renderer.gc.now;

        return (source._gpuData[this._renderer.uid] as GPUTextureGpuData)?.gpuTexture || this.initSource(source);
    }

    /**
     * this returns s bind group for a specific texture, the bind group contains
     * - the texture source
     * - the texture style
     * - the texture matrix
     * This is cached so the bind group should only be created once per texture
     * @param texture - the texture you want the bindgroup for
     * @returns the bind group for the texture
     */
    public getTextureBindGroup(texture: Texture)
    {
        return this._bindGroupHash[texture.uid] || this._createTextureBindGroup(texture);
    }

    private _createTextureBindGroup(texture: Texture)
    {
        const source = texture.source;

        this._bindGroupHash[texture.uid] = new BindGroup({
            0: source,
            1: source.style,
            2: new UniformGroup({
                uTextureMatrix: { type: 'mat3x3<f32>', value: texture.textureMatrix.mapCoord },
            })
        });

        return this._bindGroupHash[texture.uid];
    }

    public getTextureView(texture: BindableTexture)
    {
        const source = texture.source;

        source._gcLastUsed = this._renderer.gc.now;
        let gpuData = source._gpuData[this._renderer.uid] as GPUTextureGpuData;
        let textureView: GPUTextureView = null;

        if (!gpuData)
        {
            this.initSource(source);
            gpuData = source._gpuData[this._renderer.uid] as GPUTextureGpuData;
        }

        textureView = gpuData.textureView || gpuData.gpuTexture.createView();

        return textureView;
    }

    public generateCanvas(texture: Texture): ICanvas
    {
        const renderer = this._renderer;

        const commandEncoder = renderer.gpu.device.createCommandEncoder();

        // create canvas
        const canvas = DOMAdapter.get().createCanvas();

        canvas.width = texture.source.pixelWidth;
        canvas.height = texture.source.pixelHeight;

        const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;

        context.configure({
            device: renderer.gpu.device,

            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC,
            format: DOMAdapter.get().getNavigator().gpu.getPreferredCanvasFormat(),
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
        this._managedTextures.destroy();
        for (const k of Object.keys(this._bindGroupHash))
        {
            const key = Number(k);
            const bindGroup = this._bindGroupHash[key];

            bindGroup?.destroy();
        }

        (this._renderer as null) = null;
        this._gpu = null;
        this._mipmapGenerator = null;
        this._gpuSamplers = null;
        this._bindGroupHash = null;
    }
}
