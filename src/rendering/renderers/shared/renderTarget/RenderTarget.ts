// what we are building is a platform and a framework.
// import { Matrix } from '../../shared/maths/Matrix';
import { uid } from '../../../../utils/data/uid';
import { TextureSource } from '../texture/sources/TextureSource';
import { Texture } from '../texture/Texture';

import type { BindableTexture } from '../texture/Texture';

export interface RenderTargetDescriptor
{
    width?: number;
    height?: number;
    resolution?: number;
    colorTextures?: BindableTexture[] | number;

    // TODO this is actually depth and stencil buffer..
    depthTexture?: BindableTexture | boolean;
    stencil?: boolean;
    antialias?: boolean;
}

export class RenderTarget
{
    public static defaultDescriptor: RenderTargetDescriptor = {
        width: 0,
        height: 0,
        resolution: 1,
        colorTextures: 1,
        stencil: true,
        antialias: false, // save on perf by default!
    };

    public uid = uid('renderTarget');

    public colorTextures: TextureSource[] = [];

    public depthTexture: TextureSource;
    public stencil: boolean;

    public dirtyId = 0;
    public isRoot = false;

    private readonly _size = new Float32Array(2);

    constructor(descriptor: RenderTargetDescriptor = {})
    {
        descriptor = { ...RenderTarget.defaultDescriptor, ...descriptor };

        this.stencil = descriptor.stencil;

        if (typeof descriptor.colorTextures === 'number')
        {
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

        if (descriptor.depthTexture)
        {
            // TODO add a test
            if (descriptor.depthTexture instanceof Texture
                || descriptor.depthTexture instanceof TextureSource)
            {
                this.depthTexture = descriptor.depthTexture.source;
            }
            else
            {
                this.depthTexture = new TextureSource({
                    width: this.width,
                    height: this.height,
                    resolution: this.resolution,
                    format: 'stencil8',
                // sampleCount: handled by the render target system..
                });
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

    public resize(width: number, height: number, resolution = this.resolution, skipColorTexture = false)
    {
        this.dirtyId++;

        this.colorTextures.forEach((colorTexture, i) =>
        {
            if (skipColorTexture && i === 0) return;

            colorTexture.source.resize(width, height, resolution);
        });

        if (this.depthTexture)
        {
            this.depthTexture.source.resize(width, height, resolution);
        }
    }

    public destroy()
    {
        this.colorTexture.source.off('resize', this.onSourceResize, this);

        if (this.depthTexture)
        {
            this.depthTexture.destroy();
            delete this.depthTexture;
        }
    }
}
