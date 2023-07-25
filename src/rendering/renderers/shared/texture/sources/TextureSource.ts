import EventEmitter from 'eventemitter3';
import { TextureStyle } from '../TextureStyle';

import type { BindResource } from '../../../gpu/shader/BindResource';
import type { TEXTURE_DIMENSIONS, TEXTURE_FORMATS } from '../const';
import type { BindableTexture } from '../Texture';
import type { TextureStyleOptions } from '../TextureStyle';

let UID = 0;
let RESOURCE_ID = 0;

export interface TextureSourceOptions<T extends Record<string, any> = any>
{
    resource?: T;

    width?: number;
    height?: number;
    resolution?: number;

    format?: TEXTURE_FORMATS;
    sampleCount?: number;
    antialias?: boolean;

    dimensions?: TEXTURE_DIMENSIONS;

    mipLevelCount?: number;
    autoGenerateMipmaps?: boolean;

    style?: TextureStyleOptions | TextureStyle;
}

export class TextureSource<T extends Record<string, any> = any> extends EventEmitter<{
    change: BindResource;
    update: TextureSource;
    destroy: TextureSource;
    resize: TextureSource;
}> implements BindableTexture, BindResource
{
    public uid = UID++;

    public resourceType = 'textureSource';
    public resourceId = RESOURCE_ID++;

    public type = 'unknown';

    // dimensions
    /** @internal */
    public _resolution = 1;
    public pixelWidth = 1;
    public pixelHeight = 1;

    public width = 1;
    public height = 1;

    public resource: T;

    // sample count for multisample textures
    // generally this is used only used internally by pixi!
    public sampleCount = 1;

    // antialias = false;

    // mip stuff..
    public mipLevelCount = 1; // overridden if autoGenerateMipmaps is true
    public autoGenerateMipmaps = false;

    public format: TEXTURE_FORMATS = 'rgba8unorm-srgb';
    public dimension: TEXTURE_DIMENSIONS = '2d';

    public style: TextureStyle;

    public styleSourceKey: number;

    // properties used when rendering to this texture..
    public antialias = false;
    public depthStencil = true;

    constructor(options: TextureSourceOptions<T> = {})
    {
        super();

        this.resource = options.resource;

        this._resolution = options.resolution ?? 1;

        if (options.width)
        {
            this.pixelWidth = options.width * this._resolution;
        }
        else
        {
            this.pixelWidth = options.resource?.width ?? 1;
        }

        if (options.height)
        {
            this.pixelHeight = options.height * this._resolution;
        }
        else
        {
            this.pixelHeight = options.resource?.height ?? 1;
        }

        this.width = this.pixelWidth / this._resolution;
        this.height = this.pixelHeight / this._resolution;

        this.format = options.format ?? 'bgra8unorm';
        this.dimension = options.dimensions ?? '2d';
        this.mipLevelCount = options.mipLevelCount ?? 1;
        this.autoGenerateMipmaps = options.autoGenerateMipmaps ?? false;
        this.sampleCount = options.sampleCount ?? 1;
        this.antialias = options.antialias ?? false;

        const style = options.style ?? {};

        this.style = style instanceof TextureStyle ? style : new TextureStyle(style);
        this.style.on('change', this.onStyleUpdate, this);

        this.styleSourceKey = (this.style.resourceId << 24) + this.uid;
    }

    get source(): TextureSource
    {
        return this;
    }

    public update()
    {
        this.emit('update', this);
    }

    protected onStyleUpdate()
    {
        this.styleSourceKey = (this.style.resourceId << 24) + this.uid;
    }

    /** Destroys this texture source */
    public destroy()
    {
        this.emit('destroy', this);

        if (this.style)
        {
            this.style.destroy();
            this.style = null;
        }

        this.type = null;
        this.resource = null;
        this.removeAllListeners();
    }

    get resolution(): number
    {
        return this._resolution;
    }

    set resolution(resolution: number)
    {
        if (this._resolution === resolution) return;

        this._resolution = resolution;

        this.width = this.pixelWidth / resolution;
        this.height = this.pixelHeight / resolution;
    }

    public resize(width?: number, height?: number, resolution?: number)
    {
        resolution = resolution || this._resolution;
        width = width || this.width;
        height = height || this.height;

        // make sure we work with rounded pixels
        const newPixelWidth = Math.round(width * resolution);
        const newPixelHeight = Math.round(height * resolution);

        this.width = newPixelWidth / resolution;
        this.height = newPixelHeight / resolution;

        this._resolution = resolution;

        if (this.pixelWidth === newPixelWidth && this.pixelHeight === newPixelHeight)
        {
            return;
        }

        this.pixelWidth = newPixelWidth;
        this.pixelHeight = newPixelHeight;

        this.emit('resize', this);

        this.resourceId++;
        this.emit('change', this);
    }
}
