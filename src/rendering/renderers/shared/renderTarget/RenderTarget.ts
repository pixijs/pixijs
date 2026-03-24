// what we are building is a platform and a framework.
// import { Matrix } from '../../shared/maths/Matrix';
import { uid } from '../../../../utils/data/uid';
import { TextureSource } from '../texture/sources/TextureSource';
import { Texture } from '../texture/Texture';

import type { BindableTexture } from '../texture/Texture';

/**
 * Options for creating a render target.
 * @category rendering
 * @advanced
 */
export interface RenderTargetOptions
{
    /** the width of the RenderTarget */
    width?: number;
    /** the height of the RenderTarget */
    height?: number;
    /** the resolution of the RenderTarget */
    resolution?: number;
    /** an array of textures, or a number indicating how many color textures there should be */
    colorTextures?: BindableTexture[] | number;
    /** should this render target have a stencil buffer? */
    stencil?: boolean;
    /** should this render target have a depth buffer? */
    depth?: boolean;
    /** a depth stencil texture that the depth and stencil outputs will be written to */
    depthStencilTexture?: BindableTexture | boolean;
    /** should this render target be antialiased? */
    antialias?: boolean;
    /** is this a root element, true if this is gl context owners render target */
    isRoot?: boolean;
}

/**
 * Descriptor for creating a RenderTarget from a WebGPU-flavored descriptor.
 * @category rendering
 * @advanced
 */
export interface RenderTargetDescriptor
{
    /** The color attachments to use */
    colorAttachments: PixiColorAttachment[];
    /** The depth/stencil attachment to use */
    depthStencilAttachment?: PixiDepthStencilAttachment;
    /** Is this a root element, true if this is gl context owners render target */
    isRoot?: boolean;
}

/**
 * A Pixi-flavored Color Attachment that mirrors the WebGPU spec but replaces low-level JIT requirements
 * with high-level Pixi objects (like `texture`).
 * @example
 * ```typescript
 * import { RenderTarget, TextureSource } from 'pixi.js';
 *
 * const renderTarget = new RenderTarget({
 *     colorAttachments: [{
 *         texture: new TextureSource({ width: 100, height: 100 }),
 *         loadOp: 'clear', // Clears the texture before rendering
 *         clearValue: [1, 0, 0, 1], // Clears to red
 *     }]
 * });
 * ```
 * @category rendering
 * @advanced
 */
export interface PixiColorAttachment extends Omit<GPURenderPassColorAttachment, 'view' | 'resolveTarget'>
{
    /** The Pixi texture to render to. */
    texture: TextureSource;
    /** The Pixi texture for MSAA resolution (if the main texture is multisampled). */
    resolveTexture?: TextureSource;
    /**
     * Optional overrides for how the GPU views the texture (e.g., viewing a specific aspect or dimension).
     * Rarely needed for 2D, but incredibly powerful for 3D and advanced compute pipelines.
     */
    viewDescriptor?: GPUTextureViewDescriptor;
}

/**
 * A Pixi-flavored Depth/Stencil Attachment that mirrors the WebGPU spec but replaces low-level JIT requirements
 * with high-level Pixi objects (like `texture`).
 * @example
 * ```typescript
 * import { RenderTarget, TextureSource } from 'pixi.js';
 *
 * const renderTarget = new RenderTarget({
 *     depthStencilAttachment: {
 *         texture: new TextureSource({ format: 'depth24plus-stencil8', width: 100, height: 100 }),
 *         depthLoadOp: 'clear',
 *         depthClearValue: 1.0,
 *         depthReadOnly: true, // Only test depth, don't write to it (advanced 3D trick)
 *     }
 * });
 * ```
 * @category rendering
 * @advanced
 */
export interface PixiDepthStencilAttachment extends Omit<GPURenderPassDepthStencilAttachment, 'view'>
{
    /** The Pixi depth/stencil texture to use for testing/writing. */
    texture: TextureSource;
    /**
     * Optional overrides. For example, if you want to perform depth testing while simultaneously
     * sampling the stencil data in a shader, you can pass `{ aspect: 'depth-only' }`.
     */
    viewDescriptor?: GPUTextureViewDescriptor;
}

