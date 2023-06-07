// what we are building is a platform and a framework.
// import { Matrix } from '../../shared/maths/Matrix';
import { Matrix } from '../../../../maths/Matrix';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
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

let UID = 0;

export class RenderTarget
{
    static defaultDescriptor: RenderTargetDescriptor = {
        width: 0,
        height: 0,
        resolution: 1,
        colorTextures: 1,
        stencil: true,
        antialias: false, // save on perf by default!
    };

    uid = UID++;

    width = 0;
    height = 0;
    resolution = 1;

    colorTextures: Texture[] = [];

    depthTexture: Texture;

    clearColor = 0x000000;

    antialias: boolean;
    stencil: boolean;

    dirtyId = 0;
    isRoot = false;

    private _viewport: Rectangle;
    private _projectionMatrix = new Matrix();

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

            this.resize(colorSource.width, colorSource.height, colorSource._resolution);
        }

        // the first color texture drives the size of all others..
        this.colorTexture.source.onSourceResize.add(this);

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
        this.resize(source.width, source.height, source._resolution, true);
    }

    private resize(width: number, height: number, resolution = this.resolution, skipColorTexture = false)
    {
        this.width = width;
        this.height = height;
        this.resolution = resolution;

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
}
