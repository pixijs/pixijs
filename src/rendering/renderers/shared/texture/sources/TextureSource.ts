import EventEmitter from 'eventemitter3';
import { deprecation, v8_0_0 } from '../../../../../utils/logging/deprecation';
import { TextureStyle } from '../TextureStyle';

import type { BindResource } from '../../../gpu/shader/BindResource';
import type { SCALE_MODE, TEXTURE_DIMENSIONS, TEXTURE_FORMATS, WRAP_MODE } from '../const';
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
    unload: TextureSource;
    destroy: TextureSource;
    resize: TextureSource;
}> implements BindableTexture, BindResource
{
    public static defaultOptions: TextureSourceOptions = {
        resolution: 1,
        format: 'bgra8unorm',
        dimensions: '2d',
        mipLevelCount: 1,
        autoGenerateMipmaps: false,
        sampleCount: 1,
        antialias: false,
        style: {} as TextureStyleOptions,
    };

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

    /**
     * Used by automatic texture Garbage Collection, stores last GC tick when it was bound
     * @protected
     */
    public touched = 0;

    constructor(options: TextureSourceOptions<T> = {})
    {
        super();

        options = { ...TextureSource.defaultOptions, ...options };

        this.resource = options.resource;

        this._resolution = options.resolution;

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

        this.format = options.format;
        this.dimension = options.dimensions;
        this.mipLevelCount = options.mipLevelCount;
        this.autoGenerateMipmaps = options.autoGenerateMipmaps;
        this.sampleCount = options.sampleCount;
        this.antialias = options.antialias;

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

    public unload()
    {
        this.resourceId++;
        this.emit('change', this);
        this.emit('unload', this);
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

    /** @deprecated since 8.0.0 */
    set wrapMode(value: WRAP_MODE)
    {
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'TextureSource.wrapMode property has been deprecated. Use TextureSource.style.addressMode instead.');
        this.style.wrapMode = value;
    }

    /** @deprecated since 8.0.0 */
    get wrapMode(): WRAP_MODE
    {
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'TextureSource.wrapMode property has been deprecated. Use TextureSource.style.addressMode instead.');

        return this.style.wrapMode;
    }

    /** @deprecated since 8.0.0 */
    set scaleMode(value: SCALE_MODE)
    {
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'TextureSource.scaleMode property has been deprecated. Use TextureSource.style.scaleMode instead.');
        this.style.scaleMode = value;
    }

    /** @deprecated since 8.0.0 */
    get scaleMode(): SCALE_MODE
    {
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'TextureSource.scaleMode property has been deprecated. Use TextureSource.style.scaleMode instead.');

        return this.style.scaleMode;
    }
}