/**
 * A class that describes what the renderers are rendering to.
 * This can be as simple as a Texture, or as complex as a multi-texture, multi-sampled render target.
 * Support for stencil and depth buffers is also included.
 *
 * If you need something more complex than a Texture to render to, you should use this class.
 * Under the hood, all textures you render to have a RenderTarget created on their behalf.
 * @category rendering
 * @advanced
 */
export class RenderTarget
{
    /** The default options for a render target */
    public static defaultOptions: RenderTargetOptions = {
        /** the width of the RenderTarget */
        width: 0,
        /** the height of the RenderTarget */
        height: 0,
        /** the resolution of the RenderTarget */
        resolution: 1,
        /** an array of textures, or a number indicating how many color textures there should be */
        colorTextures: 1,
        /** should this render target have a stencil buffer? */
        stencil: false,
        /** should this render target have a depth buffer? */
        depth: false,
        /** should this render target be antialiased? */
        antialias: false, // save on perf by default!
        /** is this a root element, true if this is gl context owners render target */
        isRoot: false
    };

    /** unique id for this render target */
    public readonly uid: number = uid('renderTarget');

    /**
     * An array of attachments that define exactly how the GPU should render to the color textures.
     * This includes the texture itself, as well as load/store operations and clear values.
     */
    public colorAttachments: PixiColorAttachment[] = [];
    /**
     * An attachment that defines exactly how the GPU should render to the depth/stencil texture.
     * Includes the texture, load/store operations, and depth/stencil specific clear values.
     */
    public depthStencilAttachment?: PixiDepthStencilAttachment;

    public dirtyId = 0;
    public isRoot = false;

    private readonly _size = new Float32Array(2);
    /** if true, then when the render target is destroyed, it will destroy all the textures that were created for it. */
    private _managedColorTextures: boolean = false;

    /**
     * @param options - Options for creating a render target, or a WebGPU-flavored descriptor.
     */
    constructor(options: RenderTargetOptions | RenderTargetDescriptor = {})
    {
        const descriptor = 'colorAttachments' in options ? options : this._normalizeOptions(options);

        this.isRoot = descriptor.isRoot ?? false;
        this.colorAttachments = descriptor.colorAttachments;
        this.depthStencilAttachment = descriptor.depthStencilAttachment;

        if (this.colorAttachments.length === 0 && !this.depthStencilAttachment)
        {
            throw new Error('[RenderTarget] no color textures or depth textures were provided. '
                + 'Provide a depthStencilTexture or set depth/stencil to true when using colorTextures: 0.');
        }

        if (this.colorAttachments.length > 0)
        {
            const colorSource = this.colorTexture;

            this.resize(colorSource.width, colorSource.height, colorSource._resolution);
        }

        if (this.sizeSource)
        {
            this.sizeSource.on('resize', this.onSourceResize, this);
        }
    }

    private _normalizeOptions(options: RenderTargetOptions): RenderTargetDescriptor
    {
        const opts = { ...RenderTarget.defaultOptions, ...options };
        const colorAttachments: PixiColorAttachment[] = [];
        let depthStencilAttachment: PixiDepthStencilAttachment | undefined;

        if (typeof opts.colorTextures === 'number')
        {
            if (opts.colorTextures > 0)
            {
                this._managedColorTextures = true;

                for (let i = 0; i < opts.colorTextures; i++)
                {
                    colorAttachments.push({
                        texture: new TextureSource({
                            width: opts.width,
                            height: opts.height,
                            resolution: opts.resolution,
                            antialias: opts.antialias,
                        }),
                        loadOp: 'clear',
                        storeOp: 'store',
                    });
                }
            }
        }
        else
        {
            opts.colorTextures.forEach((texture) =>
            {
                colorAttachments.push({
                    texture: texture.source,
                    loadOp: 'clear',
                    storeOp: 'store',
                });
            });
        }

        if (opts.depthStencilTexture || opts.stencil || opts.depth)
        {
            if (opts.depthStencilTexture instanceof Texture
                || opts.depthStencilTexture instanceof TextureSource)
            {
                depthStencilAttachment = {
                    texture: opts.depthStencilTexture.source,
                };
            }
            else
            {
                depthStencilAttachment = {
                    texture: new TextureSource({
                        width: opts.width,
                        height: opts.height,
                        resolution: opts.resolution,
                        format: 'depth24plus-stencil8',
                        autoGenerateMipmaps: false,
                        antialias: false,
                        mipLevelCount: 1,
                    }),
                };
            }
        }

        return {
            colorAttachments,
            depthStencilAttachment,
            isRoot: opts.isRoot,
        };
    }

