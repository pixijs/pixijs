// what we are building is a platform and a framework.
// import { Matrix } from '../../shared/maths/Matrix';
import { uid } from '../../../../utils/data/uid';
import { TextureSource } from '../texture/sources/TextureSource';
import { Texture } from '../texture/Texture';

import type { BindableTexture } from '../texture/Texture';

/**
 * Options for creating a render target.
 * @memberof rendering
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
 * A class that describes what the renderers are rendering to.
 * This can be as simple as a Texture, or as complex as a multi-texture, multi-sampled render target.
 * Support for stencil and depth buffers is also included.
 *
 * If you need something more complex than a Texture to render to, you should use this class.
 * Under the hood, all textures you render to have a RenderTarget created on their behalf.
 * @memberof rendering
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

    public uid = uid('renderTarget');

    /**
     * An array of textures that can be written to by the GPU - mostly this has one texture in Pixi, but you could
     * write to multiple if required! (eg deferred lighting)
     */
    public colorTextures: TextureSource[] = [];
    /** the stencil and depth buffer will right to this texture in WebGPU */
    public depthStencilTexture: TextureSource;
    /** if true, will ensure a stencil buffer is added. For WebGPU, this will automatically create a depthStencilTexture */
    public stencil: boolean;
    /** if true, will ensure a depth buffer is added. For WebGPU, this will automatically create a depthStencilTexture */
    public depth: boolean;

    public dirtyId = 0;
    public isRoot = false;

    private readonly _size = new Float32Array(2);
    /** if true, then when the render target is destroyed, it will destroy all the textures that were created for it. */
    private readonly _managedColorTextures: boolean = false;

    /**
     * @param [descriptor] - Options for creating a render target.
     */
    constructor(descriptor: RenderTargetOptions = {})
    {
        descriptor = { ...RenderTarget.defaultOptions, ...descriptor };

        this.stencil = descriptor.stencil;
        this.depth = descriptor.depth;
        this.isRoot = descriptor.isRoot;

        if (typeof descriptor.colorTextures === 'number')
        {
            this._managedColorTextures = true;

            for (let i = 0; i < descriptor.colorTextures; i++)
            {
                this.colorTextures.push(new TextureSource({
                    width: descriptor.width,
                    height: descriptor.height,
                    resolution: descriptor.resolution,
                    antialias: descriptor.antialias,
                })
                );
            }
        }
        else
        {
            this.colorTextures = [...descriptor.colorTextures.map((texture) => texture.source)];

            const colorSource = this.colorTexture.source;

            this.resize(colorSource.width, colorSource.height, colorSource._resolution);
        }

        // the first color texture drives the size of all others..
        this.colorTexture.source.on('resize', this.onSourceResize, this);

        // TODO should listen for texture destroyed?

        if (descriptor.depthStencilTexture || this.stencil)
        {
            // TODO add a test
            if (descriptor.depthStencilTexture instanceof Texture
                || descriptor.depthStencilTexture instanceof TextureSource)
            {
                this.depthStencilTexture = descriptor.depthStencilTexture.source;
            }
            else
            {
                this.ensureDepthStencilTexture();
            }
        }
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
        return this.colorTexture.source.width;
    }

    get height(): number
    {
        return this.colorTexture.source.height;
    }
    get pixelWidth(): number
    {
        return this.colorTexture.source.pixelWidth;
    }

    get pixelHeight(): number
    {
        return this.colorTexture.source.pixelHeight;
    }

    get resolution(): number
    {
        return this.colorTexture.source._resolution;
    }

    get colorTexture(): TextureSource
    {
        return this.colorTextures[0];
    }

    protected onSourceResize(source: TextureSource)
    {
        this.resize(source.width, source.height, source._resolution, true);
    }

    /**
     * This will ensure a depthStencil texture is created for this render target.
     * Most likely called by the mask system to make sure we have stencil buffer added.
     * @internal
     * @ignore
     */
    public ensureDepthStencilTexture()
    {
        if (!this.depthStencilTexture)
        {
            this.depthStencilTexture = new TextureSource({
                width: this.width,
                height: this.height,
                resolution: this.resolution,
                format: 'depth24plus-stencil8',
                autoGenerateMipmaps: false,
                antialias: false,
                mipLevelCount: 1,
                // sampleCount: handled by the render target system..
            });
        }
    }

    public resize(width: number, height: number, resolution = this.resolution, skipColorTexture = false)
    {
        this.dirtyId++;

        this.colorTextures.forEach((colorTexture, i) =>
        {
            if (skipColorTexture && i === 0) return;

            colorTexture.source.resize(width, height, resolution);
        });

        if (this.depthStencilTexture)
        {
            this.depthStencilTexture.source.resize(width, height, resolution);
        }
    }

    public destroy()
    {
        this.colorTexture.source.off('resize', this.onSourceResize, this);

        if (this._managedColorTextures)
        {
            this.colorTextures.forEach((texture) =>
            {
                texture.destroy();
            });
        }

        if (this.depthStencilTexture)
        {
            this.depthStencilTexture.destroy();
            delete this.depthStencilTexture;
        }
    }
}
