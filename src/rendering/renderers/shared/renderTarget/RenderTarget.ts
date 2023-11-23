// what we are building is a platform and a framework.
import { Matrix } from '../../../../maths/matrix/Matrix';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { uid } from '../../../../utils/data/uid';
import { calculateProjection } from '../../gpu/renderTarget/calculateProjection';
import { TextureSource } from '../texture/sources/TextureSource';
import { Texture } from '../texture/Texture';

export interface RenderTargetDescriptor
{
    width?: number;
    height?: number;
    resolution?: number;
    colorTextures?: Texture[] | number;

    // TODO this is actually depth and stencil buffer..
    depthTexture?: Texture | boolean;
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

    public width = 0;
    public height = 0;
    public resolution = 1;

    public colorTextures: Texture[] = [];

    public depthTexture: Texture;
    public stencil: boolean;

    public dirtyId = 0;
    public isRoot = false;

    private readonly _viewport: Rectangle;
    private readonly _projectionMatrix = new Matrix();
    private readonly _size = new Float32Array(2);

    constructor(descriptor: RenderTargetDescriptor = {})
    {
        descriptor = { ...RenderTarget.defaultDescriptor, ...descriptor };

        this.width = descriptor.width;
        this.height = descriptor.height;
        this.resolution = descriptor.resolution;
        this.stencil = descriptor.stencil;

        this._viewport = new Rectangle(0, 0, this.width, this.height);

        if (typeof descriptor.colorTextures === 'number')
        {
            for (let i = 0; i < descriptor.colorTextures; i++)
            {
                this.colorTextures.push(new Texture({
                    source: new TextureSource({
                        width: this.width,
                        height: this.height,
                        resolution: descriptor.resolution,
                        antialias: descriptor.antialias,
                    })
                }));
            }
        }
        else
        {
            this.colorTextures = [...descriptor.colorTextures];

            const colorSource = this.colorTexture.source;

            this._resize(colorSource.width, colorSource.height, colorSource._resolution);
        }

        // the first color texture drives the size of all others..
        this.colorTexture.source.on('resize', this.onSourceResize, this);

        // TODO should listen for texture destroyed?

        if (descriptor.depthTexture)
        {
            this.depthTexture = new Texture({
                source: new TextureSource({
                    width: this.width,
                    height: this.height,
                    resolution: this.resolution,
                    format: 'stencil8',
                    // sampleCount: handled by the render target system..
                })
            });
        }
    }

    get size(): [number, number]
    {
        const _size = this._size;

        _size[0] = this.pixelWidth;
        _size[1] = this.pixelHeight;

        return _size as any as [number, number];
    }

    get pixelWidth(): number
    {
        return this.width * this.resolution;
    }

    get pixelHeight(): number
    {
        return this.height * this.resolution;
    }

    get colorTexture(): Texture
    {
        return this.colorTextures[0];
    }

    get projectionMatrix(): Matrix
    {
        const texture = this.colorTexture;

        // TODO - this needs to only happen on resize - or behind a dirty flag
        calculateProjection(this._projectionMatrix, 0, 0, texture.frameWidth, texture.frameHeight, !this.isRoot);

        return this._projectionMatrix;
    }

    get viewport(): Rectangle
    {
        // TODO - this needs to only happen on resize or when a texture frame changes
        const texture = this.colorTexture;
        const source = texture.source;

        const pixelWidth = source.pixelWidth;
        const pixelHeight = source.pixelHeight;

        const viewport = this._viewport;
        const frame = texture.layout.frame;

        viewport.x = (frame.x * pixelWidth) | 0;
        viewport.y = (frame.y * pixelHeight) | 0;
        viewport.width = (frame.width * pixelWidth) | 0;
        viewport.height = (frame.height * pixelHeight) | 0;

        return viewport;
    }

    protected onSourceResize(source: TextureSource)
    {
        this._resize(source.width, source.height, source._resolution, true);
    }

    public resize(width: number, height: number, resolution = this.resolution)
    {
        this._resize(width, height, resolution);
    }

    private _resize(width: number, height: number, resolution = this.resolution, skipColorTexture = false)
    {
        const colorTextures = this.colorTextures;

        this.width = width;
        this.height = height;
        this.resolution = resolution;

        this.dirtyId++;

        for (let i = 0; i < colorTextures.length; i++)
        {
            const colorTexture = colorTextures[i];

            if (skipColorTexture && i === 0) return;

            colorTexture.source.resize(width, height, resolution);
        }

        if (this.depthTexture)
        {
            this.depthTexture.source.resize(width, height, resolution);
        }
    }

    public destroy()
    {
        for (const colorTexture of this.colorTextures)
        {
            colorTexture.destroy();
        }

        this.width = 0;
        this.height = 0;
        this.resolution = 1;
        this.colorTextures.length = 0;

        if (this.depthTexture)
        {
            this.depthTexture.destroy();
            delete this.depthTexture;
        }
    }
}