    get size(): [number, number]
    {
        const _size = this._size;

        _size[0] = this.pixelWidth;
        _size[1] = this.pixelHeight;

        return _size as any as [number, number];
    }

    get width(): number
    {
        return this.sizeSource.width;
    }

    get height(): number
    {
        return this.sizeSource.height;
    }
    get pixelWidth(): number
    {
        return this.sizeSource.pixelWidth;
    }

    get pixelHeight(): number
    {
        return this.sizeSource.pixelHeight;
    }

    get resolution(): number
    {
        return this.sizeSource._resolution;
    }

    private _colorTextures: TextureSource[] | null = null;
    /**
     * An array of textures that can be written to by the GPU - mostly this has one texture in Pixi, but you could
     * write to multiple if required! (eg deferred lighting).
     * This is a backwards-compatible getter that extracts the textures from `colorAttachments`.
     */
    get colorTextures(): TextureSource[]
    {
        this._colorTextures ||= this.colorAttachments.map((a) => a.texture);

        return this._colorTextures;
    }

    /** The stencil and depth buffer will write to this texture in WebGPU. */
    get depthStencilTexture(): TextureSource | null
    {
        return this.depthStencilAttachment?.texture ?? null;
    }

    /** If true, will ensure a depth buffer is added. For WebGPU, this will automatically create a depthStencilTexture. */
    get depth(): boolean
    {
        return !!this.depthStencilAttachment;
    }

    /** If true, will ensure a stencil buffer is added. For WebGPU, this will automatically create a depthStencilTexture. */
    get stencil(): boolean
    {
        return !!this.depthStencilAttachment;
    }

    get colorTexture(): TextureSource
    {
        return this.colorAttachments[0]?.texture;
    }

    /**
     * The texture that drives size, resolution, and resize events.
     * For standard targets this is `colorAttachments[0].texture`;
     * for depth-only targets it is `depthStencilAttachment.texture`.
     */
    get sizeSource(): TextureSource
    {
        return this.colorAttachments[0]?.texture ?? this.depthStencilAttachment?.texture;
    }

    protected onSourceResize(source: TextureSource)
    {
        this.resize(source.width, source.height, source._resolution, true);
    }

    /**
     * This will ensure a depthStencil texture is created for this render target.
     * Most likely called by the mask system to make sure we have stencil buffer added.
     * @internal
     */
    public ensureDepthStencilTexture()
    {
        this._createDepthStencilTexture(this.sizeSource.width, this.sizeSource.height, this.sizeSource._resolution);
    }

    public resize(width: number, height: number, resolution = this.resolution, skipColorTexture = false)
    {
        this.dirtyId++;

        this.colorAttachments.forEach((colorAttachment, i) =>
        {
            if (skipColorTexture && i === 0) return;

            colorAttachment.texture.resize(width, height, resolution);
        });

        if (this.depthStencilAttachment)
        {
            // For depth-only targets the depth texture IS the size source, so skip
            // when this resize was triggered by the size source's own resize event.
            if (skipColorTexture && this.colorAttachments.length === 0) return;

            this.depthStencilAttachment.texture.resize(width, height, resolution);
        }
    }

    public destroy()
    {
        this.sizeSource.off('resize', this.onSourceResize, this);

        if (this._managedColorTextures)
        {
            this.colorAttachments.forEach((attachment) =>
            {
                attachment.texture.destroy();
            });
        }

        if (this.depthStencilAttachment)
        {
            this.depthStencilAttachment.texture.destroy();
            delete this.depthStencilAttachment;
        }
    }

    private _createDepthStencilTexture(width: number, height: number, resolution: number)
    {
        if (this.depthStencilAttachment) return;

        this.depthStencilAttachment = {
            texture: new TextureSource({
                width,
                height,
                resolution,
                format: 'depth24plus-stencil8',
                autoGenerateMipmaps: false,
                antialias: false,
                mipLevelCount: 1,
                // sampleCount: handled by the render target system..
            }),
        };
    }
}
